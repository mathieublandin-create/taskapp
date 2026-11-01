/**
 * Propriété de convergence de l'incrément 3, mécanismes combinés (ST-US-017 v0.10 §6.7, §13.5 ; leçon du rang 9 :
 * vérifier par la convergence, pas seulement par cas) : saisies, coupures du réseau, altérations (données
 * supprimées, fichier d'un appareil modifié à la main), choix concurrents (« Restaurer » en ligne ou hors ligne,
 * « Repartir de zéro »), cycles dans un ordre quelconque. UT-US-017-74.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  comparerGenerations,
  GENERATION_INITIALE,
} from '@src/synchronisation/domaine/controle-drive';
import { comparerHlc } from '@src/synchronisation/domaine/hlc';
import { compterALire } from '@src/synchronisation/domaine/lectures';
import { projeterEtatMetier } from '@src/synchronisation/domaine/projection';
import { idValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { valeurDe } from '@tests/support/environnement';
import {
  avecObjectifPublie,
  metaDe,
  preparerRestauration,
  PUBLIER,
  renommerObjectif,
  signalementsDe,
  type AppareilRestauration,
} from '@tests/support/synchronisation/restauration';

type Commande =
  | { readonly type: 'RENOMMER'; readonly qui: 0 | 1 }
  | { readonly type: 'SYNCHRONISER'; readonly qui: 0 | 1 }
  | { readonly type: 'RESEAU'; readonly qui: 0 | 1; readonly connecte: boolean }
  | { readonly type: 'SUPPRIMER_DONNEES' }
  | { readonly type: 'MODIFIER_FICHIER'; readonly qui: 0 | 1 }
  | { readonly type: 'RESTAURER'; readonly qui: 0 | 1 }
  | { readonly type: 'REPARTIR'; readonly qui: 0 | 1 };

const qui = fc.constantFrom<0 | 1>(0, 1);
const commande: fc.Arbitrary<Commande> = fc.oneof(
  { weight: 3, arbitrary: qui.map((q) => ({ type: 'RENOMMER', qui: q }) as const) },
  { weight: 5, arbitrary: qui.map((q) => ({ type: 'SYNCHRONISER', qui: q }) as const) },
  {
    weight: 2,
    arbitrary: fc
      .tuple(qui, fc.boolean())
      .map(([q, connecte]) => ({ type: 'RESEAU', qui: q, connecte }) as const),
  },
  { weight: 1, arbitrary: fc.constant({ type: 'SUPPRIMER_DONNEES' } as const) },
  { weight: 1, arbitrary: qui.map((q) => ({ type: 'MODIFIER_FICHIER', qui: q }) as const) },
  { weight: 2, arbitrary: qui.map((q) => ({ type: 'RESTAURER', qui: q }) as const) },
  { weight: 1, arbitrary: qui.map((q) => ({ type: 'REPARTIR', qui: q }) as const) },
);

const etatMetierDe = async (a: AppareilRestauration) => {
  const metier = projeterEtatMetier(valeurDe(await a.depot.lire()));
  return [...metier.objectifs.values()]
    .filter((o) => !o.supprime)
    .map((o) => `${o.id}:${o.intitule}:${String(o.delai)}`)
    .sort();
};

describe('Convergence de l’incrément 3, mécanismes combinés (ST-US-017 v0.10 §6.7)', () => {
  it('UT-US-017-74 toute suite d’altérations, de choix, de coupures et de cycles, suivie de la résolution (réseau rétabli, « Restaurer » partout où ERR-012 demeure, échanges) : convergence, génération monotone, aucune écriture pendant ERR-012, ALR-014 complet', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(commande, { minLength: 1, maxLength: 12 }), async (commandes) => {
        const env = preparerRestauration();
        await avecObjectifPublie(env);
        const appareils = [env.smartphone, env.pc] as const;
        let numero = 0;

        const synchroniser = async (a: AppareilRestauration) => {
          const avant = env.drive.ecrituresPar(a.appareilId);
          const generationAvant = (await metaDe(a)).generation ?? GENERATION_INITIALE;
          const etatAvant = valeurDe(await a.depot.lire());
          const issue = await a.cycle.synchroniserMaintenant();
          // Aucune écriture dans le Drive par un cycle qui constate une altération (n° 4, n° 12).
          expect(
            issue !== 'DONNEES_ALTEREES' || env.drive.ecrituresPar(a.appareilId) === avant,
          ).toBe(true);
          const generationApres = (await metaDe(a)).generation ?? GENERATION_INITIALE;
          // La génération d'un appareil ne recule jamais (n° 1, n° 3).
          expect(comparerGenerations(generationAvant, generationApres)).toBeLessThanOrEqual(0);
          // RG-044 b (n° 10) : à un changement de génération, chaque écriture en attente encore gagnante est signalée.
          const changee = comparerGenerations(generationAvant, generationApres) < 0;
          const ids = new Set((await signalementsDe(a)).valeursEcartees.keys());
          const manquantes = [...etatAvant.enAttente].filter(([texte, { cle, entree }]) => {
            const r = etatAvant.registres.get(texte);
            return (
              changee &&
              r !== undefined &&
              cle.champ !== 'suppression' &&
              comparerHlc(r.ecriture.hlc, entree.derniereHlc) === 0 &&
              !ids.has(idValeurEcartee(cle, r.ecriture.hlc))
            );
          });
          expect(manquantes).toEqual([]);
        };

        for (const c of commandes) {
          switch (c.type) {
            case 'RENOMMER':
              numero += 1;
              await renommerObjectif(appareils[c.qui], PUBLIER, `Titre ${String(numero)}`);
              break;
            case 'SYNCHRONISER':
              await synchroniser(appareils[c.qui]);
              break;
            case 'RESEAU':
              appareils[c.qui].reseau.changer(c.connecte);
              break;
            case 'SUPPRIMER_DONNEES':
              env.drive.supprimerDonnees();
              break;
            case 'MODIFIER_FICHIER': {
              const fichier = env.drive.fichierDe(appareils[c.qui].appareilId);
              if (fichier !== undefined) env.drive.modifierFichierALaMain(fichier.id);
              break;
            }
            case 'RESTAURER':
              await appareils[c.qui].restaurer.executer();
              break;
            case 'REPARTIR':
              await appareils[c.qui].repartir.executer();
              break;
          }
          env.plusTard();
        }

        // Résolution : réseau rétabli, « Restaurer » là où ERR-012 demeure, échanges jusqu'au repos.
        appareils.forEach((a) => {
          a.reseau.changer(true);
        });
        for (let tour = 0; tour < 4; tour += 1) {
          for (const a of appareils) {
            await synchroniser(a);
            if (a.cycle.etatMoteur().actionRequise === 'DONNEES_ABSENTES') {
              valeurDe(await a.restaurer.executer());
            }
          }
        }
        await env.echanger();

        for (const a of appareils) expect(a.cycle.etatMoteur().actionRequise).toBeUndefined();
        expect(await etatMetierDe(env.smartphone)).toEqual(await etatMetierDe(env.pc));
        const gS = (await metaDe(env.smartphone)).generation ?? GENERATION_INITIALE;
        const gP = (await metaDe(env.pc)).generation ?? GENERATION_INITIALE;
        expect(comparerGenerations(gS, gP)).toBe(0);
        // DONNEES_EFFACEES : jamais comptée « à lire » (H-6).
        for (const a of appareils) {
          const sig = await signalementsDe(a);
          const nonLues = [...sig.valeursEcartees.values()].filter(
            (v) => v.motif !== 'DONNEES_EFFACEES' && !sig.lectures.has(v.id),
          ).length;
          expect(compterALire(sig.valeursEcartees, sig.lectures)).toBe(nonLues);
        }
      }),
      { numRuns: 25 },
    );
  }, 120_000);
});
