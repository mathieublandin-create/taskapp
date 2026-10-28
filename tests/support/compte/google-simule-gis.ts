/**
 * Google simulé côté navigateur pour FournisseurAuthWeb (ST-US-022 §14) : passerelle GIS, navigation et
 * userinfo doublés. Mêmes commandes que FauxFournisseurAuth (suite de contrat CT-AUTH-01 à 09).
 */
import { echec, succes, type Resultat } from '@src/commun/domaine/resultat';
import type { ErreurAuth, RetourGoogle } from '@src/compte/application/ports/fournisseur-auth';
import type { Identite } from '@src/compte/domaine/identite';
import { PORTEES_LOT_1 } from '@src/compte/domaine/portees';
import type { Navigation } from '@src/compte/infrastructure/auth/fournisseur-auth-web';
import type { LectureIdentite } from '@src/compte/infrastructure/auth/lecture-identite';
import type {
  DemandeGis,
  PasserelleGis,
  ReponseGis,
} from '@src/compte/infrastructure/auth/passerelle-gis';
import type { ErreurGis } from '@src/compte/infrastructure/auth/strategie-geste';

const jetonDe = (identite: Identite): string => `jeton-gis:${identite.compte}`;

export class GoogleSimuleGis {
  readonly demandesGis: Array<DemandeGis> = [];
  readonly navigations: Array<string> = [];
  #accorde: { readonly identite: Identite; readonly portees: ReadonlyArray<string> } | undefined;
  #session: Identite | undefined;
  #prochaineErreurGis: ErreurGis | undefined;
  #accesRetire = false;

  accorder(identite: Identite, portees: ReadonlyArray<string> = PORTEES_LOT_1): void {
    this.#accorde = { identite, portees };
    this.#accesRetire = false;
  }

  sessionGoogle(identite: Identite): void {
    this.#session = identite;
    this.#accorde ??= { identite, portees: PORTEES_LOT_1 };
  }

  fermerLaProchaineFenetre(): void {
    this.#prochaineErreurGis = { type: 'POPUP_CLOSED' };
  }

  retirerAcces(): void {
    this.#accesRetire = true;
    this.#session = undefined;
  }

  panneTechniqueGis(): void {
    this.#prochaineErreurGis = { type: 'POPUP_FAILED_TO_OPEN' };
  }

  readonly passerelle: PasserelleGis = {
    demanderJeton: (demande) => {
      this.demandesGis.push(demande);
      return Promise.resolve(this.#reponseGis());
    },
  };

  readonly navigation: Navigation = {
    aller: (url) => {
      this.navigations.push(url);
    },
  };

  readonly lireIdentite: LectureIdentite = (jeton) => {
    const identite = [this.#accorde?.identite, this.#session].find(
      (i) => i !== undefined && jetonDe(i) === jeton,
    );
    return Promise.resolve(
      identite === undefined
        ? echec<ErreurAuth>({ type: 'SessionARenouveler', code: 'userinfo_401' })
        : succes(identite),
    );
  };

  /** Fragment que Google renverrait pour la dernière navigation. */
  acheverRedirection(): RetourGoogle {
    const url = new URL(this.navigations.at(-1) ?? 'https://accounts.google.com/');
    const state = url.searchParams.get('state') ?? undefined;
    const silencieuse = url.searchParams.get('prompt') === 'none';
    const identite = silencieuse
      ? this.#session
      : this.#accesRetire
        ? undefined
        : this.#accorde?.identite;
    if (identite === undefined) {
      return {
        type: 'ERREUR',
        code: this.#accesRetire ? 'access_denied' : 'interaction_required',
        ...(state === undefined ? {} : { state }),
      };
    }
    return {
      type: 'JETON',
      jeton: jetonDe(identite),
      expireEnSecondes: 3_600,
      portees: this.#accorde?.portees ?? PORTEES_LOT_1,
      ...(state === undefined ? {} : { state }),
    };
  }

  #reponseGis(): Resultat<ReponseGis, ErreurGis> {
    const erreur = this.#prochaineErreurGis;
    this.#prochaineErreurGis = undefined;
    if (erreur !== undefined) return echec(erreur);
    if (this.#accesRetire) return echec({ type: 'ACCESS_DENIED' });
    const accorde = this.#accorde;
    if (accorde === undefined) return echec({ type: 'POPUP_CLOSED' });
    return succes({
      jeton: jetonDe(accorde.identite),
      expireEnSecondes: 3_599,
      portees: accorde.portees,
    });
  }
}
