import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { PanicButtonStore } from './panic-button.store';
import { UserStore } from '../../../account/application/user-store';
import { EmergencyHttpAdapter } from '../../infrastructure/adapters/emergency-http.adapter';
import { BrowserGeolocationAdapter } from '../../infrastructure/adapters/browser-geolocation.adapter';
import { Geolocation } from '../../domain/value-objects/geolocation.value-object';
import { AlertHistory } from '../../domain/entities/emergency-alert.entity';

describe('Emergency state and uncertain responses', () => {
  const alert: AlertHistory = {
    id: 'uuid-alert',
    type: 'PANIC',
    location: 'test',
    time: '12:00',
    status: 'Activa',
    statusClass: 'badge-active',
  };
  let store: PanicButtonStore;
  const user = signal<{ id: number; accountId: string } | null>(null);
  let api: {
    saveEmergency: ReturnType<typeof vi.fn>;
    getHistory: ReturnType<typeof vi.fn>;
    updateEmergencyStatus: ReturnType<typeof vi.fn>;
  };
  let gps: { getCurrentLocation: ReturnType<typeof vi.fn> };
  beforeEach(() => {
    user.set({ id: 1, accountId: 'account-a' });
    api = {
      saveEmergency: vi.fn(() => of(alert)),
      getHistory: vi.fn(() => of([])),
      updateEmergencyStatus: vi.fn(() => of({ ...alert, status: 'Cancelada' })),
    };
    gps = { getCurrentLocation: vi.fn(() => Promise.resolve(Geolocation.create(-12, -77, 10))) };
    TestBed.configureTestingModule({
      providers: [
        { provide: UserStore, useValue: { user, isLoggedIn: () => !!user() } },
        { provide: EmergencyHttpAdapter, useValue: api },
        { provide: BrowserGeolocationAdapter, useValue: gps },
      ],
    });
    store = TestBed.inject(PanicButtonStore);
    TestBed.tick();
  });
  it('retains exactly the same key and payload after a lost response', async () => {
    api.saveEmergency
      .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 0 })))
      .mockReturnValueOnce(of(alert));
    await store.dispatchAlert();
    expect(store.activeAlertId()).toBeNull();
    expect(store.busy()).toBe(false);
    await store.dispatchAlert();
    expect(api.saveEmergency.mock.calls[0]).toEqual(api.saveEmergency.mock.calls[1]);
    expect(gps.getCurrentLocation).toHaveBeenCalledTimes(1);
    expect(store.activeAlertId()).toBe('uuid-alert');
  });
  it('does not send an alert when location is denied', async () => {
    gps.getCurrentLocation.mockRejectedValueOnce(new Error('Location denied'));
    await store.dispatchAlert();
    expect(api.saveEmergency).not.toHaveBeenCalled();
    expect(store.dashboardState()).toBe('idle');
    expect(store.error()).not.toBe('');
  });
  it('restores a persisted active alert and preserves it after failed cancellation', async () => {
    api.getHistory.mockReturnValueOnce(of([alert]));
    await store.loadHistory();
    expect(store.activeAlertId()).toBe('uuid-alert');
    api.updateEmergencyStatus.mockReturnValueOnce(
      throwError(() => new HttpErrorResponse({ status: 503 })),
    );
    await store.cancelAlert();
    expect(store.dashboardState()).toBe('active');
    expect(store.activeAlertId()).toBe('uuid-alert');
  });
  it('clears private history and location after logout', async () => {
    await store.dispatchAlert();
    user.set(null);
    TestBed.tick();
    expect(store.alertHistory()).toEqual([]);
    expect(store.activeAlertId()).toBeNull();
    expect(store.currentLocation()).toBeNull();
  });
});
