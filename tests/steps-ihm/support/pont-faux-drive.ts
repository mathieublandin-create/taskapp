/**
 * Côté processus cucumber du pont du Drive de la composition `test-ihm` (ST-US-018 v0.4 §6.4 ; ST-US-031 §6.5) :
 * binding `donejuanFauxDrive` de la page. Chaque appel s'adresse au `FauxDrive` du compte dont le jeton est en mémoire
 * dans la page (`PontFauxGoogle.compteConnecte`), comme le transport du banc (`AppareilSimule`) ; sans compte :
 * `NonAutorise`. Le réseau de la page est contrôlé par la page (`navigator.onLine`) : ici il est toujours joignable.
 * « Porte » : les réponses peuvent être retenues, comme la porte du banc, pour observer ce que la page affiche avant
 * toute réponse du Drive (ST-US-017 §12.1 n° 10).
 */
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import { echec } from '@src/commun/domaine/resultat';
import { encoderPont } from '@src/composition/test-ihm/codec-pont';
import type { FauxGoogle, NomCompte } from '../../doublures/faux-google';
import { ReseauSimule } from '../../doublures/reseau-simule';
import { repondrePontDrive } from '../../support/ihm/repondre-pont-drive';

export type DependancesPontFauxDrive = {
  readonly google: FauxGoogle;
  /** Identité de l'appareil piloté par le navigateur auprès du Drive (`IDENTIFIANTS_APPAREILS`). */
  readonly appareil: () => IdAppareil;
  /** Compte du jeton en mémoire dans la page. */
  readonly compte: () => NomCompte | undefined;
};

export class PontFauxDrive {
  readonly #reseau = new ReseauSimule();
  #porte: Promise<void> = Promise.resolve();
  #ouvrirPorte: (() => void) | undefined;
  #appelsEnCours = 0;

  constructor(private readonly dependances: DependancesPontFauxDrive) {}

  /** Retient les réponses du Drive jusqu'à `liberer()`. */
  retenir(): void {
    if (this.#ouvrirPorte !== undefined) return;
    this.#porte = new Promise<void>((resoudre) => {
      this.#ouvrirPorte = resoudre;
    });
  }

  liberer(): void {
    this.#ouvrirPorte?.();
    this.#ouvrirPorte = undefined;
  }

  /** Appels du pont reçus et pas encore répondus (retenus compris). */
  appelsEnCours(): number {
    return this.#appelsEnCours;
  }

  /** Réponse au binding `donejuanFauxDrive(methode, argumentsJson)`. */
  async repondre(methode: string, argumentsJson: string): Promise<string> {
    this.#appelsEnCours += 1;
    try {
      await this.#porte;
      return await this.#transport(methode, argumentsJson);
    } finally {
      this.#appelsEnCours -= 1;
    }
  }

  async #transport(methode: string, argumentsJson: string): Promise<string> {
    const { google, appareil, compte } = this.dependances;
    const nom = compte();
    if (nom === undefined) return encoderPont(echec({ type: 'NonAutorise' }));
    const transport = google.drive(nom).transportPour(appareil(), {
      reseau: this.#reseau,
      accesAccorde: () => google.accesAccorde(nom),
    });
    return repondrePontDrive(transport, methode, argumentsJson);
  }
}
