import type { EtatReseau } from '../../commun/application/ports/etat-reseau';
import { echec, type Resultat } from '../../commun/domaine/resultat';
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
import { decoderPont, encoderPont } from './codec-pont';

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

  /** Seule logique du transport : contrôle du réseau de la page, puis appel nommé du pont (aucune validation). */
  private async appeler<T>(
    methode: keyof TransportSynchro,
    ...args: ReadonlyArray<unknown>
  ): Promise<Resultat<T, ErreurTransport>> {
    if (!this.dependances.reseau.estConnecte()) return echec({ type: 'ReseauIndisponible' });
    const reponse = await this.dependances.pont(methode, encoderPont(args));
    // Le pont rend le Resultat encodé par le transport du FauxDrive (repondrePontDrive) : même type, par construction.
    return decoderPont(reponse) as Resultat<T, ErreurTransport>;
  }

  preparerDossier(): Promise<Resultat<IdFichierDrive, ErreurTransport>> {
    return this.appeler('preparerDossier');
  }

  listerFichiersAppareils(
    dossier: IdFichierDrive,
  ): Promise<Resultat<Changements, ErreurTransport>> {
    return this.appeler('listerFichiersAppareils', dossier);
  }

  changements(
    dossier: IdFichierDrive,
    jeton: string,
  ): Promise<Resultat<Changements, ErreurTransport>> {
    return this.appeler('changements', dossier, jeton);
  }

  lireFichierAppareil(
    id: IdFichierDrive,
  ): Promise<Resultat<ContenuFichierAppareil, ErreurTransport>> {
    return this.appeler('lireFichierAppareil', id);
  }

  deposerFichierAppareil(p: {
    readonly dossier: IdFichierDrive;
    readonly contenu: ContenuFichierAppareil;
    readonly fichierExistant?: IdFichierDrive;
  }): Promise<Resultat<FichierDepose, ErreurTransport>> {
    return this.appeler('deposerFichierAppareil', p);
  }

  lireManifeste(
    dossier: IdFichierDrive,
  ): Promise<Resultat<ManifesteDistant | undefined, ErreurTransport>> {
    return this.appeler('lireManifeste', dossier);
  }

  ecrireManifeste(p: {
    readonly dossier: IdFichierDrive;
    readonly contenu: ContenuManifeste;
    readonly fichierExistant?: IdFichierDrive;
  }): Promise<Resultat<IdFichierDrive, ErreurTransport>> {
    return this.appeler('ecrireManifeste', p);
  }

  listerDossiers(): Promise<Resultat<ReadonlyArray<ElementDrive>, ErreurTransport>> {
    return this.appeler('listerDossiers');
  }

  inventorierDossier(
    dossier: IdFichierDrive,
  ): Promise<Resultat<InventaireDossier, ErreurTransport>> {
    return this.appeler('inventorierDossier', dossier);
  }

  lireContenuManifeste(id: IdFichierDrive): Promise<Resultat<ContenuManifeste, ErreurTransport>> {
    return this.appeler('lireContenuManifeste', id);
  }

  supprimerFichier(id: IdFichierDrive): Promise<Resultat<undefined, ErreurTransport>> {
    return this.appeler('supprimerFichier', id);
  }
}
