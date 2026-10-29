# ADR-014 — CSP : `'unsafe-inline'` limité à `style-src` pour les styles injectés par Ionic

| Statut | Date | Auteur | Références |
|---|---|---|---|
| Proposé (passage à « Accepté » en E17 de LOT-001) | 2026-10-29 | Starck | Q-ANT-E13-R2-1 (`docs/ceremonies/revue-code-LOT-001-rang2.md` §8), DT-008 (`docs/04-specification-technique/dette-technique.md`), DAT v0.11.6 §7.1, ADR-013 (PWA unique sur GitHub Pages), `conventions.md` §9.3 |

## Historique
| Date | Évolution |
|---|---|
| 2026-10-29 | Création, en réponse à Q-ANT-E13-R2-1 et après une mesure en navigateur réel. |

## Contexte

`index.html` déclare la CSP par une balise `meta`. GitHub Pages ne permet ni en-tête HTTP ni contenu dynamique (ADR-013). La directive actuelle est `style-src 'self'`, conformément à DAT §7.1 (« CSP stricte, sans `unsafe-inline` ni `unsafe-eval` »).

Depuis le rang 2, l'interface repose sur Ionic 9 (`@ionic/react` 9.0.9, composants Stencil). Stencil applique les styles de deux façons :
- **composants à Shadow DOM** (`ion-button`, `ion-toast`, `ion-modal`, etc.) : feuilles construites (`new CSSStyleSheet()` + `adoptedStyleSheets`). Elles **ne sont pas soumises** à `style-src` ;
- **composants « scoped »** (`ion-buttons`, `ion-header`, `ion-input`, `ion-textarea`, `ion-action-sheet`, etc.) et feuille globale (`html.plt-mobile ion-app…`) : un élément `<style>` est inséré dans `<head>` à l'exécution. Ces éléments **sont soumis** à `style-src`. Stencil leur pose un attribut `nonce` s'il trouve une balise `<meta name="csp-nonce" content="…">`.

Les styles posés par les composants via le CSSOM (`element.style.zIndex`, variables `--offset-top`, etc.) et l'attribut `style` de React (CSSOM lui aussi) ne sont pas soumis à la CSP.

### Mesure (2026-10-29, `origin/lot/LOT-001`, build de production servi en statique, Chromium par Playwright)

Le relevé repose sur l'écouteur `securitypolicyviolation`. La page de connexion a été chargée, puis les composants Ionic utilisés par `src/` ont été instanciés : boutons, en-tête, barre d'outils, champs, puce, note, contenu, FAB, toast, feuille `ion-modal` à points d'arrêt, `ion-action-sheet`.

