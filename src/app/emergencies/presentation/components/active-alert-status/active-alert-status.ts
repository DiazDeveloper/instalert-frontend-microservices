import { Component, output, input, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { AlertHistory } from '../../../domain/entities/emergency-alert.entity';
import * as L from 'leaflet';
@Component({
  selector: 'app-active-alert-status',
  standalone: true,
  imports: [],
  templateUrl: './active-alert-status.html',
  styleUrl: './active-alert-status.css',
})
export class ActiveAlertStatusComponent implements OnInit, OnDestroy, AfterViewInit {
  onCancelAlert = output<void>();
  alert = input<AlertHistory | null>(null);
  currentTime = '';
  elapsedTime = '0:00';
  startTimeStr = '';
  fullDurationStr = '0 segundos';
  showCancelModal = false;
  private timer?: ReturnType<typeof setInterval>;
  private map?: L.Map;
  ngOnInit() {
    const created = new Date(this.alert()?.createdAt || Date.now());
    this.currentTime = created.toLocaleString();
    this.startTimeStr = created.toLocaleTimeString();
    const tick = () => {
      const seconds = Math.max(0, Math.floor((Date.now() - created.getTime()) / 1000));
      const minutes = Math.floor(seconds / 60);
      this.elapsedTime = `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
      this.fullDurationStr = `${minutes} min ${seconds % 60} s`;
    };
    tick();
    this.timer = setInterval(tick, 1000);
  }
  ngAfterViewInit() {
    const a = this.alert();
    const lat = a?.latitude ?? -12.0464;
    const lon = a?.longitude ?? -77.0428;
    this.map = L.map('active-alert-map').setView([lat, lon], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
    if (a?.latitude !== undefined && a.longitude !== undefined) {
      L.circleMarker([lat, lon], { radius: 9, color: '#ef3b3b', fillOpacity: 0.9 })
        .addTo(this.map)
        .bindPopup('Ubicación registrada de la alerta');
    }
  }
  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.map?.remove();
  }
  promptCancel() {
    this.showCancelModal = true;
  }
  abortCancel() {
    this.showCancelModal = false;
  }
  confirmCancel() {
    this.showCancelModal = false;
    this.onCancelAlert.emit();
  }
}
