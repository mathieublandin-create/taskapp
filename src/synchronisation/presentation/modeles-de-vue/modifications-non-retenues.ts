import { assertNever } from '../../../commun/domaine/assert-never';
import { libelle } from '../../../commun/presentation/messages/libelle';
import type {
  InformationSignalee,
  ValeurEcarteeDetaillee,
  ValeurSignalee,
} from '../../domaine/detail-valeurs-ecartees';
import type { RefElementMetier } from '../../domaine/information';
import { comparerLignesFeuille } from './ordre-feuille';

// ECR-011, section « À lire » (guide §4.24, §6.6.2 `SYN-FEUILLE-A-LIRE`, §6.6.9 `ALR-008` à `ALR-011`, `ALR-014` ;
// guide §5.8 f) ; ST-US-017 v0.5 §4.6, §6.6 n° 13 ; H-2, H-6.

export type LigneModificationNonRetenue = {
  readonly id: string;
  readonly code: 'ALR-009' | 'ALR-010' | 'ALR-011';
  /** `ALR-010` seulement : `tache` (élément supprimé : une tâche), `rattachement` (OBJECTIFS), `placement` (PARENT). */
  readonly variante?: 'tache' | 'rattachement' | 'placement';
  /** Colonne « élément » du glossaire §8. */
  readonly element: string;
  readonly information: InformationSignalee;
  readonly valeurNonRetenue: ValeurSignalee;
  readonly valeurConservee: ValeurSignalee;
  /** Libellé du code (et de sa variante) : titre du `DiscardedItem`. */
  readonly titre: string;
  /** Élément ouvert par « Voir … » ; absent si l'élément n'existe plus. */
  readonly voir?: RefElementMetier;
};

export type LigneDonneeEffacee = {
  readonly id: string;
  readonly element: string;
  readonly information: InformationSignalee;
  readonly valeurNonRetenue: ValeurSignalee;
};

export type ModeleVueModificationsNonRetenues = {
  readonly code: 'SYN-FEUILLE-A-LIRE';
  /** Nombre de lignes `ALR-009` à `ALR-011` (= `aLire`, H-6). */
  readonly n: number;
  readonly libelle: string;
  /** Non lues, ordre `comparerLignesFeuille` (instant = `ValeurEcarteeDetaillee.instant`, intitulé = élément, id). */
  readonly lignes: ReadonlyArray<LigneModificationNonRetenue>;
  /** `ALR-014` non lues, groupées sous la carte `ALR-008`, même ordre ; un seul « Compris » pour toutes (`ids`). */
  readonly donneesEffacees?: {
    readonly code: 'ALR-008';
    readonly ids: ReadonlyArray<string>;
    readonly lignes: ReadonlyArray<LigneDonneeEffacee>;
  };
};

// TODO(Q-ST017-STE-2 a) : noms des informations provisoires, à remplacer par ceux que Steeve ajoutera au catalogue.
const NOMS_INFORMATION: Readonly<Record<InformationSignalee, string>> = {
  INTITULE: 'Intitulé',
  DESCRIPTION: 'Description',
  DELAI: 'Délai',
  ESTIMATION: 'Estimation',
  OBJECTIFS: 'Objectifs',
  PARENT: 'Placement',
  ETAT: 'État',
  CREATION: 'Création',
};

/** Variable `{information}` d'`ALR-009` et d'`ALR-014`. */
export const nomInformation = (information: InformationSignalee): string =>
  NOMS_INFORMATION[information];

/** Titre d'une ligne `ALR-014` : « Délai de « Annexe » ». */
export const titreDonneeEffacee = (ligne: LigneDonneeEffacee): string =>
  libelle('ALR-014', { information: nomInformation(ligne.information), element: ligne.element });

/** Texte de la carte `ALR-008` ; `{appareil}` provisoire. */
export const texteDonneesEffacees = (n: number): string =>
  // TODO(Q-ST017-STE-2 b) : « appareil » en attendant la réponse de Steeve.
  libelle('ALR-008', { n, appareil: 'appareil' }, 'texte');

