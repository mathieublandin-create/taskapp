/**
 * ST-US-018 v0.4 §4.4, §6.5, §13 (rang 12, tranche B2) : fournisseur d'authentification de la composition `test-ihm`,
 * relié au Google simulé du processus cucumber (binding `donejuanFauxGoogle`).
 */
import { describe, expect, it } from 'vitest';
import { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import { echec, succes } from '@src/commun/domaine/resultat';
import { REPRISE_ACCUEIL } from '@src/compte/application/ports/memoire-redirection';
import type { AccesObtenu, DemandeJeton } from '@src/compte/application/ports/fournisseur-auth';
import { PORTEES_LOT_1 } from '@src/compte/domaine/portees';
import { CoffreJetonsMemoire } from '@src/compte/infrastructure/coffre-jetons-memoire';
import { decoderPont, encoderPont } from '@src/composition/test-ihm/codec-pont';
import {
  FournisseurAuthTestIhm,
  VALIDITE_JETON_TEST_IHM_MS,
  type PontGoogle,
} from '@src/composition/test-ihm/fournisseur-auth-test-ihm';
import { IDENTITE_A } from '@tests/support/compte/doublures-compte';
import { ReseauCommandable } from '@tests/support/synchronisation/appareil-cycle';

const MONOTONE = EcartTemps.depuisMillisecondes(42_000);
const ACCES: AccesObtenu = { porteesAccordees: [...PORTEES_LOT_1], identite: IDENTITE_A };
const DEMANDE: DemandeJeton = {
  mode: 'RECONNEXION_GESTE',
  portees: PORTEES_LOT_1,
  indice: IDENTITE_A.adresse,
  reprise: REPRISE_ACCUEIL,
  redirectionPermise: false,
};

const preparer = (connecte: boolean, reponse: unknown = succes(ACCES)) => {
  const recus: Array<readonly [string, unknown]> = [];
  const pont: PontGoogle = (methode, argumentsJson) => {
    recus.push([methode, decoderPont(argumentsJson)]);
    return Promise.resolve(encoderPont(methode === 'oublier' ? null : reponse));
  };
  const coffre = new CoffreJetonsMemoire();
  const fournisseur = new FournisseurAuthTestIhm({
    pont,
    reseau: new ReseauCommandable(connecte),
    coffre,
    horloge: { monotone: () => MONOTONE },
  });
  return { fournisseur, coffre, recus };
};

describe('FournisseurAuthTestIhm (ST-US-018 §6.5)', () => {
  it('UT-US-018-15 accès accordé — ACCES_OBTENU, jamais de redirection ; jeton « jeton-test-ihm:<compte> » dans le coffre, échéance monotone + 1 h ; demande transmise (mode, portées, indice)', async () => {
    const { fournisseur, coffre, recus } = preparer(true);

    expect(await fournisseur.demanderJeton(DEMANDE)).toEqual(
      succes({ type: 'ACCES_OBTENU', acces: ACCES }),
    );
    expect(coffre.lire()).toEqual({
      jeton: `jeton-test-ihm:${IDENTITE_A.compte}`,
      echeance: MONOTONE + VALIDITE_JETON_TEST_IHM_MS,
    });
    expect(VALIDITE_JETON_TEST_IHM_MS).toBe(3_600_000);
    expect(recus).toEqual([
      [
        'demanderJeton',
        [{ mode: 'RECONNEXION_GESTE', portees: [...PORTEES_LOT_1], indice: IDENTITE_A.adresse }],
      ],
    ]);
  });

  it('UT-US-018-15 réseau coupé — Echec(ReseauIndisponible), pont non appelé, coffre vide', async () => {
    const { fournisseur, coffre, recus } = preparer(false);

    expect(await fournisseur.demanderJeton(DEMANDE)).toEqual(echec({ type: 'ReseauIndisponible' }));
    expect(recus).toEqual([]);
    expect(coffre.lire()).toBeUndefined();
  });

  it('UT-US-018-15 refus du Google simulé — même échec rendu, coffre inchangé', async () => {
    const { fournisseur, coffre } = preparer(true, echec({ type: 'AccesGoogleRevoque' }));

    expect(await fournisseur.demanderJeton(DEMANDE)).toEqual(echec({ type: 'AccesGoogleRevoque' }));
    expect(coffre.lire()).toBeUndefined();
  });

  it('UT-US-018-15 recevoirRetour — RetourRedirectionRejete (SANS_DEPART), sans appel au pont (aucune redirection en test-ihm)', async () => {
    const { fournisseur, recus } = preparer(true);

    expect(
      await fournisseur.recevoirRetour({
        retour: { type: 'AUCUN' },
        depart: undefined,
        compteAttendu: IDENTITE_A.compte,
      }),
    ).toEqual(echec({ type: 'RetourRedirectionRejete', motif: 'SANS_DEPART' }));
    expect(recus).toEqual([]);
  });

  it('UT-US-018-15 oublier — coffre vidé aussitôt, puis « oublier » transmis au Google simulé', async () => {
    const { fournisseur, coffre, recus } = preparer(true);
    await fournisseur.demanderJeton(DEMANDE);

    fournisseur.oublier();

    expect(coffre.lire()).toBeUndefined();
    await Promise.resolve();
    expect(recus.at(-1)).toEqual(['oublier', []]);
  });
});
