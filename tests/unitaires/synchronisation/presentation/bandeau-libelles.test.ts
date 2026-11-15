import { describe, expect, it } from 'vitest';
import {
  libellesBandeau,
  type ModeleVueBandeau,
} from '@src/synchronisation/presentation/modeles-de-vue/bandeau';

// DT-010 (dette-technique.md) : branches de `libellesBandeau` (variante explicite, « avec-attente », sans variante).
// Textes du catalogue (guide §6.6.3), aucun changement de src/.

const TEXTE_CONSULTATION =
  'Une version plus récente de l’application a enregistré vos données. Mettez à jour l’application pour les modifier.';

describe('libellesBandeau (guide §6.6.3 ; DT-010)', () => {
  it('UT-COMP-US-022-207 libellesBandeau — variante explicite du modèle : BAN-ACCES-GOOGLE 24H (sans fermeture) et BAN-RAPPEL-24H session (action et fermeture)', () => {
    const acces: ModeleVueBandeau = {
      code: 'BAN-ACCES-GOOGLE',
      variante: '24H',
      n: 2,
      action: 'SE_RECONNECTER',
      fermable: false,
      bloquant: false,
      message: 'ERR-010',
    };
    const rappelSession: ModeleVueBandeau = {
      code: 'BAN-RAPPEL-24H',
      variante: 'session',
      n: 1,
      action: 'REPRENDRE_LA_SYNCHRONISATION',
      fermable: true,
      bloquant: false,
      message: 'ALR-002',
    };

    expect(libellesBandeau(acces, 'smartphone')).toEqual({
      titre: 'Accès Google perdu',
      texte:
        'Reconnectez votre compte pour reprendre la synchronisation. Vos données sont conservées. 2 modifications ne sont encore que sur ce smartphone.',
      action: 'Se reconnecter',
    });
    expect(libellesBandeau(rappelSession, 'PC')).toEqual({
      titre: 'Modifications en attente depuis plus de 24 h',
      texte:
        '1 modification n’est encore que sur ce PC. Reprenez la synchronisation pour les enregistrer dans votre Google Drive.',
      action: 'Reprendre la synchronisation',
      fermeture: 'Masquer le rappel',
    });
  });

  it('UT-COMP-US-022-208 libellesBandeau — sans variante du modèle : BAN-CONSULTATION-SEULE « avec-attente » déduite de n, texte de base sans n ; BAN-RAPPEL-24H sans action', () => {
    const base: ModeleVueBandeau = {
      code: 'BAN-CONSULTATION-SEULE',
      action: 'METTRE_A_JOUR',
      fermable: false,
      bloquant: false,
      message: 'ERR-013',
    };

    expect(libellesBandeau({ ...base, n: 3 }, 'PC')).toEqual({
      titre: 'Consultation seule',
      texte: `${TEXTE_CONSULTATION} Vos 3 modifications en attente sont conservées.`,
      action: 'Mettre à jour',
    });
    expect(libellesBandeau(base, 'PC')).toEqual({
      titre: 'Consultation seule',
      texte: TEXTE_CONSULTATION,
      action: 'Mettre à jour',
    });
    expect(
      libellesBandeau(
        { code: 'BAN-RAPPEL-24H', n: 2, fermable: true, bloquant: false, message: 'ALR-002' },
        'smartphone',
      ),
    ).toEqual({
      titre: 'Modifications en attente depuis plus de 24 h',
      texte:
        '2 modifications ne sont encore que sur ce smartphone. Elles seront enregistrées dans votre Google Drive dès que la synchronisation reprendra.',
      fermeture: 'Masquer le rappel',
    });
  });
});
