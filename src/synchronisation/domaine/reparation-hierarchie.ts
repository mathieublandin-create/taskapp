import type { IdObjectif } from '../../commun/domaine/identifiants';
import type { Instant } from '../../commun/domaine/temps/instant';
import { contexteDeNouvelleEcriture } from './contexte-causal';
import { estRegistre, type Registre, type RegistreQuelconque } from './ecriture';
import type { EtatLocal } from './etat-local';
import type { EvenementJournal } from './evenement-journal';
import { comparerHlc, hlcSuivant, type Hlc } from './hlc';
import type { PlacementObjectif } from './information';
import { idValeurEcartee, type ValeurEcartee } from './valeurs-ecartees';

// ST-US-017 v0.6 §6.6 n° 7 à 10 (n° 9 b à 9 d : entrée de journal, v0.6) ; RG-048 ; DAT §4.2 « hiérarchies »
// (réparation écrite et itérative, DEC-025).

export type ReparationHierarchie = {
  /** Un registre `parent` par objectif dont le déplacement a été annulé (valeur finale de la passe). */
  readonly registresEcrits: ReadonlyArray<RegistreQuelconque>;
  /** Une entrée `PLACEMENT_ANNULE` par annulation, dans l'ordre des annulations. */
  readonly valeursEcartees: ReadonlyArray<Extract<ValeurEcartee, { motif: 'PLACEMENT_ANNULE' }>>;
  /**
   * v0.6 (§6.6 n° 9 b, Q-ST017-PEP-2 b) : une entrée « changement parent » par annulation (`entreeDeReparation`),
   * dans l'ordre des annulations, sauf celles dont l'identifiant figure déjà dans `etat.journal` (idempotence).
   * Tranche B1 : toujours vide ; tranche B1b : rempli (§15.1).
   */
  readonly evenementsAjoutes: ReadonlyArray<EvenementJournal>;
  /** HLC de la dernière écriture de réparation ; absent si rien n'est écrit. */
  readonly dernierHlc?: Hlc;
};

type RegistreParent = Registre<'OBJECTIF', 'parent'> & RegistreQuelconque;

/** Objectif considéré (créé, non supprimé) : HLC de sa création, registre `parent` de l'état fusionné, placement courant. */
type Noeud = {
  readonly hlcCreation: Hlc;
  readonly parent?: { readonly registre: RegistreParent; readonly courant: PlacementObjectif };
};

type Placement = NonNullable<Noeud['parent']>;
type Candidat = { readonly id: IdObjectif; readonly noeud: Noeud; readonly parent: Placement };

/** Déplacement annulé : registre `parent` de l'état fusionné, HLC du déplacement annulé, valeur rétablie. */
type Annulation = {
  readonly id: IdObjectif;
  readonly hlcAnnule: Hlc;
  readonly registre: RegistreParent;
  readonly retabli: PlacementObjectif;
};

/** n° 7 : objectifs qui ont un registre `creation` et pas de registre `suppression`. */
const lireHierarchie = (etat: EtatLocal): Map<IdObjectif, Noeud> => {
  const creations = new Map<IdObjectif, Hlc>();
  const parents = new Map<IdObjectif, RegistreParent>();
  const supprimes = new Set<IdObjectif>();
  for (const r of etat.registres.values()) {
    if (estRegistre(r, 'OBJECTIF', 'creation')) creations.set(r.cle.id, r.ecriture.hlc);
    else if (estRegistre(r, 'OBJECTIF', 'parent')) parents.set(r.cle.id, r);
    else if (estRegistre(r, 'OBJECTIF', 'suppression')) supprimes.add(r.cle.id);
  }
  const noeuds = new Map<IdObjectif, Noeud>();
  for (const [id, hlcCreation] of creations) {
    if (supprimes.has(id)) continue;
    const registre = parents.get(id);
    const parent =
      registre === undefined ? {} : { parent: { registre, courant: registre.ecriture.valeur } };
    noeuds.set(id, { hlcCreation, ...parent });
  }
  return noeuds;
};

/** Parent effectif : `parentId` s'il désigne un objectif considéré, sinon aucun (RG-047 dérivée). */
const parentEffectif = (
  noeuds: ReadonlyMap<IdObjectif, Noeud>,
  id: IdObjectif,
): IdObjectif | undefined => {
  const parentId = noeuds.get(id)?.parent?.courant.parentId;
  return parentId !== undefined && noeuds.has(parentId) ? parentId : undefined;
};

/** n° 7 : x a un parent effectif p qui a lui-même un parent effectif ; participants x et p (cycles compris). */
const participants = (noeuds: ReadonlyMap<IdObjectif, Noeud>): ReadonlySet<IdObjectif> => {
  const resultat = new Set<IdObjectif>();
  for (const id of noeuds.keys()) {
    const p = parentEffectif(noeuds, id);
    if (p !== undefined && parentEffectif(noeuds, p) !== undefined) resultat.add(id).add(p);
  }
  return resultat;
};

/** Identifiants distincts (un candidat par objectif) : unités de code, jamais localeCompare. */
const comparerIds = (a: IdObjectif, b: IdObjectif): number => (a < b ? -1 : 1);

const dejaAnnule = (annulations: ReadonlyArray<Annulation>, id: IdObjectif, h: Hlc): boolean =>
  annulations.some((a) => a.id === id && comparerHlc(a.hlcAnnule, h) === 0);

