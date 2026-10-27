import { describe, expect, it } from 'vitest';
import { echec, succes, type Resultat } from '@src/commun/domaine/resultat';
import type {
  ErreurTransport,
  IdFichierDrive,
  TransportSynchro,
} from '@src/synchronisation/application/ports/transport-synchro';
import { PreparationDossierDrive } from '@src/synchronisation/application/preparation-dossier-drive';
import { PlanificateurSimule } from '@tests/doublures/planificateur-simule';
import { SourceAleatoireDeterministe } from '@tests/doublures/source-aleatoire-deterministe';

const DOSSIER = 'dossier-1' as IdFichierDrive;

class TransportScripte implements TransportSynchro {
  appels = 0;
  constructor(private readonly reponses: ReadonlyArray<Resultat<IdFichierDrive, ErreurTransport>>) {}
  preparerDossier(): Promise<Resultat<IdFichierDrive, ErreurTransport>> {
    const reponse = this.reponses[Math.min(this.appels, this.reponses.length - 1)];
    this.appels += 1;
    if (reponse === undefined) throw new Error('aucune réponse scriptée');
    return Promise.resolve(reponse);
  }
}

const preparer = (reponses: ReadonlyArray<Resultat<IdFichierDrive, ErreurTransport>>) => {
  const transport = new TransportScripte(reponses);
  const planificateur = new PlanificateurSimule();
  const cas = new PreparationDossierDrive({
    transport,
    planificateur,
    aleatoire: new SourceAleatoireDeterministe([0]),
  });
  return { cas, transport, planificateur };
};

describe('PreparationDossierDrive (ST-US-022 §6.8)', () => {
  it('UT-US-022-27 preparer — après 3 erreurs serveur, renvoie DriveMomentanementIndisponible, avec deux attentes de 500 ms puis 1 s (S20c)', async () => {
    const env = preparer([echec({ type: 'ServeurIndisponible' })]);

    const resultat = await env.planificateur.executerJusquAuReglement(env.cas.preparer());

    expect(resultat).toEqual(echec({ type: 'DriveMomentanementIndisponible' }));
    expect(env.transport.appels).toBe(3);
    expect(env.planificateur.attentesDemandees()).toEqual([500, 1000]);
  });

  it('UT-US-022-27 preparer — réussit à la deuxième tentative, et renvoie ReseauInterrompu si le réseau manque trois fois', async () => {
    const reussite = preparer([echec({ type: 'ServeurIndisponible' }), succes(DOSSIER)]);
    const reseau = preparer([echec({ type: 'ReseauIndisponible' })]);

    expect(await reussite.planificateur.executerJusquAuReglement(reussite.cas.preparer())).toEqual(succes(undefined));
    expect(reussite.transport.appels).toBe(2);
    expect(await reseau.planificateur.executerJusquAuReglement(reseau.cas.preparer())).toEqual(
      echec({ type: 'ReseauInterrompu' }),
    );
  });

  it('UT-US-022-27 preparer — renvoie DriveIndisponiblePourLeCompte sans nouvelle tentative (S21)', async () => {
    const env = preparer([echec({ type: 'DriveIndisponible' })]);

    const resultat = await env.planificateur.executerJusquAuReglement(env.cas.preparer());

    expect(resultat).toEqual(echec({ type: 'DriveIndisponiblePourLeCompte' }));
    expect(env.transport.appels).toBe(1);
  });
});
