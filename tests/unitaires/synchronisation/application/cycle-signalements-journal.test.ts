/**
 * Tranche B3 (ST-US-017 v0.7 §6.2, §6.3, §6.6 n° 9 e, §8 n° 11) : deux exigences du cycle posées par Starck.
 * - Condition C2 (DAT v0.11.8 §4.2, Q-BRU-2) : une réparation dont l'entrée du déplacement annulé est absente est
 *   journalisée en « erreur » par le cycle, une fois par entrée, après la transaction, sans donnée utilisateur.
 *   UT-US-017-109.
 * - Condition (1) de Q-ST017-STA-4 a (DAT v0.11.7 §4.2.1) : les signalements sont lus après l'état ; une lecture
 *   (« Compris ») écrite entre les deux lectures n'est jamais couverte par `deposeJusquA` sans figurer dans le fichier.
 *   UT-US-017-110.
 */
import { describe, expect, it } from 'vitest';
import type { IdAppareil, IdTache } from '@src/commun/domaine/identifiants';
import { MarquerCommeLue } from '@src/synchronisation/application/cas-usage/marquer-comme-lue';
import { CycleSynchronisation } from '@src/synchronisation/application/cycle-synchronisation';
import type { DepotLocal } from '@src/synchronisation/application/ports/depot-local';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import { idEvenementDeReparation } from '@src/synchronisation/domaine/entree-reparation';
import { decoderFichierAppareil } from '@src/synchronisation/infrastructure/drive/format-v1';
import { FauxDrive } from '@tests/doublures/faux-drive';
import { HorlogeSimulee } from '@tests/doublures/horloge-simulee';
import { PlanificateurSimule } from '@tests/doublures/planificateur-simule';
import { SourceAleatoireDeterministe } from '@tests/doublures/source-aleatoire-deterministe';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { JournalEnMemoire } from '@tests/support/compte/doublures-compte';
import { appliquerModifications, valeurDe } from '@tests/support/environnement';
import { creationTache } from '@tests/support/modifications';
import {
  AccesCommandable,
  creerAppareilCycle,
  ReseauCommandable,
  type AppareilCycle,
} from '@tests/support/synchronisation/appareil-cycle';
import {
  deplaceSous,
  h,
  objectifCree,
  parentObjectif,
} from '@tests/support/synchronisation/ecritures-concurrentes';
import {
  date,
  duree,
  ecart,
  idObjectif,
  idTache,
  instant,
  MINUTE,
  PC,
  SMARTPHONE,
} from '@tests/support/valeurs';

const DEPART = '2026-10-21T12:00:00.000Z';

const preparer = () => {
  const temps = new TempsSimule(instant(DEPART));
  const planificateur = new PlanificateurSimule(temps);
  const drive = new FauxDrive(temps);
  const appareil = (appareilId: IdAppareil, prefixe: string) =>
    creerAppareilCycle({ appareilId, prefixe, drive, temps, planificateur });
  /** Second cycle de l'appareil `a`, sur un dépôt (éventuellement instrumenté) qui partage sa base. */
  const cycleSur = (a: AppareilCycle, depot: DepotLocal) => {
    const reseau = new ReseauCommandable();
    const journal = new JournalEnMemoire();
    const cycle = new CycleSynchronisation({
      depot,
      transport: drive.transportPour(a.appareilId, { reseau, accesAccorde: () => true }),
      acces: new AccesCommandable(),
      reseau,
      planificateur,
      aleatoire: new SourceAleatoireDeterministe([500]),
      horloge: new HorlogeSimulee(temps),
      journal,
      versionApplication: '0.1.0',
    });
    return { cycle, journal };
  };
  return { temps, drive, appareil, cycleSur };
};

/** Contenu du fichier Drive (non supprimé) de l'appareil `appareil`. */
const fichierDe = async (drive: FauxDrive, appareil: IdAppareil) => {
  const contenus = await Promise.all(
    drive
      .fichiers()
      .filter((f) => !f.supprime && f.appProperties['donejuan'] === 'appareil')
      .map(async (f) => valeurDe(await decoderFichierAppareil(f.octets))),
  );
  return contenus.find((c) => c.appareil === appareil);
};

