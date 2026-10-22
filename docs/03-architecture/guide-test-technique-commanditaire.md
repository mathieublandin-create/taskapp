# Guide pas à pas du test technique (R1, R2, R11)

> Version 2 du 2026-10-22 (alignée sur le PoC réel, revue RV-POC). Auteur : Starck. Destinataire : le commanditaire.
> Contexte : décision DEC-031. Protocole technique de référence : `test-technique-R1-R2.md`.
> Statut : **prêt à l'emploi, jamais exécuté.**

## 0. Avant de commencer

### Ce que ce guide vous demande
Vous créez un petit projet chez Google, un téléphone de test et un compte d'hébergement gratuit. Puis vous faites deux séances d'essai avec l'équipe. Aucune compétence technique n'est nécessaire.

### Durée estimée
| Partie | Durée |
|---|---|
| a) Projet Google Cloud | 30 min |
| b) Identifiant Web | 10 min |
| c) Identifiant Android | 10 min |
| d) Téléphone Android | 15 min |
| e) Compte d'hébergement | 10 min |
| f) Transmission à l'équipe | 5 min |
| **Préparation totale** | **environ 1 h 30**, à faire en une ou plusieurs fois |
| g) Séance 1 (jour J) | 1 h 30, plus des temps d'attente |
| g) Séance 2 (jour J+1) | 1 h |

### Ce qu'il vous faut
- Un PC avec Chrome ou Edge à jour.
- Un téléphone Android 10 ou plus, avec un câble USB.
- Un compte Google. Conseil : créez un compte Gmail **de test** (gmail.com). Ainsi, rien n'est écrit dans votre Drive personnel.
- Une adresse e-mail que vous consultez.

### Règles à respecter
- **Ne publiez jamais** un identifiant, une adresse ou un fichier de clé dans le dépôt GitHub, dans un ticket ou dans un message public. Envoyez-les à l'équipe par le canal prévu par Jarvis.
- Les noms de menus ci-dessous sont ceux de la console Google en octobre 2026. **Google les change souvent.** Si un nom est introuvable, cherchez le mot le plus proche, ou utilisez la barre de recherche en haut de la console. En cas de doute, faites une capture d'écran et envoyez-la à l'équipe.
- Tout ce qui est noté `<comme ceci>` est une valeur que l'équipe vous donne ou que vous choisissez.
- Si vous bloquez plus de 10 minutes, arrêtez-vous et prévenez Jarvis. Rien ne se perd.

### Valeurs que l'équipe doit vous donner avant de commencer
Jarvis vous les envoie. Notez-les ici (sans les publier) :

| Valeur | Rôle | Reçue ? |
|---|---|---|
| `<NOM_DE_PAQUET>` | Nom technique de l'application Android de test : **`fr.donejuan.poc`** (valeur définitive du PoC, à recopier telle quelle). | |
| `<SHA1_DEBUG>` | Empreinte de la clé de test « débogage » | |
| `<SHA1_PUBLICATION>` | Empreinte de la clé de test « publication » | |

Si l'équipe ne vous donne pas ces empreintes, voir l'étape c.2.

---

## a) Projet Google Cloud

### a.1 Ouvrir la console
1. Sur votre PC, ouvrez Chrome.
2. Connectez-vous avec le compte Google de test.
3. Allez à l'adresse `https://console.cloud.google.com`.
4. Si Google affiche les conditions d'utilisation, cochez la case, puis cliquez sur **Accepter et continuer** (« Agree and continue »).

Résultat attendu : la page d'accueil de la console s'affiche, avec un bandeau bleu ou gris en haut.

Aucune facturation n'est nécessaire. Si Google propose un « essai gratuit » ou demande une carte bancaire, **refusez**. Fermez la fenêtre et continuez.

