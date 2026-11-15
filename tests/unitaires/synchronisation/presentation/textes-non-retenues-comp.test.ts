/**
 * Textes de la section « À lire » (guide §6.6.9, §6.6.12 ; ST-US-017 v0.7 §12.5, Q-ST017-STE-2 et 3) : titre, texte,
 * actions, valeurs signalées et carte `ALR-008`. Tests complémentaires de la tranche D3.
 */
import { describe, expect, it } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import type {
  InformationSignalee,
  ValeurEcarteeDetaillee,
  ValeurSignalee,
} from '@src/synchronisation/domaine/detail-valeurs-ecartees';
import {
  construireModificationsNonRetenues,
  formaterValeur,
  libelleModificationsEffacees,
  libelleVoir,
  nomAccessibleVoir,
  nomInformation,
  sousTitreLigne,
  texteDonneeEffacee,
  texteDonneesEffacees,
  texteLigne,
  titreDonneeEffacee,
  type ContexteTextes,
  type LigneModificationNonRetenue,
} from '@src/synchronisation/presentation/modeles-de-vue/modifications-non-retenues';
import { h, idArbitraire } from '@tests/support/synchronisation/ecritures-concurrentes';
import { date, duree, idObjectif, idTache, PC } from '@tests/support/valeurs';

const CONTEXTE: ContexteTextes = { appareil: 'PC', aujourdhui: date('2026-11-01') };
const NBSP = ' ';

const detail = (
  n: number,
  complement: Partial<ValeurEcarteeDetaillee> &
    Pick<ValeurEcarteeDetaillee, 'motif' | 'information'>,
): ValeurEcarteeDetaillee => ({
  id: idArbitraire(n),
  element: { type: 'TACHE', id: idTache(1) },
  intitule: 'Chapitre 1',
  valeurNonRetenue: { type: 'DATE', date: date('2026-10-22') },
  valeurConservee: { type: 'DATE', date: date('2027-01-05') },
  instant: h(n, PC).physique,
  lue: false,
  elementExiste: true,
  ...complement,
});

const ligneDe = (v: ValeurEcarteeDetaillee): LigneModificationNonRetenue => {
  const ligne = construireModificationsNonRetenues([v])?.lignes[0];
  if (ligne === undefined) throw new Error('Aucune ligne');
  return ligne;
};

const suppression = (complement: Partial<ValeurEcarteeDetaillee>): ValeurEcarteeDetaillee =>
  detail(1, {
    motif: 'SUPPRESSION',
    information: 'DELAI',
    valeurConservee: { type: 'TACHE_SUPPRIMEE' },
    supprime: { type: 'TACHE', id: idTache(1) },
    elementExiste: false,
    ...complement,
  });

