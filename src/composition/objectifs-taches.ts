import type { GenerateurIdentifiants } from '../commun/application/ports/generateur-identifiants';
import type { Horloge } from '../commun/application/ports/horloge';
import type { Planificateur } from '../commun/application/ports/planificateur';
import {
  ConsulterDetailObjectif,
  ConsulterDetailTache,
  ConsulterHistorique,
  ConsulterObjectifs,
  ConsulterSelecteurParent,
  ConsulterTaches,
  CreerObjectif,
  CreerSousObjectif,
  CreerSousTache,
  CreerTache,
  DetacherTache,
  ModifierDelaiObjectif,
  ModifierDelaiTache,
  ModifierDescriptionObjectif,
  ModifierEstimationTache,
  PlacerObjectif,
  RattacherTache,
  RendreObjectifPrincipal,
  RenommerObjectif,
  RenommerTache,
  RetirerDelaiObjectif,
  RouvrirTache,
  SupprimerObjectif,
  SupprimerTache,
  TerminerTache,
} from '../objectifs-taches';
import type { ServiceEtatLocal } from '../synchronisation';

// Cas d'usage et requêtes du contexte objectifs-taches (ST-US-001 §3 n° 34), assemblés sur l'espace du compte ouvert.
export type ObjectifsTaches = {
  readonly horloge: Horloge;
  readonly creerObjectif: CreerObjectif;
  readonly creerSousObjectif: CreerSousObjectif;
  readonly placerObjectif: PlacerObjectif;
  readonly rendreObjectifPrincipal: RendreObjectifPrincipal;
  readonly renommerObjectif: RenommerObjectif;
  readonly modifierDescriptionObjectif: ModifierDescriptionObjectif;
  readonly modifierDelaiObjectif: ModifierDelaiObjectif;
  readonly retirerDelaiObjectif: RetirerDelaiObjectif;
  readonly supprimerObjectif: SupprimerObjectif;
  readonly creerTache: CreerTache;
  readonly creerSousTache: CreerSousTache;
  readonly renommerTache: RenommerTache;
  readonly modifierDelaiTache: ModifierDelaiTache;
  readonly modifierEstimationTache: ModifierEstimationTache;
  readonly rattacherTache: RattacherTache;
  readonly detacherTache: DetacherTache;
  readonly supprimerTache: SupprimerTache;
  readonly terminerTache: TerminerTache;
  readonly rouvrirTache: RouvrirTache;
  readonly consulterObjectifs: ConsulterObjectifs;
  readonly consulterTaches: ConsulterTaches;
  readonly consulterDetailTache: ConsulterDetailTache;
  readonly consulterDetailObjectif: ConsulterDetailObjectif;
  readonly consulterSelecteurParent: ConsulterSelecteurParent;
  readonly consulterHistorique: ConsulterHistorique;
  /** Changements du dépôt local, quel qu'en soit l'écrivain (DT-009) ; obligatoire à l'assemblage (RC-R3-11). */
  readonly observer: (rappel: () => void) => () => void;
  /** Maintien de 3 s de la ligne d'une tâche terminée (ST-US-003 §4.5) ; sans lui, la ligne quitte la liste aussitôt. */
  readonly planificateur?: Planificateur;
};

type Dependances = {
  readonly service: ServiceEtatLocal;
  readonly generateur: GenerateurIdentifiants;
  readonly horloge: Horloge;
  readonly observer: (rappel: () => void) => () => void;
  readonly planificateur?: Planificateur;
};

/** Cas d'usage et requêtes des tâches (ST-US-002 §3 n° 20). */
const assemblerTaches = (d: Dependances) => ({
  creerTache: new CreerTache(d.service, d.generateur),
  creerSousTache: new CreerSousTache(d.service, d.generateur),
  renommerTache: new RenommerTache(d.service),
  modifierDelaiTache: new ModifierDelaiTache(d.service),
  modifierEstimationTache: new ModifierEstimationTache(d.service),
  rattacherTache: new RattacherTache(d.service),
  detacherTache: new DetacherTache(d.service),
  supprimerTache: new SupprimerTache(d.service),
  terminerTache: new TerminerTache(d.service),
  rouvrirTache: new RouvrirTache(d.service),
  consulterTaches: new ConsulterTaches(d.service, d.horloge),
  consulterDetailTache: new ConsulterDetailTache(d.service, d.horloge),
});

export const assemblerObjectifsTaches = (d: Dependances): ObjectifsTaches => ({
  horloge: d.horloge,
  creerObjectif: new CreerObjectif(d.service, d.generateur),
  creerSousObjectif: new CreerSousObjectif(d.service, d.generateur),
  placerObjectif: new PlacerObjectif(d.service),
  rendreObjectifPrincipal: new RendreObjectifPrincipal(d.service),
  renommerObjectif: new RenommerObjectif(d.service),
  modifierDescriptionObjectif: new ModifierDescriptionObjectif(d.service),
  modifierDelaiObjectif: new ModifierDelaiObjectif(d.service),
  retirerDelaiObjectif: new RetirerDelaiObjectif(d.service),
  supprimerObjectif: new SupprimerObjectif(d.service),
  ...assemblerTaches(d),
  consulterObjectifs: new ConsulterObjectifs(d.service, d.horloge),
  consulterDetailObjectif: new ConsulterDetailObjectif(d.service, d.horloge),
  consulterSelecteurParent: new ConsulterSelecteurParent(d.service, d.horloge),
  consulterHistorique: new ConsulterHistorique(d.service),
  observer: d.observer,
  ...(d.planificateur === undefined ? {} : { planificateur: d.planificateur }),
});
