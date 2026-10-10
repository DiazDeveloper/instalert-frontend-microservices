import { Component, output, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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

  currentTime = '';
  elapsedTime = '0:00';
  startTimeStr = '';
  fullDurationStr = '0 segundos';
  showCancelModal = false;

  private timer: any;
  private seconds = 0;
  private map!: L.Map;

  ngOnInit() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('en-GB');

    this.currentTime = `${time} — ${date}`;
    this.startTimeStr = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    this.timer = setInterval(() => {
      this.seconds++;
      const m = Math.floor(this.seconds / 60);
      const s = this.seconds % 60;
      this.elapsedTime = `${m}:${s < 10 ? '0' : ''}${s}`;

      if (m === 0) {
        this.fullDurationStr = `${s} segundos`;
      } else {
        this.fullDurationStr = `${m} minuto${m !== 1 ? 's' : ''} ${s} segundo${s !== 1 ? 's' : ''}`;
      }
    }, 1000);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.map) this.map.remove();
  }

  private initMap() {
    this.map = L.map('active-alert-map').setView([-12.0464, -77.0428], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.map.setView([lat, lng], 16);

        const userIcon = L.divIcon({
          className: '',
          html: `<div style="width:16px;height:16px;background:#ef3b3b;border:3px solid white;border-radius:50%;box-shadow:0 0 15px rgba(239,59,59,0.8);"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        L.marker([lat, lng], { icon: userIcon })
          .addTo(this.map)
          .bindPopup('<b>🚨 Tu ubicación — Alerta activa</b>')
          .openPopup();

        L.circle([lat, lng], {
          radius: 1000,
          fillColor: '#ef3b3b',
          color: '#ef3b3b',
          weight: 1,
          opacity: 0.4,
          fillOpacity: 0.08,
        }).addTo(this.map);
      });
    }
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
