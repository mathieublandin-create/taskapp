# Validation des règles révisées après la décision DEC-034 (application web unique)

| Élément | Valeur |
|---|---|
| Objet | Reformulation des règles déjà validées que touche la décision **DEC-034** du 2026-10-22 : une seule application, l'application web, sur le PC **et** sur le téléphone, à la place de l'application Android installée par fichier (APK) |
| Préparé par | Pepper (business analyste), le 2026-10-22, pour Jarvis |
| Référentiel | Décision DEC-034 ([`suivi-projet.md`](../suivi-projet.md)) · étude de Starck [ETU-002](../03-architecture/etude-pwa-unique.md) (§3, §5, §7, §10, §11) · [cahier des charges v0.13](../01-specification-fonctionnelle/cahier-des-charges.md) (§7.1) · US-017, US-018, US-022, US-031 · 279 scénarios de test, dont 10 marqués `@DEC-034` |
| Lecture | Environ 8 minutes |
| État | **Validé par le commanditaire le 2026-10-22 (DEC-036, « Tout reco »)** : voir la section « Résultat » (§8). Le reste du document est conservé tel que présenté. |

---

## 1. Pourquoi ce document

Le 2026-10-22, vous avez retenu les recommandations de Starck sur l'application web unique (DEC-034, verbatim « Pour la question PWA, prendre les recos de Stark ») :
- **Q-PWA-1** : l'application web remplace l'application Android sur tous les appareils, **sous condition** (voir ci-dessous) ;
- **Q-PWA-2** : vous acceptez, sur le téléphone comme sur le PC, un bref passage par Google, ou un appui, quand l'application n'a pas servi depuis plus d'une heure ;
- **Q-PWA-3** : vous renoncez aux notifications de secours et à la mise à jour en arrière-plan.

Plusieurs règles que vous aviez **déjà validées** le 2026-10-21 (DEC-018) supposaient l'application Android. Une règle validée ne change qu'avec votre accord. Ce document vous présente, pour chacune, **l'avant**, **l'après** et une **recommandation**.

**La condition de DEC-034.** Tout ce qui suit ne s'applique que si le test technique sur votre téléphone confirme deux points : à l'ouverture, l'application obtient l'accès à votre compte Google **sans rien vous faire saisir** (au plus un bref passage par Google), et le téléphone **conserve durablement** les données de l'application. Si le test échoue, on garde l'application Android : ces propositions sont retirées et les règles actuelles restent en vigueur, sans nouvelle question.

**En attendant votre réponse**, les règles actuelles restent celles qui font foi. Rien n'est perdu de la conception déjà faite : les user stories métier (objectifs, tâches, sous-tâches, abandon) ne sont pas touchées.

---

## 2. Comment répondre

Pour chaque décision V-DEC034-1 à 7, choisissez « Oui » ou « Non ». L'option recommandée est marquée ★. Quand une décision comporte plusieurs points (a, b), vous pouvez n'en refuser qu'un.

**Réponse compacte possible :**
- « **Tout reco** » : vous suivez les 7 recommandations ★ ;
- « **Tout reco sauf V-DEC034-7** » : tout est suivi sauf V-DEC034-7, que Pepper vous représente avec une autre formulation.

**Après votre réponse.** Les textes validés remplacent les anciens dans le cahier des charges et les user stories, et les marques « proposée » disparaissent. US-017, US-018 et US-022 redeviennent « Validées » et poursuivent leur préparation. Pour une décision refusée, Pepper reprend le texte et vous le représente.

**Vocabulaire.**
- *Application web installée* : l'application ouverte dans Chrome, puis ajoutée à l'écran d'accueil du téléphone (« Installer l'application »). Elle s'ouvre ensuite comme une application ordinaire, avec son icône.
- *Accès Google à renouveler* : pour des raisons de sécurité, Google n'accorde l'accès à l'application que pour **une heure**. Au-delà, l'accès doit être renouvelé : c'est un bref passage par Google (1 à 2 secondes d'attente), ou un appui sur « Reprendre la synchronisation ». Vous restez connecté ; vos données restent affichées et vous pouvez continuer à travailler.
- *Synchronisation* : la mise à jour automatique de vos données entre vos deux appareils, par votre Google Drive.

---

## 3. Ce qui change en bref

