import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { deciderCreationObjectif } from '@src/objectifs-taches/domaine/decisions/creer-objectif';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { etatMetier } from '@tests/support/fabriques/etat-metier';
import { contexteDecision } from '@tests/support/horloge';
import { date, idObjectif, instant } from '@tests/support/valeurs';

const O = idObjectif(1);
const PARENT = idObjectif(2);
const MAINTENANT = '2026-10-21T08:00:00.000Z';
const contexte = contexteDecision(MAINTENANT, '2026-10-21');
const vueVide = () => construireVueMetier(etatMetier().construire());

describe('deciderCreationObjectif (US-001 CA-1, CA-2 ; US-023 CA-1)', () => {
  it('UT-US-001-14 deciderCreationObjectif — produit CREER_OBJECTIF avec l’intitulé et la description normalisés, creeLe = instant, et l’événement CREATION de rang 0 (RG-050)', () => {
    const decision = deciderCreationObjectif({
      id: O,
      intitule: '  Publier le guide ',
      description: '  Format A5  ',
      delai: date('2026-12-15'),
    });

    const resultat = decision(vueVide(), contexte);

    expect(resultat).toEqual(
      succes({
        modifications: [
          {
            type: 'CREER_OBJECTIF',
            id: O,
            creeLe: instant(MAINTENANT),
            valeurs: {
              intitule: 'Publier le guide',
              description: 'Format A5',
              delai: date('2026-12-15'),
            },
            evenement: {
              type: 'CREATION',
              element: { type: 'OBJECTIF', id: O },
              avant: {},
              apres: { delai: date('2026-12-15') },
              rang: 0,
            },
          },
        ],
        valeur: O,
      }),
    );
  });

  it('UT-US-001-15 deciderCreationObjectif — refuse un intitulé composé d’espaces, sans modification (US-001 CA-1)', () => {
    const resultat = deciderCreationObjectif({ id: O, intitule: '  ' })(vueVide(), contexte);

    expect(resultat).toEqual(echec({ type: 'SaisieInvalide', defauts: ['INTITULE_VIDE'] }));
  });

  it('UT-US-001-16 deciderCreationObjectif — crée sans délai ni description, avec un événement dont l’après est vide (US-001 CA-2, RG-002)', () => {
    const resultat = deciderCreationObjectif({ id: O, intitule: 'Apprendre le piano' })(
      vueVide(),
      contexte,
    );

    expect(resultat).toEqual(
      succes({
        modifications: [
          {
            type: 'CREER_OBJECTIF',
            id: O,
            creeLe: instant(MAINTENANT),
            valeurs: { intitule: 'Apprendre le piano' },
            evenement: {
              type: 'CREATION',
              element: { type: 'OBJECTIF', id: O },
              avant: {},
              apres: {},
              rang: 0,
            },
          },
        ],
        valeur: O,
      }),
    );
  });

  it('UT-US-023-09 deciderCreationObjectif — crée un sous-objectif avec valeurs.parentId et CREATION apres { parentId } (US-023 CA-1, CA-11)', () => {
    const vue = construireVueMetier(etatMetier().avecObjectif({ id: PARENT }).construire());

    const resultat = deciderCreationObjectif({
      id: O,
      intitule: 'Version imprimable',
      parentId: PARENT,
    })(vue, contexte);

    expect(resultat).toEqual(
      succes({
        modifications: [
          {
            type: 'CREER_OBJECTIF',
            id: O,
            creeLe: instant(MAINTENANT),
            valeurs: { intitule: 'Version imprimable', parentId: PARENT },
            evenement: {
              type: 'CREATION',
              element: { type: 'OBJECTIF', id: O },
              avant: {},
              apres: { parentId: PARENT },
              rang: 0,
            },
          },
        ],
        valeur: O,
      }),
    );
  });

  it('UT-US-023-10 deciderCreationObjectif — refuse un parent qui est un sous-objectif (ActionNonDisponible) et un parent supprimé (ElementIntrouvable) (US-023 CA-3)', () => {
    const sousObjectif = idObjectif(3);
    const supprime = idObjectif(4);
    const vue = construireVueMetier(
      etatMetier()
        .avecObjectif({ id: PARENT })
        .avecObjectif({ id: sousObjectif, parentIdEnregistre: PARENT })
        .avecObjectif({ id: supprime, supprime: true })
        .construire(),
    );

    expect(
      deciderCreationObjectif({ id: O, intitule: 'X', parentId: sousObjectif })(vue, contexte),
    ).toEqual(echec({ type: 'ActionNonDisponible', action: 'CREER_SOUS_OBJECTIF' }));
    expect(
      deciderCreationObjectif({ id: O, intitule: 'X', parentId: supprime })(vue, contexte),
    ).toEqual(echec({ type: 'ElementIntrouvable', element: { type: 'OBJECTIF', id: supprime } }));
  });
});
