import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Toast } from './toast';

// Consultation seule (RG-058 ; ST-US-017 v0.11 §6.8 n° 9 ; guide v0.2.23 §6.6.14 c) : les champs et les menus restent
// visibles et inertes. Un contrôle d'action porte `aria-disabled="true"` (jamais `disabled`, il reste atteignable au
// clavier) ; un champ est en lecture seule (`readonly`, `aria-readonly`). La tentative (clic, saisie, Entrée, Espace)
// affiche le toast `TST-CONSULTATION-SEULE` sans appeler la commande ; le simple focus n'en affiche aucun. Le toast
// n'est pas répété pendant sa durée : une tentative de plus, tant qu'il est affiché, ne change rien.
type Garde = { readonly actif: boolean; readonly signaler: () => void };

const HORS_CONSULTATION_SEULE: Garde = { actif: false, signaler: () => undefined };

const ContexteConsultationSeule = createContext<Garde>(HORS_CONSULTATION_SEULE);

export const FournisseurConsultationSeule = ({
  actif,
  children,
}: {
  readonly actif: boolean;
  readonly children: ReactNode;
}) => {
  const [toastAffiche, setToastAffiche] = useState(false);
  const signaler = useCallback(() => {
    setToastAffiche(true);
  }, []);
  const garde = useMemo(() => ({ actif, signaler }), [actif, signaler]);
  return (
    <ContexteConsultationSeule value={garde}>
      {children}
      {toastAffiche ? (
        <Toast
          code="TST-CONSULTATION-SEULE"
          surFermeture={() => {
            setToastAffiche(false);
          }}
        />
      ) : null}
    </ContexteConsultationSeule>
  );
};

const TOUCHES_DE_SAISIE: ReadonlyArray<string> = ['Enter', 'Backspace', 'Delete'];

/** Début de frappe : un caractère (Espace compris), Entrée ou une suppression ; ni raccourci, ni navigation. */
const estTentativeDeSaisie = (evenement: KeyboardEvent): boolean =>
  !(evenement.ctrlKey || evenement.metaKey || evenement.altKey) &&
  (evenement.key.length === 1 || TOUCHES_DE_SAISIE.includes(evenement.key));

/**
 * Commande refusée à l'exécution (`CONSULTATION_SEULE`, par exemple si la version plus récente est apparue pendant
 * qu'une saisie était ouverte) : le magasin compte les refus, et chaque refus de plus affiche le toast.
 */
export const useToastDeRefus = (refus: number): void => {
  const { signaler } = useContext(ContexteConsultationSeule);
  const dernierVu = useRef(refus);
  useEffect(() => {
    if (refus === dernierVu.current) return;
    dernierVu.current = refus;
    signaler();
  }, [refus, signaler]);
};

export type ConsultationSeule = {
  readonly actif: boolean;
  /** Enveloppe le geste d'un contrôle d'action : en consultation seule, il affiche le toast et ne fait rien d'autre. */
  readonly garder: <A extends ReadonlyArray<unknown>>(
    geste: (...args: A) => void,
  ) => (...args: A) => void;
  /** Attributs d'un contrôle d'action (bouton, case, puce, menu « … »). */
  /** `"true"` en texte : sur un composant Ionic (élément personnalisé), React écrirait un booléen `true` en attribut vide. */
  readonly attributsAction: { readonly 'aria-disabled'?: 'true' };
  /** Attributs d'un champ de saisie ou d'un sélecteur ; la tentative de saisie affiche le toast, jamais le focus. */
  readonly attributsChamp: {
    readonly readOnly?: true;
    readonly 'aria-readonly'?: true;
    readonly onClick?: () => void;
    readonly onKeyDown?: (evenement: KeyboardEvent) => void;
  };
};

export const useConsultationSeule = (): ConsultationSeule => {
  const { actif, signaler } = useContext(ContexteConsultationSeule);
  return useMemo<ConsultationSeule>(
    () => ({
      actif,
      garder:
        (geste) =>
        (...args) => {
          if (actif) signaler();
          else geste(...args);
        },
      attributsAction: actif ? { 'aria-disabled': 'true' } : {},
      attributsChamp: actif
        ? {
            readOnly: true,
            'aria-readonly': true,
            onClick: signaler,
            onKeyDown: (evenement) => {
              if (estTentativeDeSaisie(evenement)) signaler();
            },
          }
        : {},
    }),
    [actif, signaler],
  );
};
