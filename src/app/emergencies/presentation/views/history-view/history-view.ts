import { Component, inject, OnInit } from '@angular/core';
import { PanicButtonStore } from '../../../application/state/panic-button.store';
import { AlertHistoryListComponent } from '../../components/alert-history-list/alert-history-list';

@Component({
  selector: 'app-history-view',
  standalone: true,
  imports: [AlertHistoryListComponent],
  templateUrl: './history-view.html',
  styleUrl: './history-view.css',
})
export class HistoryViewComponent implements OnInit {
  public store = inject(PanicButtonStore);

  ngOnInit() {
    this.store.loadHistory();
  }
}
