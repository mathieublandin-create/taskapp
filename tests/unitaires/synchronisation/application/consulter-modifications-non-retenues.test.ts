/**
 * Lecture de la liste « Modifications non retenues » et du nombre d'informations à lire (ST-US-017 v0.5 §4.6 ; H-6 ;
 * US-017 S15, S15b). UT-US-017-56.
 */
import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { MasquageRappel } from '@src/synchronisation/application/masquage-rappel';
import { SUIVI_CYCLE_AU_REPOS } from '@src/synchronisation/application/ports/suivi-cycle';
import { consulterEtatSynchronisation } from '@src/synchronisation/application/requetes/consulter-etat-synchronisation';
import { consulterModificationsNonRetenues } from '@src/synchronisation/application/requetes/consulter-modifications-non-retenues';
import { detaillerValeursEcartees } from '@src/synchronisation/domaine/detail-valeurs-ecartees';
import type { ValeurEcartee } from '@src/synchronisation/domaine/valeurs-ecartees';
import { construireIndicateur } from '@src/synchronisation/presentation/modeles-de-vue/indicateur-synchronisation';
import { ReseauFixe } from '@tests/support/compte/doublures-compte';
import { creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { planAjoutant } from '@tests/support/plans';
import {
  h,
  idArbitraire,
  intituleTache,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import { idTache, PC, SMARTPHONE } from '@tests/support/valeurs';

const T1 = idTache(1);
const gagnante = intituleTache(T1, 'B', h(2, SMARTPHONE), { [PC]: h(0, PC) });
const entree = (n: number): ValeurEcartee => ({
  id: idArbitraire(n),
  motif: 'CONFLIT',
  ecartee: intituleTache(T1, `A${String(n)}`, h(1, PC)),
  gagnante,
});

describe('consulterModificationsNonRetenues et aLire (ST-US-017 v0.5 §4.6)', () => {
  it('UT-US-017-56 rend le détail de toutes les entrées et aLire ; erreur du dépôt propagée ; consulterEtat lit aLire de l’attente (SYN-INFO)', async () => {
    const env = creerEnvironnement('2026-10-21T09:00:00.000Z');
    valeurDe(
      await env.depot.appliquerSynchronisation((etat) => ({
        plan: planAjoutant(etat, { registres: [gagnante], dernierHlc: h(2, SMARTPHONE) }),
        meta: {},
        signalements: {
          valeursEcartees: [entree(1), entree(2)],
          lectures: [{ id: idArbitraire(1), hlc: h(3, SMARTPHONE) }],
        },
      })),
    );
    const etat = valeurDe(await env.depot.lire());
    const signalements = valeurDe(await env.depot.lireSignalements());

    const lu = valeurDe(await consulterModificationsNonRetenues(env.depot));
    expect(lu.aLire).toBe(1);
    expect(lu.valeurs).toEqual(detaillerValeursEcartees(etat, signalements));
    expect(lu.valeurs).toHaveLength(2);

    const illisible = echec({ type: 'DonneesLocalesIllisibles' } as const);
    expect(
      await consulterModificationsNonRetenues({
        lire: () => Promise.resolve(illisible),
        lireSignalements: () => Promise.resolve(succes(signalements)),
      }),
    ).toEqual(illisible);

    const acces = {
      etat: () => 'VALIDE' as const,
      signalerRefus: () => Promise.resolve('VALIDE' as const),
      observer: () => () => undefined,
    };
    const synchro = await consulterEtatSynchronisation({
      reseau: new ReseauFixe(true),
      acces,
      suivi: SUIVI_CYCLE_AU_REPOS,
      masquage: new MasquageRappel(),
      attente: () => Promise.resolve({ enAttente: 0, aLire: 2 }),
    });
    expect(synchro?.aLire).toBe(2);
    expect(synchro && construireIndicateur(synchro)).toMatchObject({ code: 'SYN-INFO', aLire: 2 });
  });
});