| Sujet | Avant (règles validées) | Après (proposé) |
|---|---|---|
| Application sur le téléphone | Application Android, installée par fichier (APK) | La même application web que sur le PC, installée depuis Chrome |
| Installation et mises à jour | Fichier à télécharger et à installer à chaque version | Une adresse web ; mises à jour automatiques |
| Accès Google sur le téléphone | Renouvelé en silence, à tout moment | Comme sur le PC : au-delà d'une heure, bref passage par Google ou un appui |
| Retour du réseau sur le téléphone | Enregistrement toujours sans action | Sans action si l'accès est valide ; sinon après un appui au plus |
| iPhone | Exclu en v1 | Toujours hors de la v1, mais devenu possible sans développement |
| Notifications de secours | Question ouverte (Q-38, option b recommandée) | Abandonnées : Google Calendar reste le seul canal des rappels |
| Mise à jour en arrière-plan | Prévue pour un lot ultérieur | Abandonnée : la mise à jour se fait à l'ouverture et pendant l'usage |

---

## 4. Décisions à prendre

★ = option recommandée. Les identifiants entre parenthèses (RG, ENF, CA) servent à la traçabilité.

| N° | Sujet | Règles touchées | Recommandé |
|---|---|---|---|
| V-DEC034-1 | Appareils couverts en v1 | ENF-01 ; exclusion « iPhone » ; US-017 CA-1 | Oui |
| V-DEC034-2 | Installation et mises à jour sans APK | ENF-07 ; US-017 CA-12 ; remplace DEC-021 | Oui (a et b) |
| V-DEC034-3 | Accès Google à renouveler : l'exception du PC vaut aussi pour le téléphone | RG-017 ; US-017 CA-3 | Oui |
| V-DEC034-4 | Travail sans réseau : même exception sur les deux appareils | ENF-04 | Oui |
| V-DEC034-5 | Retour du réseau et accès expiré sur le téléphone | US-018 CA-4 et CA-8 ; US-022 CA-5 et CA-7 | Oui (a et b) |
| V-DEC034-6 | Notifications et mise à jour en arrière-plan | RG-014 ; Q-DEM001-38 ; exclusions | Oui (a et b) |
| V-DEC034-7 | Conditions du travail sans réseau sur le téléphone | ENF-04 (dernière phrase) ; US-018 cas limites | Oui (a, b et c) |

### V-DEC034-1 — Appareils couverts en v1 (ENF-01 ; exclusion « iPhone » ; US-017 CA-1)

**Avant** (validé) : « L'application est utilisable sur un smartphone **Android** et sur un PC dès la première version […]. Il n'y a pas d'application pour iPhone en v1. » L'iPhone figurait dans les exclusions.

**Après** (proposé) : « L'application est utilisable sur un smartphone Android et sur un PC dès la première version […]. Sur les deux appareils, c'est la **même application web**, ouverte dans le navigateur (Chrome sur le smartphone ; Chrome ou Edge sur le PC) et installable comme une application. Son usage sur iPhone, techniquement possible, n'est **ni testé ni garanti** en v1, tant que vous ne l'avez pas inclus dans le périmètre. »

**Ce que cela change pour vous** : rien dans l'usage. L'iPhone reste hors de la v1 ; il deviendra simple à ajouter le jour où l'idée EPI-001 (partage avec un contributeur sur iPhone) sera programmée.

★ **Oui.** *Pourquoi :* le texte actuel parle d'une « application pour iPhone » qui n'a plus de sens ; la nouvelle formulation dit clairement ce qui est garanti (Android, PC) et ce qui ne l'est pas (iPhone).
Si non : l'iPhone reste formellement « exclu ». Réponse : ☐ Oui ☐ Non

### V-DEC034-2 — Installation et mises à jour sans APK (ENF-07 ; US-017 CA-12 ; DEC-021)

**Avant** (validé, DEC-021) : sur le téléphone, l'application Android est installée par vous à partir d'un fichier (APK), sans Google Play. Les mises à jour s'installent par-dessus la version existante. Le bouton « Mettre à jour » ouvre la page de téléchargement de la dernière version.