### a.2 Créer le projet
1. En haut à gauche, à côté du logo « Google Cloud », cliquez sur le **sélecteur de projet** (il affiche le nom d'un projet ou « Sélectionner un projet »).
2. Dans la fenêtre, cliquez sur **Nouveau projet** (« New project »).
3. Dans « Nom du projet », saisissez : `objectifs-taches-dev`.
4. Laissez « Organisation » et « Emplacement » sur « Aucune organisation ».
5. Cliquez sur **Créer** (« Create »).
6. Attendez 10 à 30 secondes. Une notification (cloche en haut à droite) indique que le projet est créé.
7. Rouvrez le sélecteur de projet et choisissez `objectifs-taches-dev`.

Résultat attendu : le nom `objectifs-taches-dev` s'affiche en haut de la console.

### a.3 Activer l'API Google Drive
1. Ouvrez le menu principal (trois traits, en haut à gauche).
2. Cliquez sur **API et services** (« APIs & Services »), puis sur **Bibliothèque** (« Library »).
3. Dans la barre de recherche, tapez `Google Drive API`.
4. Cliquez sur la carte **Google Drive API**.
5. Cliquez sur le bouton bleu **Activer** (« Enable »).

Résultat attendu : une page « Présentation de l'API » avec le texte « API activée » (« API enabled »).

### a.4 Écran de consentement OAuth
Dans la console récente, cette partie s'appelle **Google Auth Platform**. Dans l'ancienne console, elle s'appelle **API et services > Écran de consentement OAuth**. Le contenu est le même.

1. Ouvrez le menu principal, puis **Google Auth Platform** (ou, à défaut, utilisez la barre de recherche et tapez `Google Auth Platform`).
2. Si la page affiche « Google Auth Platform n'est pas encore configuré », cliquez sur **Commencer** (« Get started »).
3. **Informations sur l'application** :
   - Nom de l'application : `Done Juan`.
   - Adresse e-mail d'assistance utilisateur : choisissez votre adresse dans la liste.
   - Cliquez sur **Suivant**.
4. **Audience** : choisissez **Externe** (« External »). Cliquez sur **Suivant**.
5. **Coordonnées** : saisissez votre adresse e-mail. Cliquez sur **Suivant**.
6. Cochez la case d'acceptation de la politique de Google sur les données des utilisateurs. Cliquez sur **Continuer**, puis sur **Créer**.

Résultat attendu : le tableau de bord de Google Auth Platform s'affiche, avec un menu à gauche : « Vue d'ensemble », « Image de marque » (« Branding »), « Audience », « Clients », « Accès aux données » (« Data Access »).

7. Menu **Image de marque** (« Branding ») :
   - **N'ajoutez aucun logo.** Laissez le champ vide. Un logo déclencherait une vérification par Google.
   - Laissez vides les champs « Page d'accueil », « Règles de confidentialité » et « Conditions d'utilisation ». Ils ne sont pas demandés pour ce test.
   - « Domaines autorisés » : laissez vide pour l'instant. Si vous y êtes obligé plus tard, notez-le et prévenez l'équipe.
   - Cliquez sur **Enregistrer**.
8. Menu **Accès aux données** (« Data Access ») :
   1. Cliquez sur **Ajouter ou supprimer des niveaux d'accès** (« Add or remove scopes »).
   2. Dans le filtre, cherchez et cochez les trois accès suivants :
      - `openid`
      - `.../auth/userinfo.email` (affiché aussi comme « Afficher votre adresse e-mail principale »)
      - `.../auth/drive.file` (affiché comme « Afficher, modifier, créer et supprimer uniquement les fichiers Google Drive spécifiques que vous utilisez avec cette application »)
   3. Si `drive.file` n'apparaît pas dans la liste, saisissez `https://www.googleapis.com/auth/drive.file` dans « Ajouter manuellement des niveaux d'accès », puis cliquez sur **Ajouter à la table**.
   4. Cliquez sur **Mettre à jour**, puis sur **Enregistrer**.
   5. **Ne cochez aucun autre accès.** Pas de « drive » tout court, pas de « calendar » pour ce test.

Résultat attendu : le tableau affiche exactement trois lignes, dans la section « Niveaux d'accès non sensibles » (« Non-sensitive scopes »). Aucune ligne dans « sensibles » ni « restreints ».

   Si une ligne apparaît dans « sensibles » ou « restreints », retirez-la et prévenez l'équipe.

9. Menu **Audience** :
   1. Vérifiez que « Type d'utilisateur » indique **Externe**.
   2. Vérifiez l'« État de la publication » (« Publishing status »). Il indique « Test » (« Testing »).
   3. Cliquez sur **Publier l'application** (« Publish app »).
   4. Confirmez en cliquant sur **Confirmer**.

Résultat attendu : l'état devient **En production** (« In production »). Aucune demande de vérification n'est affichée, car les trois accès ne sont pas sensibles.

   Si Google affiche « Vérification requise » (« Verification required »), faites une capture d'écran et arrêtez-vous : c'est une information importante pour le test R11.

**À noter pour l'équipe** : le nom exact de l'état final, et tout message affiché après la publication.

---

## b) Identifiant OAuth Web

### b.1 Choisir l'hébergement (cas A ou B)
L'hébergement est figé au moment du test (décision DEC-023). L'adresse de la page web doit être déclarée dans l'identifiant. Deux cas existent :

| Cas | Quand | Adresse de la forme |
|---|---|---|
| **A. GitHub Pages** | Le dépôt GitHub est **public** à la date du test | `https://<votre-nom-github>.github.io` |
| **B. Cloudflare Pages** | Le dépôt est encore **privé** | `https://<nom-du-projet>.pages.dev` |

Jarvis vous dit quel cas s'applique. Si l'adresse n'est pas encore connue, créez l'identifiant avec seulement `http://localhost:5173`. Ajoutez l'adresse plus tard (étape b.3).

Attention : l'adresse d'une origine ne contient **ni chemin, ni barre oblique finale**. Écrivez `https://exemple.github.io`, jamais `https://exemple.github.io/` ni `https://exemple.github.io/mon-depot`.

### b.2 Créer l'identifiant
1. Dans **Google Auth Platform**, ouvrez le menu **Clients**.
2. Cliquez sur **Créer un client** (« Create client »).
3. « Type d'application » : choisissez **Application Web**.
4. « Nom » : saisissez `Done Juan POC Web`.
5. Section **Origines JavaScript autorisées** (« Authorized JavaScript origins »). Cliquez sur **Ajouter un URI** et saisissez :
   - `http://localhost:5173`
   - puis, une seconde ligne : l'adresse du cas A ou B (voir b.1), si elle est connue.
6. Section **URI de redirection autorisés** : **laissez vide**.
7. Cliquez sur **Créer**.

Résultat attendu : une fenêtre « Client OAuth créé » affiche un **ID client** (se termine par `.apps.googleusercontent.com`). Pour une application Web de ce type, il n'y a rien d'autre à recopier. Si un « code secret du client » est affiché, **ne le copiez pas et ne l'envoyez pas** : l'application ne l'utilise pas.

8. Copiez l'**ID client** dans un fichier texte privé sur votre PC. Cliquez sur **OK**.

### b.3 Ajouter l'adresse d'hébergement plus tard
1. Menu **Clients**, cliquez sur le nom `Done Juan POC Web`.
2. Dans « Origines JavaScript autorisées », cliquez sur **Ajouter un URI**, saisissez l'adresse, puis cliquez sur **Enregistrer**.
3. Google indique que le changement peut prendre de quelques minutes à quelques heures. En général, c'est moins de 5 minutes.

---

## c) Identifiant OAuth Android

**Important** : seuls comptent les APK construits avec les clés de test de l'équipe. Un APK construit sans ces clés est signé par une clé automatique dont l'empreinte change à chaque construction : il ne peut pas s'authentifier. L'équipe ne vous remettra que des APK dont elle a vérifié l'empreinte (affichée par la construction) contre `<SHA1_DEBUG>` ou `<SHA1_PUBLICATION>`. Si vous recevez un APK sans cette confirmation, ne l'installez pas.

L'équipe vous demande **deux** identifiants Android : un pour la clé de test « débogage », un pour la clé de test « publication » (prérequis P9). Le nom de paquet est le même ; seule l'empreinte change.

### c.1 Ce qu'est l'empreinte SHA-1
C'est une suite de 20 paires de caractères séparées par deux-points, par exemple de la forme `AA:BB:CC:...`. Elle identifie la clé qui signe l'application. Ce n'est pas un secret : on peut la transmettre. **Le fichier de clé, lui, est secret.**

### c.2 Comment obtenir l'empreinte
**Méthode recommandée : l'équipe vous la donne.**
L'équipe crée elle-même les deux clés de test et vous envoie les deux empreintes (`<SHA1_DEBUG>` et `<SHA1_PUBLICATION>`). Vous n'avez rien à installer. Vous ne recevez pas les fichiers de clé.

**Méthode de secours : vous la calculez.** À n'utiliser que si l'équipe vous le demande.
1. Installez Java (JDK 17 ou plus) depuis `https://adoptium.net`. Choisissez « Temurin », puis l'installeur de votre système.
2. Ouvrez un terminal (Windows : touche Windows, tapez `cmd`, Entrée).
3. Lancez la commande donnée par l'équipe (elle crée la clé et affiche l'empreinte). Le mot de passe de la clé est à inventer par vous, à noter dans un gestionnaire de mots de passe, et à ne jamais publier :
   ```
   keytool -genkeypair -v -keystore poc-test.jks -alias poc -keyalg RSA -keysize 2048 -validity 10000
   keytool -list -v -keystore poc-test.jks -alias poc
   ```
