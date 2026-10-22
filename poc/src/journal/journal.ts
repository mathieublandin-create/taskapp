export type Mesure = 'R1' | 'R2' | 'R3' | 'R11' | 'R12' | 'R15' | 'R16-T' | '3.5' | 'Redirection' | 'Général';

export const MESURES: readonly Mesure[] = ['R11', 'R1', 'R2', 'R3', 'R12', 'R15', 'R16-T', '3.5', 'Redirection'];

export interface EntreeJournal {
  id: string;
  horodatageUtc: string;
  horodatageLocal: string;
  appareil: string;
  mesure: Mesure;
  /** Étape du protocole, par exemple « 3.2.4 ». */
  etape: string;
  operation: string;
  resultat: string;
  codeHttp?: number;
  codeErreur?: string;
  /** Échéance du jeton, en ISO UTC. */
  echeanceJeton?: string;
  hasGrantedAllScopes?: boolean;
  detail: string;
}

export type DonneesEntree = Omit<
  EntreeJournal,
  'id' | 'horodatageUtc' | 'horodatageLocal' | 'appareil' | 'etape' | 'detail'
> & { etape?: string; detail?: string };

export interface StockageJournal {
  charger(): Promise<EntreeJournal[]>;
  ajouter(entree: EntreeJournal): Promise<void>;
  vider(): Promise<void>;
}

const REMPLACEMENT = '[MASQUÉ]';
/** Motifs de secrets : jeton d'accès Google, jeton d'identité (JWT), code d'autorisation. */
const MOTIFS_SECRETS: readonly RegExp[] = [
  /Bearer\s+[\w.~+/-]+=*/gi,
  /ya29\.[\w-]+/g,
  /eyJ[\w-]+\.[\w-]+\.[\w-]*/g,
  /\b4\/[\w-]{20,}/g,
];

const MOTIF_CLE_VALEUR =
  /(access_token|id_token|refresh_token|code|authorization)(["']?\s*[:=]\s*["']?)[^\s"',&]+/gi;

export class Journal {
  private readonly secretsConnus = new Set<string>();

  constructor(
    private readonly stockage: StockageJournal,
    private readonly appareil: string,
    private readonly horloge: () => Date = () => new Date(),
  ) {}

  /** Enregistre une valeur secrète : toute occurrence sera masquée dans le journal. */
  declarerSecret(valeur: string): void {
    if (valeur.length >= 8) this.secretsConnus.add(valeur);
  }

  /** Retire toute valeur de jeton, de code ou de jeton d'identité d'un texte. */
  masquer(texte: string): string {
    let resultat = texte;
    for (const secret of this.secretsConnus) resultat = resultat.split(secret).join(REMPLACEMENT);
    for (const motif of MOTIFS_SECRETS) resultat = resultat.replace(motif, REMPLACEMENT);
    return resultat.replace(MOTIF_CLE_VALEUR, `$1$2${REMPLACEMENT}`);
  }

  private masquerChamps(entree: EntreeJournal): EntreeJournal {
    const masquee = Object.fromEntries(
      Object.entries(entree).map(([cle, valeur]) => [
        cle,
        typeof valeur === 'string' ? this.masquer(valeur) : valeur,
      ]),
    );
    return masquee as unknown as EntreeJournal;
  }

  async enregistrer(donnees: DonneesEntree): Promise<EntreeJournal> {
    const maintenant = this.horloge();
    const brute: EntreeJournal = {
      ...donnees,
      id: crypto.randomUUID(),
      horodatageUtc: maintenant.toISOString(),
      horodatageLocal: maintenant.toLocaleString('fr-FR'),
      appareil: this.appareil,
      etape: donnees.etape ?? '',
      detail: donnees.detail ?? '',
    };
    const entree = this.masquerChamps(brute);
    await this.stockage.ajouter(entree);
    return entree;
  }

  async lire(): Promise<EntreeJournal[]> {
    const entrees = await this.stockage.charger();
    return [...entrees].sort((a, b) => b.horodatageUtc.localeCompare(a.horodatageUtc));
  }

  vider(): Promise<void> {
    return this.stockage.vider();
  }
}
