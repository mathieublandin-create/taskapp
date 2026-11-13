import { IDBFactory } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import type { DepartMemorise } from '@src/compte/application/ports/memoire-redirection';
import {
  BaseTechnique,
  MemoireRedirectionDexie,
  MemoireSessionDexie,
  nomBaseTechnique,
  RETENTION_JOURNAL_MS,
} from '@src/compte/infrastructure/base-technique';
import { IDENTITE_A } from '@tests/support/compte/doublures-compte';
import { instant } from '@tests/support/valeurs';

// ST-US-022 §5.1, §14 : base technique (fake-indexeddb), une fabrique neuve par test.
const DEPART: DepartMemorise = {
  state: 'Zq9xStateUnique',
  lanceA: instant('2026-10-28T08:00:00.000Z'),
  expireA: instant('2026-10-28T08:10:00.000Z'),
  mode: 'REPLI_GESTE',
  reprise: { ecran: 'objectifs/abc-1', feuilleSynchronisationOuverte: true },
};

const ouvrir = (fabrique: IDBFactory, invalides: Array<string> = []) => {
  const base = new BaseTechnique({
    env: 'recette',
    fabrique,
    surLigneInvalide: (table) => invalides.push(table),
  });
  return {
    base,
    session: new MemoireSessionDexie(base),
    redirection: new MemoireRedirectionDexie(base),
  };
};

const ecrireBrut = (fabrique: IDBFactory, table: string, ligne: unknown): Promise<void> =>
  new Promise((resoudre, rejeter) => {
    const ouverture = fabrique.open(nomBaseTechnique('recette'));
    ouverture.onsuccess = () => {
      const transaction = ouverture.result.transaction(table, 'readwrite');
      transaction.objectStore(table).put(ligne);
      transaction.oncomplete = () => {
        ouverture.result.close();
        resoudre();
      };
      transaction.onerror = () => {
        rejeter(new Error('écriture brute impossible'));
      };
    };
  });

describe('Base technique (ST-US-022 §5.1)', () => {
  it('UT-COMP-US-022-20 session — écrite, relue par une autre instance, puis effacée', async () => {
    const fabrique = new IDBFactory();
    const premiere = ouvrir(fabrique);

    expect(await premiere.session.ecrire({ identite: IDENTITE_A, accesPerdu: true })).toEqual(
      succes(undefined),
    );
    expect(await ouvrir(fabrique).session.lire()).toEqual({
      identite: IDENTITE_A,
      accesPerdu: true,
    });
    await premiere.session.effacer();
    expect(await ouvrir(fabrique).session.lire()).toBeUndefined();
  });

  it('UT-COMP-US-022-21 redirection — memoriser résolu après complete, consommer toujours destructif, sans adresse ni sub', async () => {
    const fabrique = new IDBFactory();
    const { redirection } = ouvrir(fabrique);

    expect(await redirection.memoriser(DEPART)).toEqual(succes(undefined));
    const autre = ouvrir(fabrique).redirection;
    expect(await autre.consommer()).toEqual(DEPART);
    expect(await autre.consommer()).toBeUndefined();
    expect(await redirection.consommer()).toBeUndefined();
  });

  it('UT-COMP-US-022-22 redirection — une route hors ROUTE_REPRISE est refusée sans rien écrire', async () => {
    const fabrique = new IDBFactory();
    const { redirection } = ouvrir(fabrique);

    expect(
      await redirection.memoriser({
        ...DEPART,
        reprise: { ecran: 'Objectif « secret »', feuilleSynchronisationOuverte: false },
      }),
    ).toEqual(echec({ type: 'MemoireTechniqueIndisponible' }));
    expect(await redirection.consommer()).toBeUndefined();
  });

  it('UT-COMP-US-022-23 relecture Zod — une ligne invalide vaut « absente » et est signalée ; consommée quand même', async () => {
    const fabrique = new IDBFactory();
    const invalides: Array<string> = [];
    const { base, session, redirection } = ouvrir(fabrique, invalides);
    await session.effacer();
    base.fermer();
    await ecrireBrut(fabrique, 'session', { cle: 'session', sub: '', adresse: 'x', accesPerdu: 1 });
    await ecrireBrut(fabrique, 'redirection', { cle: 'redirection', state: 's', mode: 'AUTRE' });

    const relue = ouvrir(fabrique, invalides);
    expect(await relue.session.lire()).toBeUndefined();
    expect(await relue.redirection.consommer()).toBeUndefined();
    expect(invalides).toEqual(['session', 'redirection']);
    expect(await relue.base.lire('redirection')).toBeUndefined();
    expect(redirection).toBeDefined();
  });

  it('UT-COMP-US-022-24 base indisponible (fermée) — lecture undefined, écriture MemoireTechniqueIndisponible : aucune redirection possible', async () => {
    const { base, session, redirection } = ouvrir(new IDBFactory());
    base.fermer();

    expect(await session.lire()).toBeUndefined();
    expect(await session.ecrire({ identite: IDENTITE_A, accesPerdu: false })).toEqual(
      echec({ type: 'MemoireTechniqueIndisponible' }),
    );
    expect(await redirection.memoriser(DEPART)).toEqual(
      echec({ type: 'MemoireTechniqueIndisponible' }),
    );
    expect(await redirection.consommer()).toBeUndefined();
  });

  it('UT-COMP-US-022-25 versionchange — l’autre connexion se ferme sans se rouvrir et la suppression aboutit', async () => {
    const fabrique = new IDBFactory();
    let fermetures = 0;
    const base = new BaseTechnique({
      env: 'recette',
      fabrique,
      surFermetureImposee: () => {
        fermetures += 1;
      },
    });
    const session = new MemoireSessionDexie(base);
    await session.ecrire({ identite: IDENTITE_A, accesPerdu: false });

    await new Promise<void>((resoudre, rejeter) => {
      const demande = fabrique.deleteDatabase(nomBaseTechnique('recette'));
      demande.onsuccess = () => {
        resoudre();
      };
      demande.onerror = () => {
        rejeter(new Error('suppression impossible'));
      };
    });

    expect(fermetures).toBe(1);
    expect(await session.lire()).toBeUndefined();
    expect((await fabrique.databases()).map((b) => b.name)).not.toContain(
      nomBaseTechnique('recette'),
    );
  });

  it('UT-COMP-US-022-26 journal — tampon de 7 jours : les entrées plus anciennes sont retirées', async () => {
    const { base } = ouvrir(new IDBFactory());
    const t0 = instant('2026-10-20T08:00:00.000Z');

    await base.journaliser({ niveau: 'info', evenement: 'Ancien' }, t0);
    await base.journaliser(
      { niveau: 'info', evenement: 'Recent' },
      instant('2026-10-27T08:00:00.001Z'),
    );

    expect(RETENTION_JOURNAL_MS).toBe(604_800_000);
    expect((await base.lireJournal()).map((e) => (e as { evenement: string }).evenement)).toEqual([
      'Recent',
    ]);
  });
});
