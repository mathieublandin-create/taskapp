# ADR-005 — Scopes Google minimaux et statut de publication OAuth

| Statut | Date | Auteur | Références |
|---|---|---|---|
| Proposé (à confirmer par les arbitrages A5 et A6) | 2026-10-20 | Starck | ENF-05, RG-019, RG-020, RG-034, Q-DEM001-22.1, DAT §4.1.1 et §4.1.3 |

## Contexte
ENF-05 demande un accès minimal au compte Google. Google classe ses scopes en trois catégories :
- **non sensibles** : vérification de base ;
- **sensibles** : vérification de l'application ; sinon, écran d'avertissement et plafond de 100 nouveaux utilisateurs sur la durée de vie du projet ;
- **restreints** : vérification et audit de sécurité payant.

En mode « Test », les autorisations expirent au bout de 7 jours.

## Options étudiées
**Stockage**
- `drive` : restreint. Rejeté.
- `drive.appdata` : non sensible ; dossier caché, invisible pour l'utilisateur.
- `drive.file` : non sensible ; accès limité aux fichiers créés par l'application ; dossier visible.

**Agenda**
- `calendar` : complet. Non nécessaire.
- `calendar.events` : sensible ; écriture et lecture des événements.
- `calendar.events.owned` : agendas possédés par l'utilisateur, ce qui suffit pour l'agenda principal. Sa classification reste à vérifier.

**Publication**
- mode « Test » ;
- production non vérifiée ;
- production vérifiée ;
- application « interne » (Workspace uniquement).

## Décision proposée
- **Lot 1** : `openid`, `email` et `drive.file`, tous non sensibles. Le projet est publié **en production dès le lot 1**, pour éviter l'expiration à 7 jours, sans logo afin d'éviter la vérification de la marque. L'utilisateur ne voit aucun écran d'avertissement.
- **Lot comportant l'agenda** : ajout, par autorisation incrémentale, de `calendar.events.owned` si sa classification et sa couverture sont confirmées, sinon de `calendar.events`.
- **Statut de publication pour l'agenda** : production **non vérifiée** (recommandation de l'arbitrage A5). Si l'écran d'avertissement est refusé par le commanditaire, il faut engager la vérification Google **pendant le lot précédent**. Elle demande un domaine, une page d'accueil, une politique de confidentialité et une vidéo, et prend de quelques jours à plusieurs semaines.
- **Dossier de données** : dossier visible via `drive.file` (recommandation de l'arbitrage A6). Repli : `drive.appdata` si la mise au point technique révèle un problème de visibilité des fichiers entre le client Android et le client web (risque R1).
- **Projets Google Cloud distincts** pour la production et pour le développement et la recette.

## Note du 2026-10-25 (DAT v0.11.2, sans changement de décision)
Constat du commanditaire : le bouton « Publier l'application » reste grisé tant que l'image de marque est incomplète. Publier en production, même avec des scopes non sensibles, exige une **page d'accueil**, une page de **règles de confidentialité** et un **domaine autorisé** ; cela ne déclenche pas la vérification de la marque en l'absence de logo, mais l'écran de Google affiche alors le domaine au lieu du nom. Ces pages sont servies avec la PWA sur GitHub Pages (`poc-specification.md` §16). Si Google refuse le domaine `mathieublandin-create.github.io` : question Q-R11-1 (protocole v3.1 §3.1 ter). Le mode « Test » reste réservé au test technique, le temps de publier.

## Conséquences
- \+ Le lot 1 n'est soumis à aucune vérification et à aucun délai Google.
- \+ L'accès est limité aux fichiers de l'application ; les autres fichiers Drive de l'utilisateur restent hors de portée.
- − À partir de l'agenda, un écran « application non validée » s'affiche à chaque consentement, sauf vérification.
- − L'application dépend des règles de Google, qui peuvent évoluer. Une veille est nécessaire à chaque lot (risque R8).
