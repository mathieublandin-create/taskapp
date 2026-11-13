/** Étapes du Drive simulé (glossaire d'étapes §1, §6 ; ST-US-022 §12.1 n° 15 à 17, 43 ; ST-US-017 §12.1 n° 11 à 14). */
import assert from 'node:assert/strict';
import { Given, Then, When } from '@cucumber/cucumber';
import { SCHEMA_VERSION } from '@src/synchronisation/domaine/version-schema';
import { connecter } from '../../support/compte/etapes-compte';
import { convertirAppareil, FRAGMENT_APPAREIL, FRAGMENT_DATE } from '../../support/conversions';
import type { MondeDoneJuan } from '../../support/monde';
import type { NomAppareil } from '../../support/banc/appareil-simule';
import { ecart } from '../../support/valeurs';
import {
  driveDesAppareils,
  photographier,
  verifierFichierAltereIntact,
  verifierRienReecrit,
} from '../../support/synchronisation/alteration-drive';
import { FILTRES_ETAT } from '../../support/taches';
import { creerObjectifEnregistre } from '../../support/synchronisation/echanges';
import { resoudreObjectif } from '../../support/objectifs';
import {
  formatDuFichierDe,
  reecrireFichierDuPcParVersionRecente,
} from '../../support/synchronisation/versions-application';
import type { FauxDrive } from '../../doublures/faux-drive';
import {
  etatMetierDansEspace,
  etatMetierDuDrive,
  identifiantsDe,
  identifiantsDuCompte,
  driveDeLAppareil,
  objectifsDuDrive,
  tachesDuDrive,
} from '../../support/synchronisation/drive-banc';

const DOSSIER = 'application/vnd.google-apps.folder';

Given(
  "(que )le Drive du compte {string} ne contient aucune donnée de l'application",
  function (this: MondeDoneJuan, nomCompte: string) {
    assert.deepEqual(this.banc.google.drive(nomCompte).fichiers(), []);
  },
);

Given('(que )le Drive est momentanément indisponible', function (this: MondeDoneJuan) {
  this.banc.google.driveMomentanementIndisponible();
});

// ST-US-017 §12.6 n° R12 : fin de l'indisponibilité momentanée (S23).
When('le Drive redevient disponible', function (this: MondeDoneJuan) {
  this.banc.google.driveRedevientDisponible();
});

Given(
  '(que )le Drive est désactivé pour le compte {string}',
  function (this: MondeDoneJuan, nomCompte: string) {
    this.banc.google.drive(nomCompte).desactiverPourLeCompte();
  },
);

Then(
  "aucune donnée n'est créée dans le Drive du compte {string}",
  function (this: MondeDoneJuan, nomCompte: string) {
    assert.deepEqual(this.banc.google.drive(nomCompte).fichiers(), []);
  },
);

Then(
  'le Drive du compte {string} contient un dossier visible nommé {string}',
  function (this: MondeDoneJuan, nomCompte: string, nom: string) {
    const dossiers = this.banc.google
      .drive(nomCompte)
      .fichiers()
      .filter((f) => f.nom === nom && f.mimeType === DOSSIER && !f.supprime);
    assert.equal(dossiers.length, 1, `Dossier « ${nom} » absent ou en double`);
    assert.equal(dossiers[0]?.parent, undefined, 'Le dossier doit être à la racine du Drive');
  },
);

// ---------------------------------------------------------------- Contenu du Drive (ST-US-017 §12.1 n° 11 à 14)

const TEXTE = '"([^"]*)"';
const DATE = `(${FRAGMENT_DATE})`;

/** L'unique objectif non supprimé de cet intitulé dans le Drive du compte. */
const objectifUniqueDuDrive = async (monde: MondeDoneJuan, compte: string, intitule: string) => {
  const trouves = await objectifsDuDrive(monde.banc.google.drive(compte), intitule);
  assert.equal(
    trouves.length,
    1,
    `Drive du compte ${compte} : ${String(trouves.length)} objectif(s) « ${intitule} »`,
  );
  return trouves[0];
};

Then(
  new RegExp(`^le Drive du compte ${TEXTE} contient l'objectif ${TEXTE}$`),
  async function (this: MondeDoneJuan, compte: string, intitule: string) {
    await objectifUniqueDuDrive(this, compte, intitule);
  },
);

