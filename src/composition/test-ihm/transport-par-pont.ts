import { nonImplemente } from '@non-implemente';
import type { EtatReseau } from '../../commun/application/ports/etat-reseau';
import type { Resultat } from '../../commun/domaine/resultat';
import type {
  Changements,
  ElementDrive,
  ErreurTransport,
  FichierDepose,
  IdFichierDrive,
  InventaireDossier,
  ManifesteDistant,
  TransportSynchro,
} from '../../synchronisation/application/ports/transport-synchro';
import type {
  ContenuFichierAppareil,
  ContenuManifeste,
} from '../../synchronisation/domaine/contenu-fichier';

// ST-US-018 v0.4 §4.4, §6.4 (rang 12, tranche B2) ; ST-US-031 §3 n° 9, §6.5. Composition `test-ihm` seulement : jamais
// importé par `web.ts` ni par le build de production (alias du mode `test-ihm`, §3 n° 14).

/** `window.donejuanFauxDrive` (binding Playwright) : `(methode, encoderPont(arguments))` → `encoderPont(resultat)`. */
export type PontDrive = (methode: keyof TransportSynchro, argumentsJson: string) => Promise<string>;

/**
 * Chaque méthode : réseau coupé (`reseau.estConnecte()` faux) → `Echec({ type: 'ReseauIndisponible' })` sans appeler le
 * pont (`context.setOffline` ne coupe pas un binding) ; sinon `decoderPont(await pont(nom, encoderPont([...arguments])))`.
 */
export class TransportParPont implements TransportSynchro {
  constructor(
    private readonly dependances: { readonly pont: PontDrive; readonly reseau: EtatReseau },
  ) {}

  preparerDossier(): Promise<Resultat<IdFichierDrive, ErreurTransport>> {
    return nonImplemente(`TransportParPont.preparerDossier ${typeof this.dependances}`);
  }

  listerFichiersAppareils(
    dossier: IdFichierDrive,
  ): Promise<Resultat<Changements, ErreurTransport>> {
    return nonImplemente(`TransportParPont.listerFichiersAppareils ${dossier}`);
  }

  changements(
    dossier: IdFichierDrive,
    jeton: string,
  ): Promise<Resultat<Changements, ErreurTransport>> {
    return nonImplemente(`TransportParPont.changements ${dossier} ${jeton}`);
  }

  lireFichierAppareil(
    id: IdFichierDrive,
  ): Promise<Resultat<ContenuFichierAppareil, ErreurTransport>> {
    return nonImplemente(`TransportParPont.lireFichierAppareil ${id}`);
  }

  deposerFichierAppareil(p: {
    readonly dossier: IdFichierDrive;
    readonly contenu: ContenuFichierAppareil;
    readonly fichierExistant?: IdFichierDrive;
  }): Promise<Resultat<FichierDepose, ErreurTransport>> {
    return nonImplemente(`TransportParPont.deposerFichierAppareil ${p.dossier}`);
  }

  lireManifeste(
    dossier: IdFichierDrive,
  ): Promise<Resultat<ManifesteDistant | undefined, ErreurTransport>> {
    return nonImplemente(`TransportParPont.lireManifeste ${dossier}`);
  }

  ecrireManifeste(p: {
    readonly dossier: IdFichierDrive;
    readonly contenu: ContenuManifeste;
    readonly fichierExistant?: IdFichierDrive;
  }): Promise<Resultat<IdFichierDrive, ErreurTransport>> {
    return nonImplemente(`TransportParPont.ecrireManifeste ${p.dossier}`);
  }

  listerDossiers(): Promise<Resultat<ReadonlyArray<ElementDrive>, ErreurTransport>> {
    return nonImplemente('TransportParPont.listerDossiers');
  }

  inventorierDossier(
    dossier: IdFichierDrive,
  ): Promise<Resultat<InventaireDossier, ErreurTransport>> {
    return nonImplemente(`TransportParPont.inventorierDossier ${dossier}`);
  }

  lireContenuManifeste(id: IdFichierDrive): Promise<Resultat<ContenuManifeste, ErreurTransport>> {
    return nonImplemente(`TransportParPont.lireContenuManifeste ${id}`);
  }

  supprimerFichier(id: IdFichierDrive): Promise<Resultat<undefined, ErreurTransport>> {
    return nonImplemente(`TransportParPont.supprimerFichier ${id}`);
  }
}
