import { estRegistre, type RegistreQuelconque } from './ecriture';
import { ETAT_LOCAL_VIDE, registreDe, type EtatLocal } from './etat-local';
import { comparerHlc, maxHlc, type Hlc } from './hlc';
import { elementDeCle, type RefElementMetier } from './information';
import type { MetaSynchronisation, PlanSynchronisation } from './meta-synchronisation';
import { idValeurEcartee, type ValeurEcartee } from './valeurs-ecartees';

// ST-US-017 v0.10 §6.7 n° 10, n° 11 ; RG-044 b, RG-056 ; DAT §4.2 (« Génération des données ») ; guide §6.6.9
// (ALR-008, ALR-014).

export type ValeurDonneesEffacees = Extract<ValeurEcartee, { readonly motif: 'DONNEES_EFFACEES' }>;

const estIntitule = (
  registre: RegistreQuelconque,
): registre is RegistreQuelconque & {
  readonly ecriture: { readonly valeur: string };
} => estRegistre(registre, 'OBJECTIF', 'intitule') || estRegistre(registre, 'TACHE', 'intitule');

/** Intitulé courant de l'élément (tâche pour un lien), s'il existe. */
const intituleDe = (etat: EtatLocal, element: RefElementMetier): string | undefined => {
  const registre = registreDe(etat, element, 'intitule');
  return registre !== undefined && estIntitule(registre) ? registre.ecriture.valeur : undefined;
};

/**
 * Modifications perdues par un changement de génération (n° 10) : pour chaque entrée de `etat.enAttente`, triées par
 * clé de texte, l'entrée `DONNEES_EFFACEES` du registre de cette clé **si** ce registre existe, porte le HLC
 * `derniereHlc` de l'entrée (sinon une fusion l'a déjà remplacé : rien), n'est pas de champ `suppression`, et que son
 * élément n'a pas de registre `suppression`. `id` = `idValeurEcartee(cle, hlc du registre)` ; `ecartee` = ce registre ;
 * `generation` = `generation` ; `intituleElement` = valeur du registre `intitule` de l'élément de la clé (élément
 * d'un lien : la tâche), omis s'il n'existe pas.
 * v0.10.1, condition C9 de Starck : si `posterieuresA` est défini (achèvement par son auteur d'un « Repartir de zéro »
 * interrompu, `posterieuresA` = HLC de la génération), seules les entrées dont `derniereHlc` lui est **strictement**
 * postérieur (`comparerHlc > 0`) sont retenues : les écritures antérieures ont été perdues en connaissance de cause
 * (`CNF-REPARTIR-ZERO`).
 */
export const valeursDonneesEffacees = (
  etat: EtatLocal,
  generation: Hlc,
  posterieuresA?: Hlc,
): ReadonlyArray<ValeurDonneesEffacees> =>
  [...etat.enAttente.entries()]
    // Clés distinctes (clés d'une Map) : jamais égales.
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .flatMap(([cleTexte, { cle, entree }]): Array<ValeurDonneesEffacees> => {
      if (posterieuresA !== undefined && comparerHlc(entree.derniereHlc, posterieuresA) <= 0) {
        return [];
      }
      const ecartee = etat.registres.get(cleTexte);
      if (ecartee === undefined || comparerHlc(ecartee.ecriture.hlc, entree.derniereHlc) !== 0) {
        return [];
      }
      const element = elementDeCle(cle);
      if (cle.champ === 'suppression' || registreDe(etat, element, 'suppression') !== undefined) {
        return [];
      }
      const intituleElement = intituleDe(etat, element);
      return [
        {
          id: idValeurEcartee(cle, ecartee.ecriture.hlc),
          motif: 'DONNEES_EFFACEES',
          ecartee,
          generation,
          ...(intituleElement === undefined ? {} : { intituleElement }),
        },
      ];
    });

/**
 * Plan de réinitialisation de l'espace (n° 11) : `reinitialiser: true` ; `plan.etatApres` = état vide du même
 * `appareilId`, `version` et `correctionHorloge` de `etat`, `dernierHlc` = maximum de `etat.dernierHlc` et de
 * `p.dernierHlc` ; tableaux du plan vides ; `meta` = `p.meta` (remplace la méta, §4.7) ; `signalements` =
 * `{ valeursEcartees: p.valeurs, lectures: [] }`.
 */
export const planReinitialisation = (
  etat: EtatLocal,
  p: {
    readonly meta: Partial<MetaSynchronisation>;
    readonly valeurs: ReadonlyArray<ValeurEcartee>;
    readonly dernierHlc?: Hlc;
  },
): PlanSynchronisation => {
  const dernierHlc =
    etat.dernierHlc === undefined || p.dernierHlc === undefined
      ? (etat.dernierHlc ?? p.dernierHlc)
      : maxHlc(etat.dernierHlc, p.dernierHlc);
  return {
    plan: {
      etatApres: {
        ...ETAT_LOCAL_VIDE(etat.appareilId),
        version: etat.version,
        correctionHorloge: etat.correctionHorloge,
        ...(dernierHlc === undefined ? {} : { dernierHlc }),
      },
      registresEcrits: [],
      evenementsAjoutes: [],
      enAttenteEcrites: [],
      enAttenteRetirees: [],
    },
    meta: p.meta,
    signalements: { valeursEcartees: p.valeurs, lectures: [] },
    reinitialiser: true,
  };
};
