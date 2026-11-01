import type { Horloge } from '../../../commun/application/ports/horloge';
import { succes, type Resultat } from '../../../commun/domaine/resultat';
import type { ErreurDepotLocal, ServiceEtatLocal } from '../../../synchronisation';
import type { IdObjectif } from '../../../commun/domaine/identifiants';
import type { DateCalendaire } from '../../../commun/domaine/temps/date-calendaire';
import { estObjectifPrincipal } from '../../domaine/hierarchie-objectifs';
import type { RefusMetier } from '../../domaine/refus';
import { objectifActif, sousObjectifsDe } from '../../domaine/vue-metier';
import { lireVueCourante } from './lecture-courante';
import { resumerObjectif, type ResumeObjectif } from './resumes';

// ST-US-023 §4.2, §6.5 : les candidats comprennent l'objectif lui-même s'il est principal ; leur ordre
// est donné par le modèle de vue.
export type SelecteurParent = {
  readonly objectif: ResumeObjectif;
  readonly candidats: ReadonlyArray<ResumeObjectif>;
  readonly nombreSousObjectifs: number;
  /** Jour de Paris, pour le format des délais des candidats. */
  readonly jour: DateCalendaire;
  /** Par candidat : ses sous-objectifs (atteints compris) autres que l'élément (indication SEL-PARENT-EFFECTIF). */
  readonly autresSousObjectifs: ReadonlyMap<IdObjectif, number>;
};

export class ConsulterSelecteurParent {
  constructor(
    private readonly service: ServiceEtatLocal,
    private readonly horloge: Horloge,
  ) {}

  async executer(c: {
    readonly objectifId: IdObjectif;
  }): Promise<Resultat<SelecteurParent, RefusMetier | ErreurDepotLocal>> {
    const lecture = await lireVueCourante(this.service, this.horloge);
    if (!lecture.ok) return lecture;
    const { vue, jour } = lecture.valeur;
    const objectif = objectifActif(vue, c.objectifId);
    if (!objectif.ok) return objectif;
    const principaux = [...vue.objectifs.values()].filter(estObjectifPrincipal);
    return succes({
      objectif: resumerObjectif(vue, objectif.valeur, jour),
      candidats: principaux.map((o) => resumerObjectif(vue, o, jour)),
      nombreSousObjectifs: sousObjectifsDe(vue, c.objectifId).length,
      jour,
      autresSousObjectifs: new Map(
        principaux.map((o) => [
          o.id,
          sousObjectifsDe(vue, o.id).filter((sous) => sous.id !== c.objectifId).length,
        ]),
      ),
    });
  }
}
