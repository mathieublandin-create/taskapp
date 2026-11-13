/**
 * ST-US-018 v0.4 §4.4, §6.4, §13 (rang 12, tranche B2) ; ST-US-031 §6.5 : réseau coupé dans la page → aucun appel au
 * pont (`context.setOffline` ne coupe pas un binding). Le comportement réseau rétabli est vérifié par la suite de
 * contrat CT-TRANS sur `TransportParPont` (tests/contrats/transport-synchro.contrat.ts).
 */
import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { encoderPont } from '@src/composition/test-ihm/codec-pont';
import { TransportParPont } from '@src/composition/test-ihm/transport-par-pont';
import type {
  IdFichierDrive,
  TransportSynchro,
} from '@src/synchronisation/application/ports/transport-synchro';
import type { ContenuManifeste } from '@src/synchronisation/domaine/contenu-fichier';
import { ReseauCommandable } from '@tests/support/synchronisation/appareil-cycle';

const ID = 'f-1' as IdFichierDrive;
const MANIFESTE: ContenuManifeste = { schemaVersion: 1, generation: { type: 'INITIALE' } };

/** Un appel de chaque méthode du port, avec des arguments valides. */
const APPELS: ReadonlyArray<
  readonly [keyof TransportSynchro, (t: TransportSynchro) => Promise<unknown>]
> = [
  ['preparerDossier', (t) => t.preparerDossier()],
  ['listerFichiersAppareils', (t) => t.listerFichiersAppareils(ID)],
  ['changements', (t) => t.changements(ID, 'jeton-1')],
  ['lireFichierAppareil', (t) => t.lireFichierAppareil(ID)],
  [
    'deposerFichierAppareil',
    (t) =>
      t.deposerFichierAppareil({
        dossier: ID,
        contenu: {
          schemaVersion: 1,
          versionApplication: '0.1.0',
          generation: { type: 'INITIALE' },
          appareil: 'appareil-1' as never,
          registres: [],
          journal: [],
        },
      }),
  ],
  ['lireManifeste', (t) => t.lireManifeste(ID)],
  ['ecrireManifeste', (t) => t.ecrireManifeste({ dossier: ID, contenu: MANIFESTE })],
  ['listerDossiers', (t) => t.listerDossiers()],
  ['inventorierDossier', (t) => t.inventorierDossier(ID)],
  ['lireContenuManifeste', (t) => t.lireContenuManifeste(ID)],
  ['supprimerFichier', (t) => t.supprimerFichier(ID)],
];

const preparer = (connecte: boolean) => {
  const recus: Array<readonly [string, string]> = [];
  const transport = new TransportParPont({
    pont: (methode, argumentsJson) => {
      recus.push([methode, argumentsJson]);
      return Promise.resolve(encoderPont(succes('reponse-du-pont')));
    },
    reseau: new ReseauCommandable(connecte),
  });
  return { transport, recus };
};

describe('TransportParPont (ST-US-018 §6.4)', () => {
  it('UT-US-018-14 les 11 méthodes du port sont couvertes par ce test', () => {
    expect(new Set(APPELS.map(([nom]) => nom)).size).toBe(11);
  });

  it.each(APPELS)(
    'UT-US-018-14 réseau coupé — %s rend Echec(ReseauIndisponible) sans appeler le pont',
    async (_nom, appel) => {
      const { transport, recus } = preparer(false);

      expect(await appel(transport)).toEqual(echec({ type: 'ReseauIndisponible' }));
      expect(recus).toEqual([]);
    },
  );

  it.each(APPELS)(
    'UT-US-018-14 réseau rétabli — %s appelle le pont une fois, avec son nom et ses arguments encodés, et rend la réponse décodée',
    async (nom, appel) => {
      const { transport, recus } = preparer(true);

      expect(await appel(transport)).toEqual(succes('reponse-du-pont'));
      expect(recus).toHaveLength(1);
      expect(recus[0]?.[0]).toBe(nom);
      expect(Array.isArray(JSON.parse(recus[0]?.[1] ?? 'null'))).toBe(true);
    },
  );

  it('UT-US-018-14 arguments transmis dans l’ordre — changements(dossier, jeton)', async () => {
    const { transport, recus } = preparer(true);

    await transport.changements(ID, 'jeton-1');

    expect(recus).toEqual([['changements', encoderPont(['f-1', 'jeton-1'])]]);
  });
});
