/**
 * DT-009 (ST-US-017 v0.4 §14) : le magasin des objectifs suit les écritures faites par un autre écrivain que lui
 * (fusion distante, autre onglet), par l'observation du dépôt local.
 */
import { describe, expect, it } from 'vitest';
import { creerMagasinObjectifsTaches } from '@src/objectifs-taches/presentation/ui/etat/magasin-objectifs-taches';
import { creerBancObjectifs } from '@tests/support/ui-objectifs';

const observable = (banc: ReturnType<typeof creerBancObjectifs>) =>
  creerMagasinObjectifsTaches({
    ...banc.services,
    observer: (rappel) => banc.env.depot.observer(rappel),
  });

const intitules = (lignes: ReadonlyArray<{ readonly intitule: string }> | undefined) =>
  lignes?.map((l) => l.intitule);

const attendre = (condition: () => boolean): Promise<void> =>
  new Promise((resolve, reject) => {
    const debut = Date.now();
    const verifier = (): void => {
      if (condition()) resolve();
      else if (Date.now() - debut > 2000) reject(new Error('Condition non atteinte'));
      else setTimeout(verifier, 5);
    };
    verifier();
  });

describe('Magasin des objectifs — observation du dépôt local (DT-009)', () => {
  it('UT-COMP-US-017-52 une écriture externe au magasin met à jour la liste (ECR-008) et le détail (ECR-003) ; plus après désabonnement', async () => {
    const banc = creerBancObjectifs();
    const id = await banc.creer('Publier le guide');
    const magasin = observable(banc);
    const arreter = magasin.getState().actions.observerDepot();

    await magasin.getState().actions.afficherListe();
    await banc.creer('Apprendre le piano');
    await attendre(() => magasin.getState().liste?.lignes.length === 2);
    expect(intitules(magasin.getState().liste?.lignes)).toContain('Apprendre le piano');

    await magasin.getState().actions.ouvrirDetail(id);
    await banc.services.renommerObjectif.executer({ objectifId: id, intitule: 'Guide publié' });
    await attendre(() => magasin.getState().detail?.intitule === 'Guide publié');

    arreter();
    await banc.services.renommerObjectif.executer({ objectifId: id, intitule: 'Autre titre' });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(magasin.getState().detail?.intitule).toBe('Guide publié');
  });

  it('UT-COMP-US-017-55 sans observateur fourni, observerDepot rend un désabonnement inoffensif', () => {
    const banc = creerBancObjectifs();
    const { observer: _observer, ...servicesSansObservateur } = banc.services;
    const magasin = creerMagasinObjectifsTaches(servicesSansObservateur);

    const arreter = magasin.getState().actions.observerDepot();

    expect(() => {
      arreter();
    }).not.toThrow();
  });
});
