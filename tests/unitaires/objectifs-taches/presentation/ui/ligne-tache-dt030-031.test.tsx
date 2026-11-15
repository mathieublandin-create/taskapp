/**
 * DT-030 (case « Rouvrir » du filtre « Terminées », intitulé barré dès le geste) et DT-031 (mention visible
 * MEN-INCOHERENCE sur la ligne). Tests complémentaires de Benjamin (UT-COMP-DT-030-nn, UT-COMP-DT-031-nn).
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IdTache } from '@src/commun/domaine/identifiants';
import { construireLigneTache } from '@src/objectifs-taches/presentation/modeles-de-vue/ligne-tache';
import { LigneTacheUi } from '@src/objectifs-taches/presentation/ui/composants/ligne-tache';
import { EspaceTaches } from '@src/objectifs-taches/presentation/ui/ecrans/espace-taches';
import { creerMagasinTaches } from '@src/objectifs-taches/presentation/ui/etat/magasin-taches';
import { abandonnee, terminee } from '@tests/support/fabriques/etat-metier';
import { resumeTache } from '@tests/support/fabriques/resumes';
import { valeurDe } from '@tests/support/environnement';
import { creerBancObjectifs, nettoyerDocument } from '@tests/support/ui-objectifs';
import { date, idTache } from '@tests/support/valeurs';

afterEach(nettoyerDocument);

const AUJOURDHUI = date('2026-10-21');
const ROUVRIR_REDIGER = 'Rouvrir « Rédiger »';

const ligneDe = (surcharge: Parameters<typeof resumeTache>[0]) =>
  construireLigneTache(resumeTache(surcharge), AUJOURDHUI);

describe('Modèle de vue — case « Rouvrir » (DT-030)', () => {
  it('UT-COMP-DT-030-01 une tâche terminée porte la case « Rouvrir », sans case « Terminer » ; une tâche abandonnée n’en porte aucune', () => {
    const terminees = ligneDe({
      id: idTache(1),
      intitule: 'Rédiger',
      cycleDeVie: terminee('2026-10-20'),
    });
    const abandonnees = ligneDe({
      id: idTache(2),
      intitule: 'Relire',
      cycleDeVie: abandonnee('2026-10-20', 'evt-1'),
    });

    expect(terminees.caseRouvrir).toEqual({ nomAccessible: ROUVRIR_REDIGER });
    expect(terminees.caseTerminer).toBeUndefined();
    expect(abandonnees.caseRouvrir).toBeUndefined();
    expect(abandonnees.caseTerminer).toBeUndefined();
  });
});

describe('LigneTacheUi — case « Rouvrir » et intitulé barré (DT-030)', () => {
  it('UT-COMP-DT-030-02 la case pleine « Rouvrir » est active et appelle surRouvrir ; l’intitulé est barré', async () => {
    const surRouvrir = vi.fn();
    const ligne = ligneDe({
      id: idTache(1),
      intitule: 'Rédiger',
      cycleDeVie: terminee('2026-10-20'),
    });
    render(
      <ul>
        <LigneTacheUi ligne={ligne} surOuvrir={vi.fn()} surRouvrir={surRouvrir} />
      </ul>,
    );

    const caseRouvrir = screen.getByRole<HTMLInputElement>('checkbox', { name: ROUVRIR_REDIGER });
    expect(caseRouvrir.checked).toBe(true);
    expect(caseRouvrir.disabled).toBe(false);
    expect(document.querySelector('.ligne-tache-intitule')?.getAttribute('data-barre')).toBe(
      'true',
    );
    await userEvent.click(caseRouvrir);
    expect(surRouvrir).toHaveBeenCalledWith(idTache(1));
  });

  it('UT-COMP-DT-030-03 sans surRouvrir (écran qui ne sait pas rouvrir), aucune case ; une tâche à faire n’a pas l’intitulé barré', () => {
    const terminees = ligneDe({
      id: idTache(1),
      intitule: 'Rédiger',
      cycleDeVie: terminee('2026-10-20'),
    });
    const aFaire = ligneDe({ id: idTache(2), intitule: 'Relire' });
    render(
      <ul>
        <LigneTacheUi ligne={terminees} surOuvrir={vi.fn()} />
        <LigneTacheUi ligne={aFaire} surOuvrir={vi.fn()} surTerminer={vi.fn()} />
      </ul>,
    );

    expect(screen.queryByRole('checkbox', { name: ROUVRIR_REDIGER })).toBeNull();
    const intitules = document.querySelectorAll('.ligne-tache-intitule');
    expect(intitules[1]?.hasAttribute('data-barre')).toBe(false);
  });

  it('UT-COMP-DT-030-04 une ligne tout juste terminée (retenue 3 s) a déjà son intitulé barré', () => {
    const ligne = ligneDe({ id: idTache(1), intitule: 'Rédiger' });
    render(
      <ul>
        <LigneTacheUi ligne={ligne} surOuvrir={vi.fn()} surTerminer={vi.fn()} retenue />
      </ul>,
    );

    expect(document.querySelector('.ligne-tache-intitule')?.getAttribute('data-barre')).toBe(
      'true',
    );
  });
});

describe('LigneTacheUi — mention MEN-INCOHERENCE (DT-031)', () => {
  it('UT-COMP-DT-031-01 la mention « Incohérence » est visible sur la ligne, avec son icône décorative ; absente sans incohérence', () => {
    const incoherente = ligneDe({
      id: idTache(1),
      intitule: 'Chapitre 1',
      cycleDeVie: terminee('2026-10-20'),
      incoherence: {
        etatParent: 'TERMINEE',
        sousTachesAFaire: [{ id: idTache(2), intitule: 'Section A' }],
      },
    });
    const saine = ligneDe({ id: idTache(3), intitule: 'Relire' });
    render(
      <ul>
        <LigneTacheUi ligne={incoherente} surOuvrir={vi.fn()} />
        <LigneTacheUi ligne={saine} surOuvrir={vi.fn()} />
      </ul>,
    );

    const mentions = document.querySelectorAll('[data-code="MEN-INCOHERENCE"]');
    expect(mentions).toHaveLength(1);
    expect(mentions[0]?.textContent).toContain('Incohérence');
    expect(mentions[0]?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });
});

describe('Espace des tâches — rouvrir depuis le filtre « Terminées » (DT-030)', () => {
  it('UT-COMP-DT-030-05 cocher « Rouvrir » rouvre la tâche, qui quitte le filtre « Terminées »', async () => {
    const banc = creerBancObjectifs();
    const id: IdTache = valeurDe(
      await banc.services.creerTache.executer({
        intitule: 'Rédiger',
        delai: date('2026-11-30'),
        estimationMinutes: 180,
        objectifIds: [],
      }),
    );
    valeurDe(await banc.services.terminerTache.executer({ tacheId: id }));
    const magasin = creerMagasinTaches(banc.services);
    await magasin.getState().actions.filtrerEtat('TERMINEE');
    render(<EspaceTaches magasin={magasin} />);

    await userEvent.click(await screen.findByRole('checkbox', { name: ROUVRIR_REDIGER }));

    await waitFor(() => {
      expect(screen.queryByRole('checkbox', { name: ROUVRIR_REDIGER })).toBeNull();
    });
    expect(
      valeurDe(await banc.services.consulterDetailTache.executer(id)).tache.cycleDeVie.etat,
    ).toBe('A_FAIRE');
  });
});
