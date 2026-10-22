# Guide pas à pas du test technique (version web)

> **Version 3 du 2026-10-22.** Auteur : Starck. Destinataire : le commanditaire.
> **Ce qui change en version 3** (votre décision DEC-034 du 2026-10-22) : on teste **une seule application web** (PWA), sur le PC et sur le téléphone Android, **sans application Android à installer, sans clé et sans mode développeur**. L'ancien volet Android est rangé en **annexe R « repli »** : il ne servira que si le test montre que la version web ne convient pas sur le téléphone. Deux nouvelles mesures sur le téléphone : la **connexion automatique à l'ouverture** (la condition que vous avez posée) et la **conservation des données** après un arrêt forcé ou un redémarrage. Une partie **facultative** (h) prépare le partage avec un contributeur sur iPhone (DEC-035).
> Protocole technique de référence : `test-technique-R1-R2.md` v3.
> Mise à jour du 2026-10-22 : case « Redirection automatique à l'ouverture », ligne de contexte (« standalone », « web-android »), exports avec contexte.
> Statut : **prêt à l'emploi, jamais exécuté.**

## 0. Avant de commencer

### Ce que ce guide vous demande
Vous mettez en ligne l'application de test sur GitHub, vous créez un petit projet chez Google, puis vous faites **une séance d'essai d'environ 1 h** avec l'équipe, coupée par une pause d'au moins une heure. Aucune compétence technique n'est nécessaire.

### Durée estimée
| Partie | Durée |
|---|---|
| a) Rendre le dépôt public et activer GitHub Pages | 10 min |
| b) Projet Google Cloud | 30 min |
| c) Identifiant Web | 10 min |
| d) Mettre l'application de test en ligne | 5 min, plus 5 min d'attente |
| e) Préparer le téléphone | 5 min |
| f) Transmission à l'équipe | 5 min |
| **Préparation totale** | **environ 1 h**, en une ou plusieurs fois |
| g) Séance d'essai | 1 h, plus une pause d'au moins 1 h ; un contrôle de 5 min le lendemain (facultatif) |
| h) Partage avec un contributeur (facultatif, plus tard) | 1 h, plus des attentes |

