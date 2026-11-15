/**
 * Outils des tests de la coordination entre onglets (ST-US-031 v0.4 §13) : barrière commandée et vidage des
 * microtâches. Aucun délai réel : `vider()` laisse s'exécuter toutes les microtâches en file (accords des verrous,
 * fins de tâches), puis rend la main.
 */
export type Barriere = { readonly promesse: Promise<void>; readonly ouvrir: () => void };

export const barriere = (): Barriere => {
  const commande: { ouvrir: () => void } = { ouvrir: () => undefined };
  const promesse = new Promise<void>((resoudre) => {
    commande.ouvrir = resoudre;
  });
  return {
    promesse,
    ouvrir: () => {
      commande.ouvrir();
    },
  };
};

/** Toutes les microtâches en file, et celles qu'elles mettent en file, sont exécutées. */
export const vider = (): Promise<void> =>
  new Promise((resoudre) => {
    setTimeout(resoudre, 0);
  });
