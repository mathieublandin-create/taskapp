import type { Marque } from '../../commun/domaine/marque';
import type { EcartTemps } from '../../commun/domaine/temps/ecart-temps';
import type { Instant } from '../../commun/domaine/temps/instant';
import type { Generation } from './contenu-fichier';
import type { Hlc } from './hlc';
import type { IdEvenement } from './identifiant-evenement';
import type { Inconnus } from './inconnus';
import type { PlanEcriture } from './planifier-ecritures';
import type { AjoutsSignalements } from './signalements';

// Données locales non synchronisées (DAT §6.1) ; ST-US-017 §4.1.
export type IdFichierDrive = Marque<string, 'IdFichierDrive'>;

export type MetaSynchronisation = {
  readonly dossier?: IdFichierDrive;
  /** Mémorisé au premier dépôt confirmé (DAT §4.2.2). */
  readonly fichierPropre?: IdFichierDrive;
  readonly manifeste?: IdFichierDrive;
  readonly deposeJusquA?: Hlc;
  readonly pageToken?: string;
  readonly dernierContactDrive?: Instant;
  /** Une fusion a écrit des registres depuis le dernier dépôt confirmé. */
  readonly fusionNonDeposee: boolean;
  // ---- Incrément 3 (ST-US-017 v0.10 §5.1, §6.7) : absentes ≡ valeur initiale.
  /** Génération de l'espace (n° 3) ; absente ≡ INITIALE. */
  readonly generation?: Generation;
  /** Version Drive du fichier propre au dernier dépôt confirmé (n° 5) ; absente : inconnue, le fichier est relu. */
  readonly versionFichierPropre?: string;
  /** « Restaurer » choisi, pas encore exécuté (n° 9 ; hors ligne : exécuté au retour du réseau). */
  readonly restaurationDemandee?: boolean;
  /**
   * Dernière restauration vue (n° 8 ; v0.10.1, conditions C1 et C2) : maximum des `restauration` lues à chaque cycle
   * qui synchronise ou restaure, jamais décroissant dans une génération (`restaurationConnueApres`) ; initialisée à
   * l'adoption d'une génération (`restaurationVue` de la décision) et à la création d'une génération (`restauration`
   * du manifeste écrit) ; égale au HLC d'une restauration faite par cet appareil.
   */
  readonly restaurationConnue?: Hlc;
  /** Le prochain cycle refait un inventaire complet (bascule ou déménagement de dossier, n° 12, n° 14). */
  readonly inventaireAFaire?: boolean;
  // ---- Incrément 4 (ST-US-017 v0.11 §5.1, §6.8) : méta d'appareil, conservées par `reinitialiser` (CLES_META_APPAREIL).
  /** n° 2 : les NOMBRE_MESURES_HORLOGE dernières mesures retenues (ms, ordre d'arrivée) ; absente ≡ aucune. */
  readonly mesuresHorloge?: ReadonlyArray<EcartTemps>;
  /**
   * n° 18 à 21 (DT-036) : mises à la corbeille en échec, reprises en fin de cycle `SYNCHRONISER` ou `RESTAURER` ;
   * ordre d'inscription, sans doublon ; absente ≡ vide.
   */
  readonly aMettreALaCorbeille?: ReadonlyArray<ElementACorbeille>;
};

/**
 * DT-036 (n° 18) : `FICHIER` : fichier d'appareil ou manifeste de cet appareil à mettre à la corbeille ;
 * `DOSSIER_QUITTE` : dossier quitté au déménagement (n° 14), mis à la corbeille seulement s'il ne contient plus aucun
 * fichier d'appareil (condition C5).
 */
export type ElementACorbeille = {
  readonly type: 'FICHIER' | 'DOSSIER_QUITTE';
  readonly id: IdFichierDrive;
};

/** Clés de méta propres à l'appareil, conservées par `reinitialiser` (n° 6, n° 21) : ni le Drive ni la génération ne les invalident. */
export const CLES_META_APPAREIL = [
  'mesuresHorloge',
  'aMettreALaCorbeille',
] as const satisfies ReadonlyArray<keyof MetaSynchronisation>;

export const META_INITIALE: MetaSynchronisation = { fusionNonDeposee: false };

export type PlanSynchronisation = {
  readonly plan: PlanEcriture;
  readonly meta: Partial<MetaSynchronisation>;
  /** ST-US-017 v0.5 §4.6 (incrément 2) : entrées écrites dans la même transaction ; absent ≡ vide. */
  readonly signalements?: AjoutsSignalements;
  /**
   * Condition C2 de Starck (DAT v0.11.8 §4.2) : entrées de réparation écrites sans entrée du déplacement annulé
   * (`ReparationHierarchie.deplacementsSansEntree`), à journaliser en « erreur » par le service ; absent ≡ aucune.
   */
  readonly deplacementsSansEntree?: ReadonlyArray<IdEvenement>;
  /**
   * ST-US-017 v0.10 §6.7 n° 11 (incrément 3, RG-044 b et « Repartir de zéro ») : dans la même transaction, le dépôt
   * vide l'état (registres, journal, index des écritures en attente) et les signalements, écrit `plan.etatApres`
   * (vide, même `appareilId`, `dernierHlc` et `correctionHorloge` conservés, version + 1), **remplace** les clés de
   * synchronisation de la méta par `{ ...META_INITIALE, ...meta }` (une clé absente de `meta` est retirée), puis écrit
   * `signalements`. Observateurs prévenus. Absent ≡ faux.
   */
  readonly reinitialiser?: true;
  /**
   * ST-US-017 v0.11 §6.8 n° 14 (incrément 4) : registres et entrées de journal inconnus écrits (ajout ou remplacement
   * par clé ou identifiant) dans la même transaction ; absent ou vide ≡ aucun. Avec `reinitialiser`, écrits après
   * l'effacement des tables.
   */
  readonly inconnus?: Inconnus;
};
