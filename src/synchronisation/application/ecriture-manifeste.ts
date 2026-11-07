import { succes, type Resultat } from '../../commun/domaine/resultat';
import type { ContenuManifeste } from '../domaine/contenu-fichier';
import { fusionnerManifestes, manifestesEgaux } from '../domaine/manifeste';
import type { IdFichierDrive } from '../domaine/meta-synchronisation';
import type { ElementDrive, ErreurTransport, TransportSynchro } from './ports/transport-synchro';

// ST-US-017 v0.10.1 §6.7 n° 13 ; DAT v0.11.10 §4.2.2 (d) et (f) : manifeste à plusieurs écrivains, contenu monotone.

/**
 * `ORDINAIRE` (n° 7, n° 14) : un manifeste illisible n'est jamais réécrit ; canonique illisible, la relecture échoue
 * (`FichierIllisible`) et le cycle suivant constate l'altération. `CHOIX` (« Restaurer », « Repartir de zéro »,
 * achèvement, condition C6) : la cible est aussi écrite dans chaque manifeste illisible, doublons compris.
 */
export type ModeEcritureManifeste = 'ORDINAIRE' | 'CHOIX';

/** Manifeste canonique après l'écriture, et son contenu relu. */
export type ManifesteEcrit = { readonly id: IdFichierDrive; readonly contenu: ContenuManifeste };

type Releve = {
  /** Manifestes présents, en ordre canonique, avec leur contenu s'il est lisible. */
  readonly presents: ReadonlyArray<{
    readonly element: ElementDrive;
    readonly contenu: ContenuManifeste | undefined;
  }>;
};

type Ecriture<T> = Promise<Resultat<T, ErreurTransport>>;

/** Inventaire du dossier et lecture de chaque manifeste (introuvable : omis ; illisible : sans contenu). */
const relever = async (transport: TransportSynchro, dossier: IdFichierDrive): Ecriture<Releve> => {
  const inventaire = await transport.inventorierDossier(dossier);
  if (!inventaire.ok) return inventaire;
  const presents: Array<Releve['presents'][number]> = [];
  for (const element of inventaire.valeur.manifestes) {
    const lu = await transport.lireContenuManifeste(element.id);
    if (lu.ok) {
      presents.push({ element, contenu: lu.valeur });
    } else if (lu.erreur.type === 'FichierIllisible') {
      presents.push({ element, contenu: undefined });
    } else if (lu.erreur.type !== 'RessourceIntrouvable') {
      // Format plus récent compris : jamais réécrit (RG-058) ; le cycle suivant s'arrête au contrôle 2.
      return lu;
    }
  }
  return succes({ presents });
};

const joindre = (contenus: ReadonlyArray<ContenuManifeste | undefined>, apport: ContenuManifeste) =>
  contenus.reduce<ContenuManifeste>(
    (cible, c) => (c === undefined ? cible : fusionnerManifestes(cible, c)),
    apport,
  );

/**
 * Écriture monotone du manifeste (n° 13) : inventaire ; contenus lisibles lus ; cible = jointure des lus et de
 * `apport`. Aucun manifeste : création, puis nouvel inventaire ; si le manifeste créé n'est pas le canonique (création
 * concurrente), la jointure est écrite dans le canonique et le doublon créé par cet appareil est supprimé. Sinon, le
 * canonique est remplacé s'il diffère de la cible (et, en mode `CHOIX`, chaque manifeste illisible). Enfin une
 * relecture du canonique, réécrit une fois s'il est inférieur à la cible. Un doublon que l'appareil n'a pas créé n'est
 * jamais supprimé ; lisible, il n'est jamais réécrit.
 */
export const ecrireManifesteMonotone = async (
  transport: TransportSynchro,
  p: {
    readonly dossier: IdFichierDrive;
    readonly apport: ContenuManifeste;
    readonly mode: ModeEcritureManifeste;
  },
): Ecriture<ManifesteEcrit> => {
  const releve = await relever(transport, p.dossier);
  if (!releve.ok) return releve;
  const { presents } = releve.valeur;
  const cible = joindre(
    presents.map((m) => m.contenu),
    p.apport,
  );
  const [canonique] = presents;
  if (canonique === undefined) return creer(transport, p.dossier, cible);
  const remplace = await remplacer(transport, p, presents, cible);
  if (!remplace.ok) return remplace;
  return verifier(transport, p.dossier, { id: canonique.element.id, contenu: cible });
};

/**
 * Remplacement par la cible du canonique (le premier des présents) s'il en diffère et, en mode `CHOIX`, de chaque
 * manifeste illisible ; un doublon lisible n'est jamais réécrit.
 */
const remplacer = async (
  transport: TransportSynchro,
  { dossier, mode }: { readonly dossier: IdFichierDrive; readonly mode: ModeEcritureManifeste },
  presents: Releve['presents'],
  cible: ContenuManifeste,
): Ecriture<undefined> => {
  const [canonique] = presents;
  const choix = mode === 'CHOIX';
  for (const m of presents) {
    const aEcrire =
      m.contenu === undefined ? choix : m === canonique && !manifestesEgaux(m.contenu, cible);
    if (aEcrire) {
      const ecrit = await transport.ecrireManifeste({
        dossier,
        contenu: cible,
        fichierExistant: m.element.id,
      });
      if (!ecrit.ok) return ecrit;
    }
  }
  return succes(undefined);
};

/** Création ; si une création concurrente a donné un canonique plus ancien, jointure écrite dedans et doublon supprimé. */
const creer = async (
  transport: TransportSynchro,
  dossier: IdFichierDrive,
  cible: ContenuManifeste,
): Ecriture<ManifesteEcrit> => {
  const cree = await transport.ecrireManifeste({ dossier, contenu: cible });
  if (!cree.ok) return cree;
  const releve = await relever(transport, dossier);
  if (!releve.ok) return releve;
  const [canonique] = releve.valeur.presents;
  if (canonique === undefined || canonique.element.id === cree.valeur) {
    return verifier(transport, dossier, { id: cree.valeur, contenu: cible });
  }
  const jointure = joindre([canonique.contenu], cible);
  if (canonique.contenu === undefined || !manifestesEgaux(canonique.contenu, jointure)) {
    const ecrit = await transport.ecrireManifeste({
      dossier,
      contenu: jointure,
      fichierExistant: canonique.element.id,
    });
    if (!ecrit.ok) return ecrit;
  }
  const supprime = await transport.supprimerFichier(cree.valeur);
  if (!supprime.ok) return supprime;
  return verifier(transport, dossier, { id: canonique.element.id, contenu: jointure });
};

/** Relecture du canonique : réécrit une fois avec la jointure s'il est inférieur à la cible (écriture concurrente). */
const verifier = async (
  transport: TransportSynchro,
  dossier: IdFichierDrive,
  ecrit: ManifesteEcrit,
): Ecriture<ManifesteEcrit> => {
  const relu = await transport.lireContenuManifeste(ecrit.id);
  if (!relu.ok) return relu;
  const jointure = fusionnerManifestes(relu.valeur, ecrit.contenu);
  if (jointure === relu.valeur) return succes({ id: ecrit.id, contenu: relu.valeur });
  const reecrit = await transport.ecrireManifeste({
    dossier,
    contenu: jointure,
    fichierExistant: ecrit.id,
  });
  return reecrit.ok ? succes({ id: ecrit.id, contenu: jointure }) : reecrit;
};
