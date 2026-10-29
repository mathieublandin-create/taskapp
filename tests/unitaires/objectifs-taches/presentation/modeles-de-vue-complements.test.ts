/**
 * Tests complémentaires du rang 2 (RC-R2-2) : branches des modèles de vue d'US-001 non gardées par les tests fournis
 * en E10 (confirmations, détail, refus, ordre de référence, libellé de l'indicateur de synchronisation).
 */
import { describe, expect, it } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { construireConfirmationCompte } from '@src/compte/presentation/modeles-de-vue/confirmations-compte';
import type { ResumeObjectif } from '@src/objectifs-taches/application/requetes/resumes';
import { construireConfirmation } from '@src/objectifs-taches/presentation/modeles-de-vue/confirmation';
import { construireDetailObjectif } from '@src/objectifs-taches/presentation/modeles-de-vue/detail-objectif';
import { messagesDeRefus } from '@src/objectifs-taches/presentation/modeles-de-vue/messages-de-refus';
import { comparerOrdreReference } from '@src/objectifs-taches/presentation/modeles-de-vue/ordre-reference';
import { libelleIndicateur } from '@src/synchronisation/presentation/modeles-de-vue/indicateur-synchronisation';
import { creeAuRang, resumeObjectif } from '@tests/support/fabriques/resumes';
import { horlogeSur } from '@tests/support/horloge';
import { idObjectif, idTache, NEW_YORK } from '@tests/support/valeurs';

const INSECABLE = ' ';
const horloge = () => horlogeSur('2026-10-21T08:00:00.000Z');
const detailDe = (objectif: ResumeObjectif) =>
  construireDetailObjectif(
    { objectif, sousObjectifs: [], taches: [], sousTachesPar: new Map(), actions: [] },
    { horloge: horloge() },
  );

describe('construireConfirmation — confirmations des rangs suivants (guide §6.6.7)', () => {
  const T = idTache(1);

  it('UT-COMP-US-001-10 SUPPRESSION_TACHE — avec sous-tâches, le titre nomme n ; sans sous-tâche, la variante courte et aucun texte', () => {
    const avec = construireConfirmation({
      type: 'SUPPRESSION_TACHE',
      tacheId: T,
      intitule: 'Chapitre 1',
      sousTaches: 2,
    });
    const sans = construireConfirmation({
      type: 'SUPPRESSION_TACHE',
      tacheId: T,
      intitule: 'Chapitre 1',
      sousTaches: 0,
    });

    expect(avec).toMatchObject({
      code: 'CNF-SUPPR-TACHE',
      titre: `Supprimer la tâche et ses 2 sous-tâches${INSECABLE}?`,
      actionLibelle: 'Supprimer',
    });
    expect(avec.texte).toBeUndefined();
    expect(sans.titre).toBe(`Supprimer la tâche${INSECABLE}?`);
  });

  it('UT-COMP-US-001-11 AJOUT_SOUS_TACHE_TERMINEE et REOUVERTURE_SOUS_TACHE — titre avec l’élément, bouton « Rouvrir… », sans texte', () => {
    const ajout = construireConfirmation({
      type: 'AJOUT_SOUS_TACHE_TERMINEE',
      tacheParenteId: T,
      intitule: 'Chapitre 1',
    });
    const reouverture = construireConfirmation({
      type: 'REOUVERTURE_SOUS_TACHE',
      tacheParenteId: T,
      intitule: 'Relire',
    });

    expect(ajout).toMatchObject({
      code: 'CNF-AJOUT-SOUS-TACHE-TERMINEE',
      titre: `Rouvrir «${INSECABLE}Chapitre 1${INSECABLE}» pour y ajouter une sous-tâche${INSECABLE}?`,
      actionLibelle: 'Rouvrir et ajouter',
    });
    expect(ajout.texte).toBeUndefined();
    expect(reouverture).toMatchObject({
      code: 'CNF-ROUVRIR-SOUS-TACHE',
      actionLibelle: 'Rouvrir les deux',
    });
    expect(reouverture.texte).toBeUndefined();
  });

  it('UT-COMP-US-001-12 ABANDON_TACHE — sans sous-tâche CNF-ABANDON-TACHE, avec sous-tâches la cascade nomme n', () => {
    const simple = construireConfirmation({
      type: 'ABANDON_TACHE',
      tacheId: T,
      intitule: 'Chapitre 1',
      sousTachesAbandonnees: 0,
    });
    const cascade = construireConfirmation({
      type: 'ABANDON_TACHE',
      tacheId: T,
      intitule: 'Chapitre 1',
      sousTachesAbandonnees: 3,
    });

    expect(simple.code).toBe('CNF-ABANDON-TACHE');
    expect(simple.texte).toContain('Vous la retrouverez dans');
    expect(cascade.code).toBe('CNF-ABANDON-TACHE-CASCADE');
    expect(cascade.texte).toContain('Ses 3 sous-tâches à faire seront abandonnées aussi');
    expect(cascade.actionLibelle).toBe('Abandonner');
  });

  it('UT-COMP-US-001-13 REPRISE_SOUS_TACHE — nomme la sous-tâche et la tâche parente, bouton « Reprendre les deux »', () => {
    const modele = construireConfirmation({
      type: 'REPRISE_SOUS_TACHE',
      tacheId: T,
      intitule: 'Relire',
      tacheParenteId: idTache(2),
      intituleTacheParente: 'Chapitre 1',
    });

    expect(modele).toMatchObject({
      code: 'CNF-REPRENDRE-SOUS-TACHE',
      titre: `Reprendre «${INSECABLE}Relire${INSECABLE}»${INSECABLE}?`,
      actionLibelle: 'Reprendre les deux',
    });
    expect(modele.texte).toBe(
      `«${INSECABLE}Chapitre 1${INSECABLE}» est terminée${INSECABLE}: elle sera rouverte aussi.`,
    );
  });

  it('UT-COMP-US-001-14 SUPPRESSION_OBJECTIF — le texte chiffre les tâches détachées et les sous-objectifs promus (CA-9)', () => {
    const modele = construireConfirmation({
      type: 'SUPPRESSION_OBJECTIF',
      objectifId: idObjectif(1),
      intitule: 'Publier le guide',
      tachesDetachees: 2,
      sousObjectifsPromus: 1,
    });

    expect(modele.texte).toBe(
      'La suppression est définitive. 2 tâches seront détachées de cet objectif. 1 sous-objectif devient objectif principal.',
    );
    expect(modele.actionLibelle).toBe('Supprimer');
  });
});