const varianteDe = (v: ValeurEcarteeDetaillee): LigneModificationNonRetenue['variante'] => {
  if (v.information === 'OBJECTIFS') return 'rattachement';
  if (v.information === 'PARENT') return 'placement';
  return v.supprime?.type === 'TACHE' ? 'tache' : undefined;
};

const codeDe = (v: ValeurEcarteeDetaillee): LigneModificationNonRetenue['code'] | undefined => {
  switch (v.motif) {
    case 'CONFLIT':
      return 'ALR-009';
    case 'SUPPRESSION':
      return 'ALR-010';
    case 'PLACEMENT_ANNULE':
      return 'ALR-011';
    case 'DONNEES_EFFACEES':
      return undefined;
    default:
      return assertNever(v.motif);
  }
};

const titreDe = (
  code: LigneModificationNonRetenue['code'],
  variante: LigneModificationNonRetenue['variante'],
  v: ValeurEcarteeDetaillee,
): string => {
  if (code === 'ALR-009') {
    return libelle(code, { element: v.intitule, information: nomInformation(v.information) });
  }
  return libelle(code, { ...(variante === undefined ? {} : { variante }), element: v.intitule });
};

const ligneDe = (
  v: ValeurEcarteeDetaillee,
  code: LigneModificationNonRetenue['code'],
): LigneModificationNonRetenue => {
  const variante = code === 'ALR-010' ? varianteDe(v) : undefined;
  return {
    id: v.id,
    code,
    ...(variante === undefined ? {} : { variante }),
    element: v.intitule,
    information: v.information,
    valeurNonRetenue: v.valeurNonRetenue,
    valeurConservee: v.valeurConservee,
    titre: titreDe(code, variante, v),
    ...(v.elementExiste ? { voir: v.element } : {}),
  };
};

const donneeEffaceeDe = (v: ValeurEcarteeDetaillee): LigneDonneeEffacee => ({
  id: v.id,
  element: v.intitule,
  information: v.information,
  valeurNonRetenue: v.valeurNonRetenue,
});

/** Section absente (undefined) s'il n'y a aucune entrée non lue. */
export const construireModificationsNonRetenues = (
  valeurs: ReadonlyArray<ValeurEcarteeDetaillee>,
): ModeleVueModificationsNonRetenues | undefined => {
  const nonLues = valeurs.filter((v) => !v.lue).sort(comparerLignesFeuille);
  const lignes = nonLues.flatMap((v) => {
    const code = codeDe(v);
    return code === undefined ? [] : [ligneDe(v, code)];
  });
  const effacees = nonLues.filter((v) => v.motif === 'DONNEES_EFFACEES').map(donneeEffaceeDe);
  if (lignes.length === 0 && effacees.length === 0) return undefined;
  return {
    code: 'SYN-FEUILLE-A-LIRE',
    n: lignes.length,
    libelle: libelle('SYN-FEUILLE-A-LIRE', { n: lignes.length }),
    lignes,
    ...(effacees.length === 0
      ? {}
      : { donneesEffacees: { code: 'ALR-008', ids: effacees.map((e) => e.id), lignes: effacees } }),
  };
};

const premiereEnMinuscule = (texte: string): string =>
  texte.charAt(0).toLowerCase() + texte.slice(1);

/** Nom accessible du « Compris » d'une ligne : « Compris : intitulé de « X » » (guide §10). */
export const nomAccessibleCompris = (titre: string): string =>
  `${libelle('ALR-009', {}, 'action')} : ${premiereEnMinuscule(titre)}`;

/** Libellé du bouton « Voir … » d'une ligne qui a un élément à ouvrir. */
export const libelleVoir = (ligne: LigneModificationNonRetenue): string => {
  if (
    ligne.code === 'ALR-011' ||
    ligne.variante === 'rattachement' ||
    ligne.variante === 'placement'
  ) {
    return libelle(
      ligne.code,
      ligne.variante === undefined ? {} : { variante: ligne.variante },
      'action',
    );
  }
  // TODO(Q-ST017-STE-2 c) : « Voir la tâche » / « Voir l’objectif » d'`ALR-009` et d'`ALR-010` générique, provisoires.
  return ligne.voir?.type === 'TACHE' ? 'Voir la tâche' : 'Voir l’objectif';
};
