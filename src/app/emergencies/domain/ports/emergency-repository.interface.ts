import { Observable } from 'rxjs';
import { AlertHistory } from '../entities/emergency-alert.entity';

export interface IEmergencyRepository {
  getHistory(): Observable<AlertHistory[]>;
  saveEmergency(emergency: Partial<AlertHistory>): Observable<AlertHistory>;
  updateEmergencyStatus(id: number, status: string, statusClass: string): Observable<AlertHistory>;
}
