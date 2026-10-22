# Backlog d'idées (tenu par Jarvis)

> Les idées et épiques du commanditaire qui ne sont pas encore étudiées sont recueillies ici, en amont d'E0.
> Une idée n'entre dans le workflow (E0, `DEM-xxx`) que lorsque le commanditaire l'a **priorisée**.
> Fonctionnement : étape **E-1** de `docs/workflow.md`, validée par le commanditaire le 2026-10-22 (DEC-033).

## Tableau

| Id | Titre | Reçue le | Statut | Maturité | Taille pressentie | Priorité |
|---|---|---|---|---|---|---|
| EPI-001 | Partage d'un objectif avec un autre utilisateur, rôles « administrateur des tâches » et « contributeur » | 2026-10-22 | **Mûre** (essai R-P1/R-P2 à faire avant E3) | 6/6 critères | Très grande (XL) | — |
| EPI-002 | Assistant IA vocal pour définir et raffiner un objectif et créer les tâches | 2026-10-22 | **Mûre** | 6/6 critères | Moyenne (M) en v1, grande (L) pour l'épique complète | — |

Statuts : Reçue → Qualifiée → Mûre → Priorisée → Transformée en `DEM-xxx` (ou Écartée, ou En sommeil).

---

## EPI-001 — Partage d'un objectif avec un autre utilisateur

**Verbatim (2026-10-22)**
> je souhaite ajouter la possibilité d'avoir un autre utilisateur à qui repartir les tâches qui seraient partagées au sein d'un même objectif. Il faudrait qu'il ait une vue sur les objectifs sans pouvoir les modifier, il devrait pouvoir modifier ses tâches et imputer du temps sur ses tâches avec des résumé matinaux et soir, il faudrait qu'on introduise un rôle d'administrateur des tâches et que j'ai les 2 rôles à l'initiative.

**Reformulation de Jarvis**
- Un objectif peut être partagé avec un autre utilisateur, le contributeur.
- L'administrateur des tâches répartit les tâches de cet objectif entre lui-même et le contributeur.
- Le contributeur peut :
  - voir l'objectif, sans pouvoir le modifier ;
  - modifier les tâches qui lui sont attribuées ;
  - imputer du temps sur ces tâches ;
  - recevoir les résumés du matin et du soir pour ses tâches.
- Au départ, le commanditaire détient les deux rôles, administrateur et utilisateur.

**Valeur attendue** : déléguer une partie d'un objectif et en suivre l'avancement, sans perdre la maîtrise de l'objectif.

**Tensions avec l'existant, à arbitrer en E1** :
- **RG-018** : « un seul utilisateur par compte ; données ni partagées ni visibles par d'autres ». L'épique la remet en cause directement.
- **ENF-05** (confidentialité) et **DEC-007** (aucun serveur). Sans serveur, le partage ne peut passer que par le partage de fichiers Google Drive entre deux comptes. C'est un changement d'architecture majeur pour Starck : droits, fusion à deux auteurs, révocation du partage, contributeur sans compte Google.
- Elle dépend de fonctions qui ne sont pas encore livrées :
  - le suivi du temps (lot 3 indicatif) ;
  - les rappels et résumés du matin et du soir (lot 4).
- Elle touche l'agenda : les créneaux du contributeur sont-ils posés dans **son** agenda ?
- **iPhone (information du commanditaire, 2026-10-22)** : le second utilisateur aura un **iPhone**. Or l'iPhone est exclu de la v1 (ENF-01, DEC-001 A1), et l'application smartphone est un APK Android (ADR-012). Pistes à étudier par Starck : la PWA dans Safari sur iPhone, avec ses limites (stockage, notifications, connexion Google), ou une application iOS. Cette contrainte pèse probablement sur la taille.

**Questions de maturité, pour le commanditaire** :
- **M1-1** : Le contributeur a-t-il son propre compte Google et sa propre installation de Done Juan ?
- **M1-2** : Le contributeur peut-il créer des tâches dans l'objectif partagé, ou seulement modifier celles qu'on lui attribue ?
- **M1-3** : Un objectif peut-il être partagé avec plusieurs contributeurs, ou un seul ?
- **M1-4** : Le rôle d'administrateur peut-il être confié à quelqu'un d'autre que vous ? Pourquoi distinguer ce rôle, alors que vous seriez le seul à le détenir au départ ?
- **M1-5** : Les résumés du matin et du soir du contributeur portent-ils seulement sur les tâches partagées ?

