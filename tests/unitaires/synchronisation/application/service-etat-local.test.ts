import { describe, expect, it } from 'vitest';
import { echec, succes, type Resultat } from '@src/commun/domaine/resultat';
import type {
  DepotLocal,
  ErreurDepotLocal,
  IssueTransaction,
} from '@src/synchronisation/application/ports/depot-local';
import { ServiceEtatLocalTransactionnel } from '@src/synchronisation/application/service-etat-local-transactionnel';
import type { EtatLocal } from '@src/synchronisation/domaine/etat-local';
import { DepotLocalDexie } from '@src/synchronisation/infrastructure/depot-local-dexie';
import { HorlogeSimulee } from '@tests/doublures/horloge-simulee';
import { GenerateurIdentifiantsSequentiel } from '@tests/doublures/generateur-identifiants-sequentiel';
import {
  appliquerModifications,
  creerEnvironnement,
  NOM_BASE_TEST,
  valeurDe,
} from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import {
  date,
  ecart,
  HEURE,
  hlc,
  idObjectif,
  instant,
  MINUTE,
  SMARTPHONE,
} from '@tests/support/valeurs';

const DEPART = '2026-10-21T08:00:00.000Z';
const O1 = idObjectif(1);
const O2 = idObjectif(2);

const creerO1 = creationObjectif(
  { id: O1, intitule: 'Publier le guide', delai: date('2026-12-15') },
  instant(DEPART),
);

/** Décorateur de test : fournit au calcul un état dont la correction d'horloge vaut +5 min. */
class DepotAvecCorrection implements DepotLocal {
  constructor(private readonly interne: DepotLocal) {}
  lire(): Promise<Resultat<EtatLocal, ErreurDepotLocal>> {
    return this.interne.lire();
  }
  appliquer<T, E extends { readonly type: string }>(
    calcul: (etat: EtatLocal) => Resultat<IssueTransaction<T>, E>,
  ): Promise<Resultat<T, E | ErreurDepotLocal>> {
    return this.interne.appliquer((etat) =>
      calcul({ ...etat, correctionHorloge: ecart(5 * MINUTE) }),
    );
  }
  observer(rappel: () => void): () => void {
    return this.interne.observer(rappel);
  }
  lireMeta(): ReturnType<DepotLocal['lireMeta']> {
    return this.interne.lireMeta();
  }
  appliquerSynchronisation(
    calcul: Parameters<DepotLocal['appliquerSynchronisation']>[0],
  ): ReturnType<DepotLocal['appliquerSynchronisation']> {
    return this.interne.appliquerSynchronisation(calcul);
  }
}

