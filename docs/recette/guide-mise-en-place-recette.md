# Mettre en ligne la version de recette de Done Juan : guide pas à pas

Ce guide est écrit pour quelqu'un qui n'est pas développeur. Il suffit de cliquer et de copier-coller. **Aucun mot de passe, aucune clé secrète n'est demandé.**

- **Durée estimée** : 15 à 20 minutes, plus 5 à 10 minutes d'attente à la première publication.
- **Ce dont vous avez besoin** : votre compte GitHub (propriétaire de l'organisation `donejuan-recette`), l'accès à la console Google Cloud du projet de développement, le compte Google de recette.
- **Résultat** : l'application « Done Juan (recette) » disponible à l'adresse `https://donejuan-recette.github.io/`, sur ordinateur et sur Android.

## Partie A. Sur GitHub

### Étape 1. Créer le dépôt du site de recette

1. Ouvrez `https://github.com/organizations/donejuan-recette/repositories/new` (ou : page de l'organisation `donejuan-recette`, bouton vert **New repository**).
2. Dans **Repository name**, écrivez exactement : `donejuan-recette.github.io`
3. Choisissez **Public**.
4. Cochez **Add a README file** (le dépôt ne doit pas être vide).
5. Cliquez sur **Create repository**.

### Étape 2. Ajouter le fichier de publication

1. Dans le dépôt de l'application (`https://github.com/mathieublandin-create/taskapp`), ouvrez le fichier `docs/recette/publier-recette.yml` (sur la branche `lot/LOT-001`). Cliquez sur le bouton **Copy raw file** (deux petits carrés, en haut à droite du fichier) : tout le contenu est copié.
2. Retournez dans le dépôt `donejuan-recette.github.io`. Cliquez sur **Add file** puis **Create new file**.
3. Dans la case du nom, tapez exactement : `.github/workflows/publier-recette.yml` (les `/` créent les dossiers tout seuls).
4. Cliquez dans la grande zone de texte et collez (Ctrl+V).
5. Cliquez sur **Commit changes...**, puis sur **Commit changes** dans la fenêtre qui s'ouvre.

### Étape 3. Régler la publication (Pages)

1. Dans le dépôt `donejuan-recette.github.io`, cliquez sur **Settings** (onglet tout à droite).
2. Dans le menu de gauche, cliquez sur **Pages**.
3. Sous **Build and deployment**, dans **Source**, choisissez **GitHub Actions**. Rien d'autre à faire sur cette page (il n'y a pas de bouton « Save » : le choix est enregistré tout seul).

### Étape 4. Donner l'identifiant de connexion Google (non secret)

1. Toujours dans **Settings**, menu de gauche : **Secrets and variables** puis **Actions**.
2. Cliquez sur l'onglet **Variables** (et **pas** « Secrets »).
3. Cliquez sur **New repository variable**.
4. **Name** : `VITE_GOOGLE_WEB_CLIENT_ID`
5. **Value** : `275071465945-44uks3etb61qm9lqs9bc6upvlet616v7.apps.googleusercontent.com`
6. Cliquez sur **Add variable**.

Cet identifiant n'est pas un secret : il est visible dans toute application qui utilise la connexion Google.

### Étape 5. Lancer la publication

1. Cliquez sur l'onglet **Actions** du dépôt `donejuan-recette.github.io`.
2. Si GitHub affiche un message demandant d'activer les workflows, cliquez sur **I understand my workflows, go ahead and enable them**.
3. Dans la colonne de gauche, cliquez sur **publier-recette**.
4. Cliquez sur **Run workflow** (bouton à droite). Laissez la case `lot/LOT-001` telle quelle, puis cliquez sur le bouton vert **Run workflow**.
5. Actualisez la page : une ligne jaune (en cours) apparaît. Attendez 5 à 10 minutes qu'elle devienne **verte** (coche). Cliquez dessus : le résumé indique le commit publié ; notez-le pour la grille de retours.

## Partie B. Sur la console Google Cloud

Faites cette partie avant d'essayer de vous connecter.

> Noms de menus vérifiés le 2026-11-12 sur la documentation de Google (Starck, E13b). La console range désormais l'écran de consentement et les clients sous **Google Auth Platform** (« Plateforme Google Auth » selon la langue), avec les pages **Branding** (image de marque), **Audience**, **Clients** et **Accès aux données** (« Data Access ») ; les anciens chemins par **API et services** mènent aux mêmes pages. Certains libellés peuvent rester en anglais.

### Étape 6. Autoriser l'adresse de recette

Google refuse une adresse dont le domaine n'est pas autorisé : faites donc les points 2 et 3 **avant** les points 4 à 8.

1. Ouvrez `https://console.cloud.google.com/` et choisissez le **projet de développement** (celui du client « Done Juan POC Web »).
2. Menu **Google Auth Platform** puis **Branding** (image de marque). Descendez jusqu'à la rubrique **Domaines autorisés**. Le domaine `mathieublandin-create.github.io` doit déjà y figurer : ne le retirez pas.
3. Cliquez sur **Ajouter un domaine**, saisissez `donejuan-recette.github.io` (sans `https://`), puis cliquez sur **Enregistrer**. **N'ajoutez pas de logo** : un logo déclenche une vérification par Google. Si Google annonce qu'une vérification est nécessaire : ne soumettez rien, notez le message et prévenez Jarvis.
4. Menu **Google Auth Platform** puis **Clients** (ou : **API et services** puis **Identifiants**).
5. Dans la liste des clients (**ID clients OAuth 2.0** dans l'ancien chemin), cliquez sur **Done Juan POC Web**.
6. Dans **Origines JavaScript autorisées**, cliquez sur **Ajouter un URI** et saisissez : `https://donejuan-recette.github.io` (**sans** barre finale).
7. Dans **URI de redirection autorisés**, cliquez sur **Ajouter un URI** et saisissez : `https://donejuan-recette.github.io/` (**avec** la barre finale).
8. Cliquez sur **Enregistrer**. Google peut mettre quelques minutes (parfois davantage) à prendre en compte le changement.

Ne retirez pas les adresses déjà présentes.

### Étape 7. Écran de consentement : « En production »

Le projet doit être **« En production »** (décision DEC-008, confirmée par le commanditaire). Sans cela, Google affiche un avertissement « application non validée » et les autorisations expirent au bout de 7 jours.

1. Menu **Google Auth Platform** puis **Audience** (l'ancien menu **API et services** puis **Écran de consentement OAuth** mène à la même page).
2. Lisez **État de publication**. Attendu : **En production**. Dans ce cas, il n'y a rien à changer.
3. S'il indique **Test** : cliquez sur **Publier l'application**, puis confirmez. Si le bouton est grisé, vérifiez la page **Branding** (page d'accueil `https://mathieublandin-create.github.io/taskapp/accueil.html`, règles de confidentialité `https://mathieublandin-create.github.io/taskapp/confidentialite.html`, adresse d'assistance renseignée, domaine autorisé de l'étape 6), puis revenez ici.
4. **Ne cliquez jamais sur « Revenir au mode test ».**
5. Ne demandez **pas** la vérification de la marque : elle n'est pas nécessaire (elle sert seulement à afficher un nom et un logo). Google affichera donc une adresse en `github.io` à la place du nom « Done Juan » : c'est normal.
6. Aucune liste d'utilisateurs test n'est nécessaire en production. Si le compte de recette y figure déjà, cela ne gêne pas.
7. Menu **Google Auth Platform** puis **Accès aux données** (« Data Access ») : vérifiez que les trois autorisations suivantes sont déclarées, toutes dans le tableau des niveaux d'accès **non sensibles** : `openid`, `email` (la console peut l'afficher `.../auth/userinfo.email`) et `.../auth/drive.file`. Il n'en faut pas d'autres, et aucune ne doit figurer parmi les niveaux d'accès sensibles ou restreints.

### Étape 8. Activer l'API Drive

1. Menu **API et services** puis **API et services activés**.
2. Si **Google Drive API** n'est pas dans la liste : cliquez sur **Activer des API et des services**, cherchez « Google Drive API », ouvrez-la, cliquez sur **Activer**.

## Partie C. Vérifier que tout fonctionne

### Étape 9. Sur ordinateur

1. Ouvrez `https://donejuan-recette.github.io/` dans Chrome ou Edge.
2. Vous devez voir l'application avec le nom **« Done Juan (recette) »** et un écran de connexion Google.
3. Connectez-vous avec le **compte Google de recette** (et pas votre compte habituel). Google ne doit afficher **aucun** avertissement « Google n'a pas validé cette application » (c'est ce que vérifie le scénario S13b). Le nom affiché est une adresse en `github.io` au lieu de « Done Juan » : c'est normal. Acceptez l'accès aux fichiers Drive créés par l'application. **Si un avertissement apparaît** : ne continuez pas. Faites une capture d'écran (sans votre adresse e-mail), notez-la dans la grille de retours (S13b en échec), puis revenez à l'étape 7 point 2 : le projet n'est pas en production.
4. Vous devez arriver dans l'application, connecté. Un dossier est créé dans le Drive du compte de recette.

### Étape 10. Installer sur Android

1. Sur le téléphone, ouvrez Chrome et saisissez `https://donejuan-recette.github.io/`.
2. Connectez-vous avec le compte de recette : mêmes écrans, **aucun** avertissement « application non validée » ; s'il apparaît, ne continuez pas et revenez à l'étape 7.
3. Menu de Chrome (trois points en haut à droite) puis **Installer l'application** (ou **Ajouter à l'écran d'accueil**). Confirmez.
4. Une icône **Done Juan (recette)** apparaît sur l'écran d'accueil. Elle est distincte de celle de la production et les deux peuvent coexister.

Pour une nouvelle version : refaites l'étape 5 (**Run workflow**) puis rouvrez l'application. Si elle propose une mise à jour, acceptez.

## Ce qui peut mal tourner, et que faire

| Ce que vous voyez | Cause probable | Que faire |
|---|---|---|
| Le workflow est rouge, message « Identifiant OAuth absent », « fictif » ou « invalide » | La variable de l'étape 4 manque ou contient une faute | Reprenez l'étape 4 (onglet **Variables**, nom exact, valeur copiée en entier, sans espace), puis relancez l'étape 5 |
| Le workflow est rouge à l'étape « Tests » ou « Construction » | Un problème dans le code de la branche choisie | Ne rien modifier : envoyer le lien de la page rouge à Jarvis |
| Le workflow est rouge à la publication, message sur « Pages » ou « environment » | La source Pages n'est pas « GitHub Actions » | Reprenez l'étape 3, puis relancez |
| Pas de bouton **Run workflow** | Le fichier n'est pas au bon endroit ou mal nommé | Vérifiez le chemin exact `.github/workflows/publier-recette.yml` (étape 2) |
| Page « 404 » à l'adresse de recette | Première publication pas finie, ou source Pages non réglée | Attendez la coche verte (étape 5) ; contrôlez l'étape 3 |
| Google affiche « Erreur 400 : redirect_uri_mismatch » ou « origin_mismatch » | Adresse mal saisie chez Google | Reprenez l'étape 6 : barre finale **seulement** sur l'URI de redirection ; attendez quelques minutes |
| Google affiche « Google n'a pas validé cette application », « Accès bloqué » ou « Erreur 403 : access_denied » | Le projet est encore (ou repassé) en mode Test, ou une autorisation sensible a été ajoutée | Reprenez l'étape 7 (points 2, 3 et 7) ; ne continuez pas avant que l'état soit **En production** |
| La console refuse l'adresse de recette (domaine non autorisé) | Le domaine n'est pas dans les domaines autorisés | Faites les points 2 et 3 de l'étape 6, puis reprenez les points suivants |
| Connexion réussie mais pas de dossier Drive, ou erreur de synchronisation | API Drive non activée, ou autorisation `drive.file` refusée | Reprenez l'étape 8 ; déconnectez-vous puis reconnectez-vous en acceptant les autorisations |
| Un ancien écran reste affiché après une nouvelle publication | Ancienne version en mémoire | Fermez complètement l'application et rouvrez-la ; au besoin, rechargez la page |

En cas de blocage, ne cherchez pas à contourner : notez le numéro de l'étape et l'écran affiché (capture d'écran), et transmettez-les à Jarvis. **Ne communiquez jamais de mot de passe ni de clé** : personne n'en a besoin.
