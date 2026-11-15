import type { Instant } from '../../../commun/domaine/temps/instant';
import type { NomAppareilAffiche } from '../../../commun/presentation/format/appareil';
import { libelle } from '../../../commun/presentation/messages/libelle';
import { SEUIL_RAPPEL_HORS_LIGNE } from '../../domaine/parametres-synchronisation';
import type { EtatSynchronisationAffichable } from './etat-synchronisation-affichable';
import { selectionnerEtatIndicateur } from './indicateur-synchronisation';

export { SEUIL_RAPPEL_HORS_LIGNE } from '../../domaine/parametres-synchronisation';

// Guide §6.6.3, DAT §4.1.5 bis, DEC-025 : au plus un bandeau ; ordre BAN-ACCES-GOOGLE > BAN-CONSULTATION-SEULE > BAN-RAPPEL-24H.
export type ModeleVueBandeau = {
  readonly code: 'BAN-ACCES-GOOGLE' | 'BAN-CONSULTATION-SEULE' | 'BAN-RAPPEL-24H';
  readonly variante?: '24H' | 'session';
  readonly n?: number;
  readonly action?: 'SE_RECONNECTER' | 'METTRE_A_JOUR' | 'REPRENDRE_LA_SYNCHRONISATION';
  readonly fermable: boolean;
  readonly bloquant: false;
  readonly message: 'ERR-010' | 'ERR-013' | 'ALR-002';
};

/** RG-057, DEC-025 : strictement plus de 24 h depuis la plus ancienne modification en attente. */
const rappelDepasse = (e: EtatSynchronisationAffichable, maintenant: Instant): boolean =>
  e.enAttente > 0 &&
  e.plusAncienneEnAttente !== undefined &&
  maintenant - e.plusAncienneEnAttente > SEUIL_RAPPEL_HORS_LIGNE;

const rappel = (e: EtatSynchronisationAffichable): ModeleVueBandeau => {
  const enSession = selectionnerEtatIndicateur(e) === 'SYN-SESSION';
  return {
    code: 'BAN-RAPPEL-24H',
    ...(enSession ? { variante: 'session' as const } : {}),
    n: e.enAttente,
    ...(enSession ? { action: 'REPRENDRE_LA_SYNCHRONISATION' as const } : {}),
    fermable: true,
    bloquant: false,
    message: 'ALR-002',
  };
};

export const construireBandeau = (
  e: EtatSynchronisationAffichable,
  maintenant: Instant,
): ModeleVueBandeau | undefined => {
  const depasse = rappelDepasse(e, maintenant);
  if (e.acces === 'PERDU') {
    return {
      code: 'BAN-ACCES-GOOGLE',
      ...(depasse ? { variante: '24H' as const, n: e.enAttente } : {}),
      action: 'SE_RECONNECTER',
      fermable: false,
      bloquant: false,
      message: 'ERR-010',
    };
  }
  if (e.actionRequise === 'FORMAT_PLUS_RECENT') {
    return {
      code: 'BAN-CONSULTATION-SEULE',
      ...(e.enAttente > 0 ? { n: e.enAttente } : {}),
      action: 'METTRE_A_JOUR',
      fermable: false,
      bloquant: false,
      message: 'ERR-013',
    };
  }
  return depasse && !e.rappelMasque ? rappel(e) : undefined;
};

/** Textes d'un bandeau (guide §6.6.3) : titre, explication, action unique éventuelle, bouton de fermeture. */
export type LibellesBandeau = {
  readonly titre: string;
  readonly texte: string;
  readonly action?: string;
  readonly fermeture?: string;
};

/** Variante du gabarit : celle du modèle, ou « avec-attente » pour la consultation seule qui conserve des modifications. */
const varianteDe = (b: ModeleVueBandeau): string | undefined =>
  b.variante ??
  (b.code === 'BAN-CONSULTATION-SEULE' && b.n !== undefined ? 'avec-attente' : undefined);

const variablesBandeau = (
  b: ModeleVueBandeau,
  appareil: NomAppareilAffiche,
): Readonly<Record<string, string | number>> => {
  const variante = varianteDe(b);
  return {
    appareil,
    ...(b.n === undefined ? {} : { n: b.n }),
    ...(variante === undefined ? {} : { variante }),
  };
};

export const libellesBandeau = (
  b: ModeleVueBandeau,
  appareil: NomAppareilAffiche,
): LibellesBandeau => {
  const variables = variablesBandeau(b, appareil);
  return {
    titre: libelle(b.code, variables),
    texte: libelle(b.code, variables, 'texte'),
    ...(b.action === undefined ? {} : { action: libelle(b.code, variables, 'action') }),
    ...(b.fermable ? { fermeture: libelle(b.code, variables, 'fermeture') } : {}),
  };
};
