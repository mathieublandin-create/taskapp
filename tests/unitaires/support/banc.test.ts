import { describe, expect, it } from 'vitest';
import { GenerateurIdentifiantsSequentiel } from '@tests/doublures/generateur-identifiants-sequentiel';
import { HorlogeSimulee } from '@tests/doublures/horloge-simulee';
import { JournalTechniqueMemoire } from '@tests/doublures/journal-technique-memoire';
import { PlanificateurSimule } from '@tests/doublures/planificateur-simule';
import { ReseauSimule } from '@tests/doublures/reseau-simule';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { ecart, fuseau, instant, MINUTE } from '@tests/support/valeurs';

const DEPART = '2026-10-21T08:00:00.000Z';

describe('Doublures du socle (conventions.md §11.10, §11.11)', () => {
  it('UT-COMP-30 TempsSimule et HorlogeSimulee — temps du banc, dérèglement, saut mural et monotone', () => {
    const temps = new TempsSimule(instant(DEPART));
    const horloge = new HorlogeSimulee(temps);

    horloge.avancer(ecart(MINUTE));
    horloge.dereglerDe(ecart(5 * MINUTE));
    horloge.changerHeureMurale(ecart(-2 * MINUTE));

    expect(horloge.maintenant()).toBe(instant('2026-10-21T08:04:00.000Z'));
    expect(horloge.monotone()).toBe(MINUTE);
    horloge.redemarrer();
    expect(horloge.monotone()).toBe(0);
    horloge.positionner(instant('2026-10-22T00:00:00.000Z'));
    expect(temps.maintenant()).toBe(instant('2026-10-22T00:00:00.000Z'));
    horloge.reglerFuseauAppareil(fuseau('America/New_York'));
    expect(horloge.fuseauAppareil()).toBe('America/New_York');
    expect(() => {
      temps.avancer(ecart(-1));
    }).toThrow(RangeError);
  });

  it('UT-COMP-31 GenerateurIdentifiantsSequentiel — UUID prévisibles avec préfixe d’appareil', () => {
    const smartphone = new GenerateurIdentifiantsSequentiel();
    const pc = new GenerateurIdentifiantsSequentiel('a1');

    expect(smartphone.genererUuidV7()).toBe('00000000-0000-7000-8000-000000000001');
    expect(smartphone.genererUuidV7()).toBe('00000000-0000-7000-8000-000000000002');
    expect(pc.genererUuidV7()).toBe('00000000-0000-7000-80a1-000000000001');
  });

  it('UT-COMP-32 PlanificateurSimule — exécute les échéances dans l’ordre, répète, annule et note les attentes', () => {
    const temps = new TempsSimule(instant(DEPART));
    const planificateur = new PlanificateurSimule(temps);
    const appels: Array<string> = [];
    planificateur.apres(ecart(2000), () => appels.push('b'));
    planificateur.apres(ecart(1000), () => appels.push('a'));
    planificateur.apres(ecart(1000), () => appels.push('a2'));
    const arreter = planificateur.periodiquement(ecart(500), () => appels.push('p'));
    planificateur.apres(ecart(10), () => appels.push('annulee'))();

    temps.avancer(ecart(1000));
    planificateur.executerEchus();
    arreter();
    temps.avancer(ecart(1000));
    planificateur.executerEchus();

    expect(appels).toEqual(['p', 'a', 'a2', 'p', 'b']);
  });

  it('UT-COMP-33 PlanificateurSimule.executerJusquAuReglement — avance le temps jusqu’à la fin d’une attente', async () => {
    const temps = new TempsSimule(instant(DEPART));
    const planificateur = new PlanificateurSimule(temps);

    const valeur = await planificateur.executerJusquAuReglement(
      planificateur.attendre(ecart(3000)).then(() => 'fini'),
    );

    expect(valeur).toBe('fini');
    expect(planificateur.attentesDemandees()).toEqual([3000]);
    expect(temps.maintenant()).toBe(instant('2026-10-21T08:00:03.000Z'));
  });

  it('UT-COMP-34 PlanificateurSimule.executerJusquAuReglement — propage le rejet et échoue si rien ne règle la promesse', async () => {
    const planificateur = new PlanificateurSimule(new TempsSimule(instant(DEPART)));

    await expect(
      planificateur.executerJusquAuReglement(Promise.reject(new Error('rejet'))),
    ).rejects.toThrow('rejet');
    await expect(
      planificateur.executerJusquAuReglement(new Promise(() => undefined)),
    ).rejects.toThrow(/non réglée/);
  });

  it('UT-COMP-35 ReseauSimule — prévient une seule fois par changement et jusqu’au désabonnement', () => {
    const reseau = new ReseauSimule();
    const vus: Array<boolean> = [];
    const annuler = reseau.surChangement((connecte) => vus.push(connecte));

    reseau.couper();
    reseau.couper();
    reseau.retablir();
    annuler();
    reseau.couper();

    expect(vus).toEqual([false, true]);
    expect(reseau.estConnecte()).toBe(false);
  });

  it('UT-COMP-36 JournalTechniqueMemoire — retient les entrées et signale les erreurs non attendues', () => {
    const journal = new JournalTechniqueMemoire();
    journal.consigner({ niveau: 'info', evenement: 'a' });
    journal.consigner({ niveau: 'erreur', evenement: 'attendue' });
    journal.consigner({ niveau: 'erreur', evenement: 'panne' });
    journal.attendreErreur('attendue');

    expect(journal.entrees()).toHaveLength(3);
    expect(journal.erreursInattendues().map((e) => e.evenement)).toEqual(['panne']);
  });
});
