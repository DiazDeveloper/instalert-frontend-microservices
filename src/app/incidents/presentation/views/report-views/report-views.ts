import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ReporteService } from '../../../../shared/services/reporte.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './report-views.html',
  styleUrls: ['./report-views.css'],
})
export class ReportesComponent implements OnInit, AfterViewInit {
  radioValue: number = 5.0;
  selectedRiskLevel: string = 'all';

  private map: any;
  private userPosition: [number, number] = [-12.1222, -77.0298];

  incidentes: any[] = [];
  incidentesFiltrados: any[] = [];
  riskZones: any[] = [];
  emergencias: any[] = [];

  get highRiskZonesCount(): number {
    return this.incidentes.filter((inc) => inc.nivelRiesgo === 'high').length;
  }

  get mediumRiskZonesCount(): number {
    return this.incidentes.filter((inc) => inc.nivelRiesgo === 'medium').length;
  }

  get lowRiskZonesCount(): number {
    return this.incidentes.filter((inc) => inc.nivelRiesgo === 'low').length;
  }

  get totalRiskZoneIncidents(): number {
    return this.incidentes.length;
  }

  constructor(
    private reporteService: ReporteService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.initMap();
    this.obtenerUbicacionActual();
    this.cargarDatos();
    this.cargarZonasRiesgo();
    this.cargarEmergencias();
  }

