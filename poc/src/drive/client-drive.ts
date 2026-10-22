import type { ConfigPoc } from '../config';
import type { FournisseurJeton } from '../auth/ports';
import { empreinteSha256 } from './empreinte';

const API = 'https://www.googleapis.com/drive/v3';
const API_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';
const MIME_DOSSIER = 'application/vnd.google-apps.folder';
const CHAMPS_FICHIER = 'id,name,mimeType,parents,modifiedTime,size,appProperties';

export interface FichierDrive {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  modifiedTime?: string;
  size?: string;
}

/** Résultat brut d'un appel : le code HTTP est conservé pour le journal. */
export interface ReponseDrive<T> {
  codeHttp: number;
  ok: boolean;
  donnees?: T;
  /** Corps d'erreur renvoyé par Drive (jamais un jeton). */
  erreur?: string;
}

export class ErreurSansJeton extends Error {
  constructor() {
    super('Aucun jeton disponible : se connecter ou demander un jeton avant d’appeler Drive.');
  }
}

export class ClientDrive {
  constructor(
    private readonly auth: FournisseurJeton,
    private readonly config: ConfigPoc,
    private readonly appelerFetch: typeof fetch = (...args) => fetch(...args),
  ) {}

  private get proprietes(): Record<string, string> {
    return { app: this.config.proprieteApp };
  }

  private async requete<T>(
    url: string,
    init: RequestInit = {},
    binaire = false,
  ): Promise<ReponseDrive<T>> {
    const jeton = await this.auth.valeurJeton();
    if (jeton === null) throw new ErreurSansJeton();
    const reponse = await this.appelerFetch(url, {
      ...init,
      headers: { ...(init.headers as Record<string, string>), Authorization: `Bearer ${jeton}` },
    });
    if (!reponse.ok) {
      return { codeHttp: reponse.status, ok: false, erreur: await reponse.text() };
    }
    const donnees = binaire
      ? (new Uint8Array(await reponse.arrayBuffer()) as T)
      : ((await reponse.json()) as T);
    return { codeHttp: reponse.status, ok: true, donnees };
  }

  private json(corps: unknown): RequestInit {
    return { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps) };
  }

  /** Appel minimal pour la mesure §3.5 : code HTTP brut, sans renouvellement. */
  ping(): Promise<ReponseDrive<{ files: FichierDrive[] }>> {
    return this.requete(`${API}/files?pageSize=1&fields=files(id)`);
  }

  creerDossier(nom: string, parent?: string): Promise<ReponseDrive<FichierDrive>> {
    return this.requete(`${API}/files?fields=${CHAMPS_FICHIER}`, {
      method: 'POST',
      ...this.json({
        name: nom,
        mimeType: MIME_DOSSIER,
        appProperties: this.proprietes,
        ...(parent ? { parents: [parent] } : {}),
      }),
    });
  }

  /** Dépose un fichier binaire (multipart : métadonnées puis contenu). */
  async creerFichier(
    nom: string,
    parent: string,
    contenu: Uint8Array,
  ): Promise<ReponseDrive<FichierDrive>> {
    const frontiere = `poc${crypto.randomUUID()}`;
    const metadonnees = JSON.stringify({
      name: nom,
      parents: [parent],
      appProperties: this.proprietes,
    });
    const corps = new Blob([
      `--${frontiere}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadonnees}\r\n`,
      `--${frontiere}\r\nContent-Type: application/gzip\r\n\r\n`,
      new Uint8Array(contenu),
      `\r\n--${frontiere}--`,
    ]);
    return this.requete(`${API_UPLOAD}/files?uploadType=multipart&fields=${CHAMPS_FICHIER}`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${frontiere}` },
      body: corps,
    });
  }

  modifierFichier(id: string, contenu: Uint8Array): Promise<ReponseDrive<FichierDrive>> {
    return this.requete(`${API_UPLOAD}/files/${id}?uploadType=media&fields=${CHAMPS_FICHIER}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/gzip' },
      body: new Blob([new Uint8Array(contenu)]),
    });
  }

  /** `files.list` avec le filtre sur `appProperties` (protocole 3.2.2). */
  lister(): Promise<ReponseDrive<{ files: FichierDrive[] }>> {
    const q = `appProperties has { key='app' and value='${this.config.proprieteApp}' } and trashed=false`;
    return this.requete(
      `${API}/files?q=${encodeURIComponent(q)}&fields=files(${CHAMPS_FICHIER})&pageSize=100`,
    );
  }

  lireContenu(id: string): Promise<ReponseDrive<Uint8Array>> {
    return this.requete(`${API}/files/${id}?alt=media`, {}, true);
  }

  /** Lit le contenu d'un fichier et en calcule l'empreinte SHA-256. */
  async lireAvecEmpreinte(
    id: string,
  ): Promise<ReponseDrive<{ empreinte: string; octets: number }>> {
    const reponse = await this.lireContenu(id);
    if (!reponse.ok || reponse.donnees === undefined) {
      return { codeHttp: reponse.codeHttp, ok: false, erreur: reponse.erreur };
    }
    return {
      codeHttp: reponse.codeHttp,
      ok: true,
      donnees: {
        empreinte: await empreinteSha256(reponse.donnees),
        octets: reponse.donnees.length,
      },
    };
  }

  jetonDePage(): Promise<ReponseDrive<{ startPageToken: string }>> {
    return this.requete(`${API}/changes/startPageToken`);
  }

  changements(pageToken: string): Promise<
    ReponseDrive<{
      changes: { fileId: string; removed: boolean; file?: FichierDrive }[];
      newStartPageToken?: string;
      nextPageToken?: string;
    }>
  > {
    return this.requete(
      `${API}/changes?pageToken=${encodeURIComponent(pageToken)}&fields=newStartPageToken,nextPageToken,changes(fileId,removed,file(${CHAMPS_FICHIER}))`,
    );
  }
}
