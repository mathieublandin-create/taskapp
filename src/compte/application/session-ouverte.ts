import type { Identite } from '../domaine/identite';
import type { SessionCourante } from './session-courante';

/** Identité de la session en mémoire (ouverte ou en attente de Google) ; undefined sans session. */
export const identiteCourante = (session: SessionCourante): Identite | undefined => {
  const etat = session.etat();
  return etat.type === 'SANS_SESSION' ? undefined : etat.identite;
};
