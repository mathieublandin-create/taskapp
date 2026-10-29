/**
 * Lecture du Drive simulé d'un compte par les étapes (ST-US-017 §12.1 n° 11) : les fichiers d'appareil valides
 * sont décodés par le format v1 réel, fusionnés, puis projetés comme l'état métier d'un appareil. Lecture des
 * données d'un compte sur les appareils du banc (ST-US-022 §12.1 n° 43).
 */
import assert from 'node:assert/strict';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import type { EtatMetier } from '@src/synchronisation/domaine/etat-metier';
import { ETAT_LOCAL_VIDE } from '@src/synchronisation/domaine/etat-local';
import { fusionnerEtats, type EtatFusionnable } from '@src/synchronisation/domaine/fusion';
import { cleEnTexte } from '@src/synchronisation/domaine/information';
import { projeterEtatMetier } from '@src/synchronisation/domaine/projection';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { decoderFichierAppareil } from '@src/synchronisation/infrastructure/drive/format-v1';
import type { FauxDrive } from '../../doublures/faux-drive';
import type { AppareilSimule } from '../banc/appareil-simule';
import { nomEspaceDuCompte, espaceExiste } from '../compte/etapes-compte';
import type { MondeDoneJuan } from '../monde';

const VIDE: EtatFusionnable = { registres: new Map(), journal: new Map() };
const APPAREIL_LECTEUR = '00000000-0000-7000-8000-0000000000ff' as IdAppareil;

/** État métier du Drive : fusion de tous les fichiers d'appareil lisibles. */
export const etatMetierDuDrive = async (drive: FauxDrive): Promise<EtatMetier> => {
  const fichiers = drive
    .fichiers()
    .filter((f) => !f.supprime && f.appProperties['donejuan'] === 'appareil');
  let fusion = VIDE;
  for (const fichier of fichiers) {
    const contenu = await decoderFichierAppareil(fichier.octets);
    if (!contenu.ok) continue;
    fusion = fusionnerEtats(fusion, {
      registres: new Map(contenu.valeur.registres.map((r) => [cleEnTexte(r.cle), r])),
      journal: new Map(contenu.valeur.journal.map((e) => [e.id, e])),
    });
  }
  return projeterEtatMetier({ ...ETAT_LOCAL_VIDE(APPAREIL_LECTEUR), ...fusion });
};

/** Objectifs non supprimés du Drive qui portent cet intitulé. */
export const objectifsDuDrive = async (drive: FauxDrive, intitule: string) =>
  [...(await etatMetierDuDrive(drive)).objectifs.values()].filter(
    (o) => !o.supprime && o.intitule === intitule,
  );

/** Identifiants des objectifs et des tâches d'un état métier. */
export const identifiantsDe = (etat: EtatMetier): ReadonlySet<string> =>
  new Set<string>([...etat.objectifs.keys(), ...etat.taches.keys()]);

/** Données d'un compte sur un appareil du banc : son espace local, lu sans le créer ; vide s'il n'existe pas. */
const identifiantsDansEspace = async (
  monde: MondeDoneJuan,
  appareil: AppareilSimule,
  nomCompte: string,
): Promise<ReadonlySet<string>> => {
  const nomBase = await nomEspaceDuCompte(monde, nomCompte);
  if (!(await espaceExiste(appareil, nomBase))) return new Set();
  const espace = await DepotLocalDexie.ouvrirEspace({
    nomBase,
    fabrique: appareil.fabrique,
    generateur: { genererUuidV7: () => assert.fail('espace recréé') },
  });
  assert.ok(espace.ok, `Espace du compte ${nomCompte} illisible`);
  try {
    const etat = await espace.valeur.lire();
    assert.ok(etat.ok, `Espace du compte ${nomCompte} illisible`);
    return identifiantsDe(projeterEtatMetier(etat.valeur));
  } finally {
    espace.valeur.fermer();
  }
};

/** Toutes les données connues d'un compte : son Drive et ses espaces sur les appareils du banc. */
export const identifiantsDuCompte = async (
  monde: MondeDoneJuan,
  nomCompte: string,
): Promise<ReadonlySet<string>> => {
  const ids = new Set(identifiantsDe(await etatMetierDuDrive(monde.banc.google.drive(nomCompte))));
  for (const appareil of monde.banc.appareils()) {
    (await identifiantsDansEspace(monde, appareil, nomCompte)).forEach((id) => ids.add(id));
  }
  return ids;
};
