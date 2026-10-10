import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitoringStore } from '../../../application/monitoring.store';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-gps-tracking-view',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './gps-tracking-view.html',
  styleUrls: ['./gps-tracking-view.css'],
})
export class GpsTrackingView implements OnInit {
  public store = inject(MonitoringStore);
  currentUser: any = null;

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('instalert_user') || '{}');
  }

  activarRastreo() {
    if (!this.currentUser?.id) {
      alert('Debes iniciar sesión para usar el GPS.');
      return;
    }
    this.store.startTracking(this.currentUser.id, this.currentUser.name);
  }

  detenerRastreo() {
    this.store.stopTracking();
  }
}
