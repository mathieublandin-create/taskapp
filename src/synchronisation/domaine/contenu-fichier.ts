import type { IdAppareil } from '../../commun/domaine/identifiants';
import type { RegistreQuelconque } from './ecriture';
import type { EvenementJournal } from './evenement-journal';
import type { Hlc } from './hlc';

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
};

export type ContenuManifeste = {
  readonly schemaVersion: number;
  readonly generation: Generation;
  readonly restauration?: Hlc;
};
