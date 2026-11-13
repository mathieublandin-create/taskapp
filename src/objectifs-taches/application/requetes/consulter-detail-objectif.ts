import type { Horloge } from '../../../commun/application/ports/horloge';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { IdObjectif, IdTache } from '../../../commun/domaine/identifiants';
import { actionsObjectif, type ActionObjectif } from '../../domaine/actions';
import type { RefusMetier } from '../../domaine/refus';
import {
  objectifActif,
  sousObjectifsDe,
  sousTachesDe,
  tachesDirectesDe,
} from '../../domaine/vue-metier';
import { lireVueCourante } from './lecture-courante';
import { resumerObjectif, resumerTache, type ResumeObjectif, type ResumeTache } from './resumes';

// ST-US-001 §4.2 ; ST-US-023 (actions) ; ST-US-002 (tâches directes, tous états).
export type DetailObjectif = {
  readonly objectif: ResumeObjectif;
  readonly sousObjectifs: ReadonlyArray<ResumeObjectif>;
  readonly taches: ReadonlyArray<ResumeTache>;
  /** Sous-tâches des tâches directes, par identifiant de tâche parente (ST-US-002 §6.6). */
  readonly sousTachesPar: ReadonlyMap<IdTache, ReadonlyArray<ResumeTache>>;
  readonly actions: ReadonlyArray<ActionObjectif>;
};

export class ConsulterDetailObjectif {
  constructor(
    private readonly service: ServiceEtatLocal,
    private readonly horloge: Horloge,
  ) {}

  async executer(
    id: IdObjectif,
  ): Promise<Resultat<DetailObjectif, RefusMetier | ErreurDepotLocal>> {
    const lecture = await lireVueCourante(this.service, this.horloge);
    if (!lecture.ok) return lecture;
    const { vue, jour } = lecture.valeur;
    const objectif = objectifActif(vue, id);
    if (!objectif.ok) return echec(objectif.erreur);
    const taches = tachesDirectesDe(vue, id);
    return succes({
      objectif: resumerObjectif(vue, objectif.valeur, jour),
      sousObjectifs: sousObjectifsDe(vue, id).map((o) => resumerObjectif(vue, o, jour)),
      taches: taches.map((tache) => resumerTache(vue, tache, jour)),
      sousTachesPar: new Map(
        taches.map((tache) => [
          tache.id,
          sousTachesDe(vue, tache.id).map((sousTache) => resumerTache(vue, sousTache, jour)),
        ]),
      ),
      actions: actionsObjectif(vue, id),
    });
  }
}
