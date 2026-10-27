import { describe, expect, it } from 'vitest';
import { contenuAEnvoyer, doitDeposer, retirerDeposees } from '@src/synchronisation/domaine/depot';
import { META_INITIALE } from '@src/synchronisation/domaine/meta-synchronisation';
import type { IdFichierDrive } from '@src/synchronisation/domaine/meta-synchronisation';
import {
  etatLocal,
  indexEnAttente,
  registre,
  texteDeCle,
} from '@tests/support/fabriques/etat-local';
import { hlc, idObjectif, instant, SMARTPHONE } from '@tests/support/valeurs';

const O = idObjectif(1);
const h = (minute: number) =>
  hlc(`2026-10-21T08:${String(minute).padStart(2, '0')}:00.000Z`, 0, SMARTPHONE);
const cle = (champ: 'intitule' | 'delai') => ({ type: 'OBJECTIF', id: O, champ }) as const;
const FICHIER = 'f1' as IdFichierDrive;

describe('Dépôt (DAT §4.1.5 bis, §4.3)', () => {
  it('UT-US-017-07 retirerDeposees — retire les entrées dont la dernière écriture est déposée et garde les plus récentes', () => {
    const index = indexEnAttente([
      {
        cle: cle('intitule'),
        premiereEcriture: instant('2026-10-21T08:01:00.000Z'),
        derniereHlc: h(5),
      },
      {
        cle: cle('delai'),
        premiereEcriture: instant('2026-10-21T08:02:00.000Z'),
        derniereHlc: h(6),
      },
    ]);

    const apres = retirerDeposees(index, h(5));

    expect([...apres.keys()]).toEqual([texteDeCle(cle('delai'))]);
  });

  it('UT-US-017-08 doitDeposer — vrai si index non vide, fichier propre absent, fusion non déposée ou HLC avancé ; faux sinon', () => {
    const calme = etatLocal({ appareilId: SMARTPHONE, dernierHlc: h(5) });
    const deposee = { ...META_INITIALE, fichierPropre: FICHIER, deposeJusquA: h(5) };

    expect(doitDeposer(calme, deposee)).toBe(false);
    expect(doitDeposer(calme, META_INITIALE)).toBe(true);
    expect(doitDeposer(calme, { ...deposee, fusionNonDeposee: true })).toBe(true);
    expect(doitDeposer(etatLocal({ appareilId: SMARTPHONE, dernierHlc: h(6) }), deposee)).toBe(
      true,
    );
    expect(
      doitDeposer(
        etatLocal({
          appareilId: SMARTPHONE,
          dernierHlc: h(5),
          enAttente: [
            {
              cle: cle('delai'),
              premiereEcriture: instant('2026-10-21T08:05:00.000Z'),
              derniereHlc: h(5),
            },
          ],
        }),
        deposee,
      ),
    ).toBe(true);
  });

  it('UT-US-017-09 contenuAEnvoyer — contient les registres et le journal de l’état, schemaVersion 1 et la génération fournie', () => {
    const r = registre(cle('intitule'), 'Publier le guide', h(1));
    const etat = etatLocal({ appareilId: SMARTPHONE, dernierHlc: h(1), registres: [r] });

    expect(
      contenuAEnvoyer(etat, { versionApplication: '0.1.0', generation: { type: 'INITIALE' } }),
    ).toEqual({
      schemaVersion: 1,
      versionApplication: '0.1.0',
      generation: { type: 'INITIALE' },
      appareil: SMARTPHONE,
      registres: [r],
      journal: [],
    });
  });
});
