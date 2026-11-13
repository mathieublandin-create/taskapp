import type { Horloge } from '../../../commun/application/ports/horloge';
import { echec, succes, type Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { IdTache } from '../../../commun/domaine/identifiants';
import { actionsTache, type ActionTache } from '../../domaine/actions';
import type { RefusMetier } from '../../domaine/refus';
import { sousTachesDe, tacheActive } from '../../domaine/vue-metier';
import { lireVueCourante } from './lecture-courante';
import { resumerTache, type ResumeTache } from './resumes';

// ST-US-002 §4.2 ; ST-US-024 §4.2 (sous-tâches, sous-tâches à faire).
export type DetailTache = {
  readonly tache: ResumeTache;
  readonly sousTaches: ReadonlyArray<ResumeTache>;
  readonly sousTachesAFaire: number;
  readonly actions: ReadonlyArray<ActionTache>;
};

export class ConsulterDetailTache {
  constructor(
    private readonly service: ServiceEtatLocal,
    private readonly horloge: Horloge,
  ) {}

  async executer(id: IdTache): Promise<Resultat<DetailTache, RefusMetier | ErreurDepotLocal>> {
    const lecture = await lireVueCourante(this.service, this.horloge);
    if (!lecture.ok) return lecture;
    const { vue, jour } = lecture.valeur;
    const tache = tacheActive(vue, id);
    if (!tache.ok) return echec(tache.erreur);
    const sousTaches = sousTachesDe(vue, id);
    return succes({
      tache: resumerTache(vue, tache.valeur, jour),
      sousTaches: sousTaches.map((sousTache) => resumerTache(vue, sousTache, jour)),
      sousTachesAFaire: sousTaches.filter((s) => s.cycleDeVie.etat === 'A_FAIRE').length,
      actions: actionsTache(vue, id),
    });
  }
}
