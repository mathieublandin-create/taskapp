# Étude : se passer du cloud, ou ne recourir qu'à des services gratuits

> **Version 2 du 2026-10-21.** Auteur : Starck, architecte logiciel.
> **Version 2** : le commanditaire a répondu le 2026-10-21 (DEC-019 à DEC-024). Ses décisions et leurs conséquences figurent au §12 ; la fiche ETU-001 (Raspberry Pi) est ouverte au §13 ; deux nouvelles questions QC-8 et QC-9 sont ajoutées au §10. Les §1 à §9 restent l'étude telle que soumise.
> **Origine** : demande du commanditaire du 2026-10-21, verbatim : « étudie le fait de pas utiliser de solution cloud ou alors gratuite ».
> **Nature** : étude d'aide à la décision. **Aucune décision n'est prise ici.** Le DAT (v0.6) et les ADR-001 à ADR-011 ne sont pas modifiés. Si une option autre que la situation actuelle est retenue, ses conséquences passeront par un arbitrage du commanditaire consigné dans `suivi-projet.md`, puis par une nouvelle version du DAT et des ADR.
> **Références** : DAT v0.6 ; ADR-002, 003, 004, 005, 006, 007 ; `suivi-projet.md` (DEC-001 à DEC-018) ; cahier des charges v0.7 (Q-DEM001-3 b, RG-012 à RG-014, RG-017, RG-019, RG-020, RG-033, RG-034, RG-037, §4.3) ; `test-technique-R1-R2.md`.
> **Suite donnée** : voir §12. L'étude a été tranchée par DEC-019 à DEC-024 ; la mise en œuvre figure dans le DAT v0.8 et ADR-012.
> **Fiabilité des sources** : les prix et conditions ont été recherchés sur le web le 2026-10-21. Les pages officielles n'étaient pas toutes accessibles. Chaque chiffre est suivi de sa source (§11). La mention **(non vérifié)** signale une information issue de mes connaissances ou d'une source secondaire isolée, à confirmer avant toute décision.

---

## 1. Résumé pour le commanditaire

1. **La solution actuelle est déjà presque gratuite.** Le seul paiement prévu est l'inscription à Google Play : **25 USD, une seule fois** (DEC-005). Tout le reste est gratuit à la volumétrie d'un utilisateur seul : Google Drive, Google Calendar, connexion Google, projet Google Cloud, hébergement de la version PC, intégration continue. Aucun abonnement n'est prévu.
2. **« Cloud » ne veut pas dire « payant » ici.** Les services en ligne utilisés sont ceux du **compte Google personnel** du commanditaire, conformément à sa réponse Q-DEM001-3 b (« mon propre espace de stockage en ligne »). L'éditeur n'exploite aucun serveur (DEC-007).
3. **Se passer entièrement du cloud est possible, mais coûte cher en fonctionnalités** :
   - plus de synchronisation hors du domicile, sauf avec un serveur chez soi ;
   - plus de rappels ni de créneaux dans Google Calendar. Ces fonctions reposent par nature sur un service en ligne. Elles seraient remplacées par des notifications du smartphone et un agenda propre à l'application ;
   - le lot 1, déjà validé, devrait être en partie respécifié.
4. **Recommandation (§9)** : conserver la situation actuelle (option A), qui répond à « gratuite ». Trois ajustements à coût nul sont possibles : choisir un hébergeur compatible avec un dépôt privé, surveiller les quotas et préserver la réversibilité du transport de synchronisation. Remplacer Google Play par l'installation directe de l'APK économiserait 25 USD, au prix de mises à jour manuelles : à trancher par le commanditaire (QC-3).
5. **Sept questions fermées** sont posées au commanditaire (§10). La première est décisive : la motivation est-elle le **coût**, l'**indépendance vis-à-vis des services en ligne**, ou les deux ?

---

## 2. Cadre de l'étude

### 2.1 Deux lectures de la demande
| Lecture | Ce que cela exige | Options concernées |
|---|---|---|
| **L1 : « gratuit »** | Coût initial et récurrent nul ou négligeable ; risque faible de devenir payant | A, D, E, F et leurs combinaisons |
| **L2 : « sans cloud »** | Aucune donnée de l'application conservée ou transitant chez un tiers en ligne ; au plus, des appareils et du matériel du commanditaire | B, C, E ; conséquences sur Google Calendar (§4) |

L'étude traite les deux lectures. La question QC-1 (§10) permet au commanditaire de préciser la sienne.

### 2.2 Exigences et décisions qui servent de grille
| Réf. | Contenu | Rôle dans l'étude |
|---|---|---|
| Q-DEM001-3 b, RG-020, CdC §4.3 | Données dans « mon propre espace de stockage en ligne », le Google Drive du compte. Conservation ailleurs **exclue**. | Critère « données à moi » |
| RG-017, DEC-014 | Délai d'une heure entre appareils ouverts et connectés, sinon dès l'ouverture | Critère « délai d'une heure » |
| RG-021, DEC-002, DEC-013 | Hors ligne sur smartphone et PC | Critère « hors ligne » |
| RG-019, CdC §4.3 | Application inutilisable sans compte Google (usage sans compte **exclu**) | Touché par B, C et D |
| RG-012 à RG-014, RG-033, RG-034, RG-037 ; EX-06 | Rappels 8 h et 21 h et créneaux dans l'agenda Google principal ; capacité lue dans l'agenda ; créneau déplacé détecté | Point clé (§4) |
| V-23 (DEC-018) | Synchronisation avec d'autres agendas que Google Calendar **exclue** | Touché par C (CalDAV) |
| DEC-001, 005, 006, 007, 008, 009, 013, 014 | Android ; Google Play, test interne ; hébergement statique gratuit ; aucun serveur ; pas de vérification Google ; dossier Drive visible ; PC hors ligne ; délai d'une heure | Décisions susceptibles d'être remises en cause (§9.3) |

Critère supplémentaire, qui n'est pas une exigence écrite mais découle de l'usage : **accès hors du domicile**. Le smartphone est l'appareil prioritaire (ENF-01) et sert par nature hors de chez soi.

---

## 3. Inventaire : ce qui est « cloud » aujourd'hui et ce que ça coûte

Hypothèses de volumétrie pour un utilisateur seul :
- état synchronisé inférieur à 5 Mo non compressé à 5 ans (ENF-T-05). Compressé, environ 1 Mo par fichier d'appareil (estimation : taux de compression usuel d'un JSON, non mesuré) ;
- appels Drive : une interrogation toutes les 2 min au premier plan, plus un dépôt après chaque modification. Pour 3 h d'usage par jour, cela fait environ 100 à 300 appels par jour ;
- appels Calendar (lots ultérieurs) : quelques dizaines à quelques centaines par jour (DAT §4.4.5).

