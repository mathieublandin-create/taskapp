/**
 * Harnais des tests de navigateur (Playwright) : monte, avec les vraies feuilles de style, la boîte de confirmation,
 * le sélecteur de parent ou son refus bloquant (`?boite=confirmation|selecteur|refus`). Chaque rappel est inscrit
 * dans `window.__appels`, pour vérifier à la souris et au toucher quel bouton a reçu le geste (ANO-007, DT-024).
 */
import { IonApp, setupIonicReact } from '@ionic/react';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BoiteConfirmation } from '../../../src/commun/presentation/ui/boite-confirmation';
import '../../../src/commun/presentation/ui/styles.css';
import { construireSelecteurParent } from '../../../src/objectifs-taches';
import { SelecteurParent } from '../../../src/objectifs-taches/presentation/ui/composants/selecteur-parent';
import { date, idObjectif } from '../valeurs';
import { resumeObjectif } from '../fabriques/resumes';

setupIonicReact();

const appels: string[] = [];
Object.assign(window, { __appels: appels });
const noter = (appel: string) => () => {
  appels.push(appel);
};

const objectif = resumeObjectif({ id: idObjectif(1), intitule: 'Publier le guide' });
const candidats = [
  { ...objectif, autresSousObjectifs: 0 },
  { ...resumeObjectif({ id: idObjectif(2), intitule: 'Développer mon activité' }), autresSousObjectifs: 0 },
];
const selecteur = (nombreSousObjectifs: number) => (
  <SelecteurParent
    modele={construireSelecteurParent({
      objectif,
      candidats,
      nombreSousObjectifs,
      jour: date('2026-10-21'),
    })}
    surRefusCompris={noter('refus-compris')}
    surChoisir={noter('choisir')}
    surFermer={noter('fermer')}
  />
);

const boite = new URLSearchParams(window.location.search).get('boite');
const contenu =
  boite === 'selecteur' ? (
    selecteur(0)
  ) : boite === 'refus' ? (
    selecteur(1)
  ) : (
    <BoiteConfirmation
      code="CNF-SUPPR-OBJECTIF"
      titre="Supprimer « Guide » ?"
      texte="La suppression est définitive."
      actionLibelle="Supprimer"
      rouge
      surConfirmer={noter('confirmer')}
      surAnnuler={noter('annuler')}
    />
  );

const racine = document.getElementById('racine');
if (racine === null) throw new Error('Élément « racine » absent du harnais');
createRoot(racine).render(
  <StrictMode>
    <IonApp>{contenu}</IonApp>
  </StrictMode>,
);
