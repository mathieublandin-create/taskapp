# ADR-001 — Plateforme : base de code TypeScript unique, PWA (PC) et Capacitor (smartphone)

| Statut | Date | Auteur | Références |
|---|---|---|---|
| Proposé | 2026-10-20 | Starck | RG-017, RG-021, ENF-01, ENF-04, Q-DEM001-38, DAT §3.1 |

## Contexte
L'application doit fonctionner sur smartphone, usage prioritaire et hors ligne, et sur PC dès la première version. Elle a un seul utilisateur. Sur le smartphone, elle doit fonctionner hors ligne en consultation et en saisie, et pouvoir émettre des notifications locales en secours de Google Calendar (Q-38 b), ce qui nécessite des modules natifs. Les tests métiers sont écrits en Gherkin français et exécutés avec Cucumber. Le système du smartphone (Android ou iOS) n'est pas encore connu (arbitrage A1).

## Options étudiées
1. **PWA seule** pour les deux appareils. Avantages : coût nul, aucun store. Limites, surtout sur iOS :
   - pas de notification locale programmée ;
   - stockage pouvant être purgé ;
   - connexion Google par fenêtre surgissante fragile en mode installé ;
   - pas de tâche d'arrière-plan fiable ;
   - jeton d'accès d'une heure sans renouvellement silencieux.
2. **Code web unique, distribué en PWA (PC) et en application Capacitor (smartphone)**. Avantages :
   - un seul code React et TypeScript ;
   - modules natifs sur le smartphone : connexion Google native, SQLite, notifications locales, arrière-plan.
3. **Flutter**. Une base de code pour toutes les cibles, mais Dart, une cible web moins mûre et un outillage Cucumber en français limité.
4. **React Native et Expo** (react-native-web pour le PC). Crédible, mais le rendu web est secondaire et l'option exige un double paradigme d'interface.
5. **Natif pur, plus un site web séparé** : deux ou trois bases de code, disproportionné.
6. **Application de bureau Tauri ou Electron** pour le PC : jeton de longue durée conservé dans le trousseau du système, mais un livrable de plus.

## Décision
Option 2 :
- un seul code TypeScript, React et Ionic ;
- construit avec Vite ;
- distribué en **PWA installable** sur le PC (Chrome ou Edge) et en **application Capacitor** sur le smartphone (Android ; iOS si l'arbitrage A1 le retient).

L'option 6 reste une évolution possible si l'expérience de connexion de la PWA sur PC se révèle insuffisante.

## Conséquences
- \+ Un seul code métier et un seul code d'interface ; des tests communs.
- \+ Sur le smartphone : fonctionnement hors ligne durable (SQLite), notifications locales, arrière-plan Android.
- − Une application mobile à construire, à signer et à distribuer : pour Android, installation directe de l'APK (DEC-021, qui remplace DEC-005 ; mise en œuvre dans **ADR-012**, 2026-10-21) ; A1 pour iOS (coût annuel Apple ; pas d'iPhone en v1, DEC-001).
- − Deux adaptateurs de stockage local, IndexedDB et SQLite, derrière un même port (ADR-010).
- − Sur PC, renouvellement du jeton non silencieux après 1 h sans session Google active (ADR-004).
