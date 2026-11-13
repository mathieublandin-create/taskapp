import { useEffect, useRef, type RefObject } from 'react';

/**
 * DT-028 (guide §10, WCAG 2.4.3) : après « Compris » sur la dernière entrée de « À lire », la section est démontée et
 * le focus tomberait sur `body`. Il est alors rendu à l'élément de `cible` (l'indicateur de synchronisation, choix par
 * défaut en attendant l'avis de Steeve, E14). Un focus déjà ailleurs que sur `body` n'est jamais déplacé.
 */
export const useFocusFinALire = <T extends HTMLElement>(
  sectionPresente: boolean,
): RefObject<T | null> => {
  const cible = useRef<T | null>(null);
  const etaitPresente = useRef(sectionPresente);
  useEffect(() => {
    if (etaitPresente.current && !sectionPresente && document.activeElement === document.body) {
      cible.current?.focus();
    }
    etaitPresente.current = sectionPresente;
  }, [sectionPresente]);
  return cible;
};
