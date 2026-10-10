import { Injectable, signal, inject } from '@angular/core';
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
  readonly activeAlertId = signal<number | null>(null);

  async loadHistory() {
    try {
      const history = await firstValueFrom(this.httpAdapter.getHistory());
      this.alertHistory.set(history.reverse());
    } catch (error) {
      console.error("Error al cargar historial desde la BD", error);
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
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newEmergency: Partial<AlertHistory> = {
      userId: user.id,
      type: 'Botón de pánico (Emergencia)',
      location: this.currentLocation() ? this.currentLocation()!.format() : 'Ubicación desconocida',
      time: timeStr,
      status: 'Activa',
      statusClass: 'badge-active',
      createdAt: now.toISOString(),
    };

    try {
      const savedEmergency = await firstValueFrom(this.httpAdapter.saveEmergency(newEmergency));
      this.activeAlertId.set(savedEmergency.id);
      this.alertHistory.update((history) => [savedEmergency, ...history]);
      this.dashboardState.set('active');
    } catch (error) {
      console.error("El backend no pudo guardar la emergencia", error);
      alert("Error de conexión con el servidor. No se pudo emitir la alerta.");
    }
  }

  async cancelAlert() {
    const currentId = this.activeAlertId();
    if (!currentId) return;

    const now = new Date();
    const fullTimeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    this.lastCanceledTime.set(fullTimeStr);

    try {
      const updatedEmergency = await firstValueFrom(
        this.httpAdapter.updateEmergencyStatus(currentId, 'Cancelada', 'badge-canceled'),
      );

      this.alertHistory.update((history) =>
        history.map((alert) => (alert.id === currentId ? updatedEmergency : alert)),
      );
      this.activeAlertId.set(null);
      this.dashboardState.set('canceled');
    } catch (error) {
      console.error("Error cancelando en BD", error);
    }
  }

  resetToIdle() {
    this.dashboardState.set('idle');
  }
}
