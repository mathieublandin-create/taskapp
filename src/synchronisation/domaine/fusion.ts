import type { ContenuFichierAppareil } from './contenu-fichier';
import type { RegistreQuelconque } from './ecriture';
import type { EtatLocal } from './etat-local';
import type { EvenementJournal } from './evenement-journal';
import { comparerHlc, maxHlc, type Hlc } from './hlc';
import type { IdEvenement } from './identifiant-evenement';
import { cleEnTexte, type CleTexte } from './information';
import { joindrePierresTombales } from './pierre-tombale';
import type { PlanEcriture } from './planifier-ecritures';

// ADR-003, DS-11, DAT §4.2 (ST-US-017 §6.1).
export type EtatFusionnable = {
  readonly registres: ReadonlyMap<CleTexte, RegistreQuelconque>;
  readonly journal: ReadonlyMap<IdEvenement, EvenementJournal>;
};

/** Vrai si l'écriture `candidate` l'emporte sur `actuelle` (HLC strictement plus grand, DS-11). */
const lEmporte = (candidate: RegistreQuelconque, actuelle: RegistreQuelconque | undefined) =>
  actuelle === undefined || comparerHlc(candidate.ecriture.hlc, actuelle.ecriture.hlc) > 0;

/**
 * Registre retenu pour une clé présente dans `actuelle` et/ou `candidate` : la plus grande écriture (DS-11), sauf
 * pour le champ `suppression`, présent des deux côtés, qui se fusionne par jointure (ST-US-017 v0.8 §6.6 n° 3 b).
 */
const fusionnerRegistre = (
  actuelle: RegistreQuelconque | undefined,
  candidate: RegistreQuelconque,
): RegistreQuelconque => {
  if (actuelle === undefined) return candidate;
  if (candidate.cle.champ === 'suppression') return joindrePierresTombales(actuelle, candidate);
  return lEmporte(candidate, actuelle) ? candidate : actuelle;
};

/** Union par identifiant (deux entrées de même identifiant sont identiques par construction, §6.1). */
const unirJournaux = (
  connu: ReadonlyMap<IdEvenement, EvenementJournal>,
  recu: Iterable<EvenementJournal>,
): ReadonlyMap<IdEvenement, EvenementJournal> => {
  const journal = new Map(connu);
  for (const evenement of recu) {
    if (!journal.has(evenement.id)) journal.set(evenement.id, evenement);
  }
  return journal;
};

/**
 * Par information : l'écriture de plus grand HLC (pierres tombales : jointure) ; journal : union. Commutative,
 * associative, idempotente (à l'égalité structurelle près).
 */
export const fusionnerEtats = (a: EtatFusionnable, b: EtatFusionnable): EtatFusionnable => {
  const registres = new Map(a.registres);
  for (const [cle, registre] of b.registres) {
    registres.set(cle, fusionnerRegistre(registres.get(cle), registre));
  }
  return { registres, journal: unirJournaux(a.journal, b.journal.values()) };
};

/** Plus grand HLC d'un fichier reçu (registres et journal) ; undefined s'il est vide. */
const plusGrandHlc = (recu: ContenuFichierAppareil): Hlc | undefined =>
  [...recu.registres.map((r) => r.ecriture.hlc), ...recu.journal.map((e) => e.hlc)].reduce<
    Hlc | undefined
  >((max, h) => (max === undefined ? h : maxHlc(max, h)), undefined);

const dernierHlcApres = (etat: EtatLocal, recu: ContenuFichierAppareil): Hlc | undefined => {
  const recuMax = plusGrandHlc(recu);
  if (recuMax === undefined || etat.dernierHlc === undefined) return etat.dernierHlc ?? recuMax;
  return maxHlc(etat.dernierHlc, recuMax);
};

/** Registres gagnants, entrées nouvelles, dernierHlc = max (réception, DAT §6.4) ; index inchangé. */
export const planifierFusion = (etat: EtatLocal, recu: ContenuFichierAppareil): PlanEcriture => {
  // §6.1 v0.8 : pour chaque registre reçu, le registre fusionné est écrit s'il n'est pas le registre local
  // (comparaison de référence : une jointure égale à la pierre tombale locale n'écrit rien).
  const registres = new Map(etat.registres);
  const registresEcrits: Array<RegistreQuelconque> = [];
  for (const r of recu.registres) {
    const cle = cleEnTexte(r.cle);
    const retenu = fusionnerRegistre(registres.get(cle), r);
    registres.set(cle, retenu);
    if (retenu !== etat.registres.get(cle)) registresEcrits.push(retenu);
  }
  const evenementsAjoutes = recu.journal.filter((e) => !etat.journal.has(e.id));
  const dernierHlc = dernierHlcApres(etat, recu);
  return {
    etatApres: {
      ...etat,
      ...(dernierHlc === undefined ? {} : { dernierHlc }),
      registres,
      journal: unirJournaux(etat.journal, recu.journal),
    },
    registresEcrits,
    evenementsAjoutes,
    enAttenteEcrites: [],
    enAttenteRetirees: [],
  };
};
