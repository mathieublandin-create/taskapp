// ST-US-022 §3.2 n° 43 ; DEC-025, DEC-026 : « Masquer le rappel » ferme BAN-RAPPEL-24H pour cette ouverture
// seulement (état en mémoire, jamais persisté).
export class MasquageRappel {
  #masque = false;

  estMasque(): boolean {
    return this.#masque;
  }

  masquer(): void {
    this.#masque = true;
  }
}
