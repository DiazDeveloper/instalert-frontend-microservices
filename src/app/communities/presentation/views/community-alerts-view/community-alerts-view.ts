import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunitySupportStore } from '../../../application/community-support.store';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-community-alerts-view',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './community-alerts-view.html',
  styleUrls: ['./community-alerts-view.css'],
})
export class CommunityAlertsView implements OnInit {
  public supportStore = inject(CommunitySupportStore);

  currentUser: any = null;

  newAlertType: 'Robo' | 'Sospechoso' | 'Médica' | 'Incendio' = 'Sospechoso';
  newAlertLocation: string = '';
  newAlertDescription: string = '';

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('instalert_user') || '{}');
  }

  publishAlert() {
    if (!this.newAlertLocation || !this.newAlertDescription || !this.currentUser.id) {
      alert('Completa la ubicación y descripción para enviar la alerta.');
      return;
    }

    this.supportStore.createAlert({
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      type: this.newAlertType,
      location: this.newAlertLocation,
      description: this.newAlertDescription,
    });

    this.newAlertLocation = '';
    this.newAlertDescription = '';
  }

  attendAlert(alertId: number) {
    this.supportStore.markAsAttended(alertId);
  }
}
