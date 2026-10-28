import type { CodeCatalogue } from './codes';

// Catalogue des libellés : guide d'ergonomie §6.6 (v0.2.17), qui fait foi (conventions.md §8.5). Un code n'est
// jamais renuméroté. Syntaxe des gabarits, interprétée par `libelle()` :
//   {nom}              variable (n, element, date, heure, appareil, anciennete, parent…) ;
//   {n:singulier|pluriel}  forme choisie par la variable n (0 et 1 : singulier, 2 et plus : pluriel).
// Une variante (ERR-030, BAN-…, SYN-HORS-LIGNE…) remplace les champs qu'elle redéfinit ; elle est choisie par la
// variable réservée `variante`. Les guillemets « » et les ponctuations hautes reçoivent leurs espaces insécables
// à l'interpolation, pas ici.

export type TextesLibelle = {
  /** Libellé visible principal : texte d'une mention ou d'un état, titre d'une boîte, d'un bandeau ou d'une erreur. */
  readonly libelle: string;
  /** Texte d'explication sous le titre. */
  readonly texte?: string;
  /** Libellé du bouton d'action. */
  readonly action?: string;
  /** Libellé d'une seconde action (« Aller à la connexion » d'ERR-017). */
  readonly actionSecondaire?: string;
  /** Libellé du bouton qui ferme un bandeau fermable (« Masquer le rappel »). */
  readonly fermeture?: string;
  /** Nom accessible, quand il diffère du libellé visible. */
  readonly nomAccessible?: string;
};

export type GabaritLibelle = TextesLibelle & {
  readonly variantes?: Readonly<Record<string, Partial<TextesLibelle>>>;
};

const ERREUR_CONNEXION_ANNULEE: GabaritLibelle = {
  libelle: 'Connexion annulée',
  texte:
    'Une connexion à un compte Google est nécessaire pour utiliser l’application. Rien n’a été créé.',
  action: 'Continuer avec Google',
};

const ERREUR_RESEAU_CONNEXION: Pick<GabaritLibelle, 'libelle' | 'action'> = {
  libelle: 'Pas de connexion à Internet',
  action: 'Réessayer',
};

const BAN_ACCES_GOOGLE_TEXTE =
  'Reconnectez votre compte pour reprendre la synchronisation. Vos données sont conservées et vous pouvez continuer à travailler.';

