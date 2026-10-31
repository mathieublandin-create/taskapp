import type { Duree } from '../../domaine/duree';

// Guide §8 : « 0 h », « 30 min », « 1 h », « 1 h 30 ».
const MINUTES_PAR_HEURE = 60;

export const formaterDuree = (d: Duree): string => {
  const heures = String(Math.floor(d / MINUTES_PAR_HEURE));
  const minutes = d % MINUTES_PAR_HEURE;
  if (heures === '0') return minutes === 0 ? '0 h' : `${String(minutes)} min`;
  return minutes === 0 ? `${heures} h` : `${heures} h ${String(minutes)}`;
};
