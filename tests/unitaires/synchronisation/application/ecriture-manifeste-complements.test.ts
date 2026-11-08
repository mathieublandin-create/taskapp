/**
 * Compléments de H4 sur l'écriture monotone du manifeste (ST-US-017 v0.10.1 §6.7 n° 13 ; v0.11 §6.8 n° 19) : création
 * concurrente dont le doublon est supprimé (rien à inscrire) ; doublon non supprimé puis relecture du canonique en
 * échec (l'erreur de relecture est rendue). UT-COMP-US-017-4-48 et 4-49 (rang 11, tranche H4, Bruce).
 */
import { describe, expect, it } from 'vitest';
import { echec } from '@src/commun/domaine/resultat';
import { ecrireManifesteMonotone } from '@src/synchronisation/application/ecriture-manifeste';
import type { TransportSynchro } from '@src/synchronisation/application/ports/transport-synchro';
import type { IdFichierDrive } from '@src/synchronisation/domaine/meta-synchronisation';
import { SCHEMA_VERSION } from '@src/synchronisation/domaine/version-schema';
import { FauxDrive } from '@tests/doublures/faux-drive';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { valeurDe } from '@tests/support/environnement';
import { ReseauCommandable } from '@tests/support/synchronisation/appareil-cycle';
import { instant, PC, SMARTPHONE } from '@tests/support/valeurs';

const T0 = instant('2026-10-21T08:00:00.000Z');
const INITIALE = { schemaVersion: SCHEMA_VERSION, generation: { type: 'INITIALE' } } as const;

/** Drive avec un dossier vide ; un manifeste plus ancien est créé par le PC juste avant la création du smartphone. */
const avecCreationConcurrente = async () => {
  const drive = new FauxDrive(new TempsSimule(T0));
  const transport = drive.transportPour(SMARTPHONE, {
    reseau: new ReseauCommandable(),
    accesAccorde: () => true,
  });
  const dossier = valeurDe(await transport.preparerDossier());
  let concurrent: IdFichierDrive | undefined;
  drive.avantLaProchaineCreationDeManifeste(async () => {
    concurrent = await drive.ajouterManifeste(PC, dossier, INITIALE, T0 - 1000);
  });
  return { drive, transport, dossier, concurrent: () => concurrent };
};

describe('ecrireManifesteMonotone : création concurrente (n° 13, n° 19)', () => {
  it('UT-COMP-US-017-4-48 doublon supprimé : le canonique plus ancien est rendu, sans doublon à inscrire', async () => {
    const { drive, transport, dossier, concurrent } = await avecCreationConcurrente();

    const ecrit = valeurDe(
      await ecrireManifesteMonotone(transport, { dossier, apport: INITIALE, mode: 'ORDINAIRE' }),
    );

    expect(ecrit.id).toBe(concurrent());
    expect(ecrit.doublonNonSupprime).toBeUndefined();
    expect(ecrit.erreurDoublon).toBeUndefined();
    const manifestes = drive
      .fichiers()
      .filter((f) => !f.supprime && f.appProperties['donejuan'] === 'manifeste');
    expect(manifestes.map((f) => f.id)).toEqual([concurrent()]);
  });

  it('UT-COMP-US-017-4-49 doublon non supprimé puis relecture du canonique en échec : l’erreur de relecture est rendue (le cycle ne retient ni canonique ni doublon)', async () => {
    const { drive, transport, dossier } = await avecCreationConcurrente();
    let suppressions = 0;
    const enPanne: TransportSynchro = {
      ...transport,
      supprimerFichier: (id) => {
        suppressions += 1;
        drive.echouerProchainesSuppressions(1);
        return transport.supprimerFichier(id);
      },
      lireContenuManifeste: (id) =>
        suppressions > 0
          ? Promise.resolve(echec({ type: 'ServeurIndisponible' }))
          : transport.lireContenuManifeste(id),
    };

    expect(
      await ecrireManifesteMonotone(enPanne, { dossier, apport: INITIALE, mode: 'ORDINAIRE' }),
    ).toEqual(echec({ type: 'ServeurIndisponible' }));
    expect(suppressions).toBe(1);
  });
});
