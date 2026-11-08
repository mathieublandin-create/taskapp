/**
 * Interface de l'incrément 4 (ST-US-017 v0.11 §6.8 n° 4, 10, 11 ; guide v0.2.23 §6.6.14 a, b, d), tests complémentaires
 * de Benjamin (rang 11, tranche D2) : variante `carte` d'`ERR-013` sur la feuille, carte `ALR-001`, retours de
 * « Mettre à jour » sous le bandeau et la carte (ligne `role="status"`, sans toast), ligne « Fuseau ».
 * UT-COMP-US-017-4-51 à 4-56.
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { construireSectionCompte } from '@src/compte/presentation/modeles-de-vue/section-compte';
import { SectionCompte } from '@src/compte/presentation/ui/SectionCompte';
import type { EtatSynchronisationAffichable } from '@src/synchronisation/presentation/modeles-de-vue/etat-synchronisation-affichable';
import { construireBandeau } from '@src/synchronisation/presentation/modeles-de-vue/bandeau';
import { construireFeuilleSynchronisation } from '@src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation';
import { Bandeau } from '@src/synchronisation/presentation/ui/Bandeau';
import { FeuilleSynchronisation } from '@src/synchronisation/presentation/ui/FeuilleSynchronisation';
import type { IssueMiseAJour } from '@src/synchronisation/application/ports/mise-a-jour-application';
import { IDENTITE_A } from '@tests/support/compte/doublures-compte';
import { ecart, HEURE, instant, NEW_YORK, PARIS } from '@tests/support/valeurs';

afterEach(cleanup);

const ETAT: EtatSynchronisationAffichable = {
  reseau: 'CONNECTE',
  acces: 'VALIDE',
  cycle: 'REPOS',
  enAttente: 0,
  aLire: 0,
  rappelMasque: false,
};
const MAINTENANT = instant('2026-10-21T08:32:00.000Z');

const feuille = (etat: Partial<EtatSynchronisationAffichable>, correctionHeures?: number) =>
  construireFeuilleSynchronisation({
    etat: { ...ETAT, ...etat },
    maintenant: MAINTENANT,
    elementsEnAttente: [],
    ...(correctionHeures === undefined
      ? {}
      : { correctionHorloge: ecart(correctionHeures * HEURE) }),
  });

const afficherFeuille = (
  vue: ReturnType<typeof feuille>,
  miseAJour?: IssueMiseAJour,
  surActionCarte = vi.fn(),
) =>
  render(
    <FeuilleSynchronisation
      vue={vue}
      surSynchroniser={vi.fn()}
      surActionCarte={surActionCarte}
      miseAJour={miseAJour}
    />,
  );

const carte = (conteneur: HTMLElement, message: string): HTMLElement => {
  const trouvee = conteneur.querySelector<HTMLElement>(`[data-message="${message}"]`);
  if (trouvee === null) throw new Error(`Carte ${message} absente`);
  return trouvee;
};

const bandeauConsultationSeule = () => {
  const bandeau = construireBandeau({ ...ETAT, actionRequise: 'FORMAT_PLUS_RECENT' }, MAINTENANT);
  if (bandeau === undefined) throw new Error('Bandeau BAN-CONSULTATION-SEULE absent');
  return bandeau;
};

const VUE_FORMAT_RECENT = feuille({ actionRequise: 'FORMAT_PLUS_RECENT' });

describe('Feuille : cartes ERR-013 et ALR-001 (guide §6.6.14 d, ST-US-017 §6.8 n° 4)', () => {
  it('UT-COMP-US-017-4-51 la carte ERR-013 de la feuille porte la variante « carte » (titre et texte de la maquette G), son action « Mettre à jour » est transmise ; le bandeau garde le texte court', async () => {
    const surActionCarte = vi.fn();
    const { container } = afficherFeuille(VUE_FORMAT_RECENT, undefined, surActionCarte);

    const erreur = carte(container, 'ERR-013');
    expect(within(erreur).getByText('Mettez l’application à jour')).toBeTruthy();
    expect(erreur.textContent).toContain(
      'Une version plus récente a enregistré vos données. Vous pouvez les consulter ; mettez l’application à jour pour continuer à les modifier.',
    );
    expect(erreur.textContent).not.toContain('Consultation seule');
    await userEvent.click(within(erreur).getByRole('button', { name: 'Mettre à jour' }));
    expect(surActionCarte).toHaveBeenCalledExactlyOnceWith('METTRE_A_JOUR');
    cleanup();

    render(
      <Bandeau
        appareil="PC"
        vue={bandeauConsultationSeule()}
        surAction={vi.fn()}
        surMasquer={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Consultation seule')).toBeTruthy();
    expect(screen.queryByText('Mettez l’application à jour')).toBeNull();
  });

  it('UT-COMP-US-017-4-52 ALR-001 : carte en status sans bouton, placée avant ERR-013 et après ERR-011 ou ERR-016 ; absente sous le seuil', () => {
    const { container, unmount } = afficherFeuille(
      feuille({ actionRequise: 'FORMAT_PLUS_RECENT' }, 25),
    );
    const alerte = carte(container, 'ALR-001');
    expect(alerte.getAttribute('role')).toBe('status');
    expect(within(alerte).queryByRole('button')).toBeNull();
    const ordre = Array.from(container.querySelectorAll('[data-message]')).map(
      (c) => (c as HTMLElement).dataset['message'],
    );
    expect(ordre).toEqual(['ALR-001', 'ERR-013']);
    unmount();

    const avecEchec = afficherFeuille(
      feuille({ actionRequise: 'ECHEC_PERSISTANT', enAttente: 2 }, -30),
    );
    const ordreEchec = Array.from(avecEchec.container.querySelectorAll('[data-message]')).map(
      (c) => (c as HTMLElement).dataset['message'],
    );
    expect(ordreEchec).toEqual(['ERR-016', 'ALR-001']);
    avecEchec.unmount();

    const sansSeuil = afficherFeuille(feuille({}, 24));
    expect(sansSeuil.container.querySelector('[data-message="ALR-001"]')).toBeNull();
  });
});

describe('« Mettre à jour » : retours de l’action (guide §6.6.14 a)', () => {
  const retours: ReadonlyArray<readonly [IssueMiseAJour, string]> = [
    ['AUCUNE_VERSION', 'Aucune version plus récente n’est disponible.'],
    ['ECHEC', 'Vérification impossible pour le moment. Réessayez dans quelques instants.'],
    ['RECHARGEMENT_LANCE', 'L’application va se recharger. Vos modifications sont conservées.'],
  ];

  it.each(retours)(
    'UT-COMP-US-017-4-53 carte, issue %s : ligne role="status" avec le texte exact, titre et texte de la carte inchangés, aucun toast',
    (issue, texte) => {
      const { container } = afficherFeuille(VUE_FORMAT_RECENT, issue);
      const erreur = carte(container, 'ERR-013');
      expect(within(erreur).getByRole('status').textContent).toBe(texte);
      expect(within(erreur).getByText('Mettez l’application à jour')).toBeTruthy();
      expect(document.querySelector('ion-toast')).toBeNull();
    },
  );

  it.each(retours)(
    'UT-COMP-US-017-4-54 bandeau, issue %s : ligne role="status" sous le texte, sans toast ; l’action reste présente',
    (issue, texte) => {
      render(
        <Bandeau
          appareil="PC"
          vue={bandeauConsultationSeule()}
          surAction={vi.fn()}
          surMasquer={vi.fn()}
          miseAJour={issue}
        />,
      );
      expect(screen.getByRole('status').textContent).toBe(texte);
      expect(screen.getByRole('button', { name: 'Mettre à jour' })).toBeTruthy();
      expect(document.querySelector('ion-toast')).toBeNull();
    },
  );

  it('UT-COMP-US-017-4-55 pendant le rechargement, « Mettre à jour » est en aria-disabled (focalisable, sans effet) ; il reste actif pour aucune-version et échec', async () => {
    const surActionCarte = vi.fn();
    const surAction = vi.fn();
    const { container, rerender } = afficherFeuille(
      VUE_FORMAT_RECENT,
      'RECHARGEMENT_LANCE',
      surActionCarte,
    );
    const bouton = within(carte(container, 'ERR-013')).getByRole('button', {
      name: 'Mettre à jour',
    });
    expect(bouton.getAttribute('aria-disabled')).toBe('true');
    expect((bouton as HTMLButtonElement).disabled).toBe(false);
    await userEvent.click(bouton);
    expect(surActionCarte).not.toHaveBeenCalled();

    rerender(
      <FeuilleSynchronisation
        vue={VUE_FORMAT_RECENT}
        surSynchroniser={vi.fn()}
        surActionCarte={surActionCarte}
        miseAJour="ECHEC"
      />,
    );
    expect(bouton.getAttribute('aria-disabled')).toBeNull();
    cleanup();

    render(
      <Bandeau
        appareil="PC"
        vue={bandeauConsultationSeule()}
        surAction={surAction}
        surMasquer={vi.fn()}
        miseAJour="RECHARGEMENT_LANCE"
      />,
    );
    const dansLeBandeau = screen.getByRole('button', { name: 'Mettre à jour' });
    expect(dansLeBandeau.getAttribute('aria-disabled')).toBe('true');
    await userEvent.click(dansLeBandeau);
    expect(surAction).not.toHaveBeenCalled();
  });
});

describe('Section « Compte » : ligne « Fuseau » (guide §6.6.14 b)', () => {
  it('UT-COMP-US-017-4-56 la ligne « Fuseau » suit « Données », sous data-etat ; elle n’existe pas à l’heure de Paris', () => {
    const { container, rerender } = render(
      <SectionCompte
        vue={construireSectionCompte({ adresse: IDENTITE_A.adresse, fuseauAppareil: NEW_YORK })}
        surAction={vi.fn()}
      />,
    );
    const ligne = container.querySelector<HTMLElement>('[data-etat="SYN-FEUILLE-FUSEAU"]');
    expect(ligne?.textContent).toBe('Heure de ParisVotre appareil est réglé sur New York.');
    const dossier = container.querySelector('[data-code="SYN-FEUILLE-DOSSIER"]');
    if (dossier === null || ligne === null)
      throw new Error('Lignes « Données » et « Fuseau » absentes');
    expect(dossier.compareDocumentPosition(ligne) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    rerender(
      <SectionCompte
        vue={construireSectionCompte({ adresse: IDENTITE_A.adresse, fuseauAppareil: PARIS })}
        surAction={vi.fn()}
      />,
    );
    expect(container.querySelector('[data-etat="SYN-FEUILLE-FUSEAU"]')).toBeNull();
  });
});
