/**
 * Compléments de H4 sur les fichiers reçus (ST-US-017 v0.11 §6.8 n° 4, n° 14) : journal d'une valeur reçue du futur
 * (seuil strict de 24 h, éléments inconnus compris) ; éléments inconnus de deux fichiers reçus dans le même cycle (le
 * plus récent l'emporte, dans les deux ordres). UT-COMP-US-017-4-45 et 4-46 (rang 11, tranche H4, Bruce).
 */
import { describe, expect, it } from 'vitest';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import { Instant } from '@src/commun/domaine/temps/instant';
import { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import { SEUIL_HORLOGE_DEREGLEE } from '@src/synchronisation/domaine/parametres-synchronisation';
import { valeurDe } from '@tests/support/environnement';
import {
  avecObjectifPublie,
  preparerRestauration,
  PUBLIER,
} from '@tests/support/synchronisation/restauration';
import { hlc, PC, TROISIEME } from '@tests/support/valeurs';

type Env = ReturnType<typeof preparerRestauration>;

/**
 * `auteur` réécrit son fichier (version plus récente, même format) avec un registre inconnu de HLC `iso` signé par
 * lui-même (la table `appareils` est complétée et triée, les indices des HLC existants sont traduits).
 */
const ajouterInconnu = async (env: Env, auteur: IdAppareil, iso: string) => {
  await env.drive.reecrireParVersionRecente(auteur, (objet) => {
    const lus = objet['appareils'] as ReadonlyArray<string>;
    const appareils = [...new Set([...lus, auteur])].sort();
    const traduire = (h: Record<string, unknown>) => ({
      ...h,
      appareil: appareils.indexOf(lus[h['appareil'] as number] ?? ''),
    });
    objet['appareils'] = appareils;
    objet['registres'] = [
      ...(objet['registres'] as Array<Record<string, unknown>>)
        .filter((r) => r['champ'] !== 'importance')
        .map((r) => ({ ...r, hlc: traduire(r['hlc'] as Record<string, unknown>) })),
      {
        type: 'OBJECTIF',
        id: PUBLIER,
        champ: 'importance',
        valeur: iso,
        hlc: { physique: iso, compteur: 0, appareil: appareils.indexOf(auteur) },
      },
    ];
    objet['journal'] = (objet['journal'] as Array<Record<string, unknown>>).map((e) => ({
      ...e,
      hlc: traduire(e['hlc'] as Record<string, unknown>),
    }));
  });
};

const futur = (env: Env) =>
  env.smartphone.journal.entrees.filter((e) => e.evenement === 'ValeurRecueDuFutur');

describe('Valeur reçue du futur (n° 4, DAT §6.4)', () => {
  it('UT-COMP-US-017-4-45 un élément inconnu daté de plus de 24 h après l’heure corrigée : une entrée « info » ValeurRecueDuFutur { ecartMs } pour ce fichier, sans changer l’issue ; à 24 h exactement, rien', async () => {
    for (const [decalage, attendu] of [
      [EcartTemps.depuisMillisecondes(SEUIL_HORLOGE_DEREGLEE + 1), 1],
      [SEUIL_HORLOGE_DEREGLEE, 0],
    ] as const) {
      const env = preparerRestauration();
      await avecObjectifPublie(env);
      const iso = Instant.enIso(Instant.decaler(env.temps.maintenant(), decalage));
      await ajouterInconnu(env, PC, iso);

      expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');

      expect(futur(env)).toEqual(
        attendu === 0
          ? []
          : [{ niveau: 'info', evenement: 'ValeurRecueDuFutur', champs: { ecartMs: decalage } }],
      );
    }
  });
});

describe('Éléments inconnus de deux fichiers dans le même cycle (n° 14)', () => {
  it.each([
    {
      nom: 'le PC plus récent',
      pc: '2026-10-21T10:00:00.000Z',
      troisieme: '2026-10-21T09:00:00.000Z',
    },
    {
      nom: 'le troisième plus récent',
      pc: '2026-10-21T09:00:00.000Z',
      troisieme: '2026-10-21T10:00:00.000Z',
    },
  ])(
    'UT-COMP-US-017-4-46 $nom : le registre inconnu retenu est celui de plus grand HLC, quel que soit l’ordre de lecture',
    async ({ pc, troisieme }) => {
      const env = preparerRestauration();
      const troisiemeAppareil = env.creer(TROISIEME, '03');
      await avecObjectifPublie(env);
      expect(await troisiemeAppareil.cycle.synchroniserMaintenant()).toBe('TERMINE');
      expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
      await ajouterInconnu(env, PC, pc);
      await ajouterInconnu(env, TROISIEME, troisieme);

      expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');

      const [registre] = valeurDe(await env.smartphone.depot.lireInconnus()).registres;
      expect(registre?.hlc).toEqual(pc > troisieme ? hlc(pc, 0, PC) : hlc(troisieme, 0, TROISIEME));
    },
  );
});
