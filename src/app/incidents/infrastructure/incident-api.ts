import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Incident } from '../domain/incident.entity';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IncidentApi {
  private http = inject(HttpClient);
  private url = `${environment.serverBaseUrl}${environment.apiBasePath}${environment.incidentsEndpointPath}`;

  getIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.url);
  }

  getIncidentById(id: number): Observable<Incident> {
    return this.http.get<Incident>(`${this.url}/${id}`);
  }

  createIncident(incident: Partial<Incident>): Observable<Incident> {
    return this.http.post<Incident>(this.url, incident);
  }

  updateIncident(incident: Incident): Observable<Incident> {
    return this.http.put<Incident>(`${this.url}/${incident.id}`, incident);
  }

  deleteIncident(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
