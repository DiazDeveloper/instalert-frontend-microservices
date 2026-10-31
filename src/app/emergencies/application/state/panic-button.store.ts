import { Injectable, signal, inject, effect, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserStore } from '../../../account/application/user-store';
import {
  AlertHistory,
  PermissionState,
  DashboardState,
} from '../../domain/entities/emergency-alert.entity';
import { BrowserGeolocationAdapter } from '../../infrastructure/adapters/browser-geolocation.adapter';
import { EmergencyHttpAdapter } from '../../infrastructure/adapters/emergency-http.adapter';
import { Geolocation } from '../../domain/value-objects/geolocation.value-object';

@Injectable({ providedIn: 'root' })
export class PanicButtonStore {
  private userStore = inject(UserStore);
  private geolocationAdapter = inject(BrowserGeolocationAdapter);
  private httpAdapter = inject(EmergencyHttpAdapter);

  private readonly PERM_KEY = 'instalert_location_permission';
  private readonly LOC_KEY = 'instalert_location_confirmed';

  readonly permissionState = signal<PermissionState>(
    (localStorage.getItem(this.PERM_KEY) as PermissionState) || 'pending',
  );
  readonly locationConfirmed = signal<boolean>(localStorage.getItem(this.LOC_KEY) === 'true');

  readonly dashboardState = signal<DashboardState>('idle');
  readonly alertHistory = signal<AlertHistory[]>([]);
  readonly lastCanceledTime = signal<string>('');
  readonly currentLocation = signal<Geolocation | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');
  private pendingRequest: { key: string; payload: Partial<AlertHistory> } | null = null;
  private sessionAccountId: string | null = null;
  constructor() {
    effect(() => {
      const account = this.userStore.user()?.accountId ?? null;
      if (account !== this.sessionAccountId) {
        this.sessionAccountId = account;
        this.pendingRequest = null;
        this.alertHistory.set([]);
        this.activeAlertId.set(null);
        this.dashboardState.set('idle');
        this.currentLocation.set(null);
        this.error.set('');
      }
    });
  }
  readonly activeAlertId = signal<string | null>(null);
  readonly activeAlert = computed(
    () => this.alertHistory().find((a) => a.id === this.activeAlertId()) ?? null,
  );

  async loadHistory() {
    const accountId = this.userStore.user()?.accountId;
    try {
      const history = await firstValueFrom(this.httpAdapter.getHistory());
      if (accountId !== this.userStore.user()?.accountId) return;
      this.alertHistory.set(history);
      const active = history.find((a) => a.status === 'Activa');
      this.activeAlertId.set(active?.id ?? null);
      this.dashboardState.set(active ? 'active' : 'idle');
    } catch (error) {
      console.error('Error al cargar historial desde la BD', error);
    }
  }

  setPermission(granted: boolean) {
    const state = granted ? 'granted' : 'denied';
    this.permissionState.set(state);
    localStorage.setItem(this.PERM_KEY, state);
  }

  async requestLocation() {
    try {
      const location = await this.geolocationAdapter.getCurrentLocation();
      this.currentLocation.set(location);
    } catch (error) {
      throw error;
    }
  }

  confirmLocation() {
    if (this.currentLocation()) {
      this.locationConfirmed.set(true);
      localStorage.setItem(this.LOC_KEY, 'true');
    }
  }

  async dispatchAlert() {
    const user = this.userStore.user();
    if (!user || !this.userStore.isLoggedIn()) return;
    if (this.busy() || this.activeAlertId()) return;
    if (this.sessionAccountId !== user.accountId) {
      this.pendingRequest = null;
      this.sessionAccountId = user.accountId;
    }
    this.busy.set(true);
    this.error.set('');
    try {
      if (!this.pendingRequest) {
        await this.requestLocation();
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newEmergency: Partial<AlertHistory> = {
          latitude: this.currentLocation()!.latitude,
          longitude: this.currentLocation()!.longitude,
          accuracyM: this.currentLocation()!.accuracy,
          locationRecordedAt: now.toISOString(),
          type: 'Botón de pánico (Emergencia)',
          location: this.currentLocation()
            ? this.currentLocation()!.format()
            : 'Ubicación desconocida',
          time: timeStr,
          status: 'Activa',
          statusClass: 'badge-active',
          createdAt: now.toISOString(),
        };

        this.pendingRequest = { key: crypto.randomUUID(), payload: newEmergency };
      }
      const savedEmergency = await firstValueFrom(
        this.httpAdapter.saveEmergency(this.pendingRequest!.payload, this.pendingRequest!.key),
      );
      if (user.accountId !== this.userStore.user()?.accountId) return;
      this.activeAlertId.set(savedEmergency.id);
      this.alertHistory.update((history) => [savedEmergency, ...history]);
      this.dashboardState.set('active');
      this.pendingRequest = null;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status >= 400 && error.status < 500)
        this.pendingRequest = null;
      console.error('El backend no pudo guardar la emergencia', error);
      this.error.set(
        'No se pudo confirmar la alerta. Comprueba tu ubicación y conexión y vuelve a intentar.',
      );
    } finally {
      this.busy.set(false);
    }
  }

  async cancelAlert(id: string | null = this.activeAlertId()) {
    const currentId = id;
    const accountId = this.userStore.user()?.accountId;
    if (!currentId || this.busy()) return;
    this.busy.set(true);
    this.error.set('');

    const now = new Date();
    const fullTimeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    try {
      const updatedEmergency = await firstValueFrom(
        this.httpAdapter.updateEmergencyStatus(currentId, 'Cancelada', 'badge-canceled'),
      );

      if (accountId !== this.userStore.user()?.accountId) return;
      this.alertHistory.update((history) =>
        history.map((alert) => (alert.id === currentId ? updatedEmergency : alert)),
      );
      this.lastCanceledTime.set(fullTimeStr);
      const remaining = this.alertHistory().find((a) => a.status === 'Activa');
      this.activeAlertId.set(remaining?.id ?? null);
      this.dashboardState.set(remaining ? 'active' : 'canceled');
    } catch (error) {
      console.error('Error cancelando en BD', error);
      this.error.set('No se pudo confirmar la cancelación. Vuelve a intentar.');
    } finally {
      this.busy.set(false);
    }
  }

  resetToIdle() {
    this.dashboardState.set('idle');
  }
}
