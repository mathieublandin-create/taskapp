import type { Horloge } from '../../../commun/application/ports/horloge';
import { ErreurProgrammation } from '../../../commun/domaine/erreur-programmation';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import { jourDeReference } from '../../../commun/domaine/temps/jour-de-reference';
import {
  mentionHeureParis,
  type MentionHeureParis,
} from '../../../commun/presentation/modeles-de-vue/mention-heure-paris';
import { libelle } from '../../../commun/presentation/messages/libelle';
import type { DetailObjectif } from '../../application/requetes/consulter-detail-objectif';
import type { ResumeObjectif, ResumeTache } from '../../application/requetes/resumes';
import type { ActionObjectif } from '../../domaine/actions';
import { construireLigneObjectif, type LigneObjectif, type ModeleVueDelai } from './ligne-objectif';
import { construireLigneTache, type LigneTache } from './ligne-tache';
import { comparerOrdreReference, comparerParFinDecroissante } from './ordre-reference';

// ST-US-001 §4.5 ; ST-US-023 §4.5 ; ST-US-002 §4.5, §6.6 (guide v0.2.10 §5.8 d).
export type LigneDetailObjectif = LigneTache & { readonly niveau: 'TACHE' | 'SOUS_TACHE' };

export type CodeSectionTaches =
  'SEC-TACHES-A-FAIRE' | 'SEC-TACHES-TERMINEES' | 'SEC-TACHES-ABANDONNEES';

export type SectionTaches<C extends CodeSectionTaches> = {
  readonly code: C;
  readonly n: number; // tâches directes de la section (sous-tâches non comptées)
  readonly libelle: string;
  readonly replieeParDefaut: boolean; // faux pour « à faire », vrai pour les deux autres
  readonly lignes: ReadonlyArray<LigneDetailObjectif>;
};

export type ModeleVueDetailObjectif = {
  readonly id: IdObjectif;
  readonly intitule: string;
  readonly description?: string;
  readonly delai: ModeleVueDelai;
  readonly niveau:
    | { readonly type: 'PRINCIPAL' }
    | {
        readonly type: 'SOUS_OBJECTIF';
        readonly parent: { readonly id: IdObjectif; readonly intitule: string };
      };
  readonly etat: LigneObjectif['etat'];
  readonly compteur: LigneObjectif['compteur'];
  /** Pourcentage (0 à 100) de la barre de progression, comme `LigneObjectif.progression`. */
  readonly progression: LigneObjectif['progression'];
  /** Nom accessible de la barre de progression : celui de la ligne de l'objectif (guide §6.6.4). */
  readonly nomAccessible: LigneObjectif['nomAccessible'];
  readonly enRetard?: LigneObjectif['enRetard'];
  readonly alerteDelai?: LigneObjectif['alerteDelai'];
  readonly sousObjectifs: {
    readonly code: 'SEC-SOUS-OBJECTIFS';
    readonly libelle: string;
    readonly lignes: ReadonlyArray<LigneObjectif>;
  };
  readonly taches: {
    readonly aFaire: SectionTaches<'SEC-TACHES-A-FAIRE'>;
    readonly terminees: SectionTaches<'SEC-TACHES-TERMINEES'>;
    readonly abandonnees: SectionTaches<'SEC-TACHES-ABANDONNEES'>;
  };
  readonly etatVide?: { readonly code: 'EVD-OBJECTIF-SANS-TACHE' }; // aucune tâche directe
  readonly actions: ReadonlyArray<ActionObjectif>;
  readonly mentionHeureParis?: MentionHeureParis;
};

const niveauDe = (objectif: ResumeObjectif): ModeleVueDetailObjectif['niveau'] => {
  if (objectif.parentId === undefined) return { type: 'PRINCIPAL' };
  if (objectif.parentIntitule === undefined) {
    throw new ErreurProgrammation(`Parent de l'objectif ${objectif.id} sans intitulé`);
  }
  return {
    type: 'SOUS_OBJECTIF',
    parent: { id: objectif.parentId, intitule: objectif.parentIntitule },
  };
};

