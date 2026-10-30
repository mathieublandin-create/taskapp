/**
 * Construction des contextes de tâches (ST-US-002 §12.1, H-7, glossaire d'étapes §1) : « les tâches suivantes : » et
 * « l'objectif … a n tâches à faire, … ». Chaque tâche est créée par les cas d'usage de l'appareil ; tout refus fait
 * échouer l'étape. Les capacités des rangs suivants (sous-tâche, terminer, abandonner) lèvent une ErreurProgrammation
 * tant qu'elles ne sont pas livrées : la sélection des scénarios par rang garantit qu'elles ne sont pas appelées.
 */
import assert from 'node:assert/strict';
import type { DataTable } from '@cucumber/cucumber';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { DateCalendaire } from '@src/commun/domaine/temps/date-calendaire';
import { jourDeReference } from '@src/commun/domaine/temps/jour-de-reference';
import { convertirDuree } from './conversions';
import { memoriserTache } from './taches';
import { objectifsDe, resoudreObjectif } from './objectifs';
import type { ContexteEtape } from './prefixes';
import { etablirDansLeDrive } from './synchronisation/echanges';
import { date } from './valeurs';

const ESTIMATION_TECHNIQUE_MINUTES = 30; // tâche parente sans estimation (H-7)
const ESTIMATION_PAR_DEFAUT_MINUTES = 60;
const DELAI_PAR_DEFAUT_JOURS = 7;

export type EtatContexte = 'à faire' | 'terminée' | 'abandonnée';

export type LigneContexte = {
  readonly intitule: string;
  readonly etat: EtatContexte;
  readonly delai: string;
  readonly estimation: string;
  readonly objectifs: ReadonlyArray<string>;
  readonly tacheParente: string;
  readonly dateFin: string;
  readonly dateAbandon: string;
};

export type SaisieTacheTest = {
  readonly intitule: string;
  readonly delai?: string;
  readonly estimationMinutes?: number;
  readonly objectifs: ReadonlyArray<string>;
};

const ETATS: ReadonlyArray<string> = ['à faire', 'terminée', 'abandonnée'];

/** Intitulés d'objectifs d'une cellule, séparés par « , » ; cellule vide : aucun. */
export const separerIntitules = (cellule: string): ReadonlyArray<string> =>
  cellule
    .split(',')
    .map((intitule) => intitule.trim())
    .filter((intitule) => intitule !== '');

const etatDeLaLigne = (valeur: string): EtatContexte => {
  assert.ok(ETATS.includes(valeur), `État inconnu : « ${valeur} »`);
  return valeur as EtatContexte;
};

export const lireLignesContexte = (tableau: DataTable): ReadonlyArray<LigneContexte> =>
  tableau.hashes().map((ligne) => ({
    intitule: ligne['intitulé'] ?? '',
    etat: etatDeLaLigne(ligne['état'] ?? 'à faire'),
    delai: ligne['délai'] ?? '',
    estimation: ligne['estimation'] ?? '',
    objectifs: separerIntitules(ligne['objectifs'] ?? ''),
    tacheParente: ligne['tâche parente'] ?? '',
    dateFin: ligne['date de fin'] ?? '',
    dateAbandon: ligne["date d'abandon"] ?? '',
  }));

/** `CreerTache` : un champ vide est absent (le cas d'usage le refuse) ; une estimation invalide l'atteint telle quelle. */
export const creerTache = async ({ monde, appareil }: ContexteEtape, saisie: SaisieTacheTest) => {
  const objectifIds = [];
  for (const objectif of saisie.objectifs) {
    objectifIds.push(await resoudreObjectif(monde, appareil, objectif));
  }
  const resultat = await (
    await objectifsDe(appareil)
  ).creerTache.executer({
    intitule: saisie.intitule,
    ...(saisie.delai === undefined ? {} : { delai: date(saisie.delai) }),
    ...(saisie.estimationMinutes === undefined
      ? {}
      : { estimationMinutes: saisie.estimationMinutes }),
    objectifIds,
  });
  if (resultat.ok) memoriserTache(monde, saisie.intitule.trim(), resultat.valeur);
  return resultat;
};

