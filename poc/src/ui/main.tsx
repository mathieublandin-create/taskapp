import '@ionic/react/css/core.css';
import { setupIonicReact } from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { creerFournisseur } from '../auth';
import { descriptionAppareil, typeAppareil } from '../appareil';
import { ErreurConfiguration, lireConfig } from '../config';
import { Diagnostic, signatureNative } from '../diagnostic';
import { ClientDrive } from '../drive/client-drive';
import { Journal } from '../journal/journal';
import { StockageIndexedDb, StockageLocalStorage } from '../journal/stockage';
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
    signature: Capacitor.isNativePlatform() ? signatureNative : undefined,
  });
  racine.render(
    <StrictMode>
      <PageDiagnostic diagnostic={diagnostic} journal={journal} config={config} auth={auth} />
    </StrictMode>,
  );
  void diagnostic.demarrage();
} catch (erreur) {
  const message = erreur instanceof ErreurConfiguration ? erreur.message : String(erreur);
  racine.render(<p role="alert">Configuration invalide : {message}</p>);
}