4. Dans le résultat, repérez la ligne qui commence par `SHA1:`. Copiez la suite de caractères.
5. Gardez le fichier `poc-test.jks` hors du dépôt GitHub. L'équipe vous dira comment le lui transmettre, si nécessaire.

### c.3 Créer l'identifiant (à faire deux fois)
1. **Google Auth Platform > Clients > Créer un client**.
2. « Type d'application » : **Android**.
3. « Nom » : `Done Juan POC Android debogage` (première fois), puis `Done Juan POC Android publication` (seconde fois).
4. « Nom du package » : saisissez `<NOM_DE_PAQUET>`, exactement comme l'équipe vous l'a donné. Une majuscule ou une faute fait échouer le test.
5. « Empreinte du certificat SHA-1 » : collez `<SHA1_DEBUG>` (première fois) ou `<SHA1_PUBLICATION>` (seconde fois).
6. Laissez décochée l'option « Activer la validation personnalisée de l'URI » (ou équivalent), si elle existe.
7. Cliquez sur **Créer**.

Résultat attendu : une fenêtre confirme la création. Il n'y a pas de secret. Copiez l'**ID client** affiché dans votre fichier texte privé, avec l'étiquette « débogage » ou « publication ».

Si Google refuse : « Un client Android avec ce nom de package et cette empreinte existe déjà ». Dans ce cas, il existe déjà, ne le recréez pas.

