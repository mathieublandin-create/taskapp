import { describe, expect, it } from 'vitest';
import {
  DetacherTache,
  RattacherTache,
} from '@src/objectifs-taches/application/cas-usage/rattacher-tache';
import {
  ModifierDelaiTache,
  ModifierEstimationTache,
  RenommerTache,
} from '@src/objectifs-taches/application/cas-usage/modifier-tache';
import { SupprimerTache } from '@src/objectifs-taches/application/cas-usage/supprimer-tache';
import { ConsulterDetailObjectif } from '@src/objectifs-taches/application/requetes/consulter-detail-objectif';
import { ConsulterDetailTache } from '@src/objectifs-taches/application/requetes/consulter-detail-tache';
import { ConsulterTaches } from '@src/objectifs-taches/application/requetes/consulter-taches';
import { appliquerModifications, creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { creationObjectif, creationTache } from '@tests/support/modifications';
import { date, duree, idObjectif, idTache } from '@tests/support/valeurs';

const O1 = idObjectif(1);
const O2 = idObjectif(2);
const P = idTache(1);
const S = idTache(2);
const AUTRE = idTache(3);

/** Une tâche parente de deux objectifs avec une sous-tâche, et une tâche sans objectif. */
const preparer = async () => {
  const env = creerEnvironnement('2026-10-21T08:00:00.000Z');
  valeurDe(
    await appliquerModifications(env.service, (_, c) => [
      creationObjectif(
        { id: O1, intitule: 'Publier le guide', delai: date('2026-11-20') },
        c.instant,
        0,
      ),
      creationObjectif({ id: O2, intitule: 'Écrire' }, c.instant, 1),
      creationTache(
        {
          id: P,
          intitule: 'Chapitre 1',
          delai: date('2026-11-30'),
          estimation: duree(180),
          objectifIds: [O1, O2],
        },
        c.instant,
        2,
      ),
      creationTache(
        {
          id: S,
          intitule: 'Section A',
          delai: date('2026-12-05'),
          estimation: duree(60),
          tacheParenteId: P,
        },
        c.instant,
        3,
      ),
      creationTache(
        {
          id: AUTRE,
          intitule: 'Payer la facture',
          delai: date('2026-10-19'),
          estimation: duree(30),
        },
        c.instant,
        4,
      ),
    ]),
  );
  return env;
};

describe('Tâches — compléments de l’application (US-002)', () => {
  it('UT-COMP-US-002-20 ConsulterDetailObjectif — présente les tâches directes et leurs sous-tâches', async () => {
    const env = await preparer();

    const detail = valeurDe(
      await new ConsulterDetailObjectif(env.service, env.horloge).executer(O1),
    );

    expect(detail.taches.map((t) => t.id)).toEqual([P]);
    expect(
      [...detail.sousTachesPar.entries()].map(([id, sous]) => [id, sous.map((s) => s.id)]),
    ).toEqual([[P, [S]]]);
  });

  it('UT-COMP-US-002-21 ConsulterDetailTache — une tâche parente porte l’estimation calculée, ses sous-tâches et son avancement ; une sous-tâche hérite des objectifs et des alertes', async () => {
    const env = await preparer();
    const consulter = new ConsulterDetailTache(env.service, env.horloge);

    const parente = valeurDe(await consulter.executer(P));
    const sousTache = valeurDe(await consulter.executer(S));

    expect(parente.tache).toMatchObject({
      estimation: 60,
      estimationCalculee: true,
      estimationInitiale: 180,
      sousTaches: { terminees: 0, nonAbandonnees: 1 },
    });
    expect(parente.sousTaches.map((s) => s.id)).toEqual([S]);
    expect(parente.sousTachesAFaire).toBe(1);
    expect(parente.actions).not.toContain('MODIFIER_ESTIMATION');
    expect(sousTache.tache).toMatchObject({
      tacheParente: { id: P, intitule: 'Chapitre 1' },
      objectifsHerites: true,
      objectifs: [
        { id: O1, intitule: 'Publier le guide' },
        { id: O2, intitule: 'Écrire' },
      ],
    });
    expect(sousTache.tache.alertes.map((a) => a.type)).toEqual(['OBJECTIFS', 'TACHE_PARENTE']);
  });

  it('UT-COMP-US-002-22 ConsulterDetailTache — une tâche inconnue est introuvable', async () => {
    const env = await preparer();

    const resultat = await new ConsulterDetailTache(env.service, env.horloge).executer(idTache(99));

    expect(resultat).toEqual({
      ok: false,
      erreur: { type: 'ElementIntrouvable', element: { type: 'TACHE', id: idTache(99) } },
    });
  });

  it('UT-COMP-US-002-23 ConsulterTaches — liste les tâches sans tâche parente et indique s’il existe un objectif', async () => {
    const env = await preparer();

    const { taches, existeAuMoinsUnObjectif } = valeurDe(
      await new ConsulterTaches(env.service, env.horloge).executer(),
    );

    expect(taches.map((t) => t.id).sort()).toEqual([P, AUTRE].sort());
    expect(existeAuMoinsUnObjectif).toBe(true);
    expect(taches.find((t) => t.id === AUTRE)?.enRetard).toBe(true);
  });

  it('UT-COMP-US-002-24 cas d’usage de modification — renommer, changer le délai et l’estimation, rattacher puis détacher, évaluer la suppression', async () => {
    const env = await preparer();

    valeurDe(await new RenommerTache(env.service).executer({ tacheId: AUTRE, intitule: 'Payer' }));
    valeurDe(
      await new ModifierDelaiTache(env.service).executer({
        tacheId: AUTRE,
        delai: date('2026-11-01'),
      }),
    );
    valeurDe(
      await new ModifierEstimationTache(env.service).executer({
        tacheId: AUTRE,
        estimationMinutes: 90,
      }),
    );
    valeurDe(await new RattacherTache(env.service).executer({ tacheId: AUTRE, objectifId: O2 }));
    const rattachee = valeurDe(
      await new ConsulterDetailTache(env.service, env.horloge).executer(AUTRE),
    );
    valeurDe(await new DetacherTache(env.service).executer({ tacheId: AUTRE, objectifId: O2 }));
    const detachee = valeurDe(
      await new ConsulterDetailTache(env.service, env.horloge).executer(AUTRE),
    );
    const evaluation = valeurDe(await new SupprimerTache(env.service).evaluer({ tacheId: P }));

    expect(rattachee.tache).toMatchObject({
      intitule: 'Payer',
      delai: '2026-11-01',
      estimation: 90,
    });
    expect(rattachee.tache.objectifs.map((o) => o.id)).toEqual([O2]);
    expect(detachee.tache.objectifs).toEqual([]);
    expect(evaluation).toMatchObject({
      type: 'CONFIRMATION_REQUISE',
      confirmation: { type: 'SUPPRESSION_TACHE', sousTaches: 1 },
    });
  });
});
