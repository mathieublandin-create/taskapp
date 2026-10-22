import { IonApp, IonButton, IonContent, IonInput, IonSelect, IonSelectOption } from '@ionic/react';
import { useCallback, useEffect, useState } from 'react';
import type { FournisseurJeton } from '../auth/ports';
import type { ConfigPoc } from '../config';
import type { Diagnostic } from '../diagnostic';
import { copier, exporterCsv, exporterJson, livrerExport } from '../journal/export';
import { MESURES, type EntreeJournal, type Journal } from '../journal/journal';

interface Props {
  diagnostic: Diagnostic;
  journal: Journal;
  config: ConfigPoc;
  auth: FournisseurJeton;
}

interface Action {
  libelle: string;
  executer: () => Promise<unknown>;
}

function groupes(d: Diagnostic): { titre: string; actions: Action[] }[] {
  return [
    {
      titre: 'R11 Consentement',
      actions: [{ libelle: 'Se connecter', executer: () => d.seConnecter() }],
    },
    {
      titre: 'R1 Visibilité croisée',
      actions: [
        { libelle: 'Créer', executer: () => d.creer() },
        { libelle: 'Lister', executer: () => d.lister() },
        { libelle: 'Lire', executer: () => d.lire() },
        { libelle: 'Modifier', executer: () => d.modifier() },
        { libelle: 'Changements', executer: () => d.changements() },
      ],
    },
    {
      titre: 'R2 Jeton silencieux (Android)',
      actions: [{ libelle: 'Jeton silencieux', executer: () => d.jetonSilencieux() }],
    },
    {
      titre: 'R3 Renouvellement (PC)',
      actions: [{ libelle: 'Synchroniser', executer: () => d.synchroniser() }],
    },
    {
      titre: 'R15 Persistance (PC)',
      actions: [{ libelle: 'Stockage persistant ?', executer: () => d.persistance() }],
    },
    {
      titre: 'R16-T APK signé (Android)',
      actions: [{ libelle: 'Signature et version', executer: () => d.signature() }],
    },
    {
      titre: '3.5 Accès retiré (PC)',
      actions: [
        { libelle: 'Appeler Drive', executer: () => d.appelerDrive() },
        { libelle: 'Demander un jeton', executer: () => d.demanderJeton() },
      ],
    },
  ];
}

export function PageDiagnostic({ diagnostic, journal, config, auth }: Props) {
  const [entrees, setEntrees] = useState<EntreeJournal[]>([]);
  const [filtre, setFiltre] = useState<string>('tous');
  const [etape, setEtape] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [occupe, setOccupe] = useState(false);

  const rafraichir = useCallback(async () => setEntrees(await journal.lire()), [journal]);
  useEffect(() => {
    void journal.lire().then(setEntrees);
  }, [journal]);

  const lancer = async (action: () => Promise<unknown>) => {
    setOccupe(true);
    try {
      await action();
    } finally {
      setOccupe(false);
      await rafraichir();
    }
  };

  const visibles = entrees.filter((e) => filtre === 'tous' || e.mesure === filtre);
  const identite = auth.identiteEnCache();

  return (
    <IonApp>
      <IonContent className="ion-padding">
        <h1>Diagnostic POC</h1>
        <p>
          Origine : {config.origine} | Dossier : {config.nomDossier} | Identité en cache :{' '}
          {identite?.email ?? 'aucune'}
        </p>
        {groupes(diagnostic).map((g) => (
          <section key={g.titre}>
            <h2>{g.titre}</h2>
            {g.actions.map((a) => (
              <IonButton key={a.libelle} disabled={occupe} onClick={() => void lancer(a.executer)}>
                {a.libelle}
              </IonButton>
            ))}
          </section>
        ))}
        <section>
          <h2>Marquer l’étape</h2>
          <IonInput
            label="Étape (ex. 3.2.4)"
            value={etape}
            onIonInput={(e) => setEtape(String(e.detail.value ?? ''))}
          />
          <IonInput
            label="Commentaire"
            value={commentaire}
            onIonInput={(e) => setCommentaire(String(e.detail.value ?? ''))}
          />
          <IonButton onClick={() => void lancer(() => diagnostic.marquerEtape(etape, commentaire))}>
            Marquer l’étape
          </IonButton>
        </section>
        <section>
          <h2>Journal ({visibles.length})</h2>
          <IonSelect
            label="Mesure"
            value={filtre}
            onIonChange={(e) => setFiltre(String(e.detail.value))}
          >
            <IonSelectOption value="tous">Toutes</IonSelectOption>
            {MESURES.map((m) => (
              <IonSelectOption key={m} value={m}>
                {m}
              </IonSelectOption>
            ))}
          </IonSelect>
          <IonButton
            onClick={() =>
              void livrerExport('journal-poc.json', exporterJson(entrees), 'application/json')
            }
          >
            Exporter JSON
          </IonButton>
          <IonButton
            onClick={() => void livrerExport('journal-poc.csv', exporterCsv(entrees), 'text/csv')}
          >
            Exporter CSV
          </IonButton>
          <IonButton onClick={() => void copier(exporterJson(entrees))}>Copier</IonButton>
          <IonButton
            color="danger"
            onClick={() => {
              if (window.confirm('Vider le journal ?')) void lancer(() => journal.vider());
            }}
          >
            Vider le journal
          </IonButton>
          <ul>
            {visibles.map((e) => (
              <li key={e.id}>
                <strong>
                  {e.horodatageLocal} [{e.mesure} {e.etape}]
                </strong>{' '}
                {e.operation} : {e.resultat}
                {e.codeHttp !== undefined && ` | HTTP ${e.codeHttp}`}
                {e.codeErreur && ` | erreur ${e.codeErreur}`}
                {e.echeanceJeton && ` | échéance ${e.echeanceJeton}`}
                {e.hasGrantedAllScopes !== undefined && ` | tous scopes : ${e.hasGrantedAllScopes}`}
                {e.detail && ` | ${e.detail}`}
              </li>
            ))}
          </ul>
        </section>
      </IonContent>
    </IonApp>
  );
}
