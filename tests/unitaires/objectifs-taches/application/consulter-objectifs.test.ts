import { describe, expect, it } from 'vitest';
import { ConsulterObjectifs } from '@src/objectifs-taches/application/requetes/consulter-objectifs';
import { appliquerModifications, creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import { date, idObjectif, instant, NEW_YORK } from '@tests/support/valeurs';

const O = idObjectif(1);

describe('ConsulterObjectifs (RG-045, RG-053)', () => {
  it('UT-US-001-26 ConsulterObjectifs — à New York, un objectif de délai 2026-11-10 est en retard à 18:00 et pas à 17:59 (jour de Paris)', async () => {
    const env = creerEnvironnement('2026-11-10T22:59:00.000Z');
    env.horloge.reglerFuseauAppareil(NEW_YORK);
    valeurDe(
      await appliquerModifications(env.service, (_, c) => [
        creationObjectif(
          { id: O, intitule: 'Publier le guide', delai: date('2026-11-10') },
          c.instant,
        ),
      ]),
    );
    const consulter = new ConsulterObjectifs(env.service, env.horloge);

    const a1759 = valeurDe(await consulter.executer());
    env.horloge.positionner(instant('2026-11-10T23:00:00.000Z'));
    const a1800 = valeurDe(await consulter.executer());

    expect(a1759.objectifs.map((o) => o.enRetard)).toEqual([false]);
    expect(a1800.objectifs.map((o) => o.enRetard)).toEqual([true]);
  });
});
