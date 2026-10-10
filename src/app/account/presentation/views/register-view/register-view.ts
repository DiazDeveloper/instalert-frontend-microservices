import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserStore } from '../../../application/user-store';

@Component({
  selector: 'app-register-view',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register-view.html',
  styleUrl: './register-view.css',
})
export class RegisterView {
  private userStore = inject(UserStore);

  name = '';
  lastName = '';
  email = '';
  password = '';
  birthDate = '';
  errorMessage = '';

  readonly error = this.userStore.error;
  readonly loading = this.userStore.loading;


  register(): void {
    if (!this.name || !this.lastName || !this.email || !this.password) {
      this.errorMessage = 'Completa todos los campos.';
      return;
    }

    if (this.password.length < 8 || new TextEncoder().encode(this.password).length > 72) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres y máximo 72 bytes.';
      return;
    }
    this.errorMessage = '';
    const fullName = `${this.name} ${this.lastName}`;

    this.userStore.register(fullName, this.email, this.password, '', this.birthDate, '');
  }
}
