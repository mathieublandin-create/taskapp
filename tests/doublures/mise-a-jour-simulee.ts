import type {
  IssueMiseAJour,
  MiseAJourApplication,
} from '@src/synchronisation/application/ports/mise-a-jour-application';

/** « Mettre à jour » du banc (ST-US-017 v0.11 §12.7) : compte les appels, annonce un rechargement. */
export class MiseAJourSimulee implements MiseAJourApplication {
  appels = 0;

  mettreAJour(): Promise<IssueMiseAJour> {
    this.appels += 1;
    return Promise.resolve('RECHARGEMENT_LANCE');
  }
}
