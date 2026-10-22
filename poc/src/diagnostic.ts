import { GoogleAuthNative } from './auth/plugin-natif';
import { libelleEtat, SCOPES_POC, type EtatJeton, type FournisseurJeton } from './auth/ports';
import type { ConfigPoc } from './config';
import {
  ClientDrive,
  ErreurSansJeton,
  type FichierDrive,
  type ReponseDrive,
} from './drive/client-drive';
import { empreinteSha256 } from './drive/empreinte';
import { genererEtatPoc } from './drive/etat-poc';
import type { Journal, Mesure } from './journal/journal';

const MIME_DOSSIER = 'application/vnd.google-apps.folder';
const NOM_SOUS_DOSSIER = 'appareils';
const CLE_PAGE_TOKEN = 'poc.pageToken';

export interface Dependances {
  auth: FournisseurJeton;
  drive: ClientDrive;
  journal: Journal;
  config: ConfigPoc;
  /** `android` ou `pc` : sert à nommer le fichier d'état. */
  appareil: string;
  stockage?: Pick<Storage, 'getItem' | 'setItem'>;
  /** Plugin natif (R16-T) ; absent sur PC. */
  signature?: () => Promise<{
    versionCode: number;
    versionName: string;
    sha256: string;
    sha1: string;
  }>;
}

function iso(echeance: number | null): string | undefined {
  return echeance === null ? undefined : new Date(echeance).toISOString();
}

/** Actions des boutons de l'écran Diagnostic. Chacune journalise son résultat. */
export class Diagnostic {
  private echeance: number | null = null;
  private gestes = 0;
  private readonly stockage: Pick<Storage, 'getItem' | 'setItem'>;

  constructor(private readonly d: Dependances) {
    this.stockage = d.stockage ?? localStorage;
  }

  private get nomFichier(): string {
    return `${this.d.appareil}-poc.etat.json.gz`;
  }

  private async journaliserJeton(
    mesure: Mesure,
    etape: string,
    operation: string,
    etat: EtatJeton,
  ): Promise<EtatJeton> {
    if (etat.etat === 'jeton_obtenu') {
      this.echeance = etat.echeance;
      const valeur = await this.d.auth.valeurJeton();
      if (valeur !== null) this.d.journal.declarerSecret(valeur);
    }
    await this.d.journal.enregistrer({
      mesure,
      etape,
      operation,
      resultat: libelleEtat(etat),
      codeErreur: etat.etat === 'jeton_obtenu' ? undefined : etat.codeErreur,
      echeanceJeton: etat.etat === 'jeton_obtenu' ? iso(etat.echeance) : undefined,
      hasGrantedAllScopes: etat.etat === 'jeton_obtenu' ? etat.hasGrantedAllScopes : undefined,
      detail:
        etat.etat === 'jeton_obtenu'
          ? `scopes accordés : ${etat.scopesAccordes.join(' ')} ; jeton présent`
          : `code brut : ${etat.codeErreur} (état par défaut si la cause n'est pas établie)`,
    });
    return etat;
  }

  async demarrage(): Promise<void> {
    const identite = this.d.auth.identiteEnCache();
    const android = this.d.appareil === 'android';
    await this.d.journal.enregistrer({
      mesure: android ? 'R2' : 'R12',
      etape: android ? '3.3.5' : '3.4.3',
      operation: 'Démarrage',
      resultat: identite ? 'Identité en cache' : 'Aucune identité en cache',
      detail: `en ligne : ${navigator.onLine} ; origine : ${this.d.config.origine} ; identité : ${identite?.email ?? '-'}`,
    });
  }

  /** R11, étapes 3.1.2 et 3.1.4. */
  seConnecter(): Promise<EtatJeton> {
    return this.d.auth
      .connecter(SCOPES_POC)
      .then((etat) => this.journaliserJeton('R11', '3.1.2', 'Se connecter', etat));
  }

  /** R2, étape 3.3.2 (Android). */
  jetonSilencieux(): Promise<EtatJeton> {
    return this.d.auth
      .jetonSilencieux(SCOPES_POC)
      .then((etat) => this.journaliserJeton('R2', '3.3.2', 'Jeton silencieux', etat));
  }

  /** R3, étape 3.4.1 : un geste = un clic sur « Synchroniser ». */
  async synchroniser(): Promise<EtatJeton> {
    this.gestes += 1;
    const etat = await this.d.auth.jetonSilencieux(SCOPES_POC);
    const resultat = await this.journaliserJeton('R3', '3.4.1', 'Synchroniser', etat);
    await this.d.journal.enregistrer({
      mesure: 'R3',
      etape: '3.4.1',
      operation: 'Comptage des gestes',
      resultat: `${this.gestes} geste(s) depuis le chargement`,
    });
    return resultat;
  }

