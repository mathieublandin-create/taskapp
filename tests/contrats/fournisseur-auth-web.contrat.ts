/**
 * Suite de contrat FournisseurAuth (CT-AUTH-01 à 09) exécutée sur l'adaptateur réel FournisseurAuthWeb, avec une
 * passerelle GIS, une navigation et userinfo doublés (ST-US-022 §14, Q-BEN-LOT001-8).
 */
import { CoffreJetonsMemoire } from '@src/compte/infrastructure/coffre-jetons-memoire';
import { FournisseurAuthWeb } from '@src/compte/infrastructure/auth/fournisseur-auth-web';
import { SourceAleatoireDeterministe } from '@tests/doublures/source-aleatoire-deterministe';
import {
  IDENTITE_A,
  JournalEnMemoire,
  MemoireRedirectionEnMemoire,
  ReseauFixe,
} from '@tests/support/compte/doublures-compte';
import { GoogleSimuleGis } from '@tests/support/compte/google-simule-gis';
import { horlogeSur } from '@tests/support/horloge';
import { suiteContratFournisseurAuth } from './fournisseur-auth.contrat';

suiteContratFournisseurAuth('FournisseurAuthWeb', () => {
  const memoireRedirection = new MemoireRedirectionEnMemoire();
  const google = new GoogleSimuleGis();
  const fournisseur = new FournisseurAuthWeb({
    configuration: {
      clientId: 'client.apps.googleusercontent.com',
      redirectUri: 'https://exemple.test/taskapp/',
      plateforme: 'web',
    },
    passerelle: google.passerelle,
    lireIdentite: google.lireIdentite,
    navigation: google.navigation,
    memoireRedirection,
    coffre: new CoffreJetonsMemoire(),
    horloge: horlogeSur('2026-10-28T08:00:00.000Z'),
    aleatoire: new SourceAleatoireDeterministe([0]),
    reseau: new ReseauFixe(true),
    journal: new JournalEnMemoire(),
    compteDeLaSession: () => IDENTITE_A.compte,
  });
  return {
    fournisseur,
    memoireRedirection,
    google: {
      accorder: (identite, portees) => {
        google.accorder(identite, portees);
      },
      sessionGoogle: (identite) => {
        google.sessionGoogle(identite);
      },
      fermerLaProchaineFenetre: () => {
        google.fermerLaProchaineFenetre();
      },
      retirerAcces: () => {
        google.retirerAcces();
      },
      panneTechniqueGis: () => {
        google.panneTechniqueGis();
      },
    },
    acheverRedirection: () => google.acheverRedirection(),
  };
});
