/**
 * Magasin des tâches : refus et échecs de la suppression, observation sans source (couverture conservée après
 * l'extraction d'issues.ts, revue E13 du rang 5, RC-US-002-4). Tests complémentaires.
 */
import { describe, expect, it } from 'vitest';
import { creerMagasinTaches } from '@src/objectifs-taches/presentation/ui/etat/magasin-taches';
import { succes } from '@src/commun/domaine/resultat';
import { creerMagasinObjectifsTaches } from '@src/objectifs-taches/presentation/ui/etat/magasin-objectifs-taches';
import { idObjectif } from '@tests/support/valeurs';
import { valeurDe } from '@tests/support/environnement';
import { date, idTache } from '@tests/support/valeurs';
import { creerBancEcritureInterruptible } from '@tests/support/ui-objectifs';

describe('Magasin des tâches — suppression et observation', () => {
  it('UT-COMP-US-002-91 supprimer une tâche absente est refusé sans message ; confirmer hors du détail ne fait rien ; observer sans source rend une fonction sans effet', async () => {
    const banc = creerBancEcritureInterruptible();
    const magasin = creerMagasinTaches(banc.services);
    const { actions } = magasin.getState();

    await actions.demanderSuppression(idTache(99));
    await actions.confirmerSuppression();

    expect(magasin.getState().confirmation).toBeUndefined();
    expect(magasin.getState().erreurEnregistrement).toBe(false);
    const arreter = actions.observerDepot();
    expect(arreter).toBeInstanceOf(Function);
  });

  it('UT-COMP-US-002-92 une suppression confirmée dont l’écriture échoue affiche l’erreur d’enregistrement (ERR-014) et garde la tâche', async () => {
    const banc = creerBancEcritureInterruptible();
    const magasin = creerMagasinTaches(banc.services);
    const { actions } = magasin.getState();
    const id = valeurDe(
      await banc.services.creerTache.executer({
        intitule: 'Rédiger',
        delai: date('2026-11-30'),
        estimationMinutes: 60,
        objectifIds: [],
      }),
    );
    await actions.ouvrirDetail(id);
    await actions.demanderSuppression(id);
    banc.interrompre();

    await actions.confirmerSuppression();

    expect(magasin.getState().erreurEnregistrement).toBe(true);
    expect(magasin.getState().ecran).toEqual({ type: 'DETAIL', id });
  });
});

describe('Magasins — évaluation sans confirmation', () => {
  const SANS_CONFIRMATION = {
    evaluer: () => Promise.resolve(succes({ type: 'SANS_CONFIRMATION' as const })),
  };

  it('UT-COMP-US-002-94 une évaluation qui ne demande pas de confirmation n’ouvre aucune confirmation (tâches et objectifs)', async () => {
    const banc = creerBancEcritureInterruptible();
    const taches = creerMagasinTaches({
      ...banc.services,
      supprimerTache: SANS_CONFIRMATION as never,
    });
    const objectifs = creerMagasinObjectifsTaches({
      ...banc.services,
      supprimerObjectif: SANS_CONFIRMATION as never,
    });

    await taches.getState().actions.demanderSuppression(idTache(1));
    await objectifs.getState().actions.demanderSuppression(idObjectif(1));

    expect(taches.getState().confirmation).toBeUndefined();
    expect(objectifs.getState().confirmation).toBeUndefined();
  });
});
