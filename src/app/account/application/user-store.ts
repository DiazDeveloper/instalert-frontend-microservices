import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { AuthApi } from '../infrastructure/auth-api';
import { UserProfile, AuthenticatedUser } from '../domain/model/user-profile.entity';
import { Router } from '@angular/router';
@Injectable({ providedIn: 'root' })
export class UserStore {
  private api = inject(AuthApi);
  private router = inject(Router);
  private readonly userSignal = signal<UserProfile | null>(null);
  private readonly tokenSignal = signal<string | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly successSignal = signal<string | null>(null);
  readonly user = this.userSignal.asReadonly();
  readonly token = this.tokenSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly success = this.successSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.userSignal() !== null && this.validToken(this.tokenSignal()));
  readonly isAdmin = computed(() => this.isLoggedIn() && !!this.userSignal()?.roles.includes('ROLE_ADMIN'));
  login(email: string, password: string): void {
    this.begin();
    this.api.signIn(email, password).subscribe({
      next: session => this.accept(session),
      error: err => this.fail(err.status === 401 ? 'Correo o contraseña incorrectos' : 'Error al conectar con el servidor'),
    });
  }
  register(name: string, email: string, password: string, phone: string, birthDate: string, gender: string): void {
    this.begin();
    this.api.signUp({ name, email, password, phone, birthDate, gender }).subscribe({
      next: session => { this.accept(session); this.successSignal.set('Registro exitoso'); },
      error: err => this.fail(err.status === 409 ? 'Ese correo ya está registrado' : 'Revisa tus datos. La contraseña debe tener al menos 8 caracteres.'),
    });
  }
  private begin(): void { this.logout(); this.loadingSignal.set(true); this.clearMessages(); }
  private accept(session: AuthenticatedUser): void {
    this.tokenSignal.set(session.token); localStorage.setItem('instalert_token', session.token);
    this.saveProfile(session.profile); this.loadingSignal.set(false);
    this.router.navigate([this.isAdmin() ? '/admin' : '/app/dashboard']);
  }
  private saveProfile(profile: UserProfile): void { this.userSignal.set(profile); localStorage.setItem('instalert_user', JSON.stringify(profile)); }
  private fail(message: string): void { this.logout(); this.errorSignal.set(message); this.loadingSignal.set(false); }
  logout(): void {
    this.userSignal.set(null); this.tokenSignal.set(null);
    localStorage.removeItem('instalert_user'); localStorage.removeItem('instalert_token');
  }
  loadFromStorage(): void {
    try {
      const token = localStorage.getItem('instalert_token');
      const profile = JSON.parse(localStorage.getItem('instalert_user') || 'null');
      if (!this.validToken(token) || !profile?.accountId || !Array.isArray(profile.roles)) { this.logout(); return; }
      this.tokenSignal.set(token); this.userSignal.set(profile);
    } catch { this.logout(); }
  }
  /** Route guards validate with Account; cached roles never grant API access. */
  validateSession(): Observable<boolean> {
    this.loadFromStorage(); if (!this.isLoggedIn()) return of(false);
    return this.api.getMe().pipe(tap(profile => this.saveProfile(profile)), map(() => true),
      catchError(() => { this.logout(); return of(false); }));
  }
  private validToken(token: string | null): boolean {
    if (!token) return false;
    try {
      const payload = token.split('.')[1];
      const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return claims.iss === 'ms-account' && claims.aud === 'instalert-api' && typeof claims.exp === 'number' && claims.exp * 1000 > Date.now();
    } catch { return false; }
  }
  changePassword(currentPassword: string, newPassword: string): void {
    const current = this.user(); if (!current) return;
    this.clearMessages();
    this.api.changePassword(current.accountId, currentPassword, newPassword).subscribe({
      next: () => { this.logout(); this.successSignal.set('Contraseña actualizada. Inicia sesión nuevamente.'); this.router.navigate(['/login']); },
      error: () => this.errorSignal.set('Revisa la contraseña actual y la nueva contraseña (mínimo 8 caracteres).'),
    });
  }
  updateProfile(email: string, phone: string, birthDate: string, gender: string, name?: string): void {
    const current = this.user(); if (!current) return;
    this.clearMessages();
    this.api.updateUser(current.accountId, { email, phone, birthDate, gender, name }).subscribe({
      next: updated => { this.saveProfile(updated); this.successSignal.set('Perfil actualizado correctamente'); },
      error: err => this.errorSignal.set(err.status === 409 ? 'Ese correo ya está registrado' : 'Error al actualizar el perfil'),
    });
  }
  clearMessages(): void { this.errorSignal.set(null); this.successSignal.set(null); }
}
