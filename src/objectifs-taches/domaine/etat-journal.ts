import type { CycleDeVie, EtatJournal } from '../../synchronisation';

// ST-US-003 §4.1 : A_FAIRE → { A_FAIRE } ; TERMINEE → { TERMINEE, dateFin } ; ABANDONNEE → { ABANDONNEE, dateAbandon }.
export const etatJournalDe = (cycleDeVie: CycleDeVie): EtatJournal => {
  switch (cycleDeVie.etat) {
    case 'A_FAIRE':
      return { etat: 'A_FAIRE' };
    case 'TERMINEE':
      return { etat: 'TERMINEE', dateFin: cycleDeVie.dateFin };
    case 'ABANDONNEE':
      return { etat: 'ABANDONNEE', dateAbandon: cycleDeVie.dateAbandon };
  }
};
