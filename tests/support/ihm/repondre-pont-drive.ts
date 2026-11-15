/**
 * Côté processus cucumber du pont du `FauxDrive` (ST-US-018 v0.4 §6.4 ; ST-US-031 §6.5) : décode les arguments reçus de
 * la page, appelle la méthode du `TransportSynchro` du `FauxDrive` vu par l'appareil, encode le résultat. Utilisé par
 * `tests/steps-ihm/support/pont-faux-drive.ts` (binding `donejuanFauxDrive`) et par la suite de contrat.
 */
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { decoderPont, encoderPont } from '@src/composition/test-ihm/codec-pont';
import type { TransportSynchro } from '@src/synchronisation/application/ports/transport-synchro';

const METHODES: ReadonlySet<string> = new Set<keyof TransportSynchro>([
  'preparerDossier',
  'listerFichiersAppareils',
  'changements',
  'lireFichierAppareil',
  'deposerFichierAppareil',
  'lireManifeste',
  'ecrireManifeste',
  'listerDossiers',
  'inventorierDossier',
  'lireContenuManifeste',
  'supprimerFichier',
]);

export const repondrePontDrive = async (
  transport: TransportSynchro,
  methode: string,
  argumentsJson: string,
): Promise<string> => {
  if (!METHODES.has(methode))
    throw new ErreurProgrammation(`Méthode inconnue du pont : ${methode}`);
  const decodes = decoderPont(argumentsJson);
  if (!Array.isArray(decodes)) throw new ErreurProgrammation('Arguments du pont : tableau attendu');
  const args: ReadonlyArray<unknown> = decodes;
  const methodes = transport as unknown as Readonly<
    Record<string, (...a: ReadonlyArray<unknown>) => Promise<unknown>>
  >;
  const resultat = methodes[methode]?.(...args);
  if (resultat === undefined) throw new ErreurProgrammation(`Méthode absente : ${methode}`);
  return encoderPont(await resultat);
};
