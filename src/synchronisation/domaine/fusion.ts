import type { ContenuFichierAppareil } from './contenu-fichier';
import type { RegistreQuelconque } from './ecriture';
import type { EtatLocal } from './etat-local';
import type { EvenementJournal } from './evenement-journal';
import { comparerHlc, maxHlc, type Hlc } from './hlc';
import type { IdEvenement } from './identifiant-evenement';
import { cleEnTexte, type CleTexte } from './information';
import type { PlanEcriture } from './planifier-ecritures';

// ADR-003, DS-11, DAT §4.2 (ST-US-017 §6.1).
export type EtatFusionnable = {
  readonly registres: ReadonlyMap<CleTexte, RegistreQuelconque>;
  readonly journal: ReadonlyMap<IdEvenement, EvenementJournal>;
};

/** Vrai si l'écriture `candidate` l'emporte sur `actuelle` (HLC strictement plus grand, DS-11). */
const lEmporte = (candidate: RegistreQuelconque, actuelle: RegistreQuelconque | undefined) =>
  actuelle === undefined || comparerHlc(candidate.ecriture.hlc, actuelle.ecriture.hlc) > 0;

/** Par information : l'écriture de plus grand HLC ; journal : union. Commutative, associative, idempotente. */
export const fusionnerEtats = (a: EtatFusionnable, b: EtatFusionnable): EtatFusionnable => {
  const registres = new Map(a.registres);
  for (const [cle, registre] of b.registres) {
    if (lEmporte(registre, registres.get(cle))) registres.set(cle, registre);
  }
  const journal = new Map(a.journal);
  for (const [id, evenement] of b.journal) {
    if (!journal.has(id)) journal.set(id, evenement);
  }
  return { registres, journal };
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
  const fusion = fusionnerEtats(etat, {
    registres: new Map(recu.registres.map((r) => [cleEnTexte(r.cle), r])),
    journal: new Map(recu.journal.map((e) => [e.id, e])),
  });
  const registresEcrits = recu.registres.filter((r) =>
    lEmporte(r, etat.registres.get(cleEnTexte(r.cle))),
  );
  const evenementsAjoutes = recu.journal.filter((e) => !etat.journal.has(e.id));
  const dernierHlc = dernierHlcApres(etat, recu);
  return {
    etatApres: {
      ...etat,
      ...(dernierHlc === undefined ? {} : { dernierHlc }),
      registres: fusion.registres,
      journal: fusion.journal,
    },
    registresEcrits,
    evenementsAjoutes,
    enAttenteEcrites: [],
    enAttenteRetirees: [],
  };
};
