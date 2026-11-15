/**
 * ST-US-031 v0.4 §6.4 (rang 13, tranche B2) ; DAT v0.11.12 §4.1.6 (RL-LOT-001-A1). Fin de session décidée par un autre
 * onglet (`SESSION_FERMEE`) ou fermeture imposée (`versionchange`) : arrêt de la coordination de l'espace ouvert (main
 * rendue, cycle arrêté), puis rechargement, une seule fois. L'ordre des cas d'usage de l'onglet émetteur est couvert au
 * rang 1 (UT-US-022-56), la suppression à deux connexions par UT-US-022-60 et 61.
 */
import { describe, expect, it } from 'vitest';
import type { Annulation } from '@src/commun/application/ports/planificateur';
import type { AvisOnglet, AvisOnglets } from '@src/compte/application/ports/avis-onglets';
import {
  ecouterFinDeSession,
  quitterApresFinDeSession,
} from '@src/composition/fin-session-onglets';

/** Canal d'avis commandé : `recevoir` simule un message d'un autre onglet. */
class AvisCommandes implements AvisOnglets {
  readonly #ecoutes = new Set<(avis: AvisOnglet) => void>();
  diffuser(): void {
    throw new Error('Cet onglet ne diffuse pas dans ce test');
  }
  ecouter(rappel: (avis: AvisOnglet) => void): Annulation {
    this.#ecoutes.add(rappel);
    return () => {
      this.#ecoutes.delete(rappel);
    };
  }
  recevoir(avis: AvisOnglet): void {
    this.#ecoutes.forEach((rappel) => {
      rappel(avis);
    });
  }
}

const preparer = (arreter: () => void = () => undefined) => {
  const ordre: Array<string> = [];
  const quitter = quitterApresFinDeSession({
    arreterCoordination: () => {
      ordre.push('arreterCoordination');
      arreter();
    },
    recharger: () => {
      ordre.push('recharger');
    },
  });
  return { ordre, quitter };
};

describe('Fin de session dans un autre onglet (ST-US-031 §6.4)', () => {
  it('UT-US-031-11 SESSION_FERMEE reçu — coordination arrêtée puis page rechargée, une fois ; rien avant l’avis ; plus rien après l’annulation', () => {
    const { ordre, quitter } = preparer();
    const avis = new AvisCommandes();
    const annuler = ecouterFinDeSession(avis, quitter);
    expect(ordre).toEqual([]);

    avis.recevoir('SESSION_FERMEE');
    expect(ordre).toEqual(['arreterCoordination', 'recharger']);

    annuler();
    const second = preparer();
    ecouterFinDeSession(avis, second.quitter)();
    avis.recevoir('SESSION_FERMEE');
    expect(ordre).toEqual(['arreterCoordination', 'recharger']);
    expect(second.ordre).toEqual([]);
  });

  it('UT-US-031-11 avis puis versionchange — un seul arrêt, un seul rechargement', () => {
    const { ordre, quitter } = preparer();

    quitter();
    quitter();

    expect(ordre).toEqual(['arreterCoordination', 'recharger']);
  });

  it('UT-US-031-11 arrêt de la coordination en échec — la page est rechargée quand même, l’erreur est propagée', () => {
    const erreur = new Error('arrêt impossible');
    const { ordre, quitter } = preparer(() => {
      throw erreur;
    });

    expect(() => {
      quitter();
    }).toThrow(erreur);
    expect(ordre).toEqual(['arreterCoordination', 'recharger']);
  });
});
