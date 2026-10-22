/** Plans d'écriture construits à la main, pour tester un DepotLocal sans planifierEcritures. */
import type { RegistreQuelconque } from '@src/synchronisation/domaine/ecriture';
import type { EtatLocal } from '@src/synchronisation/domaine/etat-local';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import type { Hlc } from '@src/synchronisation/domaine/hlc';
import type { PlanEcriture } from '@src/synchronisation/domaine/planifier-ecritures';
import { texteDeCle, type EntreeIndexTest } from './fabriques/etat-local';

export const planVide = (etat: EtatLocal): PlanEcriture => ({
  etatApres: etat,
  registresEcrits: [],
  evenementsAjoutes: [],
  enAttenteEcrites: [],
  enAttenteRetirees: [],
});

export const planAjoutant = (
  etat: EtatLocal,
  ajouts: {
    readonly registres?: ReadonlyArray<RegistreQuelconque>;
    readonly evenements?: ReadonlyArray<EvenementJournal>;
    readonly enAttente?: ReadonlyArray<EntreeIndexTest>;
    readonly dernierHlc: Hlc;
  },
): PlanEcriture => {
  const registres = new Map(etat.registres);
  for (const r of ajouts.registres ?? []) registres.set(texteDeCle(r.cle), r);
  const journal = new Map(etat.journal);
  for (const e of ajouts.evenements ?? []) journal.set(e.id, e);
  const enAttente = new Map(etat.enAttente);
  for (const e of ajouts.enAttente ?? []) {
    enAttente.set(texteDeCle(e.cle), {
      cle: e.cle,
      entree: { premiereEcriture: e.premiereEcriture, derniereHlc: e.derniereHlc },
    });
  }
  return {
    etatApres: { ...etat, registres, journal, enAttente, dernierHlc: ajouts.dernierHlc },
    registresEcrits: ajouts.registres ?? [],
    evenementsAjoutes: ajouts.evenements ?? [],
    enAttenteEcrites: (ajouts.enAttente ?? []).map((e) => texteDeCle(e.cle)),
    enAttenteRetirees: [],
  };
};