describe('ServiceEtatLocalTransactionnel (ST-socle-ecriture.md §6.8)', () => {
  it('UT-SOC-33 modifier — renvoie l’Echec de la décision sans rien écrire (DS-07)', async () => {
    const env = creerEnvironnement(DEPART);
    valeurDe(await appliquerModifications(env.service, () => [creerO1]));
    const avant = await env.depot.lire();

    const resultat = await env.service.modifier(() => echec({ type: 'RefusDeTest' }));

    expect(resultat).toEqual(echec({ type: 'RefusDeTest' }));
    expect(await env.depot.lire()).toEqual(avant);
  });

  it('UT-SOC-34 modifier — n’écrit rien et propage l’exception quand la décision en lève une (ENF-T-07)', async () => {
    const env = creerEnvironnement(DEPART);
    const avant = await env.depot.lire();

    await expect(
      env.service.modifier(() => {
        throw new Error('panne de décision');
      }),
    ).rejects.toThrow('panne de décision');
    expect(await env.depot.lire()).toEqual(avant);
  });

  it('UT-SOC-35 modifier puis lire sur une nouvelle instance du dépôt — relit un état identique (ENF-T-07, US-018 S09)', async () => {
    const env = creerEnvironnement(DEPART);
    valeurDe(await appliquerModifications(env.service, () => [creerO1]));
    const ecrit = valeurDe(await env.depot.lire());

    const nouveauDepot = new DepotLocalDexie({
      nomBase: NOM_BASE_TEST,
      fabrique: env.fabrique,
      appareilId: SMARTPHONE,
    });
    const relu = valeurDe(await nouveauDepot.lire());

    expect(relu).toEqual(ecrit);
    expect(relu.version).toBe(1);
    expect(relu.registres.size).toBe(4);
    expect(relu.journal.size).toBe(1);
  });

  it('UT-SOC-36 modifier — date l’HLC et la première écriture en attente de l’heure corrigée, l’événement de l’heure non corrigée (DAT §4.1.5 bis, §6.4)', async () => {
    const env = creerEnvironnement(DEPART);
    const service = new ServiceEtatLocalTransactionnel({
      depot: new DepotAvecCorrection(env.depot),
      horloge: env.horloge,
      generateur: env.generateur,
    });

    valeurDe(await appliquerModifications(service, () => [creerO1]));

    const etat = valeurDe(await env.depot.lire());
    const corrige = instant('2026-10-21T08:05:00.000Z');
    expect([...etat.registres.values()].map((r) => r.ecriture.hlc.physique)).toEqual([
      corrige,
      corrige,
      corrige,
      corrige,
    ]);
    expect([...etat.journal.values()].map((e) => e.instant)).toEqual([instant(DEPART)]);
    expect([...etat.enAttente.values()].map((e) => e.entree.premiereEcriture)).toEqual([
      corrige,
      corrige,
      corrige,
      corrige,
    ]);
  });

  it('UT-SOC-37 lireJournal — renvoie les seules entrées de l’élément, par HLC croissant (RG-050)', async () => {
    const env = creerEnvironnement(DEPART);
    valeurDe(await appliquerModifications(env.service, () => [creerO1]));
    valeurDe(
      await appliquerModifications(env.service, (_, c) => [
        creationObjectif({ id: O2, intitule: 'Autre' }, c.instant),
      ]),
    );
    env.horloge.avancer(ecart(24 * HEURE));
    valeurDe(
      await appliquerModifications(env.service, () => [
        {
          type: 'ECRIRE_OBJECTIF',
          id: O1,
          ecriture: { champ: 'delai', valeur: date('2027-01-31') },
          evenement: {
            type: 'MODIFICATION_DELAI',
            element: { type: 'OBJECTIF', id: O1 },
            avant: { delai: date('2026-12-15') },
            apres: { delai: date('2027-01-31') },
            rang: 0,
          },
        },
      ]),
    );

    const journal = valeurDe(await env.service.lireJournal({ type: 'OBJECTIF', id: O1 }));

    expect(journal.map((e) => [e.type, e.element.id, e.jour])).toEqual([
      ['CREATION', O1, '2026-10-21'],
      ['MODIFICATION_DELAI', O1, '2026-10-22'],
    ]);
  });

  it('UT-SOC-38 modifier — après un redémarrage avec une horloge reculée, donne un HLC strictement supérieur au dernier persisté (DAT §6.4)', async () => {
    const env = creerEnvironnement(DEPART);
    valeurDe(await appliquerModifications(env.service, () => [creerO1]));
    const horlogeReculee = new HorlogeSimulee(env.temps);
    horlogeReculee.changerHeureMurale(ecart(-HEURE));
    const serviceRedemarre = new ServiceEtatLocalTransactionnel({
      depot: new DepotLocalDexie({
        nomBase: NOM_BASE_TEST,
        fabrique: env.fabrique,
        appareilId: SMARTPHONE,
      }),
      horloge: horlogeReculee,
      generateur: new GenerateurIdentifiantsSequentiel('01'),
    });

    valeurDe(
      await appliquerModifications(serviceRedemarre, () => [
        {
          type: 'ECRIRE_OBJECTIF',
          id: O1,
          ecriture: { champ: 'intitule', valeur: 'Publier le guide v2' },
        },
      ]),
    );

    const etat = valeurDe(await env.depot.lire());
    expect(etat.dernierHlc).toEqual(hlc(DEPART, 1, SMARTPHONE));
  });

  it('UT-SOC-39 modifier — la décision d’une seconde instance du service voit l’écriture de la première (onglets, US-031)', async () => {
    const env = creerEnvironnement(DEPART);
    const secondOnglet = new ServiceEtatLocalTransactionnel({
      depot: new DepotLocalDexie({
        nomBase: NOM_BASE_TEST,
        fabrique: env.fabrique,
        appareilId: SMARTPHONE,
      }),
      horloge: env.horloge,
      generateur: new GenerateurIdentifiantsSequentiel('02'),
    });
    valeurDe(await secondOnglet.lire());
    valeurDe(await appliquerModifications(env.service, () => [creerO1]));

    const resultat = await secondOnglet.modifier((etat) =>
      etat.objectifs.has(O1)
        ? succes({
            modifications: [
              {
                type: 'ECRIRE_OBJECTIF',
                id: O1,
                ecriture: { champ: 'intitule', valeur: 'Renommé' },
              },
            ],
            valeur: 'vu',
          })
        : echec({ type: 'ObjectifNonVu' }),
    );

    expect(resultat).toEqual(succes('vu'));
    expect(valeurDe(await env.service.lire()).objectifs.get(O1)?.intitule).toBe('Renommé');
  });
});
