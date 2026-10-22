import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import {
  deciderModificationDelaiObjectif,
  deciderModificationDescription,
  deciderRenommageObjectif,
  deciderRetraitDelaiObjectif,
} from '@src/objectifs-taches/domaine/decisions/modifier-objectif';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { etatMetier } from '@tests/support/fabriques/etat-metier';
import { contexteDecision } from '@tests/support/horloge';
import { date, idObjectif } from '@tests/support/valeurs';

const O = idObjectif(1);
const SANS_DELAI = idObjectif(2);
const contexte = contexteDecision('2026-10-21T08:00:00.000Z', '2026-10-21');
const vue = () =>
  construireVueMetier(
    etatMetier()
      .avecObjectif({
        id: O,
        intitule: 'Publier le guide',
        description: 'Format A5',
        delai: '2026-12-15',
      })
      .avecObjectif({ id: SANS_DELAI, intitule: 'Apprendre le piano' })
      .construire(),
  );
const aucuneModification = succes({ modifications: [], valeur: undefined });

describe('Modification d’un objectif (US-001 CA-5, RG-004)', () => {
  it('UT-US-001-17 deciderRenommageObjectif — écrit l’intitulé sans événement (RG-050 d)', () => {
    const resultat = deciderRenommageObjectif({ objectifId: O, intitule: ' Publier le guide v2 ' })(
      vue(),
      contexte,
    );

    expect(resultat).toEqual(
      succes({
        modifications: [
          {
            type: 'ECRIRE_OBJECTIF',
            id: O,
            ecriture: { champ: 'intitule', valeur: 'Publier le guide v2' },
          },
        ],
        valeur: undefined,
      }),
    );
  });

  it('UT-US-001-17 deciderRenommageObjectif — refuse un intitulé vide et ne modifie rien pour un intitulé identique', () => {
    expect(deciderRenommageObjectif({ objectifId: O, intitule: '   ' })(vue(), contexte)).toEqual(
      echec({ type: 'SaisieInvalide', defauts: ['INTITULE_VIDE'] }),
    );
    expect(
      deciderRenommageObjectif({ objectifId: O, intitule: 'Publier le guide' })(vue(), contexte),
    ).toEqual(aucuneModification);
  });

  it('UT-US-001-18 deciderModificationDescription — écrit la description normalisée, sans événement ; rien si identique', () => {
    expect(
      deciderModificationDescription({ objectifId: O, description: '  Format A4 ' })(
        vue(),
        contexte,
      ),
    ).toEqual(
      succes({
        modifications: [
          {
            type: 'ECRIRE_OBJECTIF',
            id: O,
            ecriture: { champ: 'description', valeur: 'Format A4' },
          },
        ],
        valeur: undefined,
      }),
    );
    expect(
      deciderModificationDescription({ objectifId: O, description: 'Format A5' })(vue(), contexte),
    ).toEqual(aucuneModification);
  });

  it('UT-US-001-19 deciderModificationDelaiObjectif — écrit le délai et l’événement MODIFICATION_DELAI ; rien pour le même délai (RG-050)', () => {
    expect(
      deciderModificationDelaiObjectif({ objectifId: O, delai: date('2027-01-31') })(
        vue(),
        contexte,
      ),
    ).toEqual(
      succes({
        modifications: [
          {
            type: 'ECRIRE_OBJECTIF',
            id: O,
            ecriture: { champ: 'delai', valeur: date('2027-01-31') },
            evenement: {
              type: 'MODIFICATION_DELAI',
              element: { type: 'OBJECTIF', id: O },
              avant: { delai: date('2026-12-15') },
              apres: { delai: date('2027-01-31') },
              rang: 0,
            },
          },
        ],
        valeur: undefined,
      }),
    );
    expect(
      deciderModificationDelaiObjectif({ objectifId: O, delai: date('2026-12-15') })(
        vue(),
        contexte,
      ),
    ).toEqual(aucuneModification);
  });

  it('UT-US-001-20 deciderRetraitDelaiObjectif — écrit un délai absent et l’événement avant { delai } après {} ; rien sans délai', () => {
    expect(deciderRetraitDelaiObjectif({ objectifId: O })(vue(), contexte)).toEqual(
      succes({
        modifications: [
          {
            type: 'ECRIRE_OBJECTIF',
            id: O,
            ecriture: { champ: 'delai', valeur: undefined },
            evenement: {
              type: 'MODIFICATION_DELAI',
              element: { type: 'OBJECTIF', id: O },
              avant: { delai: date('2026-12-15') },
              apres: {},
              rang: 0,
            },
          },
        ],
        valeur: undefined,
      }),
    );
    expect(deciderRetraitDelaiObjectif({ objectifId: SANS_DELAI })(vue(), contexte)).toEqual(
      aucuneModification,
    );
  });
});
