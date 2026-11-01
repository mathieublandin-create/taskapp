import { IonButton, IonButtons, IonChip, IonContent, IonHeader, IonToolbar } from '@ionic/react';
import type { IdObjectif, IdTache } from '../../../../commun/domaine/identifiants';
import { EtatVide } from '../../../../commun/presentation/ui/etat-vide';
import { NoteHeureParis } from '../../../../commun/presentation/ui/mention-heure-paris';
import type { ModeleVueDetailObjectif } from '../../modeles-de-vue/detail-objectif';
import { LigneObjectifUi } from '../composants/ligne-objectif';
import { SectionsTaches } from '../composants/sections-taches';
import { ProgressionObjectif } from '../composants/progression-objectif';
import { LIBELLES_OBJECTIFS, LIBELLES_TACHES } from '../libelles-ui';

// Écran ECR-003 (cadres C, D) : en-tête (état, niveau, progression, délai), description, sous-objectifs. Les sections
// de tâches (US-002, rang 5) ; sans tâche, l'état vide « À décliner en tâches » (CA-8).
export type ProprietesDetailObjectif = {
  readonly modele: ModeleVueDetailObjectif;
  readonly surRetour: () => void;
  readonly surOuvrirMenu: () => void;
  readonly surOuvrirSousObjectif: (id: IdObjectif) => void;
  /** Facultatif : sans lui, la section n'offre pas « Ajouter » (écrans et tests du rang 2). */
  readonly surAjouterSousObjectif?: () => void;
  /** Facultatifs (US-002) : sans eux, les tâches ne sont pas cliquables et « Ajouter une tâche » n'est pas offert. */
  readonly surOuvrirTache?: (id: IdTache) => void;
  readonly surAjouterTache?: () => void;
  /** Facultatif : sans lui, la carte d'ALR-007 n'offre pas « Changer le délai ». */
  readonly surChangerDelai?: () => void;
};

const ESPACE_INSECABLE = ' ';

const libelleNiveau = (niveau: ModeleVueDetailObjectif['niveau']): string =>
  niveau.type === 'PRINCIPAL'
    ? LIBELLES_OBJECTIFS.objectifPrincipal
    : LIBELLES_OBJECTIFS.sousObjectifDe.replace('{parent}', niveau.parent.intitule);

type ProprietesBarre = Pick<ProprietesDetailObjectif, 'surRetour' | 'surOuvrirMenu'>;

const BarreDetail = ({ surRetour, surOuvrirMenu }: ProprietesBarre) => (
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonButton onClick={surRetour}>{LIBELLES_OBJECTIFS.retourListe}</IonButton>
      </IonButtons>
      <IonButtons slot="end">
        <IonButton aria-label={LIBELLES_OBJECTIFS.ouvrirMenu} onClick={surOuvrirMenu}>
          …
        </IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
);

const MetaDetail = ({ modele }: { readonly modele: ModeleVueDetailObjectif }) => (
  <p className="detail-objectif-meta">
    <span data-code={modele.compteur.code}>{modele.compteur.libelle}</span>
    <span>{`${LIBELLES_OBJECTIFS.champDelai}${ESPACE_INSECABLE}: ${modele.delai.libelle}`}</span>
    {modele.enRetard === undefined ? null : (
      <strong data-code={modele.enRetard.code}>{modele.enRetard.libelle}</strong>
    )}
  </p>
);

const SousObjectifs = ({
  section,
  surOuvrir,
  surAjouter,
}: {
  readonly section: ModeleVueDetailObjectif['sousObjectifs'];
  readonly surOuvrir: (id: IdObjectif) => void;
  readonly surAjouter: (() => void) | undefined;
}) => (
  <section data-code={section.code}>
    <h2>{section.libelle}</h2>
    {surAjouter === undefined ? null : (
      <IonButton fill="clear" size="small" onClick={surAjouter}>
        {LIBELLES_OBJECTIFS.ajouterSousObjectif}
      </IonButton>
    )}
    <ul className="liste-objectifs">
      {section.lignes.map((ligne) => (
        <LigneObjectifUi
          key={ligne.id}
          ligne={ligne}
          surOuvrir={(l) => {
            surOuvrir(l.id);
          }}
        />
      ))}
    </ul>
  </section>
);

