import { assertNever } from '../../../commun/domaine/assert-never';
import { ErreurProgrammation } from '../../../commun/domaine/erreur-programmation';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import {
  autreAppareil,
  type NomAppareilAffiche,
} from '../../../commun/presentation/format/appareil';
import { formaterDate } from '../../../commun/presentation/format/date';
import { formaterDuree } from '../../../commun/presentation/format/duree';
import type { CodeCatalogue } from '../../../commun/presentation/messages/codes';
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
  /** `ALR-010` seulement : `tache` (élément supprimé : une tâche), `sous-tache` (création sous une tâche supprimée), `rattachement` (OBJECTIFS), `placement` (PARENT). */
  readonly variante?: 'tache' | 'sous-tache' | 'rattachement' | 'placement';
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

/** Ce que les textes ont besoin de savoir de l'appareil et du jour : `{appareil}` d'`ALR-008`, année des dates. */
export type ContexteTextes = {
  readonly appareil: NomAppareilAffiche;
  readonly aujourdhui: DateCalendaire;
};

type CodeInformation = Extract<CodeCatalogue, `TXT-INF-${string}`>;

const CODES_INFORMATION: Readonly<Record<InformationSignalee, CodeInformation>> = {
  INTITULE: 'TXT-INF-INTITULE',
  DESCRIPTION: 'TXT-INF-DESCRIPTION',
  DELAI: 'TXT-INF-DELAI',
  ESTIMATION: 'TXT-INF-ESTIMATION',
  OBJECTIFS: 'TXT-INF-OBJECTIFS',
  PARENT: 'TXT-INF-PARENT',
  ETAT: 'TXT-INF-ETAT',
  CREATION: 'TXT-INF-CREATION',
};

/** Titre de l'information : `{information}` d'`ALR-009` et d'`ALR-014` (« Délai »). */
export const nomInformation = (information: InformationSignalee): string =>
  libelle(CODES_INFORMATION[information]);

/** Forme « dans une phrase » : `{information}` d'`ALR-010` générique (« son délai »). */
const informationDansUnePhrase = (information: InformationSignalee): string =>
  libelle(CODES_INFORMATION[information], {}, 'texte');

const LONGUEUR_MAX_DESCRIPTION = 80;

/** Description : retours à la ligne remplacés par une espace, coupée à 80 caractères (guide §6.6.12). */
const texteSaisi = (texte: string, information: InformationSignalee): string => {
  if (information !== 'DESCRIPTION') return texte;
  const uneLigne = texte.replace(/\r?\n/g, ' ');
  return uneLigne.length > LONGUEUR_MAX_DESCRIPTION
    ? `${uneLigne.slice(0, LONGUEUR_MAX_DESCRIPTION)}…`
    : uneLigne;
};

const valeurEtat = (
  valeur: Extract<ValeurSignalee, { type: 'ETAT' }>,
  c: ContexteTextes,
): string => {
  if (valeur.etat === 'A_FAIRE') return libelle('TXT-VAL-ETAT');
  if (valeur.date === undefined) {
    throw new ErreurProgrammation('Une valeur d’état terminée ou abandonnée porte sa date');
  }
  return libelle('TXT-VAL-ETAT', {
    variante: valeur.etat,
    date: formaterDate(valeur.date, c.aujourdhui),
  });
};

type TypeValeur = ValeurSignalee['type'];
type FormateurValeur<T extends TypeValeur> = (
  valeur: Extract<ValeurSignalee, { readonly type: T }>,
  information: InformationSignalee,
  contexte: ContexteTextes,
) => string;

const fragment =
  (code: CodeCatalogue): (() => string) =>
  () =>
    libelle(code);

const fragmentCitant =
  (code: CodeCatalogue, variable: string): ((valeur: { readonly intitule: string }) => string) =>
  (valeur) =>
    libelle(code, { [variable]: valeur.intitule });

/** Une entrée par type de valeur (exhaustive) : fragments `TXT-VAL-*` du guide §6.6.12. */
const FORMATEURS_VALEUR: { readonly [T in TypeValeur]: FormateurValeur<T> } = {
  TEXTE: (valeur, information) => texteSaisi(valeur.texte, information),
  AUCUNE: (_valeur, information) =>
    libelle('TXT-VAL-AUCUNE', information === 'DELAI' ? { variante: 'delai' } : {}),
  DATE: (valeur, _information, contexte) => formaterDate(valeur.date, contexte.aujourdhui),
  DUREE: (valeur) => formaterDuree(valeur.duree),
  ETAT: (valeur, _information, contexte) => valeurEtat(valeur, contexte),
  SOUS: fragmentCitant('TXT-VAL-SOUS', 'objectif'),
  PRINCIPAL: fragment('TXT-VAL-PRINCIPAL'),
  RATTACHEE: fragmentCitant('TXT-VAL-RATTACHEE', 'objectif'),
  DETACHEE: fragmentCitant('TXT-VAL-DETACHEE', 'objectif'),
  SOUS_TACHE_DE: fragmentCitant('TXT-VAL-SOUS-TACHE-DE', 'tache'),
  CREEE: fragment('TXT-VAL-CREEE'),
  TACHE_SUPPRIMEE: fragment('TXT-VAL-TACHE-SUPPRIMEE'),
  OBJECTIF_SUPPRIME: fragment('TXT-VAL-OBJECTIF-SUPPRIME'),
  SUPPRIMEE_AVEC: fragmentCitant('TXT-VAL-SUPPRIMEE-AVEC', 'tache'),
  PLACEMENT_ANNULE: fragment('TXT-VAL-PLACEMENT-ANNULE'),
  DONNEES_EFFACEES: fragment('TXT-VAL-DONNEES-EFFACEES'),
};

