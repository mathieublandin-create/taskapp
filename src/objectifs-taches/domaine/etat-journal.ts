import { nonImplemente } from '@non-implemente';
import type { CycleDeVie, EtatJournal } from '../../synchronisation';

// ST-US-003 §4.1 : A_FAIRE → { A_FAIRE } ; TERMINEE → { TERMINEE, dateFin } ; ABANDONNEE → { ABANDONNEE, dateAbandon }.
export const etatJournalDe = (_c: CycleDeVie): EtatJournal => nonImplemente('etatJournalDe');
