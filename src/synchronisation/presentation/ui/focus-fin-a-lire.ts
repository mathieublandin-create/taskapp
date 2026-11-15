import { useEffect, useRef, type RefObject } from 'react';

/**
 * DT-028 (guide §10, WCAG 2.4.3) : après « Compris » sur la dernière entrée de « À lire », la section est démontée et
 * le focus tomberait sur `body`. Il est alors rendu à `cible()` si elle est fournie (le titre de la feuille ouverte ou
 * son bouton d'ouverture, Q-CORR-STE-6), sinon à l'élément de la référence rendue. Un focus déjà ailleurs que sur
 * `body` n'est jamais déplacé.
 */
export const useFocusFinALire = <T extends HTMLElement>(
  sectionPresente: boolean,
  cible?: () => HTMLElement | null,
): RefObject<T | null> => {
  const reference = useRef<T | null>(null);
  const etaitPresente = useRef(sectionPresente);
  useEffect(() => {
    if (etaitPresente.current && !sectionPresente && document.activeElement === document.body) {
      (cible === undefined ? reference.current : cible())?.focus();
    }
    etaitPresente.current = sectionPresente;
  }, [sectionPresente, cible]);
  return reference;
};
