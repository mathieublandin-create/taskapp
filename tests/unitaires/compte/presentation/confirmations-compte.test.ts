import { describe, expect, it } from 'vitest';
import { consulterCompte } from '@src/compte/application/requetes/consulter-compte';
import { SessionCourante } from '@src/compte/application/session-courante';
import { construireConfirmationCompte } from '@src/compte/presentation/modeles-de-vue/confirmations-compte';
import { IDENTITE_A } from '@tests/support/compte/doublures-compte';

describe('Confirmations et vue du compte (ECR-011, guide §6.6.7)', () => {
  it('UT-COMP-US-022-50 construireConfirmationCompte — bouton, couleur et décompte de chaque confirmation', () => {
    const deconnexion = construireConfirmationCompte({ code: 'CNF-DECONNEXION', n: 2 });
    expect(deconnexion).toMatchObject({ boutonAction: 'Se déconnecter', rouge: false });
    expect(deconnexion.texte).toContain('2 modifications ne sont pas encore enregistrées');
    expect(construireConfirmationCompte({ code: 'CNF-DECONNEXION', n: 1 }).texte).toContain(
      '1 modification n’est pas encore enregistrée',
    );
    expect(construireConfirmationCompte({ code: 'CNF-SUPPR-DONNEES' })).toMatchObject({
      boutonAction: 'Supprimer les données',
      rouge: true,
    });
    expect(construireConfirmationCompte({ code: 'CNF-SUPPR-DONNEES-PERTE', n: 3 })).toEqual({
      code: 'CNF-SUPPR-DONNEES-PERTE',
      titre: '3 modifications seraient perdues',
      boutonAction: 'Supprimer quand même',
      rouge: true,
    });
  });

  it('UT-COMP-US-022-51 consulterCompte — racine et adresse selon l’état de la session', () => {
    const session = new SessionCourante();
    expect(consulterCompte(session)).toEqual({ racine: 'CONNEXION' });
    session.attendreGoogle(IDENTITE_A);
    expect(consulterCompte(session)).toEqual({
      racine: 'ATTENTE_GOOGLE',
      adresse: IDENTITE_A.adresse,
    });
    session.ouvrir(IDENTITE_A, 'VALIDE');
    expect(consulterCompte(session)).toEqual({
      racine: 'APPLICATION',
      adresse: IDENTITE_A.adresse,
    });
  });

  it('UT-COMP-US-022-52 SessionCourante — observateurs prévenus à chaque changement ; changerAcces sans session refusé', () => {
    const session = new SessionCourante();
    const vus: Array<string> = [];
    const annuler = session.observer((e) => vus.push(e.type));

    expect(() => {
      session.changerAcces('VALIDE');
    }).toThrow();
    session.ouvrir(IDENTITE_A, 'A_RENOUVELER');
    session.changerAcces('A_RENOUVELER');
    session.changerAcces('VALIDE');
    session.fermer();
    session.fermer();
    annuler();
    session.ouvrir(IDENTITE_A, 'VALIDE');

    expect(vus).toEqual(['OUVERTE', 'OUVERTE', 'SANS_SESSION']);
  });
});