| Service | Rôle | Coût actuel | Volumétrie prévisible | Statut | Risque de coût |
|---|---|---|---|---|---|
| **Google Drive** (compte du commanditaire) | Support de synchronisation, copie de référence | Gratuit : 15 Go **partagés** entre Gmail, Drive et Photos [S12] | Moins de 10 Mo pour deux appareils à 5 ans, soit moins de 0,1 % du quota. Les **révisions** conservées par Drive comptent aussi : au pire quelques centaines de Mo, si Drive conserve jusqu'à 100 révisions par fichier pendant 30 jours **(règle non vérifiée dans cette étude ; point à contrôler au test technique)**. | **Gratuit** | **Faible pour l'application, réel pour le compte.** Si Gmail ou Photos saturent les 15 Go, les dépôts échouent et la synchronisation s'arrête. Le seul remède serait alors un abonnement Google One (100 Go : 1,99 € par mois en France, **prix 2026 non vérifié**) [S12]. Ce coût ne serait pas causé par l'application. |
| **API Google Drive et API Google Calendar** | Accès programmatique | Gratuit sous un seuil quotidien par projet [S6][S7] | Quelques centaines d'appels par jour, très loin des seuils (Calendar : 10 000 requêtes par minute par projet et 600 par minute par utilisateur pour les projets créés depuis mai 2026 [S7] ; seuil quotidien non confirmé sur la page officielle) | **Gratuit** | **Faible, mais nouveau.** Google annonce pour « plus tard en 2026 » une facturation **au-delà** d'un seuil quotidien standard, avec un préavis d'au moins 90 jours [S6][S7][S8]. Pour un utilisateur seul, l'écart avec le seuil est de plusieurs ordres de grandeur. La facturation suppose en outre un compte de facturation, que le projet n'a pas. |
| **Google Identity** (OAuth 2.0) | Connexion, autorisations | Gratuit | Négligeable | **Gratuit** | Nul |
| **Projet Google Cloud** (clients OAuth, écran de consentement) | Configuration de l'accès | Gratuit ; aucun compte de facturation n'est nécessaire pour Drive, Calendar et OAuth **(constat d'usage, non vérifié sur une page officielle dans cette étude)** | — | **Gratuit** | Faible : voir la ligne « API » ci-dessus |
| **Google Calendar** (lots ultérieurs) | Rappels 8 h et 21 h, créneaux, lecture des disponibilités | Gratuit (compte personnel) | Deux séries récurrentes, au plus quelques créneaux par jour | **Gratuit** | Nul |
| **Hébergement statique de la PWA** (DEC-006) | Distribuer la version PC | Gratuit. **GitHub Pages** : gratuit pour un dépôt **public**, sinon GitHub Pro (4 USD par mois) [S10]. **Cloudflare Pages** : gratuit, dépôt privé possible, 500 constructions par mois, bande passante statique illimitée [S11]. | Quelques Mo, quelques visites par jour | **Gratuit** | **Faible**, à une condition : si le dépôt de code est privé, GitHub Pages devient payant. Il faut alors choisir Cloudflare Pages, ou une construction en intégration continue suivie d'un dépôt chez un hébergeur gratuit. |
| **Google Play**, piste de test interne (DEC-005) | Distribuer l'application Android, mises à jour automatiques | **25 USD, une seule fois** [S4] | Un testeur (le commanditaire) ; jusqu'à 100 testeurs possibles en test interne [S4] | **Payant, une seule fois** | Nul ensuite. La règle des 12 testeurs pendant 14 jours ne s'applique qu'au passage en **production** des nouveaux comptes personnels, pas au test interne [S3] (une source isolée affirme le contraire ; elle contredit les autres et la page d'aide de Google). |
| **GitHub Actions** (intégration continue, si le dépôt est sur GitHub : PO-7) | Construire, tester, déployer | Gratuit pour un dépôt public. Pour un dépôt privé, un quota de minutes est inclus dans le plan gratuit (2 000 min par mois : **chiffre non revérifié**) ; quotas inchangés par la réforme tarifaire de 2026 [S9] | Environ 15 min par exécution (construction de l'APK incluse), 40 à 80 exécutions par mois : 600 à 1 200 min | **Gratuit** | Faible. Sans moyen de paiement enregistré, le dépassement bloque les exécutions au lieu de les facturer **(non vérifié)**. Depuis mars 2026, les exécuteurs auto-hébergés sont facturés 0,002 USD par minute pour les dépôts privés [S9]. |
| **Domaine personnalisé** | Non prévu en v1 (DEC-006) | 0 € (environ 10 à 15 € par an si le repli R11 l'exige) | — | Non utilisé | Conditionnel au résultat du test R11 |

**Bilan de l'option A** : **25 USD une fois, 0 € par an**. Deux risques de coût existent, tous deux faibles :
- la facturation annoncée des API Google au-delà d'un seuil, dont nous restons très loin ;
- la saturation des 15 Go du compte par d'autres usages que l'application.

---

## 4. Point clé : rappels et créneaux sans cloud

Les lots ultérieurs prévoient quatre fonctions d'agenda. Elles ne posent pas le même problème.

| Fonction | Pourquoi elle utilise un service en ligne aujourd'hui | Équivalent sans cloud | Perte fonctionnelle |
|---|---|---|---|
| **Rappels 8 h et 21 h** (RG-012 à RG-014) | Google Calendar notifie même si l'application n'a pas été ouverte depuis des jours (EX-06) | **Notifications locales Android**, programmées à l'avance de J à J+7. C'est déjà le mécanisme de secours prévu (Q-38 b, DAT §5). | Faible sur smartphone. Le contenu est même **plus à jour**, car il est calculé sur l'appareil à l'heure du rappel. En revanche : rien sur PC quand l'application est fermée ; rien sur une montre ou un autre appareil Google ; pas de rappel par courriel. Contrainte Android : depuis Android 14, l'autorisation d'alarme exacte est refusée par défaut [S15]. Il faut soit la faire accorder par l'utilisateur, soit accepter une fenêtre de quelques minutes, soit déclarer `USE_EXACT_ALARM`. Cette dernière permission est réservée par Google Play aux applications dont c'est la fonction principale, comme les réveils et les agendas [S16] ; hors Play, elle s'applique sans examen. |
| **Créneaux des tâches** (RG-034) | Ils doivent apparaître dans l'agenda que l'utilisateur consulte déjà | **(a)** Vue agenda dans l'application (jour, semaine). **(b)** Agenda **local** Android, géré par le fournisseur d'agenda du téléphone, sans compte en ligne, visible dans l'application Agenda du téléphone **(mécanisme documenté par Android, faisabilité avec Capacitor non vérifiée ; module natif à écrire)**. | Moyenne. Les créneaux ne sont plus mêlés aux autres rendez-vous de l'utilisateur, ou seulement sur le téléphone avec (b). Ils sont invisibles sur PC hors de l'application. |
| **Capacité lue dans l'agenda** (RG-033) | Les rendez-vous de l'utilisateur sont dans **son** Google Calendar | **Aucun** si l'agenda de l'utilisateur reste chez Google : lire ses rendez-vous, c'est lire un service en ligne. Variante : lire le fournisseur d'agenda du téléphone, qui contient une copie synchronisée de Google Calendar. L'application n'appelle alors aucune API Google, mais les données viennent toujours de Google. | **Forte** : la capacité devient purement déclarative (RG-011 et ses exceptions datées). Sinon, Google reste dans la boucle. |
| **Créneau déplacé** (RG-037) | Il est détecté dans Google Calendar | Avec (a), le déplacement se fait dans l'application : il n'y a rien à détecter. Avec (b), on observe localement le fournisseur d'agenda. | Faible avec (a), mais RG-037 perd son objet |

**Constat.** Tant que le commanditaire tient son agenda dans Google Calendar, « sans cloud » ne peut pas s'appliquer à la partie agenda : **l'agenda est lui-même un service en ligne**. Trois positions sont cohérentes :

| Position | Description | Effet |
|---|---|---|
| **R-a** (actuelle, ADR-006) | API Google Calendar depuis les deux appareils | Toutes les fonctions. Scope sensible et écran « application non vérifiée » (DEC-008). |
| **R-b** (variante à étudier, compatible avec toutes les options) | Sur le smartphone seulement, l'application écrit et lit Google Calendar **par le fournisseur d'agenda Android**, sans API ni scope OAuth. Android se charge de la synchronisation avec Google. | Toutes les fonctions sur le smartphone ; le PC ne fait qu'afficher. Plus d'écran « non vérifiée » et moins de dépendance au jeton (R2). Fonctionne hors ligne : Android synchronise plus tard. **Risques non vérifiés** : identifiants déterministes et marquage privé (ADR-006) plus difficiles par ce canal ; délai de synchronisation propre à Android. Un test technique serait nécessaire. Google reste le fournisseur de l'agenda. |
| **R-c** (sans cloud) | Notifications locales, agenda propre à l'application ou agenda local Android, capacité déclarative | RG-012 à RG-014 tenus sur le smartphone. RG-033 et RG-037 à réécrire. EX-06 tenu sur le smartphone. |

---

## 5. Options

Pour chaque option, la conformité est notée ainsi : ✔ conforme, ◐ partiellement conforme, ✘ non conforme.

### Option A : situation actuelle (Google Drive personnel, gratuit)
- **Principe** : DAT v0.6. Chaque appareil écrit son fichier d'état dans le dossier « Done Juan » du Drive du commanditaire (ADR-003). La PWA est servie par un hébergement statique gratuit. L'APK passe par la piste de test interne de Google Play.
- **Coût** : 25 USD une fois ; 0 € par an (§3).

| Délai 1 h | Hors ligne | Données « à moi » (Q3 b) | Hors domicile |
|---|---|---|---|
| ✔ (limites F1 et F14 déjà validées) | ✔ | ✔ : c'est la formulation même de Q3 b | ✔ |

- **Agenda** : R-a, ou R-b si l'on veut supprimer l'écran « non vérifiée ».
- **Complexité et risques** : connus et instruits (DAT §10). Risques propres au coût : facturation annoncée des API au-delà d'un seuil (très improbable à notre échelle) ; saturation du quota de 15 Go par d'autres usages.
- **Lot 1, R1 et R2** : aucun effet. Le test R1/R2 reste nécessaire et bloquant avant E9.

### Option B : zéro cloud tiers (synchronisation directe smartphone ↔ PC)
Atout commun aux variantes : la conception d'ADR-003, **un fichier par appareil et un seul écrivain**, est indépendante du transport. Le port `TransportSynchro` permet de remplacer Drive par un dossier local sans toucher au domaine ni au moteur de fusion. Changer de transport revient donc à changer d'adaptateur, pas d'architecture.

**B1 : pair à pair sur le Wi-Fi du domicile (développement propre)**
- **Principe** : l'application Android découvre le PC sur le réseau local par mDNS, s'y authentifie après un appairage par QR code et échange les fichiers d'état.
- **Contrainte forte** : une PWA dans un navigateur ne peut ni écouter un port ni faire de découverte mDNS. Le PC doit donc devenir une **application installée** (option E1), qui embarque un petit serveur local. Sinon, il faut WebRTC, qui demande un serveur de signalisation, donc un service en ligne.
- **Coût** : 0 €. Effort de développement élevé : appairage, chiffrement sur le réseau local sans certificat public, découverte, pare-feu Windows, reprise.
- **Conformité** : délai 1 h ◐ (seulement si les deux appareils sont à la maison et l'application ouverte des deux côtés) ; hors ligne ✔ ; données à moi ✔✔ ; hors domicile ✘.
- **Risque** : élevé. C'est un protocole réseau maison, sur lequel repose la sécurité.

**B2 : outil de synchronisation de fichiers local, de type Syncthing**
- **Principe** : Syncthing tourne sur le smartphone et sur le PC et synchronise un dossier. L'application écrit son fichier d'état dans ce dossier et lit ceux des autres appareils. Sur Android, l'accès au dossier passe par le sélecteur de dossier du système, avec une autorisation persistante. Sur PC, il passe par l'API File System Access de Chrome et Edge, dont l'autorisation est **conservée** pour une PWA installée depuis Chrome 122 [S17]. La PWA peut donc rester une PWA.
- **État de Syncthing sur Android** : l'application officielle a été abandonnée. Un fork communautaire, **Syncthing-Fork**, est maintenu par de nouveaux mainteneurs depuis début 2026, et distribué sur F-Droid et Google Play [S13][S14]. Il dépend d'un projet communautaire sans garantie de pérennité.
- **Cloud ?** Par défaut, Syncthing utilise des serveurs de découverte et de relais publics, gérés par la communauté. Les données y transitent **chiffrées de bout en bout** et n'y sont pas conservées. On peut les désactiver pour un fonctionnement strictement local, mais on perd alors l'accès hors domicile.
- **Coût** : 0 €. Effort moyen : nouvel adaptateur de transport, gestion des autorisations de dossier, guide d'installation et d'appairage de Syncthing pour le commanditaire.
- **Conformité** :
  - délai 1 h ◐ : Syncthing doit tourner sur les deux appareils, et Android peut l'arrêter pour économiser la batterie ;
  - hors ligne ✔ ;
  - données à moi ✔✔ ;
  - hors domicile ◐ : possible par les relais publics, donc par un tiers qui ne conserve rien ; impossible en mode strictement local.
- **Risques** : moyens. Logiciel tiers à installer et à maintenir par l'utilisateur ; conflits Syncthing en cas de modification manuelle (sans effet sur nos fichiers à écrivain unique) ; RG-044 à réinterpréter pour un dossier local ; pérennité du fork.
- **Sauvegarde** : il n'y a plus de copie hors du domicile. Si le téléphone et le PC sont perdus ensemble (incendie, cambriolage), tout est perdu. Une copie manuelle sur un support externe serait à prévoir.

**B3 : câble ou export manuel**
- **Principe** : export d'un fichier, puis import sur l'autre appareil, par câble USB, carte ou partage local.
- **Coût** : 0 €.
- **Conformité** : délai 1 h ✘ (dépend d'un geste manuel) ; hors ligne ✔ ; données à moi ✔✔ ; hors domicile ✘.
- **Verdict** : contraire à RG-017. Intérêt seulement comme **sauvegarde ou secours**, en complément de toute autre option.

**Effets communs aux variantes de B**
- **Agenda** : R-c pour rester sans cloud, R-a ou R-b si Google Calendar est conservé.
- **Lot 1** :
  - le compte Google ne sert plus à rien au lot 1. RG-019 et l'exclusion « usage sans compte Google » sont à rouvrir ;
  - US-022 (connexion) devient sans objet, ou est reportée au lot « Rappels » ;
  - US-017 est à réécrire : transport, RG-020, RG-044 (fichiers Drive modifiés à la main), RG-058 ;
  - environ 116 lignes de scénarios Gherkin mentionnent Drive, dans 5 fichiers (surtout US-017 et US-022) ;
  - US-001 à US-003, US-023 à US-025, US-018 et US-031 sont peu touchées sur le fond.
- **R1 et R2** : **sans objet** pour le lot 1, puisqu'il n'y a plus d'API Google. Un autre test technique les remplace : autorisations de dossier Android et PC, comportement de Syncthing-Fork en arrière-plan.

### Option C : auto-hébergement chez le commanditaire
- **Principe** : un appareil allumé en permanence sert de **pair toujours disponible**. Selon le cas, c'est un nœud Syncthing (le plus simple et cohérent avec B2) ou un serveur WebDAV (transport par fichiers, compatible ADR-003). Une base synchronisée (CouchDB) imposerait de refaire ADR-003 : déconseillé. L'agenda reste Google Calendar (R-a ou R-b), ou devient un serveur CalDAV auto-hébergé, ce que V-23 exclut aujourd'hui.

| Matériel | Coût initial | Consommation | Électricité par an (0,20 € par kWh [S20]) |
|---|---|---|---|
| Raspberry Pi 5, 4 Go, avec alimentation, boîtier et stockage | Environ 150 à 200 €. La carte seule est passée à environ 110 USD en 2026, à cause de la hausse du prix de la mémoire ; 8 Go : 175 USD [S18]. Les accessoires ne sont pas vérifiés. | Environ 3 W au repos (mesures de 2,7 à 4 W) [S19] | **Environ 5 à 9 €** |
| NAS du commerce, deux baies, avec disques | Environ 300 à 500 € **(non vérifié)** | Environ 10 à 20 W **(non vérifié)** | Environ 18 à 35 € |
| PC du commanditaire allumé en permanence | 0 € | Environ 30 à 60 W au repos **(ordre de grandeur, non vérifié)** | **Environ 53 à 105 €**, soit plus qu'un abonnement Google One |

- **Accès hors domicile** :
  - **Tailscale** (réseau privé maillé) : offre gratuite « Personal », jusqu'à 6 utilisateurs et appareils illimités depuis avril 2026, réservée à un usage non commercial [S21]. Le serveur de coordination est un service en ligne tiers ; les données ne transitent par ses relais que chiffrées. Il faut une application VPN active en permanence sur le téléphone, ce qui empêche d'utiliser un autre VPN ;
  - **ouverture d'un port avec un domaine dynamique et un certificat** : exposition directe à Internet, avec un risque de sécurité réel pour un matériel personnel. **Déconseillé** ;
  - **Syncthing avec relais publics** : voir B2.
- **Conformité** : délai 1 h ✔ (le pair est toujours allumé) ; hors ligne ✔ ; données à moi ✔✔, ce qui correspond à la réponse Q-DEM001-3 **c** et non b ; hors domicile ◐ (Tailscale ou relais, tiers sans stockage).
- **Complexité et risques** : élevés pour le commanditaire. Il doit installer et mettre à jour le système, faire les **sauvegardes** (carte SD défaillante) et gérer la sécurité. Chrome restreint aussi l'accès d'une page web publique à des adresses du réseau local (« Private Network Access », **comportement 2026 non vérifié**), ce qui rendrait fragile une PWA hébergée en ligne qui parle à un NAS : préférer B2 ou E1.
- **DEC-007** : aucun serveur **développé** par le projet. Un nœud Syncthing chez le commanditaire n'est pas un serveur applicatif, mais l'exclusion du CdC §4.3 (« serveur exploité pour le compte de l'utilisateur ») est à relire avec le commanditaire.
- **Lot 1, R1 et R2** : mêmes effets que B.

### Option D : autres services gratuits
| Service | Offre gratuite | Limites | Changement de conditions observé |
|---|---|---|---|
| **Firebase**, plan Spark (base Firestore) | 1 Gio stockés, 50 000 lectures et 20 000 écritures par jour [S22] | Service **coupé** jusqu'à la fin du mois en cas de dépassement [S22]. Données dans une base, invisibles comme fichiers. Le projet devrait appartenir au compte du commanditaire pour rester « à lui ». | Cloud Storage retiré du plan gratuit le 3 février 2026 [S22] |
| **Supabase**, offre gratuite | 500 Mo de base, 2 projets [S23] | **Mise en pause après une semaine d'inactivité**, avec réactivation manuelle [S23] : incompatible avec des vacances sans usage | — |
| **Dropbox Basic** | 2 Go [S24] | **3 appareils au maximum** [S24] (suffisant pour un téléphone et un PC) | Limite de 3 appareils introduite en 2019 [S24] |
| **OneDrive** | 5 Go [S24] (non confirmé sur le site de Microsoft) | API Microsoft Graph, second fournisseur d'identité | — |

- **Coût** : 0 €.
- **Conformité** : délai 1 h ✔ ; hors ligne ✔ ; données à moi ◐ (espace en ligne à lui, mais chez un **second** fournisseur, alors que Q3 b et RG-020 citent le Google Drive) ; hors domicile ✔.
- **Agenda** : inchangé (Google), donc **deux** fournisseurs en ligne au lieu d'un.
- **Complexité et risques** :
  - D n'apporte **rien** par rapport à A pour la lecture L1, puisque A est déjà gratuit ;
  - D est contraire à la lecture L2, puisque c'est toujours du cloud ;
  - Firebase ou Supabase imposent de refaire ADR-003 et d'écrire des règles de sécurité ;
  - Dropbox ou OneDrive reproduisent A chez un autre fournisseur ;
  - les offres gratuites changent : voir la dernière colonne, à laquelle s'ajoutent la facturation annoncée des API Google et la hausse des prix du Raspberry Pi.
- **Lot 1** : US-017 et US-022 à réécrire. R1 remplacé par un test équivalent chez le nouveau fournisseur ; R2 inchangé si l'identité reste Google.
- **Verdict** : **déconseillé**.

### Option E : version PC sans hébergement
**E1 : application de bureau installée (Tauri)** — option F d'ADR-001, déjà identifiée comme évolution possible.
- **Coût** : 0 €. Sans certificat de signature de code (payant, **prix non vérifié**), Windows affiche un avertissement SmartScreen à l'installation, ce qui est acceptable pour un utilisateur seul.
- **Gains techniques** :
  - client OAuth « bureau » avec PKCE et jeton conservé dans le trousseau du système : cela **résout R3**, le renouvellement silencieux sur PC (F14) ;
  - plus de script Google Identity Services : **R12 sans objet** ;
  - base SQLite dans un fichier : **R15 sans objet**, plus d'éviction par le navigateur ;
  - écoute du réseau local possible, ce qui est indispensable pour B1 ;
  - notifications système possibles si l'application tourne en tâche de fond.
- **Coûts techniques** :
  - deuxième chaîne de construction : Rust, installeur Windows ;
  - mises à jour à organiser. Le module de mise à jour de Tauri a besoin d'un emplacement de publication ; une page de publication GitHub suffit, mais c'est un service en ligne. Sinon, réinstallation manuelle.
- **Conformité** : identique à l'option de synchronisation associée ; **hors ligne du PC renforcé**.
- **Lot 1** : US-031 conservée sur le fond. Les critères liés au navigateur (stockage persistant, « effacer les données de navigation ») sont à adapter. Le test R11 change d'objet : écran de consentement d'un client de bureau.

**E2 : PWA servie par le PC lui-même (`localhost`)**
- **Principe** : un petit serveur local sert les fichiers de la PWA ; `localhost` est un contexte sécurisé pour le navigateur.
- **Limites** :
  - il faut un programme installé qui lance ce serveur au démarrage : on retombe sur une installation comme E1, avec moins d'avantages ;
  - l'origine `http://localhost` est autorisée pour les clients OAuth web en développement ; son acceptation en production est **non vérifiée** ;
  - variante « installer une fois puis laisser le service worker servir hors ligne » : fragile, car chaque mise à jour demande de relancer le serveur.
- **Verdict** : **déconseillé**. E1 est préférable.

**Note** : l'hébergement statique actuel coûte 0 €. E n'a donc d'intérêt que pour la lecture L2, ou pour ses gains techniques (R3, R12, R15).

### Option F : distribution Android gratuite
**Règles de vérification des développeurs Android en vigueur (vérifiées le 2026-10-21)** [S1][S2][S5]
- Les applications installées sur un appareil Android certifié doivent provenir d'un développeur enregistré et vérifié, **y compris hors de Google Play**.
- Application effective depuis le **30 septembre 2026** au Brésil, en Indonésie, à Singapour et en Thaïlande. **Monde entier, dont la France, en 2027**, sans date précise publiée [S25].
- **Compte de « distribution limitée »** (étudiants, amateurs), ouvert depuis août 2026 : **gratuit**, sans pièce d'identité, jusqu'à **20 appareils** explicitement autorisés. Il exige un compte Google avec validation en deux étapes et un profil de paiement Google [S2].
- Pour les applications **non enregistrées**, l'utilisateur dispose d'un parcours avancé, avec un délai d'attente unique de 24 h selon une source [S1]. Les installations par **ADB**, câble et outils de développement, en sont **exemptées** [S2].
- Les développeurs Google Play sont déjà vérifiés par la Play Console : DEC-005 n'est pas concerné.

| Variante | Coût | Mises à jour | En France jusqu'en 2027 | En France à partir de 2027 | Verdict |
|---|---|---|---|---|---|
| **F0 : Google Play, test interne** (DEC-005) | 25 USD une fois | Automatiques | ✔ | ✔ | Le plus simple |
| **F1 : APK installé directement** (téléchargé ou par câble) | 0 € | **Manuelles**, ou par un outil tiers qui surveille une page de publication (non étudié) | ✔ (« sources inconnues ») | ✔ avec un compte de distribution limitée gratuit, ou par ADB | Possible : économise 25 USD contre des mises à jour manuelles et une démarche de vérification |
| **F2 : F-Droid, dépôt principal** | 0 € | Automatiques par F-Droid | — | — | **Inadapté** : F-Droid exige un code libre construit par ses soins et refuse les dépendances propriétaires. Or l'authentification Android repose sur Google Play services (Credential Manager, AuthorizationClient). F-Droid s'oppose par ailleurs publiquement à la vérification des développeurs [S26]. |
| **F3 : dépôt F-Droid personnel** (index hébergé gratuitement) | 0 € | Automatiques par le client F-Droid | ✔ | Mêmes règles que F1 | Complexité sans gain notable sur F1 pour un utilisateur seul |

- **Clé de signature** : en F1 et F3, la clé de signature de l'application est à conserver précieusement. Le client OAuth Android est lié à son empreinte SHA-1, et sa perte imposerait de désinstaller l'application, donc de perdre les modifications non déposées.
- **Lot 1** : aucun effet sur les US. ENF-07 (distribution) est à adapter.
- **R1 et R2** : aucun effet. Le protocole utilise déjà un APK de débogage, sans Play Console.

---

## 6. Combinaisons possibles

| Combinaison | Composition | Coût initial | Coût annuel | Services en ligne à l'exécution |
|---|---|---|---|---|
| **K0 : actuel** | A + R-a + PWA hébergée + F0 | 25 USD | 0 € | Google (compte du commanditaire), hébergeur statique |
| **K1 : zéro coût strict** | A + R-a (ou R-b) + PWA sur Cloudflare Pages + F1 | 0 € | 0 € | Google, hébergeur statique |
| **K2 : aucun tiers hors Google** | A + R-a (ou R-b) + **E1 (Tauri)** + F0 | 25 USD | 0 € | Google seulement. La construction peut rester sur GitHub Actions : ce service n'intervient pas à l'exécution. |
| **K3 : zéro cloud** | **B2 en mode local** + **R-c** + PWA avec File System Access, ou E1 + F1 | 0 € | 0 € | **Aucun** |
| **K4 : zéro cloud, hors domicile** | B2 avec relais Syncthing **ou** C (Raspberry Pi et Tailscale) + R-c + E1 + F1 | 0 € (B2) ou environ 150 à 200 € (C) | 0 € (B2) ou environ 5 à 9 € (C) | Relais Syncthing ou coordination Tailscale : tiers sans stockage, données chiffrées |

### Tableau de synthèse

| Critère | **A / K0** | K1 | K2 | B1 | B2 / K3 | C / K4 | D | B3 |
|---|---|---|---|---|---|---|---|---|
| Coût initial | 25 USD | 0 € | 25 USD | 0 € | 0 € | 150 à 200 € (Raspberry Pi) | 0 € | 0 € |
| Coût annuel | 0 € | 0 € | 0 € | 0 € | 0 € | 5 à 9 € (Raspberry Pi) ; 53 à 105 € (PC allumé) | 0 € | 0 € |
| Délai 1 h | ✔ | ✔ | ✔ | ◐ domicile | ◐ | ✔ | ✔ | ✘ |
| Hors ligne | ✔ | ✔ | ✔✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Données « à moi » (Q3 b) | ✔ | ✔ | ✔ | ✔✔ | ✔✔ | ✔✔ (Q3 c) | ◐ | ✔✔ |
| Hors domicile | ✔ | ✔ | ✔ | ✘ | ✘ en local ; ◐ avec relais | ◐ | ✔ | ✘ |
| Rappels et créneaux Google Calendar | ✔ | ✔ | ✔ | R-c | R-c | R-c ou Google | ✔ | R-c |
| Complexité et risque technique | Connus | Faibles | Moyens | **Élevés** | Moyens | **Élevés** (exploitation) | Moyens | Faibles |
| Effet sur le lot 1 validé | Aucun | Aucun | US-031 adaptée | US-017, 022 à refaire | US-017, 022 à refaire | US-017, 022 à refaire | US-017, 022 à refaire | Contraire à RG-017 |
| Test R1/R2 | Requis | Requis | Requis (R11 et R12 changent) | Remplacé | Remplacé | Remplacé | Remplacé (R1) | — |
| Risque de changement de conditions | Faible (API Google, quota de 15 Go) | Faible, plus vérification des développeurs en 2027 | Faible | Nul | Pérennité du fork Syncthing | Tailscale ; prix du matériel | **Élevé** | Nul |

---

## 7. Analyse des risques transverses

| Id | Risque | Options | Parade |
|---|---|---|---|
| ET-1 | Facturation des API Google Workspace au-delà d'un seuil quotidien, annoncée pour fin 2026 avec un préavis de 90 jours | A, K0 à K2 | Volumétrie inférieure de plusieurs ordres de grandeur au seuil. Aucun compte de facturation sur le projet, donc pas de facturation possible sans action du commanditaire **(à confirmer à la publication des conditions)**. Veille. |
| ET-2 | Quota de 15 Go du compte saturé par Gmail ou Photos | A, K0 à K2 | Message d'erreur explicite à l'échec d'un dépôt (`storageQuotaExceeded`) ; contrôle des révisions conservées (§3) |
| ET-3 | Le dépôt de code privé rend GitHub Pages payant | K0, K2 | Cloudflare Pages, ou dépôt public (QC-7) |
| ET-4 | Vérification des développeurs Android en 2027 | K1, K3, K4 | Compte de distribution limitée gratuit, ou installation par ADB |
| ET-5 | Pérennité de Syncthing sur Android | K3, K4 | Le transport reste derrière un port et peut être remplacé |
| ET-6 | Perte simultanée des appareils, sans copie hors du domicile | B, C | Export manuel régulier (B3) sur un support externe |

---

## 8. Ce que l'architecture actuelle préserve déjà (réversibilité)
- **Format des données indépendant du transport** (ADR-003) : un fichier par appareil, un seul écrivain, fusion CRDT. Ce format fonctionne à l'identique dans un dossier Drive, un dossier Syncthing, un partage WebDAV ou un support amovible.
- **Port `TransportSynchro`** (DAT §2.4) : passer de A à B2 ou C revient à écrire un nouvel adaptateur, sans toucher au domaine, aux cas d'usage ni au moteur de fusion.
- **Notifications locales Android** : elles sont déjà prévues comme secours (Q-38 b, DAT §5). Elles constituent le socle de R-c.

On peut donc **décider maintenant de rester sur A** sans s'enfermer : une bascule ultérieure vers B2 resterait localisée, si l'on fait abstraction de la respécification fonctionnelle.

---

## 9. Recommandation

### 9.1 Recommandation de l'architecte
1. **Conserver l'option A (K0)** pour la lecture « gratuite ». Elle remplit déjà la demande : 25 USD une fois et 0 € par an, sans abonnement. Elle est la seule à satisfaire **simultanément** :
   - le délai d'une heure ;
   - le hors ligne ;
   - « mon espace » au sens de Q3 b ;
   - l'accès hors domicile ;
   - les rappels et créneaux Google Calendar.

   Elle ne remet en cause aucune décision et laisse le lot 1 validé intact.
2. **Trois ajustements à coût nul**, qui ne demandent pas d'arbitrage s'ils restent dans DEC-006 :
   - choisir l'hébergeur de la PWA selon la visibilité du dépôt : GitHub Pages si le dépôt est public, Cloudflare Pages s'il est privé ;
   - au test technique R1/R2, mesurer le volume des révisions Drive (ET-2) ;
   - consigner au DAT, lors de sa prochaine version, la veille sur la facturation des API (ET-1).
3. **Google Play contre APK direct** : je recommande de **garder Google Play** (F0). Les 25 USD, payés une seule fois, achètent les mises à jour automatiques et évitent la démarche de vérification de 2027. Si le commanditaire exige un coût strictement nul, l'option K1 est viable : c'est sa décision (QC-3).
4. **Pour la lecture « sans cloud »** : si c'est la vraie motivation, la combinaison la moins risquée est **K3 ou K4 avec B2 (Syncthing)**, qui réutilise le format d'ADR-003. Je la déconseille cependant pour la v1 :
   - elle perd l'accès hors domicile, ou le confie à des relais tiers ;
   - elle perd les fonctions d'agenda Google ;
   - elle demande à l'utilisateur d'installer et de maintenir un logiciel tiers ;
   - elle impose de respécifier une partie du lot 1 validé (US-017, US-022, RG-019, RG-020).
5. **À étudier quelle que soit l'option, sans engagement** : la variante **R-b** (Google Calendar par le fournisseur d'agenda Android) pour le lot « Rappels ». Elle pourrait supprimer le scope sensible, donc l'écran « application non vérifiée » (DEC-008), et réduire la dépendance au jeton. Sa faisabilité est à vérifier par un test technique avant l'E3 de ce lot.

### 9.2 Ce qui n'est pas recommandé
- **B1** (pair à pair maison) : effort et risque de sécurité disproportionnés.
- **B3** seul : contraire à RG-017. Il ne vaut que comme sauvegarde.
- **D** (autres offres gratuites) : aucun gain par rapport à A, et un risque plus élevé de changement de conditions.
- **E2** (PWA servie par le PC) : E1 est préférable.
- **PC allumé en permanence** comme serveur : environ 53 à 105 € d'électricité par an, soit plus que toutes les autres options.

### 9.3 Décisions existantes remises en cause, selon l'option retenue
| Option | Décisions et règles à rouvrir par arbitrage |
|---|---|
| A, K0 | **Aucune** |
| K1 | **DEC-005** (Google Play, remplacé par l'APK direct) ; ENF-07 |
| K2 | **DEC-006** (hébergement statique, remplacé par une application installée) ; ADR-001 option F ; mise en œuvre de DEC-013 et US-031 ; ADR-004 (jetons du PC) |
| B, K3 | Réponse **Q-DEM001-3 b**, qui deviendrait d), et **RG-020** ; **DEC-009** (dossier Drive visible) ; **DEC-018** pour V-13 (dossier « Done Juan ») et l'extension de RG-044 aux fichiers Drive ; **RG-019** et l'exclusion « usage sans compte Google » ; portée de **DEC-014** (délai hors domicile) ; **DEC-008** sans objet si R-c ; RG-012 à RG-014, RG-033, RG-034, RG-037 et EX-06 (si R-c) ; ADR-002, 003 (transport), 004, 005, 006 et 007 |
| C, K4 | Comme B, avec Q-DEM001-3 qui deviendrait c) ; lecture de **DEC-007** et de l'exclusion « serveur exploité pour le compte de l'utilisateur » (CdC §4.3) ; **V-23** si un agenda CalDAV est retenu |
| D | **RG-020**, **DEC-009**, V-13 ; ADR-003 (Firebase ou Supabase) ; ADR-004 (autre fournisseur d'identité) |
| R-b (agenda, lot ultérieur) | ADR-005 et ADR-006 ; DEC-008 deviendrait sans objet. À traiter à l'E3 du lot « Rappels », pas maintenant. |

---

## 10. Questions fermées pour le commanditaire

| Id | Question | Réponses possibles | Recommandation |
|---|---|---|---|
| **QC-1** | Votre demande vise-t-elle surtout… | a) le **coût** (rien à payer) ; b) l'**indépendance** : aucune donnée chez un service en ligne, même Google ; c) les deux | — (détermine la suite) |
| **QC-2** | Acceptez-vous que vos données restent dans **votre Google Drive personnel**, comme aujourd'hui (réponse Q-DEM001-3 b) ? | Oui / Non | **Oui** |
| **QC-3** | Les **25 USD, payés une seule fois**, pour Google Play (mises à jour automatiques) vous conviennent-ils ? | a) oui, garder Google Play ; b) non, installer l'APK directement, avec des mises à jour manuelles | **a)** |
| **QC-4** | Une modification faite sur le smartphone **hors de chez vous** doit-elle apparaître sur le PC dans l'heure ? | Oui / Non, au retour à la maison suffit | — (si non, B2 devient envisageable) |
| **QC-5** | Pour les rappels et les créneaux des lots suivants, préférez-vous… | a) **Google Calendar** (prévu) ; b) des notifications du smartphone et un agenda dans l'application, sans Google Calendar | **a)** |
| **QC-6** | Êtes-vous prêt à installer et entretenir vous-même un logiciel ou un matériel de synchronisation (Syncthing, Raspberry Pi) ? | Oui / Non | — (seulement si QC-1 b ou c) |
| **QC-7** | Le code source de l'application peut-il être **public** (hébergement et intégration continue gratuits chez GitHub) ? | Oui / Non, privé (hébergement gratuit chez Cloudflare) | Indifférent pour le coût ; aucun secret n'est dans le code |
| **QC-8** *(ajoutée en v2, après DEC-021)* | La **clé de signature** de l'application Android peut-elle être conservée, chiffrée, dans les secrets de GitHub, pour que chaque version soit signée automatiquement ? Vous en gardez de toute façon une copie de sauvegarde hors ligne. | a) oui, signature automatique ; b) non, la clé reste chez vous seulement et chaque version est signée sur un poste local | **a)**, avec une sauvegarde hors ligne obligatoire |
| **QC-9** *(ajoutée en v2, à trancher avant l'application de la vérification des développeurs en France, en 2027)* | Pour continuer à installer l'APK simplement, acceptez-vous d'enregistrer l'application dans un **compte gratuit « distribution limitée »** de Google, lié à votre compte Google (validation en deux étapes et profil de paiement requis, sans frais) ? | a) oui ; b) non, installation par câble (ADB) à chaque mise à jour | **a)** |

