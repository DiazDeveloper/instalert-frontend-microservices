import { Component } from '@angular/core';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [],
  template: `
    <div style="color: white;">
      <h2>Configuración</h2>
      <p>Aquí irán los ajustes de la aplicación, notificaciones y privacidad.</p>
    </div>
  `
})
export class SettingsViewComponent {}
