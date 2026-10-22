import { describe, expect, it } from 'vitest';
import { CreerObjectif } from '@src/objectifs-taches/application/cas-usage/creer-objectif';
import { ModifierDelaiObjectif } from '@src/objectifs-taches/application/cas-usage/modifier-objectif';
import { SupprimerObjectif } from '@src/objectifs-taches/application/cas-usage/supprimer-objectif';
import { ConsulterHistorique } from '@src/objectifs-taches/application/requetes/consulter-historique';
import { creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { date, ecart, HEURE } from '@tests/support/valeurs';

describe('ConsulterHistorique (US-001 CA-11, RG-050)', () => {
  it('UT-US-001-27 ConsulterHistorique — présente création, délai modifié le lendemain et suppression le surlendemain, dans l’ordre, avec leurs journées de Paris', async () => {
    const env = creerEnvironnement('2026-10-21T08:00:00.000Z');
    const id = valeurDe(
      await new CreerObjectif(env.service, env.generateur).executer({
        intitule: 'Publier le guide',
        delai: date('2026-12-15'),
      }),
    );
    env.horloge.avancer(ecart(24 * HEURE));
    valeurDe(
      await new ModifierDelaiObjectif(env.service).executer({
        objectifId: id,
        delai: date('2027-01-31'),
      }),
    );
    env.horloge.avancer(ecart(24 * HEURE));
    valeurDe(await new SupprimerObjectif(env.service).executer({ objectifId: id }));

    const historique = valeurDe(
      await new ConsulterHistorique(env.service).executer({ type: 'OBJECTIF', id }),
    );

    expect(historique.map((e) => [e.type, e.jour])).toEqual([
      ['CREATION', '2026-10-21'],
      ['MODIFICATION_DELAI', '2026-10-22'],
      ['SUPPRESSION', '2026-10-23'],
    ]);
  });
});