Lecture rapide des réponses :
- QC-1 a) et QC-2 oui : on reste sur A (K0, ou K1 selon QC-3), sans changement d'architecture ;
- QC-1 b) ou c) avec QC-2 non : il faut un arbitrage sur K3 ou K4, puis une analyse d'impact complète sur le lot 1 (E3 à rouvrir), avec QC-4 à QC-6.

---

## 11. Sources

Recherches effectuées le 2026-10-21. Les pages officielles de Google n'ont pas toutes pu être consultées directement ; les sources secondaires sont signalées.

| Id | Source | Objet |
|---|---|---|
| S1 | [Android Authority : calendrier des changements de chargement latéral](https://www.androidauthority.com/android-sideloading-changes-timeline-3679204/) ; [Android Developers Blog, mars 2026](https://android-developers.googleblog.com/2026/03/android-developer-verification.html) | Vérification des développeurs, parcours avancé |
| S2 | [Aide Android Developer Console : comprendre la vérification](https://support.google.com/android-developer-console/answer/16561738?hl=en) ; [documentation AndroidAPS](https://androidaps.readthedocs.io/en/latest/SettingUpAaps/AndroidDeveloperVerification.html) ; [Doply](https://www.doply.io/en/blog/android-developer-verification-explained) | Compte de distribution limitée (gratuit, 20 appareils), exemption ADB |
| S3 | [Aide Play Console : exigences de test des nouveaux comptes personnels](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB) ; [Android Authority](https://androidauthority.com/google-play-app-testing-requirement-3510580) | 12 testeurs pendant 14 jours avant la production |
| S4 | [Aide Play Console : inscription (25 USD)](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en) ; [FAQ inEvent (100 testeurs internes)](https://faq.inevent.com/l/en/inevent-live/social-and-enterprise-stores-google-play) | Frais d'inscription, test interne |
| S5 | [Wikipedia : Keep Android Open](https://en.wikipedia.org/wiki/Keep_Android_Open) ; [Median](https://median.co/blog/android-developer-verification-2026) | Contexte de la vérification |
| S6 | [Google : limites d'usage de l'API Drive](https://developers.google.com/workspace/drive/api/guides/limits) ; [limites de l'API Docs](https://developers.google.com/workspace/docs/api/limits) | Seuil quotidien, facturation annoncée pour fin 2026 |
| S7 | [Google : limites d'usage de l'API Calendar](https://developers.google.com/calendar/pricing) ; [Nylas](https://cli.nylas.com/guides/google-calendar-api-quotas) | Quotas par minute, préavis de 90 jours |
| S8 | [Google Workspace : modèle standardisé pour les API](https://developers.google.com/workspace/tools-safety?hl=en) | Facturation au-delà des seuils |
| S9 | [heise : GitHub Actions, dépôts privés](https://heise.de/-11118027) ; [IT Brief](https://itbrief.co.uk/story/github-cuts-actions-runner-prices-adds-new-usage-fee) | Tarifs 2026, quotas gratuits inchangés |
| S10 | [Documentation GitHub : plans](https://docs.github.com/en/enterprise-server@latest/get-started/learning-about-github/githubs-plans) ; [smartscope (2026)](https://smartscope.blog/Tips/GitHub/github-pages-private-repository/) ; [Capital & Compute](https://capitalandcompute.net/blog/github-pricing-plans-cost/) | GitHub Pages et dépôt privé ; GitHub Pro à 4 USD par mois |
| S11 | [Cloudflare : limites de Pages](https://developers.cloudflare.com:8443/pages/platform/limits) ; [flaviocopes, septembre 2026](https://flaviocopes.com/hosting-free-tiers.md) | 500 constructions par mois, bande passante statique |
| S12 | [Kulturegeek : Google One](https://kulturegeek.fr/news-139426/google-presente-google-one-revoit-prix-stockage-ligne) ; [9to5Google](https://9to5google.com/?p=256499) | 15 Go partagés ; 100 Go à 1,99 € par mois (prix 2026 non confirmé) |
| S13 | [Privacy Guides : quel fork de Syncthing](https://discuss.privacyguides.net/t/which-syncthing-fork-should-one-use-after-the-projects-handover/34966/2.md) ; [BasicSync, ticket 1](https://github.com/chenxiaolong/BasicSync/issues/1) | Abandon de l'application officielle, reprise du fork |
| S14 | [F-Droid : Syncthing-Fork](https://f-droid.org/it/packages/com.github.catfriend1.syncthingfork/) | Version 2.1.x disponible |
| S15 | [Android 14 : alarmes exactes refusées par défaut](https://developer.android.com/about/versions/14/changes/schedule-exact-alarms) | `SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM` |
| S16 | [Aide Play Console : nouvelles règles](https://Support.Google.Com/googleplay/android-developer/answer/14554661) ; [Esper](https://www.esper.io/blog/android-13-exact-alarm-api-restrictions) | `USE_EXACT_ALARM` réservée aux applications dont c'est la fonction principale |
| S17 | [Chrome : autorisations persistantes pour File System Access](https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api) | PWA installée : accès conservé (Chrome 122) |
| S18 | [The Register, février 2026](https://www.theregister.com/2026/02/02/raspberry_pi_ram_shortage_price_hike/) ; [Gigazine, avril 2026](https://www.gigazine.net/gsc_news/en/20260402-raspberry-pi-price-increases) ; [OMG! Ubuntu, octobre 2026](https://www.omgubuntu.co.uk/2026/10/raspberry-pi-2gb-costs-how-much-now) | Prix du Raspberry Pi 5 en 2026 |
| S19 | [raspberry.tips : consommation (2026)](https://raspberry.tips/en/raspberrypi-tutorials/raspberry-pi-power-consumption-update-2026-all-models-compared) ; [forum Pimoroni](https://forums.pimoroni.com/t/pi-5-power-consumption/23959) | 2,7 à 4 W au repos |
| S20 | [Selectra : tarif bleu au 1er août 2026](https://selectra.info/energie/actualites/marche/nouveaux-prix-electricite-tarif-bleu-1er-aout-2026) ; [La Prime Énergie](https://www.laprimeenergie.fr/energie/comparateur-fournisseur-electricite/tarif) | Environ 0,20 € TTC par kWh, option Base |
| S21 | [Tailscale : tarifs](https://tailscale.com/pricing/) ; [Tailscale : offres](https://tailscale.com/plans/) | Offre Personal gratuite, 6 utilisateurs, usage non commercial |
| S22 | [Magora : tarifs Firebase (octobre 2026)](https://magora-systems.com/firebase-pricing/) ; [dev.to : Spark ou Blaze](https://dev.to/androve2k/spark-vs-blaze-the-firebase-pricing-guide-i-wish-id-read-sooner-onb) | Quotas Spark, coupure en cas de dépassement, Cloud Storage retiré |
| S23 | [Jetadmin : tarifs Supabase 2026](https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/) ; [Automation Atlas](https://automationatlas.io/answers/supabase-free-tier-limits-2026/) | 500 Mo, pause après une semaine d'inactivité |
| S24 | [Dropbox Basic](https://www.dropbox.com/en_GB/basic) ; [TidBITS, 2019](https://tidbits.com/2019/03/14/dropbox-limits-free-accounts-to-three-devices/) ; [Dupple, 2026](https://dupple.com/learn/google-drive-vs-onedrive-vs-dropbox) | 2 Go et 3 appareils ; OneDrive 5 Go |
| S25 | [Clubic : calendrier de la vérification](https://www.clubic.com/actualite-617695-verification-des-developpeurs-android-google-detaille-son-calendrier.html) ; [TechRepublic France](https://www.techrepublic.com/fr/article/news-google-android-developer-verification-september-2026/) | France : 2027, sans date précise |
| S26 | [F-Droid : lettre ouverte, 24 février 2026](https://f-droid.org/eu/2026/02/24/open-letter-opposing-developer-verification.html) ; [Wikipedia : F-Droid](https://en.wikipedia.org/wiki/F-Droid) | Position de F-Droid |

### Informations non vérifiées (à confirmer avant une décision)
- Absence de compte de facturation nécessaire pour un projet Google Cloud qui n'utilise que Drive, Calendar et OAuth (constat d'usage courant).
- Seuil quotidien exact de facturation des API Google, et conditions de facturation à venir (non publiées au 2026-10-21).
- Règle de conservation des révisions Drive (100 révisions, 30 jours) et leur décompte dans le quota.
- Prix de Google One en France en 2026 ; quota de minutes de GitHub Actions pour un dépôt privé (2 000 min) ; comportement d'un dépassement sans moyen de paiement.
- Prix des accessoires du Raspberry Pi, d'un NAS et du certificat de signature de code Windows ; consommation d'un PC au repos.
- Acceptation de l'origine `http://localhost` en production par l'écran de consentement OAuth.
- Faisabilité de la variante R-b (fournisseur d'agenda Android depuis Capacitor : identifiants, propriétés privées) et de l'agenda local Android.
- Comportement 2026 de la restriction « Private Network Access » de Chrome.

---

## 12. Décisions du commanditaire (2026-10-21)

Verbatim : « Qc-2 : C), qc-2 : oui, qc-3 : installation moi même, qc-5 : calendrier, qc-7 : oui. On étudiera dans un second temps une installation sur un radpbrry pi( que j'ai déjà) ». Le premier « Qc-2 : C) » est lu comme la réponse à QC-1 (`suivi-projet.md`, DEC-019).

| Décision | Question | Réponse | Conséquence d'architecture |
|---|---|---|---|
| DEC-019 | QC-1 | c) coût **et** indépendance | Critère pour les choix suivants : à coût égal, préférer la solution qui dépend le moins d'un service tiers |
| DEC-020 | QC-2 | Oui | **Option A maintenue** : données dans le Google Drive du commanditaire. DAT, ADR-002 et ADR-003 inchangés ; lot 1 inchangé. |
| DEC-021 | QC-3 | Installation par lui-même | **Option F1** : installation directe de l'APK, sans Google Play. **Remplace DEC-005.** Nouvel ADR-012 ; DAT v0.8 §7.4, §7.5, R16, R17 ; test technique v2. |
| DEC-022 | QC-5 | Google Calendar | Position R-a (ADR-006) maintenue pour le lot « Rappels ». La variante R-b (agenda du téléphone Android) reste une piste à vérifier à l'E3 de ce lot, sans engagement. |
| DEC-023 | QC-7 | Oui, code public | Hébergement : GitHub Pages dès que le dépôt est public, Cloudflare Pages tant qu'il est privé ; choix figé au test R11 (DAT §7.5). Intégration continue gratuite sur un dépôt public. Le passage en public est une action du commanditaire, après vérification de l'absence de secrets dans l'historique. |
| DEC-024 | — | Raspberry Pi déjà possédé ; étude reportée | Fiche ETU-001 (§13) ; option C non étudiée plus avant pour l'instant |

QC-4 et QC-6 sont sans objet après DEC-020. Combinaison retenue : **K1** (zéro coût strict), soit l'option A, la PWA sur un hébergement statique gratuit et l'APK installé directement. **Coût : 0 € initial, 0 € par an.**

**Effets sur le lot 1 validé** : aucune US ni aucun critère d'acceptation n'est remis en cause. Quelques mentions sont à répercuter par leurs auteurs, sans nouvel arbitrage :
- ENF-07 (cahier des charges) et LOT-001 §5 ligne 3 : Pepper ;
- parcours utilisateurs (« Google Play en test interne ») et guide d'ergonomie v0.2 : Steeve ;
- cible de l'action « Mettre à jour » (US-017, S30) : elle ouvre la page de téléchargement de l'APK. Le texte du scénario reste valable.

## 13. Fiche ETU-001 : auto-hébergement sur le Raspberry Pi du commanditaire (étude reportée)

| Élément | Contenu |
|---|---|
| Origine | DEC-024 (2026-10-21) : « On étudiera dans un second temps une installation sur un Raspberry Pi (que j'ai déjà) » |
| Statut | **Ouverte, non commencée.** Aucune échéance fixée. À planifier par Jarvis à la demande du commanditaire. |
| Point de départ | Option C du §5 ; ADR-003 (format indépendant du transport) ; port `TransportSynchro` (§8) |
| Effet sur les décisions actuelles | Aucun tant que l'étude n'est pas faite et tranchée. DEC-020 (Drive) reste en vigueur. |

**Points à étudier**
1. **Rôle du Raspberry Pi**, à comparer :
   - (a) pair Syncthing toujours allumé, qui remplace Drive ;
   - (b) même rôle, mais **en complément** de Drive : copie de sauvegarde locale, indépendance partielle ;
   - (c) serveur WebDAV ;
   - (d) sauvegarde périodique du dossier Drive « Done Juan » sur le Raspberry Pi, sans changer l'application. C'est probablement l'option la plus simple pour l'indépendance (DEC-019).
2. **Matériel existant** : modèle, mémoire, support de stockage (carte SD ou SSD), système, alimentation. Mesure de la consommation réelle.
3. **Accès hors domicile** : Tailscale (offre gratuite, coordination par un tiers), relais Syncthing, ou absence d'accès. Un port ouvert est à écarter.
4. **Sécurité** : mises à jour du système, comptes, chiffrement du disque, exposition réseau.
5. **Sauvegardes et reprise** : défaillance de la carte SD, restauration, rôle des copies complètes portées par les appareils.
6. **Effet sur les décisions** : RG-020 et Q-DEM001-3 (b vers c), DEC-007 (lecture de « serveur exploité »), DEC-009, DEC-020, RG-044 et RG-058 appliquées à un dossier local, US-017 et US-022.
7. **Effet sur l'application** : nouvel adaptateur de transport ; accès au dossier sur Android (sélecteur de dossier du système) et sur PC (File System Access) ; test technique dédié.
8. **Agenda** : sans changement, Google Calendar restant retenu (DEC-022).
9. **Charge pour le commanditaire** : installation, maintenance, supervision.

