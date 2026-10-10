import { Injectable } from '@angular/core';
import { Observable, interval, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MonitoringWebsocket {
  simulateGpsTracking(userId: number, userName: string): Observable<any> {
    let baseLat = -12.0464;
    let baseLng = -77.0428;

    return interval(3000).pipe(
      map(() => {
        baseLat += (Math.random() - 0.5) * 0.001;
        baseLng += (Math.random() - 0.5) * 0.001;

        return {
          id_session: 'sess_' + userId,
          user_id: userId,
          full_name: userName,
          lat: baseLat.toString(),
          long: baseLng.toString(),
          state: 'ok',
        };
      }),
    );
  }
}
