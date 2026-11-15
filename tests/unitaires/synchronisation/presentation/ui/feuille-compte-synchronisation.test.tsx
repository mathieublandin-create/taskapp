/**
 * ST-CORR-E13B-LOT-001 §5 (tranche T5a) : ANO-005, feuille « Compte et synchronisation » d'ECR-011 en `IonModal`
 * (guide v0.2.26 §4.26, §6.6.15, §6.6.16 n° 5). Fermée par défaut, ouverte par `BoutonFeuille` ; ordre « À lire »,
 * `ALR-016`, section « Synchronisation » (`ALR-015` en pied), « Compte » ; confirmations rendues dans la modale
 * (piège d'ANO-007). Géométrie réelle (0,92, panneau de 400 px) : E2E-ANO-005-FEUILLE-01 à 05. Rang 14.
 * v0.3 (guide v0.2.27 §6.6.17, comportement dans `IonModal`) : focus sur le titre à la présentation, focus rendu au
 * bouton d'ouverture s'il ne l'a plus à la fermeture (Safari), Échap qui ferme la confirmation seule (UT-…-08 à 11).
 */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type RefObject } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BoiteConfirmation } from '@src/commun/presentation/ui/boite-confirmation';
import type { ModeleVueFeuilleSynchronisation } from '@src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation';
import {
  BoutonFeuille,
  FeuilleCompteEtSynchronisation,
  ID_FEUILLE_SYNCHRONISATION,
  MEDIA_PANNEAU_LATERAL,
} from '@src/synchronisation/presentation/ui/FeuilleCompteEtSynchronisation';
import { LIBELLES_FEUILLE } from '@src/synchronisation/presentation/ui/libelles-feuille';
import { surPresentationModale } from '@tests/support/ui-objectifs';

const MATCH_MEDIA_INITIAL = Object.getOwnPropertyDescriptor(window, 'matchMedia');

afterEach(() => {
  cleanup();
  if (MATCH_MEDIA_INITIAL === undefined) Reflect.deleteProperty(window, 'matchMedia');
  else Object.defineProperty(window, 'matchMedia', MATCH_MEDIA_INITIAL);
});

const VUE: ModeleVueFeuilleSynchronisation = {
  attente: { code: 'SYN-FEUILLE-RIEN-EN-ATTENTE', libelle: 'Aucune modification en attente.' },
  bouton: { code: 'SYN-FEUILLE-BOUTON', libelle: 'Synchroniser maintenant', disponible: true },
  cartes: [],
  stockage: { code: 'SYN-FEUILLE-STOCKAGE', etat: 'NON-PROTEGE', libelle: 'Stockage non protégé.' },
  alerteStockage: {
    code: 'ALR-015',
    titre: 'Données de cet appareil non protégées',
    texte: 'Le navigateur peut les effacer.',
    role: 'status',
    fermable: false,
  },
  alerteVersion: {
    code: 'ALR-016',
    titre: 'Une nouvelle version est disponible',
    texte: 'Mettez à jour quand vous le souhaitez. Vos modifications sont conservées.',
    role: 'status',
    fermable: false,
    action: { type: 'METTRE_A_JOUR', libelle: 'Mettre à jour' },
  },
};

const SYNCHRONISATION = { vue: VUE, surSynchroniser: vi.fn(), surActionCarte: vi.fn() };

/** Rend la feuille ouverte avec ses quatre emplacements repérables, puis attend la fin de sa présentation. */
const rendreOuverte = async (surFermee = vi.fn()) => {
  const presentee = surPresentationModale();
  render(
    <FeuilleCompteEtSynchronisation
      ouverte
      surFermee={surFermee}
      aLire={<section data-test="a-lire">À lire</section>}
      synchronisation={SYNCHRONISATION}
      compte={<section data-test="compte">Compte</section>}
      dialogues={<div data-test="dialogue" role="alertdialog" aria-label="Confirmation" />}
    />,
  );
  await presentee;
  return surFermee;
};

const modale = (): HTMLIonModalElement => {
  const element = document.querySelector<HTMLIonModalElement>('ion-modal.feuille-synchronisation');
  if (element === null) throw new Error('ion-modal.feuille-synchronisation absente');
  return element;
};