const EnTeteDetail = ({ modele }: { readonly modele: ModeleVueDetailObjectif }) => (
  <>
    <h1>{modele.intitule}</h1>
    {modele.mentionHeureParis === undefined ? null : (
      <NoteHeureParis mention={modele.mentionHeureParis} />
    )}
    <div className="detail-objectif-puces">
      <IonChip data-code={modele.etat.code}>{modele.etat.libelle}</IonChip>
      <IonChip>{libelleNiveau(modele.niveau)}</IonChip>
    </div>
    <ProgressionObjectif
      progression={modele.progression}
      atteint={modele.etat.code === 'ETA-OBJ-ATTEINT'}
      nomAccessible={modele.nomAccessible}
    />
    <MetaDetail modele={modele} />
  </>
);

type ProprietesCorpsDetail = Pick<
  ProprietesDetailObjectif,
  'modele' | 'surOuvrirSousObjectif' | 'surAjouterSousObjectif'
>;

/** La section des sous-objectifs, dont « Ajouter » : absent (non désactivé) sur un sous-objectif. */
const OrganisationDetail = ({
  modele,
  surOuvrirSousObjectif,
  surAjouterSousObjectif,
}: ProprietesCorpsDetail) => {
  const surAjouter = modele.actions.includes('CREER_SOUS_OBJECTIF')
    ? surAjouterSousObjectif
    : undefined;
  return modele.sousObjectifs.lignes.length === 0 && surAjouter === undefined ? null : (
    <SousObjectifs
      section={modele.sousObjectifs}
      surOuvrir={surOuvrirSousObjectif}
      surAjouter={surAjouter}
    />
  );
};

type ProprietesTaches = Pick<ProprietesDetailObjectif, 'surOuvrirTache' | 'surAjouterTache'>;

/** Tâches directes de l'objectif, ou l'état vide « À décliner en tâches » ; « Ajouter une tâche » pré-remplit l'objectif. */
const TachesDuDetail = ({
  modele,
  surOuvrirTache,
  surAjouterTache,
}: { readonly modele: ModeleVueDetailObjectif } & ProprietesTaches) => (
  <>
    {surAjouterTache === undefined ? null : (
      <IonButton fill="clear" size="small" onClick={surAjouterTache}>
        {LIBELLES_TACHES.ajouterTache}
      </IonButton>
    )}
    <SectionsTaches taches={modele.taches} surOuvrir={surOuvrirTache ?? (() => undefined)} />
    {modele.etatVide === undefined ? null : (
      <EtatVide
        code={modele.etatVide.code}
        {...(surAjouterTache === undefined ? {} : { surAction: surAjouterTache })}
      />
    )}
  </>
);

/** ALR-007, variante détail (ECR-003 E) : niveau Attention, non fermable, une seule action secondaire. */
const CarteAlerteDelai = ({
  alerte,
  surChangerDelai,
}: {
  readonly alerte: ModeleVueDetailObjectif['alerteDelai'];
  readonly surChangerDelai: ProprietesDetailObjectif['surChangerDelai'];
}) =>
  alerte === undefined ? null : (
    <section role="status" className="carte-alerte" data-code={alerte.code} data-variante="detail">
      <h2>{alerte.carte.titre}</h2>
      <p>{alerte.carte.texte}</p>
      {surChangerDelai === undefined ? null : (
        <IonButton fill="outline" onClick={surChangerDelai}>
          {alerte.carte.action}
        </IonButton>
      )}
    </section>
  );

export const DetailObjectif = ({ modele, ...proprietes }: ProprietesDetailObjectif) => {
  const {
    surRetour,
    surOuvrirMenu,
    surOuvrirTache,
    surAjouterTache,
    surChangerDelai,
    ...organisation
  } = proprietes;
  const taches = {
    ...(surOuvrirTache === undefined ? {} : { surOuvrirTache }),
    ...(surAjouterTache === undefined ? {} : { surAjouterTache }),
  };
  return (
    <>
      <BarreDetail surRetour={surRetour} surOuvrirMenu={surOuvrirMenu} />
      <IonContent>
        <EnTeteDetail modele={modele} />
        <CarteAlerteDelai alerte={modele.alerteDelai} surChangerDelai={surChangerDelai} />
        {modele.description === undefined ? null : <p>{modele.description}</p>}
        <OrganisationDetail modele={modele} {...organisation} />
        <TachesDuDetail modele={modele} {...taches} />
      </IonContent>
    </>
  );
};
