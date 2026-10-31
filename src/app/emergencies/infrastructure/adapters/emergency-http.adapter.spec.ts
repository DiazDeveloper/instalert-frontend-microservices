import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EmergencyHttpAdapter } from './emergency-http.adapter';
import { EmergencyRequestDto } from '../../application/dto/emergency-request.dto';
import { Geolocation } from '../../domain/value-objects/geolocation.value-object';

describe('Emergencies microservice transport', () => {
  let api: EmergencyHttpAdapter;
  let http: HttpTestingController;
  const response: EmergencyRequestDto = {
    id: 'alert-uuid',
    accountId: 'account-uuid',
    type: 'PANIC',
    latitude: -12,
    longitude: -77,
    locationRecordedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    status: 'ACTIVE',
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(EmergencyHttpAdapter);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('sends coordinates and a stable retry key without a forged owner', () => {
    api
      .saveEmergency({ ...response, userId: 99 }, 'stable-key')
      .subscribe((a) => expect(a.id).toBe('alert-uuid'));
    const r = http.expectOne((req) => req.method === 'POST');
    expect(r.request.headers.get('Idempotency-Key')).toBe('stable-key');
    expect(r.request.body.userId).toBeUndefined();
    expect(r.request.body.accountId).toBeUndefined();
    expect(r.request.body.latitude).toBe(-12);
    r.flush(response);
  });
  it('loads every history page and maps presentation states', () => {
    let count = 0;
    api.getHistory().subscribe((alerts) => {
      count = alerts.length;
      expect(alerts[1].status).toBe('Cancelada');
    });
    http
      .expectOne((r) => r.urlWithParams.endsWith('page=0'))
      .flush({ content: [response], page: 0, size: 100, totalElements: 2, totalPages: 2 });
    http
      .expectOne((r) => r.urlWithParams.endsWith('page=1'))
      .flush({
        content: [{ ...response, id: 'second', status: 'CANCELLED' }],
        page: 1,
        size: 100,
        totalElements: 2,
        totalPages: 2,
      });
    expect(count).toBe(2);
  });
  it('cancels using the domain status and UUID', () => {
    api.updateEmergencyStatus('alert-uuid', 'Cancelada', 'badge-canceled').subscribe();
    const r = http.expectOne((req) => req.method === 'PATCH' && req.url.endsWith('/alert-uuid'));
    expect(r.request.body).toEqual({ status: 'CANCELLED' });
    r.flush({ ...response, status: 'CANCELLED' });
  });
  it('rejects non-finite coordinates', () => {
    expect(() => Geolocation.create(NaN, -77)).toThrow();
    expect(() => Geolocation.create(-12, Infinity)).toThrow();
  });
});
