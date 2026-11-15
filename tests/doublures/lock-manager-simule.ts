/**
 * `LockManager` simulé, conforme au sous-ensemble de la spécification Web Locks utilisé par `VerrouOngletsWeb`
 * (ST-US-031 v0.4 §4.2, §13) : un registre partagé par les « clients » (onglets) d'un même profil.
 * - `request(nom, rappel)` et `request(nom, { mode: 'exclusive', signal }, rappel)` : file FIFO par nom ; le rappel reçoit
 *   le verrou dans une microtâche ; le verrou est tenu jusqu'au règlement de la promesse rendue par le rappel, puis la
 *   promesse de `request` est réglée avec sa valeur ou son erreur ;
 * - `signal` : interrompt une demande **en attente** (rejet par `signal.reason`, une `DOMException` « AbortError »
 *   pour `abort()` sans motif) ; sans effet sur un verrou tenu ; signal déjà interrompu → rejet immédiat ;
 * - `query()` : `held` et `pending` (`name`, `mode`, `clientId`) ;
 * - `mode: 'shared'`, `ifAvailable` et `steal` ne sont pas simulés : erreur (l'adaptateur ne doit pas s'en servir) ;
 * - `fermerClient(id)` simule la fermeture de la page : verrous rendus, demandes oubliées (leurs promesses restent en
 *   suspens, la page n'existe plus).
 */
type Attente = {
  readonly client: string;
  readonly nom: string;
  readonly rappel: LockGrantedCallback<unknown>;
  readonly resoudre: (valeur: unknown) => void;
  readonly rejeter: (erreur: unknown) => void;
  retirerEcoute: () => void;
};

export class RegistreVerrousSimule {
  readonly #files = new Map<string, Array<Attente>>();
  readonly #tenus = new Map<string, Attente>();
  readonly #fermes = new Set<string>();
  /** Nombre d'appels de `request`, tous clients confondus. */
  demandes = 0;

  client(id: string): LockManager {
    const demander = <T>(nom: string, options: LockOptions, rappel: LockGrantedCallback<T>) =>
      this.#demander(id, nom, options, rappel);
    function request<T>(nom: string, rappel: LockGrantedCallback<T>): Promise<T>;
    function request<T>(
      nom: string,
      options: LockOptions,
      rappel: LockGrantedCallback<T>,
    ): Promise<T>;
    function request<T>(
      nom: string,
      optionsOuRappel: LockOptions | LockGrantedCallback<T>,
      rappel?: LockGrantedCallback<T>,
    ): Promise<T> {
      const options = typeof optionsOuRappel === 'function' ? {} : optionsOuRappel;
      const fonction = typeof optionsOuRappel === 'function' ? optionsOuRappel : rappel;
      if (fonction === undefined) throw new TypeError('rappel absent');
      return demander(nom, options, fonction);
    }
    return {
      request,
      query: () => Promise.resolve(this.#instantane()),
    };
  }

  fermerClient(id: string): void {
    this.#fermes.add(id);
    for (const [nom, file] of this.#files) {
      file
        .filter((a) => a.client === id)
        .forEach((a) => {
          a.retirerEcoute();
        });
      this.#files.set(
        nom,
        file.filter((a) => a.client !== id),
      );
    }
    for (const [nom, tenu] of [...this.#tenus]) {
      if (tenu.client === id) this.#liberer(nom, tenu);
    }
  }

  #demander<T>(
    client: string,
    nom: string,
    options: LockOptions,
    rappel: LockGrantedCallback<T>,
  ): Promise<T> {
    this.demandes += 1;
    if (options.mode === 'shared' || options.ifAvailable === true || options.steal === true) {
      throw new Error('Option de Web Locks non simulée');
    }
    const { signal } = options;
    if (signal?.aborted === true) return Promise.reject(signal.reason as Error);
    return new Promise<T>((resoudre, rejeter) => {
      const attente: Attente = {
        client,
        nom,
        rappel,
        resoudre: resoudre as (valeur: unknown) => void,
        rejeter,
        retirerEcoute: () => undefined,
      };
      if (signal !== undefined) {
        const surAbandon = (): void => {
          const file = this.#files.get(nom) ?? [];
          if (!file.includes(attente)) return;
          this.#files.set(
            nom,
            file.filter((a) => a !== attente),
          );
          rejeter(signal.reason as Error);
        };
        signal.addEventListener('abort', surAbandon);
        attente.retirerEcoute = () => {
          signal.removeEventListener('abort', surAbandon);
        };
      }
      if (this.#fermes.has(client)) return;
      this.#files.set(nom, [...(this.#files.get(nom) ?? []), attente]);
      this.#servir(nom);
    });
  }

  #servir(nom: string): void {
    if (this.#tenus.has(nom)) return;
    const [premiere, ...reste] = this.#files.get(nom) ?? [];
    if (premiere === undefined) return;
    this.#files.set(nom, reste);
    premiere.retirerEcoute();
    this.#tenus.set(nom, premiere);
    queueMicrotask(() => {
      if (this.#tenus.get(nom) !== premiere) return;
      // Une exception levée par le rappel devient un rejet de la demande, comme dans Web Locks.
      new Promise<unknown>((executer) => {
        executer(premiere.rappel({ name: nom, mode: 'exclusive' }));
      }).then(
        (valeur) => {
          this.#terminer(nom, premiere, () => {
            premiere.resoudre(valeur);
          });
        },
        (erreur: unknown) => {
          this.#terminer(nom, premiere, () => {
            premiere.rejeter(erreur);
          });
        },
      );
    });
  }

  #terminer(nom: string, attente: Attente, regler: () => void): void {
    this.#liberer(nom, attente);
    if (!this.#fermes.has(attente.client)) regler();
  }

  #liberer(nom: string, attente: Attente): void {
    if (this.#tenus.get(nom) !== attente) return;
    this.#tenus.delete(nom);
    this.#servir(nom);
  }

  #instantane(): LockManagerSnapshot {
    const info = (a: Attente): LockInfo => ({ name: a.nom, mode: 'exclusive', clientId: a.client });
    return {
      held: [...this.#tenus.values()].map(info),
      pending: [...this.#files.values()].flat().map(info),
    };
  }
}
