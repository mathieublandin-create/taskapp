/** Horloge simulée positionnée, pour les tests des modèles de vue et des requêtes. */
import type { Fuseau } from '@src/commun/domaine/temps/fuseau';
import type { ContexteDecision } from '@src/synchronisation/application/service-etat-local';
import { HorlogeSimulee } from '../doublures/horloge-simulee';
import { TempsSimule } from './banc/temps-simule';
import { date, idOperation, instant, PARIS } from './valeurs';

export const horlogeSur = (iso: string, fuseauAppareil: Fuseau = PARIS): HorlogeSimulee => {
  const horloge = new HorlogeSimulee(new TempsSimule(instant(iso)));
  horloge.reglerFuseauAppareil(fuseauAppareil);
  return horloge;
};

/** Contexte d'une décision : instant, jour de Paris (fourni, non recalculé) et opération n° 1. */
export const contexteDecision = (iso: string, jourDeParis: string): ContexteDecision => ({
  instant: instant(iso),
  jour: date(jourDeParis),
  operation: idOperation(1),
});
