import { describe, expect, it } from 'vitest';
import { ConsulterTaches } from '@src/objectifs-taches/application/requetes/consulter-taches';
import { appliquerModifications, creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { creationTache } from '@tests/support/modifications';
import { date, duree, idTache, instant, UTC } from '@tests/support/valeurs';

describe('ConsulterTaches (RG-045, RG-053)', () => {
  it('UT-US-002-30 ConsulterTaches — appareil en UTC : une tâche de délai 2026-10-25 n’est pas en retard à 22:30 et l’est à 23:30 (jour de Paris)', async () => {
    const env = creerEnvironnement('2026-10-25T22:30:00.000Z');
    env.horloge.reglerFuseauAppareil(UTC);
    valeurDe(
      await appliquerModifications(env.service, (_, c) => [
        creationTache(
          {
            id: idTache(1),
            intitule: 'Payer la facture',
            delai: date('2026-10-25'),
            estimation: duree(30),
          },
          c.instant,
        ),
      ]),
    );
    const consulter = new ConsulterTaches(env.service, env.horloge);

    const a2230 = valeurDe(await consulter.executer());
    env.horloge.positionner(instant('2026-10-25T23:30:00.000Z'));
    const a2330 = valeurDe(await consulter.executer());

    expect(a2230.taches.map((t) => t.enRetard)).toEqual([false]);
    expect(a2330.taches.map((t) => t.enRetard)).toEqual([true]);
  });
});