**Réponses du commanditaire (2026-10-22, transcrites de sa dictée)**
- **M1-1** : le contributeur a son propre compte Google.
- **M1-2** : le contributeur peut créer des tâches.
- **M1-3** : un seul contributeur **par tâche** (verbatim : « Il peut y avoir un seul contributeur par tâche »).
- **M1-4** : dans un premier temps, le rôle d'administrateur ne peut pas être délégué.
- **M1-5** : les résumés du contributeur portent sur les objectifs partagés et sur ses propres tâches.

**Questions de suivi, répondues le 2026-10-22**
- **M1-6** : c'est l'objectif qui est partagé, et il peut l'être avec **plusieurs contributeurs**. Chaque tâche a au plus un contributeur, et chaque contributeur a ses propres tâches.
- **M1-7** : les tâches créées par un contributeur sont toujours visibles et modifiables par l'administrateur.

**Critères de maturité remplis** : besoin, valeur, conflits repérés, réponses de maturité. **Il manque** : le périmètre exclu et la taille confirmée par un avis de faisabilité de Starck. Cet avis porte sur le partage par Drive entre plusieurs comptes sans serveur, sur la fusion des écritures de plusieurs auteurs et sur le retrait d'un contributeur.

### Avis de faisabilité de Starck (2026-10-22)

> Avis E-1, court et non engageant. Aucun ADR créé, DAT inchangé. Les points marqués « à mesurer » ne sont pas documentés de façon fiable par Google ou Apple : ils demandent un essai avant E3. Question voisine : PWA unique, étudiée dans `03-architecture/etude-pwa-unique.md` (ETU-002).

**1. Partage sans serveur : faisable, avec une réserve forte.** Sans serveur (DEC-007), seul le partage Drive entre comptes est possible. Mais `drive.file` n'ouvre à l'application que les fichiers **qu'elle a créés pour ce compte**, ou que l'utilisateur **a choisis** dans le sélecteur Google (Picker) ou par « Ouvrir avec ». Un fichier de l'administrateur partagé avec le contributeur est donc très probablement **invisible** (`404`) pour l'application du contributeur, tant qu'il ne l'a pas choisi dans le Picker. C'est le risque **R-P1**, à mesurer avec deux comptes : la sélection d'un dossier ouvre-t-elle ses fichiers ? Les scopes `drive` ou `drive.readonly` lèveraient l'obstacle, mais ils sont restreints et ouvriraient tout le Drive du contributeur (ENF-05) : je ne les recommande pas.

**Conception pressentie, qui étend ADR-003 sans changer de mécanisme** :
- un **fichier de partage par contributeur**, écrit par les appareils de l'administrateur. C'est une projection filtrée de son état CRDT : l'objectif et les tâches visibles par ce contributeur. Il est partagé **en lecture** avec lui ;
- chaque appareil du contributeur écrit **son seul** fichier (ses tâches, ses temps) dans **son** Drive, partagé en lecture avec l'administrateur ;
- la règle « un fichier, un écrivain » et la fusion LWW par champ avec HLC sont conservées ;
- gestes dans le Picker : le contributeur en fait un à l'invitation ; l'administrateur en fait un à chaque nouvel appareil d'un contributeur. Ils disparaissent si R-P1 est favorable.

**Droits.**
- **Imposé par Google** :
  - nul ne modifie le fichier d'un autre ;
  - le contributeur ne reçoit que sa projection, donc jamais les autres objectifs de l'administrateur ;
  - le retrait de l'autorisation Drive coupe la réception des mises à jour.
- **Imposé par la fusion** : la règle est déterministe et appliquée par tous les appareils, donc convergente.
  - Chaque écriture est attribuée au **propriétaire du fichier**, connu de Drive et non déclaré par le fichier.
  - Les écritures du contributeur hors de son périmètre sont **ignorées et signalées** : champs de l'objectif, tâche d'un autre, attribution.
  - Son HLC est plafonné par la date serveur du fichier : une horloge avancée ne gagne pas contre l'administrateur.
- **Déclaratif seulement** :
  - ce que le contributeur a déjà reçu reste sur son appareil après le retrait : aucun effacement à distance sans serveur ;
  - la sincérité des temps imputés.

**Retrait.** L'administrateur retire l'autorisation Drive et inscrit le retrait, horodaté, dans son état. Les écritures du contributeur postérieures au retrait sont ignorées. Ses tâches reviennent à l'administrateur (M1-9).

