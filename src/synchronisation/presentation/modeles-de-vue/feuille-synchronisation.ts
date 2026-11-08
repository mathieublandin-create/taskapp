import type { EcartTemps } from '../../../commun/domaine/temps/ecart-temps';
import type { Instant } from '../../../commun/domaine/temps/instant';
import { formaterAnciennete, formaterHeure } from '../../../commun/presentation/format/heure';
import { libelle } from '../../../commun/presentation/messages/libelle';
import { estHorlogeDereglee } from '../../domaine/correction-horloge';
import type { EtatSynchronisationAffichable } from './etat-synchronisation-affichable';
import { comparerLignesFeuille, type LigneFeuilleOrdonnable } from './ordre-feuille';

// ECR-011, section « Synchronisation » de l'incrément 1 (ST-US-017 v0.4 §4.5, guide §4.26, §6.6.2 ; DT-011).
// Le dossier du Drive (`SYN-FEUILLE-DOSSIER`) reste dans la section « Compte » (`section-compte.ts`).

export type EntreeFeuilleSynchronisation = {
  readonly etat: EtatSynchronisationAffichable;
  readonly maintenant: Instant;
  /** `MetaSynchronisation.dernierContactDrive` ; absent tant qu'aucun échange n'a abouti. */
  readonly dernierEchange?: Instant;
  /** Une entrée par élément qui porte `MEN-ATTENTE` (DAT §4.1.5 bis), dans un ordre quelconque. */
  readonly elementsEnAttente: ReadonlyArray<LigneFeuilleOrdonnable>;
  /** ST-US-017 v0.11 §6.8 n° 4 (rang 11) : `EtatLocal.correctionHorloge` de l'espace ; absente ≡ 0. */
  readonly correctionHorloge?: EcartTemps;
};

export type LigneAttenteFeuille = { readonly id: string; readonly intitule: string };

export type ActionCarteFeuille = 'OUVRIR_GOOGLE_DRIVE' | 'REESSAYER_MAINTENANT' | 'METTRE_A_JOUR';

export type CarteErreurFeuille = {
  readonly message: 'ERR-011' | 'ERR-013' | 'ERR-016';
  readonly titre: string;
  readonly texte: string;
  readonly action: { readonly type: ActionCarteFeuille; readonly libelle: string };
};

export type ModeleVueFeuilleSynchronisation = {
  readonly dernierEchange?: {
    readonly code: 'SYN-FEUILLE-DERNIER-ECHANGE';
    readonly libelle: string;
  };
  readonly attente:
    | { readonly code: 'SYN-FEUILLE-RIEN-EN-ATTENTE'; readonly libelle: string }
    | {
        readonly code: 'SYN-FEUILLE-EN-ATTENTE';
        /** Nombre de lignes (guide §6.6.1, « Décompte »). */
        readonly n: number;
        readonly libelle: string;
        /** Ordre `comparerLignesFeuille`. */
        readonly lignes: ReadonlyArray<LigneAttenteFeuille>;
      };
  readonly horsLigne?: { readonly code: 'SYN-FEUILLE-HORS-LIGNE'; readonly libelle: string };
  readonly bouton: {
    readonly code: 'SYN-FEUILLE-BOUTON';
    readonly libelle: string;
    /** Faux hors ligne : `aria-disabled="true"`, bouton toujours focalisable. */
    readonly disponible: boolean;
    /** Présente seulement si le bouton est indisponible. */
    readonly explication?: string;
  };
  /** ERR-011 (Drive plein), ERR-013 (consultation seule, v0.11) ou ERR-016 (échec persistant) ; vide sinon. */
  readonly cartes: ReadonlyArray<CarteErreurFeuille>;
  /**
   * ST-US-017 v0.11 §6.8 n° 4 (rang 11) : carte `ALR-001` (Attention, sans action, non fermable) si et seulement si
   * `estHorlogeDereglee(correctionHorloge)` ; section « Erreurs qui demandent une action » (maquette ECR-011 G).
   */
  readonly alerteHorloge?: {
    readonly code: 'ALR-001';
    readonly titre: string;
    readonly texte: string;
  };
};

/**
 * Ordre de la section « Erreurs qui demandent une action » (ST-US-017 v0.11 §6.8 n° 4, maquette ECR-011 G) : cartes
 * `ERR-011` / `ERR-016`, puis `ALR-001`, puis `ERR-013`.
 */
