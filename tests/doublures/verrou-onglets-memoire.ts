/**
 * Doublure du port `VerrouOnglets` (ST-US-031 v0.4 §3 n° 12, §13) : un gestionnaire partagé par plusieurs onglets
 * simulés d'un même profil de navigateur. Contrat : tests/contrats/verrou-onglets.contrat.ts (CT-VER-01 à 07).
 * - mode exclusif seulement ; une file FIFO par nom, commune aux deux sortes de demandes ;
 * - une demande est accordée dès que le nom est libre ; l'exécution de la tâche (ou l'appel de `quandObtenue`) a lieu
 *   dans une microtâche, jamais pendant l'appel qui la demande (comme Web Locks) ;
 * - `fermerOnglet(id)` simule la fermeture de la page : ses verrous sont rendus, ses demandes en attente oubliées ; ses
 *   tâches en cours ne règlent plus jamais leur promesse côté onglet (page disparue).
 * Pilotage et observation : `detenteur(nom)`, `enAttente(nom)`.
 */
import type { VerrouOnglets } from '@src/synchronisation/application/ports/verrou-onglets';

export type IdOnglet = string & { readonly __marque: 'IdOnglet' };

type EtatDemande = 'ATTENTE' | 'TENUE' | 'FINIE';

type Demande = {
  readonly onglet: IdOnglet;
  etat: EtatDemande;
  /** Appelé dans une microtâche après l'accord, si la demande est toujours tenue. */
  readonly accorder: (demande: Demande) => void;
};

export type OngletSimule = VerrouOnglets & { readonly id: IdOnglet };

export class VerrouOngletsEnMemoire {
  readonly #files = new Map<string, Array<Demande>>();
  readonly #detentions = new Map<string, Demande>();
  readonly #fermes = new Set<IdOnglet>();
  #suivant = 0;

  /** Vue d'un nouvel onglet sur ce profil. */
  onglet(): OngletSimule {
    this.#suivant += 1;
    const id = `onglet-${String(this.#suivant)}` as IdOnglet;
    return {
      id,
      executerExclusivement: (nom, tache) => this.#executer(id, nom, tache),
      demanderLaMain: (nom, quandObtenue) => this.#demanderLaMain(id, nom, quandObtenue),
      estTenu: (nom) => Promise.resolve(this.#detentions.has(nom)),
    };
  }

  /** Fermeture de la page `id` : verrous rendus, demandes en attente oubliées. */
  fermerOnglet(id: IdOnglet): void {
    this.#fermes.add(id);
    for (const [nom, file] of this.#files) {
      this.#files.set(
        nom,
        file.filter((d) => d.onglet !== id),
      );
    }
    for (const [nom, detention] of [...this.#detentions]) {
      if (detention.onglet === id) this.#liberer(nom, detention);
    }
  }

  /** Onglet qui tient `nom`, s'il y en a un. */
  detenteur(nom: string): IdOnglet | undefined {
    return this.#detentions.get(nom)?.onglet;
  }

  /** Nombre de demandes en attente sur `nom` (ni accordées, ni abandonnées). */
  enAttente(nom: string): number {
    return (this.#files.get(nom) ?? []).length;
  }

  #executer<T>(onglet: IdOnglet, nom: string, tache: () => Promise<T>): Promise<T> {
    return new Promise<T>((resoudre, rejeter) => {
      this.#mettreEnFile(nom, {
        onglet,
        etat: 'ATTENTE',
        accorder: (demande) => {
          const fin = (regler: () => void): void => {
            this.#liberer(nom, demande);
            if (!this.#fermes.has(onglet)) regler();
          };
          // Une exception levée par `tache` avant sa première attente devient un rejet.
          const promesse = new Promise<T>((executer) => {
            executer(tache());
          });
          promesse.then(
            (valeur) => {
              fin(() => {
                resoudre(valeur);
              });
            },
            (erreur: unknown) => {
              fin(() => {
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- contrat : erreur renvoyée telle quelle
                rejeter(erreur);
              });
            },
          );
        },
      });
    });
  }

  #demanderLaMain(onglet: IdOnglet, nom: string, quandObtenue: () => void): () => void {
    const demande: Demande = {
      onglet,
      etat: 'ATTENTE',
      accorder: () => {
        quandObtenue();
      },
    };
    this.#mettreEnFile(nom, demande);
    return () => {
      if (demande.etat === 'ATTENTE') {
        demande.etat = 'FINIE';
        this.#files.set(
          nom,
          (this.#files.get(nom) ?? []).filter((d) => d !== demande),
        );
        return;
      }
      if (demande.etat === 'TENUE') this.#liberer(nom, demande);
    };
  }

  #mettreEnFile(nom: string, demande: Demande): void {
    if (this.#fermes.has(demande.onglet)) return;
    this.#files.set(nom, [...(this.#files.get(nom) ?? []), demande]);
    this.#servir(nom);
  }

  #liberer(nom: string, demande: Demande): void {
    demande.etat = 'FINIE';
    if (this.#detentions.get(nom) !== demande) return;
    this.#detentions.delete(nom);
    this.#servir(nom);
  }

  #servir(nom: string): void {
    if (this.#detentions.has(nom)) return;
    const [premiere, ...reste] = this.#files.get(nom) ?? [];
    if (premiere === undefined) return;
    this.#files.set(nom, reste);
    premiere.etat = 'TENUE';
    this.#detentions.set(nom, premiere);
    queueMicrotask(() => {
      if (premiere.etat === 'TENUE' && !this.#fermes.has(premiere.onglet))
        premiere.accorder(premiere);
    });
  }
}
