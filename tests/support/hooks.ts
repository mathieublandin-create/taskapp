/**
 * Hooks (conventions.md §11.7) : le monde est neuf à chaque scénario (constructeur du monde) ; en fin de scénario,
 * le scénario échoue si le journal technique d'un appareil contient une entrée `erreur` non attendue.
 */
import { After } from '@cucumber/cucumber';
import type { MondeDoneJuan } from './monde';

After(function (this: MondeDoneJuan) {
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
});
