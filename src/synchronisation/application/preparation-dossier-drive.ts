import type { Planificateur } from '../../commun/application/ports/planificateur';
import type { SourceAleatoire } from '../../commun/application/ports/source-aleatoire';
import { echec, succes, type Resultat } from '../../commun/domaine/resultat';
import { executerAvecReprise } from '../../infrastructure-google';
import type { ErreurTransport, TransportSynchro } from './ports/transport-synchro';

// ST-US-022 §6.8 : au plus 3 essais (reprise sur ServeurIndisponible et ReseauIndisponible), attentes par
// delaiAvantTentative(n, aleatoire.entierEntre(0, 999) / 1000) ; DriveIndisponible sans reprise.
// Erreurs alignées sur le port compte PreparationStockage (adapté par la composition).
export type ErreurPreparationDossier =
  | { readonly type: 'DriveIndisponiblePourLeCompte' }
  | { readonly type: 'DriveMomentanementIndisponible' }
  | { readonly type: 'ReseauInterrompu' };

export type DependancesPreparationDossier = {
  readonly transport: Pick<TransportSynchro, 'preparerDossier'>;
  readonly planificateur: Planificateur;
  readonly aleatoire: SourceAleatoire;
};

const estTransitoire = (erreur: ErreurTransport): boolean =>
  erreur.type === 'ServeurIndisponible' || erreur.type === 'ReseauIndisponible';

/** Toute autre erreur (401, Drive plein, introuvable…) rend la connexion momentanément impossible (ERR-005). */
const traduire = (erreur: ErreurTransport): ErreurPreparationDossier => {
  if (erreur.type === 'DriveIndisponible') return { type: 'DriveIndisponiblePourLeCompte' };
  if (erreur.type === 'ReseauIndisponible') return { type: 'ReseauInterrompu' };
  return { type: 'DriveMomentanementIndisponible' };
};

export class PreparationDossierDrive {
  constructor(private readonly dependances: DependancesPreparationDossier) {}

  async preparer(): Promise<Resultat<undefined, ErreurPreparationDossier>> {
    const { transport, planificateur, aleatoire } = this.dependances;
    const resultat = await executerAvecReprise(() => transport.preparerDossier(), {
      planificateur,
      aleatoire,
      estTransitoire,
    });
    return resultat.ok ? succes(undefined) : echec(traduire(resultat.erreur));
  }
}
