import { Component, input, effect, OnInit, OnDestroy } from '@angular/core';
import { Geolocation } from '../../../domain/value-objects/geolocation.value-object';
import { AlertHistory } from '../../../domain/entities/emergency-alert.entity';
import * as L from 'leaflet';

@Component({
  selector: 'app-emergency-map',
  standalone: true,
  template: `<div id="leaflet-map"></div>`,
  styles: [
    `
      #leaflet-map {
        width: 100%;
        height: 100%;
        border-radius: 12px 12px 0 0;
        z-index: 1; /* Evita que el mapa se sobreponga a tus modales */
      }
    `,
  ],
})
export class EmergencyMapComponent implements OnInit, OnDestroy {
  userLocation = input<Geolocation | null>(null);
  alerts = input<AlertHistory[]>([]);

  private map!: L.Map;
  private userMarker!: L.Marker;

  constructor() {
    // Reparación del ícono roto por defecto de Leaflet en Angular
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = iconDefault;

    // Reactividad: Si la ubicación cambia, centramos el mapa automáticamente
    effect(() => {
      const loc = this.userLocation();
      if (loc && this.map) {
        this.updateUserMarker(loc.latitude, loc.longitude);
      }
    });
  }

  ngOnInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    // Coordenadas iniciales (Centro de Perú por defecto)
    this.map = L.map('leaflet-map').setView([-12.0464, -77.0428], 14);

    // Cargamos los "azulejos" (tiles) de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);
  }

  private updateUserMarker(lat: number, lng: number) {
    this.map.setView([lat, lng], 16);

    if (this.userMarker) {
      this.userMarker.setLatLng([lat, lng]);
    } else {
      // Un ícono circular azul para el usuario (similar al tuyo en CSS)
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `<div style="width:16px;height:16px;background-color:#2196F3;border:3px solid white;border-radius:50%;box-shadow:0 0 10px rgba(0,0,0,0.5);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      this.userMarker = L.marker([lat, lng], { icon: userIcon })
        .addTo(this.map)
        .bindPopup('<b>Tú estás aquí</b>');
    }
  }
}
