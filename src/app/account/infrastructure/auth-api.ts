import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile, AuthenticatedUser } from '../domain/model/user-profile.entity';
import { environment } from '../../../environments/environment';
export interface Registration { name: string; email: string; password: string; phone: string; birthDate: string; gender: string; }
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private http = inject(HttpClient);
  private base = `${environment.serverBaseUrl}${environment.apiBasePath}`;
  private usersUrl = `${this.base}${environment.usersEndpointPath}`;
  private authUrl = `${this.base}${environment.authenticationEndpointPath}`;
  getUsers(): Observable<UserProfile[]> { return this.http.get<UserProfile[]>(this.usersUrl); }
  getMe(): Observable<UserProfile> { return this.http.get<UserProfile>(`${this.base}/account/me`); }
  getCount(): Observable<{ count: number }> { return this.http.get<{ count: number }>(`${this.base}/account/count`); }
  getUserById(id: string): Observable<UserProfile> { return this.http.get<UserProfile>(`${this.usersUrl}/${encodeURIComponent(id)}`); }
  signIn(email: string, password: string): Observable<AuthenticatedUser> { return this.http.post<AuthenticatedUser>(`${this.authUrl}/sign-in`, { email, password }); }
  signUp(registration: Registration): Observable<AuthenticatedUser> { return this.http.post<AuthenticatedUser>(`${this.authUrl}/sign-up`, registration); }
  changePassword(id: string, currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/${encodeURIComponent(id)}/change-password`, { currentPassword, newPassword });
  }
  updateUser(id: string, data: { name?: string; email: string; phone: string; birthDate: string; gender: string }): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.usersUrl}/${encodeURIComponent(id)}`, data);
  }
}
