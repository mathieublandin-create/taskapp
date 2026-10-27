import { nonImplemente } from '@non-implemente';
import type { Planificateur } from '../../commun/application/ports/planificateur';
import type { SourceAleatoire } from '../../commun/application/ports/source-aleatoire';
import type { Resultat } from '../../commun/domaine/resultat';
import type { TransportSynchro } from './ports/transport-synchro';

// ST-US-022 §6.8 : au plus 3 essais (reprise sur ServeurIndisponible et ReseauIndisponible), attentes par
// delaiAvantTentative(n, aleatoire.entierEntre(0, 999) / 1000) ; DriveIndisponible sans reprise.
// Erreurs alignées sur le port compte PreparationStockage (adapté par la composition).
export type ErreurPreparationDossier =
  | { readonly type: 'DriveIndisponiblePourLeCompte' }
  | { readonly type: 'DriveMomentanementIndisponible' }
  | { readonly type: 'ReseauInterrompu' };

export type DependancesPreparationDossier = {
  readonly transport: TransportSynchro;
  readonly planificateur: Planificateur;
  readonly aleatoire: SourceAleatoire;
};

export class PreparationDossierDrive {
  constructor(private readonly dependances: DependancesPreparationDossier) {}

  preparer(): Promise<Resultat<undefined, ErreurPreparationDossier>> {
    return nonImplemente('PreparationDossierDrive.preparer');
  }
}
