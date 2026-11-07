/**
 * Suite de contrat du port TransportSynchro (ST-US-017 §4.3 ; conventions.md §11.10). Identifiants CT-TRANS-nn
 * (CT-TRANS-09 et 10 : RL-LOT-001-A3, E11).
 * Exécutée sur FauxDrive (E10) ; Benjamin l'exécute aussi sur TransportSynchroDrive avec MSW (§14).
 */
import { describe, expect, it } from 'vitest';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import { succes } from '@src/commun/domaine/resultat';
import type {
  IdFichierDrive,
  TransportSynchro,
} from '@src/synchronisation/application/ports/transport-synchro';
import type { ContenuFichierAppareil } from '@src/synchronisation/domaine/contenu-fichier';
import { ClientGoogle } from '@src/infrastructure-google';
import { TransportSynchroDrive } from '@src/synchronisation/infrastructure/drive/transport-synchro-drive';
import { DriveHttpSimule } from '@tests/doublures/drive-http-simule';
import { FauxDrive } from '@tests/doublures/faux-drive';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { valeurDe } from '@tests/support/environnement';
import { registre } from '@tests/support/fabriques/etat-local';
import { ReseauCommandable } from '@tests/support/synchronisation/appareil-cycle';
import { hlc, idObjectif, instant, PC, SMARTPHONE } from '@tests/support/valeurs';

export type FixtureTransport = {
  readonly transport: (appareil: IdAppareil) => TransportSynchro;
  /** Modifie à la main un octet du contenu du fichier, qui reste du gzip valide (V-02). */
  readonly modifierALaMain: (id: IdFichierDrive) => Promise<void>;
  readonly retirerAcces: () => void;
  /** Exécute `rappel` au prochain inventaire, entre la prise du jeton de départ et la liste des fichiers. */
  readonly pendantLeProchainInventaire: (rappel: () => Promise<void>) => void;
  /** Rend invalides tous les jetons de changements déjà émis. */
  readonly invaliderJetons: () => void;
  /** v0.10.1 (condition C5) : `PRESENT`, `CORBEILLE` (récupérable) ou `ABSENT` (supprimé définitivement). */
  readonly etatDe: (id: IdFichierDrive) => 'PRESENT' | 'CORBEILLE' | 'ABSENT';
};

const contenu = (appareil: IdAppareil, intitule: string): ContenuFichierAppareil => ({
  schemaVersion: 1,
  versionApplication: '0.1.0',
  generation: { type: 'INITIALE' },
  appareil,
  registres: [
    registre(
      { type: 'OBJECTIF', id: idObjectif(1), champ: 'intitule' },
      intitule,
      hlc('2026-10-21T08:00:00.000Z', 0, appareil),
    ),
  ],
  journal: [],
});

