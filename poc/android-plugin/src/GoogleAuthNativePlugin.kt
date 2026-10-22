package __PACKAGE__

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.CancellationSignal
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CredentialManagerCallback
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.exceptions.ClearCredentialException
import androidx.credentials.exceptions.GetCredentialException
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.android.gms.auth.api.identity.AuthorizationRequest
import com.google.android.gms.auth.api.identity.AuthorizationResult
import com.google.android.gms.auth.api.identity.Identity
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.Scope
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.util.concurrent.Executors
import org.json.JSONObject

/**
 * Plugin Capacitor local du PoC (spécification section 5).
 * Règle absolue : le jeton d'accès, le jeton d'identité et les codes d'autorisation
 * ne sont jamais renvoyés à la couche web, sauf getAccessToken() (appels Drive).
 * Aucun log (Log.*) ne doit contenir de valeur de jeton.
 *
 * NON COMPILÉ dans le conteneur de développement (pas de SDK Android) :
 * la première compilation a lieu dans GitHub Actions.
 */
@CapacitorPlugin(name = "GoogleAuthNative")
class GoogleAuthNativePlugin : Plugin() {

    private var accessToken: String? = null
    private var appelAutorisationEnCours: PluginCall? = null
    private var scopesDemandes: List<String> = emptyList()
    private val executeur = Executors.newSingleThreadExecutor()

    // --- Identité : Credential Manager -----------------------------------------------------

    @PluginMethod
    fun signIn(call: PluginCall) {
        val option = GetSignInWithGoogleOption.Builder(idClientWeb()).build()
        val requete = GetCredentialRequest.Builder().addCredentialOption(option).build()
        CredentialManager.create(context).getCredentialAsync(
            activity,
            requete,
            CancellationSignal(),
            executeur,
            object : CredentialManagerCallback<GetCredentialResponse, GetCredentialException> {
                override fun onResult(result: GetCredentialResponse) {
                    val credential = result.credential
                    if (credential is CustomCredential &&
                        credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                    ) {
                        val google = GoogleIdTokenCredential.createFrom(credential.data)
                        // Le jeton d'identité (google.idToken) n'est volontairement PAS renvoyé.
                        call.resolve(
                            JSObject().put("email", google.id).put("nom", google.displayName ?: ""),
                        )
                    } else {
                        rejeter(call, "AUTRE", "type d'identifiant inattendu : ${credential.type}", null)
                    }
                }

                override fun onError(e: GetCredentialException) {
                    rejeter(call, "AUTRE", e.message, e.type)
                }
            },
        )
    }

    // --- Autorisation : AuthorizationClient -------------------------------------------------

    /** Obtient un jeton SANS lancer le PendingIntent : si une interface serait nécessaire, on le signale. */
    @PluginMethod
    fun authorizeSilently(call: PluginCall) {
        val scopes = lireScopes(call) ?: return
        Identity.getAuthorizationClient(activity).authorize(construireRequete(scopes))
            .addOnSuccessListener { resultat ->
                if (resultat.hasResolution()) {
                    call.resolve(JSObject().put("statut", "INTERACTION_REQUISE").put("scopesAccordes", tableau(emptyList())))
                } else {
                    resoudreAutorisation(call, resultat)
                }
            }
            .addOnFailureListener { e -> rejeterEchec(call, e) }
    }

    /** Lance le PendingIntent de consentement quand Google le demande. */
    @PluginMethod
    fun authorizeInteractive(call: PluginCall) {
        val scopes = lireScopes(call) ?: return
        Identity.getAuthorizationClient(activity).authorize(construireRequete(scopes))
            .addOnSuccessListener { resultat ->
                val intention = resultat.pendingIntent
                if (resultat.hasResolution() && intention != null) {
                    scopesDemandes = scopes
                    appelAutorisationEnCours = call
                    bridge.saveCall(call)
                    activity.startIntentSenderForResult(intention.intentSender, CODE_CONSENTEMENT, null, 0, 0, 0)
                } else {
                    resoudreAutorisation(call, resultat)
                }
            }
            .addOnFailureListener { e -> rejeterEchec(call, e) }
    }

