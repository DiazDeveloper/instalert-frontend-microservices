import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PermissionState } from '../domain/entities/emergency-alert.entity';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmergencyApi {
  private http = inject(HttpClient);
  private url = `${environment.serverBaseUrl}${environment.apiBasePath}${environment.emergenciesEndpointPath}`;

  private readonly PERM_KEY = 'instalert_location_permission';
  private readonly LOC_KEY = 'instalert_location_confirmed';

  // localStorage (permisos)
  getPermissionStatus(): PermissionState {
    return (localStorage.getItem(this.PERM_KEY) as PermissionState) || 'pending';
  }

  savePermissionStatus(state: PermissionState): void {
    localStorage.setItem(this.PERM_KEY, state);
  }

  getLocationConfirmed(): boolean {
    return localStorage.getItem(this.LOC_KEY) === 'true';
  }

  saveLocationConfirmed(status: boolean): void {
    localStorage.setItem(this.LOC_KEY, String(status));
  }

  // HTTP (historial)
  getEmergencies(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  createEmergency(emergency: any): Observable<any> {
    return this.http.post<any>(this.url, emergency);
  }
}
