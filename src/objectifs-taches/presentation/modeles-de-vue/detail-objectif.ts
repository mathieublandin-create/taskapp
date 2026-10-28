import { nonImplemente } from '@non-implemente';
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
import type { ResumeObjectif } from '../../application/requetes/resumes';
import type { ActionObjectif } from '../../domaine/actions';
import { construireLigneObjectif, type LigneObjectif, type ModeleVueDelai } from './ligne-objectif';
import { comparerOrdreReference } from './ordre-reference';
import type { LigneTache } from './ligne-tache';

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

const section = <C extends CodeSectionTaches>(
  code: C,
  replieeParDefaut: boolean,
): SectionTaches<C> => ({
  code,
  n: 0,
  libelle: libelle(code, { n: 0 }),
  replieeParDefaut,
  lignes: [],
});

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

const sectionsDeTaches = (): ModeleVueDetailObjectif['taches'] => ({
  aFaire: section('SEC-TACHES-A-FAIRE', false),
  terminees: section('SEC-TACHES-TERMINEES', true),
  abandonnees: section('SEC-TACHES-ABANDONNEES', true),
});

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
  if (donnees.taches.length > 0) {
    return nonImplemente('construireDetailObjectif (sections de tâches, ST-US-002)');
  }
  return {
    id: objectif.id,
    intitule: objectif.intitule,
    ...(objectif.description === undefined ? {} : { description: objectif.description }),
    delai: ligne.delai,
    niveau: niveauDe(objectif),
    etat: ligne.etat,
    compteur: ligne.compteur,
    ...(ligne.enRetard === undefined ? {} : { enRetard: ligne.enRetard }),
    ...(ligne.alerteDelai === undefined ? {} : { alerteDelai: ligne.alerteDelai }),
    sousObjectifs: sectionSousObjectifs(donnees.sousObjectifs, aujourdhui),
    taches: sectionsDeTaches(),
    etatVide: { code: 'EVD-OBJECTIF-SANS-TACHE' },
    actions: donnees.actions,
    ...mentionHeureParis(dependances.horloge),
  };
};
