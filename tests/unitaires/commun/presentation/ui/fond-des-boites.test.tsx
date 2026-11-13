/**
 * DT-024 : le fond non cliquable (`IonBackdrop tappable={false}`) des boîtes de confirmation et du sélecteur de parent.
 * Un clic sur le fond ne ferme pas la boîte et ne déclenche ni confirmation ni annulation (guide §6.6.7).
 * L'empilement réel (boutons au-dessus du fond, ANO-007) est vérifié en navigateur : tests/e2e/boites-confirmation.e2e.ts.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BoiteConfirmation } from '@src/commun/presentation/ui/boite-confirmation';
import { construireSelecteurParent } from '@src/objectifs-taches';
import { SelecteurParent } from '@src/objectifs-taches/presentation/ui/composants/selecteur-parent';
import { resumeObjectif } from '@tests/support/fabriques/resumes';
import { date, idObjectif } from '@tests/support/valeurs';

afterEach(cleanup);

const fond = (): Element => {
  const element = document.querySelector('.scrim > ion-backdrop');
  if (element === null) throw new Error('Fond de la boîte absent');
  return element;
};

describe('Fond des boîtes (DT-024, guide §6.6.7)', () => {
  it('UT-COMP-DT-024-01 BoiteConfirmation — un clic sur le fond laisse la boîte ouverte, sans surConfirmer ni surAnnuler', () => {
    const surConfirmer = vi.fn();
    const surAnnuler = vi.fn();
    render(
      <BoiteConfirmation
        code="CNF-SUPPR-OBJECTIF"
        titre="Supprimer « Guide » ?"
        actionLibelle="Supprimer"
        rouge
        surConfirmer={surConfirmer}
        surAnnuler={surAnnuler}
      />,
    );

    fireEvent.click(fond());

    expect(surConfirmer).not.toHaveBeenCalled();
    expect(surAnnuler).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog')).toBeTruthy();
  });

  it('UT-COMP-DT-024-02 SelecteurParent — un clic sur le fond laisse le sélecteur ouvert, sans surChoisir ni surFermer', () => {
    const surChoisir = vi.fn();
    const surFermer = vi.fn();
    const objectif = resumeObjectif({ id: idObjectif(1), intitule: 'Publier le guide' });
    render(
      <SelecteurParent
        modele={construireSelecteurParent({
          objectif,
          candidats: [{ ...objectif, autresSousObjectifs: 0 }],
          nombreSousObjectifs: 0,
          jour: date('2026-10-21'),
        })}
        surRefusCompris={vi.fn()}
        surChoisir={surChoisir}
        surFermer={surFermer}
      />,
    );

    fireEvent.click(fond());

    expect(surChoisir).not.toHaveBeenCalled();
    expect(surFermer).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