  /** §3.5, point 3. */
  demanderJeton(): Promise<EtatJeton> {
    return this.d.auth
      .jetonSilencieux(SCOPES_POC)
      .then((etat) => this.journaliserJeton('3.5', '3.5.3', 'Demander un jeton', etat));
  }

  /** §3.5, points 1 et 2 : code HTTP brut et échéance. */
  async appelerDrive(): Promise<void> {
    await this.appelDrive('3.5', '3.5.2', 'Appeler Drive', () => this.d.drive.ping());
  }

  /** R15, étape 3.4.4. */
  async persistance(): Promise<void> {
    const dejaPersistant = await navigator.storage.persisted();
    const accorde = dejaPersistant || (await navigator.storage.persist());
    await this.d.journal.enregistrer({
      mesure: 'R15',
      etape: '3.4.4',
      operation: 'navigator.storage.persist()',
      resultat: accorde ? 'Stockage persistant' : 'Stockage non persistant',
      detail: `déjà persistant avant l'appel : ${dejaPersistant}`,
    });
  }

  /** R16-T, étape 3.3.8. */
  async signature(): Promise<void> {
    if (!this.d.signature) {
      await this.d.journal.enregistrer({
        mesure: 'R16-T',
        etape: '3.3.8',
        operation: 'signatureInfo',
        resultat: 'Indisponible sur PC',
      });
      return;
    }
    try {
      const s = await this.d.signature();
      await this.d.journal.enregistrer({
        mesure: 'R16-T',
        etape: '3.3.8',
        operation: 'signatureInfo',
        resultat: 'OK',
        detail: `versionCode ${s.versionCode} ; versionName ${s.versionName} ; SHA-1 ${s.sha1} ; SHA-256 ${s.sha256}`,
      });
    } catch (erreur) {
      await this.journaliserErreur('R16-T', '3.3.8', 'signatureInfo', erreur);
    }
  }

  /** R1, étapes 3.2.1 et 3.2.3 : dossier, sous-dossier, fichier d'état, `pageToken`. */
  async creer(): Promise<void> {
    const dossier = await this.appelDrive('R1', '3.2.1', 'Créer le dossier', () =>
      this.d.drive.creerDossier(this.d.config.nomDossier),
    );
    if (!dossier?.donnees) return;
    const sous = await this.appelDrive('R1', '3.2.1', 'Créer appareils/', () =>
      this.d.drive.creerDossier(NOM_SOUS_DOSSIER, dossier.donnees?.id),
    );
    if (!sous?.donnees) return;
    const contenu = await genererEtatPoc(this.d.appareil);
    const empreinte = await empreinteSha256(contenu);
    const fichier = await this.appelDrive(
      'R1',
      '3.2.1',
      `Créer ${this.nomFichier}`,
      () => this.d.drive.creerFichier(this.nomFichier, sous.donnees?.id ?? '', contenu),
      `${contenu.length} octets ; SHA-256 ${empreinte}`,
    );
    if (!fichier?.ok) return;
    const page = await this.appelDrive('R1', '3.2.1', 'changes.getStartPageToken', () =>
      this.d.drive.jetonDePage(),
    );
    if (page?.donnees) this.stockage.setItem(CLE_PAGE_TOKEN, page.donnees.startPageToken);
  }

  /** R1, étapes 3.2.2 et 3.2.3. */
  async lister(): Promise<FichierDrive[]> {
    const reponse = await this.appelDrive('R1', '3.2.2', 'files.list (appProperties)', () =>
      this.d.drive.lister(),
    );
    const fichiers = reponse?.donnees?.files ?? [];
    await this.d.journal.enregistrer({
      mesure: 'R1',
      etape: '3.2.2',
      operation: 'Fichiers visibles',
      resultat: `${fichiers.length} élément(s)`,
      detail: fichiers.map((f) => `${f.name} (${f.id})`).join(' ; '),
    });
    return fichiers;
  }

  /** R1, étapes 3.2.2 et 3.2.3 : lit chaque fichier d'état et affiche l'empreinte. */
  async lire(): Promise<void> {
    const fichiers = (await this.lister()).filter((f) => f.mimeType !== MIME_DOSSIER);
    for (const fichier of fichiers) {
      await this.appelDrive(
        'R1',
        '3.2.2',
        `files.get alt=media ${fichier.name}`,
        () => this.d.drive.lireAvecEmpreinte(fichier.id),
        fichier.name,
      );
    }
  }

