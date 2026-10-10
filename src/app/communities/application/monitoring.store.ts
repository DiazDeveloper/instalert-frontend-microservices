import { Injectable, inject, signal } from '@angular/core';
import { TrackingSession } from '../domain/tracking-session.entity';
import { MonitoringWebsocket } from '../infrastructure/monitoring-websocket';
import { CommunityAssembler } from '../infrastructure/community-assembler';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MonitoringStore {
  private websocket = inject(MonitoringWebsocket);

  private readonly activeSessionSignal = signal<TrackingSession | null>(null);
  readonly activeSession = this.activeSessionSignal.asReadonly();

  private trackingSub?: Subscription;

  startTracking(userId: number, userName: string) {
    if (this.trackingSub) this.trackingSub.unsubscribe();

    this.trackingSub = this.websocket.simulateGpsTracking(userId, userName).subscribe((rawData) => {
      const cleanData = CommunityAssembler.toTrackingSession(rawData);

      this.activeSessionSignal.set(cleanData);

      console.log('📍 Caminando: ', cleanData.currentLocation);
    });
  }

  stopTracking() {
    if (this.trackingSub) {
      this.trackingSub.unsubscribe();
    }
    this.activeSessionSignal.set(null);
    console.log('🛑 Rastreo detenido.');
  }
}