---

## d) Téléphone Android

### d.1 Vérifier la version
1. Ouvrez **Paramètres**.
2. Cherchez **À propos du téléphone** (ou **Informations sur le téléphone**), puis **Informations sur le logiciel**.
3. Vérifiez que « Version d'Android » est **10 ou plus**.

### d.2 Activer les options pour les développeurs
1. Dans **À propos du téléphone**, trouvez **Numéro de build** (parfois dans **Informations sur le logiciel**).
2. Touchez 7 fois de suite **Numéro de build**.
3. Saisissez votre code de verrouillage si le téléphone le demande.

Résultat attendu : un message « Vous êtes maintenant développeur ».

### d.3 Activer le débogage USB
1. Revenez dans **Paramètres**. Ouvrez **Options pour les développeurs** (souvent tout en bas, ou dans **Système**).
2. Activez l'interrupteur en haut de la page, si besoin.
3. Activez **Débogage USB**. Confirmez par **OK**.

### d.4 Mettre à jour Google Play services
1. Ouvrez l'application **Play Store**.
2. Cherchez `Services Google Play`, ouvrez la fiche. Si un bouton **Mettre à jour** s'affiche, touchez-le.

### d.5 Autoriser l'installation d'un fichier APK
Cette autorisation sert pour la méthode par fichier (d.7). Les noms varient selon la marque.
1. Ouvrez **Paramètres** et tapez `sources inconnues` ou `installer des applications inconnues` dans la recherche.
2. Choisissez le navigateur que vous utiliserez (**Chrome**).
3. Activez **Autoriser depuis cette source**.

