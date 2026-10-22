/**
 * Fabrique d'EtatLocal pour les tests du domaine `synchronisation` (ST-socle-ecriture.md §4.1.5).
 * Les clés textuelles suivent le format du §4.1.3 : `${type}/${id}/${champ}`.
 */
import type { Instant } from '@src/commun/domaine/temps/instant';
import type { IdAppareil } from '@src/commun/domaine/identifiants';
import { CONTEXTE_VIDE, type ContexteCausal } from '@src/synchronisation/domaine/contexte-causal';
import type { RegistreQuelconque } from '@src/synchronisation/domaine/ecriture';
import type { EtatLocal } from '@src/synchronisation/domaine/etat-local';
import type { EvenementJournal } from '@src/synchronisation/domaine/evenement-journal';
import type { Hlc } from '@src/synchronisation/domaine/hlc';
import type { IdEvenement } from '@src/synchronisation/domaine/identifiant-evenement';
import type { IndexEnAttente } from '@src/synchronisation/domaine/index-en-attente';
import type { CleInformation, CleTexte } from '@src/synchronisation/domaine/information';
import { ecart } from '../valeurs';

export const texteDeCle = (cle: CleInformation): CleTexte =>
  `${cle.type}/${cle.id}/${cle.champ}` as CleTexte;

/** Registre d'une information ; la valeur est typée par la clé. */
export const registre = <R extends RegistreQuelconque>(
  cle: R['cle'],
  valeur: R['ecriture']['valeur'],
  hlcEcriture: Hlc,
  contexte: ContexteCausal = CONTEXTE_VIDE,
): RegistreQuelconque =>
  ({ cle, ecriture: { valeur, hlc: hlcEcriture, contexte } }) as RegistreQuelconque;

export type EntreeIndexTest = {
  readonly cle: CleInformation;
  readonly premiereEcriture: Instant;
  readonly derniereHlc: Hlc;
};

export const indexEnAttente = (entrees: ReadonlyArray<EntreeIndexTest>): IndexEnAttente =>
  new Map(
    entrees.map((e) => [
      texteDeCle(e.cle),
      { cle: e.cle, entree: { premiereEcriture: e.premiereEcriture, derniereHlc: e.derniereHlc } },
    ]),
  );

export type ParametresEtatLocal = {
  readonly appareilId: IdAppareil;
  readonly version?: number;
  readonly dernierHlc?: Hlc;
  readonly correctionHorlogeEnMs?: number;
  readonly registres?: ReadonlyArray<RegistreQuelconque>;
  readonly journal?: ReadonlyArray<EvenementJournal>;
  readonly enAttente?: ReadonlyArray<EntreeIndexTest>;
};

export const etatLocal = (p: ParametresEtatLocal): EtatLocal => ({
  appareilId: p.appareilId,
  version: p.version ?? 0,
  ...(p.dernierHlc === undefined ? {} : { dernierHlc: p.dernierHlc }),
  correctionHorloge: ecart(p.correctionHorlogeEnMs ?? 0),
  registres: new Map((p.registres ?? []).map((r) => [texteDeCle(r.cle), r])),
  journal: new Map<IdEvenement, EvenementJournal>((p.journal ?? []).map((e) => [e.id, e])),
  enAttente: indexEnAttente(p.enAttente ?? []),
});
