/**
 * Magasin Zustand des tâches (ST-US-002 §4.5) sur les vrais cas d'usage et l'espace local simulé : liste filtrée,
 * détail, saisie (refus cumulés), modifications, rattachements, confirmation de suppression, erreur d'enregistrement.
 */
import { describe, expect, it } from 'vitest';
import { creerMagasinTaches } from '@src/objectifs-taches/presentation/ui/etat/magasin-taches';
import { date, idTache } from '@tests/support/valeurs';
import { creerBancEcritureImpossible, creerBancObjectifs } from '@tests/support/ui-objectifs';

const magasinDe = (banc: ReturnType<typeof creerBancObjectifs>) =>
  creerMagasinTaches(banc.services);

const saisieValide = { intitule: 'Rédiger', delai: date('2026-11-30'), estimationMinutes: 60 };

describe('Magasin des tâches', () => {
  it('UT-COMP-US-002-60 afficherListe — liste « à faire » par défaut, objectifs proposés ; filtrer l’état et l’objectif recalcule la liste', async () => {
    const banc = creerBancObjectifs();
    const objectifId = await banc.creer('Publier le guide');
    const magasin = magasinDe(banc);
    const { actions } = magasin.getState();
    await actions.creer({ ...saisieValide, objectifIds: [objectifId] });
    await actions.creer({ ...saisieValide, intitule: 'Payer', objectifIds: [] });

    await actions.afficherListe();
    expect(magasin.getState().liste?.lignes.map((l) => l.intitule)).toEqual(['Payer', 'Rédiger']);
    expect(magasin.getState().objectifs).toEqual([
      { id: objectifId, intitule: 'Publier le guide' },
    ]);

    await actions.filtrerObjectif({ type: 'SANS_OBJECTIF' });
    expect(magasin.getState().liste?.lignes.map((l) => l.intitule)).toEqual(['Payer']);
    await actions.filtrerEtat('TERMINEE');
    expect(magasin.getState().liste?.etatVide?.code).toBe('EVD-FILTRE-SANS-OBJECTIF');
  });

  it('UT-COMP-US-002-61 creer — une saisie incomplète est refusée avec tous ses défauts, sans rien écrire ; une saisie valide rend l’identifiant', async () => {
    const banc = creerBancObjectifs();
    const magasin = magasinDe(banc);
    const { actions } = magasin.getState();

    const refus = await actions.creer({ intitule: ' ', objectifIds: [] });
    const faite = await actions.creer({ ...saisieValide, objectifIds: [] });

    expect(refus).toMatchObject({
      type: 'REFUSEE',
      messages: [{ code: 'ERR-020' }, { code: 'ERR-021' }, { code: 'ERR-022' }],
    });
    expect(faite.type).toBe('FAITE');
    expect(magasin.getState().liste?.lignes).toHaveLength(1);
  });

  it('UT-COMP-US-002-62 ouvrirDetail puis modifications — délai, estimation, intitulé, rattachement et détachement sont relus', async () => {
    const banc = creerBancObjectifs();
    const objectifId = await banc.creer('Publier le guide');
    const magasin = magasinDe(banc);
    const { actions } = magasin.getState();
    const faite = await actions.creer({ ...saisieValide, objectifIds: [] });
    const id = faite.type === 'FAITE' && faite.id !== undefined ? faite.id : idTache(0);

    await actions.ouvrirDetail(id);
    await actions.modifierDelai(id, date('2026-12-05'));
    await actions.modifierEstimation(id, 90);
    await actions.renommer(id, 'Relire');
    await actions.rattacher(id, objectifId);
    expect(magasin.getState().detail).toMatchObject({
      intitule: 'Relire',
      delai: { date: '2026-12-05' },
      estimation: { minutes: 90 },
      objectifs: { intitules: ['Publier le guide'] },
    });
    await actions.detacher(id, objectifId);
    expect(magasin.getState().detail?.objectifs.intitules).toEqual([]);
    expect(await actions.modifierEstimation(id, 45)).toMatchObject({
      type: 'REFUSEE',
      messages: [{ code: 'ERR-023' }],
    });
  });

  it('UT-COMP-US-002-63 suppression — la confirmation annonce les sous-tâches ; confirmer ramène à la liste, annuler ne change rien ; une tâche introuvable ramène à la liste', async () => {
    const banc = creerBancObjectifs();
    const magasin = magasinDe(banc);
    const { actions } = magasin.getState();
    const faite = await actions.creer({ ...saisieValide, objectifIds: [] });
    const id = faite.type === 'FAITE' && faite.id !== undefined ? faite.id : idTache(0);

    await actions.ouvrirDetail(id);
    await actions.demanderSuppression(id);
    expect(magasin.getState().confirmation?.code).toBe('CNF-SUPPR-TACHE');
    actions.annulerSuppression();
    expect(magasin.getState().confirmation).toBeUndefined();
    await actions.demanderSuppression(id);
    await actions.confirmerSuppression();
    expect(magasin.getState().ecran).toEqual({ type: 'LISTE' });
    expect(magasin.getState().liste?.lignes).toEqual([]);
    await actions.ouvrirDetail(idTache(99));
    expect(magasin.getState().ecran).toEqual({ type: 'LISTE' });
  });

  it('UT-COMP-US-002-64 une écriture ou une lecture locale impossible lève l’erreur d’enregistrement (ERR-014)', async () => {
    const banc = creerBancEcritureImpossible();
    const magasin = magasinDe(banc);

    const issue = await magasin.getState().actions.creer({ ...saisieValide, objectifIds: [] });

    expect(issue.type).toBe('ENREGISTREMENT_IMPOSSIBLE');
    expect(magasin.getState().erreurEnregistrement).toBe(true);
  });

  it('UT-COMP-US-002-65 observerDepot — une écriture d’un autre écrivain rafraîchit la liste ; la fonction rendue cesse d’observer', async () => {
    const banc = creerBancObjectifs();
    const magasin = magasinDe(banc);
    await magasin.getState().actions.afficherListe();
    const arreter = magasin.getState().actions.observerDepot();

    await banc.services.creerTache.executer({ ...saisieValide, objectifIds: [] });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(magasin.getState().liste?.lignes).toHaveLength(1);

    arreter();
    await banc.services.creerTache.executer({
      ...saisieValide,
      intitule: 'Autre',
      objectifIds: [],
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(magasin.getState().liste?.lignes).toHaveLength(1);
  });
});
