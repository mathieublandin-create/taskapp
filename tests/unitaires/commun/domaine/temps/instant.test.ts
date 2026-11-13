import { describe, expect, it } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { IdAppareil, IdObjectif, IdOperation, IdTache } from '@src/commun/domaine/identifiants';
import { echec, succes } from '@src/commun/domaine/resultat';
import { DateCalendaire } from '@src/commun/domaine/temps/date-calendaire';
import { Instant } from '@src/commun/domaine/temps/instant';
import { Duree } from '@src/commun/domaine/duree';
import { duree, ecart, instant, uuid } from '@tests/support/valeurs';

describe('Instant (conventions.md §7.1)', () => {
  it('UT-COMP-04 Instant.enIso et depuisIso — aller-retour à la milliseconde', () => {
    const i = instant('2026-10-21T08:00:00.123Z');

    expect(Instant.enIso(i)).toBe('2026-10-21T08:00:00.123Z');
    expect(Instant.depuisIso('2026-10-21T08:00:00.123Z')).toEqual(succes(i));
  });

  it.each(['', '2026-10-21', '2026-10-21T08:00:00Z', '2026-13-01T08:00:00.000Z', 'hier'])(
    'UT-COMP-05 Instant.depuisIso — refuse « %s »',
    (texte) => {
      expect(Instant.depuisIso(texte)).toEqual(echec({ type: 'InstantInvalide' }));
    },
  );

  it('UT-COMP-06 Instant.depuisMillisecondes — refuse une valeur non entière ou non finie', () => {
    expect(() => Instant.depuisMillisecondes(1.5)).toThrow(ErreurProgrammation);
    expect(() => Instant.depuisMillisecondes(Number.NaN)).toThrow(ErreurProgrammation);
    expect(Instant.depuisMillisecondes(1_000)).toBe(1_000);
  });

  it('UT-COMP-07 Instant.decaler — ajoute un écart signé', () => {
    const i = instant('2026-10-21T08:00:00.000Z');

    expect(Instant.decaler(i, ecart(60_000))).toBe(instant('2026-10-21T08:01:00.000Z'));
    expect(Instant.decaler(i, ecart(-60_000))).toBe(instant('2026-10-21T07:59:00.000Z'));
  });
});

describe('Identifiants, Duree et DateCalendaire (compléments)', () => {
  it('UT-COMP-08 identifiants — acceptent un UUID et refusent toute autre forme (DS-08)', () => {
    const valide = uuid(1);

    expect(IdObjectif.depuisUuid(valide)).toBe(valide);
    expect(IdTache.depuisUuid(valide)).toBe(valide);
    expect(IdAppareil.depuisUuid(valide)).toBe(valide);
    expect(IdOperation.depuisUuid(valide)).toBe(valide);
    expect(() => IdObjectif.depuisUuid('pas-un-uuid')).toThrow(ErreurProgrammation);
    expect(() => IdOperation.depuisUuid('')).toThrow(ErreurProgrammation);
  });

  it('UT-COMP-09 Duree — zéro et addition', () => {
    expect(Duree.zero()).toBe(0);
    expect(Duree.additionner(duree(30), duree(90))).toBe(120);
  });

  it('UT-COMP-10 DateCalendaire.ajouterJours — refuse une date invalide', () => {
    expect(() => DateCalendaire.ajouterJours('2026-02-30' as DateCalendaire, 1)).toThrow(
      ErreurProgrammation,
    );
  });
});
