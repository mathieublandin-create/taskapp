import { describe, expect, it } from 'vitest';
import { PlacerObjectif } from '@src/objectifs-taches/application/cas-usage/placer-objectif';
import { ConsulterHistorique } from '@src/objectifs-taches/application/requetes/consulter-historique';
import { ConsulterObjectifs } from '@src/objectifs-taches/application/requetes/consulter-objectifs';
import { appliquerModifications, creerEnvironnement, valeurDe } from '@tests/support/environnement';
import { creationObjectif, creationTache } from '@tests/support/modifications';
import { date, duree, ecart, idObjectif, idTache, MINUTE } from '@tests/support/valeurs';

const O = idObjectif(1);
const P1 = idObjectif(2);
const P2 = idObjectif(3);

describe('PlacerObjectif (US-023 CA-5, CA-11)', () => {
  it('UT-US-023-17 PlacerObjectif — journalise CHANGEMENT_PARENT : avant = placement de création (origine CREATION, HLC de la création), après = origine DEPLACEMENT (RG-048, préparation)', async () => {
    const env = creerEnvironnement('2026-10-21T08:00:00.000Z');
    valeurDe(
      await appliquerModifications(env.service, (_, c) => [
        creationObjectif({ id: P1, intitule: 'Publier le guide' }, c.instant, 0),
        creationObjectif({ id: P2, intitule: 'Développer mon activité' }, c.instant, 1),
        creationObjectif({ id: O, intitule: 'Version imprimable', parentId: P1 }, c.instant, 2),
      ]),
    );
    env.horloge.avancer(ecart(MINUTE));

    valeurDe(await new PlacerObjectif(env.service).executer({ objectifId: O, parentId: P2 }));

    const historique = valeurDe(
      await new ConsulterHistorique(env.service).executer({ type: 'OBJECTIF', id: O }),
    );
    const [creation, deplacement] = historique;
    expect(historique.map((e) => e.type)).toEqual(['CREATION', 'CHANGEMENT_PARENT']);
    expect(deplacement).toMatchObject({
      type: 'CHANGEMENT_PARENT',
      avant: { parentId: P1, origine: 'CREATION', hlcOrigine: creation?.hlc },
      apres: { parentId: P2, origine: 'DEPLACEMENT', hlcOrigine: deplacement?.hlc },
    });
  });

  it('UT-US-023-18 PlacerObjectif puis ConsulterObjectifs — l’ancien parent sans autre contenu devient « à décliner », le nouveau « en cours » (S07, US-023 CA-5)', async () => {
    const env = creerEnvironnement('2026-10-21T08:00:00.000Z');
    valeurDe(
      await appliquerModifications(env.service, (_, c) => [
        creationObjectif({ id: P1, intitule: 'Ancien parent' }, c.instant, 0),
        creationObjectif({ id: P2, intitule: 'Nouveau parent' }, c.instant, 1),
        creationObjectif({ id: O, intitule: 'Sous-objectif', parentId: P1 }, c.instant, 2),
        creationTache(
          {
            id: idTache(1),
            intitule: 'Tâche',
            delai: date('2026-11-30'),
            estimation: duree(60),
            objectifIds: [O],
          },
          c.instant,
          3,
        ),
      ]),
    );

    valeurDe(await new PlacerObjectif(env.service).executer({ objectifId: O, parentId: P2 }));

    const { objectifs } = valeurDe(
      await new ConsulterObjectifs(env.service, env.horloge).executer(),
    );
    const etat = (id: typeof O) => objectifs.find((o) => o.id === id)?.etat;
    expect(etat(P1)).toBe('A_DECLINER');
    expect(etat(P2)).toBe('EN_COURS');
  });
});
