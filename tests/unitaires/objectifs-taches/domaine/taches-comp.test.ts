import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { actionsTache } from '@src/objectifs-taches/domaine/actions';
import { alertesDelaiTache } from '@src/objectifs-taches/domaine/alertes-delai';
import {
  deciderModificationDelaiTache,
  deciderModificationEstimation,
  deciderRenommageTache,
} from '@src/objectifs-taches/domaine/decisions/modifier-tache';
import {
  deciderDetachement,
  deciderRattachement,
} from '@src/objectifs-taches/domaine/decisions/rattacher-tache';
import {
  deciderSuppressionTache,
  evaluerSuppressionTache,
} from '@src/objectifs-taches/domaine/decisions/supprimer-tache';
import { estimationEnVigueur } from '@src/objectifs-taches/domaine/estimation';
import { validerSaisieTache } from '@src/objectifs-taches/domaine/saisie-tache';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { abandonnee, etatMetier } from '@tests/support/fabriques/etat-metier';
import { contexteDecision } from '@tests/support/horloge';
import { date, duree, idObjectif, idTache } from '@tests/support/valeurs';

const T = idTache(1);
const PARENTE = idTache(2);
const SOUS = idTache(3);
const INCONNUE = idTache(99);
const O = idObjectif(1);
const contexte = contexteDecision('2026-10-21T08:00:00.000Z', '2026-10-21');

const vue = () =>
  construireVueMetier(
    etatMetier()
      .avecObjectif({ id: O, intitule: 'Publier le guide', delai: '2026-11-20' })
      .avecTache({ id: T, intitule: 'Rédiger', delai: '2026-11-30', objectifs: [O] })
      .avecTache({ id: PARENTE, intitule: 'Chapitre 1', delai: '2026-11-30', objectifs: [O] })
      .avecTache({ id: SOUS, intitule: 'Section A', delai: '2026-12-05', tacheParenteId: PARENTE })
      .construire(),
  );

const introuvable = (id: typeof T) =>
  echec({ type: 'ElementIntrouvable', element: { type: 'TACHE', id } });

describe('Tâches — compléments du domaine (US-002)', () => {
  it('UT-COMP-US-002-01 actionsTache — retire l’estimation d’une tâche qui a des sous-tâches, le rattachement et la création de sous-tâche d’une sous-tâche ; aucune action pour une tâche inconnue', () => {
    expect(actionsTache(vue(), T)).toEqual([
      'RENOMMER',
      'MODIFIER_DELAI',
      'MODIFIER_ESTIMATION',
      'RATTACHER',
      'DETACHER',
      'CREER_SOUS_TACHE',
      'SUPPRIMER',
    ]);
    expect(actionsTache(vue(), PARENTE)).not.toContain('MODIFIER_ESTIMATION');
    expect(actionsTache(vue(), SOUS)).toEqual([
      'RENOMMER',
      'MODIFIER_DELAI',
      'MODIFIER_ESTIMATION',
      'SUPPRIMER',
    ]);
    expect(actionsTache(vue(), INCONNUE)).toEqual([]);
  });

  it('UT-COMP-US-002-02 alertesDelaiTache — aucune alerte pour une tâche inconnue ; une sous-tâche dépasse l’objectif hérité et sa tâche parente (ALR-005 puis ALR-006)', () => {
    expect(alertesDelaiTache(vue(), INCONNUE)).toEqual([]);
    expect(alertesDelaiTache(vue(), SOUS)).toEqual([
      {
        type: 'OBJECTIFS',
        objectifs: [{ id: O, intitule: 'Publier le guide', delai: date('2026-11-20') }],
      },
      {
        type: 'TACHE_PARENTE',
        tache: { id: PARENTE, intitule: 'Chapitre 1', delai: date('2026-11-30') },
      },
    ]);
  });

  it('UT-COMP-US-002-03 estimationEnVigueur — somme les sous-tâches non abandonnées ; une tâche inconnue vaut 0 h, non calculée', () => {
    const avecAbandon = construireVueMetier(
      etatMetier()
        .avecTache({ id: PARENTE, estimationMinutes: 180 })
        .avecTache({ id: SOUS, tacheParenteId: PARENTE, estimationMinutes: 60 })
        .avecTache({
          id: idTache(4),
          tacheParenteId: PARENTE,
          estimationMinutes: 90,
          cycleDeVie: abandonnee('2026-10-20', 'op:0'),
        })
        .construire(),
    );

    expect(estimationEnVigueur(avecAbandon, PARENTE)).toEqual({ duree: duree(60), calculee: true });
    expect(estimationEnVigueur(vue(), INCONNUE)).toEqual({ duree: duree(0), calculee: false });
  });

  it('UT-COMP-US-002-04 validerSaisieTache — cumule intitulé vide, délai absent et estimation absente dans l’ordre', () => {
    expect(validerSaisieTache({ intitule: ' ' })).toEqual(
      echec({
        type: 'SaisieInvalide',
        defauts: ['INTITULE_VIDE', 'DELAI_ABSENT', 'ESTIMATION_ABSENTE'],
      }),
    );
  });

  it('UT-COMP-US-002-05 décisions de modification — une tâche inconnue est introuvable ; renommer à l’identique ne modifie rien ; un intitulé vide est refusé', () => {
    const aucune = succes({ modifications: [], valeur: undefined });

    expect(deciderRenommageTache({ tacheId: INCONNUE, intitule: 'X' })(vue(), contexte)).toEqual(
      introuvable(INCONNUE),
    );
    expect(
      deciderModificationDelaiTache({ tacheId: INCONNUE, delai: date('2026-12-01') })(
        vue(),
        contexte,
      ),
    ).toEqual(introuvable(INCONNUE));
    expect(
      deciderModificationEstimation({ tacheId: INCONNUE, estimationMinutes: 60 })(vue(), contexte),
    ).toEqual(introuvable(INCONNUE));
    expect(deciderRenommageTache({ tacheId: T, intitule: ' Rédiger ' })(vue(), contexte)).toEqual(
      aucune,
    );
    expect(deciderRenommageTache({ tacheId: T, intitule: '  ' })(vue(), contexte)).toEqual(
      echec({ type: 'SaisieInvalide', defauts: ['INTITULE_VIDE'] }),
    );
    expect(deciderRenommageTache({ tacheId: T, intitule: 'Relire' })(vue(), contexte)).toEqual(
      succes({
        modifications: [
          { type: 'ECRIRE_TACHE', id: T, ecriture: { champ: 'intitule', valeur: 'Relire' } },
        ],
        valeur: undefined,
      }),
    );
  });

  it('UT-COMP-US-002-06 rattachement — tâche ou objectif inconnu est introuvable (la tâche d’abord)', () => {
    expect(deciderRattachement({ tacheId: INCONNUE, objectifId: O })(vue(), contexte)).toEqual(
      introuvable(INCONNUE),
    );
    expect(deciderDetachement({ tacheId: T, objectifId: idObjectif(99) })(vue(), contexte)).toEqual(
      echec({ type: 'ElementIntrouvable', element: { type: 'OBJECTIF', id: idObjectif(99) } }),
    );
  });

  it('UT-COMP-US-002-07 suppression — une tâche inconnue est introuvable, à l’évaluation comme à la décision', () => {
    expect(evaluerSuppressionTache({ tacheId: INCONNUE })(vue())).toEqual(introuvable(INCONNUE));
    expect(deciderSuppressionTache({ tacheId: INCONNUE })(vue(), contexte)).toEqual(
      introuvable(INCONNUE),
    );
  });
});
