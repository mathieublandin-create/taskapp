/**
 * Fabrique d'EtatMetier pour les tests du domaine `objectifs-taches` (ST-US-001 §3 n° 35) :
 * `etatMetier().avecObjectif(…).avecTache(…).construire()`. Valeurs par défaut valides ; l'ordre
 * d'ajout fixe l'instant de création (une minute d'écart entre deux éléments).
 */
import type { IdObjectif, IdTache } from '@src/commun/domaine/identifiants';
import type { DateCalendaire } from '@src/commun/domaine/temps/date-calendaire';
import type { Instant } from '@src/commun/domaine/temps/instant';
import type {
  CycleDeVie,
  EtatMetier,
  ObjectifEnregistre,
  TacheEnregistree,
} from '@src/synchronisation/domaine/etat-metier';
import type { IdEvenement } from '@src/synchronisation/domaine/identifiant-evenement';
import { date, duree, instant, MINUTE } from '../valeurs';

const ORIGINE_CREATIONS = instant('2026-10-01T08:00:00.000Z');

export const aFaire = (): CycleDeVie => ({ etat: 'A_FAIRE' });
export const terminee = (dateFin: string, instantFin?: string): CycleDeVie => ({
  etat: 'TERMINEE',
  dateFin: date(dateFin),
  instantFin: instant(instantFin ?? `${dateFin}T10:00:00.000Z`),
});
export const abandonnee = (
  dateAbandon: string,
  evenementAbandon: string,
  options: { readonly abandonParCascade?: string; readonly instant?: string } = {},
): CycleDeVie => ({
  etat: 'ABANDONNEE',
  dateAbandon: date(dateAbandon),
  instantAbandon: instant(options.instant ?? `${dateAbandon}T10:00:00.000Z`),
  evenementAbandon: evenementAbandon as IdEvenement,
  ...(options.abandonParCascade === undefined
    ? {}
    : { abandonParCascade: options.abandonParCascade as IdEvenement }),
});

export type ObjectifTest = {
  readonly id: IdObjectif;
  readonly intitule?: string;
  readonly description?: string;
  readonly delai?: string;
  readonly parentIdEnregistre?: IdObjectif;
  readonly creeLe?: Instant;
  readonly supprime?: boolean;
  readonly enAttente?: boolean;
};

export type TacheTest = {
  readonly id: IdTache;
  readonly intitule?: string;
  readonly delai?: string;
  readonly estimationMinutes?: number;
  readonly cycleDeVie?: CycleDeVie;
  readonly tacheParenteId?: IdTache;
  readonly objectifs?: ReadonlyArray<IdObjectif>;
  readonly creeLe?: Instant;
  readonly supprime?: boolean;
  readonly enAttente?: boolean;
};

const DELAI_PAR_DEFAUT = '2026-12-31';
const ESTIMATION_PAR_DEFAUT_MINUTES = 60;

class ConstructeurEtatMetier {
  private readonly objectifs = new Map<IdObjectif, ObjectifEnregistre>();
  private readonly taches = new Map<IdTache, TacheEnregistree>();
  private rang = 0;

  avecObjectif(o: ObjectifTest): this {
    const delai: DateCalendaire | undefined = o.delai === undefined ? undefined : date(o.delai);
    this.objectifs.set(o.id, {
      id: o.id,
      intitule: o.intitule ?? `Objectif ${o.id}`,
      ...(o.description === undefined ? {} : { description: o.description }),
      ...(delai === undefined ? {} : { delai }),
      ...(o.parentIdEnregistre === undefined ? {} : { parentIdEnregistre: o.parentIdEnregistre }),
      creeLe: o.creeLe ?? this.prochainInstant(),
      supprime: o.supprime ?? false,
      enAttente: o.enAttente ?? false,
    });
    return this;
  }

  avecTache(t: TacheTest): this {
    this.taches.set(t.id, {
      id: t.id,
      intitule: t.intitule ?? `Tâche ${t.id}`,
      delai: date(t.delai ?? DELAI_PAR_DEFAUT),
      estimationInitiale: duree(t.estimationMinutes ?? ESTIMATION_PAR_DEFAUT_MINUTES),
      cycleDeVie: t.cycleDeVie ?? aFaire(),
      ...(t.tacheParenteId === undefined ? {} : { tacheParenteId: t.tacheParenteId }),
      objectifIdsActifs: t.objectifs ?? [],
      creeLe: t.creeLe ?? this.prochainInstant(),
      supprime: t.supprime ?? false,
      enAttente: t.enAttente ?? false,
    });
    return this;
  }

  construire(): EtatMetier {
    return { objectifs: new Map(this.objectifs), taches: new Map(this.taches) };
  }

  private prochainInstant(): Instant {
    this.rang += 1;
    return (ORIGINE_CREATIONS + this.rang * MINUTE) as Instant;
  }
}

export const etatMetier = (): ConstructeurEtatMetier => new ConstructeurEtatMetier();
