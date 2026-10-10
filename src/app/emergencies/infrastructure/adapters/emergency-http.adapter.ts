import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IEmergencyRepository } from '../../domain/ports/emergency-repository.interface';
import { AlertHistory } from '../../domain/entities/emergency-alert.entity';
import { environment } from '../../../../environments/environment';
import { EmergencyRequestDto } from '../../application/dto/emergency-request.dto';
import { EmergencyMapper } from '../mappers/emergency.mapper';

@Injectable({ providedIn: 'root' })
export class EmergencyHttpAdapter implements IEmergencyRepository {
  private http = inject(HttpClient);
  private url = `${environment.serverBaseUrl}${environment.apiBasePath}${environment.emergenciesEndpointPath}`;

  getHistory(): Observable<AlertHistory[]> {
    return this.http
      .get<EmergencyRequestDto[]>(this.url)
      .pipe(map((dtos) => dtos.map((dto) => EmergencyMapper.toEntity(dto))));
  }

  saveEmergency(emergency: Partial<AlertHistory>): Observable<AlertHistory> {
    const dto = EmergencyMapper.toDto(emergency);
    return this.http
      .post<EmergencyRequestDto>(this.url, dto)
      .pipe(map((responseDto) => EmergencyMapper.toEntity(responseDto)));
  }

  updateEmergencyStatus(id: number, status: string, statusClass: string): Observable<AlertHistory> {
    return this.http
      .patch<EmergencyRequestDto>(`${this.url}/${id}`, { status, statusClass })
      .pipe(map((responseDto) => EmergencyMapper.toEntity(responseDto)));
  }
}
