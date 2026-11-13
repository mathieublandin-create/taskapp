import type {
  EntreeJournalTechnique,
  JournalTechnique,
} from '../application/ports/journal-technique';

// conventions.md §9.4 : masquage défensif (jetons `ya29.`, `Bearer`, `access_token=`, adresses e-mail).
// Le texte masqué est remplacé par « [masqué] ». L'adaptateur JournalTechniqueLocal l'applique à chaque champ texte.
export const MASQUE = '[masqué]';

const MOTIFS_SENSIBLES: ReadonlyArray<RegExp> = [
  /ya29\.[\w.-]+/g,
  /Bearer\s+[\w.~+/=-]+/g,
  /access_token=[^&\s]*/g,
  /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g,
];

export const masquerDonneesSensibles = (texte: string): string =>
  MOTIFS_SENSIBLES.reduce((courant, motif) => courant.replace(motif, MASQUE), texte);

type ChampsJournal = NonNullable<EntreeJournalTechnique['champs']>;

const masquerChamps = (champs: ChampsJournal): ChampsJournal =>
  Object.fromEntries(
    Object.entries(champs).map(([nom, valeur]) => [
      nom,
      typeof valeur === 'string' ? masquerDonneesSensibles(valeur) : valeur,
    ]),
  );

/** Destination du journal technique local (tampon persistant : base technique, rang 1). */
export type PuitsJournal = (entree: EntreeJournalTechnique) => void;

/** Journal technique local : applique le masquage défensif à chaque champ texte avant écriture. */
export class JournalTechniqueLocal implements JournalTechnique {
  constructor(private readonly puits: PuitsJournal) {}

  consigner(entree: EntreeJournalTechnique): void {
    this.puits({
      niveau: entree.niveau,
      evenement: masquerDonneesSensibles(entree.evenement),
      ...(entree.champs === undefined ? {} : { champs: masquerChamps(entree.champs) }),
    });
  }
}
