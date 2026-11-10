import Dexie from 'dexie';
import { z } from 'zod';
import type { MemoireDemandePersistance } from '../../commun/application/ports/persistance-stockage';
import type { EntreeJournalTechnique } from '../../commun/application/ports/journal-technique';
import { echec, succes, type Resultat } from '../../commun/domaine/resultat';
import { Instant } from '../../commun/domaine/temps/instant';
import {
  ROUTE_REPRISE,
  type DepartMemorise,
  type ErreurMemoireTechnique,
  type MemoireRedirection,
} from '../application/ports/memoire-redirection';
import type { MemoireSession, SessionMemorisee } from '../application/ports/memoire-session';
import { AdresseGoogle, IdCompte } from '../domaine/identite';
import type { NomEnvironnement } from './espaces/nom-espace';

// ST-US-022 §5.1 : base `donejuan-<env>-technique` (Dexie, version 1, durabilité stricte), hors espace de compte.
// Ni jeton, ni contenu métier ; la redirection ne porte ni adresse ni `sub` (RED-04).

/** Rétention du journal technique local (conventions.md §9.4). */
export const RETENTION_JOURNAL_MS = 7 * 24 * 60 * 60_000;

const CLE_SESSION = 'session';
const CLE_REDIRECTION = 'redirection';
/** ST-US-018 v0.4 §5 : ligne de la table `installation` qui note la demande de persistance du stockage. */
const CLE_PERSISTANCE_DEMANDEE = 'persistanceDemandee';
const INDISPONIBLE: Resultat<never, ErreurMemoireTechnique> = echec({
  type: 'MemoireTechniqueIndisponible',
});

const schemaSession = z.object({
  cle: z.literal(CLE_SESSION),
  sub: z.string(),
  adresse: z.string(),
  accesPerdu: z.boolean(),
});
const schemaRedirection = z.object({
  cle: z.literal(CLE_REDIRECTION),
  state: z.string().min(1),
  expireA: z.string(),
  lanceA: z.string(),
  mode: z.enum(['RENOUVELLEMENT_OUVERTURE', 'REPLI_GESTE']),
  reprise: z.object({
    ecran: z.string().regex(ROUTE_REPRISE),
    feuilleSynchronisationOuverte: z.boolean(),
  }),
});

const schemaPersistanceDemandee = z.object({
  cle: z.literal(CLE_PERSISTANCE_DEMANDEE),
  demandee: z.literal(true),
});

/** Tables à lignes nommées ; `session` et `redirection` n'ont qu'une ligne, de clé égale au nom de la table. */
type TableLignes = 'session' | 'redirection' | 'installation';

export const nomBaseTechnique = (env: NomEnvironnement): string => `donejuan-${env}-technique`;

const sessionDepuisLigne = (ligne: unknown): SessionMemorisee | undefined => {
  const lue = schemaSession.safeParse(ligne);
  if (!lue.success) return undefined;
  const compte = IdCompte.depuisSub(lue.data.sub);
  const adresse = AdresseGoogle.depuisTexte(lue.data.adresse);
  if (!compte.ok || !adresse.ok) return undefined;
  return {
    identite: { compte: compte.valeur, adresse: adresse.valeur },
    accesPerdu: lue.data.accesPerdu,
  };
};

const departDepuisLigne = (ligne: unknown): DepartMemorise | undefined => {
  const lue = schemaRedirection.safeParse(ligne);
  if (!lue.success) return undefined;
  const expireA = Instant.depuisIso(lue.data.expireA);
  const lanceA = Instant.depuisIso(lue.data.lanceA);
  if (!expireA.ok || !lanceA.ok) return undefined;
  const { state, mode, reprise } = lue.data;
  return { state, mode, reprise, expireA: expireA.valeur, lanceA: lanceA.valeur };
};

export type OptionsBaseTechnique = {
  readonly env: NomEnvironnement;
  readonly fabrique?: IDBFactory;
  /** Ligne relue invalide (vaut « absente ») ; journalisée en avertissement par la composition. */
  readonly surLigneInvalide?: (table: string) => void;
  /** `versionchange` d'une autre connexion : fermeture sans réouverture (RL-LOT-001-A1). */
  readonly surFermetureImposee?: () => void;
};

export class BaseTechnique {
  private readonly base: Dexie;
  private ferme = false;

  constructor(private readonly options: OptionsBaseTechnique) {
    this.base = new Dexie(nomBaseTechnique(options.env), {
      chromeTransactionDurability: 'strict',
      ...(options.fabrique === undefined ? {} : { indexedDB: options.fabrique }),
    });
    this.base
      .version(1)
      .stores({ installation: 'cle', session: 'cle', redirection: 'cle', journal: '++id, a' });
    this.base.on('versionchange', () => {
      const dejaFerme = this.ferme;
      this.fermer();
      if (!dejaFerme) options.surFermetureImposee?.();
      return false;
    });
  }

  fermer(): void {
    this.ferme = true;
    this.base.close({ disableAutoOpen: true });
  }

