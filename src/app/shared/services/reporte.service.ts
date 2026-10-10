import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private incidentsUrl = `${environment.serverBaseUrl}${environment.apiBasePath}${environment.incidentsEndpointPath}`;
  private riskZonesUrl = `${environment.serverBaseUrl}${environment.apiBasePath}${environment.riskZonesEndpointPath}`;

  constructor(private http: HttpClient) {}

  getReportes(): Observable<any[]> {
    return this.http.get<any[]>(this.incidentsUrl);
  }

  getRiskZones(): Observable<any[]> {
    return this.http.get<any[]>(this.riskZonesUrl);
  }

  getEmergencies(): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.serverBaseUrl}${environment.apiBasePath}/emergencies`,
    );
  }

  crearReporte(reporte: any): Observable<any> {
    return this.http.post<any>(this.incidentsUrl, reporte);
  }

  eliminarReporte(id: string | number) {
    return this.http.delete(`${this.incidentsUrl}/${id}`);
  }

  actualizarEstado(id: string | number, status: string): Observable<any> {
    return this.http.put<any>(`${this.incidentsUrl}/${id}/status`, { status });
  }
}
