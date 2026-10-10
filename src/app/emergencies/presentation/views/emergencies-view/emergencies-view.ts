import { Component, inject, OnInit, effect } from '@angular/core';
import { PanicButtonStore } from '../../../application/state/panic-button.store';
import { LocationPermissionModal } from '../../components/location-permission-modal/location-permission-modal';
import { GpsConfirmationComponent } from '../../components/gps-confirmation/gps-confirmation';
import { PanicButtonComponent } from '../../components/panic-button/panic-button';
import { ActiveAlertStatusComponent } from '../../components/active-alert-status/active-alert-status';
import { AlertHistoryListComponent } from '../../components/alert-history-list/alert-history-list';
import { EmergencyMapComponent } from '../../components/emergency-map/emergency-map';
import { ReporteService } from '../../../../shared/services/reporte.service';
import { AuthApi } from '../../../../account/infrastructure/auth-api';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-emergencies-view',
  standalone: true,
  imports: [
    LocationPermissionModal,
    GpsConfirmationComponent,
    PanicButtonComponent,
    ActiveAlertStatusComponent,
    AlertHistoryListComponent,
    EmergencyMapComponent,
    NgClass
  ],
  templateUrl: './emergencies-view.html',
  styleUrl: './emergencies-view.css',
})
export class EmergenciesViewComponent implements OnInit {
  public store = inject(PanicButtonStore);
  private reporteService = inject(ReporteService);
  private authApi = inject(AuthApi);

  public isFetchingLocation = false;
  public activeIncidents: any[] = [];
  public totalUsers = 0;
  public totalActiveAlertsCount = 0;
  public gpsPrecision = '0';
  public avgResponseTime = '1:45';

  constructor() {
    effect(() => {
      const history = this.store.alertHistory();
      this.calculateActiveAlertsCount(history);
    });
  }

  ngOnInit() {
    this.store.loadHistory();
    if (this.store.permissionState() === 'granted') {
      this.fetchLocation();
    }
    this.loadDashboardData();
  }

  handlePermissionDecision(granted: boolean) {
    this.store.setPermission(granted);
    if (granted) {
      this.fetchLocation();
    }
  }

  async fetchLocation() {
    this.isFetchingLocation = true;
    try {
      await this.store.requestLocation();
    } catch (error) {
    } finally {
      this.isFetchingLocation = false;
    }
  }

  handleLocationConfirmed() {
    this.store.confirmLocation();
    this.calculateGpsPrecision();
  }

  handleAlertDispatch() {
    this.store.dispatchAlert();
  }

  handleCancelAlert() {
    this.store.cancelAlert();
  }

  returnToDashboard() {
    this.store.resetToIdle();
  }

  loadDashboardData() {
    this.authApi.getCount().subscribe(result => {
      this.totalUsers = result.count;
    });

    this.reporteService.getReportes().subscribe(reportes => {
      const active = reportes.filter(r => 
        r.status === 'ACTIVE' || r.statusText === 'ACTIVA' || 
        r.severity === 'HIGH' || r.severity === 'CRITICAL' || r.severity === 'WARNING'
      ).slice(0, 3);

      this.activeIncidents = active.map(r => {
        const myLoc = this.store.currentLocation();
        const incLat = r.latitude || r.coords?.[0];
        const incLng = r.longitude || r.coords?.[1];
        let distanceStr = 'Distancia desconocida';

        if (myLoc && incLat && incLng) {
          const distKm = this.getDistanceFromLatLonInKm(myLoc.latitude, myLoc.longitude, incLat, incLng);
          distanceStr = distKm < 1 ? `A ${Math.floor(distKm * 1000)}m` : `A ${distKm.toFixed(1)}km`;
        }

        return {
          id: r.id,
          title: r.type || r.tipo,
          locationStr: `${r.address || r.direccion} • ${distanceStr} • ${this.formatTimeAgo(r.timeReported || r.tiempo)}`,
          severityClass: this.mapSeverityToClass(r.severity || r.nivelRiesgo),
          statusText: r.statusText || 'En Curso'
        };
      });

      this.calculateActiveAlertsCount(this.store.alertHistory());
    });
  }

  calculateActiveAlertsCount(history: any[]) {
    const activeEmergencies = history.filter(a => a.status === 'Activa').length;
    this.totalActiveAlertsCount = activeEmergencies + this.activeIncidents.length;
  }

  calculateGpsPrecision() {
    const acc = this.store.currentLocation()?.accuracy || 100;
    const precision = Math.max(50, 100 - (acc / 5)); 
    this.gpsPrecision = precision.toFixed(1);
  }

  private formatTimeAgo(dateString: string): string {
    if (!dateString) return 'Hace instantes';
    const past = new Date(dateString).getTime();
    if (isNaN(past)) return 'Hace instantes';

    const diffMin = Math.floor((Date.now() - past) / 60000);
    if (diffMin < 1) return 'Hace menos de 1 min';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    return `Hace ${Math.floor(diffMin / 60)} horas`;
  }

  private mapSeverityToClass(severity: string) {
    const s = severity?.toLowerCase();
    if (s === 'high' || s === 'critical' || s === 'red') return { bg: 'bg-red', text: 'st-red' };
    if (s === 'medium' || s === 'warning' || s === 'orange') return { bg: 'bg-yellow', text: 'st-yellow' };
    return { bg: 'bg-green', text: 'st-green' };
  }

  private getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }
}
