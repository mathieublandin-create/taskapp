/**
 * ST-US-017 v0.4 §4.5, §13.1 (DT-011) : modèle de vue de la section « Synchronisation » de la feuille ECR-011 à
 * l'incrément 1 (guide §4.26, §6.6.1, §6.6.2, §5.8 f).
 */
import { describe, expect, it } from 'vitest';
import { libelle } from '@src/commun/presentation/messages/libelle';
import type { EtatSynchronisationAffichable } from '@src/synchronisation/presentation/modeles-de-vue/etat-synchronisation-affichable';
import {
  construireFeuilleSynchronisation,
  type EntreeFeuilleSynchronisation,
} from '@src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation';
import type { LigneFeuilleOrdonnable } from '@src/synchronisation/presentation/modeles-de-vue/ordre-feuille';
import { instant } from '@tests/support/valeurs';

const INSECABLE = ' ';
/** 10 h 32 à Paris, le 21 octobre 2026 (UTC+2). */
const MAINTENANT = instant('2026-10-21T08:32:00.000Z');

const ETAT_REPOS: EtatSynchronisationAffichable = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 0,
  aLire: 0,
  rappelMasque: false,
};

const entree = (
  etat: Partial<EtatSynchronisationAffichable> = {},
  complements: Partial<Omit<EntreeFeuilleSynchronisation, 'etat'>> = {},
): EntreeFeuilleSynchronisation => ({
  etat: { ...ETAT_REPOS, ...etat },
  maintenant: MAINTENANT,
  elementsEnAttente: [],
  ...complements,
});

const element = (id: string, intitule: string, iso: string): LigneFeuilleOrdonnable => ({
  id,
  intitule,
  instant: instant(iso),
});

const TROIS_ELEMENTS: ReadonlyArray<LigneFeuilleOrdonnable> = [
  element('id-1', 'Relire le plan', '2026-10-21T08:00:00.000Z'),
  element('id-2', 'Publier le guide', '2026-10-21T08:20:00.000Z'),
  element('id-3', 'Envoyer le devis', '2026-10-21T08:20:00.000Z'),
];