export const ordreDesCartes = (
  vue: Pick<ModeleVueFeuilleSynchronisation, 'cartes'>,
): {
  readonly avantAlerte: ReadonlyArray<CarteErreurFeuille>;
  readonly apresAlerte: ReadonlyArray<CarteErreurFeuille>;
} => ({
  avantAlerte: vue.cartes.filter((c) => c.message !== 'ERR-013'),
  apresAlerte: vue.cartes.filter((c) => c.message === 'ERR-013'),
});

const modeleDernierEchange = (e: EntreeFeuilleSynchronisation) =>
  e.dernierEchange === undefined
    ? {}
    : {
        dernierEchange: {
          code: 'SYN-FEUILLE-DERNIER-ECHANGE' as const,
          libelle: libelle('SYN-FEUILLE-DERNIER-ECHANGE', {
            anciennete: formaterAnciennete(e.dernierEchange, e.maintenant),
            heure: formaterHeure(e.dernierEchange),
          }),
        },
      };

const modeleAttente = (
  elements: ReadonlyArray<LigneFeuilleOrdonnable>,
): ModeleVueFeuilleSynchronisation['attente'] => {
  if (elements.length === 0) {
    return {
      code: 'SYN-FEUILLE-RIEN-EN-ATTENTE',
      libelle: libelle('SYN-FEUILLE-RIEN-EN-ATTENTE'),
    };
  }
  const n = elements.length;
  return {
    code: 'SYN-FEUILLE-EN-ATTENTE',
    n,
    libelle: libelle('SYN-FEUILLE-EN-ATTENTE', { n }),
    lignes: [...elements].sort(comparerLignesFeuille).map(({ id, intitule }) => ({ id, intitule })),
  };
};

const modeleHorsLigne = (etat: EtatSynchronisationAffichable) =>
  etat.reseau === 'COUPE'
    ? {
        horsLigne: {
          code: 'SYN-FEUILLE-HORS-LIGNE' as const,
          libelle: libelle('SYN-FEUILLE-HORS-LIGNE'),
        },
      }
    : {};

const modeleBouton = (
  etat: EtatSynchronisationAffichable,
): ModeleVueFeuilleSynchronisation['bouton'] => {
  const code = 'SYN-FEUILLE-BOUTON';
  return etat.reseau === 'COUPE'
    ? {
        code,
        libelle: libelle(code),
        disponible: false,
        explication: libelle(code, {}, 'texte'),
      }
    : { code, libelle: libelle(code), disponible: true };
};

const carte = (
  message: CarteErreurFeuille['message'],
  type: ActionCarteFeuille,
  variables: Readonly<Record<string, number>>,
  variante?: 'carte',
): CarteErreurFeuille => {
  const options = variante === undefined ? variables : { ...variables, variante };
  return {
    message,
    titre: libelle(message, options),
    texte: libelle(message, options, 'texte'),
    action: { type, libelle: libelle(message, variables, 'action') },
  };
};

const modeleCartes = (
  etat: EtatSynchronisationAffichable,
  nombreLignes: number,
): ReadonlyArray<CarteErreurFeuille> => {
  if (etat.actionRequise === 'DRIVE_PLEIN') return [carte('ERR-011', 'OUVRIR_GOOGLE_DRIVE', {})];
  if (etat.actionRequise === 'FORMAT_PLUS_RECENT')
    return [carte('ERR-013', 'METTRE_A_JOUR', {}, 'carte')];
  if (etat.actionRequise === 'ECHEC_PERSISTANT') {
    return [carte('ERR-016', 'REESSAYER_MAINTENANT', { n: nombreLignes })];
  }
  return [];
};

/** RG-057 bis / ALR-001 : seul l'appareil qui mesure l'affiche ; ni action, ni fermeture, aucun blocage. */
const modeleAlerteHorloge = (correction: EcartTemps | undefined) =>
  correction !== undefined && estHorlogeDereglee(correction)
    ? {
        alerteHorloge: {
          code: 'ALR-001' as const,
          titre: libelle('ALR-001'),
          texte: libelle('ALR-001', {}, 'texte'),
        },
      }
    : {};

export const construireFeuilleSynchronisation = (
  e: EntreeFeuilleSynchronisation,
): ModeleVueFeuilleSynchronisation => ({
  ...modeleDernierEchange(e),
  attente: modeleAttente(e.elementsEnAttente),
  ...modeleHorsLigne(e.etat),
  bouton: modeleBouton(e.etat),
  cartes: modeleCartes(e.etat, e.elementsEnAttente.length),
  ...modeleAlerteHorloge(e.correctionHorloge),
});
