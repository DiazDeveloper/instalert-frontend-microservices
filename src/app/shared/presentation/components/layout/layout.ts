import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { UserStore } from '../../../../../app/account/application/user-store';

@Component({
  selector: 'app-layout',
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    RouterModule,
    LanguageSwitcher,
    TranslatePipe,
    NgClass,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  title = '';
  private userStore = inject(UserStore);

  readonly user = this.userStore.user;

  get initials(): string {
    const name = this.user()?.name || '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  constructor(public router: Router) {
    this.userStore.loadFromStorage();
  }

  logout(): void {
    this.userStore.logout();
    this.router.navigate(['/login']);
  }
}