**2. Contributeur sur iPhone : la PWA ajoutée à l'écran d'accueil depuis Safari est faisable, avec des limites.**
- **Connexion.** La PWA a son propre espace, distinct de Safari : il faut se connecter à Google une fois dans la PWA. La fenêtre surgissante de Google y est réputée défaillante. Il faut une **redirection pleine page** (`prompt=none` si la session est active). Le jeton dure 1 h, sans jeton d'actualisation : il est renouvelé par un aller-retour vers Google à l'ouverture. La durée de la session Google dans la PWA est **à mesurer (R-P2)**.
- **Stockage.** IndexedDB est hors de l'effacement après 7 jours sans visite, qui ne touche que Safari. `storage.persist()` est disponible depuis iOS 17 et favorise les applications de l'écran d'accueil. Une éviction reste possible si l'appareil manque d'espace. Supprimer l'icône efface les données. Seules les modifications non déposées sont exposées (comme R15).
- **Notifications.** Web Push existe depuis iOS 16.4, mais exige un serveur émetteur, ce qui est exclu par DEC-007. Les rappels du contributeur passent donc par **son** Google Calendar (DEC-022).
- **Arrière-plan.** Aucune synchronisation en arrière-plan : elle a lieu à l'ouverture et au premier plan.
- **UE.** Apple a maintenu en 2024 les applications web de l'écran d'accueil, sur WebKit. Une décision contraire reste possible : à surveiller.
- **Alternative.** Une application iOS Capacitor coûte environ 99 USD par an et exige un Mac ou une CI macOS. Je ne la recommande pas pour un contributeur.

**3. Synthèse.**
- **Taille : XL confirmée.**
  - Partage et rôles : L.
  - iPhone : M ; S si la PWA unique (ETU-002) est retenue.
- **Dépendances** :
  - LOT-001 livré (ADR-003) ;
  - lot 3 (temps) ;
  - lot 4 (rappels par Calendar) ;
  - essai R-P1/R-P2 avant E3, avec deux comptes et l'iPhone ;
  - décision sur ETU-002.
- **ADR à créer en E3** : un ADR « partage multicomptes et rôles » ; un ADR « connexion par redirection ».
- **Exclus de la v1 (recommandé)** :
  - délégation de l'administration, ou plusieurs administrateurs ;
  - contributeur sans compte Google ;
  - partage d'un sous-objectif seul ;
  - modification de l'objectif par le contributeur ;
  - effacement à distance ;
  - notifications push ;
  - arrière-plan ;
  - application iOS native ;
  - temps réel : le délai d'une heure de RG-017 reste la règle.

