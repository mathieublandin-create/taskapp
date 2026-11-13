/**
 * Harnais des tests de navigateur (Playwright) : les quatre variantes du style commun des boutons natifs (DT-014, guide
 * v0.2.26 §4.1), avec les vraies feuilles de style (Ionic et `styles.css`), et un bouton `aria-disabled`. Le choix de
 * la variante par composant est contrôlé par UT-DT-014-01 à 06 ; ici, seul le rendu calculé de la classe compte
 * (ST-CORR-E13B-LOT-001 §4).
 */
import { IonApp, setupIonicReact } from '@ionic/react';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../src/commun/presentation/ui/styles.css';

setupIonicReact();

const racine = document.getElementById('racine');
if (racine === null) throw new Error('Élément « racine » absent du harnais');
createRoot(racine).render(
  <StrictMode>
    <IonApp>
      <main>
        <button type="button" className="bouton-natif" data-variante="principal">
          Principal
        </button>
        <button type="button" className="bouton-natif">
          Secondaire
        </button>
        <button type="button" className="bouton-natif" data-variante="tertiaire">
          Tertiaire
        </button>
        <button type="button" className="bouton-natif" data-variante="danger">
          Danger
        </button>
        <button type="button" className="bouton-natif" aria-disabled="true">
          Indisponible
        </button>
      </main>
    </IonApp>
  </StrictMode>,
);
