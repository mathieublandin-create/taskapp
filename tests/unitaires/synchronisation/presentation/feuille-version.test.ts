/**
 * ST-US-018 v0.4 §6.1 n° 5 (rang 12, tranche D2), tests complémentaires de Benjamin : invite `ALR-016` (guide v0.2.24
 * §6.6.15) dans le modèle de vue de la feuille ECR-011. UT-COMP-US-018-23 à 25.
 */
import { describe, expect, it } from 'vitest';
import type { EtatSynchronisationAffichable } from '@src/synchronisation/presentation/modeles-de-vue/etat-synchronisation-affichable';
import { construireFeuilleSynchronisation } from '@src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation';
import { instant } from '@tests/support/valeurs';

const ETAT: EtatSynchronisationAffichable = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 0,
  aLire: 0,
  rappelMasque: false,
};

const feuille = (etat: EtatSynchronisationAffichable, nouvelleVersion?: boolean) =>
  construireFeuilleSynchronisation({
    etat,
    maintenant: instant('2026-11-09T08:00:00.000Z'),
    elementsEnAttente: [],
    ...(nouvelleVersion === undefined ? {} : { nouvelleVersion }),
  });

const INVITE_ATTENDUE = {
  code: 'ALR-016',
  titre: 'Une nouvelle version est disponible',
  texte: 'Mettez à jour quand vous le souhaitez. Vos modifications sont conservées.',
  role: 'status',
  fermable: false,
  action: { type: 'METTRE_A_JOUR', libelle: 'Mettre à jour' },
} as const;

describe('construireFeuilleSynchronisation — nouvelle version (ST-US-018 §6.1 n° 5)', () => {
  it('UT-COMP-US-018-23 version en attente — invite ALR-016 exacte (titre, texte, status, non fermable, action « Mettre à jour »), sans carte d’erreur', () => {
    const vue = feuille(ETAT, true);

    expect(vue.alerteVersion).toEqual(INVITE_ATTENDUE);
    expect(vue.cartes).toEqual([]);
  });

  it('UT-COMP-US-018-23 aucune version en attente (absent ou faux) — pas d’invite', () => {
    expect(feuille(ETAT)).not.toHaveProperty('alerteVersion');
    expect(feuille(ETAT, false)).not.toHaveProperty('alerteVersion');
  });

  it('UT-COMP-US-018-24 reste de la feuille inchangé — l’invite n’ajoute ni carte, ni ligne, ni changement du bouton', () => {
    const sans = feuille(ETAT);
    const avec = feuille(ETAT, true);

    expect({ ...avec, alerteVersion: undefined }).toEqual(sans);
  });

  it('UT-COMP-US-018-25 consultation seule — jamais en même temps que la carte ERR-013 (variante carte), qui offre déjà l’action', () => {
    const vue = feuille({ ...ETAT, actionRequise: 'FORMAT_PLUS_RECENT' }, true);

    expect(vue).not.toHaveProperty('alerteVersion');
    expect(vue.cartes).toHaveLength(1);
    expect(vue.cartes[0]?.message).toBe('ERR-013');
    expect(vue.cartes[0]?.titre).toBe('Mettez l’application à jour');
    expect(vue.cartes[0]?.action).toEqual({ type: 'METTRE_A_JOUR', libelle: 'Mettre à jour' });
  });

  it('UT-COMP-US-018-25 autre action requise (Drive plein) — l’invite reste affichée avec la carte ERR-011', () => {
    const vue = feuille({ ...ETAT, actionRequise: 'DRIVE_PLEIN' }, true);

    expect(vue.alerteVersion?.code).toBe('ALR-016');
    expect(vue.cartes.map((c) => c.message)).toEqual(['ERR-011']);
  });
});
