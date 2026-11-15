/**
 * ST-CORR-E13B-LOT-001 §7 (tranche T6) : ANO-004, cadre neutre de la vue `OUVERTURE` (guide v0.2.26 §6.2) : un `main`
 * vide, `aria-busy="true"`, sans texte, icône, animation, `data-etat` ni `data-action` (US-031 S14, S19 : « aucun écran
 * de Done Juan n'est affiché » ne doit pas le lire comme un écran). Rang 14 (rangs-tests.json).
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { ModeleVueRacine } from '@src/compte/presentation/modeles-de-vue/racine';
import { Racine } from '@src/compte/presentation/ui/Racine';

afterEach(cleanup);

const OUVERTURE = { ecran: 'OUVERTURE' } as unknown as ModeleVueRacine;

describe('Racine — cadre neutre (ANO-004)', () => {
  it('UT-ANO-004-02 OUVERTURE : main.cadre-ouverture vide, aria-busy, ni texte, ni bouton, ni data-etat, ni data-action ; ni la connexion ni l’application', () => {
    const { container } = render(
      <Racine vue={OUVERTURE} connexion={<p>connexion</p>} application={<p>application</p>} />,
    );
    const cadre = container.querySelector('main');
    expect(cadre).not.toBeNull();
    expect(cadre?.className).toBe('cadre-ouverture');
    expect(cadre?.getAttribute('aria-busy')).toBe('true');
    expect(cadre?.childElementCount).toBe(0);
    expect(container.textContent).toBe('');
    expect(container.querySelector('[data-etat], [data-action], .espace-application')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });
});
