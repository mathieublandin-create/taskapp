import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import type { EntreeJournal } from './journal';

const COLONNES: readonly (keyof EntreeJournal)[] = [
  'id',
  'horodatageUtc',
  'horodatageLocal',
  'appareil',
  'mesure',
  'etape',
  'operation',
  'resultat',
  'codeHttp',
  'codeErreur',
  'echeanceJeton',
  'hasGrantedAllScopes',
  'detail',
];

/** Sans contexte : tableau d'entrées. Avec contexte : objet `{ contexte, entrees }` (en-tête). */
export function exporterJson(entrees: readonly EntreeJournal[], contexte?: string): string {
  return JSON.stringify(contexte === undefined ? entrees : { contexte, entrees }, null, 2);
}

function celluleCsv(valeur: unknown): string {
  const texte = valeur === undefined ? '' : String(valeur);
  return /[",\n\r;]/.test(texte) ? `"${texte.replaceAll('"', '""')}"` : texte;
}

/** Avec contexte : première ligne `# contexte : …` (mode d'affichage, plateforme). */
export function exporterCsv(entrees: readonly EntreeJournal[], contexte?: string): string {
  const lignes = entrees.map((e) => COLONNES.map((c) => celluleCsv(e[c])).join(','));
  const entete = contexte === undefined ? [] : [`# contexte : ${contexte.replaceAll('\n', ' ')}`];
  return [...entete, COLONNES.join(','), ...lignes].join('\n');
}

/** Télécharge (PC) ou partage (Android) le contenu exporté. Aucun réseau. */
export async function livrerExport(
  nomFichier: string,
  contenu: string,
  mime: string,
): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Share.share({ title: nomFichier, text: contenu, dialogTitle: nomFichier });
    return;
  }
  const url = URL.createObjectURL(new Blob([contenu], { type: mime }));
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier;
  lien.click();
  URL.revokeObjectURL(url);
}

export function copier(contenu: string): Promise<void> {
  return navigator.clipboard.writeText(contenu);
}