Pensez à la désactiver après les séances.

### d.6 Méthode 1 : installation par câble (ADB)
À faire seulement si l'équipe vous le demande. La méthode 2 est plus simple.
1. Téléchargez « SDK Platform-Tools » sur `https://developer.android.com/tools/releases/platform-tools`. Décompressez le dossier.
2. Branchez le téléphone au PC par câble USB.
3. Sur le téléphone, une fenêtre « Autoriser le débogage USB ? » apparaît. Cochez « Toujours autoriser depuis cet ordinateur », puis touchez **Autoriser**.
4. Sur le PC, ouvrez un terminal dans le dossier décompressé et tapez : `adb devices`
5. Résultat attendu : une ligne avec un numéro suivi de `device`. Si c'est écrit `unauthorized`, revenez à l'étape 3.
6. Pour installer : `adb install -r chemin\vers\poc.apk`. Résultat attendu : `Success`.

### d.7 Méthode 2 : installation par fichier APK
1. Sur le téléphone, ouvrez Chrome et allez à l'adresse que l'équipe vous donne pour l'APK voulu (« débogage » ou « publication » : deux adresses distinctes, ne les confondez pas).
2. Touchez le lien de l'APK. Acceptez le téléchargement si Chrome avertit que « ce type de fichier peut être dangereux ».
3. Touchez **Ouvrir** quand le téléchargement est terminé, puis **Installer**.
4. Si Android ou Google Play Protect affiche un avertissement, **ne cliquez pas tout de suite** : notez le texte exact, faites une capture d'écran, puis suivez la consigne de la séance (g).

---

## e) Compte d'hébergement gratuit

### Cas A : GitHub Pages (dépôt public)
1. Vous avez déjà un compte GitHub. Il n'y a rien à créer.
2. Rendre le dépôt public est **une décision à confirmer avec Jarvis le jour du test**. Ne le faites pas avant son accord.
3. Quand Jarvis le confirme : sur la page du dépôt, **Settings** (« Paramètres »), tout en bas **Danger Zone** (« Zone de danger »), **Change repository visibility** (« Changer la visibilité du dépôt »), **Make public**. Suivez les confirmations.
4. Ensuite, **Settings > Pages**. Sous « Build and deployment », « Source » doit indiquer **GitHub Actions**. Choisissez-le s'il ne l'est pas.

Résultat attendu : l'adresse `https://<votre-nom-github>.github.io` est l'origine à déclarer à l'étape b.

### Cas B : Cloudflare Pages (dépôt privé)
1. Allez sur `https://dash.cloudflare.com/sign-up`.
2. Saisissez votre adresse e-mail et un mot de passe. Cliquez sur **Sign up**.
3. Ouvrez le courriel de vérification et cliquez sur le lien.
4. Dans le tableau de bord, ouvrez **Workers & Pages** (menu à gauche), puis **Créer** (« Create »), onglet **Pages**.
5. Choisissez **Charger des ressources** (« Upload assets »).
6. « Nom du projet » : choisissez un nom court, en minuscules, sans espace (par exemple `donejuan-poc`). Notez-le : il fait partie de l'adresse. Cliquez sur **Créer un projet**.
7. Vous n'avez pas encore de fichiers à charger. Laissez cette étape. L'équipe vous fournira un dossier compressé le jour J.