    override fun handleOnActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.handleOnActivityResult(requestCode, resultCode, data)
        if (requestCode != CODE_CONSENTEMENT) return
        val call = appelAutorisationEnCours ?: return
        appelAutorisationEnCours = null
        if (resultCode != Activity.RESULT_OK || data == null) {
            rejeter(call, "AUTRE", "consentement annulé", "RESULT_CODE_$resultCode")
            return
        }
        try {
            resoudreAutorisation(call, Identity.getAuthorizationClient(activity).getAuthorizationResultFromIntent(data))
        } catch (e: ApiException) {
            rejeterEchec(call, e)
        }
    }

    /** Seule méthode qui renvoie le jeton : réservée aux appels Drive, jamais au journal. */
    @PluginMethod
    fun getAccessToken(call: PluginCall) {
        val jeton = accessToken
        if (jeton == null) {
            rejeter(call, "INTERACTION_REQUISE", "aucun jeton en mémoire", null)
        } else {
            call.resolve(JSObject().put("accessToken", jeton))
        }
    }

    // --- Signature de l'APK (R16-T) ---------------------------------------------------------

    @PluginMethod
    fun signatureInfo(call: PluginCall) {
        try {
            val paquet = context.packageManager.getPackageInfo(
                context.packageName,
                PackageManager.GET_SIGNING_CERTIFICATES,
            )
            val certificat = paquet.signingInfo?.apkContentsSigners?.firstOrNull()?.toByteArray()
                ?: throw IllegalStateException("certificat de signature introuvable")
            call.resolve(
                JSObject()
                    .put("versionCode", paquet.longVersionCode)
                    .put("versionName", paquet.versionName ?: "")
                    .put("sha256", empreinte("SHA-256", certificat))
                    .put("sha1", empreinte("SHA-1", certificat)),
            )
        } catch (e: Exception) {
            rejeter(call, "AUTRE", e.message, e.javaClass.simpleName)
        }
    }

    // --- Remise à zéro -----------------------------------------------------------------------

    @PluginMethod
    fun signOut(call: PluginCall) {
        accessToken = null
        CredentialManager.create(context).clearCredentialStateAsync(
            ClearCredentialStateRequest(),
            CancellationSignal(),
            executeur,
            object : CredentialManagerCallback<Void?, ClearCredentialException> {
                override fun onResult(result: Void?) = call.resolve()
                override fun onError(e: ClearCredentialException) = rejeter(call, "AUTRE", e.message, e.type)
            },
        )
    }

    @PluginMethod
    fun clearAuthorizationState(call: PluginCall) {
        accessToken = null
        call.resolve()
    }

    // --- Utilitaires --------------------------------------------------------------------------

    private fun idClientWeb(): String {
        val id = context.resources.getIdentifier("poc_google_web_client_id", "string", context.packageName)
        return context.getString(id)
    }

    private fun lireScopes(call: PluginCall): List<String>? {
        val tableau = call.getArray("scopes")
        if (tableau == null) {
            rejeter(call, "AUTRE", "paramètre scopes manquant", null)
            return null
        }
        return tableau.toList()
    }

    private fun construireRequete(scopes: List<String>): AuthorizationRequest =
        AuthorizationRequest.builder().setRequestedScopes(scopes.map { Scope(it) }).build()

    private fun resoudreAutorisation(call: PluginCall, resultat: AuthorizationResult) {
        accessToken = resultat.accessToken
        val accordes = resultat.grantedScopes
        val reponse = JSObject().put("statut", "OK").put("scopesAccordes", tableau(accordes))
        val jeton = accessToken
        if (jeton == null) {
            call.resolve(reponse)
            return
        }
        // AuthorizationResult n'expose pas l'échéance : on interroge tokeninfo (le jeton va à Google, jamais au journal).
        executeur.execute {
            echeance(jeton)?.let { reponse.put("echeance", it) }
            call.resolve(reponse)
        }
    }

    private fun echeance(jeton: String): Long? = try {
        val connexion = URL("https://oauth2.googleapis.com/tokeninfo").openConnection() as HttpURLConnection
        connexion.requestMethod = "POST"
        connexion.doOutput = true
        connexion.connectTimeout = 10_000
        connexion.readTimeout = 10_000
        connexion.outputStream.use { it.write("access_token=$jeton".toByteArray()) }
        val corps = connexion.inputStream.bufferedReader().use { it.readText() }
        System.currentTimeMillis() + JSONObject(corps).getString("expires_in").toLong() * 1000
    } catch (e: Exception) {
        null
    }

    /** Normalise les échecs d'autorisation ; le code natif brut est toujours conservé dans data.codeNatif. */
    private fun rejeterEchec(call: PluginCall, e: Exception) {
        val statut = (e as? ApiException)?.statusCode
        val code = when {
            e is IOException || statut == CODE_RESEAU -> "HORS_LIGNE"
            statut == CODE_CONNEXION_REQUISE || e.message?.contains("invalid_grant") == true -> "ACCES_REVOQUE"
            else -> "AUTRE"
        }
        rejeter(call, code, e.message, statut?.toString() ?: e.javaClass.simpleName)
    }

    private fun rejeter(call: PluginCall, code: String, message: String?, codeNatif: String?) {
        call.reject(message ?: code, code, null, JSObject().put("codeNatif", codeNatif ?: ""))
    }

    private fun tableau(valeurs: List<String>) = org.json.JSONArray(valeurs)

    private fun empreinte(algorithme: String, octets: ByteArray): String =
        MessageDigest.getInstance(algorithme).digest(octets).joinToString(":") { "%02X".format(it) }

    private companion object {
        const val CODE_CONSENTEMENT = 9101
        const val CODE_RESEAU = 7 // CommonStatusCodes.NETWORK_ERROR
        const val CODE_CONNEXION_REQUISE = 4 // CommonStatusCodes.SIGN_IN_REQUIRED
    }
}