/**
 * n° 8 : participant dont le placement courant vient d'un déplacement, de plus petit `hlcOrigine`, puis de plus petit
 * identifiant. Un déplacement déjà annulé n'est plus candidat : garde de terminaison (atteinte seulement avec un
 * journal incohérent ; §8 n° 10 : arrêt sans exception, hiérarchie laissée telle quelle).
 */
const candidat = (
  noeuds: ReadonlyMap<IdObjectif, Noeud>,
  annulations: ReadonlyArray<Annulation>,
): Candidat | undefined => {
  const enCause = participants(noeuds);
  return [...noeuds]
    .flatMap(([id, noeud]): ReadonlyArray<Candidat> => {
      const { parent } = noeud;
      if (!enCause.has(id) || parent?.courant.origine !== 'DEPLACEMENT') return [];
      return dejaAnnule(annulations, id, parent.courant.hlcOrigine) ? [] : [{ id, noeud, parent }];
    })
    .sort(
      (a, b) =>
        comparerHlc(a.parent.courant.hlcOrigine, b.parent.courant.hlcOrigine) ||
        comparerIds(a.id, b.id),
    )[0];
};

const texteHlc = (h: Hlc): string => `${String(h.physique)}|${String(h.compteur)}|${h.appareil}`;
const cleJournal = (id: IdObjectif, h: Hlc): string => `${id}|${texteHlc(h)}`;

/** `avant` des entrées CHANGEMENT_PARENT, par élément et HLC de l'entrée (celui du déplacement, RG-050). */
const indexerJournal = (
  journal: Iterable<EvenementJournal>,
): ReadonlyMap<string, PlacementObjectif> => {
  const index = new Map<string, PlacementObjectif>();
  for (const e of journal) {
    if (e.type !== 'CHANGEMENT_PARENT') continue;
    const { parentId, origine, hlcOrigine } = e.avant;
    index.set(cleJournal(e.element.id, e.hlc), {
      ...(parentId === undefined ? {} : { parentId }),
      origine,
      hlcOrigine,
    });
  }
  return index;
};

/** Annulations successives jusqu'à une hiérarchie valide (n° 8) ; une valeur rétablie peut être candidate à son tour. */
const annuler = (
  noeuds: Map<IdObjectif, Noeud>,
  journal: ReadonlyMap<string, PlacementObjectif>,
): ReadonlyArray<Annulation> => {
  const annulations: Array<Annulation> = [];
  for (let c = candidat(noeuds, annulations); c !== undefined; c = candidat(noeuds, annulations)) {
    const hlcAnnule = c.parent.courant.hlcOrigine;
    const retabli: PlacementObjectif = journal.get(cleJournal(c.id, hlcAnnule)) ?? {
      origine: 'CREATION',
      hlcOrigine: c.noeud.hlcCreation,
    };
    noeuds.set(c.id, { ...c.noeud, parent: { ...c.parent, courant: retabli } });
    annulations.push({ id: c.id, hlcAnnule, registre: c.parent.registre, retabli });
  }
  return annulations;
};

/** n° 9 : un registre par objectif annulé, valeur finale, dans l'ordre de la première annulation ; HLC successifs. */
const ecrire = (
  etat: EtatLocal,
  physiqueCorrigee: Instant,
  annulations: ReadonlyArray<Annulation>,
): ReadonlyArray<RegistreParent> => {
  const finales = new Map<IdObjectif, Annulation>(); // l'ordre d'insertion (première annulation) est conservé
  for (const a of annulations) finales.set(a.id, a);
  let dernier = etat.dernierHlc;
  return [...finales.values()].map(({ registre, retabli }) => {
    const hlc = hlcSuivant(dernier, physiqueCorrigee, etat.appareilId);
    dernier = hlc;
    const contexte = contexteDeNouvelleEcriture(registre.ecriture, etat.appareilId);
    return { cle: registre.cle, ecriture: { valeur: retabli, hlc, contexte } };
  });
};

/**
 * Annule un par un, du plus ancien au plus récent, les déplacements qui participent à une violation (cycle ou
 * deuxième niveau), jusqu'à obtenir une hiérarchie valide ; rien si elle l'est déjà. Fonction pure de l'état fusionné.
 */
export const reparerHierarchie = (
  etat: EtatLocal,
  physiqueCorrigee: Instant,
): ReparationHierarchie => {
  const annulations = annuler(lireHierarchie(etat), indexerJournal(etat.journal.values()));
  const registresEcrits = ecrire(etat, physiqueCorrigee, annulations);
  // n° 10 : une entrée par annulation ; `gagnante` = le registre de réparation de l'objectif (un seul par objectif).
  const valeursEcartees = annulations.flatMap(({ id, hlcAnnule, registre }) =>
    registresEcrits
      .filter((ecrit) => ecrit.cle.id === id)
      .map((gagnante) => ({
        id: idValeurEcartee(registre.cle, hlcAnnule),
        motif: 'PLACEMENT_ANNULE' as const,
        ecartee: registre,
        gagnante,
      })),
  );
  const dernierHlc = registresEcrits.at(-1)?.ecriture.hlc;
  return {
    registresEcrits,
    valeursEcartees,
    evenementsAjoutes: [], // B1b : entrée de journal par placement annulé (ST-US-017 v0.6 §6.6 n° 9 b)
    ...(dernierHlc === undefined ? {} : { dernierHlc }),
  };
};
