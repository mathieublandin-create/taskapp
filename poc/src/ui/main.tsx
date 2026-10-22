import '@ionic/react/css/core.css';
import { setupIonicReact } from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { creerFournisseur } from '../auth';
import { contexteExecution, descriptionAppareil, typeAppareil } from '../appareil';
import { ErreurConfiguration, lireConfig } from '../config';
import { Diagnostic, signatureNative } from '../diagnostic';
import { ClientDrive } from '../drive/client-drive';
import { Journal } from '../journal/journal';
import { StockageIndexedDb, StockageLocalStorage } from '../journal/stockage';
import { MarqueurIndexedDb } from '../storage/marqueur';
import { PageDiagnostic } from './PageDiagnostic';

setupIonicReact();

const racine = createRoot(document.getElementById('root') as HTMLElement);

try {
  const config = lireConfig(import.meta.env);
  const auth = creerFournisseur(config.clientIdWeb);
  const journal = new Journal(
    Capacitor.isNativePlatform() ? new StockageLocalStorage() : new StockageIndexedDb(),
    descriptionAppareil(),
  );
  const diagnostic = new Diagnostic({
    auth,
    drive: new ClientDrive(auth, config),
    journal,
    config,
    appareil: typeAppareil(),
    contexteExecution,
    marqueur: new MarqueurIndexedDb(),
    navigation: {
      redirectUri: `${window.location.origin}${config.basePath}`,
      fragment: () => window.location.hash,
      effacerFragment: () =>
        window.history.replaceState(null, '', window.location.pathname + window.location.search),
      aller: (url) => window.location.assign(url),
    },
    signature: Capacitor.isNativePlatform() ? signatureNative : undefined,
  });
  racine.render(
    <StrictMode>
      <PageDiagnostic diagnostic={diagnostic} journal={journal} config={config} auth={auth} />
    </StrictMode>,
  );
  void diagnostic
    .traiterRetourRedirection()
    .then((retourTraite) => diagnostic.ouvertureAutomatique(retourTraite, navigator.onLine))
    .then((lancee) => (lancee ? undefined : diagnostic.demarrage()));
} catch (erreur) {
  const message = erreur instanceof ErreurConfiguration ? erreur.message : String(erreur);
  racine.render(<p role="alert">Configuration invalide : {message}</p>);
}
