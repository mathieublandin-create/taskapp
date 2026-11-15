import { gunzipSync, gzipSync } from 'node:zlib';

/**
 * Drive v3 REST simulé derrière `fetch` (ST-US-017 §4.4, §7 ; UT-COMP-US-017) : exerce `TransportSynchroDrive` et
 * `ClientGoogle` réels, sans réseau. Couvre les requêtes de l'adaptateur : `files.list` (q par `appProperties`,
 * parent, corbeille ; pages), création de dossier (JSON), envoi `multipart` et remplacement `media`, lecture
 * `alt=media`, `changes.getStartPageToken` et `changes.list` (pages ; jeton refusé → 404).
 * Pilotage : `retirerAcces()` (401), `taillePage`, `modifierALaMain(id)`, `pendantLeProchainInventaire(rappel)`,
 * `invaliderJetons()`, `repondre(statut, corps?)` (prochaine réponse forcée) ; observation : `requetes`, `etatDe(id)`.
 * v0.10.1 (condition C5) : `files.list` ne masque la corbeille que si `q` contient `trashed = false` ; `files.update`
 * `{ trashed: true }` (corbeille) et `files.delete` (définitif) sont simulés.
 */
type FichierHttp = {
  readonly id: string;
  readonly name: string;
  readonly mimeType: string;
  readonly appProperties: Readonly<Record<string, string>>;
  readonly parents: ReadonlyArray<string>;
  octets: Uint8Array;
  readonly createdTime: string;
  trashed: boolean;
  /** `version` de Drive (chaîne) : croît à chaque modification du contenu (v0.10.1, condition C4). */
  version: number;
};

const json = (corps: unknown, statut = 200): Response =>
  new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json' },
  });

/** Corps `multipart/related` : métadonnées JSON (première partie), puis octets du contenu. */
const lireMultipart = (
  octets: Uint8Array,
  separateur: string,
): { readonly metadonnees: Record<string, unknown>; readonly contenu: Uint8Array } => {
  const texte = Buffer.from(octets).toString('latin1');
  const parties = texte.split(`--${separateur}`);
  const [, entete1 = '', entete2 = ''] = parties;
  const metadonnees = JSON.parse(
    Buffer.from(entete1.slice(entete1.indexOf('\r\n\r\n') + 4).trimEnd(), 'latin1').toString(
      'utf8',
    ),
  ) as Record<string, unknown>;
  const debut = entete2.indexOf('\r\n\r\n') + 4;
  const contenu = Buffer.from(entete2.slice(debut, entete2.length - 2), 'latin1');
  return { metadonnees, contenu: new Uint8Array(contenu) };
};

/** Conditions `q` utilisées par l'adaptateur. */
const filtreDe = (q: string) => {
  const donejuan = /key='donejuan' and value='([^']+)'/.exec(q)?.[1];
  const appareil = /key='appareil' and value='([^']+)'/.exec(q)?.[1];
  const parent = /'([^']+)' in parents/.exec(q)?.[1];
  const dossier = q.includes("mimeType = 'application/vnd.google-apps.folder'");
  // Comme Drive v3 : sans `trashed = false` dans `q`, la corbeille est listée (v0.10.1, condition C5).
  const horsCorbeille = q.includes('trashed = false');
  return (f: FichierHttp): boolean =>
    (!horsCorbeille || !f.trashed) &&
    (donejuan === undefined || f.appProperties['donejuan'] === donejuan) &&
    (appareil === undefined || f.appProperties['appareil'] === appareil) &&
    (parent === undefined || f.parents.includes(parent)) &&
    (!dossier || f.mimeType === 'application/vnd.google-apps.folder');
};

/** Métadonnées d'un fichier telles que Drive les décrit ; `restreindre` ne garde que celles de `fields`. */
const descriptionDe = (f: FichierHttp): Record<string, unknown> => ({
  id: f.id,
  name: f.name,
  appProperties: f.appProperties,
  parents: f.parents,
  trashed: f.trashed,
  createdTime: f.createdTime,
  modifiedTime: f.createdTime,
  version: String(f.version),
});

/** Champs demandés par `fields=` : liste de premier niveau, ou contenu de `racine(…)` ; absent : tout. */
const champsDe = (url: URL, racine: string): string | null => {
  const fields = url.searchParams.get('fields');
  if (fields === null) return null;
  const debut = fields.indexOf(`${racine}(`);
  if (debut < 0) return '';
  const interieur = fields.slice(debut + racine.length + 1);
  return interieur.slice(0, interieur.indexOf(')'));
};

const restreindre = (
  description: Record<string, unknown>,
  champs: string | null,
): Record<string, unknown> =>
  champs === null
    ? description
    : Object.fromEntries(
        champs.split(',').flatMap((c) => (c in description ? [[c, description[c]]] : [])),
      );

