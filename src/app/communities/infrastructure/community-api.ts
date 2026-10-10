import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommunityApi {
  private http = inject(HttpClient);
  private baseUrl = `${environment.serverBaseUrl}${environment.apiBasePath}`;

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/account/directory`).pipe(
      map(entries => entries.map(entry => ({ ...entry, role: 'Ciudadano', currentLocation: '' }))),
    );
  }

  getCommunities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/communities`);
  }

  createCommunity(community: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/communities`, community);
  }

  deleteCommunity(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/communities/${id}`);
  }
}
