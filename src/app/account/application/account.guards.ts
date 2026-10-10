import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { UserStore } from './user-store';
export const accountGuard: CanActivateFn = () => {
  const store = inject(UserStore); const router = inject(Router);
  return store.validateSession().pipe(map(valid => valid || router.createUrlTree(['/login'])));
};
export const adminGuard: CanActivateFn = () => {
  const store = inject(UserStore); const router = inject(Router);
  return store.validateSession().pipe(map(valid => valid && store.isAdmin() ? true : router.createUrlTree([valid ? '/app/dashboard' : '/login'])));
};
