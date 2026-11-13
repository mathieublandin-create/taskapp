// ST-US-001 §4.1 : undefined ou vide après retrait des espaces → undefined ; sinon la chaîne sans ces espaces.
export const normaliserDescription = (brute: string | undefined): string | undefined => {
  const description = brute?.trim();
  return description === undefined || description === '' ? undefined : description;
};