Résultat attendu : l'adresse sera `https://<nom-du-projet>.pages.dev`. Le plan gratuit suffit. **Ne saisissez aucune carte bancaire.**

---

## f) Informations à transmettre à l'équipe

### Ce qui peut être transmis
| Information | Secret ? | Exemple de forme |
|---|---|---|
| ID client Web | Non | `...apps.googleusercontent.com` |
| ID client Android « débogage » | Non | idem |
| ID client Android « publication » | Non | idem |
| Adresse d'hébergement (origine) | Non | `https://...` |
| Nom du projet Cloudflare (cas B) | Non | un mot |

### Ce qui ne doit **jamais** être transmis
- Votre mot de passe Google ou Cloudflare.
- Un code de sécurité à usage unique.
- Un fichier de clé (`.jks`, `.keystore`, `.p12`) et son mot de passe, sauf demande explicite de Jarvis par un canal privé.
- Tout « code secret du client », si la console en affiche un.

### Comment les transmettre
1. Envoyez les valeurs dans **un message privé** à Jarvis (pas dans un ticket du dépôt, pas dans un commentaire).
2. Ces valeurs ne seront **pas** enregistrées dans le dépôt. L'équipe les place dans des variables du dépôt GitHub (« Settings > Secrets and variables > Actions > Variables ») ou dans un fichier local ignoré par Git.
3. Attendez la réponse de Jarvis : « reçu, l'application de test est prête ».

---

## g) Déroulé des deux séances

### Règles pour les deux séances
- Un membre de l'équipe est joint par visio ou par message. Il vous dit quoi cliquer. Vous notez ce que vous voyez.
- Prenez une **capture d'écran** à chaque fois que Google affiche une fenêtre (consentement, avertissement, erreur).
- Pour chaque étape, remplissez le tableau de résultats de la fin de ce guide : heure, appareil, ce que vous avez vu, réussi ou non.
- Ne cherchez pas à corriger une erreur. Notez-la telle quelle : une erreur est un résultat utile.
- Si le texte d'un écran est long, copiez-le ou photographiez-le.

### Séance 1, jour J (environ 1 h 30, plus des attentes)
Matériel : PC, téléphone chargé, câble, accès aux comptes. Prérequis : parties a à f terminées, application de test installée.

