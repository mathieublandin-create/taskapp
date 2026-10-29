import type { GenerateurIdentifiants } from '../commun/application/ports/generateur-identifiants';
import type { Horloge } from '../commun/application/ports/horloge';
import {
  ConsulterDetailObjectif,
  ConsulterHistorique,
  ConsulterObjectifs,
  CreerObjectif,
  ModifierDelaiObjectif,
  ModifierDescriptionObjectif,
  RenommerObjectif,
  RetirerDelaiObjectif,
  SupprimerObjectif,
} from '../objectifs-taches';
import type { ServiceEtatLocal } from '../synchronisation';

// Cas d'usage et requêtes du contexte objectifs-taches (ST-US-001 §3 n° 34), assemblés sur l'espace du compte ouvert.
export type ObjectifsTaches = {
  readonly horloge: Horloge;
  readonly creerObjectif: CreerObjectif;
  readonly renommerObjectif: RenommerObjectif;
  readonly modifierDescriptionObjectif: ModifierDescriptionObjectif;
  readonly modifierDelaiObjectif: ModifierDelaiObjectif;
  readonly retirerDelaiObjectif: RetirerDelaiObjectif;
  readonly supprimerObjectif: SupprimerObjectif;
  readonly consulterObjectifs: ConsulterObjectifs;
  readonly consulterDetailObjectif: ConsulterDetailObjectif;
  readonly consulterHistorique: ConsulterHistorique;
};

export const assemblerObjectifsTaches = (d: {
  readonly service: ServiceEtatLocal;
  readonly generateur: GenerateurIdentifiants;
  readonly horloge: Horloge;
}): ObjectifsTaches => ({
  horloge: d.horloge,
  creerObjectif: new CreerObjectif(d.service, d.generateur),
  renommerObjectif: new RenommerObjectif(d.service),
  modifierDescriptionObjectif: new ModifierDescriptionObjectif(d.service),
  modifierDelaiObjectif: new ModifierDelaiObjectif(d.service),
  retirerDelaiObjectif: new RetirerDelaiObjectif(d.service),
  supprimerObjectif: new SupprimerObjectif(d.service),
  consulterObjectifs: new ConsulterObjectifs(d.service, d.horloge),
  consulterDetailObjectif: new ConsulterDetailObjectif(d.service, d.horloge),
  consulterHistorique: new ConsulterHistorique(d.service),
});
