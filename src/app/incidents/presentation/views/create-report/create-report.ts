import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ReporteService } from '../../../../shared/services/reporte.service';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from '../../../../account/application/user-store';

import * as L from 'leaflet';

@Component({
  selector: 'app-crear-reporte',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './create-report.html',
  styleUrls: ['./create-report.css'],
})
export class CrearReporteComponent implements OnInit {
  nuevoReporte = {
    tipo: '',
    ubicacion: '',
    descripcion: '',
    lat: -12.1222,
    lng: -77.0298,
    fecha: '',
    severity: '',
    estado: 'red',
    statusText: 'ACTIVA',
  };

  previewUrl: string | null = null;
  private map: any;
  private marker: any;

  constructor(
    private reporteService: ReporteService,
    private router: Router,
    private userStore: UserStore,
  ) {}

  ngOnInit() {
    this.nuevoReporte.ubicacion = `Lat: ${this.nuevoReporte.lat.toFixed(4)}, Lng: ${this.nuevoReporte.lng.toFixed(4)}`;
    this.initMap();
    this.obtenerUbicacionActual();
  }

  private initMap() {
    this.map = L.map('map-form').setView([this.nuevoReporte.lat, this.nuevoReporte.lng], 15);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.marker = L.marker([this.nuevoReporte.lat, this.nuevoReporte.lng], {
      draggable: true,
    }).addTo(this.map);

    this.marker.on('dragend', () => {
      const position = this.marker.getLatLng();

      this.nuevoReporte.lat = position.lat;
      this.nuevoReporte.lng = position.lng;
      this.nuevoReporte.ubicacion = `Lat: ${position.lat.toFixed(4)}, Lng: ${position.lng.toFixed(4)}`;
    });
  }

  obtenerUbicacionActual() {
    if (!navigator.geolocation) {
      console.warn('Geolocalización no soportada por este navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.nuevoReporte.lat = lat;
        this.nuevoReporte.lng = lng;
        this.nuevoReporte.ubicacion = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;

        this.map.setView([lat, lng], 16);
        this.marker.setLatLng([lat, lng]);
      },
      (error) => {
        console.warn('No se pudo obtener la ubicación actual:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  async cambiarUbicacion() {
    const center = this.map.getCenter();

    this.nuevoReporte.lat = center.lat;
    this.nuevoReporte.lng = center.lng;

    this.marker.setLatLng([center.lat, center.lng]);

    this.nuevoReporte.ubicacion = await this.obtenerDireccionDesdeCoordenadas(
      center.lat,
      center.lng,
    );
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async publicarReporte() {
    const user = this.userStore.user();
    if (!user || !this.userStore.isLoggedIn()) return;
    if (!this.nuevoReporte.fecha) {
      this.nuevoReporte.fecha = new Date().toISOString();
    }

    const direccion = await this.obtenerDireccionDesdeCoordenadas(
      this.nuevoReporte.lat,
      this.nuevoReporte.lng,
    );

    this.nuevoReporte.ubicacion = direccion;

    const reporteFinal = {
      userId: user.id,
      type: this.nuevoReporte.tipo,
      severity: this.nuevoReporte.severity.toUpperCase(),
      timeReported: this.nuevoReporte.fecha,
      address: this.nuevoReporte.ubicacion,
      description: this.nuevoReporte.descripcion,
      status: 'ACTIVE',
      latitude: this.nuevoReporte.lat,
      longitude: this.nuevoReporte.lng,
    };

    this.reporteService.crearReporte(reporteFinal).subscribe({
      next: () => {
        alert('¡Reporte creado con éxito!');
        this.router.navigate(['/app/reportes']);
      },
    });
  }

  private async obtenerDireccionDesdeCoordenadas(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      );

      const data = await response.json();
      const address = data.address || {};

      const calle = address.road || address.pedestrian || address.footway || '';
      const numero = address.house_number || '';
      const distrito = address.suburb || address.neighbourhood || address.city_district || '';

      const direccionFormateada = [`${calle} ${numero}`.trim(), distrito]
        .filter(Boolean)
        .join(', ');

      return (
        direccionFormateada || data.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
      );
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    }
  }
}