const element = (selecteur: string): Element => {
  const trouve = document.querySelector(selecteur);
  if (trouve === null) throw new Error(`${selecteur} absent`);
  return trouve;
};

/** Vrai si `a` précède `b` dans le document. */
const precede = (a: Element, b: Element): boolean =>
  (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

/** `matchMedia` du navigateur simulé : seule la requête du panneau latéral répond `vrai` si `pc`. */
const simulerLargeur = (pc: boolean): void => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (requete: string) => ({
      matches: pc && requete === MEDIA_PANNEAU_LATERAL,
      media: requete,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
};

describe('BoutonFeuille (ANO-005, Q-CORR-STE-1 a)', () => {
  it('UT-ANO-005-FEUILLE-01 bouton natif tertiaire « Compte et synchronisation » : aria-haspopup dialog, aria-controls, aria-expanded suit la feuille ; un clic appelle surOuvrir', async () => {
    const surOuvrir = vi.fn();
    const { rerender } = render(<BoutonFeuille ouverte={false} surOuvrir={surOuvrir} />);
    const bouton = screen.getByRole('button', { name: LIBELLES_FEUILLE.ouvrir });
    expect(bouton.classList.contains('bouton-natif')).toBe(true);
    expect(bouton.dataset['variante']).toBe('tertiaire');
    expect(bouton.dataset['action']).toBe('OUVRIR_FEUILLE');
    expect(bouton.getAttribute('aria-haspopup')).toBe('dialog');
    expect(bouton.getAttribute('aria-controls')).toBe(ID_FEUILLE_SYNCHRONISATION);
    expect(bouton.getAttribute('aria-expanded')).toBe('false');
    await userEvent.click(bouton);
    expect(surOuvrir).toHaveBeenCalledTimes(1);
    rerender(<BoutonFeuille ouverte surOuvrir={surOuvrir} />);
    expect(bouton.getAttribute('aria-expanded')).toBe('true');
  });
});

describe('FeuilleCompteEtSynchronisation (ANO-005, guide §4.26, §6.6.15)', () => {
  it('UT-ANO-005-FEUILLE-02 fermée : aucun contenu de la feuille dans le document (ni section, ni ligne SYN-FEUILLE, ni confirmation)', () => {
    render(
      <FeuilleCompteEtSynchronisation
        ouverte={false}
        surFermee={vi.fn()}
        aLire={<section data-test="a-lire">À lire</section>}
        synchronisation={SYNCHRONISATION}
        compte={<section data-test="compte">Compte</section>}
        dialogues={<div data-test="dialogue" />}
      />,
    );
    expect(
      document.querySelector(
        '[data-test="a-lire"], [data-test="compte"], [data-test="dialogue"], [data-etat^="SYN-FEUILLE"]',
      ),
    ).toBeNull();
  });

  it('UT-ANO-005-FEUILLE-03 ouverte : modale nommée « Compte et synchronisation », id de la cible du bouton, titre de niveau 2 et « Fermer » en tête', async () => {
    await rendreOuverte();
    const feuille = modale();
    expect(feuille.id).toBe(ID_FEUILLE_SYNCHRONISATION);
    // v0.3 : Ionic porte le rôle `dialog` (et l'`aria-label` hérité de l'hôte) sur l'enveloppe du shadow DOM
    // (`.modal-wrapper`), que `getByRole` de jsdom ne traverse pas ; Playwright, lui, la trouve (E2E-ANO-005-FEUILLE-*).
    const dialogue = feuille.shadowRoot?.querySelector('[role="dialog"]');
    expect(dialogue?.getAttribute('aria-label')).toBe(LIBELLES_FEUILLE.titre);
    expect(dialogue?.getAttribute('aria-modal')).toBe('true');
    const titre = screen.getByRole('heading', { level: 2, name: LIBELLES_FEUILLE.titre });
    const fermer = screen.getByRole('button', { name: LIBELLES_FEUILLE.fermer });
    expect(feuille.contains(titre)).toBe(true);
    expect(fermer.classList.contains('bouton-natif')).toBe(true);
    expect(fermer.dataset['variante']).toBe('tertiaire');
    expect(precede(fermer, element('[data-test="a-lire"]'))).toBe(true);
  });

  it('UT-ANO-005-FEUILLE-04 ordre du §6.6.15 : « À lire », ALR-016, section « Synchronisation » (SYN-FEUILLE-BOUTON), ALR-015 puis « Stockage » en pied, enfin « Compte »', async () => {
    await rendreOuverte();
    const ordre = [
      element('[data-test="a-lire"]'),
      element('[data-message="ALR-016"]'),
      element('[data-etat="SYN-FEUILLE-BOUTON"]'),
      element('[data-message="ALR-015"]'),
      element('[data-etat="NON-PROTEGE"]'),
      element('[data-test="compte"]'),
    ];
    ordre.slice(1).forEach((suivant, i) => {
      const courant = ordre[i];
      if (courant === undefined) throw new Error('ordre incomplet');
      expect(precede(courant, suivant)).toBe(true);
    });
    ordre.forEach((e) => {
      expect(modale().contains(e)).toBe(true);
    });
  });

  it('UT-ANO-005-FEUILLE-05 « Fermer » appelle surFermee une fois ; les confirmations ouvertes depuis la feuille sont rendues dans la modale', async () => {
    const surFermee = await rendreOuverte();
    expect(modale().contains(screen.getByRole('alertdialog', { name: 'Confirmation' }))).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: LIBELLES_FEUILLE.fermer }));
    expect(surFermee).toHaveBeenCalledTimes(1);
  });

  it('UT-ANO-005-FEUILLE-06 smartphone (moins de 1024 px) : feuille basse haute, initialBreakpoint 0,92, breakpoints [0, 0,92], défilement interne (expandToScroll faux)', async () => {
    simulerLargeur(false);
    await rendreOuverte();
    const feuille = modale();
    expect(feuille.initialBreakpoint).toBe(0.92);
    expect(feuille.breakpoints).toEqual([0, 0.92]);
    expect(feuille.expandToScroll).toBe(false);
  });

  it('UT-ANO-005-FEUILLE-07 PC (1024 px et plus) : panneau pleine hauteur, initialBreakpoint 1, breakpoints [0, 1]', async () => {
    simulerLargeur(true);
    await rendreOuverte();
    const feuille = modale();
    expect(feuille.initialBreakpoint).toBe(1);
    expect(feuille.breakpoints).toEqual([0, 1]);
  });
});

