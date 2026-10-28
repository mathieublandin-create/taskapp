/**
 * Hooks (conventions.md §11.7) : le monde est neuf à chaque scénario (constructeur du monde) ; en fin de scénario,
 * le scénario échoue si le journal technique d'un appareil contient une entrée `erreur` non attendue.
 * ST-US-022 §12.3 : `fetch` est remplacé par un enregistreur qui échoue (aucune requête réelle) ; les connexions
 * IndexedDB des appareils sont fermées en fin de scénario.
 */
import { After, Before } from '@cucumber/cucumber';
import type { MondeDoneJuan } from './monde';

const fetchOrigine = globalThis.fetch;

Before(function (this: MondeDoneJuan) {
  globalThis.fetch = (entree) => {
    const url = entree instanceof Request ? entree.url : String(entree);
    this.requetesInterdites.push(url);
    return Promise.reject(new Error(`Requête réseau interdite dans les scénarios : ${url}`));
  };
});

After(function (this: MondeDoneJuan) {
  globalThis.fetch = fetchOrigine;
  this.banc.arreter();
  const inattendues = this.banc
    .appareils()
    .flatMap((appareil) =>
      appareil.journalTechnique
        .erreursInattendues()
        .map((entree) => `${appareil.nom} : ${entree.evenement}`),
    );
  if (inattendues.length > 0) {
    throw new Error(
      `Entrées « erreur » du journal technique non attendues : ${inattendues.join(', ')}`,
    );
  }
  if (this.requetesInterdites.length > 0) {
    throw new Error(`Requêtes réseau réelles tentées : ${this.requetesInterdites.join(', ')}`);
  }
});
