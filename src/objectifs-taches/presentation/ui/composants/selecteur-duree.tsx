import type { KeyboardEvent, Ref } from 'react';
import { Duree, PAS_DUREE_MINUTES } from '../../../../commun/domaine/duree';
import { formaterDuree } from '../../../../commun/presentation/format/duree';
import { LIBELLES_TACHES } from '../libelles-ui';

// DurationStepper (guide §4.4) : pas de 30 min, minimum 30 min pour une estimation, « — » tant que rien n'est saisi
// (distinct de « 0 »). Rôle `spinbutton`, flèches ± 30 min, Page haut / bas ± 2 h, valeur annoncée en toutes lettres.
export type ProprietesSelecteurDuree = {
  readonly nom: string;
  /** Minutes saisies ; `undefined` : non saisi. */
  readonly valeur: number | undefined;
  readonly surChanger: (minutes: number) => void;
  readonly identifiant?: string;
  readonly invalide?: boolean;
  /** Élément `spinbutton`, pour lui donner le focus. */
  readonly ref?: Ref<HTMLDivElement> | undefined;
};

const MINIMUM_MINUTES = PAS_DUREE_MINUTES;
const GRAND_PAS_MINUTES = 4 * PAS_DUREE_MINUTES;
const MINUTES_PAR_HEURE = 60;

/** « 1 heure 30 minutes » : formaté par Intl, sans texte codé. */
export const enToutesLettres = (minutes: number): string => {
  const heures = Math.floor(minutes / MINUTES_PAR_HEURE);
  const reste = minutes % MINUTES_PAR_HEURE;
  const unite = (n: number, unit: 'hour' | 'minute'): string =>
    new Intl.NumberFormat('fr', { style: 'unit', unit, unitDisplay: 'long' }).format(n);
  return [heures > 0 ? unite(heures, 'hour') : '', reste > 0 ? unite(reste, 'minute') : '']
    .filter((partie) => partie !== '')
    .join(' ');
};

const PAS_PAR_TOUCHE: Readonly<Record<string, number>> = {
  ArrowUp: PAS_DUREE_MINUTES,
  ArrowDown: -PAS_DUREE_MINUTES,
  PageUp: GRAND_PAS_MINUTES,
  PageDown: -GRAND_PAS_MINUTES,
};

/** Valeur suivante, bornée au minimum ; à partir de « non saisi », le premier geste donne le minimum. */
const suivante = (valeur: number | undefined, pas: number): number =>
  Math.max(MINIMUM_MINUTES, (valeur ?? 0) + pas);

const BoutonPas = ({
  nom,
  symbole,
  surClic,
}: {
  readonly nom: string;
  readonly symbole: string;
  readonly surClic: () => void;
}) => (
  <button type="button" aria-label={nom} onClick={surClic}>
    {symbole}
  </button>
);

/** Une valeur qui n'est pas une durée valide (RG-028) s'affiche comme « non saisi » plutôt que d'être transtypée. */
const texteDe = (valeur: number | undefined): string => {
  const duree = valeur === undefined ? undefined : Duree.calculee(valeur);
  return duree?.ok === true ? formaterDuree(duree.valeur) : LIBELLES_TACHES.valeurNonSaisie;
};

const valeurEnLettres = (valeur: number | undefined): string =>
  valeur === undefined ? LIBELLES_TACHES.stepper.nonSaisi : enToutesLettres(valeur);

/** Le champ lui-même : rôle `spinbutton`, valeur annoncée en toutes lettres. */
const ChampDuree = ({
  nom,
  valeur,
  identifiant,
  invalide,
  surTouche,
  ref,
}: Pick<ProprietesSelecteurDuree, 'nom' | 'valeur' | 'ref'> & {
  readonly identifiant: string | undefined;
  readonly invalide: boolean;
  readonly surTouche: (evenement: KeyboardEvent) => void;
}) => (
  <div
    ref={ref}
    id={identifiant}
    role="spinbutton"
    tabIndex={0}
    aria-label={nom}
    aria-valuemin={MINIMUM_MINUTES}
    aria-valuetext={valeurEnLettres(valeur)}
    {...(valeur === undefined ? {} : { 'aria-valuenow': valeur })}
    {...(invalide ? { 'aria-invalid': true } : {})}
    onKeyDown={surTouche}
  >
    {texteDe(valeur)}
  </div>
);

/** Gestes du champ : boutons ± 30 min, flèches et pages au clavier (guide §4.4). */
const useGestes = (valeur: number | undefined, surChanger: (minutes: number) => void) => {
  const changer = (pas: number): void => {
    surChanger(suivante(valeur, pas));
  };
  const surTouche = (evenement: KeyboardEvent): void => {
    const pas = PAS_PAR_TOUCHE[evenement.key];
    if (pas === undefined) return;
    evenement.preventDefault();
    changer(pas);
  };
  return { changer, surTouche };
};

export const SelecteurDuree = ({
  nom,
  valeur,
  surChanger,
  identifiant,
  invalide = false,
  ref,
}: ProprietesSelecteurDuree) => {
  const { changer, surTouche } = useGestes(valeur, surChanger);
  return (
    <div className="selecteur-duree">
      <BoutonPas
        nom={LIBELLES_TACHES.stepper.moins}
        symbole="−"
        surClic={() => {
          changer(-PAS_DUREE_MINUTES);
        }}
      />
      <ChampDuree {...{ nom, valeur, invalide, surTouche, identifiant, ref }} />
      <BoutonPas
        nom={LIBELLES_TACHES.stepper.plus}
        symbole="+"
        surClic={() => {
          changer(PAS_DUREE_MINUTES);
        }}
      />
    </div>
  );
};
