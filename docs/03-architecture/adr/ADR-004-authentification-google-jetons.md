# ADR-004 — Authentification Google et gestion des jetons

| Statut | Date | Auteur | Références |
|---|---|---|---|
| Proposé (mis à jour le 2026-10-21 pour RG-043) | 2026-10-20 | Starck | RG-019, RG-035, ENF-05, ENF-06, Q-DEM001-22, DAT §4.1 |

## Contexte
La connexion Google est obligatoire. L'application n'a pas de serveur (ADR-002), donc pas de lieu sûr pour un secret client ni pour un jeton de rafraîchissement côté éditeur. Le smartphone doit synchroniser sans intervention de l'utilisateur, et à terme en arrière-plan.

## Options étudiées
1. **Flux avec code d'autorisation et serveur d'échange** : jeton de rafraîchissement côté serveur. Rejeté par ADR-002.
2. **Jeton de rafraîchissement stocké par l'application** (client « bureau » avec PKCE) : il n'y a pas de stockage sûr dans un navigateur ; ce n'est acceptable que dans une application native disposant d'un trousseau.
3. **Mécanismes Google propres à chaque plateforme**, l'application ne conservant que des jetons d'accès éphémères :
   - Android : Credential Manager et AuthorizationClient (Google Play services) ;
   - iOS : SDK GoogleSignIn, avec le trousseau ;
   - web : Google Identity Services, modèle « jeton ».

## Décision
Option 3.
- Le code de l'application ne manipule **aucun jeton de rafraîchissement ni aucun secret**.
- Les jetons d'accès sont conservés **en mémoire uniquement**, jamais dans `localStorage`, IndexedDB ou les journaux.
- **Autorisation incrémentale** : chaque scope est demandé au moment où la fonctionnalité qui l'utilise est livrée et utilisée (ADR-005).
- Le compte est identifié par la claim `sub`. La base locale est **cloisonnée par compte** : un autre compte ne voit jamais les données du précédent. Ces données sont conservées à part (DEC-016).
- **Perte d'accès** (`401` persistant, révocation) : l'application passe à l'état « accès perdu » et reste utilisable comme hors ligne (recommandation Q-22.2 c). Elle ne supprime jamais d'événement Google (RG-035).
- **Déconnexion volontaire (RG-043, mise à jour du 2026-10-21)** : les données locales sont **conservées**, y compris les modifications non déposées. Seule la session est effacée (jeton, compte actif, état du Credential Manager). L'effacement des données de l'appareil se fait seulement par l'action distincte « Supprimer les données de cet appareil » (DEC-015).
- Les clients OAuth sont restreints : nom de paquet et empreinte SHA-1 sur Android, origines autorisées sur le web.

## Conséquences
- \+ Aucune donnée d'authentification durable n'est sous notre responsabilité, ce qui réduit fortement la surface de risque.
- \+ Sur le smartphone, le renouvellement est silencieux. En arrière-plan, il reste à confirmer par une mise au point technique (risque R2).
- − Sur PC (PWA), le jeton dure 1 h. Le renouvellement est silencieux si la session Google du navigateur est active, et demande un clic sinon. Les données restent utilisables localement entre-temps. Évolution possible : Tauri (ADR-001, option 6) ou une fonction d'échange de jeton (A4).
- − Un module Capacitor d'authentification native est nécessaire. Son choix et sa maintenance relèvent d'Anthony, en conformité avec le présent ADR.
