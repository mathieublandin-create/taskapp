# ADR-012 — Distribution Android par installation directe de l'APK, sans Google Play

| Statut | Date | Auteur | Références |
|---|---|---|---|
| Proposé | 2026-10-21 | Starck | **DEC-021** (remplace DEC-005), DEC-019, DEC-023 ; ENF-07 ; RG-058 ; ADR-001 ; ADR-004 ; DAT v0.8 §7.4 et §7.5 ; `etude-sans-cloud-ou-gratuit.md` (option F) |

## Contexte
L'arbitrage A2 avait retenu Google Play, piste de test interne, pour 25 USD payés une seule fois (DEC-005). À la suite de l'étude `etude-sans-cloud-ou-gratuit.md`, le commanditaire a précisé sa motivation : le coût **et** l'indépendance vis-à-vis des services en ligne (DEC-019). Il a ensuite décidé d'**installer lui-même l'APK, sans Google Play** (DEC-021).

Cet ADR décrit comment produire, signer, distribuer et mettre à jour l'application Android dans ce cadre. Il traite aussi de la vérification des développeurs Android, qui s'appliquera en France en 2027.

Rappels techniques :
- l'application s'identifie auprès de Google par **Google Play services** (Credential Manager, AuthorizationClient ; ADR-004). Ce composant système est présent sur tout téléphone Android certifié et ne dépend pas de Google Play, le magasin. Il fonctionne pour une application installée directement ;
- Android n'accepte une mise à jour que si elle porte le **même nom de paquet**, est signée par la **même clé** et a un **`versionCode` supérieur**.

## Options étudiées
1. **Google Play, piste de test interne** (ancien DEC-005). Mises à jour automatiques, 25 USD une fois. **Écartée par DEC-021.**
2. **APK installé directement, signé par une clé propre au projet, publié sur l'hébergement statique de la PWA.** Gratuit. Mises à jour faites par l'utilisateur.
3. **F-Droid, dépôt principal.** Inadapté : F-Droid construit lui-même les applications et refuse les dépendances propriétaires, dont Google Play services, que l'authentification exige.
4. **Dépôt F-Droid personnel**, avec un index publié sur l'hébergement statique. Mises à jour proposées par le client F-Droid, mais il faut installer et maintenir ce client et l'index, pour un seul utilisateur.
5. **Mise à jour depuis l'application elle-même**, qui télécharge l'APK puis lance l'installeur, avec la permission `REQUEST_INSTALL_PACKAGES`. Plus confortable, mais c'est du code sensible à écrire, à tester et à sécuriser : vérification de l'empreinte et de la signature avant l'installation.

## Décision
**Option 2**, accompagnée d'une simple **invitation à mettre à jour** dans l'application. Les options 4 et 5 restent des évolutions possibles si les mises à jour manuelles gênent à l'usage.

### Signature
- **Une clé de signature de publication par application** : une pour la production (`<paquet>`), une pour la recette (`<paquet>.recette`). Ce sont des clés RSA 4096 bits, valables 30 ans, au format PKCS12. La clé de débogage reste réservée au développement.
- **Où vit la clé** :
  - jamais dans le dépôt : le dépôt deviendra public (DEC-023). Les extensions `*.jks`, `*.keystore`, `*.p12` et `keystore.properties` sont exclues par `.gitignore` **avant** la création de la clé ;
  - pour la signature automatique, la clé et ses mots de passe sont enregistrés en **secrets chiffrés** de GitHub Actions, sous forme de fichier encodé en base64 ;
  - **copie de sauvegarde hors ligne chez le commanditaire**, en deux exemplaires : un support amovible et son gestionnaire de mots de passe. C'est la seule protection contre la perte de la clé. La conservation de la clé dans les secrets de GitHub est soumise à son accord (question QC-8 de l'étude) ; à défaut, la signature se fait sur un poste local, à chaque version.
- **Empreintes** : les empreintes SHA-1 des clés de production et de recette sont déclarées dans les clients OAuth Android des projets Google Cloud correspondants (DAT §7.4). Ces clients ne fonctionnent qu'avec un APK signé par ces clés. Les empreintes SHA-256 sont publiées avec chaque version, pour que l'utilisateur puisse vérifier ce qu'il installe.
- **Perte de la clé** : aucune mise à jour n'est plus possible. Il faut désinstaller, ce qui efface la base locale, puis installer une application signée par une nouvelle clé et déclarer la nouvelle empreinte dans le client OAuth. Avant de désinstaller, **déposer toutes les modifications en attente** : l'écran « État de la synchronisation » doit indiquer 0 modification en attente. Tout le reste est dans le Drive et rechargé à la connexion.
- **Compromission de la clé** : un tiers pourrait signer une mise à jour malveillante, qui ne s'installerait toutefois que si l'utilisateur l'installe lui-même. Parade : révoquer les secrets, changer de clé (même procédure que la perte), changer l'empreinte OAuth.

### Numérotation
- `versionName` suit la numérotation sémantique de l'application (DAT §7.4).
- `versionCode` est un entier **strictement croissant**, dérivé de la version : `majeur × 10 000 + mineur × 100 + correctif`. Il est vérifié par l'intégration continue, qui refuse une publication dont le `versionCode` n'augmente pas.
- Revenir à une version antérieure est impossible sans désinstallation : une version défectueuse se corrige par une **nouvelle** version.

