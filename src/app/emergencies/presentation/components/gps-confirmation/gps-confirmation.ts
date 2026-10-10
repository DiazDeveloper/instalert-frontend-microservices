import { Component, input, output, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-gps-confirmation',
  standalone: true,
  imports: [],
  templateUrl: './gps-confirmation.html',
  styleUrl: './gps-confirmation.css',
})
export class GpsConfirmationComponent implements AfterViewInit, OnDestroy {
  latitude = input<number | undefined>();
  longitude = input<number | undefined>();
  accuracy = input<number | undefined>();
  address = input<string | undefined>();
  isLoading = input<boolean>(false);

  onConfirm = output<void>();
  onRequestLocation = output<void>();

  private map!: L.Map;

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  ngOnDestroy() {
    if (this.map) this.map.remove();
  }

  private initMap() {
    const lat = this.latitude() ?? -12.0464;
    const lng = this.longitude() ?? -77.0428;

    this.map = L.map('gps-confirm-map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    const userIcon = L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;background:#2196F3;border:3px solid white;border-radius:50%;box-shadow:0 0 10px rgba(33,150,243,0.8);"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    L.marker([lat, lng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup('<b>Tu ubicación GPS</b>')
      .openPopup();
  }

  confirmLocation() {
    this.onConfirm.emit();
  }

  refreshLocation() {
    this.onRequestLocation.emit();
  }
}