export const CATALOGUE = {
  // ---- Alertes et informations (§6.6.9)
  'ALR-001': {
    libelle: 'L’heure de cet appareil semble incorrecte',
    texte:
      'Elle diffère de plus de 24 h de l’heure réelle. Corrigez-la dans les réglages de l’appareil pour éviter des conflits entre vos appareils.',
  },
  'ALR-002': {
    libelle: 'Modifications en attente depuis plus de 24 h',
    texte:
      '{n} modification{n:|s} {n:n’est|ne sont} encore que sur ce {appareil}. Elles seront enregistrées dans votre Google Drive dès que la synchronisation reprendra.',
  },
  'ALR-003': {
    libelle: 'Incohérence avec une sous-tâche',
    texte:
      'Cette tâche est terminée, mais {n} sous-tâche{n:|s} {n:est|sont} à faire. Rien n’a été modifié. Tant que c’est le cas, l’objectif « {element} » n’est pas atteint.',
    action: 'Rouvrir la tâche',
  },
  'ALR-004': {
    libelle: 'Incohérence avec une sous-tâche',
    texte:
      'Cette tâche est abandonnée, mais {n} sous-tâche{n:|s} {n:est|sont} à faire. Rien n’a été modifié.',
    action: 'Reprendre la tâche',
  },
  'ALR-005': {
    libelle: '{date} · après le délai de l’objectif',
    nomAccessible: 'Après le délai de l’objectif ({date})',
  },
  'ALR-006': { libelle: '{date} · après le délai de la tâche' },
  'ALR-007': { libelle: '{date} · après « {parent} »' },
  'ALR-008': {
    libelle: 'Vos données ont été effacées',
    texte:
      'Vous avez choisi de repartir de zéro sur votre {appareil}. {n} modification{n:|s} faite{n:|s} ici avant ce choix n’{n:a|ont} pas été conservée{n:|s}.',
    action: 'Compris',
  },
  'ALR-009': {
    libelle: '{information} de « {element} »',
    texte:
      'Votre valeur « {valeur} » ({appareil}, {heure}) n’a pas été retenue. Valeur conservée : « {valeurConservee} » ({appareil}, {heure}).',
    action: 'Compris',
  },
  'ALR-010': {
    libelle: 'Objectif « {element} » supprimé',
    texte:
      'Supprimé sur votre {appareil}. Votre modification de {information} ({appareil}, {heure}) n’a pas été conservée.',
    action: 'Compris',
    variantes: {
      tache: { libelle: 'Tâche « {element} » supprimée' },
      rattachement: {
        libelle: 'Rattachement non retenu, objectif supprimé',
        texte:
          'Supprimé sur votre {appareil}. Votre rattachement à « {objectif} » ({appareil}, {heure}) n’a pas été conservé. La tâche n’est rattachée à aucun objectif.',
        action: 'Voir la tâche',
      },
      placement: {
        libelle: 'Placement non retenu, objectif supprimé',
        texte:
          'Supprimé sur votre {appareil}. Votre placement sous « {objectif} » ({appareil}, {heure}) n’a pas été conservé. « {element} » est devenu objectif principal.',
        action: 'Voir l’objectif',
      },
    },
  },
  'ALR-011': {
    libelle: 'Placement de « {element} » annulé',
    texte:
      'Un déplacement plus récent, fait sur votre {appareil}, place « {element} » sous « {parent} ». Les deux ne peuvent pas coexister : le plus ancien a été annulé.',
    action: 'Voir l’objectif',
  },
  'ALR-012': {
    libelle: 'L’estimation de la tâche ({duree}) sera remplacée par la somme de ses sous-tâches.',
  },
  'ALR-013': { libelle: 'Il reste {n} sous-tâche{n:|s} à terminer ou abandonner.' },
  'ALR-014': {
    libelle: '{information} de « {element} »',
    texte:
      'Votre valeur « {valeur} » ({appareil}, {heure}) n’a pas été conservée : les données ont été effacées.',
  },
  'ALR-015': {
    libelle: 'Vos données ne sont pas protégées',
    texte:
      'Vos données ne sont pas protégées contre un nettoyage du navigateur. Installez l’application et gardez-la sur l’écran d’accueil.',
  },

  // ---- Bandeaux (§6.6.3)
  'BAN-ACCES-GOOGLE': {
    libelle: 'Accès Google perdu',
    texte: BAN_ACCES_GOOGLE_TEXTE,
    action: 'Se reconnecter',
    variantes: {
      '24H': {
        texte:
          'Reconnectez votre compte pour reprendre la synchronisation. Vos données sont conservées. {n} modification{n:|s} {n:n’est|ne sont} encore que sur ce {appareil}.',
      },
    },
  },
  'BAN-CONSULTATION-SEULE': {
    libelle: 'Consultation seule',
    texte:
      'Une version plus récente de l’application a enregistré vos données. Mettez à jour l’application pour les modifier.',
    action: 'Mettre à jour',
    variantes: {
      'avec-attente': {
        texte:
          'Une version plus récente de l’application a enregistré vos données. Mettez à jour l’application pour les modifier. Vos {n} modifications en attente sont conservées.',
      },
    },
  },
  'BAN-RAPPEL-24H': {
    libelle: 'Modifications en attente depuis plus de 24 h',
    texte:
      '{n} modification{n:|s} {n:n’est|ne sont} encore que sur ce {appareil}. Elles seront enregistrées dans votre Google Drive dès que la synchronisation reprendra.',
    fermeture: 'Masquer le rappel',
    variantes: {
      session: {
        texte:
          '{n} modification{n:|s} {n:n’est|ne sont} encore que sur ce {appareil}. Reprenez la synchronisation pour les enregistrer dans votre Google Drive.',
        action: 'Reprendre la synchronisation',
      },
    },
  },

  // ---- Boîtes de confirmation (§6.6.7)
  'CNF-ABANDON-TACHE': {
    libelle: 'Abandonner « {element} » ?',
    texte:
      'La tâche quitte vos tâches à faire. Vous la retrouverez dans « Abandonnées » et pourrez la reprendre.',
    action: 'Abandonner',
  },
  'CNF-ABANDON-TACHE-CASCADE': {
    libelle: 'Abandonner « {element} » ?',
    texte:
      'Ses {n} sous-tâches à faire seront abandonnées aussi. La sous-tâche déjà terminée reste terminée.',
    action: 'Abandonner',
  },
  'CNF-AJOUT-SOUS-TACHE-TERMINEE': {
    libelle: 'Rouvrir « {element} » pour y ajouter une sous-tâche ?',
    action: 'Rouvrir et ajouter',
  },
  'CNF-DECONNEXION': {
    libelle: 'Se déconnecter ?',
    texte:
      '{n} modification{n: n’est|s ne sont} pas encore enregistrée{n:|s} dans votre Google Drive. {n:Elle reste|Elles restent} sur cet appareil et {n:sera enregistrée|seront enregistrées} à votre prochaine connexion avec ce compte. Vos données ne sont pas effacées.',
    action: 'Se déconnecter',
  },
  'CNF-REPARTIR-ZERO': {
    libelle: 'Effacer toutes vos données sur vos deux appareils ?',
    texte: '{n} modification{n:|s} faite{n:|s} ici et pas encore enregistrée{n:|s} seront perdues.',
    action: 'Tout effacer',
  },
  'CNF-REPRENDRE-SOUS-TACHE': {
    libelle: 'Reprendre « {element} » ?',
    texte: '« {tacheParente} » est terminée : elle sera rouverte aussi.',
    action: 'Reprendre les deux',
  },
  'CNF-ROUVRIR-SOUS-TACHE': {
    libelle: 'Rouvrir aussi « {element} » ?',
    action: 'Rouvrir les deux',
  },
  'CNF-SUPPR-DONNEES': {
    libelle: 'Supprimer les données de cet appareil ?',
    texte:
      'Les données restent dans votre Google Drive et sur l’autre appareil. Elles seront rechargées à la prochaine connexion, avec le réseau.',
    action: 'Supprimer les données',
    // Bouton de la section « Compte » (ECR-011), qui ouvre cette confirmation.
    variantes: { 'section-compte': { action: 'Supprimer les données de cet appareil' } },
  },
  'CNF-SUPPR-DONNEES-PERTE': {
    libelle: '{n} modification{n: serait|s seraient} perdue{n:|s}',
    action: 'Supprimer quand même',
  },
  'CNF-SUPPR-OBJECTIF': {
    libelle: 'Supprimer « {element} » ?',
    texte:
      'La suppression est définitive. {taches} tâche{taches:|s} {taches:sera détachée|seront détachées} de cet objectif. {sousObjectifs} sous-objectif{sousObjectifs:|s} {sousObjectifs:devient objectif principal|deviennent objectifs principaux}.',
    action: 'Supprimer',
  },
  'CNF-SUPPR-TACHE': {
    libelle: 'Supprimer la tâche et ses {n} sous-tâches ?',
    action: 'Supprimer',
    variantes: { 'sans-sous-tache': { libelle: 'Supprimer la tâche ?' } },
  },

  // ---- Erreurs (§6.6.8)
  'ERR-001': ERREUR_CONNEXION_ANNULEE,
  'ERR-002': ERREUR_CONNEXION_ANNULEE,
  'ERR-003': {
    ...ERREUR_RESEAU_CONNEXION,
    texte:
      'Une connexion est nécessaire pour vous connecter la première fois. Réessayez dès que vous avez du réseau. Rien n’a été créé.',
  },
  'ERR-004': {
    ...ERREUR_RESEAU_CONNEXION,
    texte:
      'Une connexion est nécessaire pour vous connecter. Les données déjà enregistrées sur cet appareil sont conservées. Réessayez dès que vous avez du réseau.',
  },
  'ERR-005': {
    libelle: 'Connexion interrompue',
    texte: 'La connexion a été interrompue. Aucune donnée n’a été créée à moitié. Réessayez.',
    action: 'Réessayer',
  },
  'ERR-006': {
    libelle: 'Google Drive n’est pas disponible pour ce compte',
    texte:
      'C’est le cas, par exemple, d’un compte d’organisation sans accès au Drive. L’application en a besoin pour enregistrer vos données. Essayez avec un autre compte Google.',
    action: 'Choisir un autre compte',
  },
  'ERR-010': {
    libelle: 'Accès Google perdu',
    texte: BAN_ACCES_GOOGLE_TEXTE,
    action: 'Se reconnecter',
  },
  'ERR-011': {
    libelle: 'Votre Google Drive est plein',
    texte:
      'Vos modifications ne peuvent plus y être enregistrées. Elles sont conservées sur cet appareil. Libérez de la place dans Google Drive : l’enregistrement reprendra tout seul.',
    action: 'Ouvrir Google Drive',
  },
  'ERR-012': {
    libelle: 'Vos données ne sont plus dans votre Google Drive',
    texte:
      'Le dossier « Done Juan » a été supprimé ou ne peut plus être lu. Cet appareil en garde une copie : {objectifs} objectif{objectifs:|s}, {taches} tâche{taches:|s}, dernière mise à jour {anciennete}. Rien n’est effacé ni modifié tant que vous n’avez pas choisi.',
    action: 'Restaurer mes données',
  },
  'ERR-013': {
    libelle: 'Consultation seule',
    texte:
      'Une version plus récente de l’application a enregistré vos données. Mettez à jour l’application pour les modifier.',
    action: 'Mettre à jour',
  },
  'ERR-014': {
    libelle: 'Impossible d’enregistrer. Réessayer',
    action: 'Réessayer',
    variantes: { 'avec-action': { libelle: 'Impossible d’enregistrer.' } },
  },
  'ERR-015': {
    libelle: 'La session Google de cet appareil a expiré',
    texte:
      'Vous pouvez continuer à travailler : vos {n} modification{n:|s} {n:est|sont} conservée{n:|s} sur ce {appareil}. Pour les envoyer et recevoir celles de votre {autreAppareil}, reprenez la synchronisation.',
    action: 'Reprendre la synchronisation',
  },
  'ERR-016': {
    libelle: 'La synchronisation n’a pas abouti',
    texte:
      'Vos {n} modifications sont conservées sur cet appareil. L’application réessaie toute seule ; vous pouvez aussi réessayer maintenant.',
    action: 'Réessayer maintenant',
  },
  'ERR-017': {
    libelle: 'La suppression n’est pas terminée',
    texte:
      'Done Juan est encore ouvert dans une autre fenêtre ou un autre onglet de ce PC. La suppression se terminera dès que vous les aurez fermés. Fermez-les, puis appuyez sur « Réessayer ». Vos données restent dans votre Google Drive.',
    action: 'Réessayer',
    actionSecondaire: 'Aller à la connexion',
    variantes: { 'en-cours': { action: 'Suppression en cours…' } },
  },
  'ERR-020': { libelle: 'Indiquez un intitulé.' },
  'ERR-021': { libelle: 'Indiquez un délai.' },
  'ERR-022': { libelle: 'Indiquez une estimation.' },
  'ERR-023': { libelle: 'Indiquez une estimation de 30 min au minimum, par pas de 30 min.' },
  'ERR-030': {
    libelle: 'Déplacement impossible',
    texte: 'Un seul niveau de sous-objectifs est autorisé.',
    action: 'Compris',
    variantes: {
      'objectif-a-des-sous-objectifs': {
        texte:
          '« {element} » a déjà {n} sous-objectif{n:|s}. Un seul niveau de sous-objectifs est autorisé. Déplacez ou supprimez d’abord son sous-objectif, ou placez celui-ci ailleurs.',
      },
      'cible-est-sous-objectif': {
        texte:
          '« {element} » est déjà un sous-objectif. Un seul niveau de sous-objectifs est autorisé. Placez l’objectif sous un objectif principal.',
      },
    },
  },
  'ERR-031': { libelle: 'Un objectif ne peut pas être placé sous lui-même' },
  'ERR-032': {
    libelle: 'Cette tâche est abandonnée. Reprenez-la pour y ajouter une sous-tâche.',
    action: 'Reprendre la tâche',
  },
  'ERR-033': {
    libelle:
      'L’estimation de cette tâche est la somme de ses sous-tâches. Modifiez celle d’une sous-tâche.',
  },
  'ERR-034': {
    libelle:
      'Les objectifs d’une sous-tâche sont ceux de sa tâche parente. Modifiez-les sur la tâche parente.',
  },
  'ERR-035': { libelle: 'Il reste {n} sous-tâche{n:|s} à terminer ou abandonner.' },

  // ---- États d'un objet (§6.6.4)
  'ETA-OBJ-A-DECLINER': { libelle: 'À décliner en tâches' },
  'ETA-OBJ-ATTEINT': { libelle: 'Atteint' },
  'ETA-OBJ-COMPTEUR': {
    libelle: '{terminees} / {nonAbandonnees} tâches',
    nomAccessible:
      '{element}, {etat}, {terminees} tâches sur {nonAbandonnees} terminées, délai {date}',
    variantes: {
      'sans-delai': {
        nomAccessible:
          '{element}, {etat}, {terminees} tâches sur {nonAbandonnees} terminées, sans délai',
      },
    },
  },
  'ETA-OBJ-EN-COURS': { libelle: 'En cours' },
  'ETA-SOUS-TACHE-ABANDONNEE-AVANT': { libelle: 'Abandonnée avant la tâche' },
  'ETA-SOUS-TACHE-ABANDONNEE-AVEC': { libelle: 'Abandonnée avec la tâche' },
  'ETA-SOUS-TACHE-TERMINEE-AVANT': { libelle: 'Terminée avant l’abandon' },
  'ETA-TACHE-A-FAIRE': { libelle: 'À faire' },
  'ETA-TACHE-ABANDONNEE': { libelle: 'Abandonnée le {date}' },
  'ETA-TACHE-TERMINEE': { libelle: 'Terminée le {date}' },

  // ---- États vides (§6.6.5)
  'EVD-BIENVENUE': {
    libelle: 'Bienvenue',
    texte:
      'Un objectif donne une direction à vos tâches. Commencez par le vôtre, ou ajoutez directement une tâche.',
    action: 'Créer mon premier objectif',
  },
  'EVD-FILTRE-A-FAIRE': { libelle: 'Aucune tâche à faire.' },
  'EVD-FILTRE-ABANDONNEES': { libelle: 'Aucune tâche abandonnée.' },
  'EVD-FILTRE-SANS-OBJECTIF': { libelle: 'Toutes vos tâches ont un objectif.' },
  'EVD-FILTRE-TERMINEES': { libelle: 'Aucune tâche terminée.' },
  'EVD-OBJECTIF-SANS-TACHE': { libelle: 'À décliner en tâches.', action: 'Ajouter une tâche' },
  'EVD-OBJECTIFS': {
    libelle: 'Un objectif donne une direction à vos tâches.',
    action: 'Créer un objectif',
  },
  'EVD-OBJECTIFS-TOUS-ATTEINTS': {
    libelle: 'Tous vos objectifs sont atteints.',
    action: 'Créer un objectif',
  },
  'EVD-TACHES': {
    libelle: 'Aucune tâche pour l’instant.',
    texte: 'Commencez par ce qui vous vient à l’esprit, vous trierez ensuite.',
    action: 'Ajouter une tâche',
  },

  // ---- Mentions (§6.6.4)
  'MEN-ATTENTE': { libelle: '', nomAccessible: 'Modification en attente d’envoi' },
  'MEN-EN-RETARD': {
    libelle: 'En retard',
    nomAccessible: 'En retard, délai {date}',
    variantes: { liste: { libelle: 'En retard · {date}' } },
  },
  'MEN-ESTIMATION-CALCULEE': {
    libelle: 'Somme des sous-tâches',
    nomAccessible: 'Estimation calculée : somme des sous-tâches',
  },
  'MEN-HEURE-PARIS': {
    libelle: 'Heure de Paris',
    nomAccessible: 'Heure de Paris : afficher l’explication',
  },
  'MEN-HEURE-PARIS-EXPLICATION': {
    libelle: 'Les jours, les retards et les horaires suivent l’heure de Paris, où que vous soyez.',
    texte:
      'Il est {heureParis} à Paris, alors que votre appareil indique {heureAppareil} la veille.',
  },
  'MEN-INCOHERENCE': { libelle: 'Incohérence', nomAccessible: 'Incohérence' },
  'MEN-NON-RETENUE': { libelle: '{n} modification{n:|s} non retenue{n:|s} · Voir' },
  'MEN-OBJECTIFS-HERITES': {
    libelle: 'Hérités de la tâche',
    nomAccessible: 'Objectifs hérités de la tâche',
  },
  'MEN-OBLIGATOIRE': { libelle: '(obligatoire)' },
  'MEN-SANS-DELAI': { libelle: 'Sans délai' },
  'MEN-TRI-DELAI': {
    libelle: 'Triées par délai',
    variantes: { 'plus-recentes': { libelle: 'Plus récentes d’abord' } },
  },

  // ---- Titres de section (§6.6.4)
  'SEC-OBJ-ATTEINTS': { libelle: 'Atteints ({n})' },
  'SEC-SOUS-OBJECTIFS': { libelle: 'Sous-objectifs', nomAccessible: 'Sous-objectifs ({n})' },
  'SEC-SOUS-TACHES': { libelle: 'Sous-tâches', nomAccessible: 'Sous-tâches {terminees} / {n}' },
  'SEC-TACHES-A-FAIRE': { libelle: 'Tâches à faire · {n}' },
  'SEC-TACHES-ABANDONNEES': { libelle: 'Abandonnées ({n})' },
  'SEC-TACHES-TERMINEES': { libelle: 'Terminées ({n})' },

  // ---- États de l'indicateur de synchronisation (§6.6.2)
  'SYN-ACTION': { libelle: 'Action requise' },
  'SYN-ATTENTE': {
    libelle: '{n} modification{n:|s} à envoyer',
    nomAccessible: '{n} modification{n:|s} à envoyer',
  },
  'SYN-EN-COURS': { libelle: 'Synchronisation…', nomAccessible: 'Synchronisation en cours' },
  'SYN-FEUILLE-A-LIRE': { libelle: '{n} information{n:|s} à lire' },
  'SYN-FEUILLE-AUTRE-ONGLET': {
    libelle:
      'Cet onglet n’effectue pas la synchronisation : un autre onglet de l’application s’en charge. Les deux onglets affichent les mêmes données.',
  },
  'SYN-FEUILLE-BOUTON': {
    libelle: 'Synchroniser maintenant',
    texte: 'Disponible au retour du réseau.',
  },
  'SYN-FEUILLE-DERNIER-ECHANGE': {
    libelle: 'Dernier échange avec votre Google Drive : {anciennete} ({heure}).',
  },
  'SYN-FEUILLE-DOSSIER': { libelle: 'Dossier « Done Juan » dans votre Google Drive' },
  'SYN-FEUILLE-EN-ATTENTE': { libelle: '{n} modification{n:|s} en attente' },
  'SYN-FEUILLE-FUSEAU': {
    libelle: 'Heure de Paris',
    texte: 'Votre appareil est réglé sur {fuseau}.',
  },
  'SYN-FEUILLE-HORS-LIGNE': {
    libelle:
      'Vos modifications sont enregistrées sur cet appareil. Elles seront envoyées au retour du réseau, sans rien faire.',
  },
  'SYN-FEUILLE-RIEN-EN-ATTENTE': { libelle: 'Aucune modification en attente.' },
  'SYN-FEUILLE-STOCKAGE': {
    libelle: 'Stockage de cet appareil : protégé',
    variantes: { 'non-protege': { libelle: 'Stockage de cet appareil : non protégé' } },
  },
  'SYN-HORS-LIGNE': {
    libelle: 'Hors ligne · {n} en attente',
    nomAccessible: 'Hors ligne, {n} modification{n:|s} en attente',
    variantes: { 'sans-attente': { libelle: 'Hors ligne', nomAccessible: 'Hors ligne' } },
  },
  'SYN-INFO': {
    libelle: 'À jour · {n} information{n:|s}',
    nomAccessible: 'À jour, {n} information{n:|s} à lire',
  },
  'SYN-OK': { libelle: 'À jour', nomAccessible: 'Synchronisé, à jour' },
  'SYN-REDIRECTION': {
    libelle: 'Connexion à Google…',
    nomAccessible: 'Connexion à Google en cours',
  },
  'SYN-RETENTATIVE': {
    libelle: 'Nouvelle tentative…',
    nomAccessible: 'Nouvelle tentative de synchronisation',
  },
  'SYN-SESSION': { libelle: 'Reprendre la synchronisation' },

  // ---- Messages éphémères (§6.6.6)
  'TST-AJOUTEE': { libelle: 'Ajoutée à Tâches' },
  'TST-CONSULTATION-SEULE': { libelle: 'Consultation seule · mettez à jour pour modifier' },
  'TST-ERREUR-ENREGISTREMENT': {
    libelle: 'Impossible d’enregistrer. Réessayer',
    action: 'Réessayer',
    variantes: { 'avec-action': { libelle: 'Impossible d’enregistrer.' } },
  },
  'TST-HORS-LIGNE': {
    libelle:
      'Hors ligne. Vos modifications sont enregistrées sur l’appareil et seront envoyées au retour du réseau.',
  },
  'TST-NON-RETENUES': {
    libelle: '{n} modification{n:|s} n’{n:a|ont} pas été retenue{n:|s} · Voir',
    action: 'Voir',
  },
  'TST-SAISIE-A-TERMINER': {
    libelle: 'Terminez votre saisie, puis reprenez la synchronisation.',
  },
  'TST-TERMINEE': { libelle: 'Tâche terminée', action: 'Annuler' },
} as const satisfies Record<CodeCatalogue, GabaritLibelle>;
