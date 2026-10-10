import { Injectable, signal, computed } from '@angular/core';
import { SupportRequest } from '../domain/support-request.entity';

@Injectable({ providedIn: 'root' })
export class CommunitySupportStore {

  private readonly alertsSignal = signal<SupportRequest[]>([]);


  readonly alerts = this.alertsSignal.asReadonly();
  readonly activeAlertsCount = computed(
    () => this.alertsSignal().filter((a) => a.status === 'Activa').length,
  );

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const saved = localStorage.getItem('instalert_alerts_db');
    if (saved) {
      this.alertsSignal.set(JSON.parse(saved));
    }
  }

  createAlert(alertData: Omit<SupportRequest, 'id' | 'timestamp' | 'status'>) {
    const currentAlerts = this.alertsSignal();
    const newAlert: SupportRequest = {
      ...alertData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'Activa',
    };

    const updatedAlerts = [newAlert, ...currentAlerts];
    this.alertsSignal.set(updatedAlerts);
    localStorage.setItem('instalert_alerts_db', JSON.stringify(updatedAlerts));
  }

  markAsAttended(alertId: number) {
    const updatedAlerts = this.alertsSignal().map((alert) =>
      alert.id === alertId ? { ...alert, status: 'Atendida' as const } : alert,
    );
    this.alertsSignal.set(updatedAlerts);
    localStorage.setItem('instalert_alerts_db', JSON.stringify(updatedAlerts));
  }
}