export const suiteContratTransport = (nom: string, creer: () => FixtureTransport): void => {
  describe(`Contrat TransportSynchro — ${nom}`, () => {
    it('CT-TRANS-01 preparerDossier — idempotent : deux appels, un seul dossier', async () => {
      const f = creer();
      const premier = await f.transport(SMARTPHONE).preparerDossier();
      expect(await f.transport(PC).preparerDossier()).toEqual(premier);
    });

    it('CT-TRANS-02 deposerFichierAppareil puis lireFichierAppareil — rend un contenu égal', async () => {
      const t = creer().transport(SMARTPHONE);
      const dossier = valeurDe(await t.preparerDossier());
      const { id } = valeurDe(
        await t.deposerFichierAppareil({ dossier, contenu: contenu(SMARTPHONE, 'A') }),
      );
      expect(await t.lireFichierAppareil(id)).toEqual(succes(contenu(SMARTPHONE, 'A')));
    });

    it('CT-TRANS-03 deposerFichierAppareil — remplace le fichier existant, même sans son identifiant, sans en créer un second', async () => {
      const t = creer().transport(SMARTPHONE);
      const dossier = valeurDe(await t.preparerDossier());
      const { id } = valeurDe(
        await t.deposerFichierAppareil({ dossier, contenu: contenu(SMARTPHONE, 'A') }),
      );
      expect(
        valeurDe(
          await t.deposerFichierAppareil({
            dossier,
            contenu: contenu(SMARTPHONE, 'B'),
            fichierExistant: id,
          }),
        ).id,
      ).toBe(id);
      expect(
        valeurDe(await t.deposerFichierAppareil({ dossier, contenu: contenu(SMARTPHONE, 'C') })).id,
      ).toBe(id);
      // Incrément 3 : `version` éventuelle ignorée ici (CT-TRANS-11).
      expect(valeurDe(await t.listerFichiersAppareils(dossier)).fichiers).toEqual([
        expect.objectContaining({ id, appareil: SMARTPHONE }),
      ]);
    });

    it('CT-TRANS-04 changements — ne renvoie que les fichiers modifiés depuis le jeton', async () => {
      const f = creer();
      const pc = f.transport(PC);
      const dossier = valeurDe(await pc.preparerDossier());
      const { id: idPc } = valeurDe(
        await pc.deposerFichierAppareil({ dossier, contenu: contenu(PC, 'A') }),
      );
      const { jeton } = valeurDe(await pc.listerFichiersAppareils(dossier));
      const { id: idSmartphone } = valeurDe(
        await f
          .transport(SMARTPHONE)
          .deposerFichierAppareil({ dossier, contenu: contenu(SMARTPHONE, 'B') }),
      );
      const changements = valeurDe(await pc.changements(dossier, jeton));
      expect(changements.fichiers).toEqual([
        expect.objectContaining({ id: idSmartphone, appareil: SMARTPHONE }),
      ]);
      expect(changements.fichiers.some((x) => x.id === idPc)).toBe(false);
    });

    it('CT-TRANS-09 listerFichiersAppareils — un fichier modifié pendant l’inventaire est retrouvé par changements depuis le jeton rendu (DAT v0.11.4 §4.3, RL-LOT-001-A3)', async () => {
      const f = creer();
      const pc = f.transport(PC);
      const dossier = valeurDe(await pc.preparerDossier());
      let idSmartphone: IdFichierDrive | undefined;
      f.pendantLeProchainInventaire(async () => {
        idSmartphone = valeurDe(
          await f
            .transport(SMARTPHONE)
            .deposerFichierAppareil({ dossier, contenu: contenu(SMARTPHONE, 'B') }),
        ).id;
      });

      const { jeton } = valeurDe(await pc.listerFichiersAppareils(dossier));
      const changements = valeurDe(await pc.changements(dossier, jeton));

      expect(idSmartphone).toBeDefined();
      expect(changements.fichiers).toContainEqual(
        expect.objectContaining({ id: idSmartphone, appareil: SMARTPHONE }),
      );
    });

    it('CT-TRANS-10 changements — un jeton refusé par Drive rend JetonChangementsInvalide (RL-LOT-001-A3)', async () => {
      const f = creer();
      const pc = f.transport(PC);
      const dossier = valeurDe(await pc.preparerDossier());
      const { jeton } = valeurDe(await pc.listerFichiersAppareils(dossier));
      f.invaliderJetons();

      expect(await pc.changements(dossier, jeton)).toEqual({
        ok: false,
        erreur: { type: 'JetonChangementsInvalide' },
      });
    });

    it('CT-TRANS-05 lireFichierAppareil — un fichier modifié à la main rend FichierIllisible (EMPREINTE)', async () => {
      const f = creer();
      const t = f.transport(SMARTPHONE);
      const dossier = valeurDe(await t.preparerDossier());
      const { id } = valeurDe(
        await t.deposerFichierAppareil({ dossier, contenu: contenu(SMARTPHONE, 'A') }),
      );
      await f.modifierALaMain(id);
      expect(await t.lireFichierAppareil(id)).toEqual({
        ok: false,
        erreur: { type: 'FichierIllisible', cause: 'EMPREINTE' },
      });
    });

    it('CT-TRANS-06 ecrireManifeste puis lireManifeste — aller-retour ; absent avant toute écriture', async () => {
      const t = creer().transport(SMARTPHONE);
      const dossier = valeurDe(await t.preparerDossier());
      expect(await t.lireManifeste(dossier)).toEqual(succes(undefined));
      const manifeste = { schemaVersion: 1, generation: { type: 'INITIALE' } } as const;
      const id = valeurDe(await t.ecrireManifeste({ dossier, contenu: manifeste }));
      expect(await t.lireManifeste(dossier)).toEqual(succes({ id, contenu: manifeste }));
    });

    it('CT-TRANS-07 toutes les méthodes — un accès retiré rend NonAutorise, sans exception', async () => {
      const f = creer();
      const t = f.transport(SMARTPHONE);
      const dossier = valeurDe(await t.preparerDossier());
      f.retirerAcces();
      expect(await t.listerFichiersAppareils(dossier)).toEqual({
        ok: false,
        erreur: { type: 'NonAutorise' },
      });
      expect(
        await t.deposerFichierAppareil({ dossier, contenu: contenu(SMARTPHONE, 'A') }),
      ).toEqual({
        ok: false,
        erreur: { type: 'NonAutorise' },
      });
    });

    it('CT-TRANS-08 listerFichiersAppareils — ne renvoie que les fichiers d’appareil du dossier, avec leur appareil', async () => {
      const f = creer();
      const dossier = valeurDe(await f.transport(PC).preparerDossier());
      await f.transport(PC).ecrireManifeste({
        dossier,
        contenu: { schemaVersion: 1, generation: { type: 'INITIALE' } },
      });
      const { id } = valeurDe(
        await f.transport(PC).deposerFichierAppareil({ dossier, contenu: contenu(PC, 'A') }),
      );
      expect(
        valeurDe(await f.transport(SMARTPHONE).listerFichiersAppareils(dossier)).fichiers,
      ).toEqual([expect.objectContaining({ id, appareil: PC })]);
    });

    // ---- Incrément 3 (ST-US-017 v0.10 §4.7, §13.5 ; rang 10, tranche R1) ------------------------------------

    it('CT-TRANS-11 version — le dépôt rend la version Drive du fichier, la même que l’inventaire et les changements ; une modification à la main la change', async () => {
      const f = creer();
      const t = f.transport(SMARTPHONE);
      const dossier = valeurDe(await t.preparerDossier());
      const { jeton } = valeurDe(await t.listerFichiersAppareils(dossier));
      const depot = valeurDe(
        await t.deposerFichierAppareil({ dossier, contenu: contenu(SMARTPHONE, 'A') }),
      );
      expect(depot.version).toEqual(expect.any(String));
      expect(valeurDe(await t.inventorierDossier(dossier)).fichiers).toEqual([
        { id: depot.id, appareil: SMARTPHONE, version: depot.version },
      ]);
      expect(valeurDe(await t.changements(dossier, jeton)).fichiers).toEqual([
        { id: depot.id, appareil: SMARTPHONE, version: depot.version },
      ]);
      expect(valeurDe(await t.listerFichiersAppareils(dossier)).fichiers).toEqual([
        { id: depot.id, appareil: SMARTPHONE, version: depot.version },
      ]);

      await f.modifierALaMain(depot.id);
      const [apres] = valeurDe(await t.inventorierDossier(dossier)).fichiers;
      expect(apres?.version).toEqual(expect.any(String));
      expect(apres?.version).not.toBe(depot.version);
      const redepot = valeurDe(
        await t.deposerFichierAppareil({
          dossier,
          contenu: contenu(SMARTPHONE, 'B'),
          fichierExistant: depot.id,
        }),
      );
      expect(redepot.id).toBe(depot.id);
      expect([depot.version, apres?.version]).not.toContain(redepot.version);
    });

    it('CT-TRANS-12 inventorierDossier — manifestes et fichiers d’appareil du dossier, métadonnées seulement ; dossier supprimé : listes vides', async () => {
      const f = creer();
      const t = f.transport(PC);
      const dossier = valeurDe(await t.preparerDossier());
      expect(valeurDe(await t.inventorierDossier(dossier))).toEqual({
        manifestes: [],
        fichiers: [],
      });
      const manifeste = valeurDe(
        await t.ecrireManifeste({
          dossier,
          contenu: { schemaVersion: 1, generation: { type: 'INITIALE' } },
        }),
      );
      const pc = valeurDe(await t.deposerFichierAppareil({ dossier, contenu: contenu(PC, 'A') }));
      const smartphone = valeurDe(
        await f
          .transport(SMARTPHONE)
          .deposerFichierAppareil({ dossier, contenu: contenu(SMARTPHONE, 'B') }),
      );

      const inventaire = valeurDe(await t.inventorierDossier(dossier));
      expect(inventaire.manifestes.map((m) => m.id)).toEqual([manifeste]);
      expect(typeof inventaire.manifestes[0]?.creeA).toBe('number');
      expect(inventaire.fichiers).toHaveLength(2);
      expect(inventaire.fichiers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: pc.id, appareil: PC }),
          expect.objectContaining({ id: smartphone.id, appareil: SMARTPHONE }),
        ]),
      );

      valeurDe(await t.supprimerFichier(dossier));
      expect(valeurDe(await t.inventorierDossier(dossier))).toEqual({
        manifestes: [],
        fichiers: [],
      });
    });

    it('CT-TRANS-13 lireContenuManifeste et supprimerFichier — aller-retour ; fichier supprimé : RessourceIntrouvable ; suppression idempotente ; modification à la main : EMPREINTE', async () => {
      const f = creer();
      const t = f.transport(SMARTPHONE);
      const dossier = valeurDe(await t.preparerDossier());
      const contenuManifeste = {
        schemaVersion: 1,
        generation: { type: 'NOUVELLE', hlc: hlc('2026-10-21T09:00:00.000Z', 2, PC) },
        restauration: hlc('2026-10-21T09:30:00.000Z', 0, SMARTPHONE),
      } as const;
      const id = valeurDe(await t.ecrireManifeste({ dossier, contenu: contenuManifeste }));
      expect(await f.transport(PC).lireContenuManifeste(id)).toEqual(succes(contenuManifeste));

      await f.modifierALaMain(id);
      expect(await t.lireContenuManifeste(id)).toEqual({
        ok: false,
        erreur: { type: 'FichierIllisible', cause: 'EMPREINTE' },
      });

      expect(await t.supprimerFichier(id)).toEqual(succes(undefined));
      expect(await t.supprimerFichier(id)).toEqual(succes(undefined));
      expect(await t.lireContenuManifeste(id)).toEqual({
        ok: false,
        erreur: { type: 'RessourceIntrouvable' },
      });
      expect(await t.lireManifeste(dossier)).toEqual(succes(undefined));
    });

    it('CT-TRANS-14 listerDossiers — le dossier de l’application, sans rien créer ; vide après sa suppression ; accès retiré : NonAutorise', async () => {
      const f = creer();
      const t = f.transport(PC);
      expect(valeurDe(await t.listerDossiers())).toEqual([]);
      expect(valeurDe(await t.listerDossiers())).toEqual([]);
      const dossier = valeurDe(await t.preparerDossier());
      const dossiers = valeurDe(await f.transport(SMARTPHONE).listerDossiers());
      expect(dossiers.map((d) => d.id)).toEqual([dossier]);
      expect(typeof dossiers[0]?.creeA).toBe('number');
      valeurDe(await t.supprimerFichier(dossier));
      expect(valeurDe(await t.listerDossiers())).toEqual([]);
      f.retirerAcces();
      expect(await t.listerDossiers()).toEqual({ ok: false, erreur: { type: 'NonAutorise' } });
      expect(await t.inventorierDossier(dossier)).toEqual({
        ok: false,
        erreur: { type: 'NonAutorise' },
      });
    });

    it('CT-TRANS-15 corbeille (condition C5 de Starck) — supprimerFichier met à la corbeille, jamais définitivement, un dossier avec son contenu ; listerDossiers, inventorierDossier et listerFichiersAppareils excluent la corbeille', async () => {
      const f = creer();
      const t = f.transport(PC);
      const dossier = valeurDe(await t.preparerDossier());
      const manifeste = valeurDe(
        await t.ecrireManifeste({
          dossier,
          contenu: { schemaVersion: 1, generation: { type: 'INITIALE' } },
        }),
      );
      const pc = valeurDe(await t.deposerFichierAppareil({ dossier, contenu: contenu(PC, 'A') }));
      const smartphone = valeurDe(
        await f
          .transport(SMARTPHONE)
          .deposerFichierAppareil({ dossier, contenu: contenu(SMARTPHONE, 'B') }),
      );

      valeurDe(await t.supprimerFichier(pc.id));
      expect(f.etatDe(pc.id)).toBe('CORBEILLE');
      expect(valeurDe(await t.inventorierDossier(dossier)).fichiers.map((x) => x.id)).toEqual([
        smartphone.id,
      ]);
      expect(valeurDe(await t.listerFichiersAppareils(dossier)).fichiers.map((x) => x.id)).toEqual([
        smartphone.id,
      ]);

      valeurDe(await t.supprimerFichier(dossier));
      expect([f.etatDe(dossier), f.etatDe(manifeste), f.etatDe(smartphone.id)]).toEqual([
        'CORBEILLE',
        'CORBEILLE',
        'CORBEILLE',
      ]);
      expect(valeurDe(await t.listerDossiers())).toEqual([]);
      expect(valeurDe(await t.inventorierDossier(dossier))).toEqual({
        manifestes: [],
        fichiers: [],
      });
    });
  });
};

