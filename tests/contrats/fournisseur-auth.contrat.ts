/**
 * Suite de contrat du port FournisseurAuth (ST-US-022 §4.3, §6.4, §14 ; conventions.md §11.10). Identifiants
 * CT-AUTH-nn, rang 1. Exécutée sur FauxFournisseurAuth ; Benjamin l'exécute aussi sur FournisseurAuthWeb, avec
 * une passerelle GIS et une navigation doublées qui jouent le rôle de Google (même fixture).
 */
import { describe, expect, it } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { echec, succes } from '@src/commun/domaine/resultat';
import type {
  DemandeJeton,
  FournisseurAuth,
  RetourGoogle,
} from '@src/compte/application/ports/fournisseur-auth';
import {
  REPRISE_ACCUEIL,
  type MemoireRedirection,
} from '@src/compte/application/ports/memoire-redirection';
import { PORTEES_LOT_1 } from '@src/compte/domaine/portees';
import type { Identite } from '@src/compte/domaine/identite';
import { FauxFournisseurAuth } from '@tests/doublures/faux-fournisseur-auth';
import {
  IDENTITE_A,
  IDENTITE_B,
  MemoireRedirectionEnMemoire,
} from '@tests/support/compte/doublures-compte';
import { horlogeSur } from '@tests/support/horloge';

export type FixtureFournisseurAuth = {
  readonly fournisseur: FournisseurAuth;
  readonly memoireRedirection: MemoireRedirection;
  readonly google: {
    readonly accorder: (identite: Identite, portees?: ReadonlyArray<string>) => void;
    readonly sessionGoogle: (identite: Identite) => void;
    readonly fermerLaProchaineFenetre: () => void;
    readonly retirerAcces: () => void;
    readonly panneTechniqueGis: () => void;
  };
  /** Retour que Google placerait dans le fragment pour la dernière redirection lancée. */
  readonly acheverRedirection: () => RetourGoogle;
};

const DRIVE_FILE = 'https://www.googleapis.com/auth/drive.file';
const demande = (
  mode: DemandeJeton['mode'],
  options: Partial<DemandeJeton> = {},
): DemandeJeton => ({
  mode,
  portees: PORTEES_LOT_1,
  reprise: REPRISE_ACCUEIL,
  redirectionPermise: true,
  ...(mode === 'CONNEXION' ? {} : { indice: IDENTITE_A.adresse }),
  ...options,
});

