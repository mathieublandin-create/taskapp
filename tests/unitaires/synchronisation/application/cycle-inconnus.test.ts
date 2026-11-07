/**
 * Coexistence de deux versions de même format dans le cycle (RG-058 ; ANT-19 ; conventions §10.3 (b) ; ST-US-017
 * v0.11 §6.8 n° 14, n° 15) : les éléments inconnus d'un fichier reçu sont fusionnés et conservés localement, réécrits
 * dans le fichier de l'appareil, et leur HLC est reçu (causalité) ; aucune saisie n'est bloquée. UT-US-017-87
 * (rang 11, tranche H4).
 */
import { describe, expect, it } from 'vitest';
import { comparerHlc } from '@src/synchronisation/domaine/hlc';
import { appliquerModifications, valeurDe } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import {
  avecObjectifPublie,
  fichierDuDrive,
  objectifsDe,
  preparerRestauration,
  PUBLIER,
} from '@tests/support/synchronisation/restauration';
import { hlc, idObjectif, PC, SMARTPHONE } from '@tests/support/valeurs';

/** Le PC (version plus récente, même format) ajoute à son fichier un champ et une entrée de journal inconnus. */
const ajouterInconnus = async (env: ReturnType<typeof preparerRestauration>, iso: string) => {
  await env.drive.reecrireParVersionRecente(PC, (objet) => {
    const appareils = objet['appareils'] as ReadonlyArray<string>;
    const hlcPc = { physique: iso, compteur: 0, appareil: appareils.indexOf(PC) };
    // Une seule valeur par clé et par identifiant : celle de cette réécriture remplace la précédente.
    objet['registres'] = (objet['registres'] as Array<Record<string, unknown>>).filter(
      (r) => r['champ'] !== 'importance',
    );
    objet['journal'] = (objet['journal'] as Array<Record<string, unknown>>).filter(
      (e) => e['id'] !== 'evt-futur',
    );
    (objet['registres'] as Array<unknown>).push({
      type: 'OBJECTIF',
      id: PUBLIER,
      champ: 'importance',
      valeur: 3,
      hlc: hlcPc,
    });
    (objet['journal'] as Array<unknown>).push({
      type: 'ETIQUETAGE',
      id: 'evt-futur',
      hlc: hlcPc,
      element: { type: 'OBJECTIF', id: PUBLIER },
    });
  });
};

describe('Éléments inconnus reçus (ST-US-017 v0.11 §6.8 n° 14, n° 15)', () => {
  it('UT-US-017-87 le smartphone fusionne sans blocage, conserve les éléments inconnus, les réécrit dans son fichier et reçoit leur HLC ; les données connues sont inchangées', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    const iso = '2026-10-21T09:00:00.000Z';
    await ajouterInconnus(env, iso);

    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(env.smartphone.cycle.etatMoteur().actionRequise).toBeUndefined();

    const inconnus = valeurDe(await env.smartphone.depot.lireInconnus());
    expect(inconnus.registres).toEqual([
      { type: 'OBJECTIF', id: PUBLIER, champ: 'importance', valeur: 3, hlc: hlc(iso, 0, PC) },
    ]);
    expect(inconnus.evenements.map((e) => e.id)).toEqual(['evt-futur']);
    const etat = valeurDe(await env.smartphone.depot.lire());
    expect(
      etat.dernierHlc !== undefined && comparerHlc(etat.dernierHlc, hlc(iso, 0, PC)) >= 0,
    ).toBe(true);

    // Une saisie suivante est acceptée et déposée avec les éléments inconnus.
    valeurDe(
      await appliquerModifications(env.smartphone.service, (_etat, contexte) => [
        creationObjectif(
          { id: idObjectif(2), intitule: 'Courir un semi-marathon' },
          contexte.instant,
        ),
      ]),
    );
    expect(await env.smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    const { contenu } = await fichierDuDrive(env.drive, SMARTPHONE);
    expect(contenu.inconnus).toEqual(inconnus);
    expect([...(await objectifsDe(env.smartphone)).keys()].sort()).toEqual([
      'Courir un semi-marathon',
      'Publier le guide',
    ]);
  });

  it('UT-US-017-87 un élément inconnu plus récent remplace l’ancien ; un plus ancien n’écrit rien (aucune nouvelle version locale)', async () => {
    const env = preparerRestauration();
    await avecObjectifPublie(env);
    await ajouterInconnus(env, '2026-10-21T09:00:00.000Z');
    await env.smartphone.cycle.synchroniserMaintenant();

    await ajouterInconnus(env, '2026-10-21T10:00:00.000Z');
    await env.smartphone.cycle.synchroniserMaintenant();
    expect(valeurDe(await env.smartphone.depot.lireInconnus()).registres[0]?.hlc).toEqual(
      hlc('2026-10-21T10:00:00.000Z', 0, PC),
    );

    const version = valeurDe(await env.smartphone.depot.lire()).version;
    await ajouterInconnus(env, '2026-10-21T08:30:00.000Z');
    await env.smartphone.cycle.synchroniserMaintenant();
    expect(valeurDe(await env.smartphone.depot.lireInconnus()).registres[0]?.hlc).toEqual(
      hlc('2026-10-21T10:00:00.000Z', 0, PC),
    );
    expect(valeurDe(await env.smartphone.depot.lire()).version).toBe(version);
  });
});