Then(
  new RegExp(`^le Drive du compte ${TEXTE} contient l'objectif ${TEXTE} exactement une fois$`),
  async function (this: MondeDoneJuan, compte: string, intitule: string) {
    await objectifUniqueDuDrive(this, compte, intitule);
  },
);

/** « contient la tâche » (comme l'objectif) et « … exactement une fois » : un seul élément non supprimé. */
const verifierTacheUniqueDuDrive = async (
  monde: MondeDoneJuan,
  compte: string,
  intitule: string,
): Promise<void> => {
  const trouvees = await tachesDuDrive(monde.banc.google.drive(compte), intitule);
  assert.equal(
    trouvees.length,
    1,
    `Drive du compte ${compte} : ${String(trouvees.length)} tâche(s) « ${intitule} »`,
  );
};

Then(
  new RegExp(`^le Drive du compte ${TEXTE} contient la tâche ${TEXTE}( exactement une fois)?$`),
  async function (this: MondeDoneJuan, compte: string, intitule: string, _exactement?: string) {
    await verifierTacheUniqueDuDrive(this, compte, intitule);
  },
);

Then(
  new RegExp(`^le Drive du compte ${TEXTE} contient la tâche ${TEXTE} à l'état ${TEXTE}$`),
  async function (this: MondeDoneJuan, compte: string, intitule: string, etat: string) {
    const attendu = FILTRES_ETAT[etat];
    assert.ok(attendu !== undefined, `État de tâche inconnu : « ${etat} »`);
    const trouvees = await tachesDuDrive(this.banc.google.drive(compte), intitule);
    assert.equal(
      trouvees.length,
      1,
      `Drive du compte ${compte} : ${String(trouvees.length)} tâche(s) « ${intitule} »`,
    );
    assert.equal(trouvees[0]?.cycleDeVie.etat, attendu);
  },
);

Then(
  new RegExp(`^le Drive du compte ${TEXTE} ne contient pas encore la tâche ${TEXTE}$`),
  async function (this: MondeDoneJuan, compte: string, intitule: string) {
    assert.deepEqual(await tachesDuDrive(this.banc.google.drive(compte), intitule), []);
  },
);

/** ST-US-017 §12.1 n° 20 : l'état métier de l'appareil est égal à la projection du Drive (hors marque d'attente). */
Then(
  new RegExp(`^sur le (${FRAGMENT_APPAREIL}), les données sont identiques à celles enregistrées$`),
  async function (this: MondeDoneJuan, nomAppareil: string) {
    const appareil = this.banc.appareil(convertirAppareil(nomAppareil));
    const drive = driveDeLAppareil(this, appareil);
    const identite = appareil.fournisseur.identiteDuJetonEnMemoire();
    const compte = identite === undefined ? undefined : this.banc.google.nomDe(identite);
    assert.ok(
      drive !== undefined && compte !== undefined,
      `Le ${nomAppareil} n'est connecté à aucun compte`,
    );
    const local = await etatMetierDansEspace(this, appareil, compte);
    assert.ok(local !== undefined, `Aucune donnée locale sur le ${nomAppareil}`);
    const sansAttente = <T extends { readonly enAttente: boolean }>(m: ReadonlyMap<string, T>) =>
      [...m.entries()]
        .map(([id, v]) => [id, { ...v, enAttente: false }] as const)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    const distant = await etatMetierDuDrive(drive);
    assert.ok(
      local.objectifs.size + local.taches.size > 0 ||
        distant.objectifs.size + distant.taches.size > 0,
      `Les états local et distant du ${nomAppareil} sont tous deux vides : comparaison sans valeur`,
    );
    assert.deepEqual(sansAttente(local.objectifs), sansAttente(distant.objectifs));
    assert.deepEqual(sansAttente(local.taches), sansAttente(distant.taches));
  },
);

Then(
  new RegExp(`^le Drive du compte ${TEXTE} contient l'objectif ${TEXTE} avec le délai ${DATE}$`),
  async function (this: MondeDoneJuan, compte: string, intitule: string, delai: string) {
    assert.equal((await objectifUniqueDuDrive(this, compte, intitule))?.delai, delai);
  },
);

Then(
  new RegExp(`^le Drive du compte ${TEXTE} ne contient pas l'objectif ${TEXTE}$`),
  async function (this: MondeDoneJuan, compte: string, intitule: string) {
    assert.deepEqual(await objectifsDuDrive(this.banc.google.drive(compte), intitule), []);
  },
);

