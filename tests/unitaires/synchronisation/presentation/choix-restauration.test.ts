/**
 * ERR-012 et son choix (ST-US-017 v0.10 §4.7, §6.7 n° 15, n° 16 ; ECR-011 E ; guide §4.25, §6.6.8, Q-US-017-11) :
 * modèle de vue et résumé de la copie locale. UT-US-017-72.
 */
import { describe, expect, it } from 'vitest';
import { formaterAnciennete } from '@src/commun/presentation/format/heure';
import { libelle } from '@src/commun/presentation/messages/libelle';
import { resumerCopieLocale } from '@src/synchronisation/domaine/copie-locale';
import {
  construireChoixRestauration,
  type EntreeChoixRestauration,
} from '@src/synchronisation/presentation/modeles-de-vue/choix-restauration';
import { etatLocal, registre } from '@tests/support/fabriques/etat-local';
import {
  date,
  duree,
  hlc,
  idObjectif,
  idTache,
  instant,
  PC,
  SMARTPHONE,
} from '@tests/support/valeurs';

const MAINTENANT = instant('2026-10-21T16:00:00.000Z');
const HIER = instant('2026-10-20T16:02:00.000Z');
const COPIE = { objectifs: 12, taches: 47, derniereMiseAJour: HIER };

const entree = (p: Partial<EntreeChoixRestauration> = {}): EntreeChoixRestauration => ({
  etat: { actionRequise: 'DONNEES_ABSENTES', reseau: 'CONNECTE' },
  restaurationDemandee: false,
  decisionReportee: false,
  copie: COPIE,
  maintenant: MAINTENANT,
  ...p,
});

describe('construireChoixRestauration (ST-US-017 v0.10 §6.7 n° 16)', () => {
  it('UT-US-017-72 sans ERR-012 (aucune action requise, ou une autre) : aucun choix n’est demandé', () => {
    expect(construireChoixRestauration(entree({ etat: { reseau: 'CONNECTE' } }))).toBeUndefined();
    for (const actionRequise of [
      'DRIVE_PLEIN',
      'FORMAT_PLUS_RECENT',
      'ECHEC_PERSISTANT',
    ] as const) {
      expect(
        construireChoixRestauration(entree({ etat: { actionRequise, reseau: 'CONNECTE' } })),
      ).toBeUndefined();
    }
  });

  it('UT-US-017-72 S18 : ERR-012 proposé avec la copie de l’appareil (objectifs, tâches, ancienneté), « Restaurer » principal, « Repartir de zéro » et « Décider plus tard » disponibles', () => {
    expect(construireChoixRestauration(entree())).toEqual({
      code: 'ERR-012',
      titre: libelle('ERR-012'),
      texte: libelle(
        'ERR-012',
        { objectifs: 12, taches: 47, anciennete: formaterAnciennete(HIER, MAINTENANT) },
        'texte',
      ),
      propose: true,
      restaurer: { libelle: libelle('ERR-012', {}, 'action'), disponible: true },
      repartirDeZero: { disponible: true },
      deciderPlusTard: { disponible: true },
    });
    expect(construireChoixRestauration(entree())?.texte).toContain('12 objectifs, 47 tâches');
  });

  it('UT-US-017-72 S22b, S20b, S19 : hors ligne « Repartir de zéro » indisponible (les autres restent) ; restauration demandée en attente ; « Décider plus tard » : plus proposé, ERR-012 toujours présent', () => {
    const horsLigne = construireChoixRestauration(
      entree({ etat: { actionRequise: 'DONNEES_ABSENTES', reseau: 'COUPE' } }),
    );
    expect(horsLigne?.repartirDeZero).toEqual({ disponible: false });
    expect(horsLigne?.restaurer.disponible).toBe(true);
    expect(horsLigne?.deciderPlusTard).toEqual({ disponible: true });
    expect(horsLigne?.restaurationEnAttente).toBeUndefined();

    expect(
      construireChoixRestauration(entree({ restaurationDemandee: true }))?.restaurationEnAttente,
    ).toBe(true);
    const reporte = construireChoixRestauration(entree({ decisionReportee: true }));
    expect(reporte?.code).toBe('ERR-012');
    expect(reporte?.propose).toBe(false);
  });

  it('UT-US-017-72 copie vide (aucune information) : 0 objectif, 0 tâche, ancienneté « à l’instant »', () => {
    const vue = construireChoixRestauration(entree({ copie: { objectifs: 0, taches: 0 } }));
    expect(vue?.texte).toBe(
      libelle(
        'ERR-012',
        { objectifs: 0, taches: 0, anciennete: formaterAnciennete(MAINTENANT, MAINTENANT) },
        'texte',
      ),
    );
  });
});

describe('resumerCopieLocale (ST-US-017 v0.10 §6.7 n° 15)', () => {
  it('UT-US-017-72 compte les objectifs et les tâches existants (sous-tâches comprises ; supprimés et sous-tâches d’une tâche supprimée exclus) ; dernière mise à jour = physique de dernierHlc', () => {
    const t = (minute: number) =>
      hlc(`2026-10-21T08:${String(minute).padStart(2, '0')}:00.000Z`, 0, PC);
    const creeLe = instant('2026-10-21T08:00:00.000Z');
    const objectif = (n: number, m: number) => [
      registre({ type: 'OBJECTIF', id: idObjectif(n), champ: 'creation' }, { creeLe }, t(m)),
      registre({ type: 'OBJECTIF', id: idObjectif(n), champ: 'intitule' }, `O${String(n)}`, t(m)),
    ];
    const tache = (n: number, m: number, parente?: number) => [
      registre(
        { type: 'TACHE', id: idTache(n), champ: 'creation' },
        parente === undefined ? { creeLe } : { creeLe, tacheParenteId: idTache(parente) },
        t(m),
      ),
      registre({ type: 'TACHE', id: idTache(n), champ: 'intitule' }, `T${String(n)}`, t(m)),
      registre({ type: 'TACHE', id: idTache(n), champ: 'delai' }, date('2026-12-01'), t(m)),
      registre({ type: 'TACHE', id: idTache(n), champ: 'estimationInitiale' }, duree(60), t(m)),
      registre({ type: 'TACHE', id: idTache(n), champ: 'cycleDeVie' }, { etat: 'A_FAIRE' }, t(m)),
    ];
    const etat = etatLocal({
      appareilId: SMARTPHONE,
      dernierHlc: t(30),
      registres: [
        ...objectif(1, 1),
        ...objectif(2, 2),
        registre({ type: 'OBJECTIF', id: idObjectif(2), champ: 'suppression' }, true, t(20)),
        ...tache(1, 3),
        ...tache(2, 4, 1),
        ...tache(3, 5),
        ...tache(4, 6, 3),
        registre({ type: 'TACHE', id: idTache(3), champ: 'suppression' }, true, t(21)),
      ],
    });
    expect(resumerCopieLocale(etat)).toEqual({
      objectifs: 1,
      taches: 2,
      derniereMiseAJour: t(30).physique,
    });
    expect(resumerCopieLocale(etatLocal({ appareilId: SMARTPHONE }))).toEqual({
      objectifs: 0,
      taches: 0,
    });
  });
});
