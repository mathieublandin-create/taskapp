/**
 * ST-US-018 v0.4 §6.2, §13 (rang 12) ; DEC-025, DEC-026 : « Masquer le rappel » vaut pour l'instance de l'application.
 * Garde sur le banc (capacité livrée au rang 1, `MasquageRappel`) : le retour au premier plan ne remet pas le rappel ;
 * une nouvelle ouverture le remet. S17b et S21b ne vérifient pas le premier plan.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { Instant } from '@src/commun/domaine/temps/instant';
import { BancSynchro } from '@tests/support/banc/banc-synchro';
import { appliquerModifications } from '@tests/support/environnement';
import { creationObjectif } from '@tests/support/modifications';
import { ecart, idObjectif } from '@tests/support/valeurs';

let banc: BancSynchro | undefined;

afterEach(() => {
  banc?.arreter();
  banc = undefined;
});

/** Smartphone connecté au compte A, puis hors ligne avec une création en attente depuis plus de 24 h. */
const preparer = async () => {
  banc = new BancSynchro();
  const smartphone = banc.appareil('smartphone');
  const application = await smartphone.assurerOuverte();
  const identite = banc.google.identite('A');
  smartphone.fournisseur.sessionGoogle(identite);
  smartphone.fournisseur.accorder(identite);
  const connexion = await banc.executerEnLaissantPasserLeTemps(application.seConnecter.executer());
  expect(connexion.ok).toBe(true);
  await smartphone.attendreCycle();
  smartphone.reseau.couper();
  await appliquerModifications(smartphone.service, (_etat, contexte) => [
    creationObjectif({ id: idObjectif(1), intitule: 'Publier le guide' }, contexte.instant),
  ]);
  banc.temps.positionner(Instant.decaler(banc.temps.maintenant(), ecart(24 * 3_600_000 + 60_000)));
  await smartphone.controleur.rafraichir();
  return smartphone;
};

describe('Masquage de BAN-RAPPEL-24H par instance (DEC-025, DEC-026)', () => {
  it('UT-US-018-03 masqué jusqu’à une nouvelle instance — absent après « Masquer le rappel », toujours absent après un retour au premier plan, de nouveau affiché après fermeture et réouverture', async () => {
    const smartphone = await preparer();
    expect((await smartphone.vueAffichee()).bandeau?.code).toBe('BAN-RAPPEL-24H');

    await smartphone.controleur.masquerRappel();
    expect((await smartphone.vueAffichee()).bandeau).toBeUndefined();

    smartphone.passerAuSecondPlan();
    await smartphone.revenirAuPremierPlan();
    await smartphone.controleur.rafraichir();
    expect((await smartphone.vueAffichee()).bandeau).toBeUndefined();

    smartphone.fermerApplication();
    await smartphone.ouvrirApplication();
    await smartphone.controleur.rafraichir();
    expect((await smartphone.vueAffichee()).bandeau?.code).toBe('BAN-RAPPEL-24H');
  });
});
