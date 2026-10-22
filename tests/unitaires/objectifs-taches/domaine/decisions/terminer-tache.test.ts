import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import { deciderFinTache } from '@src/objectifs-taches/domaine/decisions/terminer-tache';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { abandonnee, etatMetier, terminee } from '@tests/support/fabriques/etat-metier';
import { contexteDecision } from '@tests/support/horloge';
import { date, idTache, instant } from '@tests/support/valeurs';

const t = (n: number) => idTache(n);
const MAINTENANT = '2026-10-24T22:30:00.000Z';
const contexte = contexteDecision(MAINTENANT, '2026-10-25');
const fin = (id: ReturnType<typeof t>) => ({
  type: 'ECRIRE_TACHE',
  id,
  ecriture: {
    champ: 'cycleDeVie',
    valeur: { etat: 'TERMINEE', dateFin: date('2026-10-25'), instantFin: instant(MAINTENANT) },
  },
  evenement: {
    type: 'FIN',
    element: { type: 'TACHE', id },
    avant: { etat: 'A_FAIRE' },
    apres: { etat: 'TERMINEE', dateFin: date('2026-10-25') },
    rang: 0,
  },
});

describe('deciderFinTache (RG-026, RG-023)', () => {
  it('UT-US-003-01 deciderFinTache — termine une tâche à faire : date de fin = jour de Paris, instant de fin = instant, événement FIN (US-003 CA-1, CA-13)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecTache({ id: t(1) })
        .construire(),
    );

    expect(deciderFinTache({ tacheId: t(1) })(vue, contexte)).toEqual(
      succes({ modifications: [fin(t(1))], valeur: undefined }),
    );
  });

  it('UT-US-003-02 deciderFinTache — refuse ActionNonDisponible pour une tâche déjà terminée ou abandonnée (S05)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecTache({ id: t(1), cycleDeVie: terminee('2026-10-20') })
        .avecTache({ id: t(2), cycleDeVie: abandonnee('2026-10-20', 'op:0') })
        .construire(),
    );

    expect(deciderFinTache({ tacheId: t(1) })(vue, contexte)).toEqual(
      echec({ type: 'ActionNonDisponible', action: 'TERMINER' }),
    );
    expect(deciderFinTache({ tacheId: t(2) })(vue, contexte)).toEqual(
      echec({ type: 'ActionNonDisponible', action: 'TERMINER' }),
    );
  });

  it('UT-US-003-03 deciderFinTache — refuse SousTachesRestantes(2) pour une tâche parente qui a 1 sous-tâche terminée, 2 à faire et 1 abandonnée (US-003 CA-8)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecTache({ id: t(1) })
        .avecTache({ id: t(2), tacheParenteId: t(1), cycleDeVie: terminee('2026-10-20') })
        .avecTache({ id: t(3), tacheParenteId: t(1) })
        .avecTache({ id: t(4), tacheParenteId: t(1) })
        .avecTache({ id: t(5), tacheParenteId: t(1), cycleDeVie: abandonnee('2026-10-20', 'op:0') })
        .construire(),
    );

    expect(deciderFinTache({ tacheId: t(1) })(vue, contexte)).toEqual(
      echec({ type: 'SousTachesRestantes', nombre: 2 }),
    );
  });

  it('UT-US-003-04 deciderFinTache — accepte la fin quand les sous-tâches sont terminées ou abandonnées ; terminer la dernière sous-tâche n’écrit rien sur la tâche parente (US-003 CA-2)', () => {
    const vueFinie = construireVueMetier(
      etatMetier()
        .avecTache({ id: t(1) })
        .avecTache({ id: t(2), tacheParenteId: t(1), cycleDeVie: terminee('2026-10-20') })
        .avecTache({ id: t(3), tacheParenteId: t(1), cycleDeVie: abandonnee('2026-10-20', 'op:0') })
        .construire(),
    );
    const vueDerniere = construireVueMetier(
      etatMetier()
        .avecTache({ id: t(1) })
        .avecTache({ id: t(2), tacheParenteId: t(1), cycleDeVie: terminee('2026-10-20') })
        .avecTache({ id: t(3), tacheParenteId: t(1) })
        .construire(),
    );

    expect(deciderFinTache({ tacheId: t(1) })(vueFinie, contexte)).toEqual(
      succes({ modifications: [fin(t(1))], valeur: undefined }),
    );
    expect(deciderFinTache({ tacheId: t(3) })(vueDerniere, contexte)).toEqual(
      succes({ modifications: [fin(t(3))], valeur: undefined }),
    );
  });
});