### Ce qu'il vous faut
- Un PC avec Chrome ou Edge à jour.
- Votre téléphone Android, avec **Chrome à jour** et votre compte Google connecté dans Chrome (c'est le cas habituel).
- Un compte Google. Conseil : un compte Gmail **de test** évite d'écrire dans votre Drive personnel. Si vous en créez un, connectez-le aussi dans Chrome sur le téléphone.
- Votre compte GitHub.

**Vous n'avez plus besoin** : de câble USB, du mode développeur, d'installer un fichier APK, de Java ni de clés de signature.

### Règles à respecter
- **Ne publiez jamais** un mot de passe ou un code reçu par SMS. Les identifiants que vous allez créer ne sont pas secrets, mais envoyez-les à Jarvis par message privé.
- Les noms de menus sont ceux d'octobre 2026. **Google et GitHub les changent souvent.** Si un nom est introuvable, cherchez le mot le plus proche, ou faites une capture d'écran et envoyez-la à l'équipe.
- Si vous bloquez plus de 10 minutes, arrêtez-vous et prévenez Jarvis. Rien ne se perd.

### Les trois adresses à recopier telles quelles
| Nom | Valeur | Où elle sert |
|---|---|---|
| **Origine** | `https://mathieublandin-create.github.io` | c.2 (origines JavaScript), a.3 |
| **Adresse de l'application** (URI de redirection) | `https://mathieublandin-create.github.io/taskapp/` | c.2 (URI de redirection), séance |
| **Chemin** | `/taskapp/` | a.3 |

Attention aux barres obliques : l'**origine** n'en a **pas** à la fin ; l'**adresse de l'application** en a **une** à la fin.

---

## a) Rendre le dépôt public et activer GitHub Pages
L'équipe a vérifié l'historique du dépôt le 2026-10-22 : aucun fichier de clé, aucun mot de passe ni jeton n'y figure. Vous avez autorisé le passage en public (DEC-023, DEC-032).

### a.1 Rendre le dépôt public
1. Sur GitHub, ouvrez le dépôt `mathieublandin-create/taskapp`.
2. **Settings** (« Paramètres »), tout en bas : **Danger Zone**, **Change repository visibility**, **Make public**. Suivez les confirmations.

Résultat attendu : le mot « Public » s'affiche à côté du nom du dépôt.

### a.2 Activer GitHub Pages
1. **Settings > Pages** (menu de gauche).
2. Sous « Build and deployment », réglez **Source** sur **GitHub Actions**.

### a.3 Créer deux variables
1. **Settings > Secrets and variables > Actions**, onglet **Variables** (pas « Secrets »), puis **New repository variable**.
2. Créez ces deux variables, une par une :

   | Nom (exact) | Valeur (exacte) |
   |---|---|
   | `VITE_BASE_PATH` | `/taskapp/` (avec les deux barres obliques, sinon le site ne se charge pas) |
   | `VITE_APP_ORIGIN` | `https://mathieublandin-create.github.io` (sans barre oblique finale) |

Une troisième variable sera ajoutée en d.1, après la création de l'identifiant Google.

---

## b) Projet Google Cloud

### b.1 Ouvrir la console
1. Sur votre PC, ouvrez Chrome.
2. Connectez-vous avec le compte Google de test.
3. Allez à l'adresse `https://console.cloud.google.com`.
4. Si Google affiche les conditions d'utilisation, cochez la case, puis cliquez sur **Accepter et continuer** (« Agree and continue »).

Résultat attendu : la page d'accueil de la console s'affiche, avec un bandeau bleu ou gris en haut.

Aucune facturation n'est nécessaire. Si Google propose un « essai gratuit » ou demande une carte bancaire, **refusez**. Fermez la fenêtre et continuez.

### b.2 Créer le projet
1. En haut à gauche, à côté du logo « Google Cloud », cliquez sur le **sélecteur de projet** (il affiche le nom d'un projet ou « Sélectionner un projet »).
2. Dans la fenêtre, cliquez sur **Nouveau projet** (« New project »).
3. Dans « Nom du projet », saisissez : `objectifs-taches-dev`.
4. Laissez « Organisation » et « Emplacement » sur « Aucune organisation ».
5. Cliquez sur **Créer** (« Create »).
6. Attendez 10 à 30 secondes. Une notification (cloche en haut à droite) indique que le projet est créé.
7. Rouvrez le sélecteur de projet et choisissez `objectifs-taches-dev`.

Résultat attendu : le nom `objectifs-taches-dev` s'affiche en haut de la console.

### b.3 Activer l'API Google Drive
1. Ouvrez le menu principal (trois traits, en haut à gauche).
2. Cliquez sur **API et services** (« APIs & Services »), puis sur **Bibliothèque** (« Library »).
3. Dans la barre de recherche, tapez `Google Drive API`.
4. Cliquez sur la carte **Google Drive API**.
5. Cliquez sur le bouton bleu **Activer** (« Enable »).

Résultat attendu : une page « Présentation de l'API » avec le texte « API activée » (« API enabled »).

### b.4 Écran de consentement OAuth
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
   5. **Ne cochez aucun autre accès.** Pas de « drive » tout court, pas de « calendar » pour ce test. (Le volet facultatif de partage, partie h, ajoutera l'API « Google Picker », qui n'est pas un niveau d'accès.)

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

## c) Identifiant OAuth Web

### c.1 Ce que vous allez déclarer
Google n'accepte de connecter l'application que depuis des adresses déclarées à l'avance. Il y en a deux sortes : les **origines** (d'où l'application parle à Google) et les **adresses de retour** (où Google renvoie après la connexion). Les deux sont nécessaires pour ce test.

### c.2 Créer l'identifiant
1. Dans **Google Auth Platform**, ouvrez le menu **Clients**.
2. Cliquez sur **Créer un client** (« Create client »).
3. « Type d'application » : **Application Web**.
4. « Nom » : `Done Juan POC Web`.
5. Section **Origines JavaScript autorisées** (« Authorized JavaScript origins ») : cliquez sur **Ajouter un URI** et saisissez, une ligne chacune :
   - `http://localhost:5173`
   - `https://mathieublandin-create.github.io`
6. Section **URI de redirection autorisés** (« Authorized redirect URIs ») : cliquez sur **Ajouter un URI** et saisissez, une ligne chacune :
   - `https://mathieublandin-create.github.io/taskapp/` (avec la barre oblique finale)
   - `http://localhost:5173/`
7. Cliquez sur **Créer**.

Résultat attendu : une fenêtre « Client OAuth créé » affiche un **ID client** (il se termine par `.apps.googleusercontent.com`). Si un « code secret du client » est affiché, **ne le copiez pas** : l'application ne l'utilise pas.

8. Copiez l'**ID client** dans un fichier texte privé. Cliquez sur **OK**.

Google indique qu'un changement peut prendre de quelques minutes à quelques heures. En général, moins de 5 minutes.

### c.3 Si vous avez déjà créé cet identifiant (version 2 du guide)
Ouvrez **Clients > Done Juan POC Web**, ajoutez les deux **URI de redirection** de l'étape c.2.6 (la v2 disait de laisser vide), puis **Enregistrer**. Les éventuels identifiants « Android » créés avec la v2 peuvent rester : ils ne gênent pas.

---

## d) Mettre l'application de test en ligne

### d.1 Ajouter l'ID client
1. GitHub, **Settings > Secrets and variables > Actions**, onglet **Variables**, **New repository variable**.
2. Nom : `VITE_GOOGLE_WEB_CLIENT_ID`. Valeur : l'**ID client** copié en c.2.8.

### d.2 Lancer la mise en ligne
1. Onglet **Actions** du dépôt, workflow **poc** (colonne de gauche), puis **Run workflow**.
2. Gardez les valeurs proposées. **Cochez « Déployer sur GitHub Pages »**. **Laissez décochée la case « Construire les APK »** (elle ne sert que pour l'annexe R).
3. Cliquez sur **Run workflow**. Attendez la fin (pastille verte), environ 5 minutes.

Résultat attendu : une pastille **verte**. Les lignes « apk » apparaissent comme **sautées** (grisées) : c'est normal, aucune clé n'est nécessaire pour ce test.

4. Ouvrez `https://mathieublandin-create.github.io/taskapp/` sur le PC. Résultat attendu : l'écran « Diagnostic » de l'application de test.

Si la pastille est rouge, notez le nom de la ligne en rouge et prévenez Jarvis.

---

## e) Préparer le téléphone
1. Ouvrez le **Play Store**, cherchez **Chrome** ; si un bouton **Mettre à jour** s'affiche, touchez-le.
2. Ouvrez Chrome, touchez votre photo en haut à droite (ou **⋮ > Paramètres**) : vérifiez que le compte Google du test est **connecté**.
3. Vérifiez qu'il reste au moins 1 Go d'espace libre (**Paramètres > Stockage**).

---

## f) Informations à transmettre à l'équipe
Envoyez à Jarvis, par **message privé** :
- l'ID client Web (non secret) ;
- « dépôt public, Pages activé, mise en ligne verte » (ou le nom de la ligne rouge) ;
- tout message inattendu vu chez Google (capture).

**Ne transmettez jamais** votre mot de passe Google ou GitHub, un code reçu par SMS, ni un « code secret du client ».

---

## g) Séance d'essai (environ 1 h, plus une pause d'au moins 1 h)

### Règles
- Un membre de l'équipe est joint par visio ou par message. Il vous dit quoi toucher. Vous notez ce que vous voyez.
- Prenez une **capture d'écran** à chaque fois que Google affiche quelque chose (choix de compte, consentement, avertissement, erreur).
- Pour chaque étape, remplissez le tableau de résultats : heure, appareil, ce que vous avez vu, réussi ou non.
- Ne cherchez pas à corriger une erreur. Notez-la : c'est un résultat utile.
- **Installer l'application** sur le téléphone : dans Chrome, à l'adresse de l'application, menu **⋮**, puis **Installer l'application** (ou **Ajouter à l'écran d'accueil**, puis **Installer**). Une icône « Diagnostic » apparaît sur l'écran d'accueil. **Pendant la séance, ouvrez toujours l'application par cette icône**, jamais par un onglet de Chrome (sauf à l'étape 13).
- Le journal de l'application et le haut de l'écran affichent une ligne de **contexte**, par exemple « mode d'affichage : standalone ; plateforme : web-android ; en ligne : true ». Sur le téléphone, vérifiez **« standalone »** (application installée, et non onglet) et **« web-android »**. Sur le PC : « standalone » et « web-pc ».
- **Redirection automatique à l'ouverture** : une case de ce nom se trouve dans le groupe « Redirection ». Une fois cochée, l'application part d'elle-même chez Google **à chaque ouverture**, sans que vous touchiez quoi que ce soit, puis revient. C'est exactement ce que l'étape décisive (14) doit vérifier. Si le journal affiche « Départ automatique à l'ouverture : Non lancé », il indique la raison (pas de réseau, pas d'identité, départ précédent resté sans retour) : notez-la, puis touchez « Jeton par redirection ».

### Première partie (environ 30 min)

| # | Ce que vous faites | Ce que vous observez | Ce que vous notez |
|---|---|---|---|
| 1 | **Consentement, PC.** Ouvrez l'adresse de l'application dans Chrome. Cliquez sur « Se connecter » et acceptez. | Un écran « Google n'a pas validé cette application » apparaît-il ? Quels accès sont listés ? | Oui/non pour l'écran. Les accès (capture). |
| 2 | **Installer sur le PC.** Cliquez sur l'icône d'installation dans la barre d'adresse. | L'application s'ouvre dans sa propre fenêtre. | Oui/non. |
| 3 | **Installer sur le téléphone.** Ouvrez l'adresse dans Chrome, puis **⋮ > Installer l'application**. Ouvrez l'icône « Diagnostic ». | Une fenêtre sans barre d'adresse. | Oui/non. |
| 4 | **Consentement, téléphone.** Dans l'application installée, touchez « Se connecter », acceptez. | Même question qu'en 1. La fenêtre Google revient-elle dans l'application ? | Oui/non. Capture. |
| 5 | **Connexion automatique, premier essai.** Touchez « Remettre à zéro le compteur », puis « Jeton par redirection ». Ensuite, **cochez la case « Redirection automatique à l'ouverture »**. | L'écran passe brièvement chez Google et revient. Le journal affiche « JetonObtenu », « redirection n° 1 », une durée, « standalone » et « web-android ». | Le résultat, la durée, « standalone » et « web-android » (oui/non). Si un écran Google demande quelque chose : capture. |
| 6 | **Stockage, téléphone.** Touchez « Stockage persistant ? ». | Deux lignes : avant, puis après la demande. | « Stockage persistant » ou « non persistant ». |
| 7 | **Stockage, PC.** Même bouton dans l'application installée du PC. Cochez aussi la case « Redirection automatique à l'ouverture » sur le PC. | Idem. | Le résultat. |
| 8 | **Conservation après arrêt forcé.** Sur le téléphone, touchez « Poser le marqueur » et notez les **8 premiers caractères** de l'identifiant. Ouvrez **Paramètres > Applications > Chrome > Forcer l'arrêt**, confirmez. Rouvrez l'icône « Diagnostic » (elle passe d'elle-même chez Google, c'est normal), puis touchez « Lire le marqueur ». | « Marqueur présent » avec le même identifiant, ou « Marqueur absent ». | Présent/absent. Identifiant identique ? |
| 9 | **Conservation après redémarrage.** Touchez « Poser le marqueur », notez l'identifiant, puis **redémarrez aussitôt** le téléphone (moins de 5 secondes après). Rouvrez l'icône, « Lire le marqueur ». | Idem. | Présent/absent. Identique ? |
| 10 | **Hors ligne.** Activez le mode avion. Ouvrez l'icône « Diagnostic ». | L'application s'ouvre-t-elle ? Votre adresse e-mail s'affiche-t-elle ? Une erreur liée à Google ? (Le journal indique « Non lancé : réseau indisponible » : c'est attendu.) | Oui/non. Texte de l'erreur. **Désactivez le mode avion.** |
| 11 | **Hors ligne, PC.** Coupez le Wi-Fi du PC, ouvrez l'application installée. | Idem. | Idem. Rallumez le Wi-Fi. |
| 12 | **Avant la pause.** Notez l'heure. Fermez l'application sur le téléphone **en la retirant des applications récentes** (bouton carré ou geste de balayage vers le haut). Fermez aussi celle du PC. | — | L'heure de début de la pause. |

**Pause d'au moins 1 h 05.** N'ouvrez pas l'application de test pendant ce temps. Vous pouvez utiliser votre téléphone normalement.

### Seconde partie, après la pause (environ 30 min)

| # | Ce que vous faites | Ce que vous observez | Ce que vous notez |
|---|---|---|---|
| 13 | **(Comparaison, optionnelle)** Dans un **onglet** Chrome ordinaire du téléphone, ouvrez l'adresse de l'application, touchez « Stockage persistant ? ». Fermez l'onglet. | Le résultat dans un onglet. | Le résultat. |
| 14 | **Connexion automatique après plus d'une heure : l'étape décisive.** Ouvrez l'icône « Diagnostic » **et ne touchez plus à rien** : avec la case cochée (étape 5), l'application part seule chez Google. Si le journal affiche « Non lancé », notez la raison, puis touchez « Jeton par redirection ». | Le passage chez Google : **devez-vous taper quelque chose** (mot de passe, code) ? **choisir un compte** ou **toucher un bouton** chez Google (par exemple « Continuer ») ? Combien de temps ? Le journal affiche-t-il « Départ automatique à l'ouverture », puis « JetonObtenu », avec « standalone » et « web-android » ? Êtes-vous revenu dans l'application (pas dans un onglet de Chrome) ? | Les réponses. Capture de tout écran Google. La durée affichée. |
| 15 | **Après redémarrage.** Redémarrez le téléphone. Ouvrez l'icône **sans rien toucher**. | Mêmes questions. | Les réponses. |
| 16 | **Geste en cours d'usage (téléphone).** Toujours dans l'application, touchez « Synchroniser ». | Une fenêtre Google s'ouvre-t-elle et se ferme-t-elle seule ? Faut-il taper quelque chose ? | Les réponses. |
| 17 | **PC après la pause.** Ouvrez l'application installée du PC **sans rien cliquer** (case cochée à l'étape 7). Puis cliquez sur « Synchroniser ». | Mêmes questions qu'en 14 et 16. | Les réponses. |
| 18 | **Session Google fermée (PC).** Déconnectez-vous de Google dans Chrome sur le PC, puis **rechargez** l'application (touche F5) : elle part seule chez Google. | Le journal affiche une erreur (par exemple « login_required »), puis « Non lancé : la page revient de Google ». L'application ne doit **pas** repartir en boucle chez Google. | Le texte de l'erreur. Une boucle ? Reconnectez-vous ensuite à Google. |
| 19 | **Accès retiré, jeton encore valide (PC).** Cliquez sur « Se connecter ». **Ne rechargez pas la page** jusqu'à l'étape 20. Dans un autre onglet, `https://myaccount.google.com`, **Sécurité**, **Vos connexions à des applications tierces**, `Done Juan`, **Supprimer l'accès**. | La suppression est confirmée. | L'heure exacte. |
| 20 | Dans l'application (PC), cliquez sur « Appeler Drive » **tout de suite**, puis 1, 5 et 15 minutes plus tard. | « 401 » (refus) ou accepté ? | Le résultat à chaque moment. |
| 21 | Rechargez la page, cliquez sur « Demander un jeton ». Si un écran de consentement apparaît, acceptez **tous** les accès. | Écran de consentement ou erreur ? « Tous les accès accordés » : vrai ou faux ? | Le texte ou le code. La valeur. Capture. |

**Fin de la séance.** Si vous le souhaitez, supprimez le dossier `Done Juan (POC)` dans Drive. Gardez l'application installée sur le téléphone jusqu'au retour de l'équipe.

### Le lendemain (facultatif, 5 min)
| # | Ce que vous faites | Ce que vous observez | Ce que vous notez |
|---|---|---|---|
| 22 | Plus de 24 h après l'étape 14, ouvrez l'icône « Diagnostic » sur le téléphone, sans rien toucher, puis « Lire le marqueur ». | Mêmes questions qu'en 14. Le marqueur est-il toujours là ? | Les réponses. |

### Tableau de résultats
Recopiez ce tableau dans un fichier privé, ou demandez à l'équipe de le tenir pendant la séance.

| Étape | Date et heure | Appareil | « standalone » ? | Ce que j'ai vu | Réussi ? (oui/non) | Capture |
|---|---|---|---|---|---|---|
| | | | | | | |

### Après la séance
- **Exportez le journal de chaque appareil** : bouton « Exporter JSON » sur le téléphone, puis sur le PC. Le fichier est téléchargé (sur le téléphone, dans « Téléchargements »). Chaque export commence par la ligne de **contexte** de l'appareil (mode d'affichage, plateforme) : inutile de renommer les fichiers. « Exporter CSV » donne la même chose pour un tableur, le contexte en première ligne.
- Envoyez le tableau, les captures et les deux exports à Jarvis, en message privé.
- L'équipe analyse les résultats. **Si l'étape 14 réussit sans rien taper et que le stockage est persistant (étape 6)**, la version web est retenue pour le téléphone, comme vous l'avez décidé ; sinon, on revient à l'application Android (annexe R), et l'équipe vous le dit avant toute action.

---

## h) Facultatif, plus tard : essai de partage avec un contributeur sur iPhone (EPI-001)
**À faire avant que l'équipe ne commence l'analyse du partage (étape E3 d'EPI-001), pas avant.** L'équipe vous prévient quand l'application de test est prête pour cette partie.

### h.1 Ce qu'il faut
- Le **contributeur**, avec son compte Google et son **iPhone** (iOS 17 ou plus).
- Vous, avec votre PC et le compte du test (le compte « administrateur »).
- Environ 1 h ensemble, puis deux brefs contrôles du contributeur : 1 h après, et le lendemain.

### h.2 Préparation (vous, 10 min)
1. Console Google, projet `objectifs-taches-dev` : **API et services > Bibliothèque**, cherchez `Google Picker API`, **Activer**.
2. **API et services > Identifiants > Créer des identifiants > Clé API**. Puis **Modifier la clé** :
   - « Restrictions relatives aux applications » : **Sites web** ; ajoutez `https://mathieublandin-create.github.io/*` et `http://localhost:5173/*` ;
   - « Restrictions relatives aux API » : **Restreindre la clé**, cochez seulement **Google Picker API** ;
   - **Enregistrer**.
3. Notez la clé et le **numéro du projet** (page d'accueil de la console, « Numéro du projet »). Envoyez-les à Jarvis en message privé. Ce ne sont pas des secrets, grâce aux restrictions.
4. Aucun réglage n'est nécessaire pour le compte du contributeur : l'application est « En production ».

### h.3 Déroulé
| # | Qui | Ce que vous faites | Ce que vous notez |
|---|---|---|---|
| 1 | Contributeur | Sur l'iPhone, Safari, adresse de l'application. **Partager** (carré avec une flèche) > **Sur l'écran d'accueil** > **Ajouter**. Ouvrez l'icône. | L'application s'ouvre sans barre d'adresse ? |
| 2 | Contributeur | « Connexion par redirection » ; connectez-vous avec **son** compte Google, acceptez. Puis **cochez « Redirection automatique à l'ouverture »**. | Revenu dans l'application ? « JetonObtenu » ? « standalone » et « web-ios » ? Écran d'avertissement ? Captures. |
| 3 | Contributeur | « Se connecter » (l'autre bouton). | La fenêtre Google s'ouvre-t-elle, et revient-elle ? |
| 4 | Contributeur | « Stockage persistant ? », puis « Poser le marqueur ». | Les résultats, l'identifiant (8 caractères). |
| 5 | Vous (PC) | « Se connecter », puis « Créer ». | — |
| 6 | Vous | Sur drive.google.com, clic droit sur `Done Juan (POC)` > **Partager** : adresse du contributeur, rôle **Lecteur**, **Envoyer**. | — |
| 7 | Contributeur | « Lire par identifiant » (l'équipe lui dicte l'identifiant). | Le code affiché (404 attendu). |
| 8 | Contributeur | « Choisir dans le sélecteur Google », onglet **Partagés avec moi**, choisissez le **dossier** `Done Juan (POC)`. Puis « Lister le dossier choisi », puis « Lire par identifiant ». | Combien de fichiers listés ? Lu ou 404 ? |
| 9 | Vous (PC) | « Créer » de nouveau (un second fichier, l'équipe vous guide). | — |
| 10 | Contributeur | « Lister le dossier choisi », **sans** repasser par le sélecteur. | Le nouveau fichier apparaît-il ? |
| 11 | Contributeur | « Tenter une écriture ». | Le code (403 attendu). |
| 12 | Contributeur | « Créer mon fichier », puis, dans l'application **Google Drive** de l'iPhone, partager ce fichier avec vous, rôle Lecteur. | — |
| 13 | Vous (PC) | « Lire par identifiant » (identifiant dicté par l'équipe), puis sélecteur Google, puis de nouveau « Lire par identifiant ». | 404 puis lu ? |
| 14 | Contributeur | Ferme l'application (balayage). **Plus d'une heure après**, la rouvre **sans rien toucher** (départ automatique ; si « Non lancé », touche « Jeton par redirection »). | Faut-il taper quelque chose ? « JetonObtenu » ? Capture de tout écran Google. |
| 15 | Contributeur | Redémarre l'iPhone, rouvre l'icône sans rien toucher, puis « Lire le marqueur ». | Marqueur présent ? Jeton sans saisie ? |
| 16 | Contributeur | Le lendemain, puis (facultatif) après 7 jours sans l'ouvrir : même chose qu'en 15. | Idem. |

Fin : retirez le partage du dossier dans Drive si vous le souhaitez.

---

## Annexe : en cas de problème

| Symptôme | Que faire |
|---|---|
| « redirect_uri_mismatch » | L'adresse de l'application n'est pas dans les **URI de redirection** (c.2.6), ou il manque la barre oblique finale. Corrigez, attendez 5 minutes. |
| « origin_mismatch » | L'origine n'est pas dans les **origines JavaScript** (c.2.5), ou elle a une barre oblique finale. |
| « Accès bloqué : cette application n'a pas été validée » | Notez-le : c'est un résultat. Vérifiez que l'état est « En production » (b.4, point 9). |
| Page blanche ou « 404 » à l'adresse de l'application | Vérifiez `VITE_BASE_PATH` = `/taskapp/` (a.3) et relancez la mise en ligne (d.2). |
| « Configuration invalide : VITE_GOOGLE_WEB_CLIENT_ID est vide » | Ajoutez la variable (d.1) et relancez la mise en ligne (d.2). |
| Pas de menu « Installer l'application » dans Chrome (téléphone) | Rechargez la page une fois, attendez 30 s, réessayez. Sinon : **⋮ > Ajouter à l'écran d'accueil**. Capture et message à Jarvis. |
| Après « Jeton par redirection », l'application s'ouvre dans un onglet de Chrome | Notez-le : c'est un résultat important. Capture. Revenez ensuite dans l'icône « Diagnostic » et touchez « Jeton par redirection » une fois. |
| « Non lancé : un départ est déjà en attente de retour », à chaque ouverture | Un passage précédent chez Google n'est pas revenu. Touchez « Jeton par redirection » une fois : la redirection automatique refonctionne aux ouvertures suivantes. |
| Autre | Capture d'écran et message à Jarvis. |

---

## Annexe R — Repli : application Android (à ne faire que si l'équipe vous le demande)
Cette annexe reprend la version 2 du guide. Elle ne servira que si la séance g) montre que la version web ne convient pas sur le téléphone (votre décision DEC-034). Elle suppose aussi la création des clés de test (`procedure-cles-et-premier-passage.md`, aujourd'hui suspendue). **Ne faites rien de cette annexe sans l'accord de Jarvis.**

Le nom de paquet est `fr.donejuan.poc`. Les empreintes `<SHA1_DEBUG>` et `<SHA1_PUBLICATION>` sont celles de la procédure des clés. Les renvois « d.5 », « d.6 », « d.7 » ci-dessous désignent R.2.5, R.2.6 et R.2.7 ; « c.2 » désigne R.1.2 ; « (g) » désigne R.3. Les prérequis de cette annexe s'ajoutent aux parties a) à f).

### R.1 Identifiants OAuth Android

**Important** : seuls comptent les APK construits avec les clés de test de l'équipe. Un APK construit sans ces clés est signé par une clé automatique dont l'empreinte change à chaque construction : il ne peut pas s'authentifier. L'équipe ne vous remettra que des APK dont elle a vérifié l'empreinte (affichée par la construction) contre `<SHA1_DEBUG>` ou `<SHA1_PUBLICATION>`. Si vous recevez un APK sans cette confirmation, ne l'installez pas.

L'équipe vous demande **deux** identifiants Android : un pour la clé de test « débogage », un pour la clé de test « publication » (prérequis P9). Le nom de paquet est le même ; seule l'empreinte change.

#### R.1.1 Ce qu'est l'empreinte SHA-1
C'est une suite de 20 paires de caractères séparées par deux-points, par exemple de la forme `AA:BB:CC:...`. Elle identifie la clé qui signe l'application. Ce n'est pas un secret : on peut la transmettre. **Le fichier de clé, lui, est secret.**

#### R.1.2 Comment obtenir l'empreinte
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

#### R.1.3 Créer l'identifiant (à faire deux fois)
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

### R.2 Téléphone Android en mode développeur

#### R.2.1 Vérifier la version
1. Ouvrez **Paramètres**.
2. Cherchez **À propos du téléphone** (ou **Informations sur le téléphone**), puis **Informations sur le logiciel**.
3. Vérifiez que « Version d'Android » est **10 ou plus**.

#### R.2.2 Activer les options pour les développeurs
1. Dans **À propos du téléphone**, trouvez **Numéro de build** (parfois dans **Informations sur le logiciel**).
2. Touchez 7 fois de suite **Numéro de build**.
3. Saisissez votre code de verrouillage si le téléphone le demande.

Résultat attendu : un message « Vous êtes maintenant développeur ».

#### R.2.3 Activer le débogage USB
1. Revenez dans **Paramètres**. Ouvrez **Options pour les développeurs** (souvent tout en bas, ou dans **Système**).
2. Activez l'interrupteur en haut de la page, si besoin.
3. Activez **Débogage USB**. Confirmez par **OK**.

#### R.2.4 Mettre à jour Google Play services
1. Ouvrez l'application **Play Store**.
2. Cherchez `Services Google Play`, ouvrez la fiche. Si un bouton **Mettre à jour** s'affiche, touchez-le.

#### R.2.5 Autoriser l'installation d'un fichier APK
Cette autorisation sert pour la méthode par fichier (d.7). Les noms varient selon la marque.
1. Ouvrez **Paramètres** et tapez `sources inconnues` ou `installer des applications inconnues` dans la recherche.
2. Choisissez le navigateur que vous utiliserez (**Chrome**).
3. Activez **Autoriser depuis cette source**.

Pensez à la désactiver après les séances.

#### R.2.6 Méthode 1 : installation par câble (ADB)
À faire seulement si l'équipe vous le demande. La méthode 2 est plus simple.
1. Téléchargez « SDK Platform-Tools » sur `https://developer.android.com/tools/releases/platform-tools`. Décompressez le dossier.
2. Branchez le téléphone au PC par câble USB.
3. Sur le téléphone, une fenêtre « Autoriser le débogage USB ? » apparaît. Cochez « Toujours autoriser depuis cet ordinateur », puis touchez **Autoriser**.
4. Sur le PC, ouvrez un terminal dans le dossier décompressé et tapez : `adb devices`
5. Résultat attendu : une ligne avec un numéro suivi de `device`. Si c'est écrit `unauthorized`, revenez à l'étape 3.
6. Pour installer : `adb install -r chemin\vers\poc.apk`. Résultat attendu : `Success`.

#### R.2.7 Méthode 2 : installation par fichier APK
1. Sur le téléphone, ouvrez Chrome et allez à l'adresse que l'équipe vous donne pour l'APK voulu (« débogage » ou « publication » : deux adresses distinctes, ne les confondez pas).
2. Touchez le lien de l'APK. Acceptez le téléchargement si Chrome avertit que « ce type de fichier peut être dangereux ».
3. Touchez **Ouvrir** quand le téléchargement est terminé, puis **Installer**.
4. Si Android ou Google Play Protect affiche un avertissement, **ne cliquez pas tout de suite** : notez le texte exact, faites une capture d'écran, puis suivez la consigne de la séance (g).

---

### R.3 Séance Android, jour J (version 2) (environ 1 h 30, plus des attentes)
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

### R.4 Séance Android, jour J+1 (version 2) (environ 1 h, au moins 24 h après la dernière connexion, étape 20 de la séance 1)

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

