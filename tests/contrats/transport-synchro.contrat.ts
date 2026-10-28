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
      const id = valeurDe(
        await t.deposerFichierAppareil({ dossier, contenu: contenu(SMARTPHONE, 'A') }),
      );
      expect(await t.lireFichierAppareil(id)).toEqual(succes(contenu(SMARTPHONE, 'A')));
    });

    it('CT-TRANS-03 deposerFichierAppareil — remplace le fichier existant, même sans son identifiant, sans en créer un second', async () => {
      const t = creer().transport(SMARTPHONE);
      const dossier = valeurDe(await t.preparerDossier());
      const id = valeurDe(
        await t.deposerFichierAppareil({ dossier, contenu: contenu(SMARTPHONE, 'A') }),
      );
      expect(
        await t.deposerFichierAppareil({
          dossier,
          contenu: contenu(SMARTPHONE, 'B'),
          fichierExistant: id,
        }),
      ).toEqual(succes(id));
      expect(
        await t.deposerFichierAppareil({ dossier, contenu: contenu(SMARTPHONE, 'C') }),
      ).toEqual(succes(id));
      expect(valeurDe(await t.listerFichiersAppareils(dossier)).fichiers).toEqual([
        { id, appareil: SMARTPHONE },
      ]);
    });

    it('CT-TRANS-04 changements — ne renvoie que les fichiers modifiés depuis le jeton', async () => {
      const f = creer();
      const pc = f.transport(PC);
      const dossier = valeurDe(await pc.preparerDossier());
      const idPc = valeurDe(
        await pc.deposerFichierAppareil({ dossier, contenu: contenu(PC, 'A') }),
      );
      const { jeton } = valeurDe(await pc.listerFichiersAppareils(dossier));
      const idSmartphone = valeurDe(
        await f
          .transport(SMARTPHONE)
          .deposerFichierAppareil({ dossier, contenu: contenu(SMARTPHONE, 'B') }),
      );
      const changements = valeurDe(await pc.changements(dossier, jeton));
      expect(changements.fichiers).toEqual([{ id: idSmartphone, appareil: SMARTPHONE }]);
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
        );
      });

      const { jeton } = valeurDe(await pc.listerFichiersAppareils(dossier));
      const changements = valeurDe(await pc.changements(dossier, jeton));

      expect(idSmartphone).toBeDefined();
      expect(changements.fichiers).toContainEqual({ id: idSmartphone, appareil: SMARTPHONE });
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
      const id = valeurDe(
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
      const id = valeurDe(
        await f.transport(PC).deposerFichierAppareil({ dossier, contenu: contenu(PC, 'A') }),
      );
      expect(
        valeurDe(await f.transport(SMARTPHONE).listerFichiersAppareils(dossier)).fichiers,
      ).toEqual([{ id, appareil: PC }]);
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
  };
});
