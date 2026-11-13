import { describe, expect, it } from 'vitest';
import { echec, succes, type Resultat } from '@src/commun/domaine/resultat';
import type {
  ClientGoogle,
  ErreurGoogle,
  ReponseGoogle,
  RequeteGoogle,
} from '@src/infrastructure-google';
import {
  REQUETE_DOSSIER,
  traduireErreurGoogle,
  TransportSynchroDrive,
} from '@src/synchronisation/infrastructure/drive/transport-synchro-drive';

/** Client scripté : une réponse par requête, dans l'ordre ; requêtes observées. */
const clientScripte = (
  reponses: ReadonlyArray<Resultat<unknown, ErreurGoogle>>,
  requetes: Array<RequeteGoogle>,
): ClientGoogle =>
  ({
    executer: (requete: RequeteGoogle): Promise<Resultat<ReponseGoogle, ErreurGoogle>> => {
      const reponse = reponses[requetes.length];
      requetes.push(requete);
      if (reponse === undefined) throw new Error('requête inattendue');
      return Promise.resolve(
        reponse.ok ? succes({ statut: 200, corps: reponse.valeur, date: undefined }) : reponse,
      );
    },
  }) as unknown as ClientGoogle;

describe('TransportSynchroDrive.preparerDossier (ST-US-022 §5.3)', () => {
  it('UT-COMP-US-022-73 dossier existant : retenu sans création (le plus ancien, appProperties, non supprimé)', async () => {
    const requetes: Array<RequeteGoogle> = [];
    const transport = new TransportSynchroDrive(
      clientScripte([succes({ files: [{ id: 'd1' }, { id: 'd2' }] })], requetes),
    );

    expect(await transport.preparerDossier()).toEqual(succes('d1'));
    const url = new URL(requetes[0]?.url ?? '');
    expect(url.searchParams.get('q')).toBe(REQUETE_DOSSIER);
    expect(url.searchParams.get('orderBy')).toBe('createdTime');
    expect(requetes).toHaveLength(1);
  });

  it('UT-COMP-US-022-74 dossier absent : créé à la racine, nommé « Done Juan », marqué donejuan=dossier', async () => {
    const requetes: Array<RequeteGoogle> = [];
    const transport = new TransportSynchroDrive(
      clientScripte([succes({ files: [] }), succes({ id: 'nouveau' })], requetes),
    );

    expect(await transport.preparerDossier()).toEqual(succes('nouveau'));
    expect(requetes[1]?.methode).toBe('POST');
    expect(JSON.parse(requetes[1]?.corps ?? '{}')).toEqual({
      name: 'Done Juan',
      mimeType: 'application/vnd.google-apps.folder',
      appProperties: { donejuan: 'dossier' },
    });
  });

  it('UT-COMP-US-022-75 erreurs traduites ; création sans identifiant : FichierIllisible', async () => {
    expect(
      await new TransportSynchroDrive(
        clientScripte([echec({ type: 'ErreurServeurDistant', statut: 503 })], []),
      ).preparerDossier(),
    ).toEqual(echec({ type: 'ServeurIndisponible' }));
    expect(
      await new TransportSynchroDrive(
        clientScripte([succes({ files: [] }), echec({ type: 'EspaceDrivePlein' })], []),
      ).preparerDossier(),
    ).toEqual(echec({ type: 'EspaceDrivePlein' }));
    expect(
      await new TransportSynchroDrive(
        clientScripte([succes(undefined), succes({})], []),
      ).preparerDossier(),
    ).toEqual(echec({ type: 'FichierIllisible', cause: 'SCHEMA' }));
    expect(traduireErreurGoogle({ type: 'QuotaDepasse' })).toEqual({ type: 'ServeurIndisponible' });
    expect(traduireErreurGoogle({ type: 'DriveIndisponible', raison: 'domainPolicy' })).toEqual({
      type: 'DriveIndisponible',
    });
  });
});
