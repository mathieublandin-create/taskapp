// Dexie exige un IDBKeyRange en même temps que l'IDBFactory (conventions.md §10.1). Les tests passent une
// `IDBFactory` de fake-indexeddb à DepotLocalDexie ; ce fichier fournit l'IDBKeyRange correspondant, comme le
// ferait un navigateur. Il ne remplace aucun code testé.
import { IDBKeyRange } from 'fake-indexeddb';

Object.assign(globalThis, { IDBKeyRange });
