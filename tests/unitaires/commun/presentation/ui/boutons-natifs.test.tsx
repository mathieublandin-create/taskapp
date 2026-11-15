/**
 * ST-CORR-E13B-LOT-001 §4 (tranche T3) : DT-014, style commun des boutons natifs (guide v0.2.26 §4.1, §6.6.16 n° 2).
 * Classe `bouton-natif` sur tout `<button>` natif du compte et de la synchronisation ; variante par `data-variante`
 * (`principal`, `tertiaire`, `danger`), attribut absent pour la variante par défaut (`secondaire`). Pas de test de style
 * ici (conventions §11.12) : le rendu calculé est contrôlé par E2E-DT-014-01. Rang 14 (rangs-tests.json).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { construireEcranConnexion } from '@src/compte/presentation/modeles-de-vue/ecran-connexion';
import { construireSectionCompte } from '@src/compte/presentation/modeles-de-vue/section-compte';
import { EcranConnexion } from '@src/compte/presentation/ui/EcranConnexion';
import { SectionCompte } from '@src/compte/presentation/ui/SectionCompte';
import { SuppressionBloquee } from '@src/compte/presentation/ui/SuppressionBloquee';
import type { ModeleVueFeuilleSynchronisation } from '@src/synchronisation/presentation/modeles-de-vue/feuille-synchronisation';
import { Bandeau } from '@src/synchronisation/presentation/ui/Bandeau';
import { FeuilleSynchronisation } from '@src/synchronisation/presentation/ui/FeuilleSynchronisation';
import { IndicateurSynchronisation } from '@src/synchronisation/presentation/ui/IndicateurSynchronisation';
import { IDENTITE_A } from '@tests/support/compte/doublures-compte';

afterEach(cleanup);

const RACINE = join(import.meta.dirname, '..', '..', '..', '..', '..');

/** Classe et variante d'un bouton : `undefined` pour une variante absente (secondaire par défaut). */
const style = (bouton: HTMLElement) => ({
  natif: bouton.classList.contains('bouton-natif'),
  variante: bouton.dataset['variante'],
});

const FEUILLE: ModeleVueFeuilleSynchronisation = {
  attente: { code: 'SYN-FEUILLE-RIEN-EN-ATTENTE', libelle: 'Aucune modification en attente.' },
  bouton: { code: 'SYN-FEUILLE-BOUTON', libelle: 'Synchroniser maintenant', disponible: true },
  cartes: [
    {
      message: 'ERR-016',
      titre: 'La synchronisation n’a pas abouti',
      texte: 'Vos 2 modifications sont conservées sur cet appareil.',
      action: { type: 'REESSAYER_MAINTENANT', libelle: 'Réessayer maintenant' },
    },
    {
      message: 'ERR-013',
      titre: 'Données écrites par une version plus récente',
      texte: 'Consultation seule.',
      action: { type: 'METTRE_A_JOUR', libelle: 'Mettre à jour la carte' },
    },
  ],
  alerteVersion: {
    code: 'ALR-016',
    titre: 'Une nouvelle version est disponible',
    texte: 'Mettez à jour quand vous le souhaitez. Vos modifications sont conservées.',
    role: 'status',
    fermable: false,
    action: { type: 'METTRE_A_JOUR', libelle: 'Mettre à jour' },
  },
};

