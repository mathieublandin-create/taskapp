/**
 * Outils des étapes d'objectifs (ST-US-001 §12) : cas d'usage de l'appareil, résolution des intitulés
 * (conventions.md §11.7), lignes de la liste et détail construits comme l'interface.
 */
import assert from 'node:assert/strict';
import type { IdObjectif } from '@src/commun/domaine/identifiants';
import type { ObjectifsTaches } from '@src/composition/objectifs-taches';
import {
  construireDetailObjectif,
  construireListeObjectifs,
  type LigneObjectif,
  type ModeleVueDetailObjectif,
  type ModeleVueListeObjectifs,
  type ResumeObjectif,
} from '@src/objectifs-taches';
import type { AppareilSimule } from './banc/appareil-simule';
import type { MondeDoneJuan } from './monde';
import { valeurDe } from './environnement';

const NATURE = 'objectif';

/** Cas d'usage des objectifs de l'appareil (application ouverte, session ouverte). */
export const objectifsDe = async (appareil: AppareilSimule): Promise<ObjectifsTaches> => {
  const objectifs = (await appareil.assurerOuverte()).objectifs();
  assert.ok(objectifs, `Aucun espace de compte ouvert sur le ${appareil.nom}`);
  return objectifs;
};

export const resumesDe = async (appareil: AppareilSimule): Promise<ReadonlyArray<ResumeObjectif>> =>
  valeurDe(await (await objectifsDe(appareil)).consulterObjectifs.executer()).objectifs;

/** Identifiant de l'objectif désigné par son intitulé (conventions.md §11.7). */
export const resoudreObjectif = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  intitule: string,
): Promise<IdObjectif> =>
  monde.references.resoudre<IdObjectif>(
    NATURE,
    intitule,
    (await resumesDe(appareil)).map((o) => ({ id: o.id, intitule: o.intitule, supprime: false })),
  );

export const memoriserObjectif = (monde: MondeDoneJuan, intitule: string, id: IdObjectif): void => {
  monde.references.memoriser(NATURE, intitule, id);
};

export const listeObjectifsDe = async (
  appareil: AppareilSimule,
): Promise<ModeleVueListeObjectifs> => {
  const { objectifs } = valeurDe(await (await objectifsDe(appareil)).consulterObjectifs.executer());
  return construireListeObjectifs({ objectifs }, { horloge: appareil.horloge });
};

export const detailObjectifDe = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  intitule: string,
): Promise<ModeleVueDetailObjectif> => {
  const id = await resoudreObjectif(monde, appareil, intitule);
  const detail = valeurDe(await (await objectifsDe(appareil)).consulterDetailObjectif.executer(id));
  return construireDetailObjectif(detail, { horloge: appareil.horloge });
};

/** Ligne de la liste (section principale ou « Atteints ») de l'objectif désigné. */
export const ligneObjectifDe = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  intitule: string,
): Promise<LigneObjectif> => {
  const id = await resoudreObjectif(monde, appareil, intitule);
  const liste = await listeObjectifsDe(appareil);
  const ligne = [...liste.lignes, ...(liste.sectionAtteints?.lignes ?? [])].find(
    (l) => l.id === id,
  );
  assert.ok(ligne, `L'objectif « ${intitule} » n'existe pas sur le ${appareil.nom}`);
  return ligne;
};

/** n objectifs « Préparation 1 » à « Préparation n », créés sans dépôt dans le Drive (ST-US-022 §12.1 n° 29 et 30). */
export const creerObjectifsEnAttente = async (
  appareil: AppareilSimule,
  n: number,
): Promise<void> => {
  const { creerObjectif } = await objectifsDe(appareil);
  for (let numero = 1; numero <= n; numero += 1) {
    valeurDe(await creerObjectif.executer({ intitule: `Préparation ${String(numero)}` }));
  }
};