describe('construireConfirmationCompte — code inattendu', () => {
  it('UT-COMP-US-001-15 un code hors des trois confirmations du compte est une erreur de programmation', () => {
    const inattendu = { code: 'CNF-INCONNU' } as never;

    expect(() => construireConfirmationCompte(inattendu)).toThrow(ErreurProgrammation);
  });
});

describe('construireDetailObjectif — niveau, description, retard et alerte', () => {
  const PARENT = idObjectif(2);

  it('UT-COMP-US-001-16 un sous-objectif nomme son parent ; sans intitulé de parent, c’est une erreur de programmation', () => {
    const sous = resumeObjectif({ id: idObjectif(1), parentId: PARENT, parentIntitule: 'Guide' });

    expect(detailDe(sous).niveau).toEqual({
      type: 'SOUS_OBJECTIF',
      parent: { id: PARENT, intitule: 'Guide' },
    });
    expect(() => detailDe(resumeObjectif({ id: idObjectif(1), parentId: PARENT }))).toThrow(
      ErreurProgrammation,
    );
  });

  it('UT-COMP-US-001-17 la description, le retard et l’alerte de délai sont reproduits ; progression et nom accessible viennent de la ligne', () => {
    const detail = detailDe(
      resumeObjectif({
        id: idObjectif(1),
        intitule: 'Publier le guide',
        description: 'Version 1',
        delai: '2026-10-01',
        enRetard: true,
        tachesTerminees: 1,
        tachesNonAbandonnees: 4,
        parentId: PARENT,
        parentIntitule: 'Guide',
        alerteDelai: { parentIntitule: 'Guide', delaiParent: '2026-09-01' } as never,
      }),
    );

    expect(detail.description).toBe('Version 1');
    expect(detail.enRetard).toMatchObject({ code: 'MEN-EN-RETARD' });
    expect(detail.alerteDelai).toMatchObject({ code: 'ALR-007', parent: 'Guide' });
    expect(detail.progression).toBe(25);
    expect(detail.nomAccessible).toContain('Publier le guide, En cours, 1 tâches sur 4 terminées');
  });

  it('UT-COMP-US-001-18 la mention « Heure de Paris » n’apparaît que si le fuseau de l’appareil diffère de Paris', () => {
    const objectif = resumeObjectif({ id: idObjectif(1) });
    const ailleurs = construireDetailObjectif(
      { objectif, sousObjectifs: [], taches: [], sousTachesPar: new Map(), actions: [] },
      { horloge: horlogeSur('2026-10-21T08:00:00.000Z', NEW_YORK) },
    );

    expect(ailleurs.mentionHeureParis).toEqual({
      code: 'MEN-HEURE-PARIS',
      libelle: 'Heure de Paris',
    });
    expect(detailDe(objectif).mentionHeureParis).toBeUndefined();
  });
});