**Après** (proposé) :
- a) « Sur le smartphone comme sur le PC, l'application s'utilise depuis une **adresse web** et s'installe comme une application (icône sur l'écran d'accueil ou le bureau), **sans fichier d'installation ni Google Play**. Les mises à jour sont **automatiques** et ne s'appliquent jamais au milieu d'une saisie ; le bouton « Mettre à jour » applique la dernière version, sans rien à télécharger ni à installer. » **DEC-034 remplace DEC-021** (installation par APK), sous la condition rappelée au §1.
- b) « Désinstaller l'application, ou effacer les données du navigateur pour ce site, **peut** effacer les données conservées sur l'appareil : seules les modifications pas encore enregistrées dans le Drive sont alors perdues ; vos données du Drive restent intactes. » (Avant : la désinstallation de l'application Android effaçait déjà les données de l'appareil.)

**Ce que cela change pour vous** : plus de fichier à installer à chaque version, plus de clé de signature à conserver, plus de démarche de vérification Android en 2027. Le téléphone et le PC ont toujours la même version.

★ **Oui aux deux.** *Pourquoi :* c'est l'effet direct de votre décision DEC-034 ; le point b) est le même risque qu'avant, formulé pour l'application web.
Si non : précisez ce que vous souhaitez garder. Réponse : ☐ a oui ☐ a non · ☐ b oui ☐ b non

### V-DEC034-3 — Accès Google à renouveler : l'exception du PC vaut aussi pour le téléphone (RG-017 ; US-017 CA-3)

**Avant** (validé, V-07 et V-08) : à l'ouverture, l'application affiche aussitôt vos données, puis intègre en une minute au plus les modifications faites sur l'autre appareil. « **Exception sur PC** : si la session Google du navigateur a expiré, cette intégration n'a lieu qu'après votre geste de reconnexion. » Sur le téléphone, aucune exception : tout se faisait en silence.

**Après** (proposé) : même règle, avec une exception commune : « **Exception, sur le smartphone comme sur le PC** : quand l'accès Google doit être renouvelé (il dure une heure), l'intégration n'a lieu qu'après un bref passage par Google à l'ouverture de l'application, ou après un geste de votre part (« Reprendre la synchronisation ») ; **jamais plus d'un geste**, et **aucune saisie** tant que vous restez identifié auprès de Google sur cet appareil (sinon, vous vous identifiez de nouveau sur l'écran de Google). En attendant, l'application reste utilisable sur les données de l'appareil. »

**Exemple** : vous ouvrez l'application sur votre téléphone le matin, après une nuit sans l'utiliser. Vos tâches s'affichent tout de suite. Selon la solution retenue par Starck, soit un écran d'attente d'une ou deux secondes apparaît, soit un bouton « Reprendre la synchronisation » vous propose un appui. Les modifications faites la veille sur le PC arrivent ensuite en moins d'une minute.

★ **Oui.** *Pourquoi :* c'est exactement ce que vous avez accepté en répondant à Q-PWA-2 ; la règle garantit en plus « au plus un geste, aucune saisie ».
Si non : l'application web unique n'est pas compatible avec la règle actuelle ; il faudrait garder l'application Android. Réponse : ☐ Oui ☐ Non

### V-DEC034-4 — Travail sans réseau : même exception sur les deux appareils (ENF-04)

**Avant** (validé) : « L'application est utilisable sans réseau, en consultation et en saisie, sur le smartphone et sur le PC […]. **Sur le PC**, si la session Google du navigateur a expiré, la mise à jour avec l'autre appareil attend un geste de reconnexion. »

**Après** (proposé) : « […] **Sur les deux appareils**, quand l'accès Google doit être renouvelé, la mise à jour avec l'autre appareil attend un bref passage par Google ou un geste de l'utilisateur ; l'utilisation sur les données de l'appareil continue. »

★ **Oui.** *Pourquoi :* même raison que V-DEC034-3, appliquée à l'exigence générale du travail sans réseau.
Si non : même conséquence que pour V-DEC034-3. Réponse : ☐ Oui ☐ Non

### V-DEC034-5 — Retour du réseau et accès expiré sur le téléphone (US-018 CA-4 et CA-8 ; US-022 CA-5 et CA-7)

**a) Retour du réseau (US-018 CA-4)**

