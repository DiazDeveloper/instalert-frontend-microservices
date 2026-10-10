import { Component } from '@angular/core';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [],
  template: `
    <div style="color: white;">
      <h2>Perfil de Usuario</h2>
      <p>Aquí irán tus datos personales y la edición de tu cuenta.</p>
    </div>
  `
})
export class ProfileViewComponent {}
