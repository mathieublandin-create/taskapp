// conventions.md §11.4 : graine fixe (FC_SEED, valeur par défaut versionnée), 100 exécutions par propriété.
import fc from 'fast-check';

const GRAINE_PAR_DEFAUT = 20_261_022;
const graine = Number(process.env['FC_SEED'] ?? GRAINE_PAR_DEFAUT);

fc.configureGlobal({ seed: graine, numRuns: 100, includeErrorInReport: true });