  private initMap() {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map-radar', {
      center: this.userPosition,
      zoom: 14,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 400);
  }

  private obtenerUbicacionActual() {
    if (!navigator.geolocation) {
      console.warn('Geolocalización no soportada por este navegador.');
      this.addMarkers();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userPosition = [position.coords.latitude, position.coords.longitude];

        if (this.map) {
          this.map.setView(this.userPosition, 15);
        }

        this.addMarkers();
      },
      (error) => {
        console.warn('No se pudo obtener la ubicación actual:', error);
        this.addMarkers();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  cargarDatos() {
    this.reporteService.getReportes().subscribe({
      next: (data) => {
        const idsVistos = new Set();
        const listaProcesada: any[] = [];

        data.forEach((inc: any) => {
          if (!idsVistos.has(inc.id)) {
            idsVistos.add(inc.id);

            const lat = inc.latitude ?? inc.coords?.[0] ?? inc.coordinates?.lat ?? -12.1222;
            const lng = inc.longitude ?? inc.coords?.[1] ?? inc.coordinates?.lng ?? -77.0298;

            listaProcesada.push({
              ...inc,
              tipo: inc.tipo || inc.type || 'Incidente',
              direccion: inc.direccion || inc.address || 'Ubicación desconocida',
              tiempo: inc.tiempo || inc.timeReported || 'Ahora',
              statusText: inc.statusText || inc.status || 'ACTIVO',
              estado: this.mapearEstadoCSS(inc.severity || inc.estado),
              nivelRiesgo: this.mapearNivelRiesgo(inc.severity || inc.estado),
              hexColor: this.obtenerHexColor(inc.severity || inc.estado),
              coords: [lat, lng],
              esEliminable: true,
            });
          }
        });

        this.incidentes = [...listaProcesada];
        this.aplicarFiltroRiesgo();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar incidentes:', err),
    });
  }

  cargarZonasRiesgo() {
    this.reporteService.getRiskZones().subscribe({
      next: (data) => {
        this.riskZones = data.map((zone: any) => ({
          ...zone,
          hexColor: this.obtenerColorZonaRiesgo(zone.level),
          radio: this.obtenerRadioZonaRiesgo(zone.level),
        }));

        this.addMarkers();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar zonas de riesgo:', err),
    });
  }

  cargarEmergencias() {
    this.reporteService.getEmergencies().subscribe({
      next: (data) => {
        this.emergencias = data.filter((e: any) => e.status === 'Activa');
        this.addMarkers();
      },
      error: (err) => console.error('Error al cargar emergencias:', err),
    });
  }

  cambiarFiltroRiesgo(level: string) {
    this.selectedRiskLevel = level;
    this.aplicarFiltroRiesgo();
  }

  private aplicarFiltroRiesgo() {
    if (this.selectedRiskLevel === 'all') {
      this.incidentesFiltrados = [...this.incidentes];
    } else {
      this.incidentesFiltrados = this.incidentes.filter(
        (inc) => inc.nivelRiesgo === this.selectedRiskLevel,
      );
    }

    this.addMarkers();
  }

  private mapearNivelRiesgo(valor: string): string {
    const mapa: any = {
      high: 'high',
      critical: 'high',
      red: 'high',

      medium: 'medium',
      warning: 'medium',
      orange: 'medium',

      low: 'low',
      resolved: 'low',
      info: 'low',
      closed: 'low',
      green: 'low',
    };

    return mapa[valor?.toLowerCase()] || 'high';
  }

  private mapearEstadoCSS(valor: string): string {
    const mapa: any = {
      high: 'red',
      critical: 'red',
      red: 'red',

      medium: 'orange',
      warning: 'orange',
      orange: 'orange',

      low: 'green',
      resolved: 'green',
      info: 'green',
      closed: 'green',
      green: 'green',
    };

    return mapa[valor?.toLowerCase()] || 'red';
  }

  private obtenerColorZonaRiesgo(level: string): string {
    const mapa: any = {
      high: '#ff3333',
      medium: '#ffaa00',
      low: '#00ff88',
    };

    return mapa[level] || '#ff3333';
  }

  private obtenerRadioZonaRiesgo(level: string): number {
    const mapa: any = {
      high: 1400,
      medium: 1000,
      low: 700,
    };

    return mapa[level] || 700;
  }

  private addMarkers() {
    if (!this.map) return;

    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.CircleMarker || layer instanceof L.Circle) {
        this.map.removeLayer(layer);
      }
    });

    this.riskZones.forEach((zone) => {
      L.circle([zone.coordinates.lat, zone.coordinates.lng], {
        radius: zone.radio,
        fillColor: zone.hexColor,
        color: zone.hexColor,
        weight: 2,
        opacity: 0.6,
        fillOpacity: 0.1,
      })
        .addTo(this.map)
        .bindPopup(`<b>${zone.name}</b><br>${zone.incidentCount} incidentes`);
    });

    L.circleMarker(this.userPosition, {
      radius: 9,
      fillColor: '#00f2ff',
      color: '#ffffff',
      weight: 3,
      fillOpacity: 1,
    })
      .addTo(this.map)
      .bindPopup('<b>Tú</b>');

    this.incidentesFiltrados.forEach((inc) => {
      L.circleMarker([inc.coords[0], inc.coords[1]], {
        radius: 7,
        fillColor: inc.hexColor,
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      })
        .addTo(this.map)
        .bindPopup(`<b>${inc.tipo}</b><br>${inc.statusText}`);
    });

    this.emergencias.forEach((em) => {
      if (em.location) {
        const match = em.location.match(/Lat:\s*([-\d.]+)\s*\|\s*Lon:\s*([-\d.]+)/);
        if (match) {
          const lat = parseFloat(match[1]);
          const lng = parseFloat(match[2]);

          const emergIcon = L.divIcon({
            className: '',
            html: `<div style="width:18px;height:18px;background:#ef3b3b;border:3px solid white;border-radius:50%;box-shadow:0 0 12px rgba(239,59,59,0.9);"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker([lat, lng], { icon: emergIcon })
            .addTo(this.map)
            .bindPopup(`<b>🚨 Emergencia activa</b><br>${em.type}`);
        }
      }
    });

    this.map.panTo(this.userPosition);
  }

  seleccionarIncidente(incidente: any) {
    if (!this.map || !incidente.coords) return;

    const lat = incidente.coords[0];
    const lng = incidente.coords[1];

    this.map.flyTo([lat, lng], 16, {
      animate: true,
      duration: 0.8,
    });

    setTimeout(() => {
      L.popup()
        .setLatLng([lat, lng])
        .setContent(`<b>${incidente.tipo}</b><br>${incidente.statusText}`)
        .openOn(this.map);
    }, 900);
  }

  eliminarIncidente(id: any) {
    if (confirm('¿Deseas eliminar este reporte personal?')) {
      this.reporteService.eliminarReporte(id).subscribe({
        next: () => {
          this.incidentes = this.incidentes.filter((inc) => inc.id !== id);
          this.aplicarFiltroRiesgo();
          this.cdr.detectChanges();
        },
      });
    }
  }
  cambiarEstado(item: any, event: Event) {
    event.stopPropagation();
    const nuevoStatus = item.statusText === 'ACTIVE' ? 'RESOLVED' : 'ACTIVE';

    this.reporteService.actualizarEstado(item.id, nuevoStatus).subscribe({
      next: (updated) => {
        item.statusText = updated.status;
        item.estado = this.mapearEstadoCSS(updated.status);
        item.nivelRiesgo = this.mapearNivelRiesgo(updated.status);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al actualizar estado:', err),
    });
  }

  onRadioChange(event: any) {
    this.radioValue = parseFloat((event.target as HTMLInputElement).value);
  }

  irACrearReporte() {
    this.router.navigate(['/app/crear-reporte']);
  }

  centrarUbicacionActual() {
    this.obtenerUbicacionActual();
  }

  private obtenerHexColor(valor: string): string {
    const mapa: any = {
      high: '#ff3333',
      critical: '#ff3333',
      red: '#ff3333',

      medium: '#ffaa00',
      warning: '#ffaa00',
      orange: '#ffaa00',

      low: '#00ff88',
      resolved: '#00ff88',
      info: '#00ff88',
      closed: '#00ff88',
      green: '#00ff88',
    };

    return mapa[valor?.toLowerCase()] || '#ff3333';
  }
}
