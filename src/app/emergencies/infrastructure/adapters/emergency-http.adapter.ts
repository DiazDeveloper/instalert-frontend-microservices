import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, expand, reduce, EMPTY } from 'rxjs';
import { IEmergencyRepository } from '../../domain/ports/emergency-repository.interface';
import { AlertHistory } from '../../domain/entities/emergency-alert.entity';
import { environment } from '../../../../environments/environment';
import {
  EmergencyRequestDto,
  EmergencyHistoryPage,
} from '../../application/dto/emergency-request.dto';
import { EmergencyMapper } from '../mappers/emergency.mapper';

@Injectable({ providedIn: 'root' })
export class EmergencyHttpAdapter implements IEmergencyRepository {
  private http = inject(HttpClient);
  private url = `${environment.serverBaseUrl}${environment.apiBasePath}${environment.emergenciesEndpointPath}`;

  getHistory(): Observable<AlertHistory[]> {
    return this.http.get<EmergencyHistoryPage>(`${this.url}?size=100&page=0`).pipe(
      expand((page) =>
        page.page + 1 < page.totalPages
          ? this.http.get<EmergencyHistoryPage>(`${this.url}?size=100&page=${page.page + 1}`)
          : EMPTY,
      ),
      reduce(
        (all, page) => [...all, ...page.content.map((dto) => EmergencyMapper.toEntity(dto))],
        [] as AlertHistory[],
      ),
    );
  }

  saveEmergency(
    emergency: Partial<AlertHistory>,
    key: string = crypto.randomUUID(),
  ): Observable<AlertHistory> {
    const dto = EmergencyMapper.toDto(emergency);
    return this.http
      .post<EmergencyRequestDto>(this.url, dto, { headers: { 'Idempotency-Key': key } })
      .pipe(map((responseDto) => EmergencyMapper.toEntity(responseDto)));
  }

  updateEmergencyStatus(id: string, status: string, statusClass: string): Observable<AlertHistory> {
    return this.http
      .patch<EmergencyRequestDto>(`${this.url}/${id}`, { status: 'CANCELLED' })
      .pipe(map((responseDto) => EmergencyMapper.toEntity(responseDto)));
  }
}