**Avant** (validé) : « Au retour du réseau, **sans action de l'utilisateur**, ses modifications sont enregistrées dans son Drive, et celles faites entre-temps sur l'autre appareil sont intégrées. »

**Après** (proposé) : « Au retour du réseau, **si l'accès Google est valide**, ses modifications sont enregistrées dans son Drive sans action de l'utilisateur […]. **Si l'accès Google doit être renouvelé**, l'utilisateur continue de consulter et de saisir ; l'application indique que la synchronisation est à reprendre (« Reprendre la synchronisation », sans bandeau d'alerte) et l'enregistrement a lieu après **au plus un geste**, ou au bref passage par Google de la prochaine ouverture. Aucune modification n'est perdue. »

**Exemple** : vous saisissez des tâches dans le métro pendant deux heures sans réseau. En sortant, le réseau revient : le bouton « Reprendre la synchronisation » s'affiche ; un appui suffit pour tout enregistrer. Si vous n'appuyez pas, rien n'est perdu : l'enregistrement se fera à la prochaine ouverture.

**b) Accès expiré et « Se reconnecter » (US-018 CA-8 ; US-022 CA-5 et CA-7)**

**Avant** (validé) : sur le téléphone, un accès Google expiré affichait le bandeau « Se reconnecter », comme un accès retiré. Sur le PC, un accès expiré affichait seulement « Reprendre la synchronisation », sans bandeau.

**Après** (proposé) : le téléphone se comporte **comme le PC** : un accès **expiré** (cas courant, toutes les heures) affiche seulement « Reprendre la synchronisation », sans bandeau ; seul un accès **retiré** (vous avez retiré l'autorisation dans votre compte Google) affiche le bandeau « Se reconnecter ». Précision de US-022 CA-5 : renouveler l'accès **n'est pas une reconnexion** ; vous ne repassez jamais par l'écran de connexion pour cela.

★ **Oui aux deux.** *Pourquoi :* sans cette précision, la règle actuelle promet sur le téléphone un enregistrement « sans action » que l'application web ne peut pas tenir au-delà d'une heure ; et un bandeau d'alerte toutes les heures serait une fausse alarme.
Si non : précisez le comportement souhaité. Réponse : ☐ a oui ☐ a non · ☐ b oui ☐ b non

### V-DEC034-6 — Notifications et mise à jour en arrière-plan (RG-014 ; Q-DEM001-38 ; exclusions)

**Avant** : RG-014 disait « Google Calendar est le canal souhaité ; une notification de l'application elle-même est acceptable ». La question Q-DEM001-38 (rôle de cette notification) était **ouverte**, avec l'option b) recommandée : en cas de perte de l'accès à l'agenda, le téléphone affiche lui-même les rappels. La mise à jour en arrière-plan, application fermée, était prévue pour un lot ultérieur.

**Après** (proposé) :
- a) RG-014 : « […] **Google Calendar est le seul canal des rappels** : l'application n'émet pas elle-même de notification sur l'appareil, ni en secours, ni en complément. Si l'accès à l'agenda est perdu, l'application en avertit l'utilisateur et lui propose de se reconnecter. » La question Q-DEM001-38 est **close par l'option a)**. L'option b) est retirée (votre renonciation, Q-PWA-3) ; l'option c) (notification de l'application toujours en complément) n'est plus réalisable non plus, car une application web sans serveur ne peut pas programmer une notification à l'avance.
- b) Deux exclusions s'ajoutent au cahier des charges : les notifications émises par l'application sur l'appareil, et la mise à jour des données en arrière-plan, application fermée. Elle se fait à l'ouverture et pendant l'utilisation, comme c'était déjà le cas au lot 1.

**Ce qui ne change pas** : les rappels de 8 h et de 21 h et les créneaux de tâches restent des événements de votre agenda Google ; ils sonnent même si aucun de vos appareils n'est allumé.

★ **Oui aux deux.** *Pourquoi :* c'est la traduction écrite de votre renonciation (Q-PWA-3) ; elle évite de laisser ouverte une question dont les réponses b) et c) ne sont plus possibles.
Si non : précisez ce que vous attendez en cas de perte de l'accès à l'agenda. Réponse : ☐ a oui ☐ a non · ☐ b oui ☐ b non

### V-DEC034-7 — Conditions du travail sans réseau sur le téléphone (ENF-04, dernière phrase ; US-018, cas limites)