describe('construireFeuilleSynchronisation — section « Synchronisation » (ECR-011, incrément 1)', () => {
  it('UT-US-017-35 dernier échange — SYN-FEUILLE-DERNIER-ECHANGE avec l’ancienneté et l’heure de Paris ; ligne absente sans échange', () => {
    const vue = construireFeuilleSynchronisation(
      entree({}, { dernierEchange: instant('2026-10-21T08:27:00.000Z') }),
    );
    expect(vue.dernierEchange).toEqual({
      code: 'SYN-FEUILLE-DERNIER-ECHANGE',
      libelle: `Dernier échange avec votre Google Drive${INSECABLE}: il y a 5${INSECABLE}min (10${INSECABLE}h${INSECABLE}27).`,
    });

    const hier = construireFeuilleSynchronisation(
      entree({}, { dernierEchange: instant('2026-10-20T07:00:00.000Z') }),
    );
    expect(hier.dernierEchange?.libelle).toBe(
      `Dernier échange avec votre Google Drive${INSECABLE}: hier à 9${INSECABLE}h${INSECABLE}00 (9${INSECABLE}h${INSECABLE}00).`,
    );

    expect(construireFeuilleSynchronisation(entree())).not.toHaveProperty('dernierEchange');
  });

  it('UT-US-017-36 modifications en attente — rien : SYN-FEUILLE-RIEN-EN-ATTENTE ; sinon SYN-FEUILLE-EN-ATTENTE, n = nombre de lignes, une ligne par élément dans l’ordre comparerLignesFeuille', () => {
    expect(construireFeuilleSynchronisation(entree()).attente).toEqual({
      code: 'SYN-FEUILLE-RIEN-EN-ATTENTE',
      libelle: 'Aucune modification en attente.',
    });

    // Le décompte de l'état (5) n'est pas celui de la liste : n est le nombre de lignes (guide §6.6.1, « Décompte »).
    const vue = construireFeuilleSynchronisation(
      entree({ enAttente: 5 }, { elementsEnAttente: TROIS_ELEMENTS }),
    );
    expect(vue.attente).toEqual({
      code: 'SYN-FEUILLE-EN-ATTENTE',
      n: 3,
      libelle: '3 modifications en attente',
      lignes: [
        { id: 'id-3', intitule: 'Envoyer le devis' },
        { id: 'id-2', intitule: 'Publier le guide' },
        { id: 'id-1', intitule: 'Relire le plan' },
      ],
    });

    const une = construireFeuilleSynchronisation(
      entree({ enAttente: 1 }, { elementsEnAttente: TROIS_ELEMENTS.slice(0, 1) }),
    );
    expect(une.attente).toMatchObject({ n: 1, libelle: '1 modification en attente' });
  });

  it('UT-US-017-37 réseau — hors ligne : SYN-FEUILLE-HORS-LIGNE et « Synchroniser maintenant » indisponible avec son explication ; connecté : pas de ligne, bouton disponible sans explication', () => {
    const connecte = construireFeuilleSynchronisation(entree());
    expect(connecte).not.toHaveProperty('horsLigne');
    expect(connecte.bouton).toEqual({
      code: 'SYN-FEUILLE-BOUTON',
      libelle: 'Synchroniser maintenant',
      disponible: true,
    });

    const enCours = construireFeuilleSynchronisation(entree({ cycle: 'EN_COURS' }));
    expect(enCours.bouton.disponible).toBe(true);

    const horsLigne = construireFeuilleSynchronisation(
      entree({ reseau: 'COUPE', enAttente: 1 }, { elementsEnAttente: TROIS_ELEMENTS.slice(0, 1) }),
    );
    expect(horsLigne.horsLigne).toEqual({
      code: 'SYN-FEUILLE-HORS-LIGNE',
      libelle: libelle('SYN-FEUILLE-HORS-LIGNE'),
    });
    expect(horsLigne.bouton).toEqual({
      code: 'SYN-FEUILLE-BOUTON',
      libelle: 'Synchroniser maintenant',
      disponible: false,
      explication: 'Disponible au retour du réseau.',
    });
  });

  it('UT-US-017-38 cartes d’erreur — ERR-011 pour le Drive plein, ERR-016 pour l’échec persistant (n = nombre de lignes) ; aucune carte sinon à l’incrément 1', () => {
    const drivePlein = construireFeuilleSynchronisation(entree({ actionRequise: 'DRIVE_PLEIN' }));
    expect(drivePlein.cartes).toEqual([
      {
        message: 'ERR-011',
        titre: 'Votre Google Drive est plein',
        texte: libelle('ERR-011', {}, 'texte'),
        action: { type: 'OUVRIR_GOOGLE_DRIVE', libelle: 'Ouvrir Google Drive' },
      },
    ]);

    const echec = construireFeuilleSynchronisation(
      entree(
        { actionRequise: 'ECHEC_PERSISTANT', enAttente: 3 },
        { elementsEnAttente: TROIS_ELEMENTS },
      ),
    );
    expect(echec.cartes).toEqual([
      {
        message: 'ERR-016',
        titre: libelle('ERR-016'),
        texte: libelle('ERR-016', { n: 3 }, 'texte'),
        action: { type: 'REESSAYER_MAINTENANT', libelle: 'Réessayer maintenant' },
      },
    ]);
    expect(echec.cartes[0]?.texte).toContain('Vos 3 modifications sont conservées');

    const sansCarte: ReadonlyArray<Partial<EtatSynchronisationAffichable>> = [
      {},
      { actionRequise: 'DONNEES_ABSENTES' },
      { actionRequise: 'FORMAT_PLUS_RECENT' },
      { acces: 'PERDU' },
      { acces: 'A_RENOUVELER' },
      { cycle: 'RETENTATIVE' },
      { reseau: 'COUPE' },
    ];
    expect(sansCarte.map((etat) => construireFeuilleSynchronisation(entree(etat)).cartes)).toEqual(
      sansCarte.map(() => []),
    );
  });
});