Then(
  new RegExp(`^le Drive du compte ${TEXTE} ne contient aucune donnée du compte ${TEXTE}$`),
  async function (this: MondeDoneJuan, compte: string, autre: string) {
    const contenu = identifiantsDe(await etatMetierDuDrive(this.banc.google.drive(compte)));
    const autres = await identifiantsDuCompte(this, autre);
    assert.deepEqual(
      [...contenu].filter((id) => autres.has(id)),
      [],
      `Données du compte ${autre} dans le Drive du compte ${compte}`,
    );
  },
);

// Glossaire §12 : le banc n'observe aucune requête sortante hors du service Google simulé (hooks.ts).
Then(
  new RegExp(
    `^aucune donnée de l'application n'a été transmise ailleurs que dans le Drive du compte ${TEXTE}$`,
  ),
  function (this: MondeDoneJuan, compte: string) {
    assert.deepEqual(this.requetesInterdites, []);
    assert.ok(
      this.banc.google.drive(compte).fichiers().length > 0,
      `Rien n'a été transmis au Drive du compte ${compte}`,
    );
  },
);

Given(
  new RegExp(`^(?:que )?le Drive du compte ${TEXTE} est plein$`),
  function (this: MondeDoneJuan, compte: string) {
    this.banc.google.drive(compte).plein();
  },
);

When(
  new RegExp(`^de l'espace est libéré dans le Drive du compte ${TEXTE}$`),
  function (this: MondeDoneJuan, compte: string) {
    this.banc.google.drive(compte).liberer();
  },
);

// n° 14 : le PC du banc est connecté au compte si besoin, crée l'objectif et le dépose.
Given(
  new RegExp(
    `^(?:que )?le Drive du compte ${TEXTE} contient un objectif ${TEXTE} de délai ${DATE} enregistré par le (${FRAGMENT_APPAREIL})$`,
  ),
  async function (
    this: MondeDoneJuan,
    compte: string,
    intitule: string,
    delai: string,
    nomAppareil: string,
  ) {
    const appareil = this.banc.appareil(convertirAppareil(nomAppareil));
    const application = await appareil.assurerOuverte();
    if (application.espace() === undefined) await connecter(this, appareil, compte);
    await creerObjectifEnregistre(this, appareil, intitule, delai);
  },
);

/** Passe de la minute : les reprises du cycle après un dépôt interrompu sont espacées d'au plus quelques minutes. */
const UNE_MINUTE = ecart(60_000);
const MINUTES_MAX_AVANT_DEPOT = 60;

/**
 * ST-US-017 §12.1 n° 7 : les n prochains dépôts du Drive du compte échouent ; le banc laisse passer le temps
 * jusqu'à ce que plus aucune modification n'attende dans les appareils ouverts.
 */
When(
  "l'envoi au Drive est interrompu {int} fois avant d'aboutir",
  async function (this: MondeDoneJuan, fois: number) {
    const ouverts = this.banc.appareils().filter((a) => a.estOuverte());
    for (const appareil of ouverts) driveDeLAppareil(this, appareil)?.interrompreDepots(fois);
    const enAttente = async (): Promise<number> => {
      let total = 0;
      for (const appareil of ouverts) {
        total += (await appareil.application.consulterEtat())?.enAttente ?? 0;
      }
      return total;
    };
    for (let minute = 0; minute < MINUTES_MAX_AVANT_DEPOT && (await enAttente()) > 0; minute += 1) {
      await this.banc.avancerTemps(UNE_MINUTE);
    }
    assert.equal(await enAttente(), 0, "Des modifications attendent encore après l'interruption");
  },
);

// ---------------------------------------------------------------- Altérations hors application (ST-US-017 §12.6 n° R1 à R2, R13, R14)

/** Altération faite par un tiers : le banc est au repos, puis le Drive est photographié (références de R13 et R14). */
const alterer = async (
  monde: MondeDoneJuan,
  alteration: (drive: FauxDrive) => void,
): Promise<void> => {
  await monde.banc.attendreCycles();
  const drive = driveDesAppareils(monde);
  alteration(drive);
  monde.photoDrive = photographier(drive);
};

Given(
  /^(?:que )?les données de l'application ont été (supprimées|rendues illisibles) dans le Drive, en dehors de l'application$/,
  async function (this: MondeDoneJuan, alteration: string) {
    await alterer(this, (drive) => {
      if (alteration === 'supprimées') drive.supprimerDonnees();
      else drive.rendreDonneesIllisibles();
    });
  },
);

