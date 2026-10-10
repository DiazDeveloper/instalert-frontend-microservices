import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { UserStore } from '../../../application/user-store';

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './login-view.html',
  styleUrl: './login-view.css',
})
export class LoginView {
  private userStore = inject(UserStore);
  private router = inject(Router);

  email = '';
  password = '';

  readonly error = this.userStore.error;
  readonly success = this.userStore.success;
  readonly loading = this.userStore.loading;

  login(): void {
    if (!this.email || !this.password) return;
    this.userStore.login(this.email, this.password);
  }
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}

