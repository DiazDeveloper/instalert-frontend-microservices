import { Component, inject, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PanicButtonStore } from '../../../../emergencies/application/state/panic-button.store';
import { environment } from '../../../../../environments/environment';
import * as L from 'leaflet';

interface UserSummary {
  id: number;
  name: string;
  role: string;
  phone: string;
}

interface IncidentSummary {
  id: number;
  type: string;
  address: string;
  severity: string;
  timeReported: string;
  status: string;
}

interface EmergencySummary {
  id: number;
  type: string;
  location: string;
  status: string;
}

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardViewComponent implements AfterViewInit, OnDestroy {
  public store = inject(PanicButtonStore);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  riskLevel: 'safe' | 'warning' | 'danger' = 'safe';
  private map!: L.Map;

  totalCitizens = 0;
  resolvedReportsCount = 0;
  totalCommunities = 0;
  activeEmergenciesCount = 0;

  recentReports: { id: number; type: string; location: string; time: string; severity: string }[] =
    [];
  nearbyContacts: { id: number; name: string; avatar: string; role: string }[] = [];

  ngAfterViewInit(): void {
    this.initMap();
    this.loadUsersSummary();
    this.loadRecentReports();
    this.loadCommunitiesCount();
    this.loadActiveEmergencies();
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }

  private loadUsersSummary(): void {
    const url = `${environment.serverBaseUrl}${environment.apiBasePath}${environment.usersEndpointPath}`;
    this.http.get<UserSummary[]>(url).subscribe({
      next: (users) => {
        this.totalCitizens = users.length;

        const currentUser = JSON.parse(localStorage.getItem('instalert_user') || '{}');
        this.nearbyContacts = users
          .filter((u) => u.id !== currentUser.id)
          .slice(0, 3)
          .map((u) => ({
            id: u.id,
            name: u.name,
            avatar: (u.name || '')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
            role: u.role,
          }));

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando usuarios', err),
    });
  }

  private loadCommunitiesCount(): void {
    const url = `${environment.serverBaseUrl}${environment.apiBasePath}/communities`;
    this.http.get<any[]>(url).subscribe({
      next: (communities) => {
        this.totalCommunities = communities.length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando comunidades', err),
    });
  }

  private loadActiveEmergencies(): void {
    const url = `${environment.serverBaseUrl}${environment.apiBasePath}/emergencies`;
    this.http.get<EmergencySummary[]>(url).subscribe({
      next: (emergencies) => {
        const active = emergencies.filter((e) => e.status === 'Activa');
        this.activeEmergenciesCount = active.length;

        if (active.length >= 2) {
          this.riskLevel = 'danger';
        } else if (active.length === 1) {
          this.riskLevel = 'warning';
        } else {
          this.riskLevel = 'safe';
        }

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando emergencias', err),
    });
  }

  private loadRecentReports(): void {
    const url = `${environment.serverBaseUrl}${environment.apiBasePath}${environment.incidentsEndpointPath}`;
    this.http.get<IncidentSummary[]>(url).subscribe({
      next: (incidents) => {
        this.resolvedReportsCount = incidents.filter((i) => i.status === 'RESOLVED').length;

        this.recentReports = incidents
          .slice()
          .reverse()
          .slice(0, 3)
          .map((i) => ({
            id: i.id,
            type: i.type,
            location: i.address,
            time: this.timeAgo(i.timeReported),
            severity: (i.severity || 'medium').toLowerCase(),
          }));

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando reportes', err),
    });
  }

  private timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Ahora mismo';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `Hace ${diffHrs} h`;
    const diffDays = Math.floor(diffHrs / 24);
    return `Hace ${diffDays} d`;
  }

  private initMap(): void {
    this.map = L.map('dashboard-map').setView([-12.0464, -77.0428], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.map.setView([lat, lng], 15);

        const userIcon = L.divIcon({
          className: '',
          html: `<div style="width:16px;height:16px;background:#2196F3;border:3px solid white;border-radius:50%;box-shadow:0 0 10px rgba(0,0,0,0.5);"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        L.marker([lat, lng], { icon: userIcon })
          .addTo(this.map)
          .bindPopup('<b>Tu ubicación</b>')
          .openPopup();
      });
    }
  }
}
