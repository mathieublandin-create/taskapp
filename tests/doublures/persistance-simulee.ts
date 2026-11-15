import type {
  EtatPersistance,
  PersistanceStockage,
} from '@src/commun/application/ports/persistance-stockage';

/**
 * Persistance du stockage du banc et des tests (ST-US-018 v0.4 §11.3) : `etat()` rend l'état courant ; `demander()`
 * rend `reponseALaDemande` et, si elle vaut `PERSISTANT`, en fait l'état courant (comme Chrome). Appels comptés.
 */
export class PersistanceSimulee implements PersistanceStockage {
  appelsEtat = 0;
  appelsDemander = 0;

  constructor(
    private etatCourant: EtatPersistance = 'PERSISTANT',
    private readonly reponseALaDemande: EtatPersistance = 'PERSISTANT',
  ) {}

  etat(): Promise<EtatPersistance> {
    this.appelsEtat += 1;
    return Promise.resolve(this.etatCourant);
  }

  demander(): Promise<EtatPersistance> {
    this.appelsDemander += 1;
    if (this.reponseALaDemande === 'PERSISTANT') this.etatCourant = 'PERSISTANT';
    return Promise.resolve(this.reponseALaDemande);
  }

  /** Le navigateur accorde (ou retire) la persistance hors de toute demande de l'application. */
  changerEtat(etat: EtatPersistance): void {
    this.etatCourant = etat;
  }
}
