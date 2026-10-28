import type { GenerateurIdentifiants } from '../../commun/application/ports/generateur-identifiants';
import type { Horloge } from '../../commun/application/ports/horloge';
import { IdOperation } from '../../commun/domaine/identifiants';
import { echec, succes, type Resultat } from '../../commun/domaine/resultat';
import { Instant } from '../../commun/domaine/temps/instant';
import { jourDeReference } from '../../commun/domaine/temps/jour-de-reference';
import type { EtatLocal } from '../domaine/etat-local';
import type { EtatMetier } from '../domaine/etat-metier';
import type { EvenementJournal } from '../domaine/evenement-journal';
import { comparerHlc } from '../domaine/hlc';
import {
  decompterModificationsEnAttente,
  plusAncienneModificationEnAttente,
} from '../domaine/index-en-attente';
import type { RefElementMetier } from '../domaine/information';
import { planifierEcritures } from '../domaine/planifier-ecritures';
import { projeterEtatMetier } from '../domaine/projection';
import type { DepotLocal, ErreurDepotLocal } from './ports/depot-local';
import type { DecisionMetier, ServiceEtatLocal } from './service-etat-local';

/** Dépendances injectées (DS-13 ; objet nommé, RCD-02). */
export type DependancesServiceEtatLocal = {
  readonly depot: DepotLocal;
  readonly horloge: Horloge;
  readonly generateur: GenerateurIdentifiants;
};

/** Ordre chronologique d'un historique : HLC croissant, puis identifiant en ordre ordinal (jamais localeCompare). */
const comparerEvenements = (a: EvenementJournal, b: EvenementJournal): number => {
  const parHlc = comparerHlc(a.hlc, b.hlc);
  if (parHlc !== 0) return parHlc;
  if (a.id === b.id) return 0;
  return a.id < b.id ? -1 : 1;
};

// ST-socle-ecriture.md §6.8.
export class ServiceEtatLocalTransactionnel implements ServiceEtatLocal {
  /** Dernière projection, mémorisée par `version` de l'état : aucun recalcul sans écriture (§6.6). */
  private projectionMemorisee:
    { readonly version: number; readonly metier: EtatMetier } | undefined;

  constructor(private readonly dependances: DependancesServiceEtatLocal) {}

  async lire(): Promise<Resultat<EtatMetier, ErreurDepotLocal>> {
    const etat = await this.dependances.depot.lire();
    return etat.ok ? succes(this.projeter(etat.valeur)) : etat;
  }

  async lireJournal(
    element: RefElementMetier,
  ): Promise<Resultat<ReadonlyArray<EvenementJournal>, ErreurDepotLocal>> {
    const etat = await this.dependances.depot.lire();
    if (!etat.ok) return etat;
    const evenements = [...etat.valeur.journal.values()].filter(
      (e) => e.element.type === element.type && e.element.id === element.id,
    );
    return succes(evenements.sort(comparerEvenements));
  }

  async lireDecompteEnAttente(): Promise<
    Resultat<{ readonly nombre: number; readonly plusAncienne?: Instant }, ErreurDepotLocal>
  > {
    const etat = await this.dependances.depot.lire();
    if (!etat.ok) return etat;
    const { enAttente } = etat.valeur;
    const plusAncienne = plusAncienneModificationEnAttente(enAttente);
    return succes({
      nombre: decompterModificationsEnAttente(enAttente),
      ...(plusAncienne === undefined ? {} : { plusAncienne }),
    });
  }

  modifier<T, E extends { readonly type: string }>(
    decision: DecisionMetier<T, E>,
  ): Promise<Resultat<T, E | ErreurDepotLocal>> {
    const { depot, horloge, generateur } = this.dependances;
    const operation = IdOperation.depuisUuid(generateur.genererUuidV7());
    const instant = horloge.maintenant();
    const jour = jourDeReference(instant);
    return depot.appliquer((etat) => {
      const resultat = decision(this.projeter(etat), { instant, jour, operation });
      if (!resultat.ok) return echec(resultat.erreur);
      const physiqueCorrigee = Instant.decaler(instant, etat.correctionHorloge);
      const plan = planifierEcritures(etat, resultat.valeur.modifications, {
        operation,
        instant,
        jour,
        physiqueCorrigee,
      });
      return succes({ plan, valeur: resultat.valeur.valeur });
    });
  }

  private projeter(etat: EtatLocal): EtatMetier {
    if (this.projectionMemorisee?.version !== etat.version) {
      this.projectionMemorisee = { version: etat.version, metier: projeterEtatMetier(etat) };
    }
    return this.projectionMemorisee.metier;
  }
}