| # | Ce que vous faites | Ce que vous observez | Ce que vous notez |
|---|---|---|---|
| 1 | **R11, sur le PC.** Ouvrez l'adresse de l'application de test dans Chrome. Cliquez sur « Se connecter » et acceptez. | Un écran « Google n'a pas validé cette application » apparaît-il ? Quels accès sont listés ? | Oui/non pour l'avertissement. Les accès affichés (capture). |
| 2 | **R11, sur le téléphone.** Ouvrez l'application de test. Touchez « Se connecter ». | Même question. | Oui/non. Capture. |
| 3 | **R1, sur le téléphone.** Touchez « Créer ». | Le journal affiche un dossier créé et une empreinte (suite de caractères). | L'empreinte (recopiez les 8 premiers caractères). |
| 4 | **R1, sur le PC.** Cliquez sur « Lister ». | Le fichier du téléphone apparaît, avec une empreinte. | Les empreintes sont-elles identiques ? |
| 5 | **R1, sens inverse.** Sur le PC, cliquez sur « Créer ». Sur le téléphone, touchez « Lister ». | Le fichier du PC apparaît, avec la même empreinte. | Identique ? |
| 6 | **R1, modification.** Sur le PC, cliquez sur « Modifier ». Sur le téléphone, touchez « Changements ». | Le fichier modifié apparaît avec une nouvelle empreinte. | Identique à celle du PC ? |
| 7 | **R1, Drive.** Ouvrez `https://drive.google.com`. Cherchez le dossier `Done Juan (POC)`. | Le dossier et deux fichiers sont visibles. | Oui/non. Capture. |
| 8 | **R1, création simultanée (facultatif).** Supprimez le dossier dans Drive. Au signal de l'équipe, cliquez sur « Créer » en même temps sur les deux appareils. | Y a-t-il un ou deux dossiers dans Drive ? | Le nombre. |
| 9 | **R2, préparation.** Sur le téléphone, notez l'heure d'expiration affichée. Fermez l'application en la retirant des applications récentes. | L'heure d'expiration est affichée. | L'heure. |
| 10 | **R3 et R12 (PC).** Installez l'application sur le PC (icône d'installation dans la barre d'adresse). | L'application s'ouvre dans sa propre fenêtre. | Oui/non. |
| 11 | **Attente de plus d'une heure.** Faites une pause. Ne rouvrez pas l'application. | — | L'heure de fin d'attente. |
| 12 | **R2, après 1 h.** Rouvrez l'application sur le téléphone. Touchez « Jeton silencieux ». | Un jeton est-il obtenu **sans aucune fenêtre** ? | Oui/non. Toute fenêtre vue (capture). |
| 13 | **R3 (PC).** Rouvrez l'application installée. Cliquez sur « Synchroniser ». | Combien de clics ? Une fenêtre qui se ferme seule ? Un mot de passe demandé ? | Les trois réponses. |
| 14 | **R3, session fermée.** Déconnectez-vous de Google dans Chrome, puis refaites 13. | Une fenêtre de connexion est attendue. | Ce qui s'affiche. |
| 15 | **R12 (PC).** Coupez le réseau du PC (Wi-Fi), ouvrez l'application installée. | S'ouvre-t-elle ? L'adresse e-mail est-elle affichée ? Une erreur liée à Google ? | Oui/non. Texte de l'erreur. |
| 16 | **Diagnostic (PC).** Dans l'écran « Diagnostic », touchez « Stockage persistant ? » puis lisez la ligne du journal (mesure R15). | « Stockage persistant » ou « Stockage non persistant ». | Le résultat. |
| 17 | **R2, redémarrage.** Redémarrez le téléphone. Rouvrez l'application. Touchez « Jeton silencieux ». | Même question qu'en 12. | Oui/non. |
| 18 | **Mode avion.** Activez le mode avion. Ouvrez l'application. | L'adresse e-mail en cache est affichée, sans erreur bloquante. | Oui/non. Texte de l'erreur. Désactivez le mode avion. |
| 19 | **APK de publication (R16-T).** Désinstallez d'abord l'application de test « débogage » (appui long sur l'icône, **Désinstaller**). Installez ensuite le premier APK « publication » par fichier (d.7). | Les autorisations demandées. Un avertissement Play Protect ? | Texte exact. Capture. |
| 20 | Connectez-vous, touchez « Créer », puis « Jeton silencieux ». | Cela fonctionne-t-il avec ce second identifiant ? | Oui/non. |
| 21 | Installez **par-dessus** le second APK « publication » (version supérieure), par câble : `adb install -r` (d.6). Rouvrez l'application, touchez « Signature et version », puis « Jeton silencieux ». | Succès ? Votre identité est-elle conservée ? Faut-il se reconnecter ou consentir de nouveau ? Le journal affiche-t-il le nouveau `versionCode` et la même empreinte SHA-1 ? | Oui/non pour chaque question. |
| 22 | (facultatif) Installez par-dessus un APK « débogage ». | Android refuse l'installation. | Le message. |
| 23 | **R2, tâche de fond.** Non disponible dans cette application de test (mesure informative, reportée à un lot ultérieur). | — | Rien à faire. |

**Important : ne retirez pas l'accès de l'application dans votre compte Google pendant cette séance.** Cela rendrait le test du lendemain impossible.

Avant de finir : l'équipe vérifie avec vous que le téléphone et l'application de test restent connectés. Laissez le téléphone intact jusqu'au lendemain (pas de réinitialisation, pas de désinstallation).

### Séance 2, jour J+1 (environ 1 h, au moins 24 h après la dernière connexion, étape 20 de la séance 1)

| # | Ce que vous faites | Ce que vous observez | Ce que vous notez |
|---|---|---|---|
| 1 | **R2, après 24 h.** Ouvrez l'application sur le téléphone. Touchez « Jeton silencieux ». | Un jeton est-il obtenu **sans aucune fenêtre** ? | Oui/non. Heure. Capture si fenêtre. |
| 2 | (Sans objet : la tâche de fond n'existe pas dans cette application de test.) | — | — |
| 3 | **Accès retiré, jeton encore valide (§3.5, point 2).** Connectez-vous sur le PC (touchez « Se connecter »). **Ne rechargez pas la page** jusqu'à l'étape 4 : le jeton n'est gardé qu'en mémoire. Dans le journal, vérifiez que le jeton expire dans plus de 2 minutes. Dans un autre onglet, ouvrez `https://myaccount.google.com`, **Sécurité**, **Vos connexions à des applications tierces** (nom possible : « Applications tierces avec accès au compte »), choisissez `Done Juan`, **Supprimer l'accès**. | La suppression est confirmée. | L'heure exacte de la suppression. |
| 4 | Dans l'application de test (PC), cliquez sur « Appeler Drive » **tout de suite**, puis 1, 5 et 15 minutes plus tard. | Drive répond-il « 401 » (refus) ou accepte-t-il ? | Le résultat à chaque moment. |
| 5 | **Demande de jeton après retrait (§3.5, point 3).** Rechargez la page, puis cliquez sur « Demander un jeton » (PC). | L'écran de consentement revient-il, ou une erreur ? | Le texte exact ou le code. Capture. |
| 6 | Si un écran de consentement apparaît, acceptez **tous** les accès. Regardez le journal. | « Tous les accès accordés » : vrai ou faux. | La valeur. |
| 7 | Recommencez 5 puis 6 (retirez d'abord l'accès comme en 3), mais **décochez** un accès à la demande de Google, si Google le permet. | La valeur change-t-elle ? | La valeur. |
| 8 | **R2, retrait de l'accès sur le téléphone.** Retirez de nouveau l'accès (comme en 3). Sur le téléphone, touchez « Jeton silencieux ». | Le journal affiche un résultat (selon le comportement de Google : `AccesGoogleRevoque`, ou `InteractionRequise` avec un écran de consentement). Les deux sont des résultats utiles. | Le texte exact du résultat et le code d'erreur affiché dans le journal. Capture. |
| 9 | **Fin.** Désactivez « Sources inconnues » (d.5). Si vous le souhaitez, supprimez le dossier `Done Juan (POC)` dans Drive. | — | — |

### Tableau de résultats
Recopiez ce tableau dans un fichier privé, ou demandez à l'équipe de le tenir pendant la séance.

| Séance | Étape | Date et heure | Appareil | Ce que j'ai vu | Réussi ? (oui/non) | Capture |
|---|---|---|---|---|---|---|
| | | | | | | |

### Après les séances
- Envoyez le tableau et les captures à Jarvis, dans un message privé.
- L'équipe analyse les résultats et vous propose une décision (aucune action de votre part).
- Si un résultat est mauvais, l'équipe vous soumet un choix. Aucun de ces choix n'est irréversible.

---

## Annexe : en cas de problème

| Symptôme | Que faire |
|---|---|
| « redirect_uri_mismatch » ou « origin_mismatch » | L'adresse n'est pas dans les origines de l'identifiant Web (b.3). Vérifiez l'absence de `/` final. Attendez 5 minutes. |
| Erreur « 400 invalid_request » à la connexion Android | Le nom de paquet ou l'empreinte est faux (c.3). Recopiez-les. |
| « Accès bloqué : cette application n'a pas été validée » | Notez-le : c'est un résultat R11. Vérifiez que l'état est « En production » (a.4, point 9). |
| Le téléphone n'apparaît pas dans `adb devices` | Changez de câble. Refaites d.3. |
| L'application n'est pas installable | Désinstallez l'ancienne version signée par une autre clé, puis réessayez. |
| Autre | Capture d'écran et message à Jarvis. |