  /** Lecture d'une ligne (clé : le nom de la table par défaut) ; base fermée ou indisponible → undefined. */
  async lire(table: TableLignes, cle: string = table): Promise<unknown> {
    if (this.ferme) return undefined;
    try {
      return await this.base.table(table).get(cle);
    } catch {
      return undefined;
    }
  }

  /** Lit puis supprime dans la même transaction (usage unique). */
  async consommer(table: 'redirection'): Promise<unknown> {
    if (this.ferme) return undefined;
    try {
      return await this.base.transaction('rw', [table], async () => {
        const ligne: unknown = await this.base.table(table).get(table);
        await this.base.table(table).delete(table);
        return ligne;
      });
    } catch {
      return undefined;
    }
  }

  /** Écriture (ou effacement si `ligne` est undefined) confirmée à `complete` ; clé : le nom de la table par défaut. */
  async ecrire(
    table: TableLignes,
    ligne: Readonly<Record<string, unknown>> | undefined,
    cle: string = table,
  ): Promise<Resultat<undefined, ErreurMemoireTechnique>> {
    if (this.ferme) return INDISPONIBLE;
    try {
      await this.base.transaction('rw', [table], async () => {
        if (ligne === undefined) await this.base.table(table).delete(cle);
        else await this.base.table(table).put({ ...ligne, cle });
      });
      return succes(undefined);
    } catch {
      return INDISPONIBLE;
    }
  }

  /** Tampon circulaire du journal technique : ajoute l'entrée et retire celles de plus de 7 jours. */
  async journaliser(entree: EntreeJournalTechnique, a: Instant): Promise<void> {
    if (this.ferme) return;
    try {
      await this.base.transaction('rw', ['journal'], async () => {
        await this.base.table('journal').add({ ...entree, a });
        await this.base
          .table('journal')
          .where('a')
          .below(a - RETENTION_JOURNAL_MS)
          .delete();
      });
    } catch {
      // Le journal ne doit jamais faire échouer l'application.
    }
  }

  async lireJournal(): Promise<ReadonlyArray<unknown>> {
    if (this.ferme) return [];
    try {
      const lignes: ReadonlyArray<unknown> = await this.base
        .table('journal')
        .orderBy('a')
        .toArray();
      return lignes;
    } catch {
      return [];
    }
  }

  signalerLigneInvalide(table: string): void {
    this.options.surLigneInvalide?.(table);
  }
}

export class MemoireSessionDexie implements MemoireSession {
  constructor(private readonly base: BaseTechnique) {}

  async lire(): Promise<SessionMemorisee | undefined> {
    const ligne = await this.base.lire('session');
    if (ligne === undefined) return undefined;
    const session = sessionDepuisLigne(ligne);
    if (session === undefined) this.base.signalerLigneInvalide('session');
    return session;
  }

  ecrire(session: SessionMemorisee): Promise<Resultat<undefined, ErreurMemoireTechnique>> {
    return this.base.ecrire('session', {
      sub: session.identite.compte,
      adresse: session.identite.adresse,
      accesPerdu: session.accesPerdu,
    });
  }

  async effacer(): Promise<void> {
    await this.base.ecrire('session', undefined);
  }
}

export class MemoireRedirectionDexie implements MemoireRedirection {
  constructor(private readonly base: BaseTechnique) {}

  memoriser(depart: DepartMemorise): Promise<Resultat<undefined, ErreurMemoireTechnique>> {
    if (!ROUTE_REPRISE.test(depart.reprise.ecran)) return Promise.resolve(INDISPONIBLE);
    return this.base.ecrire('redirection', {
      state: depart.state,
      expireA: Instant.enIso(depart.expireA),
      lanceA: Instant.enIso(depart.lanceA),
      mode: depart.mode,
      reprise: { ...depart.reprise },
    });
  }

  async consommer(): Promise<DepartMemorise | undefined> {
    const ligne = await this.base.consommer('redirection');
    if (ligne === undefined) return undefined;
    const depart = departDepuisLigne(ligne);
    if (depart === undefined) this.base.signalerLigneInvalide('redirection');
    return depart;
  }
}

/**
 * ST-US-018 v0.4 §4.1, §5 (rang 12, tranche B1) : table `installation`, ligne de clé `persistanceDemandee`
 * (`{ cle: 'persistanceDemandee', demandee: true }`). Base fermée ou indisponible : `dejaDemandee()` rend faux,
 * `noterDemandee()` se résout sans erreur ; ligne invalide : faux et `signalerLigneInvalide('installation')`.
 */
export class MemoireDemandePersistanceDexie implements MemoireDemandePersistance {
  constructor(private readonly base: BaseTechnique) {}

  async dejaDemandee(): Promise<boolean> {
    const ligne = await this.base.lire('installation', CLE_PERSISTANCE_DEMANDEE);
    if (ligne === undefined) return false;
    const valide = schemaPersistanceDemandee.safeParse(ligne).success;
    if (!valide) this.base.signalerLigneInvalide('installation');
    return valide;
  }

  async noterDemandee(): Promise<void> {
    // Échec absorbé (base fermée ou indisponible) : la demande sera refaite au lancement suivant, sans conséquence.
    await this.base.ecrire('installation', { demandee: true }, CLE_PERSISTANCE_DEMANDEE);
  }
}