describe('textes de la section « À lire » (Q-ST017-STE-2 et 3)', () => {
  it('UT-COMP-US-017-2-36 nomInformation — titre des huit informations (objectifs : Rattachement, parent : Placement)', () => {
    const informations: ReadonlyArray<readonly [InformationSignalee, string]> = [
      ['INTITULE', 'Intitulé'],
      ['DESCRIPTION', 'Description'],
      ['DELAI', 'Délai'],
      ['ESTIMATION', 'Estimation'],
      ['OBJECTIFS', 'Rattachement'],
      ['PARENT', 'Placement'],
      ['ETAT', 'État'],
      ['CREATION', 'Création'],
    ];
    expect(informations.map(([information]) => nomInformation(information))).toEqual(
      informations.map(([, titre]) => titre),
    );
  });

  it('UT-COMP-US-017-2-37 formaterValeur — chaque type de valeur donne son fragment TXT-VAL (dates courtes, durée, guillemets de second niveau)', () => {
    const cas: ReadonlyArray<readonly [ValeurSignalee, InformationSignalee, string]> = [
      [{ type: 'TEXTE', texte: 'Plan' }, 'INTITULE', 'Plan'],
      [{ type: 'AUCUNE' }, 'DESCRIPTION', 'aucune description'],
      [{ type: 'AUCUNE' }, 'DELAI', 'sans délai'],
      [{ type: 'DATE', date: date('2026-10-22') }, 'DELAI', '22 oct.'],
      [{ type: 'DATE', date: date('2027-01-05') }, 'DELAI', '5 janv. 2027'],
      [{ type: 'DUREE', duree: duree(90) }, 'ESTIMATION', '1 h 30'],
      [{ type: 'ETAT', etat: 'A_FAIRE' }, 'ETAT', 'à faire'],
      [{ type: 'ETAT', etat: 'TERMINEE', date: date('2026-10-22') }, 'ETAT', 'terminée le 22 oct.'],
      [
        { type: 'ETAT', etat: 'ABANDONNEE', date: date('2026-10-24') },
        'ETAT',
        'abandonnée le 24 oct.',
      ],
      [{ type: 'SOUS', intitule: 'Guide' }, 'PARENT', 'sous “Guide”'],
      [{ type: 'PRINCIPAL' }, 'PARENT', 'objectif principal'],
      [{ type: 'RATTACHEE', intitule: 'Guide' }, 'OBJECTIFS', 'rattachée à “Guide”'],
      [{ type: 'DETACHEE', intitule: 'Guide' }, 'OBJECTIFS', 'détachée de “Guide”'],
      [{ type: 'SOUS_TACHE_DE', intitule: 'Chapitre 1' }, 'CREATION', 'sous-tâche de “Chapitre 1”'],
      [{ type: 'CREEE' }, 'CREATION', 'création'],
      [{ type: 'TACHE_SUPPRIMEE' }, 'DELAI', 'tâche supprimée'],
      [{ type: 'OBJECTIF_SUPPRIME' }, 'DELAI', 'objectif supprimé'],
      [
        { type: 'SUPPRIMEE_AVEC', intitule: 'Chapitre 1' },
        'CREATION',
        'supprimée avec la tâche “Chapitre 1”',
      ],
      [{ type: 'PLACEMENT_ANNULE' }, 'PARENT', 'placement annulé'],
      [{ type: 'DONNEES_EFFACEES' }, 'DELAI', 'données effacées (repartir de zéro)'],
    ];
    expect(
      cas.map(([valeur, information]) => formaterValeur(valeur, information, CONTEXTE)),
    ).toEqual(cas.map(([, , texte]) => texte));
  });

  it('UT-COMP-US-017-2-38 formaterValeur — description sur une ligne, coupée à 80 caractères suivis de « … » ; l’intitulé n’est jamais coupé', () => {
    const longue = `${'a'.repeat(79)}b\nsuite`;
    expect(formaterValeur({ type: 'TEXTE', texte: 'un\r\ndeux' }, 'DESCRIPTION', CONTEXTE)).toBe(
      'un deux',
    );
    expect(formaterValeur({ type: 'TEXTE', texte: longue }, 'DESCRIPTION', CONTEXTE)).toBe(
      `${'a'.repeat(79)}b…`,
    );
    expect(formaterValeur({ type: 'TEXTE', texte: longue }, 'INTITULE', CONTEXTE)).toBe(longue);
  });

  it('UT-COMP-US-017-2-39 formaterValeur — une valeur terminée ou abandonnée sans date est une erreur de programmation', () => {
    expect(() => formaterValeur({ type: 'ETAT', etat: 'TERMINEE' }, 'ETAT', CONTEXTE)).toThrow(
      ErreurProgrammation,
    );
  });

  it('UT-COMP-US-017-2-40 texteLigne ALR-009 — valeur non retenue et valeur conservée, deux fins à des dates différentes distinguées, sans appareil ni heure', () => {
    const ligne = ligneDe(
      detail(1, {
        motif: 'CONFLIT',
        information: 'ETAT',
        valeurNonRetenue: { type: 'ETAT', etat: 'TERMINEE', date: date('2026-10-22') },
        valeurConservee: { type: 'ETAT', etat: 'TERMINEE', date: date('2026-10-24') },
      }),
    );
    expect(ligne.titre).toBe(`État de «${NBSP}Chapitre 1${NBSP}»`);
    expect(texteLigne(ligne, CONTEXTE)).toBe(
      `Votre valeur «${NBSP}terminée le 22 oct.${NBSP}» n’a pas été retenue. Valeur conservée${NBSP}: «${NBSP}terminée le 24 oct.${NBSP}».`,
    );
  });

  it('UT-COMP-US-017-2-41 texteLigne ALR-010 — générique et tâche (forme « dans une phrase »), sous-tâche (tâche supprimée), rattachement et placement (objectif cité)', () => {
    const generique = ligneDe(suppression({ information: 'DESCRIPTION' }));
    const sousTache = ligneDe(
      suppression({
        information: 'CREATION',
        intitule: 'Section A',
        valeurNonRetenue: { type: 'SOUS_TACHE_DE', intitule: 'Chapitre 1' },
        valeurConservee: { type: 'SUPPRIMEE_AVEC', intitule: 'Chapitre 1' },
      }),
    );
    const rattachement = ligneDe(
      suppression({
        information: 'OBJECTIFS',
        valeurNonRetenue: { type: 'RATTACHEE', intitule: 'Guide' },
        valeurConservee: { type: 'OBJECTIF_SUPPRIME' },
        supprime: { type: 'OBJECTIF', id: idObjectif(1) },
        elementExiste: true,
      }),
    );
    const placement = ligneDe(
      suppression({
        information: 'PARENT',
        intitule: 'Version imprimable',
        valeurNonRetenue: { type: 'SOUS', intitule: 'Guide' },
        valeurConservee: { type: 'OBJECTIF_SUPPRIME' },
        supprime: { type: 'OBJECTIF', id: idObjectif(1) },
        elementExiste: true,
      }),
    );

    expect([generique, sousTache, rattachement, placement].map((l) => l.variante)).toEqual([
      'tache',
      'sous-tache',
      'rattachement',
      'placement',
    ]);
    expect(sousTache.titre).toBe(`Sous-tâche «${NBSP}Section A${NBSP}» supprimée`);
    expect(texteLigne(generique, CONTEXTE)).toBe(
      'Votre modification de sa description n’a pas été conservée.',
    );
    expect(texteLigne(sousTache, CONTEXTE)).toBe(
      `Sa tâche «${NBSP}Chapitre 1${NBSP}» a été supprimée. Votre sous-tâche n’a pas été conservée.`,
    );
    expect(texteLigne(rattachement, CONTEXTE)).toBe(
      `Votre rattachement à «${NBSP}Guide${NBSP}» n’a pas été conservé${NBSP}: l’objectif a été supprimé.`,
    );
    expect(texteLigne(placement, CONTEXTE)).toBe(
      `Votre placement sous «${NBSP}Guide${NBSP}» n’a pas été conservé. «${NBSP}Version imprimable${NBSP}» est devenu objectif principal.`,
    );
    expect([
      sousTitreLigne(generique),
      sousTitreLigne(rattachement),
      sousTitreLigne(placement),
    ]).toEqual([
      undefined,
      `Tâche «${NBSP}Chapitre 1${NBSP}»`,
      `Objectif «${NBSP}Version imprimable${NBSP}»`,
    ]);
  });

  it('UT-COMP-US-017-2-61 RC-US-017-3 — l’objectif supprimé est l’élément déplacé lui-même : ligne ALR-010 générique, sans variante ni « Voir », texte et sous-titre rendus sans erreur', () => {
    const objectif = { type: 'OBJECTIF', id: idObjectif(7) } as const;
    for (const valeurNonRetenue of [
      { type: 'PRINCIPAL' },
      { type: 'SOUS', intitule: 'Guide' },
    ] as const) {
      const ligne = ligneDe(
        suppression({
          information: 'PARENT',
          element: objectif,
          intitule: 'Version imprimable',
          valeurNonRetenue,
          valeurConservee: { type: 'OBJECTIF_SUPPRIME' },
          supprime: objectif,
        }),
      );

      expect(ligne.code).toBe('ALR-010');
      expect(ligne.variante).toBeUndefined();
      expect(ligne.voir).toBeUndefined();
      expect(texteLigne(ligne, CONTEXTE)).toBe(
        'Votre modification de son placement n’a pas été conservée.',
      );
      expect(sousTitreLigne(ligne)).toBeUndefined();
    }
  });

  it('UT-COMP-US-017-2-42 texteLigne ALR-011 — {élément} et {parent} distincts ; une valeur sans intitulé à citer est une erreur de programmation', () => {
    const annule = ligneDe(
      detail(1, {
        motif: 'PLACEMENT_ANNULE',
        information: 'PARENT',
        element: { type: 'OBJECTIF', id: idObjectif(1) },
        intitule: 'Alpha',
        valeurNonRetenue: { type: 'SOUS', intitule: 'Bêta' },
        valeurConservee: { type: 'PLACEMENT_ANNULE' },
      }),
    );
    expect(texteLigne(annule, CONTEXTE)).toBe(
      `Votre placement sous «${NBSP}Bêta${NBSP}» a été annulé${NBSP}: un déplacement plus récent place «${NBSP}Bêta${NBSP}» sous «${NBSP}Alpha${NBSP}». Les deux ne peuvent pas coexister.`,
    );
    expect(() =>
      texteLigne({ ...annule, valeurNonRetenue: { type: 'PRINCIPAL' } }, CONTEXTE),
    ).toThrow(ErreurProgrammation);
  });

  it('UT-COMP-US-017-2-43 libelleVoir et nomAccessibleVoir — « Voir la tâche » ou « Voir l’objectif » selon l’élément, absents si l’élément n’existe plus', () => {
    const tache = ligneDe(detail(1, { motif: 'CONFLIT', information: 'DELAI' }));
    const objectif = ligneDe(
      detail(2, {
        motif: 'CONFLIT',
        information: 'INTITULE',
        element: { type: 'OBJECTIF', id: idObjectif(1) },
        intitule: 'Guide',
      }),
    );
    const disparue = ligneDe(suppression({}));

    expect([tache, objectif, disparue].map(libelleVoir)).toEqual([
      'Voir la tâche',
      'Voir l’objectif',
      undefined,
    ]);
    expect([tache, objectif, disparue].map(nomAccessibleVoir)).toEqual([
      `Voir la tâche : délai de «${NBSP}Chapitre 1${NBSP}»`,
      `Voir l’objectif : intitulé de «${NBSP}Guide${NBSP}»`,
      undefined,
    ]);
  });

  it('UT-COMP-US-017-2-44 carte ALR-008 — {appareil} est l’autre appareil, titre et texte des lignes ALR-014 sans appareil ni heure, libellé du repli (une modification : « Voir la modification »)', () => {
    const ligne = {
      id: idArbitraire(0),
      element: 'Annexe',
      information: 'DELAI' as const,
      valeurNonRetenue: { type: 'DATE' as const, date: date('2026-12-01') },
    };

    expect(texteDonneesEffacees(2, CONTEXTE)).toBe(
      'Vous avez choisi de repartir de zéro sur votre smartphone. 2 modifications faites ici avant ce choix n’ont pas été conservées.',
    );
    expect(texteDonneesEffacees(1, { ...CONTEXTE, appareil: 'smartphone' })).toBe(
      'Vous avez choisi de repartir de zéro sur votre PC. 1 modification faite ici avant ce choix n’a pas été conservée.',
    );
    expect(titreDonneeEffacee(ligne)).toBe(`Délai de «${NBSP}Annexe${NBSP}»`);
    expect(texteDonneeEffacee(ligne, CONTEXTE)).toBe(
      `Votre valeur «${NBSP}1 déc.${NBSP}» n’a pas été conservée.`,
    );
    expect([libelleModificationsEffacees(1), libelleModificationsEffacees(3)]).toEqual([
      'Voir la modification',
      'Voir les 3 modifications',
    ]);
  });
});