suiteContratTransport('FauxDrive', () => {
  const drive = new FauxDrive(new TempsSimule(instant('2026-10-21T08:00:00.000Z')));
  const acces = { accorde: true };
  return {
    transport: (appareil) =>
      drive.transportPour(appareil, {
        reseau: new ReseauCommandable(),
        accesAccorde: () => acces.accorde,
      }),
    modifierALaMain: (id) => {
      drive.modifierFichierALaMain(id);
      return Promise.resolve();
    },
    retirerAcces: () => {
      acces.accorde = false;
    },
    pendantLeProchainInventaire: (rappel) => {
      drive.pendantLeProchainInventaire(rappel);
    },
    invaliderJetons: () => {
      drive.invaliderJetons();
    },
    etatDe: (id) => {
      const fichier = drive.fichiers().find((x) => x.id === id);
      if (fichier === undefined) return 'ABSENT';
      return fichier.supprime ? 'CORBEILLE' : 'PRESENT';
    },
  };
});

// ST-US-017 §3.1 n° 20 : la même suite sur l'adaptateur réel, derrière un Drive v3 REST simulé (pages de 1 élément).
suiteContratTransport('TransportSynchroDrive sur Drive HTTP simulé', () => {
  const drive = new DriveHttpSimule();
  drive.taillePage = 1;
  const client = new ClientGoogle({ lireJeton: () => 'jeton-contrat', fetch: drive.fetch });
  const transport = new TransportSynchroDrive(client);
  return {
    transport: () => transport,
    modifierALaMain: (id) => {
      drive.modifierALaMain(id);
      return Promise.resolve();
    },
    retirerAcces: () => {
      drive.retirerAcces();
    },
    pendantLeProchainInventaire: (rappel) => {
      drive.pendantLeProchainInventaire(rappel);
    },
    invaliderJetons: () => {
      drive.invaliderJetons();
    },
    etatDe: (id) => drive.etatDe(id),
  };
});
