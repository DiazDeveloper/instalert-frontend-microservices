import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-location-permission-modal',
  standalone: true,
  imports: [],
  templateUrl: './location-permission-modal.html',
  styleUrl: './location-permission-modal.css',
})
export class LocationPermissionModal {
  modalState = input<'request' | 'denied'>('request');
  onDecision = output<boolean>();

  makeDecision(granted: boolean) {
    this.onDecision.emit(granted);
  }
}
