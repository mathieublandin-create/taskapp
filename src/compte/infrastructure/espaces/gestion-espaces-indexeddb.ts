import { nonImplemente } from '@non-implemente';
import type { Planificateur } from '../../../commun/application/ports/planificateur';
import type { Resultat } from '../../../commun/domaine/resultat';
import type { IdCompte } from '../../domaine/identite';
import type {
  ErreurEspace,
  ErreurSuppressionBloquee,
  GestionEspaces,
} from '../../application/ports/gestion-espaces';
import type { NomEnvironnement } from './nom-espace';

/**
 * ST-US-022 §4.4, §5.2, §6.6 ; DAT v0.11.4 §4.1.6 (RL-LOT-001-A1).
 * `surOuverture(nomBase)` : la composition ouvre l'espace (DepotLocalDexie.ouvrirEspace) ;
 * `surFermeture()` : la composition ferme l'espace ouvert (DepotLocalDexie.fermer).
 * `supprimer` : fermeture de l'espace ouvert, puis `deleteDatabase` ; bloquée plus de
 * DELAI_SUPPRESSION_BLOQUEE (Planificateur) → SuppressionBloquee, la demande restant en cours ;
 * un nouvel appel attend la même demande.
 */
export type OptionsGestionEspaces = {
  readonly env: NomEnvironnement;
  readonly fabrique?: IDBFactory;
  readonly planificateur: Planificateur;
  readonly surOuverture: (nomBase: string) => Promise<Resultat<undefined, ErreurEspace>>;
  readonly surFermeture: () => Promise<void>;
};

export class GestionEspacesIndexedDb implements GestionEspaces {
  constructor(private readonly options: OptionsGestionEspaces) {}

  ouvrir(_compte: IdCompte): Promise<Resultat<undefined, ErreurEspace>> {
    return nonImplemente('GestionEspacesIndexedDb.ouvrir');
  }

  fermer(): Promise<void> {
    return nonImplemente('GestionEspacesIndexedDb.fermer');
  }

  existeUnEspace(): Promise<boolean> {
    return nonImplemente('GestionEspacesIndexedDb.existeUnEspace');
  }

  supprimer(
    _compte: IdCompte,
  ): Promise<Resultat<undefined, ErreurEspace | ErreurSuppressionBloquee>> {
    return nonImplemente('GestionEspacesIndexedDb.supprimer');
  }
}
