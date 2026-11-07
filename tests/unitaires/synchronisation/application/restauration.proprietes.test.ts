/**
 * Propriété de convergence de l'incrément 3, mécanismes combinés (ST-US-017 v0.10.1 §6.7, §13.5 ; leçon du rang 9 :
 * vérifier par la convergence, pas seulement par cas) : saisies, coupures du réseau, altérations (données
 * supprimées ou rendues illisibles, dossier supprimé, fichier d'un appareil modifié à la main, dossier en double),
 * choix concurrents (« Restaurer » en ligne ou hors ligne, « Repartir de zéro »), coupures entre le dépôt du fichier
 * propre et l'écriture du manifeste (réponse perdue, panne), horloge qui recule, cycles dans un ordre quelconque ; deux
 * et trois appareils. UT-US-017-74. Conditions C1 à C9 de Starck (DAT v0.11.10 §4.2.2) : voir les invariants.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { Generation } from '@src/synchronisation/domaine/contenu-fichier';
import {
  comparerGenerations,
  GENERATION_INITIALE,
} from '@src/synchronisation/domaine/controle-drive';
import { comparerHlc } from '@src/synchronisation/domaine/hlc';
import { compterALire } from '@src/synchronisation/domaine/lectures';
import { projeterEtatMetier } from '@src/synchronisation/domaine/projection';
import { idValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { decoderFichierAppareil } from '@src/synchronisation/infrastructure/drive/format-v1';
import { valeurDe } from '@tests/support/environnement';
import {
  avecObjectifPublie,
  DEPART,
  manifestesDuDrive,
  metaDe,
  preparerRestauration,
  PUBLIER,
  renommerObjectif,
  signalementsDe,
  type AppareilRestauration,
} from '@tests/support/synchronisation/restauration';
import { ecart, instant, MINUTE, TROISIEME } from '@tests/support/valeurs';

type Qui = 0 | 1 | 2;
type Commande =
  | { readonly type: 'RENOMMER'; readonly qui: Qui }
  | { readonly type: 'SYNCHRONISER'; readonly qui: Qui }
  | { readonly type: 'RESEAU'; readonly qui: Qui; readonly connecte: boolean }
  | { readonly type: 'SUPPRIMER_DONNEES' }
  | { readonly type: 'RENDRE_ILLISIBLES' }
  | { readonly type: 'SUPPRIMER_DOSSIERS' }
  | { readonly type: 'DOSSIER_EN_DOUBLE' }
  | { readonly type: 'MODIFIER_FICHIER'; readonly qui: Qui }
  | { readonly type: 'RESTAURER'; readonly qui: Qui }
  | { readonly type: 'REPARTIR'; readonly qui: Qui }
  /** Coupure entre le dépôt et le manifeste : le prochain dépôt aboutit dans le Drive, sa réponse est perdue. */
  | { readonly type: 'REPONSE_DEPOT_PERDUE' }
  /** Panne juste après le prochain dépôt confirmé : les deux requêtes suivantes échouent (manifeste compris). */
  | { readonly type: 'PANNE_APRES_DEPOT' }
  /** L'horloge (commune au banc) recule de 30 minutes : HLC des choix (condition C3). */
  | { readonly type: 'HORLOGE_RECULE' };

const commandes = (nombre: 2 | 3): fc.Arbitrary<Commande> => {
  const qui = fc.constantFrom<Qui>(...([0, 1, 2] as const).slice(0, nombre));
  return fc.oneof(
    { weight: 3, arbitrary: qui.map((q) => ({ type: 'RENOMMER', qui: q }) as const) },
    { weight: 6, arbitrary: qui.map((q) => ({ type: 'SYNCHRONISER', qui: q }) as const) },
    {
      weight: 2,
      arbitrary: fc
        .tuple(qui, fc.boolean())
        .map(([q, connecte]) => ({ type: 'RESEAU', qui: q, connecte }) as const),
    },
    { weight: 1, arbitrary: fc.constant({ type: 'SUPPRIMER_DONNEES' } as const) },
    { weight: 1, arbitrary: fc.constant({ type: 'RENDRE_ILLISIBLES' } as const) },
    { weight: 1, arbitrary: fc.constant({ type: 'SUPPRIMER_DOSSIERS' } as const) },
    { weight: 1, arbitrary: fc.constant({ type: 'DOSSIER_EN_DOUBLE' } as const) },
    { weight: 1, arbitrary: qui.map((q) => ({ type: 'MODIFIER_FICHIER', qui: q }) as const) },
    { weight: 2, arbitrary: qui.map((q) => ({ type: 'RESTAURER', qui: q }) as const) },
    { weight: 2, arbitrary: qui.map((q) => ({ type: 'REPARTIR', qui: q }) as const) },
    { weight: 1, arbitrary: fc.constant({ type: 'REPONSE_DEPOT_PERDUE' } as const) },
    { weight: 1, arbitrary: fc.constant({ type: 'PANNE_APRES_DEPOT' } as const) },
    { weight: 1, arbitrary: fc.constant({ type: 'HORLOGE_RECULE' } as const) },
  );
};