// v0.3 (ST-CORR §5.1 bis, guide v0.2.27 §6.6.17) : les trois comportements de focus et d'Échap dans l'`IonModal` réelle
// (composants Ionic définis dans jsdom). Le focus de départ est le corps du document : c'est le cas de Safari, où un
// clic ne donne pas le focus au bouton ; Ionic ne peut alors rien rendre à la fermeture (il rend l'élément actif à la
// présentation), c'est le code qui doit le faire.

/** Promesse résolue à la fin de la fermeture de la prochaine modale (`ionModalDidDismiss`). */
const surFermetureModale = (): Promise<void> =>
  new Promise<void>((resoudre) => {
    document.addEventListener(
      'ionModalDidDismiss',
      () => {
        resoudre();
      },
      { once: true },
    );
  });

type ProprietesBanc = {
  readonly ouverte: boolean;
  readonly surFermee: () => void;
  readonly refBouton: RefObject<HTMLButtonElement | null>;
  readonly confirmation?: { readonly surAnnuler: () => void };
};

/** Ligne d'état réduite au bouton d'ouverture, et la feuille, reliés par la même référence (comme `main.tsx`). */
const Banc = ({ ouverte, surFermee, refBouton, confirmation }: ProprietesBanc) => (
  <>
    <BoutonFeuille ouverte={ouverte} surOuvrir={vi.fn()} refElement={refBouton} />
    <FeuilleCompteEtSynchronisation
      ouverte={ouverte}
      surFermee={surFermee}
      refBoutonOuverture={refBouton}
      synchronisation={SYNCHRONISATION}
      compte={<section data-test="compte">Compte</section>}
      dialogues={
        confirmation === undefined ? undefined : (
          <BoiteConfirmation
            code="CNF-DECONNEXION"
            titre="Se déconnecter ?"
            actionLibelle="Se déconnecter"
            rouge={false}
            surConfirmer={vi.fn()}
            surAnnuler={confirmation.surAnnuler}
          />
        )
      }
    />
  </>
);

