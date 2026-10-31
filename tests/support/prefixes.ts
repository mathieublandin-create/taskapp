/**
 * Étapes à préfixe (conventions.md §11.7, glossaire d'étapes v1.4). Une étape portée par un appareil est enregistrée
 * une seule fois par une de ces fonctions, qui en définissent les variantes (« que », « sur le smartphone, »,
 * « 5 minutes plus tard, », « au même instant exact, »…). Le motif de l'étape est une expression régulière sans
 * ancres ; ses groupes capturants suivent ceux du préfixe.
 */
import { Given, Then, When } from '@cucumber/cucumber';
import type { Resultat } from '@src/commun/domaine/resultat';
import type { AppareilSimule, NomAppareil } from './banc/appareil-simule';
import type { EcartTemps } from '@src/commun/domaine/temps/ecart-temps';
import { convertirAppareil, convertirEcart } from './conversions';
import { motifAction, motifAssertion, motifContexte } from './motifs-prefixes';
import type { MondeDoneJuan } from './monde';

export type ContexteEtape = { readonly monde: MondeDoneJuan; readonly appareil: AppareilSimule };
export type CorpsEtape = (
  contexte: ContexteEtape,
  ...arguments_: ReadonlyArray<unknown>
) => unknown;

const texteOuUndefined = (valeur: unknown): string | undefined =>
  typeof valeur === 'string' ? valeur : undefined;

/**
 * Écart du préfixe « {ecart} plus tard, » : le groupe a le motif du type de paramètre `{ecart}`, que cucumber-js
 * convertit lui-même en `EcartTemps` ; le texte brut reste accepté.
 */
const ecartDuPrefixe = (valeur: unknown): EcartTemps | undefined => {
  if (typeof valeur === 'number') return valeur as EcartTemps;
  return typeof valeur === 'string' ? convertirEcart(valeur) : undefined;
};

/** Appareil désigné par le préfixe ; sans préfixe, l'unique appareil du banc, sinon l'appareil implicite ou une erreur. */
export const appareilDuPrefixe = (
  monde: MondeDoneJuan,
  prefixe: string | undefined,
  implicite?: (monde: MondeDoneJuan) => NomAppareil | undefined,
): AppareilSimule => {
  if (prefixe !== undefined) return monde.banc.appareil(convertirAppareil(prefixe));
  const existants = monde.banc.appareils();
  if (existants.length <= 1) return monde.banc.appareil(existants[0]?.nom ?? 'smartphone');
  const choisi = implicite?.(monde);
  if (choisi === undefined) {
    throw new Error('Appareil ambigu : préciser « sur le smartphone, » ou « sur le PC, »');
  }
  return monde.banc.appareil(choisi);
};

const estResultat = (valeur: unknown): valeur is Resultat<unknown, unknown> =>
  typeof valeur === 'object' &&
  valeur !== null &&
  typeof (valeur as { ok?: unknown }).ok === 'boolean';

/** Nombre de groupes capturants d'une expression régulière. */
const nombreDeGroupes = (motif: RegExp): number =>
  (new RegExp(`${motif.source}|`).exec('')?.length ?? 1) - 1;

/**
 * cucumber-js exige que le nombre de paramètres déclarés de la fonction égale celui des groupes capturés ; les
 * fonctions ci-dessous reçoivent les groupes du motif par un paramètre du reste, qui ne compte pas : leur arité
 * est donc fixée sur le motif complet.
 */
const avecArite = <F extends (...arguments_: Array<never>) => unknown>(
  motif: RegExp,
  fonction: F,
  tableau = false,
): F =>
  // Un tableau de données (DataTable) est le dernier argument de l'étape, après les groupes capturés.
  Object.defineProperty(fonction, 'length', { value: nombreDeGroupes(motif) + (tableau ? 1 : 0) });

export type OptionsAction = {
  /** Appareil visé quand l'étape n'a pas de préfixe et que le banc en compte deux (H-5, conventions.md §11.6). */
  readonly appareilImplicite?: (monde: MondeDoneJuan) => NomAppareil | undefined;
  /** L'étape reçoit un tableau de données (DataTable) en dernier argument. */
  readonly tableau?: boolean;
};

/**
 * Précondition (« Étant donné »). Sans préfixe : valide si le banc ne comporte qu'un appareil, ou si l'étape désigne
 * un appareil implicite.
 */
export const etapeContexte = (
  motif: RegExp,
  corps: CorpsEtape,
  options: OptionsAction = {},
): void => {
  const complet = motifContexte(motif);
  Given(
    complet,
    avecArite(
      complet,
      async function (this: MondeDoneJuan, prefixe: unknown, ...reste: Array<unknown>) {
        const appareil = appareilDuPrefixe(
          this,
          texteOuUndefined(prefixe),
          options.appareilImplicite,
        );
        await corps({ monde: this, appareil }, ...reste);
      },
      options.tableau ?? false,
    ),
  );
};

/**
 * Action (« Quand »). « … plus tard » avance d'abord le temps simulé ; « au même instant exact » le replace à
 * l'instant de l'action précédente. Le résultat renvoyé par le corps, s'il y en a un, devient le dernier résultat.
 */
export const etapeAction = (
  motif: RegExp,
  corps: CorpsEtape,
  options: OptionsAction = {},
): void => {
  const complet = motifAction(motif);
  When(
    complet,
    avecArite(
      complet,
      async function (
        this: MondeDoneJuan,
        ecart: unknown,
        exact: unknown,
        prefixe: unknown,
        ...reste: Array<unknown>
      ) {
        const appareil = appareilDuPrefixe(
          this,
          texteOuUndefined(prefixe),
          options.appareilImplicite,
        );
        const ecartAvance = ecartDuPrefixe(ecart);
        if (ecartAvance !== undefined) await this.banc.avancerTemps(ecartAvance);
        if (texteOuUndefined(exact) !== undefined) {
          if (this.instantDerniereAction === undefined)
            throw new Error('Aucune action précédente à rejouer');
          this.banc.temps.positionner(this.instantDerniereAction);
        }
        this.instantDerniereAction = this.banc.temps.maintenant();
        const resultat = await corps({ monde: this, appareil }, ...reste);
        if (estResultat(resultat)) this.resultats.set(appareil.nom, resultat);
      },
      options.tableau ?? false,
    ),
  );
};

/**
 * Assertion (« Alors »). Sans préfixe, ou avec « sur les deux appareils, » : l'assertion est jouée sur chaque
 * appareil du banc (Q-US-017-7).
 */
export const etapeAssertion = (
  motif: RegExp,
  corps: CorpsEtape,
  options: { readonly tableau?: boolean } = {},
): void => {
  const complet = motifAssertion(motif);
  Then(
    complet,
    avecArite(
      complet,
      async function (
        this: MondeDoneJuan,
        prefixe: unknown,
        _deux: unknown,
        ...reste: Array<unknown>
      ) {
        const nom = texteOuUndefined(prefixe);
        const cibles =
          nom === undefined ? this.banc.appareils() : [this.banc.appareil(convertirAppareil(nom))];
        const appareils = cibles.length === 0 ? [this.banc.appareil('smartphone')] : cibles;
        for (const appareil of appareils) await corps({ monde: this, appareil }, ...reste);
      },
      options.tableau ?? false,
    ),
  );
};
