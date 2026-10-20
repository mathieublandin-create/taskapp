# ADR-002 — Architecture *local-first* sans serveur applicatif

| Statut | Date | Auteur | Références |
|---|---|---|---|
| Proposé | 2026-10-20 | Starck | RG-020, RG-021, RG-035, RG-037, ENF-02, ENF-04, ENF-06, CdC §4.3, arbitrage A4, DAT §2.1 et §5 |

## Contexte
Les données doivent être conservées dans l'espace personnel de l'utilisateur. Leur conservation ailleurs est exclue (CdC §4.3). Le smartphone doit fonctionner hors ligne en consultation et en saisie. Les rappels, le report automatique et la détection des créneaux déplacés semblent pourtant appeler des traitements qui s'exécutent même quand aucun appareil n'est ouvert.

## Options étudiées
1. **Serveur applicatif avec base de données**. Contraire à l'exclusion du CdC §4.3 ; coût et charge d'exploitation.
2. **Fonction sans serveur minimale**, sans base de données métier, qui détient un jeton de rafraîchissement Google pour :
   - recevoir les notifications push de Calendar ;
   - appliquer le report à minuit ;
   - renouveler le jeton du PC.

   Elle conserve un secret personnel chez l'éditeur. Elle coûte de 0 à 5 € par mois et ajoute de l'exploitation et une responsabilité de sécurité.
3. **Local-first sans serveur** : chaque appareil porte l'application complète et une base locale. Google Drive sert de support d'échange et de copie durable ; Google Calendar sert de canal de notification autonome.

## Décision
Option 3. Le projet ne développe ni n'exploite aucun serveur. Son seul hébergement est celui des fichiers statiques de la PWA. Les traitements « planifiés » sont soit délégués à Google Calendar, soit recalculés de façon idempotente par le premier appareil actif (ADR-007).

## Conséquences
- \+ Conforme à RG-020 et au CdC §4.3 : aucune donnée personnelle, ni aucun jeton, n'est conservé chez l'éditeur.
- \+ Hors ligne natif : l'interface lit et écrit toujours dans la base locale.
- \+ Coût d'exploitation quasi nul ; aucune surface d'attaque côté serveur.
- − Aucune action en temps réel quand aucun appareil n'est actif. Les créneaux déplacés sont détectés à la prochaine synchronisation (DAT §8, F2), et le report est appliqué à la première ouverture du jour (F5).
- − Pas de notifications push de Calendar (`events.watch`).
- − La logique de fusion et de réconciliation est portée par les clients : elle doit être déterministe et très testée (ADR-003, ADR-009).
- Réversibilité : on peut ajouter l'option 2 plus tard sans changer le format des données, si le commanditaire l'arbitre (A4).
