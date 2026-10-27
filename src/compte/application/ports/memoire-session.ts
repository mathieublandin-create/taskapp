import type { Resultat } from '../../../commun/domaine/resultat';
import type { Identite } from '../../domaine/identite';
import type { ErreurMemoireTechnique } from './memoire-redirection';

// DAT §4.1.4 : identité mise en cache pour rouvrir la session sans réseau (CA-5).
export type SessionMemorisee = { readonly identite: Identite; readonly accesPerdu: boolean };

export interface MemoireSession {
  lire(): Promise<SessionMemorisee | undefined>;
  ecrire(session: SessionMemorisee): Promise<Resultat<undefined, ErreurMemoireTechnique>>;
  effacer(): Promise<void>;
}
