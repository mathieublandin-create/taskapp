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
