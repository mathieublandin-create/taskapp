import type { Horloge } from '../../../commun/application/ports/horloge';
import { succes, type Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import { lireVueCourante } from './lecture-courante';
import { resumerTache, type ResumeTache } from './resumes';

// ST-US-002 §4.2 : tâches sans tâche parente, tous états.
export type TachesConsultees = {
  readonly taches: ReadonlyArray<ResumeTache>;
  readonly existeAuMoinsUnObjectif: boolean;
};

export class ConsulterTaches {
  constructor(
    private readonly service: ServiceEtatLocal,
    private readonly horloge: Horloge,
  ) {}

  async executer(): Promise<Resultat<TachesConsultees, ErreurDepotLocal>> {
    const lecture = await lireVueCourante(this.service, this.horloge);
    if (!lecture.ok) return lecture;
    const { vue, jour } = lecture.valeur;
    return succes({
      taches: [...vue.taches.values()]
        .filter((tache) => tache.tacheParenteId === undefined)
        .map((tache) => resumerTache(vue, tache, jour)),
      existeAuMoinsUnObjectif: vue.objectifs.size > 0,
    });
  }
}