const section = <C extends CodeSectionTaches>(
  code: C,
  replieeParDefaut: boolean,
  taches: ReadonlyArray<LigneDetailObjectif>,
): SectionTaches<C> => {
  const n = taches.filter((ligne) => ligne.niveau === 'TACHE').length;
  return { code, n, libelle: libelle(code, { n }), replieeParDefaut, lignes: taches };
};

const ligneDetail = (
  resume: ResumeTache,
  niveau: LigneDetailObjectif['niveau'],
  aujourdhui: DateCalendaire,
): LigneDetailObjectif => ({ ...construireLigneTache(resume, aujourdhui), niveau });

/**
 * Sous une tâche à faire, ses sous-tâches non supprimées suivent sa ligne, tous états, dans l'ordre de référence ;
 * sous une tâche terminée ou abandonnée, aucune ligne de sous-tâche (Q-US-002-4 a).
 */
const lignesDeSection = (
  taches: ReadonlyArray<ResumeTache>,
  sousTachesPar: DetailObjectif['sousTachesPar'],
  aujourdhui: DateCalendaire,
): ReadonlyArray<LigneDetailObjectif> =>
  taches.flatMap((tache) => [
    ligneDetail(tache, 'TACHE', aujourdhui),
    ...(tache.cycleDeVie.etat === 'A_FAIRE' ? [...(sousTachesPar.get(tache.id) ?? [])] : [])
      .sort(comparerOrdreReference)
      .map((sousTache) => ligneDetail(sousTache, 'SOUS_TACHE', aujourdhui)),
  ]);

const sectionsDeTaches = (
  donnees: DetailObjectif,
  aujourdhui: DateCalendaire,
): ModeleVueDetailObjectif['taches'] => {
  const dans = (
    etat: ResumeTache['cycleDeVie']['etat'],
    comparer: (a: ResumeTache, b: ResumeTache) => number,
  ) =>
    lignesDeSection(
      donnees.taches.filter((tache) => tache.cycleDeVie.etat === etat).sort(comparer),
      donnees.sousTachesPar,
      aujourdhui,
    );
  return {
    aFaire: section('SEC-TACHES-A-FAIRE', false, dans('A_FAIRE', comparerOrdreReference)),
    terminees: section('SEC-TACHES-TERMINEES', true, dans('TERMINEE', comparerParFinDecroissante)),
    abandonnees: section(
      'SEC-TACHES-ABANDONNEES',
      true,
      dans('ABANDONNEE', comparerParFinDecroissante),
    ),
  };
};

const sectionSousObjectifs = (
  sousObjectifs: ReadonlyArray<ResumeObjectif>,
  aujourdhui: DateCalendaire,
): ModeleVueDetailObjectif['sousObjectifs'] => ({
  code: 'SEC-SOUS-OBJECTIFS',
  libelle: libelle('SEC-SOUS-OBJECTIFS'),
  lignes: [...sousObjectifs]
    .sort(comparerOrdreReference)
    .map((sous) => construireLigneObjectif(sous, aujourdhui)),
});

export const construireDetailObjectif = (
  donnees: DetailObjectif,
  dependances: { readonly horloge: Horloge },
): ModeleVueDetailObjectif => {
  const aujourdhui = jourDeReference(dependances.horloge.maintenant());
  const { objectif } = donnees;
  const ligne = construireLigneObjectif(objectif, aujourdhui);
  return {
    id: objectif.id,
    intitule: objectif.intitule,
    ...(objectif.description === undefined ? {} : { description: objectif.description }),
    delai: ligne.delai,
    niveau: niveauDe(objectif),
    etat: ligne.etat,
    compteur: ligne.compteur,
    progression: ligne.progression,
    nomAccessible: ligne.nomAccessible,
    ...(ligne.enRetard === undefined ? {} : { enRetard: ligne.enRetard }),
    ...(ligne.alerteDelai === undefined ? {} : { alerteDelai: ligne.alerteDelai }),
    sousObjectifs: sectionSousObjectifs(donnees.sousObjectifs, aujourdhui),
    taches: sectionsDeTaches(donnees, aujourdhui),
    ...(donnees.taches.length === 0
      ? { etatVide: { code: 'EVD-OBJECTIF-SANS-TACHE' as const } }
      : {}),
    actions: donnees.actions,
    ...mentionHeureParis(dependances.horloge),
  };
};