/** Rend le banc feuille fermée, le focus sur le corps du document, puis ouvre la feuille et attend sa présentation. */
const ouvrirLeBanc = async (
  surFermee: () => void,
  confirmation?: ProprietesBanc['confirmation'],
) => {
  const refBouton = createRef<HTMLButtonElement>();
  const proprietes = {
    surFermee,
    refBouton,
    ...(confirmation === undefined ? {} : { confirmation }),
  };
  const rendu = render(<Banc ouverte={false} {...proprietes} />);
  expect(document.activeElement).toBe(document.body);
  const presentee = surPresentationModale();
  rendu.rerender(<Banc ouverte {...proprietes} />);
  await presentee;
  const bouton = refBouton.current;
  if (bouton === null) throw new Error('bouton d’ouverture absent');
  return { ...rendu, bouton, proprietes };
};

const titreDeLaFeuille = (): HTMLElement =>
  screen.getByRole('heading', { level: 2, name: LIBELLES_FEUILLE.titre });

describe('FeuilleCompteEtSynchronisation : focus et Échap dans IonModal (guide v0.2.27 §6.6.17)', () => {
  it('UT-ANO-005-FEUILLE-08 à la présentation, le focus va sur le titre h2 de la feuille (tabIndex -1), ni sur l’hôte ion-modal ni sur « Fermer »', async () => {
    await ouvrirLeBanc(vi.fn());
    const titre = titreDeLaFeuille();
    expect(titre.tabIndex).toBe(-1);
    await waitFor(() => {
      expect(document.activeElement).toBe(titre);
    });
  });

  it('UT-ANO-005-FEUILLE-09 fermeture par le parent (« Fermer », isOpen faux) alors que le bouton d’ouverture n’avait pas le focus (Safari) : à la fin de la fermeture, le focus est sur le bouton d’ouverture', async () => {
    const surFermee = vi.fn();
    const { bouton, rerender, proprietes } = await ouvrirLeBanc(surFermee);
    const fermee = surFermetureModale();
    rerender(<Banc ouverte={false} {...proprietes} />);
    await fermee;
    await waitFor(() => {
      expect(document.activeElement).toBe(bouton);
    });
  });

  it('UT-ANO-005-FEUILLE-10 Échap sans confirmation ouverte : la feuille se ferme (surFermee appelée une fois, par onDidDismiss) et le focus revient au bouton d’ouverture', async () => {
    const surFermee = vi.fn();
    const { bouton } = await ouvrirLeBanc(surFermee);
    const fermee = surFermetureModale();
    await userEvent.keyboard('{Escape}');
    await fermee;
    expect(surFermee).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(document.activeElement).toBe(bouton);
    });
  });

  it('UT-ANO-005-FEUILLE-11 Échap avec une confirmation ouverte dans la feuille : la confirmation seule est annulée (surAnnuler une fois) ; la feuille ne commence pas à se fermer (aucun ionModalWillDismiss, surFermee jamais appelée)', async () => {
    const surFermee = vi.fn();
    const surAnnuler = vi.fn();
    await ouvrirLeBanc(surFermee, { surAnnuler });
    const annuler = screen.getByRole('button', { name: 'Annuler' });
    annuler.focus();
    const fermetures = vi.fn();
    document.addEventListener('ionModalWillDismiss', fermetures);
    try {
      await userEvent.keyboard('{Escape}');
      await new Promise((resoudre) => setTimeout(resoudre, 50));
      expect(surAnnuler).toHaveBeenCalledTimes(1);
      expect(fermetures).not.toHaveBeenCalled();
      expect(surFermee).not.toHaveBeenCalled();
      expect(modale().contains(annuler)).toBe(true);
    } finally {
      document.removeEventListener('ionModalWillDismiss', fermetures);
    }
  });
});
