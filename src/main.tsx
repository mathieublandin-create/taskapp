import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Point d'entrée de la PWA. Au rang 0, aucun écran : le socle d'écriture n'est pas encore branché
// (la composition et l'écran de connexion arrivent au rang 1, ST-US-022 §3.1 S10).
const racine = document.getElementById('racine');
if (racine === null) throw new Error('Élément « racine » absent de index.html');
createRoot(racine).render(<StrictMode />);
