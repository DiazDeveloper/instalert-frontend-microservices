import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const api = new URL(`${environment.serverBaseUrl}${environment.apiBasePath}`, window.location.origin);
  const target = new URL(req.url, window.location.origin);
  const ownApi = target.origin === api.origin && (target.pathname === api.pathname || target.pathname.startsWith(`${api.pathname}/`));
  const publicAuth = /\/authentication\/sign-(in|up)$/.test(target.pathname);
  const token = ownApi && !publicAuth ? localStorage.getItem('instalert_token') : null;
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req).pipe(catchError(error => {
    if (ownApi && !publicAuth && error.status === 401) {
      localStorage.removeItem('instalert_token'); localStorage.removeItem('instalert_user'); router.navigate(['/login']);
    }
    return throwError(() => error);
  }));
};
