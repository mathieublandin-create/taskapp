/**
 * Tests complémentaires (rang 12, tranche D3) des ponts du processus cucumber du profil `ihm`
 * (`tests/steps-ihm/support/`) : ce sont eux qui décident de ce que la page reçoit du Google et du Drive simulés.
 * UT-COMP-US-018-38 (Google simulé), UT-COMP-US-018-39 (Drive simulé).
 */
import { describe, expect, it } from 'vitest';
import { ErreurProgrammation } from '@src/commun/domaine/erreur-programmation';
import { decoderPont, encoderPont } from '@src/composition/test-ihm/codec-pont';
import { FauxGoogle } from '@tests/doublures/faux-google';
import { IDENTIFIANTS_APPAREILS } from '@tests/support/banc/appareil-simule';
import { TempsSimule } from '@tests/support/banc/temps-simule';
import { PontFauxDrive } from '@tests/steps-ihm/support/pont-faux-drive';
import { PontFauxGoogle } from '@tests/steps-ihm/support/pont-faux-google';
import { instant } from '@tests/support/valeurs';

const ATTENTE_REPONSE_MS = 20;
const PORTEES = ['openid', 'email', 'https://www.googleapis.com/auth/drive.file'];

const nouveauGoogle = () => {
  const temps = new TempsSimule(instant('2026-10-21T08:00:00.000Z'));
  const google = new FauxGoogle(temps);
  return { google, pont: new PontFauxGoogle(google, temps) };
};

const demande = (mode: string) =>
  encoderPont([{ mode, portees: PORTEES, indice: 'a@exemple.test' }]);

describe('UT-COMP-US-018-38 : PontFauxGoogle', () => {
  it('UT-COMP-US-018-38 : la connexion obtient l’accès du compte accordé, dont le Drive devient celui de la page', async () => {
    const { google, pont } = nouveauGoogle();
    pont.ouvrirSession('A');

    const reponse = decoderPont(await pont.repondre('demanderJeton', demande('CONNEXION')));

    expect(reponse).toEqual({
      ok: true,
      valeur: { porteesAccordees: PORTEES, identite: google.identite('A') },
    });
    expect(pont.compteConnecte()).toBe('A');
  });

  it('UT-COMP-US-018-38 : le renouvellement d’ouverture réussit avec une session Google, par la redirection silencieuse simulée', async () => {
    const { google, pont } = nouveauGoogle();
    pont.ouvrirSession('A');

    const reponse = decoderPont(
      await pont.repondre('demanderJeton', demande('RENOUVELLEMENT_OUVERTURE')),
    );

    expect(reponse).toEqual({
      ok: true,
      valeur: { porteesAccordees: PORTEES, identite: google.identite('A') },
    });
  });

  it('UT-COMP-US-018-38 : sans session Google, le renouvellement d’ouverture est « à renouveler » et aucun compte n’est connecté', async () => {
    const { pont } = nouveauGoogle();

    const reponse = decoderPont(
      await pont.repondre('demanderJeton', demande('RENOUVELLEMENT_OUVERTURE')),
    );

    expect(reponse).toEqual({
      ok: false,
      erreur: { type: 'SessionARenouveler', code: 'interaction_required' },
    });
    expect(pont.compteConnecte()).toBeUndefined();
  });

  it('UT-COMP-US-018-38 : « oublier » retire le compte connecté ; une méthode inconnue est une erreur de programmation', async () => {
    const { pont } = nouveauGoogle();
    pont.ouvrirSession('A');
    await pont.repondre('demanderJeton', demande('CONNEXION'));

    expect(decoderPont(await pont.repondre('oublier', encoderPont([])))).toBeNull();
    expect(pont.compteConnecte()).toBeUndefined();
    await expect(pont.repondre('inconnue', encoderPont([]))).rejects.toThrow(ErreurProgrammation);
  });
});

describe('UT-COMP-US-018-39 : PontFauxDrive', () => {
  const nouveauPont = (compte: () => string | undefined) => {
    const { google } = nouveauGoogle();
    const pont = new PontFauxDrive({
      google,
      appareil: () => IDENTIFIANTS_APPAREILS.pc,
      compte,
    });
    return { google, pont };
  };

  it('UT-COMP-US-018-39 : sans compte connecté, tout appel est « non autorisé »', async () => {
    const { pont } = nouveauPont(() => undefined);

    const reponse = decoderPont(await pont.repondre('preparerDossier', encoderPont([])));

    expect(reponse).toEqual({ ok: false, erreur: { type: 'NonAutorise' } });
  });

  it('UT-COMP-US-018-39 : avec un compte connecté, l’appel atteint le Drive de ce compte ; accès retiré : « non autorisé »', async () => {
    const { google, pont } = nouveauPont(() => 'A');

    const accordee = decoderPont(await pont.repondre('preparerDossier', encoderPont([])));
    google.retirerAcces('A');
    const retiree = decoderPont(await pont.repondre('preparerDossier', encoderPont([])));

    expect(accordee).toMatchObject({ ok: true });
    expect(retiree).toEqual({ ok: false, erreur: { type: 'NonAutorise' } });
  });

  it('UT-COMP-US-018-39 : la porte retient la réponse, comptée en cours, jusqu’à sa libération', async () => {
    const { pont } = nouveauPont(() => 'A');
    pont.retenir();

    let repondu = false;
    const appel = pont.repondre('preparerDossier', encoderPont([])).then((reponse) => {
      repondu = true;
      return reponse;
    });
    // Largement le temps qu'une réponse non retenue aurait mis (FauxDrive en mémoire).
    await new Promise((resoudre) => setTimeout(resoudre, ATTENTE_REPONSE_MS));

    expect(pont.appelsEnCours()).toBe(1);
    expect(repondu).toBe(false);
    pont.liberer();
    expect(decoderPont(await appel)).toMatchObject({ ok: true });
    expect(pont.appelsEnCours()).toBe(0);
  });
});
