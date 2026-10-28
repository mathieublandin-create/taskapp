import type { Horloge } from '../../application/ports/horloge';
import { FUSEAU_REFERENCE } from '../../domaine/temps/fuseau-reference';
import { libelle } from '../messages/libelle';

// RG-054, guide §4.21 : présente si et seulement si le fuseau de l'appareil diffère de Paris ; jamais sur un délai.
export type MentionHeureParis = { readonly code: 'MEN-HEURE-PARIS'; readonly libelle: string };

export const mentionHeureParis = (
  horloge: Horloge,
): { readonly mentionHeureParis?: MentionHeureParis } =>
  horloge.fuseauAppareil() === FUSEAU_REFERENCE
    ? {}
    : { mentionHeureParis: { code: 'MEN-HEURE-PARIS', libelle: libelle('MEN-HEURE-PARIS') } };
