/**
 * ST-CORR-E13B-LOT-001 §6.1 (tranche T4) : ANO-005, le « + » est rond, 56 px, **sans étiquette visible** ; son nom
 * accessible est le libellé de l'action, repris par `title` (guide v0.2.26 §2.2, §4.1, §6.6.16 n° 5). Taille et
 * position : E2E-ANO-005-FAB-01 à 05. Rang 14 (rangs-tests.json).
 */
import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BoutonFlottant } from '@src/commun/presentation/ui/bouton-flottant';

afterEach(cleanup);

describe('BoutonFlottant — rond, sans étiquette (ANO-005)', () => {
  it('UT-ANO-005-FAB-01 aucune étiquette ; le bouton porte nom accessible et title ; son seul texte est « + » ; un clic appelle surClic une fois', async () => {
    const surClic = vi.fn();
    const { container } = render(<BoutonFlottant libelle="Ajouter une tâche" surClic={surClic} />);
    expect(container.querySelector('.bouton-flottant-etiquette')).toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    const bouton = container.querySelector('ion-fab-button');
    expect(bouton?.getAttribute('aria-label')).toBe('Ajouter une tâche');
    expect(bouton?.getAttribute('title')).toBe('Ajouter une tâche');
    expect(container.querySelector('ion-fab')?.textContent.trim()).toBe('+');
    if (bouton === null) throw new Error('ion-fab-button absent');
    await userEvent.click(bouton);
    expect(surClic).toHaveBeenCalledTimes(1);
  });
});
