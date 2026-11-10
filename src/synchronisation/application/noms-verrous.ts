import { nonImplemente } from '@non-implemente';

// ST-US-031 v0.4 §4.1 (rang 13, tranche B1) ; DAT v0.11.12 §4.1.6 : noms des deux verrous d'un espace de compte.
// `nomEspace` : `donejuan-<env>-<empreinte du sub>` (ST-US-022 §6), jamais le `sub` ni l'adresse.

/** `${nomEspace}:synchronisation-meneur`, tenu par l'onglet meneur tant qu'il l'est. */
export const nomVerrouMeneur = (nomEspace: string): string =>
  nonImplemente(`nomVerrouMeneur(${nomEspace})`);

/** `${nomEspace}:synchronisation-cycle`, autour de chaque cycle, jusqu'à la mise à jour de `deposeJusquA`. */
export const nomVerrouCycle = (nomEspace: string): string =>
  nonImplemente(`nomVerrouCycle(${nomEspace})`);
