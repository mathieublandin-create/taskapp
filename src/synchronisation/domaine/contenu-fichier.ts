import type { IdAppareil } from '../../commun/domaine/identifiants';
import type { RegistreQuelconque } from './ecriture';
import type { EvenementJournal } from './evenement-journal';
import type { Hlc } from './hlc';
import type { Inconnus } from './inconnus';
import type { Lecture } from './lectures';
import type { ValeurEcartee } from './valeurs-ecartees';

// ST-socle-ecriture.md §5.3 ; DAT §4.2, §4.2.2 (ST-US-017 §4.1).
export type Generation =
  { readonly type: 'INITIALE' } | { readonly type: 'NOUVELLE'; readonly hlc: Hlc };

export type ContenuFichierAppareil = {
  readonly schemaVersion: number;
  readonly versionApplication: string;
  readonly generation: Generation;
  readonly appareil: IdAppareil;
  readonly registres: ReadonlyArray<RegistreQuelconque>;
  readonly journal: ReadonlyArray<EvenementJournal>;
  /** ST-US-017 v0.5 §5.2 (incrément 2) : absent ≡ vide ; présents si et seulement si non vides, triés par identifiant. */
  readonly valeursEcartees?: ReadonlyArray<ValeurEcartee>;
  readonly lectures?: ReadonlyArray<Lecture>;
  /**
   * ST-US-017 v0.11 §5.2, §6.8 n° 12 (incrément 4, RG-058, ANT-19) : registres et entrées de journal inconnus de cette
   * version, conservés ; présent si et seulement si non vide (`sontVides` faux).
   */
  readonly inconnus?: Inconnus;
};

export type ContenuManifeste = {
  readonly schemaVersion: number;
  readonly generation: Generation;
  readonly restauration?: Hlc;
};
