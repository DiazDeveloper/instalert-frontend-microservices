import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { UserStore } from '../../../application/user-store';

@Component({
  selector: 'app-profile-settings-view',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './profile-settings-view.html',
  styleUrl: './profile-settings-view.css',
})
export class ProfileSettingsView implements OnInit {
  private userStore = inject(UserStore);

  readonly user = this.userStore.user;
  readonly success = this.userStore.success;
  readonly error = this.userStore.error;

  firstName = '';
  lastName = '';
  phone = '';
  email = '';
  birthDate = '';
  gender = '';
  language = 'Español';

  showPasswordForm = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordError = '';

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    const current = this.user();
    if (!current) return;

    const parts = current.name.split(' ');
    this.firstName = parts[0] || '';
    this.lastName = parts.slice(1).join(' ') || '';
    this.phone = current.phone || '';
    this.email = current.email || '';
    this.birthDate = current.birthDate || '';
    this.gender = current.gender || '';
  }

  saveChanges(): void {
    this.userStore.updateProfile(this.email, this.phone, this.birthDate, this.gender, `${this.firstName} ${this.lastName}`.trim());
  }

  cancel(): void {
    this.loadUserData();
  }

  dismissMessage(): void {
    this.userStore.clearMessages();
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
  }

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword) {
      this.passwordError = 'Completa todos los campos.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Las contraseñas nuevas no coinciden.';
      return;
    }
    if (this.newPassword.length < 8 || new TextEncoder().encode(this.newPassword).length > 72) {
      this.passwordError = 'La contraseña debe tener al menos 8 caracteres y máximo 72 bytes.';
      return;
    }
    this.passwordError = '';
    this.userStore.changePassword(this.currentPassword, this.newPassword);
    this.showPasswordForm = false;
  }

  get initials(): string {
    const name = this.user()?.name || '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