/** Valeur signalée (`{valeur}`, `{valeurConservee}`) mise en texte. */
export const formaterValeur = (
  valeur: ValeurSignalee,
  information: InformationSignalee,
  contexte: ContexteTextes,
): string => {
  const formateur = FORMATEURS_VALEUR[valeur.type] as (
    v: ValeurSignalee,
    i: InformationSignalee,
    c: ContexteTextes,
  ) => string;
  return formateur(valeur, information, contexte);
};

/** Intitulé cité par une valeur (`{objectif}`, `{tache}`) : seules les valeurs qui en portent un sont demandées. */
const intituleCite = (valeur: ValeurSignalee): string => {
  if ('intitule' in valeur) return valeur.intitule;
  throw new ErreurProgrammation(`La valeur « ${valeur.type} » ne cite aucun intitulé`);
};

/** Titre d'une ligne `ALR-014` : « Délai de « Annexe » ». */
export const titreDonneeEffacee = (ligne: LigneDonneeEffacee): string =>
  libelle('ALR-014', { information: nomInformation(ligne.information), element: ligne.element });

/** Texte d'une ligne `ALR-014` : « Votre valeur « 1 déc. » n'a pas été conservée. » */
export const texteDonneeEffacee = (ligne: LigneDonneeEffacee, contexte: ContexteTextes): string =>
  libelle(
    'ALR-014',
    { valeur: formaterValeur(ligne.valeurNonRetenue, ligne.information, contexte) },
    'texte',
  );

/** Texte de la carte `ALR-008` : `{appareil}` est l'autre appareil (le choix est fait ailleurs). */
export const texteDonneesEffacees = (n: number, contexte: ContexteTextes): string =>
  libelle('ALR-008', { n, appareil: autreAppareil(contexte.appareil) }, 'texte');

/** Libellé de la `Disclosure` des lignes `ALR-014` (une seule : « Voir la modification »). */
export const libelleModificationsEffacees = (n: number): string =>
  libelle('SEC-MODIFS-EFFACEES', n === 1 ? { n, variante: 'une' } : { n });

const varianteDe = (v: ValeurEcarteeDetaillee): LigneModificationNonRetenue['variante'] => {
  if (v.information === 'OBJECTIFS') return 'rattachement';
  if (v.information === 'PARENT') return 'placement';
  if (v.information === 'CREATION' && v.valeurConservee.type === 'SUPPRIMEE_AVEC') {
    return 'sous-tache';
  }
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

/** Libellé du bouton « Voir … » d'une ligne qui a un élément à ouvrir ; absent si l'élément n'existe plus. */
export const libelleVoir = (ligne: LigneModificationNonRetenue): string | undefined => {
  if (ligne.voir === undefined) return undefined;
  return libelle(ligne.voir.type === 'TACHE' ? 'TXT-VOIR-TACHE' : 'TXT-VOIR-OBJECTIF');
};

/** Nom accessible de « Voir … » : « Voir la tâche : intitulé de « X » » (guide §6.6.12). */
export const nomAccessibleVoir = (ligne: LigneModificationNonRetenue): string | undefined => {
  const voir = libelleVoir(ligne);
  return voir === undefined ? undefined : `${voir} : ${premiereEnMinuscule(ligne.titre)}`;
};

/** Texte d'une ligne `ALR-010`, selon sa variante (guide §6.6.9). */
const texteSuppression = (ligne: LigneModificationNonRetenue): string => {
  const { variante, element } = ligne;
  switch (variante) {
    case undefined:
    case 'tache':
      return libelle(
        'ALR-010',
        { information: informationDansUnePhrase(ligne.information) },
        'texte',
      );
    case 'sous-tache':
      return libelle('ALR-010', { variante, tache: intituleCite(ligne.valeurConservee) }, 'texte');
    case 'rattachement':
    case 'placement':
      return libelle(
        'ALR-010',
        { variante, element, objectif: intituleCite(ligne.valeurNonRetenue) },
        'texte',
      );
    default:
      return assertNever(variante);
  }
};

/** Texte d'une ligne de la section « À lire », sous son titre. */
export const texteLigne = (
  ligne: LigneModificationNonRetenue,
  contexte: ContexteTextes,
): string => {
  switch (ligne.code) {
    case 'ALR-009':
      return libelle(
        'ALR-009',
        {
          valeur: formaterValeur(ligne.valeurNonRetenue, ligne.information, contexte),
          valeurConservee: formaterValeur(ligne.valeurConservee, ligne.information, contexte),
        },
        'texte',
      );
    case 'ALR-010':
      return texteSuppression(ligne);
    case 'ALR-011':
      return libelle(
        'ALR-011',
        { element: ligne.element, parent: intituleCite(ligne.valeurNonRetenue) },
        'texte',
      );
    default:
      return assertNever(ligne.code);
  }
};

/** Sous-titre « Tâche « X » » des variantes `rattachement` et `placement` d'`ALR-010` ; absent sinon. */
export const sousTitreLigne = (ligne: LigneModificationNonRetenue): string | undefined =>
  ligne.variante === 'rattachement' || ligne.variante === 'placement'
    ? libelle('ALR-010', { variante: ligne.variante, element: ligne.element }, 'sousTitre')
    : undefined;
