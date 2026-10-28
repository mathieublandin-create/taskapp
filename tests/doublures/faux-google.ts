import type { Identite } from '@src/compte/domaine/identite';
import type { TempsSimule } from '../support/banc/temps-simule';
import { adresse, compte } from '../support/compte/doublures-compte';
import { FauxDrive } from './faux-drive';

/** Nom d'un compte simulé dans les scénarios (« A », « B », « C »). */
export type NomCompte = string;

/**
 * Google simulé, partagé par le banc (ST-US-022 §12.3) : comptes fictifs par nom (`sub-A`, `a@exemple.test`…) ;
 * par compte, l'accès à l'application (accordé ou retiré) et le Drive (`FauxDrive`).
 * `driveMomentanementIndisponible()` s'applique à tous les Drive, existants ou créés ensuite.
 */
export class FauxGoogle {
  readonly #drives = new Map<NomCompte, FauxDrive>();
  readonly #accesRetire = new Set<NomCompte>();
  #indisponible = false;

  constructor(private readonly temps: TempsSimule) {}

  identite(nom: NomCompte): Identite {
    if (!/^[A-Z]$/.test(nom)) throw new Error(`Compte simulé inconnu : « ${nom} »`);
    return { compte: compte(`sub-${nom}`), adresse: adresse(`${nom.toLowerCase()}@exemple.test`) };
  }

  /** Nom du compte de cette identité, s'il est simulé. */
  nomDe(identite: Identite): NomCompte | undefined {
    const [, nom] = /^sub-([A-Z])$/.exec(identite.compte) ?? [];
    return nom;
  }

  drive(nom: NomCompte): FauxDrive {
    const existant = this.#drives.get(nom);
    if (existant !== undefined) return existant;
    const drive = new FauxDrive(this.temps);
    if (this.#indisponible) drive.indisponible('toujours');
    this.#drives.set(nom, drive);
    return drive;
  }

  driveMomentanementIndisponible(): void {
    this.#indisponible = true;
    this.#drives.forEach((drive) => {
      drive.indisponible('toujours');
    });
  }

  retirerAcces(nom: NomCompte): void {
    this.#accesRetire.add(nom);
  }

  accorderAcces(nom: NomCompte): void {
    this.#accesRetire.delete(nom);
  }

  accesAccorde(nom: NomCompte): boolean {
    return !this.#accesRetire.has(nom);
  }
}
