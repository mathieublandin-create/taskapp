import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { construireConfirmationCompte } from '@src/compte/presentation/modeles-de-vue/confirmations-compte';
import { construireEcranConnexion } from '@src/compte/presentation/modeles-de-vue/ecran-connexion';
import { construireSectionCompte } from '@src/compte/presentation/modeles-de-vue/section-compte';
import { DialogueConfirmation } from '@src/compte/presentation/ui/DialogueConfirmation';
import { EcranConnexion } from '@src/compte/presentation/ui/EcranConnexion';
import { Racine } from '@src/compte/presentation/ui/Racine';
import { SectionCompte } from '@src/compte/presentation/ui/SectionCompte';
import { SuppressionBloquee } from '@src/compte/presentation/ui/SuppressionBloquee';
import { IDENTITE_A } from '@tests/support/compte/doublures-compte';

afterEach(cleanup);

describe('Écrans du compte (ECR-010, ECR-011 ; guide §6.6)', () => {
  it('UT-COMP-US-022-80 EcranConnexion — deux autorisations annoncées, « Continuer avec Google » ; un échec en role="alert" avec data-message, focus sur le bouton', async () => {
    const surAction = vi.fn();
    const { rerender } = render(
      <EcranConnexion vue={construireEcranConnexion({ enCours: false })} surAction={surAction} />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByRole('alert')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Continuer avec Google' }));
    expect(surAction).toHaveBeenCalledTimes(1);

    rerender(
      <EcranConnexion
        vue={construireEcranConnexion({ dernierEchec: 'ERR-003', enCours: false })}
        surAction={surAction}
      />,
    );
    expect(screen.getByRole('alert').dataset['message']).toBe('ERR-003');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Réessayer' }));
    rerender(
      <EcranConnexion vue={construireEcranConnexion({ enCours: true })} surAction={surAction} />,
    );
    expect(screen.getByRole('button')).toHaveProperty('disabled', true);
  });

  it('UT-COMP-US-022-81 Racine — connexion, attente de Google (SYN-REDIRECTION, role="status", nom accessible) ou application', () => {
    const { rerender } = render(
      <Racine vue={{ ecran: 'CONNEXION' }} connexion={<p>connexion</p>} application={<p>app</p>} />,
    );
    expect(screen.getByText('connexion')).toBeTruthy();
    rerender(
      <Racine
        vue={{
          ecran: 'ATTENTE_GOOGLE',
          etat: 'SYN-REDIRECTION',
          nomAccessible: 'Connexion à Google en cours',
        }}
        connexion={<p>connexion</p>}
        application={<p>app</p>}
      />,
    );
    const attente = screen.getByRole('status', { name: 'Connexion à Google en cours' });
    expect(attente.dataset['etat']).toBe('SYN-REDIRECTION');
    expect(screen.queryByRole('button')).toBeNull();
    rerender(
      <Racine
        vue={{ ecran: 'APPLICATION' }}
        connexion={<p>connexion</p>}
        application={<p>app</p>}
      />,
    );
    expect(screen.getByText('app')).toBeTruthy();
  });

  it('UT-COMP-US-022-82 SectionCompte — exactement « Se déconnecter » puis « Supprimer les données de cet appareil » ; dossier SYN-FEUILLE-DOSSIER', async () => {
    const surAction = vi.fn();
    render(
      <SectionCompte
        vue={construireSectionCompte({ adresse: IDENTITE_A.adresse })}
        surAction={surAction}
      />,
    );

    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([
      'Se déconnecter',
      'Supprimer les données de cet appareil',
    ]);
    expect(screen.getByText(/Dossier « Done Juan »/).dataset['code']).toBe('SYN-FEUILLE-DOSSIER');
    await userEvent.click(screen.getByRole('button', { name: 'Se déconnecter' }));
    expect(surAction).toHaveBeenCalledWith('SE_DECONNECTER');
  });

  it('UT-COMP-US-022-83 DialogueConfirmation — role="alertdialog", « Annuler » focalisé, action destructrice en rouge', async () => {
    const surConfirmer = vi.fn();
    const surAnnuler = vi.fn();
    render(
      <DialogueConfirmation
        vue={construireConfirmationCompte({ code: 'CNF-SUPPR-DONNEES-PERTE', n: 2 })}
        surConfirmer={surConfirmer}
        surAnnuler={surAnnuler}
      />,
    );

    const dialogue = screen.getByRole('alertdialog', { name: '2 modifications seraient perdues' });
    expect(dialogue.dataset['code']).toBe('CNF-SUPPR-DONNEES-PERTE');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Annuler' }));
    const confirmer = screen.getByRole('button', { name: 'Supprimer quand même' });
    expect(confirmer.dataset['rouge']).toBe('true');
    await userEvent.click(confirmer);
    expect(surConfirmer).toHaveBeenCalledTimes(1);
    expect(surAnnuler).not.toHaveBeenCalled();
  });

  it('UT-COMP-US-022-84 SuppressionBloquee — ERR-017 en role="alert", focus sur « Réessayer », « Aller à la connexion »', async () => {
    const surAllerALaConnexion = vi.fn();
    const { rerender } = render(
      <SuppressionBloquee
        enCours={false}
        surReessayer={vi.fn()}
        surAllerALaConnexion={surAllerALaConnexion}
      />,
    );

    expect(screen.getByRole('alert').dataset['message']).toBe('ERR-017');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Réessayer' }));
    await userEvent.click(screen.getByRole('button', { name: 'Aller à la connexion' }));
    expect(surAllerALaConnexion).toHaveBeenCalledTimes(1);
    rerender(<SuppressionBloquee enCours surReessayer={vi.fn()} surAllerALaConnexion={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Suppression en cours…' })).toHaveProperty(
      'disabled',
      true,
    );
  });
});