export class DriveHttpSimule {
  readonly requetes: Array<{ readonly methode: string; readonly url: string }> = [];
  taillePage = 1000;
  readonly #fichiers: Array<FichierHttp> = [];
  readonly #changements: Array<{ readonly sequence: number; readonly id: string }> = [];
  #sequence = 0;
  #epoque = 0;
  #numero = 0;
  #accesRetire = false;
  #pendantInventaire: (() => Promise<void>) | undefined;
  #forcees: Array<Response> = [];

  readonly fetch: typeof fetch = (entree, init) =>
    this.#traiter(
      typeof entree === 'string' ? entree : entree instanceof URL ? entree.href : entree.url,
      init ?? {},
    );

  retirerAcces(): void {
    this.#accesRetire = true;
  }

  repondre(statut: number, corps: unknown = {}): void {
    this.#forcees.push(json(corps, statut));
  }

  pendantLeProchainInventaire(rappel: () => Promise<void>): void {
    this.#pendantInventaire = rappel;
  }

  invaliderJetons(): void {
    this.#epoque += 1;
  }

  /** Change une valeur du JSON du fichier, en gardant un gzip valide et l'ancienne empreinte (V-02). */
  modifierALaMain(id: string): void {
    const fichier = this.#fichiers.find((f) => f.id === id);
    if (fichier === undefined) throw new Error(`Fichier inconnu : ${id}`);
    const compresse = fichier.mimeType === 'application/gzip';
    const brut = compresse ? gunzipSync(fichier.octets) : Buffer.from(fichier.octets);
    const objet = JSON.parse(brut.toString('utf8')) as Record<string, unknown>;
    objet['versionApplication'] = 'modifié à la main';
    const modifie = Buffer.from(JSON.stringify(objet), 'utf8');
    fichier.octets = new Uint8Array(compresse ? gzipSync(modifie) : modifie);
    fichier.version += 1;
  }

  /** Met un fichier à la corbeille (changement noté). */
  mettreALaCorbeille(id: string): void {
    const fichier = this.#fichiers.find((f) => f.id === id);
    if (fichier !== undefined) fichier.trashed = true;
    this.#noter(id);
  }

  fichiers(): ReadonlyArray<FichierHttp> {
    return [...this.#fichiers];
  }

  /** v0.10.1 (condition C5) : `PRESENT`, `CORBEILLE` (récupérable) ou `ABSENT` (supprimé définitivement, ou inconnu). */
  etatDe(id: string): 'PRESENT' | 'CORBEILLE' | 'ABSENT' {
    const fichier = this.#fichiers.find((f) => f.id === id);
    if (fichier === undefined) return 'ABSENT';
    return fichier.trashed ? 'CORBEILLE' : 'PRESENT';
  }

  async #traiter(adresse: string, init: RequestInit): Promise<Response> {
    const methode = init.method ?? 'GET';
    this.requetes.push({ methode, url: adresse });
    const forcee = this.#forcees.shift();
    if (forcee !== undefined) return forcee;
    if (this.#accesRetire) return json({ error: { code: 401 } }, 401);
    const url = new URL(adresse);
    const chemin = url.pathname;
    if (chemin === '/drive/v3/changes/startPageToken') {
      return json({ startPageToken: this.#jeton() });
    }
    if (chemin === '/drive/v3/changes') return this.#changementsDepuis(url);
    if (chemin === '/drive/v3/files' && methode === 'GET') return this.#lister(url);
    if (chemin === '/drive/v3/files' && methode === 'POST') return this.#creerDossier(init);
    if (chemin === '/upload/drive/v3/files') return this.#envoyer(init, url);
    const id = decodeURIComponent(chemin.split('/').pop() ?? '');
    if (chemin.startsWith('/upload/drive/v3/files/')) return this.#remplacer(id, init, url);
    if (chemin.startsWith('/drive/v3/files/') && methode === 'DELETE') return this.#detruire(id);
    if (chemin.startsWith('/drive/v3/files/') && methode === 'PATCH')
      return this.#patcher(id, init);
    if (chemin.startsWith('/drive/v3/files/')) return this.#lire(id);
    return json({ error: { code: 400 } }, 400);
  }

  #jeton(): string {
    return `${String(this.#epoque)}-${String(this.#sequence)}`;
  }

  #noter(id: string): void {
    this.#sequence += 1;
    this.#changements.push({ sequence: this.#sequence, id });
  }

  #page<T>(
    elements: ReadonlyArray<T>,
    url: URL,
    debut: number,
  ): { readonly page: ReadonlyArray<T>; readonly suite?: string } {
    const taille = Math.min(this.taillePage, Number(url.searchParams.get('pageSize') ?? 1000));
    const page = elements.slice(debut, debut + taille);
    return debut + taille < elements.length ? { page, suite: String(debut + taille) } : { page };
  }

  async #lister(url: URL): Promise<Response> {
    const q = url.searchParams.get('q') ?? '';
    if (q.includes("value='appareil'") && this.#pendantInventaire !== undefined) {
      const rappel = this.#pendantInventaire;
      this.#pendantInventaire = undefined;
      await rappel();
    }
    const trouves = this.#fichiers.filter(filtreDe(q));
    const debut = Number(url.searchParams.get('pageToken')?.split('@')[1] ?? 0);
    const { page, suite } = this.#page(trouves, url, debut);
    return json({
      files: page.map((f) => restreindre(descriptionDe(f), champsDe(url, 'files'))),
      ...(suite === undefined ? {} : { nextPageToken: `liste@${suite}` }),
    });
  }

  #changementsDepuis(url: URL): Response {
    const brut = url.searchParams.get('pageToken') ?? '';
    const [jeton = '', decalage] = brut.split('@');
    const [epoque, sequence] = jeton.split('-').map(Number);
    if (epoque !== this.#epoque || sequence === undefined || Number.isNaN(sequence)) {
      return json({ error: { code: 404 } }, 404);
    }
    const changes = this.#changements
      .filter((c) => c.sequence > sequence)
      .map((c) => {
        const f = this.#fichiers.find((x) => x.id === c.id);
        return f === undefined
          ? { fileId: c.id, removed: true }
          : {
              fileId: c.id,
              removed: false,
              file: restreindre(descriptionDe(f), champsDe(url, 'file')),
            };
      });
    const { page, suite } = this.#page(changes, url, Number(decalage ?? 0));
    return json({
      changes: page,
      ...(suite === undefined
        ? { newStartPageToken: this.#jeton() }
        : { nextPageToken: `${jeton}@${suite}` }),
    });
  }

  #creer(f: Omit<FichierHttp, 'id' | 'createdTime' | 'trashed' | 'version'>): FichierHttp {
    this.#numero += 1;
    const fichier: FichierHttp = {
      ...f,
      id: `http-${String(this.#numero)}`,
      createdTime: new Date(Date.UTC(2026, 0, 1, 0, 0, this.#numero)).toISOString(),
      trashed: false,
      version: 1,
    };
    this.#fichiers.push(fichier);
    this.#noter(fichier.id);
    return fichier;
  }

  #creerDossier(init: RequestInit): Response {
    const meta = JSON.parse(typeof init.body === 'string' ? init.body : '{}') as {
      name: string;
      mimeType: string;
      appProperties: Record<string, string>;
    };
    const dossier = this.#creer({
      name: meta.name,
      mimeType: meta.mimeType,
      appProperties: meta.appProperties,
      parents: [],
      octets: new Uint8Array(),
    });
    return json({ id: dossier.id });
  }

  #envoyer(init: RequestInit, url: URL): Response {
    const type = new Headers(init.headers).get('Content-Type') ?? '';
    const separateur = /boundary=(.+)$/.exec(type)?.[1] ?? '';
    const { metadonnees, contenu } = lireMultipart(init.body as Uint8Array, separateur);
    const cree = this.#creer({
      name: String(metadonnees['name']),
      mimeType: String(metadonnees['mimeType']),
      appProperties: metadonnees['appProperties'] as Record<string, string>,
      parents: metadonnees['parents'] as ReadonlyArray<string>,
      octets: contenu,
    });
    return json(restreindre(descriptionDe(cree), url.searchParams.get('fields')));
  }

  #remplacer(id: string, init: RequestInit, url: URL): Response {
    const fichier = this.#fichiers.find((f) => f.id === id && !f.trashed);
    if (fichier === undefined) return json({ error: { code: 404 } }, 404);
    fichier.octets = new Uint8Array(init.body as Uint8Array);
    fichier.version += 1;
    this.#noter(id);
    return json(restreindre(descriptionDe(fichier), url.searchParams.get('fields')));
  }

  /** `files.delete` : suppression **définitive** (jamais utilisée par l'adaptateur : condition C5, contrôlée par CT-TRANS-15). */
  #detruire(id: string): Response {
    const index = this.#fichiers.findIndex((f) => f.id === id);
    if (index < 0) return json({ error: { code: 404 } }, 404);
    this.#fichiers.splice(index, 1);
    this.#noter(id);
    return new Response(null, { status: 204 });
  }

  /** `files.update` des métadonnées : seul `{ trashed: true }` est simulé (corbeille ; un dossier entraîne son contenu). */
  #patcher(id: string, init: RequestInit): Response {
    const fichier = this.#fichiers.find((f) => f.id === id);
    if (fichier === undefined) return json({ error: { code: 404 } }, 404);
    const corps = JSON.parse(typeof init.body === 'string' ? init.body : '{}') as {
      trashed?: unknown;
    };
    if (corps.trashed === true) this.#corbeille(fichier);
    return json({ id });
  }

  #corbeille(fichier: FichierHttp): void {
    fichier.trashed = true;
    this.#noter(fichier.id);
    this.#fichiers
      .filter((f) => !f.trashed && f.parents.includes(fichier.id))
      .forEach((f) => {
        this.#corbeille(f);
      });
  }

  #lire(id: string): Response {
    const fichier = this.#fichiers.find((f) => f.id === id && !f.trashed);
    if (fichier === undefined) return json({ error: { code: 404 } }, 404);
    return new Response(new Uint8Array(fichier.octets), { status: 200 });
  }
}
