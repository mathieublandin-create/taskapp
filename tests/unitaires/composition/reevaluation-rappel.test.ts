/**
 * ST-US-018 v0.4 §6.2 (rang 12, tranche B1) ; RG-057, DEC-025 : la vue (indicateur et bandeau) est recalculée chaque
 * minute, pour qu'un rappel des 24 h apparaisse sans geste de l'utilisateur.
 */
import { describe, expect, it } from 'vitest';
import { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import { armerReevaluationRappel } from '@src/composition/reevaluation-rappel';
import { PERIODE_EVALUATION_RAPPEL_HORS_LIGNE } from '@src/synchronisation/domaine/parametres-synchronisation';
import { PlanificateurSimule } from '../../doublures/planificateur-simule';
import { TempsSimule } from '../../support/banc/temps-simule';
import { instant } from '../../support/valeurs';

const preparer = () => {
  const temps = new TempsSimule(instant('2026-10-22T08:00:00.000Z'));
  const planificateur = new PlanificateurSimule(temps);
  let appels = 0;
  const annuler = armerReevaluationRappel(planificateur, () => {
    appels += 1;
  });
  const avancer = (ms: number): void => {
    temps.avancer(EcartTemps.depuisMillisecondes(ms));
    planificateur.executerEchus();
  };
  return { annuler, avancer, appels: () => appels };
};

describe('armerReevaluationRappel (ST-US-018 §6.2)', () => {
  it('UT-US-018-09 période de 60 s (PERIODE_EVALUATION_RAPPEL_HORS_LIGNE) — aucun appel à l’armement ni à 59,999 s ; 1 à 60 s ; 2 à 120 s', () => {
    expect(PERIODE_EVALUATION_RAPPEL_HORS_LIGNE).toBe(60_000);
    const { avancer, appels } = preparer();

    expect(appels()).toBe(0);
    avancer(59_999);
    expect(appels()).toBe(0);
    avancer(1);
    expect(appels()).toBe(1);
    avancer(60_000);
    expect(appels()).toBe(2);
  });

  it('UT-US-018-09 annulation — plus aucun appel ensuite', () => {
    const { annuler, avancer, appels } = preparer();
    avancer(60_000);

    annuler();
    avancer(180_000);

    expect(appels()).toBe(1);
  });
});
