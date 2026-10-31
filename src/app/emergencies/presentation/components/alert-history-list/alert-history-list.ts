import { Component, input, inject } from '@angular/core';
import { AlertHistory } from '../../../domain/entities/emergency-alert.entity';
import { PanicButtonStore } from '../../../application/state/panic-button.store';

@Component({
  selector: 'app-alert-history-list',
  standalone: true,
  imports: [],
  templateUrl: './alert-history-list.html',
  styleUrl: './alert-history-list.css',
})
export class AlertHistoryListComponent {
  alerts = input<AlertHistory[]>([]);
  private store = inject(PanicButtonStore);
  cancelar(item: AlertHistory) {
    void this.store.cancelAlert(item.id);
  }
}
