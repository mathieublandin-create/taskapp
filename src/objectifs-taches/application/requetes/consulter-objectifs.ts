import type { Horloge } from '../../../commun/application/ports/horloge';
import { succes, type Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import { lireVueCourante } from './lecture-courante';
import { resumerObjectif, type ResumeObjectif } from './resumes';

// ST-US-001 §4.2 : tous les objectifs actifs, principaux et sous-objectifs.
export type ObjectifsConsultes = {
  readonly objectifs: ReadonlyArray<ResumeObjectif>;
  readonly existeAuMoinsUneTache: boolean;
};

export class ConsulterObjectifs {
  constructor(
    private readonly service: ServiceEtatLocal,
    private readonly horloge: Horloge,
  ) {}

  async executer(): Promise<Resultat<ObjectifsConsultes, ErreurDepotLocal>> {
    const lecture = await lireVueCourante(this.service, this.horloge);
    if (!lecture.ok) return lecture;
    const { vue, jour } = lecture.valeur;
    return succes({
      objectifs: [...vue.objectifs.values()].map((o) => resumerObjectif(vue, o, jour)),
      existeAuMoinsUneTache: vue.taches.size > 0,
    });
  }
}
