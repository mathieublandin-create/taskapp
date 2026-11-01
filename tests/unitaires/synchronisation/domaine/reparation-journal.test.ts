/**
 * Entrée de journal d'un placement annulé par la réparation RG-048 (ST-US-017 v0.6 §6.6 n° 8, 9 b à 9 d, 11 ;
 * Q-ST017-PEP-2 b ; US-023 CA-11 et S18d ; glossaire d'étapes v1.12 §11 ; DAT §6.1 « Entrées produites par la
 * fusion »). Conséquence enregistrée : « changement parent », avant = placement annulé, après = placement rétabli,
 * à la journée du placement annulé, juste après lui, identique et unique sur les deux appareils.
 * UT-US-017-100 à 105 (tranche B1b).
 */
import { describe, expect, it } from 'vitest';
import type { IdAppareil, IdObjectif } from '@src/commun/domaine/identifiants';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import { contexteDeNouvelleEcriture } from '@src/synchronisation/domaine/contexte-causal';
import type { RegistreQuelconque } from '@src/synchronisation/domaine/ecriture';
import {
  entreeDeReparation,
  estIdEvenementDeReparation,
  idEvenementDeReparation,
} from '@src/synchronisation/domaine/entree-reparation';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import type { Hlc } from '@src/synchronisation/domaine/hlc';
import { lireIdEvenement } from '@src/synchronisation/domaine/identifiant-evenement';
import type { PlacementObjectif } from '@src/synchronisation/domaine/information';
import { planifierSynchronisation } from '@src/synchronisation/domaine/planifier-synchronisation';
import { reparerHierarchie } from '@src/synchronisation/domaine/reparation-hierarchie';
import { idValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { etatLocal, registre } from '@tests/support/fabriques/etat-local';
import {
  changementParent,
  creePrincipal,
  deplaceSous,
  h,
  objectifCree,
  parentObjectif,
  signalements,
  t,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import {
  date,
  hlc,
  idEvenementTest,
  idObjectif,
  idOperation,
  instant,
  PC,
  SMARTPHONE,
} from '@tests/support/valeurs';

const ALPHA = idObjectif(1);
const BETA = idObjectif(2);
const GAMMA = idObjectif(3);
const DELTA = idObjectif(4);
const cleParent = (id: IdObjectif) => ({ type: 'OBJECTIF', id, champ: 'parent' }) as const;

const crees = (ids: ReadonlyArray<IdObjectif>): ReadonlyArray<RegistreQuelconque> =>
  ids.flatMap((id, i) => objectifCree(id, `O${String(i)}`, h(0, PC)));

type Deplacement = { readonly registre: RegistreQuelconque; readonly evenement: EvenementJournal };

/**
 * Déplacement de `id` sous `parentId` à `ecriture` (registre et entrée du journal). `jour` et `instant` de l'entrée
 * sont donnés à part : l'heure non corrigée de l'appareil diffère de la physique du HLC (DAT §6.4), et l'entrée de
 * réparation doit reprendre ceux de l'entrée, pas ceux du HLC.
 */
const deplacer = (
  id: IdObjectif,
  parentId: IdObjectif,
  ecriture: Hlc,
  journee: { readonly jour: string; readonly instant: string },
  avant: PlacementObjectif = creePrincipal(h(0, PC)),
): Deplacement => {
  const apres = deplaceSous(parentId, ecriture);
  const contexte =
    avant.hlcOrigine.appareil === ecriture.appareil
      ? {}
      : { [avant.hlcOrigine.appareil]: avant.hlcOrigine };
  return {
    registre: parentObjectif(id, apres, ecriture, contexte),
    evenement: {
      ...changementParent(id, avant, apres, ecriture),
      jour: date(journee.jour),
      instant: instant(journee.instant),
    },
  };
};

const LE_21 = { jour: '2026-10-21', instant: '2026-10-21T08:09:30.000Z' } as const;
const LE_22 = { jour: '2026-10-22', instant: '2026-10-22T07:00:00.000Z' } as const;

const etatFusionne = (
  appareil: IdAppareil,
  ids: ReadonlyArray<IdObjectif>,
  deplacements: ReadonlyArray<Deplacement>,
  journalEnPlus: ReadonlyArray<EvenementJournal> = [],
) =>
  etatLocal({
    appareilId: appareil,
    dernierHlc: h(5, SMARTPHONE),
    registres: [...crees(ids), ...deplacements.map((d) => d.registre)],
    journal: [...journalEnPlus, ...deplacements.map((d) => d.evenement)],
  });

/** Entrée attendue : `CHANGEMENT_PARENT`, HLC du déplacement annulé, journée et instant de son entrée, sans `cause`. */
const attendue = (
  id: IdObjectif,
  annule: PlacementObjectif,
  retabli: PlacementObjectif,
  journee: { readonly jour: string; readonly instant: string },
): EvenementJournal => ({
  id: idEvenementDeReparation(id, annule.hlcOrigine),
  type: 'CHANGEMENT_PARENT',
  element: { type: 'OBJECTIF', id },
  avant: annule,
  apres: retabli,
  hlc: annule.hlcOrigine,
  instant: instant(journee.instant),
  jour: date(journee.jour),
});

describe('Entrée de journal de la réparation RG-048 (RG-050, US-023 CA-11)', () => {
  it('UT-US-017-100 S25, US-023 S18d : une entrée « changement parent » du placement annulé, à sa journée, au HLC du déplacement, identique sur les deux appareils ; hiérarchie valide : aucune', () => {
    // Alpha sous Bêta (PC, le 22) ; Bêta sous Alpha (smartphone, 10 min plus tard) ; échange le 23.
    const alphaSousBeta = deplacer(ALPHA, BETA, h(1, PC), LE_22);
    const betaSousAlpha = deplacer(BETA, ALPHA, h(2, SMARTPHONE), LE_22);
    const deplacements = [alphaSousBeta, betaSousAlpha];

    const surLeSmartphone = reparerHierarchie(
      etatFusionne(SMARTPHONE, [ALPHA, BETA], deplacements),
      instant('2026-10-23T07:00:00.000Z'),
    );
    const surLePc = reparerHierarchie(
      etatFusionne(PC, [ALPHA, BETA], deplacements),
      instant('2026-10-23T09:30:00.000Z'),
    );

    const entree = attendue(ALPHA, deplaceSous(BETA, h(1, PC)), creePrincipal(h(0, PC)), LE_22);
    expect(surLeSmartphone.evenementsAjoutes).toStrictEqual([entree]);
    expect(surLePc.evenementsAjoutes).toStrictEqual([entree]);
    // Même texte que l'identifiant du signalement (DAT §6.1 : hash(élément, HLC du déplacement annulé)).
    expect(String(entree.id)).toBe(String(surLeSmartphone.valeursEcartees[0]?.id));

    expect(
      reparerHierarchie(
        etatFusionne(SMARTPHONE, [ALPHA, BETA], [alphaSousBeta]),
        instant('2026-10-23T07:00:00.000Z'),
      ).evenementsAjoutes,
    ).toEqual([]);
  });

  it('UT-US-017-101 S18c : une entrée par placement annulé, dans l’ordre des annulations, chacune à la journée de son placement ; un même objectif annulé deux fois : deux entrées, chacune décrit sa propre annulation', () => {
    // Alpha sous Bêta (PC, t1, le 21), Gamma sous Alpha (smartphone, t2, le 22), Delta sous Gamma (PC, t3).
    const alphaSousBeta = deplacer(ALPHA, BETA, h(1, PC), LE_21);
    const gammaSousAlpha = deplacer(GAMMA, ALPHA, h(2, SMARTPHONE), LE_22);
    const deltaSousGamma = deplacer(DELTA, GAMMA, h(3, PC), LE_22);
    const chaine = reparerHierarchie(
      etatFusionne(
        SMARTPHONE,
        [ALPHA, BETA, GAMMA, DELTA],
        [alphaSousBeta, gammaSousAlpha, deltaSousGamma],
      ),
      instant(t(4)),
    );
    expect(chaine.evenementsAjoutes).toStrictEqual([
      attendue(ALPHA, deplaceSous(BETA, h(1, PC)), creePrincipal(h(0, PC)), LE_21),
      attendue(GAMMA, deplaceSous(ALPHA, h(2, SMARTPHONE)), creePrincipal(h(0, PC)), LE_22),
    ]);

    // Alpha sous Bêta (PC, t1, le 21), puis sous Gamma (PC, t2, le 22) ; Gamma sous Alpha (smartphone, t3) : le
    // déplacement de t2 est annulé (rétablit « sous Bêta »), puis celui de t1 (rétablit « principal »). Chaque entrée
    // ne dépend que de son annulation (après = valeur rétablie à ce pas, pas la valeur finale) : un appareil qui
    // ferait les deux annulations en deux passes écrirait les mêmes entrées (Q-ST017-PEP-3).
    const premier = deplacer(ALPHA, BETA, h(1, PC), LE_21);
    const second = deplacer(ALPHA, GAMMA, h(2, PC), LE_22, deplaceSous(BETA, h(1, PC)));
    const croise = deplacer(GAMMA, ALPHA, h(3, SMARTPHONE), LE_22);
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      dernierHlc: h(3, SMARTPHONE),
      registres: [...crees([ALPHA, BETA, GAMMA]), second.registre, croise.registre],
      journal: [premier.evenement, second.evenement, croise.evenement],
    });
    expect(reparerHierarchie(etat, instant(t(4))).evenementsAjoutes).toStrictEqual([
      attendue(ALPHA, deplaceSous(GAMMA, h(2, PC)), deplaceSous(BETA, h(1, PC)), LE_22),
      attendue(ALPHA, deplaceSous(BETA, h(1, PC)), creePrincipal(h(0, PC)), LE_21),
    ]);
  });

  it('UT-US-017-102 idempotence : entrée déjà connue (reçue de l’autre appareil) non rendue ; la boucle ne prend jamais une entrée de réparation pour l’entrée du déplacement (même HLC)', () => {
    const alphaSousBeta = deplacer(ALPHA, BETA, h(1, PC), LE_22);
    const betaSousAlpha = deplacer(BETA, ALPHA, h(2, SMARTPHONE), LE_22);
    const connue = attendue(ALPHA, deplaceSous(BETA, h(1, PC)), creePrincipal(h(0, PC)), LE_22);

    // L'entrée de réparation est placée avant l'entrée du déplacement : une recherche « premier HLC égal » la prendrait,
    // et rétablirait « sous Bêta » (son `avant`) au lieu de « principal ».
    const resultat = reparerHierarchie(
      etatFusionne(SMARTPHONE, [ALPHA, BETA], [alphaSousBeta, betaSousAlpha], [connue]),
      instant(t(6)),
    );

    expect(resultat.evenementsAjoutes).toEqual([]);
    expect(resultat.registresEcrits).toEqual([
      registre(
        cleParent(ALPHA),
        creePrincipal(h(0, PC)),
        h(6, SMARTPHONE),
        contexteDeNouvelleEcriture(alphaSousBeta.registre.ecriture, SMARTPHONE),
      ),
    ]);
    expect(resultat.valeursEcartees.map((v) => v.id)).toEqual([
      idValeurEcartee(cleParent(ALPHA), h(1, PC)),
    ]);
  });

  it('UT-US-017-103 entrée du déplacement absente du journal : instant = physique du HLC annulé, journée de Paris de cet instant, après = principal (n° 8)', () => {
    // Déplacement à 22:30 UTC le 21, soit le 22 à Paris (heure d'été) ; aucune entrée de journal pour lui.
    const tard = hlc('2026-10-21T22:30:00.000Z', 0, PC);
    const alphaSousBeta = parentObjectif(ALPHA, deplaceSous(BETA, tard), tard);
    const plusTard = hlc('2026-10-21T22:40:00.000Z', 0, SMARTPHONE);
    const betaSousAlpha = parentObjectif(BETA, deplaceSous(ALPHA, plusTard), plusTard, {
      [PC]: h(0, PC),
    });
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      dernierHlc: plusTard,
      registres: [...crees([ALPHA, BETA]), alphaSousBeta, betaSousAlpha],
    });

    const resultat = reparerHierarchie(etat, instant('2026-10-23T07:00:00.000Z'));

    expect(resultat.evenementsAjoutes).toStrictEqual([
      attendue(ALPHA, deplaceSous(BETA, tard), creePrincipal(h(0, PC)), {
        jour: '2026-10-22',
        instant: '2026-10-21T22:30:00.000Z',
      }),
    ]);
    // Fonction exposée : même résultat qu'au travers de la boucle.
    expect(
      entreeDeReparation(etat.journal, {
        objectif: ALPHA,
        annule: deplaceSous(BETA, tard),
        retabli: creePrincipal(h(0, PC)),
      }),
    ).toStrictEqual(resultat.evenementsAjoutes[0]);
  });

  it('UT-US-017-104 planifierSynchronisation : l’entrée de la réparation suit les entrées reçues dans le plan et l’état ; la même entrée reçue de l’autre appareil, qui a aussi réparé, n’est pas ajoutée deux fois', () => {
    const creations = crees([ALPHA, BETA]);
    const alphaSousBeta = deplacer(ALPHA, BETA, h(1, PC), LE_22);
    const betaSousAlpha = deplacer(BETA, ALPHA, h(2, SMARTPHONE), LE_22);
    const entree = attendue(ALPHA, deplaceSous(BETA, h(1, PC)), creePrincipal(h(0, PC)), LE_22);
    const fichierDuPc = (
      registres: ReadonlyArray<RegistreQuelconque>,
      journal: ReadonlyArray<EvenementJournal>,
    ): ContenuFichierAppareil => ({
      schemaVersion: 1,
      versionApplication: '0.1.0',
      generation: { type: 'INITIALE' },
      appareil: PC,
      registres,
      journal,
    });
    const smartphone = etatLocal({
      appareilId: SMARTPHONE,
      dernierHlc: h(2, SMARTPHONE),
      registres: [...creations, betaSousAlpha.registre],
      journal: [betaSousAlpha.evenement],
    });

    const premier = planifierSynchronisation(
      smartphone,
      signalements(),
      fichierDuPc([...creations, alphaSousBeta.registre], [alphaSousBeta.evenement]),
      instant(t(3)),
    );

    expect(premier.plan.evenementsAjoutes).toStrictEqual([alphaSousBeta.evenement, entree]);
    expect(premier.plan.etatApres.journal.get(entree.id)).toStrictEqual(entree);
    expect(premier.meta).toEqual({ fusionNonDeposee: true });

    // Le PC a réparé de son côté (registre de HLC h(4, PC), même valeur) et dépose la même entrée.
    const reparePc = registre(
      cleParent(ALPHA),
      creePrincipal(h(0, PC)),
      h(4, PC),
      contexteDeNouvelleEcriture(alphaSousBeta.registre.ecriture, PC),
    );
    const second = planifierSynchronisation(
      premier.plan.etatApres,
      signalements(),
      fichierDuPc(
        [...creations, betaSousAlpha.registre, reparePc],
        [alphaSousBeta.evenement, betaSousAlpha.evenement, entree],
      ),
      instant(t(5)),
    );

    expect(second.plan.evenementsAjoutes).toEqual([]);
    // Historique d'Alpha : le déplacement et une seule entrée de réparation.
    expect(
      [...second.plan.etatApres.journal.values()].filter((e) => e.element.id === ALPHA),
    ).toStrictEqual([alphaSousBeta.evenement, entree]);
  });

  it('UT-US-017-105 identifiant : même texte que le signalement, 52 caractères [0-9a-v], reconnu comme entrée de réparation et accepté à la relecture ; la forme opération:rang reste seule acceptée par ailleurs', () => {
    const id = idEvenementDeReparation(ALPHA, h(1, PC));
    const deCasUsage = idEvenementTest(idOperation(1), 0);

    expect(String(id)).toBe(String(idValeurEcartee(cleParent(ALPHA), h(1, PC))));
    expect(id).toMatch(/^[0-9a-v]{52}$/);
    expect(idEvenementDeReparation(ALPHA, h(1, PC, 1))).not.toBe(id);
    expect(idEvenementDeReparation(BETA, h(1, PC))).not.toBe(id);

    expect(estIdEvenementDeReparation(id)).toBe(true);
    expect(estIdEvenementDeReparation(deCasUsage)).toBe(false);

    expect(lireIdEvenement(id)).toBe(id);
    expect(lireIdEvenement(String(deCasUsage))).toBe(deCasUsage);
    for (const invalide of [
      id.slice(1),
      `${id}0`,
      id.toUpperCase(),
      `w${id.slice(1)}`,
      `${String(idOperation(1))}:01`,
    ]) {
      expect(lireIdEvenement(invalide)).toBeUndefined();
    }
  });
});
