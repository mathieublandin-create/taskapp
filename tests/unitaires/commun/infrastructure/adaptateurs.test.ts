import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { FUSEAU_REFERENCE } from '@src/commun/domaine/temps/fuseau-reference';
import { EtatReseauNavigateur } from '@src/commun/infrastructure/etat-reseau-navigateur';
import { GenerateurUuidV7 } from '@src/commun/infrastructure/generateur-uuid-v7';
import { HorlogeSysteme } from '@src/commun/infrastructure/horloge-systeme';
import { JournalTechniqueLocal, MASQUE } from '@src/commun/infrastructure/journal-technique-local';
import { PlanificateurNavigateur } from '@src/commun/infrastructure/planificateur-navigateur';
import { SourceAleatoireCrypto } from '@src/commun/infrastructure/source-aleatoire-crypto';
import { IdObjectif } from '@src/commun/domaine/identifiants';
import type { EntreeJournalTechnique } from '@src/commun/application/ports/journal-technique';
import { ecart } from '@tests/support/valeurs';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Adaptateurs transverses du socle (ST-US-022 §4.4)', () => {
  it('UT-COMP-20 HorlogeSysteme — lit l’heure, l’horloge monotone et le fuseau du système', () => {
    vi.useFakeTimers({ now: new Date('2026-10-21T08:00:00.000Z') });
    const horloge = new HorlogeSysteme();

    expect(horloge.maintenant()).toBe(Date.parse('2026-10-21T08:00:00.000Z'));
    expect(horloge.monotone()).toBeGreaterThanOrEqual(0);
    expect(horloge.fuseauAppareil()).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
    expect(horloge.fuseauReference).toBe(FUSEAU_REFERENCE);
  });

  it('UT-COMP-21 GenerateurUuidV7 — produit des UUID v7 valides et distincts', () => {
    const generateur = new GenerateurUuidV7();

    const premier = generateur.genererUuidV7();
    const second = generateur.genererUuidV7();

    expect(premier).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(second).not.toBe(premier);
    expect(IdObjectif.depuisUuid(premier)).toBe(premier);
  });

  it('UT-COMP-22 PlanificateurNavigateur — programme, répète, annule et attend', async () => {
    vi.useFakeTimers();
    const planificateur = new PlanificateurNavigateur();
    const appels: Array<string> = [];

    planificateur.apres(ecart(100), () => appels.push('apres'));
    const arreter = planificateur.periodiquement(ecart(50), () => appels.push('periode'));
    const annulee = planificateur.apres(ecart(10), () => appels.push('annulee'));
    annulee();
    await vi.advanceTimersByTimeAsync(120);
    arreter();
    await vi.advanceTimersByTimeAsync(200);
    const attente = planificateur.attendre(ecart(30));
    await vi.advanceTimersByTimeAsync(30);
    await attente;

    expect(appels).toEqual(['periode', 'apres', 'periode']);
  });

  it('UT-COMP-23 SourceAleatoireCrypto — octets de la taille demandée, entiers dans l’intervalle, intervalle invalide refusé', () => {
    const source = new SourceAleatoireCrypto();

    expect(source.octets(16)).toHaveLength(16);
    const tirages = Array.from({ length: 200 }, () => source.entierEntre(3, 5));
    expect(new Set(tirages)).toEqual(new Set([3, 4, 5]));
    expect(source.entierEntre(7, 7)).toBe(7);
    expect(() => source.entierEntre(5, 3)).toThrow(ErreurProgrammation);
    expect(() => source.entierEntre(0, 2 ** 33)).toThrow(ErreurProgrammation);
  });

  it('UT-COMP-24 EtatReseauNavigateur — lit navigator.onLine et relaie online / offline jusqu’à l’annulation', () => {
    const abonnes = new Map<string, () => void>();
    vi.stubGlobal('navigator', { onLine: true });
    vi.stubGlobal('window', {
      addEventListener: (nom: string, rappel: () => void) => abonnes.set(nom, rappel),
      removeEventListener: (nom: string) => abonnes.delete(nom),
    });
    const reseau = new EtatReseauNavigateur();
    const vus: Array<boolean> = [];

    const annuler = reseau.surChangement((connecte) => vus.push(connecte));
    abonnes.get('offline')?.();
    abonnes.get('online')?.();
    annuler();

    expect(reseau.estConnecte()).toBe(true);
    expect(vus).toEqual([false, true]);
    expect(abonnes.size).toBe(0);
  });

  it('UT-COMP-25 JournalTechniqueLocal — masque chaque champ texte avant écriture et laisse les nombres', () => {
    const ecrites: Array<EntreeJournalTechnique> = [];
    const journal = new JournalTechniqueLocal((entree) => ecrites.push(entree));

    journal.consigner({
      niveau: 'erreur',
      evenement: 'connexion pour a@exemple.test',
      champs: { detail: 'Bearer abc.def', duree: 412, ok: true },
    });
    journal.consigner({ niveau: 'info', evenement: 'demarrage' });

    expect(ecrites).toEqual([
      {
        niveau: 'erreur',
        evenement: `connexion pour ${MASQUE}`,
        champs: { detail: MASQUE, duree: 412, ok: true },
      },
      { niveau: 'info', evenement: 'demarrage' },
    ]);
  });
});
