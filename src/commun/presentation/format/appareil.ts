// Guide §6.6.1 : `{appareil}` vaut « smartphone » ou « PC » (jamais « téléphone »). La PWA est unique (ADR-013) :
// l'appareil se déduit de l'agent du navigateur (tablettes tactiles comprises dans le smartphone).
export type NomAppareilAffiche = 'smartphone' | 'PC';

const AGENT_SMARTPHONE = /Android|iPhone|iPod|iPad|Mobile/;
const SEUIL_POINTS_TACTILES_MAC = 1;

export const appareilDepuisAgent = (agent: string, pointsTactiles: number): NomAppareilAffiche =>
  AGENT_SMARTPHONE.test(agent) ||
  (agent.includes('Macintosh') && pointsTactiles > SEUIL_POINTS_TACTILES_MAC)
    ? 'smartphone'
    : 'PC';

/** L'autre appareil de l'utilisateur (ERR-015 : « celles de votre {autre appareil} »). */
export const autreAppareil = (appareil: NomAppareilAffiche): NomAppareilAffiche =>
  appareil === 'PC' ? 'smartphone' : 'PC';
