/**
 * Magasin Zustand des objectifs (ST-US-001 §3 n° 32) sur les vrais cas d'usage et l'espace local simulé : modèles de
 * vue courants, issues de saisie, confirmation de suppression, erreur d'enregistrement (ERR-014).
 */
import { describe, expect, it } from 'vitest';
import { echec } from '@src/commun/domaine/resultat';
import { creerMagasinObjectifsTaches } from '@src/objectifs-taches/presentation/ui/etat/magasin-objectifs-taches';
import { date, idObjectif } from '@tests/support/valeurs';
import {
  creerBancEcritureImpossible,
  creerBancEcritureInterruptible,
  creerBancObjectifs,
} from '@tests/support/ui-objectifs';

const intitules = (lignes: ReadonlyArray<{ readonly intitule: string }> | undefined) =>
  lignes?.map((l) => l.intitule);

describe('Magasin des objectifs — lectures', () => {
  it('UT-COMP-US-001-80 afficherListe puis ouvrirDetail — la liste et le détail sont construits depuis l’espace local ; l’écran suit', async () => {
    const banc = creerBancObjectifs();
    const id = await banc.creer('Publier le guide', '2026-12-15');
    await banc.creer('Apprendre le piano');
    const { actions } = banc.magasin.getState();

    await actions.afficherListe();
    expect(banc.magasin.getState().ecran).toEqual({ type: 'LISTE' });
    expect(intitules(banc.magasin.getState().liste?.lignes)).toEqual([
      'Publier le guide',
      'Apprendre le piano',
    ]);

    await actions.ouvrirDetail(id);
    const etat = banc.magasin.getState();
    expect(etat.ecran).toEqual({ type: 'DETAIL', id });
    expect(etat.detail).toMatchObject({ id, intitule: 'Publier le guide' });
  });

  it('UT-COMP-US-001-81 ouvrirDetail d’un objectif introuvable (supprimé ailleurs) ramène à la liste, sans erreur d’enregistrement', async () => {
    const banc = creerBancObjectifs();
    await banc.creer('Reste');

    await banc.magasin.getState().actions.ouvrirDetail(idObjectif(99));

    const etat = banc.magasin.getState();
    expect(etat.ecran).toEqual({ type: 'LISTE' });
    expect(intitules(etat.liste?.lignes)).toEqual(['Reste']);
    expect(etat.erreurEnregistrement).toBe(false);
  });

  it('UT-COMP-US-001-82 une lecture locale impossible lève l’erreur d’enregistrement (ERR-014), liste comme détail', async () => {
    const banc = creerBancObjectifs();
    const id = await banc.creer('Guide');
    const impossible = { type: 'DonneesLocalesIllisibles' as const };
    const lecture = () => Promise.resolve(echec(impossible));
    const lectureImpossible = creerMagasinObjectifsTaches({
      ...banc.services,
      consulterObjectifs: { executer: lecture } as never,
      consulterDetailObjectif: { executer: lecture } as never,
    });

    await lectureImpossible.getState().actions.afficherListe();
    expect(lectureImpossible.getState().erreurEnregistrement).toBe(true);
    expect(lectureImpossible.getState().liste).toBeUndefined();

    await lectureImpossible.getState().actions.ouvrirDetail(id);
    expect(lectureImpossible.getState().erreurEnregistrement).toBe(true);
    expect(lectureImpossible.getState().detail).toBeUndefined();
  });
});