### Publication
À chaque étiquette de version, l'intégration continue :
1. construit l'APK de publication et le signe ;
2. vérifie la signature (`apksigner verify`) ;
3. publie sur l'hébergement statique, à côté de la PWA :
   - `android/done-juan-<version>.apk` ;
   - `android/derniere-version.json`, qui contient `versionName`, `versionCode`, `schemaVersion`, l'URL de l'APK, son empreinte SHA-256 et la date ;
   - une page `android/` lisible, qui donne le lien de téléchargement, l'empreinte et la procédure d'installation.

Si le dépôt devient public (DEC-023), une publication GitHub peut remplacer ou compléter ce dépôt. L'hébergement statique reste la source de référence, car il ne dépend pas de la visibilité du dépôt.

### Installation et mise à jour par l'utilisateur
- **Par fichier**, cas courant :
  1. sur le téléphone, ouvrir la page `android/` dans le navigateur et télécharger l'APK ;
  2. à la première fois, autoriser le navigateur à « installer des applications inconnues » ;
  3. ouvrir l'APK et confirmer. Google Play Protect peut analyser l'application, voire afficher un avertissement pour une application inconnue : choisir de l'installer quand même.
- **Par câble (ADB)**, cas de secours, sans réglage sur le téléphone hormis le débogage USB : `adb install -r done-juan-<version>.apk`. Ce mode est **exempté** de la vérification des développeurs Android.
- **Mise à jour = installation par-dessus** (écrasement). La base locale SQLite, l'identité et les autorisations Google sont **conservées**, puisque le paquet et la clé sont les mêmes. On ne désinstalle jamais pour mettre à jour.

### Invitation à mettre à jour (RG-058)
- **Hors réseau, sans service** : en consultation seule (`schemaVersion` plus récent que celui de l'application), l'action « Mettre à jour » du scénario S30 de US-017 **ouvre la page `android/`** dans le navigateur. Il n'y a ni téléchargement ni installation dans l'application (pas de `REQUEST_INSTALL_PACKAGES`).
- **Information « nouvelle version disponible »** (facultative, sans blocage) : l'application lit `derniere-version.json` au plus une fois par jour, en ligne, sur l'hébergement statique, qui ne reçoit aucune donnée personnelle. Une nouvelle US ou une précision de critère d'acceptation est nécessaire pour l'afficher : ce n'est **pas** dans le périmètre du lot 1.

### Vérification des développeurs Android (France, 2027)
- **Situation au 2026-10-21** : la vérification est appliquée depuis le 30 septembre 2026 au Brésil, en Indonésie, à Singapour et en Thaïlande. Pour le reste du monde, dont la France, elle est annoncée pour 2027, sans date publiée. **Jusque-là, l'installation directe fonctionne sans démarche.**
- **À partir de l'application en France**, l'installation par fichier d'une application dont le développeur n'est pas enregistré passera par un **parcours avancé**, avec un délai d'attente unique annoncé de 24 h. Deux façons de l'éviter :
  - **(a) compte gratuit « distribution limitée »** : pas de frais ni de pièce d'identité, jusqu'à 20 appareils explicitement autorisés. Il exige un compte Google avec validation en deux étapes et un profil de paiement Google. On y enregistre le nom de paquet et l'empreinte de la clé. **C'est la recommandation** : un téléphone de production et, si besoin, un second téléphone, sur une limite de 20 ;
  - **(b) installation par câble (ADB)**, exemptée, à chaque mise à jour.
- **Point à trancher en 2027 par le commanditaire**, dès la publication de la date française : quel compte Google porte l'enregistrement, et faut-il choisir (a) ou (b) ? C'est la question QC-9 de l'étude. Le nom de paquet et la clé ne changent pas, donc aucune réinstallation n'est à prévoir.

## Conséquences
- \+ Coût nul. Aucun compte de magasin ni d'examen. Aucun service tiers autre que l'hébergement statique déjà prévu (DEC-006).
- \+ Le test technique R1/R2 n'est pas remis en cause : il utilisait déjà un APK installé directement.
- − **Mises à jour manuelles** : le téléphone peut rester en retard sur la PWA, qui se met à jour seule. Les cas de consultation seule (RG-058) seront donc **plus fréquents qu'avec Google Play**. Parade : tout changement incompatible du format (`schemaVersion`) est annoncé dans les notes de version et fait l'objet d'une mise à jour Android publiée **en même temps** que la PWA. La règle de RG-058 elle-même ne change pas.
- − **Clé de signature** : sa sauvegarde devient critique et repose sur le commanditaire (risque R16 du DAT).
- − **Vérification des développeurs en 2027** : une démarche à prévoir (R17).
- − **Recette (E16)** : le commanditaire installe lui-même l'APK de recette, une application distincte (`<paquet>.recette`) qui coexiste avec la production. Un guide d'installation pas à pas est fourni avec chaque livraison en recette. La version installée se lit dans les réglages Android (« Applications > Done Juan (recette) »).
- ADR-001 : la conséquence « application mobile à distribuer » renvoie désormais au présent ADR.
- DS-17 et DAT §7.4 sont mis à jour.
- Côté fonctionnel, à répercuter par Pepper et Steeve : ENF-07, LOT-001 §5 ligne 3, parcours utilisateurs (ouverture « par Google Play ») et cible de l'action « Mettre à jour » (S30).
