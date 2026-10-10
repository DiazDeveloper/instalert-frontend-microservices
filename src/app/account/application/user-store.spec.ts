import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UserStore } from './user-store';
import { environment } from '../../../environments/environment';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { RouterTestingHarness } from '@angular/router/testing';
import { accountGuard } from './account.guards';
import { LoginView } from '../presentation/views/login-view/login-view';

@Component({ standalone: true, template: 'Authenticated dashboard' })
class ProtectedDashboard {}

describe('Account session and atomic registration', () => {
  let store: UserStore;
  let http: HttpTestingController;
  const base = `${environment.serverBaseUrl}${environment.apiBasePath}`;
  const accountId = '550e8400-e29b-41d4-a716-446655440000';
  const profile = { id: 42, accountId, name: 'Citizen', email: 'a@example.org', roles: ['ROLE_USER'], role: 'Ciudadano verificado', phone: '', avatar: '', currentLocation: '' };
  const jwt = (exp: number) => `header.${btoa(JSON.stringify({ iss: 'ms-account', aud: 'instalert-api', exp }))}.signature`;
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([{path: 'login', children: []}, {path: 'app', children: [{path: 'dashboard', children: []}]}, {path: 'admin', children: []}]), provideHttpClient(), provideHttpClientTesting()] });
    store = TestBed.inject(UserStore); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); localStorage.clear(); });
  it('registers identity and profile in one request without client roles', () => {
    store.register('Citizen', 'a@example.org', 'Passw0rd!', '', '', '');
    const req = http.expectOne(`${base}/authentication/sign-up`);
    expect(req.request.body.name).toBe('Citizen');
    expect(req.request.body.roles).toBeUndefined();
    req.flush({ accountId, email: profile.email, token: jwt(Date.now() / 1000 + 3600), profile });
    expect(store.user()?.id).toBe(42); expect(store.user()?.accountId).toBe(accountId);
    expect(store.isLoggedIn()).toBe(true);
    http.expectNone(`${base}/users`);
  });
  it('failed registration never persists a partial session', () => {
    store.register('Citizen', 'a@example.org', 'Passw0rd!', '', '', '');
    http.expectOne(`${base}/authentication/sign-up`).flush({}, { status: 409, statusText: 'Conflict' });
    expect(store.user()).toBeNull(); expect(localStorage.getItem('instalert_token')).toBeNull();
    expect(store.error()).toContain('registrado');
  });
  it('finishes login navigation while parent and child guards refresh the session', async () => {
    const router = TestBed.inject(Router);
    router.resetConfig([
      { path: 'login', component: LoginView },
      { path: 'app', canActivate: [accountGuard], canActivateChild: [accountGuard], children: [
        { path: 'dashboard', component: ProtectedDashboard },
      ] },
    ]);
    const harness = await RouterTestingHarness.create('/login');
    store.login('a@example.org', 'Passw0rd!');
    http.expectOne(`${base}/authentication/sign-in`).flush({ accountId, email: profile.email, token: jwt(Date.now() / 1000 + 3600), profile });
    for (let guard = 0; guard < 2; guard++) {
      await vi.waitFor(() => {
        const requests = http.match(`${base}/account/me`);
        expect(requests.length).toBe(1);
        requests[0].flush(profile);
      });
    }
    await vi.waitFor(() => expect(router.url).toBe('/app/dashboard'));
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Authenticated dashboard');
    expect(store.isLoggedIn()).toBe(true);
  });
  it('rejects malformed storage and expired or legacy sessions', () => {
    localStorage.setItem('instalert_user', '{bad'); store.loadFromStorage(); expect(store.isLoggedIn()).toBe(false);
    localStorage.setItem('instalert_user', JSON.stringify(profile));
    localStorage.setItem('instalert_token', jwt(Date.now() / 1000 - 1));
    store.loadFromStorage(); expect(store.user()).toBeNull();
    localStorage.setItem('instalert_user', JSON.stringify({ id: 1, role: 'Admin' }));
    localStorage.setItem('instalert_token', jwt(Date.now() / 1000 + 3600));
    store.loadFromStorage(); expect(store.isAdmin()).toBe(false);
  });
  it('refreshes authority from Account before accepting a cached session', () => {
    localStorage.setItem('instalert_user', JSON.stringify({ ...profile, roles: ['ROLE_ADMIN'] }));
    localStorage.setItem('instalert_token', jwt(Date.now() / 1000 + 3600));
    let accepted = false; store.validateSession().subscribe(value => accepted = value);
    http.expectOne(`${base}/account/me`).flush(profile);
    expect(accepted).toBe(true); expect(store.isAdmin()).toBe(false);
  });
  it('password change uses UUID and clears revoked session', () => {
    localStorage.setItem('instalert_user', JSON.stringify(profile));
    localStorage.setItem('instalert_token', jwt(Date.now() / 1000 + 3600)); store.loadFromStorage();
    store.changePassword('Passw0rd!', 'NewPassw0rd!');
    http.expectOne(`${base}/authentication/${accountId}/change-password`).flush(null);
    expect(store.isLoggedIn()).toBe(false); expect(store.success()).toContain('nuevamente');
  });
});