export const suiteContratFournisseurAuth = (
  nom: string,
  creer: () => FixtureFournisseurAuth,
): void => {
  describe(`Contrat FournisseurAuth — ${nom}`, () => {
    it('CT-AUTH-01 demanderJeton CONNEXION — accès accordé : ACCES_OBTENU avec l’identité et toutes les portées', async () => {
      const f = creer();
      f.google.accorder(IDENTITE_A);

      const r = await f.fournisseur.demanderJeton(demande('CONNEXION'));

      expect(r).toMatchObject(succes({ type: 'ACCES_OBTENU', acces: { identite: IDENTITE_A } }));
      expect(r.ok && r.valeur.type === 'ACCES_OBTENU' && r.valeur.acces.porteesAccordees).toEqual(
        expect.arrayContaining([DRIVE_FILE]),
      );
    });

    it('CT-AUTH-02 demanderJeton — fenêtre fermée par l’utilisateur : ConnexionAnnulee, jamais de repli', async () => {
      const f = creer();
      f.google.accorder(IDENTITE_A);
      f.google.fermerLaProchaineFenetre();

      expect(await f.fournisseur.demanderJeton(demande('RENOUVELLEMENT_GESTE'))).toEqual(
        echec({ type: 'ConnexionAnnulee' }),
      );
      expect(await f.memoireRedirection.consommer()).toBeUndefined();
    });

    it('CT-AUTH-03 demanderJeton CONNEXION — drive.file refusée : PorteeInsuffisante', async () => {
      const f = creer();
      f.google.accorder(IDENTITE_A, ['openid', 'email']);

      expect(await f.fournisseur.demanderJeton(demande('CONNEXION'))).toEqual(
        echec({ type: 'PorteeInsuffisante', manquantes: [DRIVE_FILE] }),
      );
    });

    it('CT-AUTH-04 demanderJeton — un mode autre que CONNEXION sans login_hint est une erreur de programmation', async () => {
      const f = creer();
      const sansIndice: DemandeJeton = {
        mode: 'RENOUVELLEMENT_GESTE',
        portees: PORTEES_LOT_1,
        reprise: REPRISE_ACCUEIL,
        redirectionPermise: true,
      };

      await expect(f.fournisseur.demanderJeton(sansIndice)).rejects.toBeInstanceOf(
        ErreurProgrammation,
      );
    });

    it('CT-AUTH-05 RENOUVELLEMENT_OUVERTURE — redirection lancée, départ mémorisé ; le retour avec jeton est accepté et restitue la reprise', async () => {
      const f = creer();
      f.google.sessionGoogle(IDENTITE_A);
      const reprise = { ecran: '/objectifs', feuilleSynchronisationOuverte: false };

      expect(
        await f.fournisseur.demanderJeton(demande('RENOUVELLEMENT_OUVERTURE', { reprise })),
      ).toEqual(succes({ type: 'REDIRECTION_LANCEE' }));
      const depart = await f.memoireRedirection.consommer();
      const retour = f.acheverRedirection();

      expect(depart?.mode).toBe('RENOUVELLEMENT_OUVERTURE');
      expect(
        await f.fournisseur.recevoirRetour({ retour, depart, compteAttendu: IDENTITE_A.compte }),
      ).toMatchObject(
        succes({ acces: { identite: IDENTITE_A }, mode: 'RENOUVELLEMENT_OUVERTURE', reprise }),
      );
    });

    it('CT-AUTH-06 recevoirRetour — sans départ mémorisé : RetourRedirectionRejete SANS_DEPART', async () => {
      const f = creer();
      f.google.sessionGoogle(IDENTITE_A);
      await f.fournisseur.demanderJeton(demande('RENOUVELLEMENT_OUVERTURE'));
      const retour = f.acheverRedirection();

      expect(
        await f.fournisseur.recevoirRetour({
          retour,
          depart: undefined,
          compteAttendu: IDENTITE_A.compte,
        }),
      ).toEqual(echec({ type: 'RetourRedirectionRejete', motif: 'SANS_DEPART' }));
    });

    it('CT-AUTH-07 geste — accès retiré : AccesGoogleRevoque, sans repli', async () => {
      const f = creer();
      f.google.accorder(IDENTITE_A);
      f.google.retirerAcces();

      expect(await f.fournisseur.demanderJeton(demande('RECONNEXION_GESTE'))).toEqual(
        echec({ type: 'AccesGoogleRevoque' }),
      );
      expect(await f.memoireRedirection.consommer()).toBeUndefined();
    });

    it('CT-AUTH-08 geste — jeton obtenu pour un autre compte : CompteDifferent', async () => {
      const f = creer();
      f.google.accorder(IDENTITE_B);

      expect(await f.fournisseur.demanderJeton(demande('RENOUVELLEMENT_GESTE'))).toEqual(
        echec({ type: 'CompteDifferent' }),
      );
    });

    it('CT-AUTH-09 geste — panne technique de GIS : une seule redirection interactive (REPLI_GESTE) ; refusée si une saisie est en cours', async () => {
      const permise = creer();
      permise.google.accorder(IDENTITE_A);
      permise.google.panneTechniqueGis();

      expect(await permise.fournisseur.demanderJeton(demande('RENOUVELLEMENT_GESTE'))).toEqual(
        succes({ type: 'REDIRECTION_LANCEE' }),
      );
      expect((await permise.memoireRedirection.consommer())?.mode).toBe('REPLI_GESTE');

      const saisie = creer();
      saisie.google.accorder(IDENTITE_A);
      saisie.google.panneTechniqueGis();

      expect(
        await saisie.fournisseur.demanderJeton(
          demande('RENOUVELLEMENT_GESTE', { redirectionPermise: false }),
        ),
      ).toEqual(echec({ type: 'RedirectionNonPermise' }));
      expect(await saisie.memoireRedirection.consommer()).toBeUndefined();
    });
  });
};

suiteContratFournisseurAuth('FauxFournisseurAuth', () => {
  const memoireRedirection = new MemoireRedirectionEnMemoire();
  const faux = new FauxFournisseurAuth({
    memoireRedirection,
    horloge: horlogeSur('2026-10-28T08:00:00.000Z'),
  });
  return {
    fournisseur: faux,
    memoireRedirection,
    google: {
      accorder: (identite, portees) => {
        faux.accorder(identite, portees);
      },
      sessionGoogle: (identite) => {
        faux.sessionGoogle(identite);
      },
      fermerLaProchaineFenetre: () => {
        faux.fermerLaProchaineFenetre();
      },
      retirerAcces: () => {
        faux.retirerAcces();
      },
      panneTechniqueGis: () => {
        faux.panneTechniqueGis();
      },
    },
    acheverRedirection: () => faux.acheverRedirection(),
  };
});