describe('messagesDeRefus — refus sans message', () => {
  it('UT-COMP-US-001-19 ElementIntrouvable et ActionNonDisponible ne produisent aucun message', () => {
    expect(
      messagesDeRefus({
        type: 'ElementIntrouvable',
        element: { type: 'OBJECTIF', id: idObjectif(1) },
      }),
    ).toEqual([]);
    expect(messagesDeRefus({ type: 'ActionNonDisponible', action: 'SUPPRIMER' })).toEqual([]);
  });

  it('UT-COMP-US-001-20 plusieurs défauts de saisie donnent un message par défaut, dans l’ordre', () => {
    expect(
      messagesDeRefus({ type: 'SaisieInvalide', defauts: ['INTITULE_VIDE', 'DELAI_ABSENT'] }),
    ).toEqual([
      { code: 'ERR-020', variables: {} },
      { code: 'ERR-021', variables: {} },
    ]);
  });
});

describe('comparerOrdreReference — départage (guide §5.8)', () => {
  const element = (id: string, intitule: string, creation: number, delai?: string) => ({
    id,
    intitule,
    creeLe: creeAuRang(creation),
    ...(delai === undefined ? {} : { delai: delai as never }),
  });

  it('UT-COMP-US-001-21 à délai égal : création croissante, puis intitulé sans casse ni accents, puis id', () => {
    const trier = (...elements: Array<ReturnType<typeof element>>) =>
      elements.sort(comparerOrdreReference).map((e) => e.id);

    expect(trier(element('b', 'A', 2, '2026-12-01'), element('a', 'Z', 1, '2026-12-01'))).toEqual([
      'a',
      'b',
    ]);
    expect(trier(element('x', 'zèbre', 1), element('y', 'Éléphant', 1))).toEqual(['y', 'x']);
    expect(trier(element('2', 'Même', 1), element('1', 'même', 1))).toEqual(['1', '2']);
    expect(comparerOrdreReference(element('1', 'Même', 1), element('1', 'même', 1))).toBe(0);
  });

  it('UT-COMP-US-001-22 un élément sans délai vient après tout élément avec délai', () => {
    const avec = element('avec', 'B', 5, '2027-01-01');
    const sans = element('sans', 'A', 1);

    expect(comparerOrdreReference(avec, sans)).toBeLessThan(0);
    expect(comparerOrdreReference(sans, avec)).toBeGreaterThan(0);
  });
});

describe('libelleIndicateur (guide §6.6.2)', () => {
  it('UT-COMP-US-001-23 SYN-INFO, SYN-ATTENTE et SYN-HORS-LIGNE (avec et sans attente) donnent le libellé visible', () => {
    expect(libelleIndicateur({ code: 'SYN-INFO', aLire: 2 })).toBe('À jour · 2 informations');
    expect(libelleIndicateur({ code: 'SYN-INFO' })).toBe('À jour · 0 information');
    expect(libelleIndicateur({ code: 'SYN-ATTENTE', n: 3 })).toBe('3 modifications à envoyer');
    expect(libelleIndicateur({ code: 'SYN-ATTENTE' })).toBe('0 modification à envoyer');
    expect(libelleIndicateur({ code: 'SYN-HORS-LIGNE', n: 2 })).toBe('Hors ligne · 2 en attente');
    expect(libelleIndicateur({ code: 'SYN-HORS-LIGNE', n: 0 })).toBe('Hors ligne');
    expect(libelleIndicateur({ code: 'SYN-OK' })).toBe('À jour');
  });
});
