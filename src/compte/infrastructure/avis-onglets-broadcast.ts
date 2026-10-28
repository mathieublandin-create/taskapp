import type { Annulation } from '../../commun/application/ports/planificateur';
import type { AvisOnglet, AvisOnglets } from '../application/ports/avis-onglets';
import type { NomEnvironnement } from './espaces/nom-espace';

// ST-US-022 §4.4 ; DAT v0.11.4 §4.1.6 (RL-LOT-001-A1) : seul fichier qui utilise BroadcastChannel.
export const nomCanalSession = (env: NomEnvironnement): string => `donejuan-${env}-session`;

const AVIS_CONNUS: ReadonlySet<unknown> = new Set<AvisOnglet>(['SESSION_FERMEE']);

/** Un BroadcastChannel n'est jamais reçu par l'instance qui émet ; aucune donnée personnelle ne transite. */
export class AvisOngletsBroadcast implements AvisOnglets {
  private canal: BroadcastChannel | undefined;

  constructor(private readonly env: NomEnvironnement) {}

  diffuser(avis: AvisOnglet): void {
    this.ouvrir().postMessage(avis);
  }

  ecouter(rappel: (avis: AvisOnglet) => void): Annulation {
    const canal = this.ouvrir();
    const surMessage = (evenement: MessageEvent<unknown>): void => {
      if (AVIS_CONNUS.has(evenement.data)) rappel(evenement.data as AvisOnglet);
    };
    canal.addEventListener('message', surMessage);
    return () => {
      canal.removeEventListener('message', surMessage);
    };
  }

  fermer(): void {
    this.canal?.close();
    this.canal = undefined;
  }

  private ouvrir(): BroadcastChannel {
    this.canal ??= new BroadcastChannel(nomCanalSession(this.env));
    return this.canal;
  }
}