describe('DT-014 : boutons natifs du compte et de la synchronisation (guide §4.1)', () => {
  it('UT-DT-014-01 ECR-010 : « Continuer avec Google » est le bouton principal de l’écran', () => {
    render(
      <EcranConnexion vue={construireEcranConnexion({ enCours: false })} surAction={vi.fn()} />,
    );
    expect(style(screen.getByRole('button', { name: 'Continuer avec Google' }))).toEqual({
      natif: true,
      variante: 'principal',
    });
  });

  it('UT-DT-014-02 section « Compte » : « Se déconnecter » secondaire (sans attribut), « Supprimer les données de cet appareil » en danger', () => {
    render(
      <SectionCompte
        vue={construireSectionCompte({ adresse: IDENTITE_A.adresse })}
        surAction={vi.fn()}
      />,
    );
    const [deconnexion, suppression] = screen.getAllByRole('button');
    expect(deconnexion?.dataset['action']).toBe('SE_DECONNECTER');
    expect(suppression?.dataset['action']).toBe('SUPPRIMER_DONNEES');
    expect(deconnexion && style(deconnexion)).toEqual({ natif: true, variante: undefined });
    expect(suppression && style(suppression)).toEqual({ natif: true, variante: 'danger' });
  });

  it('UT-DT-014-03 feuille : « Synchroniser maintenant » et « Réessayer maintenant » secondaires ; « Mettre à jour » d’ALR-016 et d’ERR-013 principaux', () => {
    render(
      <FeuilleSynchronisation vue={FEUILLE} surSynchroniser={vi.fn()} surActionCarte={vi.fn()} />,
    );
    expect(style(screen.getByRole('button', { name: 'Synchroniser maintenant' }))).toEqual({
      natif: true,
      variante: undefined,
    });
    expect(style(screen.getByRole('button', { name: 'Réessayer maintenant' }))).toEqual({
      natif: true,
      variante: undefined,
    });
    expect(style(screen.getByRole('button', { name: 'Mettre à jour' }))).toEqual({
      natif: true,
      variante: 'principal',
    });
    expect(style(screen.getByRole('button', { name: 'Mettre à jour la carte' }))).toEqual({
      natif: true,
      variante: 'principal',
    });
  });

  it('UT-DT-014-04 bandeau : « Se reconnecter » principal ; « Masquer le rappel » tertiaire', () => {
    const { rerender } = render(
      <Bandeau
        appareil="smartphone"
        vue={{
          code: 'BAN-ACCES-GOOGLE',
          action: 'SE_RECONNECTER',
          fermable: false,
          bloquant: false,
          message: 'ERR-010',
        }}
        surAction={vi.fn()}
        surMasquer={vi.fn()}
      />,
    );
    expect(style(screen.getByRole('button', { name: 'Se reconnecter' }))).toEqual({
      natif: true,
      variante: 'principal',
    });
    rerender(
      <Bandeau
        appareil="smartphone"
        vue={{ code: 'BAN-RAPPEL-24H', n: 1, fermable: true, bloquant: false, message: 'ALR-002' }}
        surAction={vi.fn()}
        surMasquer={vi.fn()}
      />,
    );
    expect(style(screen.getByRole('button', { name: 'Masquer le rappel' }))).toEqual({
      natif: true,
      variante: 'tertiaire',
    });
  });

  it('UT-DT-014-05 ERR-017 : « Réessayer » principal, « Aller à la connexion » secondaire ; indicateur SYN-SESSION : « Reprendre la synchronisation » secondaire', () => {
    render(
      <>
        <SuppressionBloquee enCours={false} surReessayer={vi.fn()} surAllerALaConnexion={vi.fn()} />
        <IndicateurSynchronisation
          vue={{
            code: 'SYN-SESSION',
            action: 'REPRENDRE_LA_SYNCHRONISATION',
            messageFeuille: 'ERR-015',
          }}
          surReprendre={vi.fn()}
        />
      </>,
    );
    expect(style(screen.getByRole('button', { name: 'Réessayer' }))).toEqual({
      natif: true,
      variante: 'principal',
    });
    expect(style(screen.getByRole('button', { name: 'Aller à la connexion' }))).toEqual({
      natif: true,
      variante: undefined,
    });
    expect(style(screen.getByRole('button', { name: 'Reprendre la synchronisation' }))).toEqual({
      natif: true,
      variante: undefined,
    });
  });

  it('UT-DT-014-06 aucun <button> natif du compte ni de la synchronisation sans la classe : chaque balise porte className="bouton-natif" en littéral', () => {
    const dossiers = ['src/compte/presentation/ui', 'src/synchronisation/presentation/ui'];
    const ecarts = dossiers.flatMap((dossier) =>
      readdirSync(join(RACINE, dossier))
        .filter((nom) => nom.endsWith('.tsx'))
        .map((nom) => {
          const source = readFileSync(join(RACINE, dossier, nom), 'utf8');
          const boutons = source.match(/<button\b/g)?.length ?? 0;
          const avecClasse = source.match(/className="bouton-natif"/g)?.length ?? 0;
          return { fichier: `${dossier}/${nom}`, boutons, avecClasse };
        })
        .filter(({ boutons, avecClasse }) => boutons !== avecClasse),
    );
    expect(ecarts).toEqual([]);
  });
});