describe('Cycle de la tranche B3 : journalisation de C2 et ordre de lecture des signalements (ST-US-017 v0.7)', () => {
  it('UT-US-017-109 C2 : réparation sans entrée du déplacement annulé, une entrée « erreur » par déplacement, après la transaction, sans donnée utilisateur ; rien au cycle suivant', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    const alpha = idObjectif(1);
    const beta = idObjectif(2);
    // Fichier incohérent du PC : Alpha sous Bêta (h1) et Bêta sous Alpha (h2), registres sans entrée de journal.
    // La réparation annule le plus ancien déplacement (Alpha, h1) ; son entrée est absente : repli principal.
    const transportPc = env.drive.transportPour(PC, {
      reseau: new ReseauCommandable(),
      accesAccorde: () => true,
    });
    const dossier = valeurDe(await transportPc.preparerDossier());
    const contenu: ContenuFichierAppareil = {
      schemaVersion: 1,
      versionApplication: '0.1.0',
      generation: { type: 'INITIALE' },
      appareil: PC,
      registres: [
        ...objectifCree(alpha, 'Alpha confidentiel', h(0, PC)),
        ...objectifCree(beta, 'Bêta confidentiel', h(0, PC, 1)),
        parentObjectif(alpha, deplaceSous(beta, h(1, PC)), h(1, PC)),
        parentObjectif(beta, deplaceSous(alpha, h(2, PC)), h(2, PC)),
      ],
      journal: [],
    };
    valeurDe(await transportPc.deposerFichierAppareil({ dossier, contenu }));

    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');

    // La réparation a bien eu lieu (registres), donc la transaction a été validée.
    const objectifs = valeurDe(await smartphone.service.lire()).objectifs;
    expect(objectifs.get(alpha)?.parentIdEnregistre).toBeUndefined();
    expect(objectifs.get(beta)?.parentIdEnregistre).toBe(alpha);

    const erreurs = smartphone.journal.entrees.filter((e) => e.niveau === 'erreur');
    expect(erreurs).toEqual([
      {
        niveau: 'erreur',
        evenement: 'ReparationSansEntreeDeplacement',
        champs: { entree: idEvenementDeReparation(alpha, h(1, PC)) },
      },
    ]);
    // Aucune donnée utilisateur (intitulés) dans le journal technique (conventions §9.4).
    expect(JSON.stringify(smartphone.journal.entrees)).not.toContain('confidentiel');

    // Cycle suivant : hiérarchie valide, aucune annulation, aucune nouvelle erreur.
    env.temps.avancer(ecart(10 * MINUTE));
    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(smartphone.journal.entrees.filter((e) => e.niveau === 'erreur')).toHaveLength(1);
  });

  it('UT-US-017-110 condition (1) de Starck : une lecture écrite juste après la lecture des signalements par le cycle figure dans un fichier déposé, jamais couverte par deposeJusquA sans y être', async () => {
    const env = preparer();
    const smartphone = env.appareil(SMARTPHONE, '01');
    const pc = env.appareil(PC, '02');
    const t1: IdTache = idTache(1);
    const renommer = (a: AppareilCycle, intitule: string) =>
      appliquerModifications(a.service, () => [
        { type: 'ECRIRE_TACHE', id: t1, ecriture: { champ: 'intitule', valeur: intitule } },
      ]);
    const echanger = async () => {
      for (let tour = 0; tour < 3; tour += 1) {
        await smartphone.cycle.synchroniserMaintenant();
        await pc.cycle.synchroniserMaintenant();
      }
    };
    valeurDe(
      await appliquerModifications(pc.service, (_etat, contexte) => [
        creationTache(
          { id: t1, intitule: 'Plan', delai: date('2026-11-30'), estimation: duree(60) },
          contexte.instant,
        ),
      ]),
    );
    await echanger();
    // US-017 S10 : « A » sur le PC, puis « B » sur le smartphone : une valeur écartée sur les deux appareils.
    valeurDe(await renommer(pc, 'A'));
    env.temps.avancer(ecart(10 * MINUTE));
    valeurDe(await renommer(smartphone, 'B'));
    await echanger();
    const ids = [...valeurDe(await smartphone.depot.lireSignalements()).valeursEcartees.keys()];
    expect(ids).toHaveLength(1);

    // « Compris » écrit sur le smartphone juste après la première lecture des signalements par le cycle.
    const marquer = new MarquerCommeLue({
      depot: smartphone.depot,
      horloge: new HorlogeSimulee(env.temps),
    });
    let ecrite = false;
    const instrumente: DepotLocal = {
      lire: () => smartphone.depot.lire(),
      appliquer: (calcul) => smartphone.depot.appliquer(calcul),
      observer: (rappel) => smartphone.depot.observer(rappel),
      lireMeta: () => smartphone.depot.lireMeta(),
      appliquerSynchronisation: (calcul) => smartphone.depot.appliquerSynchronisation(calcul),
      lireSignalements: async () => {
        const lus = await smartphone.depot.lireSignalements();
        if (!ecrite) {
          ecrite = true;
          valeurDe(await marquer.executer(ids));
        }
        return lus;
      },
    };
    env.temps.avancer(ecart(10 * MINUTE));
    const { cycle } = env.cycleSur(smartphone, instrumente);
    expect(await cycle.synchroniserMaintenant()).toBe('TERMINE');
    expect(ecrite).toBe(true);

    // Lus avant l'état, les signalements omettraient la lecture alors que `deposeJusquA` la couvrirait : elle ne
    // serait plus jamais déposée. Lus après l'état, elle reste à déposer et part au cycle suivant.
    expect(await smartphone.cycle.synchroniserMaintenant()).toBe('TERMINE');
    const depose = await fichierDe(env.drive, SMARTPHONE);
    expect((depose?.lectures ?? []).map((l) => l.id)).toEqual(ids);
    await echanger();
    const lecturesPc = valeurDe(await pc.depot.lireSignalements()).lectures;
    expect([...lecturesPc.keys()]).toEqual(ids);
  });
});
