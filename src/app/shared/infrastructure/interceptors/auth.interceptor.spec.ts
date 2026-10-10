import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { environment } from '../../../../environments/environment';

describe('Account bearer token scope', () => {
  let client: HttpClient; let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()] });
    client = TestBed.inject(HttpClient); http = TestBed.inject(HttpTestingController);
    localStorage.setItem('instalert_token', 'account-token');
  });
  afterEach(() => { http.verify(); localStorage.clear(); });
  it('adds bearer only to our protected API', () => {
    const url = `${environment.serverBaseUrl}${environment.apiBasePath}/account/me`;
    client.get(url).subscribe(); const req = http.expectOne(url);
    expect(req.request.headers.get('Authorization')).toBe('Bearer account-token'); req.flush({});
  });
  it('never sends tokens to third party URLs or login', () => {
    for (const url of ['https://nominatim.openstreetmap.org/reverse', `${environment.serverBaseUrl}${environment.apiBasePath}/authentication/sign-in`]) {
      client.get(url).subscribe(); const req = http.expectOne(url);
      expect(req.request.headers.has('Authorization')).toBe(false); req.flush({});
    }
  });
});