  /** R1, étape 3.2.4 : le fichier de cet appareil est réécrit avec un contenu neuf. */
  async modifier(): Promise<void> {
    const reponse = await this.appelDrive('R1', '3.2.4', 'files.list (avant modification)', () =>
      this.d.drive.lister(),
    );
    const cible = reponse?.donnees?.files.find((f) => f.name === this.nomFichier);
    if (!cible) {
      await this.d.journal.enregistrer({
        mesure: 'R1',
        etape: '3.2.4',
        operation: 'Modifier',
        resultat: `Fichier ${this.nomFichier} introuvable : utiliser « Créer » d'abord`,
      });
      return;
    }
    const contenu = await genererEtatPoc(this.d.appareil);
    const empreinte = await empreinteSha256(contenu);
    await this.appelDrive(
      'R1',
      '3.2.4',
      `files.update ${this.nomFichier}`,
      () => this.d.drive.modifierFichier(cible.id, contenu),
      `${contenu.length} octets ; nouvelle empreinte SHA-256 ${empreinte}`,
    );
  }

  /** R1, étape 3.2.4 : `changes.list` depuis le `pageToken` conservé. */
  async changements(): Promise<void> {
    const pageToken = this.stockage.getItem(CLE_PAGE_TOKEN);
    if (pageToken === null) {
      await this.d.journal.enregistrer({
        mesure: 'R1',
        etape: '3.2.4',
        operation: 'changes.list',
        resultat: 'Aucun pageToken conservé : utiliser « Créer » sur cet appareil',
      });
      return;
    }
    const reponse = await this.appelDrive('R1', '3.2.4', 'changes.list', () =>
      this.d.drive.changements(pageToken),
    );
    const donnees = reponse?.donnees;
    if (!donnees) return;
    const resume = donnees.changes.map((c) => c.file?.name ?? c.fileId).join(' ; ');
    await this.d.journal.enregistrer({
      mesure: 'R1',
      etape: '3.2.4',
      operation: 'Changements détectés',
      resultat: `${donnees.changes.length} changement(s)`,
      detail: resume,
    });
    const suivant = donnees.newStartPageToken ?? donnees.nextPageToken;
    if (suivant) this.stockage.setItem(CLE_PAGE_TOKEN, suivant);
  }

  async marquerEtape(etape: string, commentaire: string): Promise<void> {
    await this.d.journal.enregistrer({
      mesure: 'Général',
      etape,
      operation: 'Marqueur',
      resultat: 'Étape marquée',
      detail: commentaire,
    });
  }

  private async appelDrive<T>(
    mesure: Mesure,
    etape: string,
    operation: string,
    appel: () => Promise<ReponseDrive<T>>,
    detail = '',
  ): Promise<ReponseDrive<T> | null> {
    try {
      const reponse = await appel();
      await this.d.journal.enregistrer({
        mesure,
        etape,
        operation,
        resultat: reponse.ok ? 'OK' : 'Échec',
        codeHttp: reponse.codeHttp,
        codeErreur: reponse.ok ? undefined : reponse.erreur?.slice(0, 300),
        echeanceJeton: iso(this.echeance),
        detail: reponse.ok
          ? [detail, this.detailReponse(reponse.donnees)].filter(Boolean).join(' ; ')
          : detail,
      });
      return reponse;
    } catch (erreur) {
      await this.journaliserErreur(mesure, etape, operation, erreur);
      return null;
    }
  }

  private detailReponse(donnees: unknown): string {
    if (donnees && typeof donnees === 'object' && 'empreinte' in donnees) {
      const { empreinte, octets } = donnees as { empreinte: string; octets: number };
      return `SHA-256 ${empreinte} ; ${octets} octets`;
    }
    if (donnees && typeof donnees === 'object' && 'id' in donnees) {
      return `id ${(donnees as FichierDrive).id}`;
    }
    return '';
  }

  private async journaliserErreur(
    mesure: Mesure,
    etape: string,
    operation: string,
    erreur: unknown,
  ): Promise<void> {
    await this.d.journal.enregistrer({
      mesure,
      etape,
      operation,
      resultat: erreur instanceof ErreurSansJeton ? 'Pas de jeton' : 'Erreur',
      codeErreur: erreur instanceof Error ? erreur.message : String(erreur),
    });
  }
}

export const signatureNative = (): Promise<{
  versionCode: number;
  versionName: string;
  sha256: string;
  sha1: string;
}> => GoogleAuthNative.signatureInfo();
