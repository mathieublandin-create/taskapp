import type { IdAppareil } from '../../../commun/domaine/identifiants';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { ErreurMemoireTechnique } from './memoire-redirection';

// DAT §4.1.4 : un appareilId par installation (profil de navigateur), créé au premier appel.
export interface RegistreAppareil {
  obtenirIdentifiant(): Promise<Resultat<IdAppareil, ErreurMemoireTechnique>>;
}