**Questions fermées pour le commanditaire**
- **M1-8** : Le contributeur voit-il les tâches des autres participants de l'objectif ? (a) non, seulement l'objectif et ses tâches ; (b) oui, en lecture. *Reco : (a), par minimisation des données ; (b) ne coûte pas plus.*
- **M1-9** : Au retrait d'un contributeur, que deviennent ses tâches ? (a) elles reviennent à l'administrateur, avec le temps imputé ; (b) elles sont supprimées. *Reco : (a).*
- **M1-10** : Sur iPhone, quelle solution ? (a) la PWA depuis Safari, gratuite ; (b) une application iOS, environ 99 USD par an. *Reco : (a), sous réserve de R-P2.*
- **M1-11** : Si R-P1 confirme l'invisibilité des fichiers partagés, que faire ? (a) un choix manuel dans le sélecteur Google, à l'invitation et à chaque nouvel appareil ; (b) un accès à tout le Drive des participants (scope restreint, écran d'avertissement) ; (c) mettre l'épique en sommeil. *Reco : (a).*
- **M1-12** : Les créneaux et les rappels du contributeur sont-ils posés dans **son** agenda Google, et jamais dans celui de l'administrateur ? *Reco : oui.*
- **M1-13** : Le contributeur peut-il aussi gérer dans Done Juan ses propres objectifs, non partagés, cloisonnés ? *Reco : oui, c'est la même application.*
- **M1-14** : Acceptez-vous un essai technique de partage avant E3 (deux comptes Google, l'iPhone du contributeur, environ 1 h) ? *Reco : oui.*

**Réponses du commanditaire (2026-10-22, DEC-035)**
- **M1-8** : réponse propre au commanditaire, ni (a) ni (b) strict. Le contributeur a une **vue synthétique, en lecture seule**, des tâches des autres contributeurs de l'objectif. Le contenu exact de cette vue est à préciser en E1.
- **M1-9** : (a), les tâches reviennent à l'administrateur avec le temps imputé.
- **M1-10** : (a), PWA depuis Safari.
- **M1-11** : (a), choix manuel dans le sélecteur Google.
- **M1-12** : oui, créneaux et rappels dans l'agenda du contributeur.
- **M1-13** : oui, le contributeur peut avoir ses propres objectifs, cloisonnés.
- **M1-14** : oui, essai technique de partage **à faire** avant E3. Starck l'intègre comme volet optionnel du protocole de test technique v3 (deux comptes Google et l'iPhone du contributeur).

**Statut : Mûre** (6/6 critères). Elle sera priorisée à la clôture de LOT-001. Une seule réserve : l'essai R-P1/R-P2 doit précéder E3.

*Sources (2026-10-22) :*
- *portée de `drive.file` : [Google, Choose Drive API scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth), [forum Google](https://discuss.google.dev/t/how-to-download-file-from-google-drive-with-drive-file-scope/332290) ;*
- *connexion dans une PWA iOS : [Progressier](https://intercom.help/progressier/en/articles/9519381-google-oauth2-is-not-working-in-my-pwa-on-ios-why), [SpotLi PR #231](https://github.com/SaharAga/SpotLi/pull/231) ;*
- *stockage : [WebKit, Storage Policy](https://webkit.org/?p=14403) ;*
- *notifications : [WebKit, Web Push](https://webkit.org/?p=13878) ;*
- *politique d'Apple dans l'UE : [Engadget](https://www.engadget.com/apple-backtracks-on-plans-to-get-rid-of-web-apps-on-iphones-in-the-eu-195232177.html).*

---

## EPI-002 — Assistant IA vocal pour définir un objectif et ses tâches

**Verbatim (2026-10-22)**
> je souhaite pouvoir interroger une ia externe avec la voix dans un module pour définir un objectif et qu'il soit raffiné par ia et qu'elle aide à lister les tâches à créer, je veux aussi lui permettre de crée des objectifs et des taches

**Reformulation de Jarvis**
- Un module « assistant » permet de dialoguer à la voix avec une IA externe.
- L'IA aide à formuler un objectif, à le raffiner et à proposer la liste des tâches nécessaires.
- L'IA peut aussi créer elle-même les objectifs et les tâches dans Done Juan.

**Valeur attendue** : passer d'une intention floue à un objectif et des tâches exploitables, rapidement et sans saisie au clavier.

**Tensions avec l'existant, à arbitrer en E1** :
- **ENF-05** (confidentialité) : les intitulés d'objectifs et de tâches seraient envoyés à un service tiers.
- **DEC-007** (aucun serveur) : l'appel à l'IA se ferait depuis l'appareil, avec une clé d'API à stocker sur l'appareil ou une connexion par le compte de l'utilisateur.
- **Coût** : la contrainte « gratuit ou sans cloud » ne permet pas d'utiliser une IA externe payante à l'usage.
- **Création par l'IA** : faut-il une validation humaine avant la création ? Si oui, elle s'aligne sur le principe « jamais appliqué sans validation » de RG-037.
- **Reconnaissance vocale** : celle du système (Android, navigateur) ou celle du service d'IA ? Le choix a des conséquences sur la confidentialité.

**Questions de maturité, pour le commanditaire** :
- **M2-1** : Quelle IA externe ? Un fournisseur imposé ? Un abonnement existant ? Un budget mensuel acceptable ?
- **M2-2** : L'IA crée-t-elle directement les objectifs et les tâches, ou les propose-t-elle pour que vous validiez ?
- **M2-3** : Faut-il une réponse vocale de l'IA, ou du texte à l'écran suffit-il ?
- **M2-4** : Sur quels appareils : smartphone seulement, ou aussi PC ?
- **M2-5** : Acceptez-vous que le contenu de vos objectifs et de vos tâches soit transmis à ce service ?

**Réponses du commanditaire (2026-10-22, transcrites de sa dictée)**
- **M2-1** : l'IA et le budget sont à déterminer. Une IA assez simple, peut-être Mistral ou Claude. Le commanditaire veut une solution **ouverte**, donc probablement une interface **MCP**, pour ne pas dépendre d'un fournisseur.
- **M2-2** : l'IA **suggère** et ne fait pas à la place de l'utilisateur. L'utilisateur valide les propositions, et c'est sa validation qui crée les objectifs et les tâches.
- **M2-3** : pas de réponse vocale dans un premier temps. L'entrée reste vocale.
- **M2-4** : plutôt sur smartphone que sur PC dans un premier temps.
- **M2-5** : oui, les données seront nécessairement envoyées au service d'IA.

**Conséquences notées par Jarvis**
- M2-5 restreint ENF-05 pour ce module. Il faudra le dire explicitement dans le cahier des charges et prévoir un consentement à l'activation du module.
- « Ouvert, interface MCP » : MCP est un protocole qui permet à une IA d'utiliser des outils. Il existe deux lectures possibles. Soit Done Juan **expose** ses fonctions (proposer un objectif, proposer des tâches) à n'importe quelle IA compatible. Soit Done Juan **appelle** une IA au choix de l'utilisateur. Le choix est à faire par Starck, compatible avec DEC-007 (aucun serveur) et avec la contrainte de coût.

**Critères de maturité remplis** : besoin, valeur, conflits repérés, réponses de maturité. **Il manque** : le périmètre exclu (par exemple : pas de réponse vocale, pas de PC en v1, pas d'action de l'IA sans validation) et la taille confirmée par un avis de faisabilité et de coût de Starck (fournisseur, MCP, reconnaissance vocale sur Android).

### Avis de faisabilité de Starck (2026-10-22)

> Avis E-1, court et non engageant. Aucun ADR créé, DAT inchangé. Prix relevés le 2026-10-22, à revérifier en E3.

**1. Lecture de « MCP ».** La lecture « Done Juan **expose un serveur MCP** » n'est pas réaliste en v1. Une IA cliente (application Claude, Le Chat) ne joint un serveur MCP distant que par une URL HTTPS publique, ce qui contredit DEC-007. Un serveur MCP local (stdio) ne tourne qu'avec un client de bureau, pas sur Android. De plus, il devrait écrire dans les fichiers Drive en tant que troisième auteur du format CRDT (ADR-003). **Recommandation** : Done Juan est **client** d'un fournisseur interchangeable. On crée un port `AssistantIA` (couche application, ADR-010) avec deux opérations, `proposerObjectif` et `proposerTaches`. Ces opérations renvoient une proposition structurée, validée par un schéma JSON, et n'écrivent rien. L'ouverture voulue est assurée de deux façons :
- par les **outils** (*function calling*), décrits en JSON Schema comme dans MCP ;
- par un adaptateur **« compatible OpenAI »**, qui couvre Mistral, OpenRouter et un modèle local de type Ollama. Un adaptateur Anthropic natif est facultatif.

La création passe ensuite par les cas d'usage existants, au geste de validation de l'utilisateur (M2-2), en une seule opération journalisée. **Pas de serveur MCP en v1.** Exposer un serveur MCP deviendra possible si l'hébergement sur Raspberry Pi est retenu (ETU-001). Ce serait un ajout, pas une refonte.

**2. Clé d'API.** C'est la clé de l'utilisateur, saisie dans les paramètres :
- sur Android, chiffrée par le Keystore ;
- sur PC, dans IndexedDB, chiffrée par une clé WebCrypto non exportable.

Elle n'est **jamais** déposée sur Drive. Sur Android, les appels passent par le HTTP natif de Capacitor, qui n'est pas soumis à CORS. En PWA, Anthropic accepte les appels depuis le navigateur ; pour Mistral, c'est à vérifier. **Risques** :
- vol de la clé, par une faille XSS ou une dépendance compromise ;
- dépenses abusives en cas de vol. Parade : plafond de dépense et clé dédiée chez le fournisseur.

Autre option sans serveur : la connexion OAuth (PKCE) d'**OpenRouter**, qui délivre une clé sans copier-coller. Elle ajoute un intermédiaire.

**3. Reconnaissance vocale.** Recommandation : celle du **système**.
- Sur Android, `SpeechRecognizer` (plugin Capacitor communautaire), gratuit. `createOnDeviceSpeechRecognizer` (Android 12 et plus) fonctionne sans réseau si le pack français est installé. Sinon, l'audio part chez Google.
- Dans Chrome sur PC, l'API Web Speech envoie l'audio aux serveurs de Google ; Firefox ne la prend pas en charge.
- La transcription par le fournisseur (Voxtral, environ 0,003 $/min) envoie l'audio à un tiers de plus, pour un gain faible.

Dans tous les cas, l'assistant exige le réseau pour l'IA. Il n'y a **pas d'assistant hors ligne** : le module est grisé, avec un message.

**4. Coût indicatif.** Hypothèse : 20 sessions par mois, environ 15 000 jetons en entrée et 3 000 en sortie par session, soit 0,3 M en entrée et 0,06 M en sortie par mois.

| Fournisseur et modèle | Prix (entrée / sortie, par M de jetons) | Par mois |
|---|---|---|
| Mistral Small | environ 0,1 à 0,2 $ / 0,3 à 0,6 $ | **moins de 0,10 $** |
| Mistral Medium 3 | 0,4 $ / 2 $ | environ 0,25 $ |
| Claude Haiku 4.5 | 1 $ / 5 $ | environ 0,60 $ |
| Claude Sonnet 4.5 | 3 $ / 15 $ | environ 1,80 $ |

Même avec une marge de 5, le coût reste **sous 5 € par mois**. Les abonnements Claude Pro et Le Chat Pro ne donnent pas accès à l'API.

Offres gratuites :
- le plan **Experiment** de Mistral est gratuit, sans carte bancaire. En contrepartie, les requêtes **peuvent servir à l'entraînement**, ce qui va au-delà de M2-5 ;
- un **modèle local** (Ollama sur PC ou Raspberry Pi) est gratuit et sans cloud. Il relève d'ETU-001 et donne une qualité moindre avec un Pi.

**5. Taille, dépendances et exclusions.**
- **Taille** : **M** pour la v1 recommandée (Android, un adaptateur « compatible OpenAI », voix du système). **L** pour l'épique complète (PC, plusieurs adaptateurs).
- **Dépendances** :
  - LOT-001 livré (création d'objectifs et de tâches, hiérarchie, journal) ;
  - application Android (ADR-012) ;
  - consentement d'activation et exception à ENF-05 au cahier des charges.
- **ADR à créer en E3** :
  - ADR « Assistant IA : port, adaptateurs, format des propositions » ;
  - ADR « Secrets de services tiers sur l'appareil ».
- **Exclus de la v1** :
  - réponse vocale ;
  - PC ;
  - serveur MCP ;
  - modèle local ;
  - toute écriture sans validation ;
  - modification ou suppression d'éléments existants par l'IA ;
  - pose de créneaux dans l'agenda ;
  - historique des conversations synchronisé ;
  - fonctionnement hors ligne.

Seuls le dialogue et l'objectif en cours sont transmis à l'IA (minimisation).

**6. Risques**
- fuite de la clé ;
- réponses mal formées ou inventées, à absorber par la validation de schéma et la relecture humaine ;
- qualité de la dictée française selon les appareils ;
- évolution des API et des prix des fournisseurs.

**Questions fermées pour le commanditaire**
- **M2-6** : Quel fournisseur pour la v1 ?
  - (a) Mistral, payant à l'usage, hébergé dans l'UE ;
  - (b) Anthropic ;
  - (c) OpenRouter, pour un choix libre du modèle.

  *Reco : (a).*
- **M2-7** : Acceptez-vous l'offre gratuite de Mistral, dont les données peuvent servir à l'entraînement ? *Reco : non. L'offre payante coûte quelques centimes par mois.*
- **M2-8** : Quelle reconnaissance vocale ?
  - (a) celle du système Android, sur l'appareil si possible ;
  - (b) celle du fournisseur d'IA.

  *Reco : (a).*
- **M2-9** : L'IA reçoit-elle aussi la liste de vos objectifs existants, pour éviter les doublons et proposer un rattachement ? *Reco : non en v1.*

**Réponses du commanditaire (2026-10-22)** : recommandations retenues pour M2-6 à M2-9.
- **M2-6** : (a) Mistral.
- **M2-7** : non, pas d'offre gratuite. Le commanditaire signale qu'il dispose d'un abonnement « pro ». D'après l'avis de Starck, ni Le Chat Pro ni Claude Pro ne donnent accès à l'API : une clé API payante à l'usage reste nécessaire.
- **M2-8** : (a) reconnaissance vocale d'Android.
- **M2-9** : non en v1.

**Statut : Mûre** (6/6 critères). Le périmètre exclu et la taille (M pour la v1) viennent de l'avis de Starck. EPI-002 sera présentée à la priorisation lors de la clôture de LOT-001 (E17), ou plus tôt sur demande.