/** Fichier de données de l'appareil, tel qu'il est déposé dans le Drive. */
const fichierDeLAppareil = (monde: MondeDoneJuan, drive: FauxDrive, nom: NomAppareil) => {
  const fichier = drive.fichierDe(monde.banc.appareil(nom).appareilId);
  assert.ok(fichier, `Aucun fichier de données du ${nom} dans le Drive`);
  return fichier;
};

Given(
  "(que )le fichier de données du {appareil} a été modifié à la main dans le Drive, en dehors de l'application, et reste lisible",
  async function (this: MondeDoneJuan, nom: NomAppareil) {
    await alterer(this, (drive) => {
      const { id } = fichierDeLAppareil(this, drive, nom);
      drive.modifierFichierALaMain(id);
      this.fichiersAlteres.set(nom, id);
    });
  },
);

Given(
  new RegExp(
    `^(?:que )?dans le fichier de données du (${FRAGMENT_APPAREIL}), le délai de l'objectif ${TEXTE} a été changé à la main en ${DATE}, le fichier restant lisible$`,
  ),
  async function (this: MondeDoneJuan, nomAppareil: string, intitule: string, delai: string) {
    const nom = convertirAppareil(nomAppareil);
    const objectifId = await resoudreObjectif(this, this.banc.appareil(nom), intitule);
    await alterer(this, (drive) => {
      const { id } = fichierDeLAppareil(this, drive, nom);
      drive.modifierDelaiALaMain(id, objectifId, delai);
      this.fichiersAlteres.set(nom, id);
    });
  },
);

Then("rien n'a été réécrit dans le Drive", function (this: MondeDoneJuan) {
  verifierRienReecrit(this);
});

Then(
  "le fichier de données du {appareil} n'a pas été réécrit dans le Drive",
  function (this: MondeDoneJuan, nom: NomAppareil) {
    verifierFichierAltereIntact(this, nom);
  },
);

// ---------------------------------------------------------------- Formats et versions (ST-US-017 v0.11 §12.7 V1, V7, V10)

// V1 (S30, S30b ; US-022 S24, S25) : le PC passe au format plus récent ; les écritures des appareils sont repérées.
Given(
  '(que )le PC a enregistré dans le Drive des données dans un format plus récent que celui que connaît le smartphone',
  async function (this: MondeDoneJuan) {
    await this.banc.attendreCycles();
    const drive = driveDesAppareils(this);
    await drive.passerAuFormatPlusRecent(this.banc.appareil('pc').appareilId);
    this.driveSuivi = drive;
    for (const appareil of this.banc.appareils()) {
      this.ecrituresDepuis.set(appareil.nom, drive.ecrituresPar(appareil.identifiantDrive));
    }
  },
);

// V7 : en consultation seule, aucune écriture (dépôt, manifeste, corbeille) depuis V1.
Then(
  "aucune écriture n'a été faite dans le Drive par le {appareil}",
  function (this: MondeDoneJuan, nomAppareil: NomAppareil) {
    const appareil = this.banc.appareil(nomAppareil);
    const avant = this.ecrituresDepuis.get(nomAppareil);
    assert.ok(avant !== undefined, `Écritures du ${nomAppareil} non repérées (format plus récent)`);
    const drive = this.driveSuivi;
    assert.ok(drive, 'Aucun Drive suivi');
    assert.equal(drive.ecrituresPar(appareil.identifiantDrive), avant, `Le ${nomAppareil} a écrit`);
  },
);

// V10 (S31, Q-ST017-PEP-5) : la version plus récente du PC ajoute des éléments inconnus au même `schemaVersion`.
Given(
  "(que )le PC utilise une version de l'application plus récente que celle du smartphone",
  async function (this: MondeDoneJuan) {
    await this.banc.attendreCycles();
    await reecrireFichierDuPcParVersionRecente(
      driveDesAppareils(this),
      this.banc.appareil('pc').appareilId,
      this.banc.temps.maintenant(),
    );
  },
);

Given(
  '(que )les deux versions partagent le même format de données',
  function (this: MondeDoneJuan) {
    const format = formatDuFichierDe(driveDesAppareils(this), this.banc.appareil('pc').appareilId);
    assert.equal(format, SCHEMA_VERSION, 'Les deux versions ne partagent pas le même format');
  },
);