const capaciteNonLivree = (rang: number): ErreurProgrammation =>
  new ErreurProgrammation(`capacité livrée au rang ${String(rang)}`);

/** Étape 0 de H-7 : une tâche parente terminée ou abandonnée ne peut avoir de sous-tâche à faire. */
const verifierCoherence = (lignes: ReadonlyArray<LigneContexte>): void => {
  for (const ligne of lignes.filter((l) => l.tacheParente !== '')) {
    const parente = lignes.find((l) => l.intitule === ligne.tacheParente);
    assert.ok(parente, `Tâche parente « ${ligne.tacheParente} » absente du tableau`);
    assert.ok(
      ligne.etat !== 'à faire' || parente.etat === 'à faire',
      `Incohérence : « ${ligne.intitule} » est à faire sous la tâche parente ${parente.etat} « ${parente.intitule} »`,
    );
  }
};

const estimationDe = (ligne: LigneContexte, lignes: ReadonlyArray<LigneContexte>): number => {
  if (ligne.estimation !== '') return convertirDuree(ligne.estimation);
  assert.ok(
    lignes.some((autre) => autre.tacheParente === ligne.intitule),
    `Estimation absente pour « ${ligne.intitule} », qui n'est la tâche parente d'aucune ligne`,
  );
  return ESTIMATION_TECHNIQUE_MINUTES;
};

const creerLigne = async (
  contexte: ContexteEtape,
  ligne: LigneContexte,
  lignes: ReadonlyArray<LigneContexte>,
): Promise<void> => {
  if (ligne.tacheParente !== '') throw capaciteNonLivree(6);
  const resultat = await creerTache(contexte, {
    intitule: ligne.intitule,
    delai: ligne.delai,
    estimationMinutes: estimationDe(ligne, lignes),
    objectifs: ligne.objectifs,
  });
  assert.ok(resultat.ok, `Création de « ${ligne.intitule} » refusée : ${JSON.stringify(resultat)}`);
};

/** « les tâches suivantes : » — création dans l'ordre du tableau, puis états (rangs 7 et 8). */
export const lesTachesSuivantes = async (
  contexte: ContexteEtape,
  lignes: ReadonlyArray<LigneContexte>,
): Promise<void> => {
  verifierCoherence(lignes);
  for (const ligne of lignes) await creerLigne(contexte, ligne, lignes);
  for (const ligne of lignes) {
    if (ligne.etat === 'terminée') throw capaciteNonLivree(7);
    if (ligne.etat === 'abandonnée') throw capaciteNonLivree(8);
  }
  await etablirDansLeDrive(contexte);
};

/** « l'objectif … a a tâches à faire, t terminées et ab abandonnées » : tâches « <objectif> — tâche <n> ». */
export const lObjectifAUnNombreDeTaches = async (
  contexte: ContexteEtape,
  objectif: string,
  nombres: { readonly aFaire: number; readonly terminees: number; readonly abandonnees: number },
): Promise<void> => {
  const total = nombres.aFaire + nombres.terminees + nombres.abandonnees;
  const delai = DateCalendaire.ajouterJours(
    jourDeReference(contexte.appareil.horloge.maintenant()),
    DELAI_PAR_DEFAUT_JOURS,
  );
  for (let numero = 1; numero <= total; numero += 1) {
    const resultat = await creerTache(contexte, {
      intitule: `${objectif} — tâche ${String(numero)}`,
      delai,
      estimationMinutes: ESTIMATION_PAR_DEFAUT_MINUTES,
      objectifs: [objectif],
    });
    assert.ok(resultat.ok, `Création refusée : ${JSON.stringify(resultat)}`);
  }
  if (nombres.terminees > 0) throw capaciteNonLivree(7);
  if (nombres.abandonnees > 0) throw capaciteNonLivree(8);
  await etablirDansLeDrive(contexte);
};