describe('Magasin des objectifs — commandes', () => {
  it('UT-COMP-US-001-83 creer — rend l’identifiant, ouvre le détail du nouvel objectif ; un intitulé vide est refusé avec ERR-020 et ne crée rien', async () => {
    const banc = creerBancObjectifs();
    const { actions } = banc.magasin.getState();

    const refus = await actions.creer({ intitule: '   ' });
    expect(refus).toEqual({ type: 'REFUSEE', messages: [{ code: 'ERR-020', variables: {} }] });
    expect(banc.magasin.getState().erreurEnregistrement).toBe(false);

    const issue = await actions.creer({
      intitule: ' Publier le guide ',
      description: 'Version 1',
      delai: date('2026-12-15'),
    });
    expect(issue.type).toBe('FAITE');
    const etat = banc.magasin.getState();
    expect(etat.ecran).toMatchObject({ type: 'DETAIL' });
    expect(etat.detail).toMatchObject({
      intitule: 'Publier le guide',
      description: 'Version 1',
      delai: { type: 'DATE', date: '2026-12-15' },
    });
  });

  it('UT-COMP-US-001-84 renommer, modifierDescription, modifierDelai (avec puis sans date) — le détail est recalculé après chaque commande', async () => {
    const banc = creerBancObjectifs();
    const id = await banc.creer('Ancien');
    const { actions } = banc.magasin.getState();
    await actions.ouvrirDetail(id);

    expect((await actions.renommer(id, 'Nouveau')).type).toBe('FAITE');
    expect(banc.magasin.getState().detail?.intitule).toBe('Nouveau');
    expect((await actions.renommer(id, '')).type).toBe('REFUSEE');
    expect(banc.magasin.getState().detail?.intitule).toBe('Nouveau');

    expect((await actions.modifierDescription(id, 'Texte')).type).toBe('FAITE');
    expect(banc.magasin.getState().detail?.description).toBe('Texte');

    expect((await actions.modifierDelai(id, date('2026-12-22'))).type).toBe('FAITE');
    expect(banc.magasin.getState().detail?.delai).toMatchObject({
      type: 'DATE',
      date: '2026-12-22',
    });
    expect((await actions.modifierDelai(id, undefined)).type).toBe('FAITE');
    expect(banc.magasin.getState().detail?.delai).toMatchObject({ type: 'SANS_DELAI' });
  });

  it('UT-COMP-US-001-85 une commande sur un objectif introuvable est refusée sans message de saisie', async () => {
    const banc = creerBancObjectifs();

    const issue = await banc.magasin.getState().actions.renommer(idObjectif(99), 'Fantôme');

    expect(issue).toEqual({ type: 'REFUSEE', messages: [] });
  });

  it('UT-COMP-US-001-86 écriture impossible — ENREGISTREMENT_IMPOSSIBLE et erreurEnregistrement ; le geste suivant efface l’erreur', async () => {
    const banc = creerBancEcritureImpossible();
    const { actions } = banc.magasin.getState();

    expect(await actions.creer({ intitule: 'Perdu' })).toEqual({
      type: 'ENREGISTREMENT_IMPOSSIBLE',
    });
    expect(banc.magasin.getState().erreurEnregistrement).toBe(true);

    await actions.afficherListe();
    expect(banc.magasin.getState().erreurEnregistrement).toBe(false);
    await actions.renommer(idObjectif(1), 'Autre');
    expect(banc.magasin.getState().erreurEnregistrement).toBe(true);
  });
});

describe('Magasin des objectifs — suppression (CNF-SUPPR-OBJECTIF)', () => {
  it('UT-COMP-US-001-87 demanderSuppression — expose la confirmation chiffrée ; annulerSuppression l’efface sans supprimer', async () => {
    const banc = creerBancObjectifs();
    const id = await banc.creer('À supprimer');
    const { actions } = banc.magasin.getState();
    await actions.ouvrirDetail(id);

    await actions.demanderSuppression(id);
    expect(banc.magasin.getState().confirmation).toMatchObject({
      code: 'CNF-SUPPR-OBJECTIF',
      variables: { element: 'À supprimer', taches: 0, sousObjectifs: 0 },
    });

    actions.annulerSuppression();
    expect(banc.magasin.getState().confirmation).toBeUndefined();
    expect(banc.magasin.getState().detail?.intitule).toBe('À supprimer');
  });

  it('UT-COMP-US-001-88 confirmerSuppression — supprime l’objectif et retourne à la liste ; hors détail, elle ne fait rien', async () => {
    const banc = creerBancObjectifs();
    const id = await banc.creer('À supprimer');
    await banc.creer('Reste');
    const { actions } = banc.magasin.getState();

    await actions.afficherListe();
    await actions.demanderSuppression(id);
    await actions.confirmerSuppression();
    expect(intitules(banc.magasin.getState().liste?.lignes)).toEqual(['À supprimer', 'Reste']);

    await actions.ouvrirDetail(id);
    await actions.demanderSuppression(id);
    await actions.confirmerSuppression();

    const etat = banc.magasin.getState();
    expect(etat.confirmation).toBeUndefined();
    expect(etat.ecran).toEqual({ type: 'LISTE' });
    expect(intitules(etat.liste?.lignes)).toEqual(['Reste']);
  });

  it('UT-COMP-US-001-89 demanderSuppression d’un objectif introuvable : pas de confirmation ; suppression impossible en écriture : erreur d’enregistrement', async () => {
    const banc = creerBancObjectifs();
    await banc.magasin.getState().actions.demanderSuppression(idObjectif(99));
    expect(banc.magasin.getState().confirmation).toBeUndefined();
    expect(banc.magasin.getState().erreurEnregistrement).toBe(false);

    const interruptible = creerBancEcritureInterruptible();
    const id = await interruptible.creer('Guide');
    const { actions } = interruptible.magasin.getState();
    await actions.ouvrirDetail(id);
    await actions.demanderSuppression(id);
    interruptible.interrompre();
    await actions.confirmerSuppression();
    const etat = interruptible.magasin.getState();
    expect(etat.confirmation).toBeUndefined();
    expect(etat.erreurEnregistrement).toBe(true);
    expect(etat.ecran).toEqual({ type: 'DETAIL', id });
  });
});
