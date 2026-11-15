/**
 * Harnais des tests de navigateur (Playwright) : monte l'écran connecté de l'application (même mise en page que
 * src/main.tsx : `main.espace-application`, espaces et barre d'onglets) sur un espace local réel (IndexedDB du
 * navigateur) et une session Google simulée, c'est-à-dire sans connexion : les services sont assemblés directement.
 * Servi par `vite` (tests/e2e), jamais inclus dans le build de production. `window.__etatLocal` rend le nombre
 * d'objectifs et de tâches enregistrés, pour les assertions. `window.__creerTaches(n)` crée « Tâche 01 » à « Tâche n »
 * (délai, estimation de 30 min, sans objectif) par le cas d'usage, pour les tests de défilement (ST-CORR-E13B-LOT-001).
 */
import { IonApp, setupIonicReact } from '@ionic/react';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { IdAppareil } from '../../../src/commun/domaine/identifiants';
import { DateCalendaire } from '../../../src/commun/domaine/temps/date-calendaire';
import { GenerateurUuidV7 } from '../../../src/commun/infrastructure/generateur-uuid-v7';
import { HorlogeSysteme } from '../../../src/commun/infrastructure/horloge-systeme';
import { PlanificateurNavigateur } from '../../../src/commun/infrastructure/planificateur-navigateur';
import {
  EcransObjectifs,
  useNavigation,
} from '../../../src/objectifs-taches/presentation/ui/ecrans/espaces';
import { assemblerObjectifsTaches } from '../../../src/composition/objectifs-taches';
import '../../../src/commun/presentation/ui/styles.css';
import { ServiceEtatLocalTransactionnel } from '../../../src/synchronisation/application/service-etat-local-transactionnel';
import { DepotLocalDexie } from '../../../src/synchronisation/infrastructure/depot-local-dexie';

setupIonicReact();

const horloge = new HorlogeSysteme();
const generateur = new GenerateurUuidV7();
const depot = new DepotLocalDexie({
  nomBase: `harnais-${crypto.randomUUID()}`,
  appareilId: '00000000-0000-7000-8000-000000000001' as IdAppareil,
});
const service = new ServiceEtatLocalTransactionnel({ depot, horloge, generateur });
const objectifs = assemblerObjectifsTaches({
  service,
  generateur,
  horloge,
  observer: (rappel) => depot.observer(rappel),
  planificateur: new PlanificateurNavigateur(),
});

Object.assign(window, {
  __etatLocal: async () => {
    const lecture = await service.lire();
    if (!lecture.ok) throw new Error('Espace local illisible');
    return { objectifs: lecture.valeur.objectifs.size, taches: lecture.valeur.taches.size };
  },
  __creerTaches: async (n: number) => {
    const delai = DateCalendaire.depuisTexte('2026-12-31');
    if (!delai.ok) throw new Error('Délai invalide');
    for (let i = 1; i <= n; i += 1) {
      const resultat = await objectifs.creerTache.executer({
        intitule: `Tâche ${String(i).padStart(2, '0')}`,
        delai: delai.valeur,
        estimationMinutes: 30,
        objectifIds: [],
      });
      if (!resultat.ok) throw new Error(`Tâche ${String(i)} non créée`);
    }
  },
});

const EspaceConnecte = () => {
  const { voir: _voir, ...navigation } = useNavigation();
  return (
    <main className="espace-application" aria-label="Done Juan">
      <EcransObjectifs objectifs={objectifs} navigation={navigation} />
    </main>
  );
};

const racine = document.getElementById('racine');
if (racine === null) throw new Error('Élément « racine » absent du harnais');
createRoot(racine).render(
  <StrictMode>
    <IonApp>
      <EspaceConnecte />
    </IonApp>
  </StrictMode>,
);
