import { Component, input, inject } from '@angular/core';
import { AlertHistory } from '../../../domain/entities/emergency-alert.entity';
import { EmergencyHttpAdapter } from '../../../infrastructure/adapters/emergency-http.adapter';

@Component({
  selector: 'app-alert-history-list',
  standalone: true,
  imports: [],
  templateUrl: './alert-history-list.html',
  styleUrl: './alert-history-list.css',
})
export class AlertHistoryListComponent {
  alerts = input<AlertHistory[]>([]);
  private httpAdapter = inject(EmergencyHttpAdapter);

  cancelar(item: AlertHistory) {
    this.httpAdapter.updateEmergencyStatus(item.id, 'Cancelada', 'badge-canceled').subscribe({
      next: (updated) => {
        item.status = updated.status;
        item.statusClass = updated.statusClass;
      },
      error: (err) => console.error('Error al cancelar:', err),
    });
  }
}
