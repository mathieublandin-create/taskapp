# Résultats du test technique v3 (volet web)

> Tenu par Jarvis à partir des retours du commanditaire. Aucune adresse e-mail ni capture d'écran n'est versée ici, car le dépôt est public : les captures restent chez le commanditaire.

## R11 : consentement Google

### PC (Chrome), 2026-10-25, compte Gmail de test
Trois écrans observés :
1. **Choix du compte.** Titre : « Accéder à l'application mathieublandin-create.github.io ». Un lien « Règles de confidentialité » est présent.
2. **Reconnexion.** Titre : « Vous vous reconnectez à mathieublandin-create.github.io ». Boutons « Annuler » et « Continuer ».
3. **Consentement.** Titre : « mathieublandin-create.github.io veut accéder à votre compte Google ». Mentions :
   - « a déjà certains droits d'accès : 3 services déjà accessibles » ;
   - « Vérifiez que mathieublandin-create.github.io est digne de confiance » ;
   - lien « Règles de confidentialité ».

Constats :
- **Aucun écran « Google n'a pas validé cette application ».**
- **Nom affiché : le domaine** `mathieublandin-create.github.io`, et non « Done Juan ». C'est attendu sans vérification de la marque, et ce n'est pas un critère de R11.
- Le lien vers les règles de confidentialité figure sur les trois écrans, donc l'image de marque est prise en compte.
- Les accès n'ont pas été listés un par un, puisque le compte les avait déjà accordés (« 3 services »).

À confirmer :
- l'état de publication au moment de l'essai : « En production » ou « Test » ;
- si l'on veut voir la liste des accès, refaire l'essai après « Supprimer l'accès » (guide, f bis.4, point 1) ;
- le même essai sur Chrome Android.

Verdict provisoire R11 (PC) : **favorable**, sous réserve de l'état « En production ».

### Téléphone Android (Chrome), 2026-10-25 à 22 h 24, même compte de test
Connexion interactive (« Se connecter »). Google s'ouvre dans une fenêtre « Connexion : comptes Google, accounts.google.com », qui se ferme par une croix. Les écrans sont les mêmes que sur le PC :
- choix du compte, avec le titre « Accéder à l'application mathieublandin-create.github.io » ;
- reconnexion, avec les boutons « Annuler » et « Continuer » ;
- consentement, qui indique « déjà certains droits d'accès (3 services) » et affiche le lien « Règles de confidentialité ».

Constats :
- **Aucun écran « Google n'a pas validé cette application ».**
- Le nom affiché est le domaine, comme sur le PC.

Verdict provisoire R11 (Android) : **favorable**, avec la même réserve sur l'état « En production ».

Prochaines mesures, décisives pour DEC-034 :
- **M-RED** : ouvrir l'icône installée sans rien toucher. On attend « JetonObtenu » sans choix de compte, sans appui et sans saisie chez Google.
- **M-PERSIST**.
- **M-DUR** : arrêt forcé de l'application, puis redémarrage du téléphone.

## Séance g, seconde partie (2026-10-25 et 26)
- **Étape 14, M-RED : réussie.** Après plus d'une heure, l'icône a été ouverte sans rien toucher, et l'accès est revenu **sans aucune action** du commanditaire. **La condition de DEC-034 est remplie pour la connexion.** M-PERSIST et M-DUR (étapes 6 à 9) restent à transmettre.
- **Étape 16, renouvellement par geste en cours d'usage (« Synchroniser », fenêtre GIS) : écart.** Google demande de choisir le compte, puis de valider. Cela fait plus d'un geste, alors que V-DEC034-5 promet « au plus un geste, aucune saisie ».
  - Cause probable : le PoC n'envoie pas `login_hint` à `initTokenClient`, alors que le téléphone porte plusieurs comptes Google.
  - Correctif demandé à Benjamin : transmettre `login_hint` (l'adresse en cache) et revenir sur la redirection `prompt=none` si nécessaire.
  - Étape 16 à refaire après la remise en ligne.

## Analyse du journal du téléphone (export CSV du 2026-10-27)
Le journal couvre les 25, 26 et 27 octobre. Toutes les mesures sont faites dans la PWA installée (`standalone`, `web-android`), à une exception près, signalée ci-dessous. L'adresse du compte n'est pas reproduite ici.

| Mesure | Résultat | Verdict |
|---|---|---|
| **M-RED** (redirection automatique à l'ouverture) | 12 redirections `prompt=none` avec `login_hint`, toutes réussies (« JetonObtenu »). Aller-retour de 414 à 1 840 ms ; 4 804 ms une fois, juste après le redémarrage. Les ouvertures du 26 à 20 h 21 et du 27 à 14 h 21, plus d'une heure après la précédente, renouvellent l'accès **sans aucune action**. Pas de boucle : chaque retour est suivi de « Non lancé : la page revient de Google ». | **Favorable** |
| **M-PERSIST** | `persisted()` = faux avant la demande ; `persist()` donne « Stockage persistant », accordé sans question. | **Favorable** |
| **M-DUR** (marqueur IndexedDB en durabilité stricte) | Marqueur posé à 22 h 30, relu présent après l'arrêt forcé (22 h 32). Marqueurs posés à 22 h 33 et 22 h 35, relus présents après le redémarrage. Les identifiants sont identiques à chaque fois. | **Favorable** |
| **Hors ligne** (étape 10) | L'application s'ouvre en mode avion avec l'identité en cache ; « Non lancé : réseau indisponible », comme attendu. | **Favorable** |
| **Étape 16** (« Synchroniser » en cours d'usage, GIS) | Jeton obtenu, mais le commanditaire a dû choisir le compte puis valider. **Les entrées ne portent pas la mention `login_hint`** : elles viennent donc de l'ancienne version, et le correctif `af859e3` n'était pas encore chargé sur le téléphone. | **À refaire** après la remise en ligne et la mise à jour de la PWA |

Une mesure a été faite dans un onglet de Chrome (`navigateur`), le 27 à 14 h 22. Elle réussit aussi, mais elle ne compte pas pour la condition de DEC-034.

**Conclusion : la condition de DEC-034 (M-RED et M-PERSIST) est remplie.** M-DUR est également favorable. ADR-013 peut passer au statut Accepté lors de la clôture du lot, et l'annexe « repli Android » n'est pas déclenchée. Il reste deux points :
- refaire l'étape 16 avec le correctif ;
- confirmer l'état « En production » pour R11.