Avec l'application web, le téléphone hérite des conditions qui existaient déjà sur le PC. Elles sont **nouvelles pour le téléphone** :
- a) **Le travail sans réseau est garanti depuis l'application installée** sur l'écran d'accueil. Dans un simple onglet de Chrome, il ne l'est pas : Chrome peut effacer les données d'un site non installé quand le téléphone manque de place. *(Recommandation de Starck, ETU-002 §4.1.)*
- b) **La toute première ouverture doit se faire avec le réseau.** Si l'application n'a jamais été ouverte sur le téléphone, rien ne peut s'afficher sans réseau : c'est la page d'erreur de Chrome qui apparaît.
- c) **Effacer les données de Chrome pour ce site** (ou désinstaller l'application) fait perdre les modifications pas encore enregistrées dans le Drive. Tout le reste est rechargé depuis le Drive à la connexion suivante. L'application ne peut pas l'empêcher ; le guide utilisateur le signalera.

★ **Oui aux trois.** *Pourquoi :* ce sont les limites réelles de l'application web ; les écrire évite toute surprise. Le risque c) existait déjà avec l'application Android (désinstallation), et il reste limité aux modifications des dernières secondes ou des périodes sans réseau.
Si non : précisez le point refusé ; une protection supplémentaire serait à étudier avec Starck. Réponse : ☐ a oui ☐ a non · ☐ b oui ☐ b non · ☐ c oui ☐ c non

---

## 5. Ce qui ne change pas

- **Le délai d'une heure** entre vos appareils, l'affichage immédiat de vos données à l'ouverture et l'intégration en moins d'une minute (RG-017, ENF-02) : seule l'exception de l'accès à renouveler s'étend au téléphone.
- **Aucune perte de donnée** (ENF-06), le bandeau de rappel après 24 h de modifications en attente (RG-057), la liste des modifications non retenues (RG-056), la consultation seule quand le format des données est plus récent (RG-058). Cette dernière deviendra rare, puisque vos deux appareils auront toujours la même version.
- **L'heure changée sans réseau, puis l'appareil redémarré** : la limite que vous avez acceptée (DEC-030, US-017 CA-13) vaut déjà pour les deux appareils ; son texte ne change pas.
- **Le PC** : son fonctionnement est inchangé (US-031 garde tous ses critères et ses 28 scénarios).
- **Les user stories métier** (US-001, 023, 002, 024, 003, 025) : aucun impact.

---

## 6. Synthèse par user story

| User story | Statut proposé en attendant votre réponse | Ce qui change | Scénarios de test touchés (`@DEC-034`) | Décisions liées |
|---|---|---|---|---|
| [US-017](../01-specification-fonctionnelle/user-stories/US-017-retrouver-mes-donnees-sur-smartphone-et-pc.md) Retrouver mes données sur smartphone et PC | En analyse | CA-1 précisé ; CA-3 (exception étendue) ; CA-12 (« Mettre à jour ») | S06b (nouveau), S30 (adapté) ; 46 scénarios | V-DEC034-1, 2, 3 |
| [US-018](../01-specification-fonctionnelle/user-stories/US-018-utiliser-l-application-sans-reseau-sur-mon-smartphone.md) Utiliser l'application sans réseau sur mon smartphone | En analyse | CA-4 reformulé ; CA-8 précisé ; 3 cas limites nouveaux | S06, S09b, S11 (adaptés) ; S06b, S18, S19 (nouveaux) ; 29 scénarios | V-DEC034-5, 6, 7 |
| [US-022](../01-specification-fonctionnelle/user-stories/US-022-se-connecter-avec-mon-compte-google.md) Se connecter avec mon compte Google | En analyse | CA-5 précisé ; CA-7 étendu au téléphone | S11 (adapté), S23b (nouveau) ; 33 scénarios | V-DEC034-3, 5 |
| [US-031](../01-specification-fonctionnelle/user-stories/US-031-utiliser-l-application-sans-reseau-sur-mon-pc.md) Utiliser l'application sans réseau sur mon PC | Validée (inchangée) | Renvois aux règles reformulées seulement | Aucun | V-DEC034-2, 4, 6 |

**Scénarios retirés** (propres à l'application Android) : l'exemple « accès expiré → bandeau Se reconnecter » sur le téléphone (US-018 S11, US-022 S11) et la vérification « Mettre à jour ouvre la page de téléchargement » (US-017 S30). Ils sont remplacés comme indiqué ci-dessus. Total : 279 scénarios (274 avant).

---

## 7. Pour information : point technique en cours (sans décision de votre part)

- **Q-DEC034-1 (Starck)** : à l'ouverture sur le téléphone, le renouvellement de l'accès Google se fera-t-il sans aucun geste (bref passage automatique par Google) ou avec un appui ? Les deux sont permis par la règle que vous avez acceptée (Q-PWA-2) ; le test technique tranchera. Les scénarios de test sont écrits pour fonctionner dans les deux cas.
- Starck met à jour en parallèle le dossier d'architecture, les décisions d'architecture et le guide du test technique ; Anthony reprendra ensuite les spécifications techniques.

---

## 8. Résultat

| Élément | Valeur |
|---|---|
| Date de la réponse | 2026-10-22 |
| Verbatim du commanditaire | « Tout reco » |
| Décision consignée | **DEC-036** dans [`suivi-projet.md`](../suivi-projet.md) |

**Ce qui est validé :** les 7 recommandations ★, V-DEC034-1 à V-DEC034-7, avec tous leurs points (a, b, c) :
- V-DEC034-1 : ENF-01 reformulée ; exclusion « iPhone » reformulée ; US-017 CA-1 précisé ;
- V-DEC034-2 : ENF-07 reformulée ; US-017 CA-12 (« Mettre à jour ») ; **DEC-021 est remplacée** par DEC-034 ;
- V-DEC034-3 : RG-017, exception de l'accès Google à renouveler étendue au téléphone ; US-017 CA-3 ;
- V-DEC034-4 : ENF-04 ;
- V-DEC034-5 : US-018 CA-4 et CA-8 ; US-022 CA-5 et CA-7 ;
- V-DEC034-6 : RG-014 ; **Q-DEM001-38 close par a)** ; deux exclusions ajoutées (notifications de l'application, mise à jour en arrière-plan) ;
- V-DEC034-7 : conditions du travail sans réseau sur le téléphone (application installée, première ouverture avec réseau, effacement des données du navigateur).

**Réserve, conforme à DEC-034 et DEC-036 :** tous ces textes sont **retirés si la condition de DEC-034 échoue** (mesures **M-RED** et **M-PERSIST** du test technique). L'application Android (APK) est alors conservée et les textes « Avant » du §4 sont rétablis, sans nouvelle question.

**Précision reçue ensuite (Q-DEC034-1, Starck, 2026-10-22 ; critère de la mesure M-RED) :** à l'ouverture, l'accès Google se renouvelle **sans aucun geste**, par une redirection silencieuse de 1 à 2 secondes, en **une seule tentative** ; sinon, « Reprendre la synchronisation » s'affiche. Ce geste n'est demandé que si l'accès expire pendant l'utilisation ou si la redirection échoue ; une saisie, seulement si la session Google de l'appareil a elle-même expiré. Cette précision est conforme à V-DEC034-3 (« jamais plus d'un geste, aucune saisie ») et ne demande pas de nouvelle validation.

**Suites données par Pepper (2026-10-22) :**
- cahier des charges **v0.14** : RG-014, RG-017, ENF-01, ENF-04, ENF-07 reformulées, avec la mention « retirée si la condition de DEC-034 échoue (M-RED, M-PERSIST) » ; exclusions du §4.3 et glossaire (« Accès Google à renouveler », « Application installée ») établis ; statut « Proposée (DEC-034) » retiré ;
- US-017, US-018 et US-022 de nouveau **« Prête »** ; US-031 reste « Validée », critères inchangés ; textes antérieurs conservés dans les US pour un éventuel rétablissement ;
- `questions-ouvertes.md` : Q-DEM001-38 répondue (a) ;
- tests métiers : **280 scénarios** ; tag `@DEC-034` conservé pour repérer les scénarios à retirer si la condition échoue ; réponse de Starck reportée (nouveau US-018 S06c ; US-017 S06 et US-022 S23 complétés par la précondition « redirection silencieuse en échec ») ; glossaire d'étapes **v1.8**.