| CSP | Violations `style-src-elem` | Rendu |
|---|---|---|
| Actuelle (`style-src 'self'`) | **14** (dont 2 dès l'écran de connexion), toutes émises par le chargeur de styles de Stencil | **Dégradé** : `ion-buttons` passe de `display: flex` à `display: block` ; les styles « scoped » d'`ion-input`, `ion-textarea`, `ion-header` et `ion-action-sheet` ne s'appliquent pas |
| `style-src 'self' 'nonce-…'` + `<meta name="csp-nonce">` | 0 | Conforme |
| `style-src 'self' 'unsafe-inline'` | 0 | Conforme |

Constat annexe, hors styles : **1 violation `script-src` (`eval`)**, quelle que soit la variante. Elle vient de la sonde de Zod 4 (`Function('')` dans un `try/catch`), qui teste si la compilation à la volée est possible. Zod retombe ensuite sur son mode interprété, donc l'effet est nul sur le fonctionnement. La violation pollue toutefois la console et masquerait une vraie violation.

## Options étudiées

| Option | Principe | Avantages | Inconvénients |
|---|---|---|---|
| (a) Nonce | `'nonce-X'` dans `style-src` et `<meta name="csp-nonce" content="X">` (lu nativement par Stencil) | Mécanisme prévu par Stencil ; bloque les attributs `style` et les `<style>` sans nonce présents dans un balisage injecté | Sur un site statique, le nonce est **fixe par déploiement et publié dans `index.html`** (et dans le cache du service worker). La spécification CSP exige un nonce imprévisible **par réponse** : un attaquant capable d'injecter du HTML lit la valeur et l'ajoute à son `<style>`. La garantie est donc illusoire. Les analyseurs de sécurité signalent le nonce réutilisé. Il faut aussi un greffon Vite pour le tirer au build. Les `<style>` d'un script tiers sans nonce restent bloqués (GIS) |
| (b) Hachages | `'sha256-…'` de chaque feuille injectée | Le plus strict : seules les feuilles connues passent | Une feuille par composant et par mode (`md` / `ios`), qui change à chaque montée de version d'Ionic. La liste doit être produite au build et tenue à jour à chaque nouveau composant. Un oubli ne se voit qu'en navigateur réel (jsdom n'applique pas la CSP) et dégrade silencieusement l'écran sur l'appareil. Le coût de maintenance est disproportionné |
| (c) `'unsafe-inline'` limité à `style-src` | `style-src 'self' 'unsafe-inline'`, `script-src` inchangé | Une ligne, aucune maintenance, robuste aux montées de version d'Ionic et aux composants ajoutés ; usage courant et documenté avec Ionic et Stencil | Autorise les `<style>` et attributs `style` d'un éventuel balisage injecté (injection CSS : habillage trompeur, exfiltration par sélecteurs d'attributs) |
| (d) Configuration d'Ionic | Supprimer l'injection | — | **Aucune option** d'Ionic ou de Stencil ne fournit les styles « scoped » en fichier CSS externe. Forcer le Shadow DOM partout n'est pas configurable. Ionic ne fournit pas ses styles de composants sous forme de feuilles importables |

## Décision

**Option (c) : `style-src 'self' 'unsafe-inline'`.** Toutes les autres directives restent inchangées. En particulier, `script-src` reste sans `'unsafe-inline'` ni `'unsafe-eval'`.

Justification :
1. L'injection CSS suppose une injection de HTML préalable. Ce vecteur est fermé en amont : React échappe tout contenu, `dangerouslySetInnerHTML` est interdit (DAT §7.1) et aucun contenu n'est chargé depuis un tiers. La défense contre l'injection de script, seul vecteur critique, reste entière.
2. L'exfiltration par CSS vise des secrets présents dans le DOM. Ici, le jeton d'accès vit en mémoire, jamais dans le DOM ni dans une URL persistée (DAT §4.1.7, §7.1).
3. Le nonce (a) n'apporte pas de garantie réelle sur un hébergement statique. Il ne gagne sur (c) que contre une injection non ciblée, au prix d'un greffon de build et d'une conformité trompeuse.
4. Les hachages (b) ont un coût de maintenance et un risque de dégradation silencieuse disproportionnés pour une application personnelle (principe de simplicité).

**Mesures associées** (mise en œuvre par un développeur, voir « Conséquences ») :
- **M1** : `index.html` : `style-src 'self' 'unsafe-inline'`, avec un commentaire renvoyant à ADR-014 ;
- **M2** : neutraliser la sonde de Zod par `z.config({ jitless: true })`, appelée une fois au démarrage avant toute validation. La console ne doit plus montrer aucune violation CSP ;
- **M3** : un test de fumée en navigateur réel (Playwright, ADR-009) sur le build de production servi en statique. Il échoue sur toute `securitypolicyviolation` à l'écran de connexion et sur les composants Ionic utilisés (même procédé que la mesure ci-dessus). Il protège contre une régression de la CSP (nouvelle origine, nouveau script) que jsdom ne voit pas ;
- **M4** : maintien des interdits de `conventions.md` (règles React) : aucun `dangerouslySetInnerHTML`, aucune insertion de HTML brut (`innerHTML`) hors bibliothèques ; option `innerHTMLTemplatesEnabled` d'Ionic laissée à `false` (valeur par défaut).

## Conséquences

- **Positives** : rendu Ionic conforme sur tous les appareils ; console sans violation ; aucune maintenance liée aux versions d'Ionic.
- **Négatives** : la CSP n'est plus « stricte » au sens du DAT v0.11.5 pour les styles seulement. Le DAT §7.1 et `conventions.md` §9.3 sont amendés en conséquence.
- **Réversibilité** : si l'application passe un jour derrière un hébergement capable de poser des en-têtes dynamiques (nonce par réponse), l'option (a) devient pertinente. Il suffira alors d'ajouter `<meta name="csp-nonce">` et de retirer `'unsafe-inline'`, sans toucher au code des composants.
- **Travail à faire** :
  - M1 et M2 : correction de DT-008, au rang 3 au plus tard, et de préférence en correctif avant E14 du rang 2, parce que les écrans d'US-001 recettés en E14 sont aujourd'hui dégradés ;
  - M3 : Friday, outillage de tests de bout en bout, au plus tard au rang 3 ;
  - mise à jour de `conventions.md` §9.3 et de DT-008 : Anthony.
- **Vérification en E14** : console sans violation sur un vrai téléphone Android (Chrome, PWA installée) et sur PC, flux de connexion GIS compris (vérification des `<style>` ou `<link>` éventuels du script `accounts.google.com/gsi/client`, non mesurables hors réseau).
