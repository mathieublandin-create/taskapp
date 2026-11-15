/**
 * Composant `ChoixRestauration` : carte `ERR-012` et feuille de choix (ST-US-017 v0.10 §6.7 n° 16 ; guide §4.25, §6.6.4
 * « Choix de restauration », ECR-011 E). Les textes viennent du modèle de vue et de `textes` : ici des textes d'essai.
 * UT-COMP-US-017-3-nn.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  ConfirmationRepartirDeZero,
  ModeleVueChoixRestauration,
  TextesChoixRestauration,
} from '@src/synchronisation/presentation/modeles-de-vue/choix-restauration';
import {
  CarteChoixRestauration,
  FeuilleChoixRestauration,
  type ProprietesChoixRestauration,
} from '@src/synchronisation/presentation/ui/ChoixRestauration';
import { apresFermeture, nettoyerDocument } from '@tests/support/ui-objectifs';

afterEach(nettoyerDocument);

const VUE: ModeleVueChoixRestauration = {
  code: 'ERR-012',
  titre: 'Titre d’essai',
  texte: 'Texte d’essai : 12 objectifs',
  propose: true,
  restaurer: { libelle: 'Restaurer d’essai', disponible: true },
  repartirDeZero: { disponible: true },
  deciderPlusTard: { disponible: true },
};

const TEXTES: TextesChoixRestauration = {
  titreFeuille: 'Feuille d’essai',
  fermer: 'Fermer d’essai',
  phraseRestaurer: 'Phrase restaurer',
  restaurationEnCours: 'En cours d’essai',
  mentionDemandee: 'Mention demandée',
  annulerDemande: 'Annuler la demande d’essai',
  repartirDeZero: 'Repartir d’essai',
  phraseRepartirDeZero: 'Phrase repartir',
  repartirDeZeroIndisponible: 'Indisponible d’essai',
  deciderPlusTard: 'Plus tard d’essai',
  phraseDeciderPlusTard: 'Phrase plus tard',
};

const CONFIRMATION: ConfirmationRepartirDeZero = {
  code: 'CNF-REPARTIR-ZERO',
  titre: 'Confirmer d’essai',
  texte: '3 modifications perdues',
  actionLibelle: 'Effacer d’essai',
};

const proprietes = (
  complements: Partial<ProprietesChoixRestauration> = {},
): ProprietesChoixRestauration => ({
  vue: VUE,
  textes: TEXTES,
  surRestaurer: vi.fn(() => Promise.resolve()),
  surAnnulerDemande: vi.fn(),
  evaluerRepartirDeZero: vi.fn(() => Promise.resolve(CONFIRMATION)),
  surRepartirDeZero: vi.fn(() => Promise.resolve()),
  surDeciderPlusTard: vi.fn(),
  ...complements,
});

const action = (conteneur: HTMLElement, nom: string): HTMLElement => {
  const bouton = conteneur.querySelector<HTMLElement>(`[data-action="${nom}"]`);
  if (bouton === null) throw new Error(`Bouton ${nom} absent`);
  return bouton;
};

const sansAction = (conteneur: HTMLElement, nom: string): boolean =>
  conteneur.querySelector(`[data-action="${nom}"]`) === null;

const decritPar = (bouton: HTMLElement): ReadonlyArray<string> =>
  (bouton.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .map((id) => document.getElementById(id)?.textContent ?? '');

describe('CarteChoixRestauration (carte ERR-012 de la section « Erreurs qui demandent une action »)', () => {
  it('UT-COMP-US-017-3-01 S18 : data-message, titre et texte du modèle, « Restaurer » et « Repartir de zéro… » décrits par leur phrase, jamais « Décider plus tard »', () => {
    const { container } = render(<CarteChoixRestauration {...proprietes()} />);

    const carte = container.querySelector('[data-message="ERR-012"]');
    expect(carte?.textContent).toContain('Titre d’essai');
    expect(carte?.textContent).toContain('Texte d’essai : 12 objectifs');
    expect(screen.getByRole('button', { name: 'Restaurer d’essai' }).dataset['action']).toBe(
      'RESTAURER',
    );
    expect(decritPar(action(container, 'RESTAURER'))).toEqual(['Phrase restaurer']);
    expect(decritPar(action(container, 'REPARTIR_DE_ZERO'))).toEqual(['Phrase repartir']);
    expect(sansAction(container, 'DECIDER_PLUS_TARD')).toBe(true);
    expect(container.textContent).not.toContain('Plus tard d’essai');
  });

  it('UT-COMP-US-017-3-02 « Restaurer » : bouton inerte et occupé (aria-busy, libellé « en cours ») jusqu’à la fin de la demande ; un second geste n’en lance pas une autre', async () => {
    let terminer: () => void = () => undefined;
    const surRestaurer = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          terminer = resolve;
        }),
    );
    const { container } = render(<CarteChoixRestauration {...proprietes({ surRestaurer })} />);

    await userEvent.click(action(container, 'RESTAURER'));
    await userEvent.click(action(container, 'RESTAURER'));

    await waitFor(() => {
      const bouton = action(container, 'RESTAURER');
      expect(bouton.textContent).toBe('En cours d’essai');
      expect(bouton.getAttribute('aria-busy')).toBe('true');
      expect(bouton.getAttribute('aria-disabled')).toBe('true');
    });
    expect(surRestaurer).toHaveBeenCalledTimes(1);
    terminer();
    await waitFor(() => {
      expect(action(container, 'RESTAURER').textContent).toBe('Restaurer d’essai');
    });
    expect(action(container, 'RESTAURER').getAttribute('aria-busy')).toBe('false');
  });

  it('UT-COMP-US-017-3-03 S20b : restauration demandée, la mention (role=status) et « Annuler la demande » remplacent le bouton ; le focus passe à « Annuler la demande », puis revient à « Restaurer » après l’annulation', async () => {
    const surAnnulerDemande = vi.fn();
    const attente = { ...VUE, restaurationEnAttente: true as const };
    const base = proprietes({ surAnnulerDemande });
    const { container, rerender } = render(<CarteChoixRestauration {...base} />);

    await userEvent.click(action(container, 'RESTAURER'));
    rerender(<CarteChoixRestauration {...base} vue={attente} />);

    await waitFor(() => {
      expect(document.activeElement).toBe(action(container, 'ANNULER_DEMANDE'));
    });
    expect(sansAction(container, 'RESTAURER')).toBe(true);
    expect(screen.getByRole('status').textContent).toBe('Mention demandée');

    await userEvent.click(action(container, 'ANNULER_DEMANDE'));
    expect(surAnnulerDemande).toHaveBeenCalledTimes(1);
    rerender(<CarteChoixRestauration {...base} />);

    await waitFor(() => {
      expect(document.activeElement).toBe(action(container, 'RESTAURER'));
    });
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('UT-COMP-US-017-3-04 S22b : hors ligne, « Repartir de zéro… » reste visible, focalisable et inerte (aria-disabled), décrit par sa phrase puis par l’explication ; « Restaurer » reste actif', async () => {
    const evaluerRepartirDeZero = vi.fn(() => Promise.resolve(CONFIRMATION));
    const horsLigne = { ...VUE, repartirDeZero: { disponible: false } };
    const { container } = render(
      <CarteChoixRestauration {...proprietes({ vue: horsLigne, evaluerRepartirDeZero })} />,
    );

    const bouton = action(container, 'REPARTIR_DE_ZERO');
    expect(bouton.getAttribute('aria-disabled')).toBe('true');
    expect(bouton.hasAttribute('disabled')).toBe(false);
    expect(decritPar(bouton)).toEqual(['Phrase repartir', 'Indisponible d’essai']);
    await userEvent.click(bouton);
    bouton.focus();
    expect(document.activeElement).toBe(bouton);
    expect(evaluerRepartirDeZero).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(action(container, 'RESTAURER').getAttribute('aria-disabled')).toBe('false');
  });

  it('UT-COMP-US-017-3-05 S22 : « Repartir de zéro… » ouvre la confirmation rouge (CNF-REPARTIR-ZERO) ; « Annuler » et Échap la ferment et rendent le focus au bouton sans rien exécuter', async () => {
    const props = proprietes();
    const { container } = render(<CarteChoixRestauration {...props} />);

    await userEvent.click(action(container, 'REPARTIR_DE_ZERO'));
    const boite = await screen.findByRole('alertdialog', { name: 'Confirmer d’essai' });
    expect(boite.dataset['code']).toBe('CNF-REPARTIR-ZERO');
    expect(within(boite).getByText('3 modifications perdues')).toBeTruthy();
    expect(within(boite).getByRole('button', { name: 'Effacer d’essai' }).dataset['rouge']).toBe(
      'true',
    );

    await userEvent.click(within(boite).getByRole('button', { name: 'Annuler' }));
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(document.activeElement).toBe(action(container, 'REPARTIR_DE_ZERO'));

    await userEvent.click(action(container, 'REPARTIR_DE_ZERO'));
    await screen.findByRole('alertdialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(document.activeElement).toBe(action(container, 'REPARTIR_DE_ZERO'));
    expect(props.surRepartirDeZero).not.toHaveBeenCalled();
  });

  it('UT-COMP-US-017-3-06 S22 : confirmer exécute « Repartir de zéro » une seule fois puis ferme la boîte ; une évaluation sans confirmation (refus) n’ouvre rien', async () => {
    const props = proprietes();
    const { container, rerender } = render(<CarteChoixRestauration {...props} />);

    await userEvent.click(action(container, 'REPARTIR_DE_ZERO'));
    await userEvent.click(await screen.findByRole('button', { name: 'Effacer d’essai' }));

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(props.surRepartirDeZero).toHaveBeenCalledTimes(1);

    const refus = proprietes({ evaluerRepartirDeZero: vi.fn(() => Promise.resolve(undefined)) });
    rerender(<CarteChoixRestauration {...refus} />);
    await userEvent.click(action(container, 'REPARTIR_DE_ZERO'));
    await waitFor(() => {
      expect(refus.evaluerRepartirDeZero).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});

describe('FeuilleChoixRestauration (feuille de choix « Action requise »)', () => {
  it('UT-COMP-US-017-3-07 S19 : ouverte tant que le choix est proposé, avec « Décider plus tard » sous sa phrase ; « Décider plus tard » et « Fermer » rendent la main sans rien écrire', async () => {
    const props = proprietes();
    const { rerender } = render(<FeuilleChoixRestauration {...props} />);

    const decider = await screen.findByRole('button', { name: 'Plus tard d’essai' });
    expect(decider.dataset['action']).toBe('DECIDER_PLUS_TARD');
    expect(decritPar(decider)).toEqual(['Phrase plus tard']);
    expect(screen.getByRole('heading', { name: 'Feuille d’essai' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Titre d’essai' })).toBeTruthy();

    await userEvent.click(decider);
    await userEvent.click(screen.getByRole('button', { name: 'Fermer d’essai' }));
    expect(props.surDeciderPlusTard).toHaveBeenCalledTimes(2);

    const fermee = apresFermeture('Modal');
    rerender(<FeuilleChoixRestauration {...props} vue={{ ...props.vue, propose: false }} />);
    await fermee;
  });

  it('UT-COMP-US-017-3-08 S20b : restauration demandée, « Décider plus tard » et sa phrase disparaissent (« Fermer » suffit) ; décision reportée, la feuille se ferme sans rappeler le contrôleur', async () => {
    const props = proprietes({ vue: { ...VUE, restaurationEnAttente: true } });
    const { rerender } = render(<FeuilleChoixRestauration {...props} />);

    await screen.findByRole('button', { name: 'Annuler la demande d’essai' });
    expect(screen.queryByRole('button', { name: 'Plus tard d’essai' })).toBeNull();
    expect(screen.queryByText('Phrase plus tard')).toBeNull();
    expect(screen.getByRole('button', { name: 'Fermer d’essai' })).toBeTruthy();

    const fermee = apresFermeture('Modal');
    rerender(<FeuilleChoixRestauration {...props} vue={{ ...props.vue, propose: false }} />);
    await fermee;
    expect(props.surDeciderPlusTard).not.toHaveBeenCalled();
  });
});