const etatMetierDe = async (a: AppareilRestauration) => {
  const metier = projeterEtatMetier(valeurDe(await a.depot.lire()));
  return [...metier.objectifs.values()]
    .filter((o) => !o.supprime)
    .map((o) => `${o.id}:${o.intitule}:${String(o.delai)}`)
    .sort();
};

const generationDe = async (a: AppareilRestauration): Promise<Generation> =>
  (await metaDe(a)).generation ?? GENERATION_INITIALE;

const verifierConvergence = async (
  nombre: 2 | 3,
  suite: ReadonlyArray<Commande>,
): Promise<void> => {
  const env = preparerRestauration();
  const appareils: ReadonlyArray<AppareilRestauration> =
    nombre === 2 ? [env.smartphone, env.pc] : [env.smartphone, env.pc, env.creer(TROISIEME, '03')];
  const echangerTous = async () => {
    for (let tour = 0; tour < 3; tour += 1) {
      for (const a of appareils) await a.cycle.synchroniserMaintenant();
    }
  };
  await avecObjectifPublie(env);
  await echangerTous();
  let numero = 0;
  let enDouble = false;

  /** Condition C1 : dans une même génération, `restaurationConnue` ne décroît jamais, quelle que soit l'opération. */
  const observer = async <T>(a: AppareilRestauration, operation: () => Promise<T>): Promise<T> => {
    const avant = await metaDe(a);
    const resultat = await operation();
    const apres = await metaDe(a);
    const memeGeneration =
      comparerGenerations(
        avant.generation ?? GENERATION_INITIALE,
        apres.generation ?? GENERATION_INITIALE,
      ) === 0;
    if (memeGeneration && avant.restaurationConnue !== undefined) {
      expect(apres.restaurationConnue).toBeDefined();
      if (apres.restaurationConnue !== undefined) {
        expect(
          comparerHlc(apres.restaurationConnue, avant.restaurationConnue),
        ).toBeGreaterThanOrEqual(0);
      }
    }
    return resultat;
  };

  const synchroniser = async (a: AppareilRestauration) => {
    const avant = env.drive.ecrituresPar(a.appareilId);
    const generationAvant = await generationDe(a);
    const etatAvant = valeurDe(await a.depot.lire());
    const issue = await observer(a, () => a.cycle.synchroniserMaintenant());
    // Aucune écriture dans le Drive par un cycle qui constate une altération (n° 4, n° 12).
    expect(issue !== 'DONNEES_ALTEREES' || env.drive.ecrituresPar(a.appareilId) === avant).toBe(
      true,
    );
    const generationApres = await generationDe(a);
    // La génération d'un appareil ne recule jamais (n° 1, n° 3).
    expect(comparerGenerations(generationAvant, generationApres)).toBeLessThanOrEqual(0);
    // RG-044 b (n° 10) : à un changement de génération, chaque écriture en attente encore gagnante est signalée ;
    // condition C9 : si l'appareil achève son propre « Repartir de zéro », seules celles postérieures à son HLC.
    const changee = comparerGenerations(generationAvant, generationApres) < 0;
    const propre =
      generationApres.type === 'NOUVELLE' && generationApres.hlc.appareil === a.appareilId
        ? generationApres.hlc
        : undefined;
    const ids = new Set((await signalementsDe(a)).valeursEcartees.keys());
    const manquantes = [...etatAvant.enAttente].filter(([texte, { cle, entree }]) => {
      const r = etatAvant.registres.get(texte);
      return (
        changee &&
        r !== undefined &&
        cle.champ !== 'suppression' &&
        comparerHlc(r.ecriture.hlc, entree.derniereHlc) === 0 &&
        (propre === undefined || comparerHlc(entree.derniereHlc, propre) > 0) &&
        !ids.has(idValeurEcartee(cle, r.ecriture.hlc))
      );
    });
    expect(manquantes).toEqual([]);
  };

  const appareil = (q: Qui): AppareilRestauration => {
    const a = appareils[q];
    if (a === undefined) throw new Error(`appareil ${String(q)} absent`);
    return a;
  };

  for (const c of suite) {
    switch (c.type) {
      case 'RENOMMER':
        numero += 1;
        await renommerObjectif(appareil(c.qui), PUBLIER, `Titre ${String(numero)}`);
        break;
      case 'SYNCHRONISER':
        await synchroniser(appareil(c.qui));
        break;
      case 'RESEAU':
        appareil(c.qui).reseau.changer(c.connecte);
        break;
      case 'SUPPRIMER_DONNEES':
        env.drive.supprimerDonnees();
        break;
      case 'RENDRE_ILLISIBLES':
        env.drive.rendreDonneesIllisibles();
        break;
      case 'SUPPRIMER_DOSSIERS':
        env.drive.supprimerDossiers();
        break;
      case 'DOSSIER_EN_DOUBLE':
        if (!enDouble) {
          enDouble = true;
          env.drive.ajouterDossier(TROISIEME, instant(DEPART) - 60_000);
        }
        break;
      case 'MODIFIER_FICHIER': {
        const fichier = env.drive.fichierDe(appareil(c.qui).appareilId);
        if (fichier !== undefined) env.drive.modifierFichierALaMain(fichier.id);
        break;
      }
      case 'RESTAURER': {
        const a = appareil(c.qui);
        await observer(a, () => a.restaurer.executer());
        break;
      }
      case 'REPARTIR': {
        const a = appareil(c.qui);
        await observer(a, () => a.repartir.executer());
        break;
      }
      case 'REPONSE_DEPOT_PERDUE':
        env.drive.perdreReponseDuProchainDepot();
        break;
      case 'PANNE_APRES_DEPOT':
        env.drive.avantReponseDuProchainDepot(() => {
          env.drive.indisponible(2);
          return Promise.resolve();
        });
        break;
      case 'HORLOGE_RECULE':
        env.temps.positionner(
          instant(new Date(env.temps.maintenant() - 30 * MINUTE).toISOString()),
        );
        break;
    }
    env.temps.avancer(ecart(10 * MINUTE));
  }

  // Résolution : réseau et Drive rétablis, « Restaurer » là où ERR-012 demeure, échanges jusqu'au repos.
  env.drive.retablir();
  appareils.forEach((a) => {
    a.reseau.changer(true);
  });
  for (let tour = 0; tour < 4; tour += 1) {
    for (const a of appareils) {
      await synchroniser(a);
      if (a.cycle.etatMoteur().actionRequise === 'DONNEES_ABSENTES') {
        valeurDe(await observer(a, () => a.restaurer.executer()));
      }
    }
  }
  await echangerTous();

  // Plus aucune question, états identiques, une seule génération.
  for (const a of appareils) expect(a.cycle.etatMoteur().actionRequise).toBeUndefined();
  const [premier, ...autres] = appareils;
  if (premier === undefined) throw new Error('appareil attendu');
  const reference = await etatMetierDe(premier);
  const generation = await generationDe(premier);
  for (const a of autres) {
    expect(await etatMetierDe(a)).toEqual(reference);
    expect(comparerGenerations(await generationDe(a), generation)).toBe(0);
  }

  // Un seul dossier ; manifestes tous lisibles (C6 ; `manifestesDuDrive` échoue sur un illisible), de la génération
  // commune (jointure).
  const dossiers = env.drive.dossiers();
  expect(dossiers).toHaveLength(1);
  const manifestes = await manifestesDuDrive(env.drive);
  expect(manifestes.length).toBeGreaterThanOrEqual(1);
  for (const m of manifestes) {
    expect(m.fichier.parent).toBe(dossiers[0]?.id);
    expect(comparerGenerations(m.contenu.generation, generation)).toBe(0);
  }

  // Exactement un fichier par appareil (C7, C8 : aucun orphelin, aucun illisible laissé à côté), lisible, dans le
  // dossier, de la génération commune ; c'est celui que l'appareil mémorise.
  for (const a of appareils) {
    const fichiers = env.drive
      .fichiers()
      .filter((f) => !f.supprime && f.appProperties['appareil'] === a.appareilId);
    expect(fichiers).toHaveLength(1);
    const [fichier] = fichiers;
    if (fichier === undefined) continue;
    expect(fichier.parent).toBe(dossiers[0]?.id);
    expect((await metaDe(a)).fichierPropre).toBe(fichier.id);
    const contenu = valeurDe(await decoderFichierAppareil(fichier.octets));
    expect(comparerGenerations(contenu.generation, generation)).toBe(0);
  }

  // DONNEES_EFFACEES : jamais comptée « à lire » (H-6).
  for (const a of appareils) {
    const sig = await signalementsDe(a);
    const nonLues = [...sig.valeursEcartees.values()].filter(
      (v) => v.motif !== 'DONNEES_EFFACEES' && !sig.lectures.has(v.id),
    ).length;
    expect(compterALire(sig.valeursEcartees, sig.lectures)).toBe(nonLues);
  }
};

describe('Convergence de l’incrément 3, mécanismes combinés (ST-US-017 v0.10.1 §6.7)', () => {
  it('UT-US-017-74 deux appareils : toute suite d’altérations, de choix concurrents, de coupures (réseau, entre dépôt et manifeste), de reculs d’horloge et de cycles, suivie de la résolution : convergence (une génération, un dossier, des manifestes lisibles, un fichier par appareil, états identiques), génération et restauration connue monotones, aucune écriture pendant ERR-012, ALR-014 complet', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(commandes(2), { minLength: 1, maxLength: 14 }), (suite) =>
        verifierConvergence(2, suite),
      ),
      { seed: 20261101, numRuns: 25 },
    );
  }, 240_000);

  it('UT-US-017-74 trois appareils : mêmes mécanismes combinés, mêmes invariants', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(commandes(3), { minLength: 1, maxLength: 14 }), (suite) =>
        verifierConvergence(3, suite),
      ),
      { seed: 20261101, numRuns: 25 },
    );
  }, 360_000);
});
