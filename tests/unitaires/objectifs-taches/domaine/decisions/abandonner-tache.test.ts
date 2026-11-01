import { describe, expect, it } from 'vitest';
import { echec, succes } from '@src/commun/domaine/resultat';
import {
  deciderAbandon,
  evaluerAbandon,
} from '@src/objectifs-taches/domaine/decisions/abandonner-tache';
import { construireVueMetier } from '@src/objectifs-taches/domaine/vue-metier';
import { abandonnee, etatMetier, terminee } from '@tests/support/fabriques/etat-metier';
import { contexteDecision } from '@tests/support/horloge';
import { creeAuRang } from '@tests/support/fabriques/resumes';
import { date, idEvenementTest, idOperation, idTache, instant } from '@tests/support/valeurs';

const t = (n: number) => idTache(n);
const MAINTENANT = '2026-10-21T08:00:00.000Z';
const contexte = contexteDecision(MAINTENANT, '2026-10-21');
const OP = idOperation(1);
const e = (rang: number) => idEvenementTest(OP, rang);

const abandon = (id: ReturnType<typeof t>, rang: number, cascade: boolean) => ({
  type: 'ECRIRE_TACHE',
  id,
  ecriture: {
    champ: 'cycleDeVie',
    valeur: {
      etat: 'ABANDONNEE',
      dateAbandon: date('2026-10-21'),
      instantAbandon: instant(MAINTENANT),
      evenementAbandon: e(rang),
      ...(cascade ? { abandonParCascade: e(0) } : {}),
    },
  },
  evenement: {
    type: 'ABANDON',
    element: { type: 'TACHE', id },
    avant: { etat: 'A_FAIRE' },
    apres: { etat: 'ABANDONNEE', dateAbandon: date('2026-10-21') },
    rang,
    ...(cascade ? { cause: 0 } : {}),
  },
});

const vueCascade = () =>
  construireVueMetier(
    etatMetier()
      .avecTache({ id: t(1), intitule: 'Chapitre 1' })
      .avecTache({ id: t(4), tacheParenteId: t(1), creeLe: creeAuRang(4) })
      .avecTache({ id: t(2), tacheParenteId: t(1), creeLe: creeAuRang(2) })
      .avecTache({
        id: t(3),
        tacheParenteId: t(1),
        creeLe: creeAuRang(3),
        cycleDeVie: terminee('2026-10-20'),
      })
      .avecTache({
        id: t(5),
        tacheParenteId: t(1),
        creeLe: creeAuRang(5),
        cycleDeVie: abandonnee('2026-10-19', 'avant:0'),
      })
      .construire(),
  );

describe('Abandon d’une tâche (RG-027)', () => {
  it('UT-US-025-01 evaluerAbandon — demande toujours une confirmation ; 0 sous-tâche pour une tâche simple (US-025 CA-1)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecTache({ id: t(1), intitule: 'Refaire le logo' })
        .construire(),
    );

    expect(evaluerAbandon({ tacheId: t(1) })(vue)).toEqual(
      succes({
        type: 'CONFIRMATION_REQUISE',
        confirmation: {
          type: 'ABANDON_TACHE',
          tacheId: t(1),
          intitule: 'Refaire le logo',
          sousTachesAbandonnees: 0,
          sousTachesTerminees: 0,
        },
      }),
    );
  });

  it('UT-US-025-02 evaluerAbandon — annonce les 2 sous-tâches à faire abandonnées avec la tâche (US-025 CA-6)', () => {
    expect(evaluerAbandon({ tacheId: t(1) })(vueCascade())).toEqual(
      succes({
        type: 'CONFIRMATION_REQUISE',
        confirmation: {
          type: 'ABANDON_TACHE',
          tacheId: t(1),
          intitule: 'Chapitre 1',
          sousTachesAbandonnees: 2,
          sousTachesTerminees: 1,
        },
      }),
    );
  });

  it('UT-US-025-03 evaluerAbandon — refuse ActionNonDisponible pour une tâche terminée (S06)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecTache({ id: t(1), cycleDeVie: terminee('2026-10-20') })
        .construire(),
    );

    expect(evaluerAbandon({ tacheId: t(1) })(vue)).toEqual(
      echec({ type: 'ActionNonDisponible', action: 'ABANDONNER' }),
    );
  });

  it('UT-US-025-04 deciderAbandon — écrit ABANDONNEE avec date et instant d’abandon, evenementAbandon = <operation>:0, et l’événement ABANDON (US-025 CA-1, CA-11)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecTache({ id: t(1) })
        .construire(),
    );

    expect(deciderAbandon({ tacheId: t(1) })(vue, contexte)).toEqual(
      succes({ modifications: [abandon(t(1), 0, false)], valeur: undefined }),
    );
  });

  it('UT-US-025-05 deciderAbandon — abandonne en cascade les sous-tâches à faire, par création croissante, avec abandonParCascade et cause 0 ; ni la terminée ni l’abandonnée avant (US-025 CA-6, S18)', () => {
    expect(deciderAbandon({ tacheId: t(1) })(vueCascade(), contexte)).toEqual(
      succes({
        modifications: [abandon(t(1), 0, false), abandon(t(2), 1, true), abandon(t(4), 2, true)],
        valeur: undefined,
      }),
    );
  });

  it('UT-US-025-06 deciderAbandon — une sous-tâche abandonnée seule : une écriture, sans abandonParCascade (US-025 CA-9)', () => {
    const vue = construireVueMetier(
      etatMetier()
        .avecTache({ id: t(1) })
        .avecTache({ id: t(2), tacheParenteId: t(1) })
        .construire(),
    );

    expect(deciderAbandon({ tacheId: t(2) })(vue, contexte)).toEqual(
      succes({ modifications: [abandon(t(2), 0, false)], valeur: undefined }),
    );
  });
});
