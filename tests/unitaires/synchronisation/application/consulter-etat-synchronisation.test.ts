import { describe, expect, it } from 'vitest';
import { MasquageRappel } from '@src/synchronisation/application/masquage-rappel';
import type { EtatAccesGoogle } from '@src/synchronisation/application/ports/acces-google';
import { SUIVI_CYCLE_AU_REPOS } from '@src/synchronisation/application/ports/suivi-cycle';
import { consulterEtatSynchronisation } from '@src/synchronisation/application/requetes/consulter-etat-synchronisation';
import { construireIndicateur } from '@src/synchronisation/presentation/modeles-de-vue/indicateur-synchronisation';
import { ReseauFixe } from '@tests/support/compte/doublures-compte';
import { instant } from '@tests/support/valeurs';

const acces = (etat: EtatAccesGoogle) => ({
  etat: () => etat,
  signalerRefus: () => Promise.resolve(etat),
  observer: () => () => undefined,
});

describe('consulterEtatSynchronisation (ST-US-022 §3.2 n° 44)', () => {
  it('UT-COMP-US-022-53 compose réseau, accès, moteur, attente et masquage ; sans session : rien', async () => {
    const masquage = new MasquageRappel();
    const plusAncienne = instant('2026-10-27T08:00:00.000Z');
    const dependances = {
      reseau: new ReseauFixe(false),
      acces: acces('A_RENOUVELER'),
      suivi: SUIVI_CYCLE_AU_REPOS,
      masquage,
      attente: () => Promise.resolve({ enAttente: 2, plusAncienneEnAttente: plusAncienne }),
    };
    masquage.masquer();

    const etat = await consulterEtatSynchronisation(dependances);

    expect(etat).toEqual({
      reseau: 'COUPE',
      acces: 'A_RENOUVELER',
      cycle: 'REPOS',
      enAttente: 2,
      plusAncienneEnAttente: plusAncienne,
      aLire: 0,
      rappelMasque: true,
    });
    expect(etat && construireIndicateur(etat)).toEqual({ code: 'SYN-HORS-LIGNE', n: 2 });
    expect(
      await consulterEtatSynchronisation({ ...dependances, acces: acces('SANS_SESSION') }),
    ).toBeUndefined();
  });
});
