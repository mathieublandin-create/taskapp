/**
 * Réparation des hiérarchies après fusion (RG-048, DEC-025 ; DAT §4.2 « hiérarchies » ; ST-US-017 v0.5 §6.6 n° 7 à 10).
 * UT-US-017-48 à 50 (dont le cas imposé par le DAT : une chaîne de trois déplacements croisés qui exige deux annulations).
 * v0.6 : l'entrée de journal de chaque annulation (§6.6 n° 9 b à 9 d) est vérifiée par UT-US-017-100 à 105
 * (`reparation-journal.test.ts`) ; ici, registres, signalements et `dernierHlc` seulement (tranche B1).
 */
import { describe, expect, it } from 'vitest';
import type { IdAppareil, IdObjectif } from '@src/commun/domaine/identifiants';
import { contexteDeNouvelleEcriture } from '@src/synchronisation/domaine/contexte-causal';
import type { RegistreQuelconque } from '@src/synchronisation/domaine/ecriture';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import type { Hlc } from '@src/synchronisation/domaine/hlc';
import type { PlacementObjectif } from '@src/synchronisation/domaine/information';
import {
  reparerHierarchie,
  type ReparationHierarchie,
} from '@src/synchronisation/domaine/reparation-hierarchie';
import { idValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { etatLocal, registre } from '@tests/support/fabriques/etat-local';
import {
  changementParent,
  creePrincipal,
  creeSous,
  deplaceSous,
  h,
  objectifCree,
  parentObjectif,
  suppressionObjectif,
  t,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { idObjectif, instant, PC, SMARTPHONE } from '@tests/support/valeurs';

const ALPHA = idObjectif(1);
const BETA = idObjectif(2);
const GAMMA = idObjectif(3);
const DELTA = idObjectif(4);
const cleParent = (id: IdObjectif) => ({ type: 'OBJECTIF', id, champ: 'parent' }) as const;

/** Les objectifs créés principaux par le PC à t0 (création, intitulé, placement). */
const crees = (ids: ReadonlyArray<IdObjectif>): ReadonlyArray<RegistreQuelconque> =>
  ids.flatMap((id, i) => objectifCree(id, `O${String(i)}`, h(0, PC)));

type Deplacement = {
  readonly registre: RegistreQuelconque;
  readonly evenement: EvenementJournal;
};

/** Déplacement de `id` sous `parentId` à `n` par `appareil`, depuis le placement `avant` (registre et journal). */
const deplacer = (
  id: IdObjectif,
  parentId: IdObjectif,
  n: number,
  appareil: IdAppareil,
  avant: PlacementObjectif = creePrincipal(h(0, PC)),
): Deplacement => {
  const apres = deplaceSous(parentId, h(n, appareil));
  const contexte =
    avant.hlcOrigine.appareil === appareil ? {} : { [avant.hlcOrigine.appareil]: avant.hlcOrigine };
  return {
    registre: parentObjectif(id, apres, h(n, appareil), contexte),
    evenement: changementParent(id, avant, apres, h(n, appareil)),
  };
};

/** État fusionné vu par `appareil` : créations, puis déplacements (le dernier d’un objectif l’emporte). */
const etatFusionne = (
  appareil: IdAppareil,
  ids: ReadonlyArray<IdObjectif>,
  deplacements: ReadonlyArray<Deplacement>,
  autres: ReadonlyArray<RegistreQuelconque> = [],
) => {
  const hlcs = deplacements.map((d) => d.registre.ecriture.hlc);
  const dernier = hlcs.reduce<Hlc>((max, x) => (x.physique > max.physique ? x : max), h(0, PC));
  return etatLocal({
    appareilId: appareil,
    dernierHlc: dernier,
    registres: [...crees(ids), ...autres, ...deplacements.map((d) => d.registre)],
    journal: deplacements.map((d) => d.evenement),
  });
};

/** Registre de réparation attendu : valeur rétablie, HLC émis par l’appareil, contexte d’une écriture sur l’annulée. */
const reparation = (
  id: IdObjectif,
  valeur: PlacementObjectif,
  hlcReparation: Hlc,
  annule: RegistreQuelconque,
  appareil: IdAppareil,
): RegistreQuelconque =>
  registre(
    cleParent(id),
    valeur,
    hlcReparation,
    contexteDeNouvelleEcriture(annule.ecriture, appareil),
  );

/** Résultat sans les entrées de journal (UT-US-017-100 à 105) : la tranche B1 rend `evenementsAjoutes` vide. */
const sansJournal = ({
  evenementsAjoutes: _journal,
  ...reste
}: ReparationHierarchie): Omit<ReparationHierarchie, 'evenementsAjoutes'> => reste;

const RIEN: ReparationHierarchie = {
  registresEcrits: [],
  valeursEcartees: [],
  evenementsAjoutes: [],
};

describe('reparerHierarchie (RG-048)', () => {
  it('UT-US-017-48 S25 : placements croisés (cycle) : le plus ancien est annulé et signalé ; hiérarchie valide : rien', () => {
    const alphaSousBeta = deplacer(ALPHA, BETA, 1, PC);
    const betaSousAlpha = deplacer(BETA, ALPHA, 2, SMARTPHONE);
    const etat = etatFusionne(SMARTPHONE, [ALPHA, BETA], [alphaSousBeta, betaSousAlpha]);

    const resultat = reparerHierarchie(etat, instant(t(3)));

    const ecrit = reparation(
      ALPHA,
      creePrincipal(h(0, PC)),
      h(3, SMARTPHONE),
      alphaSousBeta.registre,
      SMARTPHONE,
    );
    expect(sansJournal(resultat)).toEqual({
      registresEcrits: [ecrit],
      valeursEcartees: [
        {
          id: idValeurEcartee(cleParent(ALPHA), h(1, PC)),
          motif: 'PLACEMENT_ANNULE',
          ecartee: alphaSousBeta.registre,
          gagnante: ecrit,
        },
      ],
      dernierHlc: h(3, SMARTPHONE),
    });

    expect(
      reparerHierarchie(etatFusionne(SMARTPHONE, [ALPHA, BETA], [alphaSousBeta]), instant(t(3))),
    ).toEqual(RIEN);
  });

  it('UT-US-017-49 deuxième niveau : la création n’est jamais candidate (US-023 S17), seul le plus ancien est annulé (S18, S18b) ; parent supprimé = principal', () => {
    // S17 : O (Alpha) placé sous P (Bêta) sur le PC ; S (Gamma) créé sous O sur le smartphone.
    const oSousP = deplacer(ALPHA, BETA, 1, PC);
    const sCreeSousO = objectifCree(
      GAMMA,
      'S',
      h(2, SMARTPHONE),
      creeSous(ALPHA, h(2, SMARTPHONE)),
    );
    const s17 = reparerHierarchie(
      etatLocal({
        appareilId: PC,
        dernierHlc: h(2, SMARTPHONE),
        registres: [...crees([ALPHA, BETA]), ...sCreeSousO, oSousP.registre],
        journal: [oSousP.evenement],
      }),
      instant(t(3)),
    );
    expect(s17.registresEcrits.map((r) => [r.cle, r.ecriture.valeur])).toEqual([
      [cleParent(ALPHA), creePrincipal(h(0, PC))],
    ]);
    expect(s17.valeursEcartees.map((v) => v.id)).toEqual([
      idValeurEcartee(cleParent(ALPHA), h(1, PC)),
    ]);

    // S18 : Alpha sous Bêta (PC, t1), Bêta sous Gamma (smartphone, t2).
    const s18 = reparerHierarchie(
      etatFusionne(PC, [ALPHA, BETA, GAMMA], [oSousP, deplacer(BETA, GAMMA, 2, SMARTPHONE)]),
      instant(t(3)),
    );
    expect(s18.registresEcrits.map((r) => r.cle)).toEqual([cleParent(ALPHA)]);
    expect(s18.valeursEcartees).toHaveLength(1);

    // S18b : Alpha sous Bêta (t1), Gamma sous Alpha (t2), Delta sous Alpha (t3) : une seule annulation.
    const s18b = reparerHierarchie(
      etatFusionne(
        SMARTPHONE,
        [ALPHA, BETA, GAMMA, DELTA],
        [oSousP, deplacer(GAMMA, ALPHA, 2, SMARTPHONE), deplacer(DELTA, ALPHA, 3, SMARTPHONE)],
      ),
      instant(t(4)),
    );
    expect(s18b.registresEcrits.map((r) => r.cle)).toEqual([cleParent(ALPHA)]);
    expect(s18b.valeursEcartees.map((v) => v.id)).toEqual([
      idValeurEcartee(cleParent(ALPHA), h(1, PC)),
    ]);

    // Bêta supprimé : Alpha, placé sous lui, est principal par dérivation (RG-047) ; S sous Alpha est valide.
    expect(
      reparerHierarchie(
        etatLocal({
          appareilId: PC,
          dernierHlc: h(3, PC),
          registres: [
            ...crees([ALPHA, BETA]),
            ...sCreeSousO,
            oSousP.registre,
            suppressionObjectif(BETA, h(3, PC)),
          ],
          journal: [oSousP.evenement],
        }),
        instant(t(4)),
      ),
    ).toEqual(RIEN);
  });

  it('UT-US-017-50 S18c : chaîne de trois déplacements, deux annulations dans l’ordre ; valeur rétablie issue d’un déplacement encore candidate ; même résultat sur les deux appareils', () => {
    // Alpha sous Bêta (PC, t1), Gamma sous Alpha (smartphone, t2), Delta sous Gamma (PC, t3).
    const alphaSousBeta = deplacer(ALPHA, BETA, 1, PC);
    const gammaSousAlpha = deplacer(GAMMA, ALPHA, 2, SMARTPHONE);
    const deltaSousGamma = deplacer(DELTA, GAMMA, 3, PC);
    const deplacements = [alphaSousBeta, gammaSousAlpha, deltaSousGamma];
    const ids = [ALPHA, BETA, GAMMA, DELTA];

    const resultat = reparerHierarchie(etatFusionne(SMARTPHONE, ids, deplacements), instant(t(4)));

    const alphaRetabli = reparation(
      ALPHA,
      creePrincipal(h(0, PC)),
      h(4, SMARTPHONE),
      alphaSousBeta.registre,
      SMARTPHONE,
    );
    const gammaRetabli = reparation(
      GAMMA,
      creePrincipal(h(0, PC)),
      h(4, SMARTPHONE, 1),
      gammaSousAlpha.registre,
      SMARTPHONE,
    );
    expect(sansJournal(resultat)).toEqual({
      registresEcrits: [alphaRetabli, gammaRetabli],
      valeursEcartees: [
        {
          id: idValeurEcartee(cleParent(ALPHA), h(1, PC)),
          motif: 'PLACEMENT_ANNULE',
          ecartee: alphaSousBeta.registre,
          gagnante: alphaRetabli,
        },
        {
          id: idValeurEcartee(cleParent(GAMMA), h(2, SMARTPHONE)),
          motif: 'PLACEMENT_ANNULE',
          ecartee: gammaSousAlpha.registre,
          gagnante: gammaRetabli,
        },
      ],
      dernierHlc: h(4, SMARTPHONE, 1),
    });

    // Sur le PC : mêmes valeurs rétablies, mêmes identifiants (convergence, DAT §4.2).
    const surLePc = reparerHierarchie(etatFusionne(PC, ids, deplacements), instant(t(4)));
    expect(surLePc.registresEcrits.map((r) => r.ecriture.valeur)).toEqual(
      resultat.registresEcrits.map((r) => r.ecriture.valeur),
    );
    expect(surLePc.valeursEcartees.map((v) => v.id)).toEqual(
      resultat.valeursEcartees.map((v) => v.id),
    );

    // Alpha sous Bêta (PC, t1), puis sous Gamma (PC, t2) ; Gamma sous Alpha (smartphone, t3) : cycle. Annuler le
    // déplacement de t2 rétablit « sous Bêta » (déplacement de t1, encore candidat) : Gamma → Alpha → Bêta est
    // invalide, ce déplacement est annulé à son tour. Un seul registre écrit pour Alpha, deux entrées.
    const premier = deplacer(ALPHA, BETA, 1, PC);
    const second = deplacer(ALPHA, GAMMA, 2, PC, deplaceSous(BETA, h(1, PC)));
    const croise = deplacer(GAMMA, ALPHA, 3, SMARTPHONE);
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      dernierHlc: h(3, SMARTPHONE),
      registres: [...crees([ALPHA, BETA, GAMMA]), second.registre, croise.registre],
      journal: [premier.evenement, second.evenement, croise.evenement],
    });
    const enChaine = reparerHierarchie(etat, instant(t(4)));
    expect(enChaine.valeursEcartees.map((v) => v.id)).toEqual([
      idValeurEcartee(cleParent(ALPHA), h(2, PC)),
      idValeurEcartee(cleParent(ALPHA), h(1, PC)),
    ]);
    expect(enChaine.registresEcrits.map((r) => [r.cle, r.ecriture.valeur])).toEqual([
      [cleParent(ALPHA), creePrincipal(h(0, PC))],
    ]);
  });
});
