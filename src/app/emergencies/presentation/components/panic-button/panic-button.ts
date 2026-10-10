import { Component, output, input } from '@angular/core';
import { Geolocation } from '../../../domain/value-objects/geolocation.value-object';

@Component({
  selector: 'app-panic-button',
  standalone: true,
  imports: [],
  templateUrl: './panic-button.html',
  styleUrl: './panic-button.css',
})
export class PanicButtonComponent {
  location = input<Geolocation | null>(null);
  alertConfirmed = output<void>();
  showConfirmation = false;

  triggerClick() {
    this.showConfirmation = true;
  }

  cancel() {
    this.showConfirmation = false;
  }

  confirm() {
    this.showConfirmation = false;
    this.alertConfirmed.emit();
  }
}
