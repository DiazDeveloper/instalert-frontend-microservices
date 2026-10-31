import { Component, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { UserStore } from '../../../../account/application/user-store';
interface Contact {
  id: string;
  requester: string;
  recipient: string;
  status: string;
}
interface Notice {
  id: string;
  event_type: string;
  payload: string;
  received_at: string;
  read_at: string | null;
}
interface Entry {
  accountId: string;
  name: string;
}
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <h1>Avisos de emergencia</h1>
    <p>
      Los avisos llegan a esta bandeja cuando ambas personas aceptan el vínculo de confianza. Se
      actualiza cada tres segundos.
    </p>
    @if (error()) {
      <p role="alert">{{ error() }}</p>
    }
    <label
      ><input type="checkbox" [ngModel]="enabled()" (ngModelChange)="preference($event)" /> Recibir
      nuevas alertas de mis contactos</label
    >
    <h2>Contactos de confianza</h2>
    <label
      >Persona
      <select [(ngModel)]="target">
        <option value="">Seleccionar</option>
        @for (person of directory(); track person.accountId) {
          <option [value]="person.accountId">{{ person.name }}</option>
        }
      </select></label
    >
    <button (click)="invite()" [disabled]="!target">Invitar</button>
    @for (c of contacts(); track c.id) {
      <p>
        {{ name(c.requester === me() ? c.recipient : c.requester) }} — {{ c.status }}
        @if (c.status === 'PENDING' && c.recipient === me()) {
          <button (click)="accept(c.id)">Aceptar invitación</button>
        }
        @if (c.status !== 'REVOKED') {
          <button (click)="revoke(c.id)">Revocar vínculo</button>
        }
      </p>
    }
    <h2>Avisos recibidos</h2>
    @if (notices().length === 0) {
      <p>Todavía no has recibido avisos.</p>
    }
    @for (n of notices(); track n.id) {
      <article [class.unread]="!n.read_at">
        <h3>
          {{
            n.event_type === 'EmergencyAlertCreated' ? 'Alerta de emergencia' : 'Alerta cancelada'
          }}
        </h3>
        <p>{{ name(payload(n).accountId) }} · {{ n.received_at | date: 'short' }}</p>
        <p>Estado: {{ payload(n).status }} · Tipo: {{ payload(n).type }}</p>
        <p>Ubicación comunicada: {{ payload(n).latitude }}, {{ payload(n).longitude }}</p>
        <p>Identificador de alerta: {{ payload(n).id }}</p>
        @if (!n.read_at) {
          <button (click)="read(n.id)">Marcar como leído</button>
        }
      </article>
    }
    <button (click)="previous()" [disabled]="page === 0">Anterior</button>
    <span> Página {{ page + 1 }} </span
    ><button (click)="next()" [disabled]="notices().length < 50">Siguiente</button>
  `,
  styles: [
    `
      :host {
        display: block;
        box-sizing: border-box;
        max-width: 950px;
        margin: auto;
        background: #fff;
        color: #17212b;
        padding: 24px;
        border-radius: 12px;
        overflow-wrap: anywhere;
      }
      select {
        max-width: 100%;
      }
      article {
        overflow-wrap: anywhere;
      }
      article {
        border: 1px solid #ddd;
        border-radius: 10px;
        padding: 16px;
        margin: 14px 0;
      }
      .unread {
        border-left: 5px solid #c62828;
        background: #fff6f4;
      }
      button,
      select {
        padding: 8px;
        margin: 6px;
      }
      p {
        line-height: 1.5;
      }
    `,
  ],
})
export class NotificationsView implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private user = inject(UserStore);
  private base = environment.serverBaseUrl + environment.apiBasePath + '/communities';
  contacts = signal<Contact[]>([]);
  notices = signal<Notice[]>([]);
  directory = signal<Entry[]>([]);
  enabled = signal(true);
  error = signal('');
  target = '';
  page = 0;
  private timer?: ReturnType<typeof setInterval>;
  private destroyed = false;
  me() {
    return this.user.user()?.accountId;
  }
  ngOnInit() {
    this.http
      .get<Entry[]>(environment.serverBaseUrl + environment.apiBasePath + '/account/directory')
      .subscribe({
        next: (v) => this.directory.set(v.filter((x) => x.accountId !== this.me())),
        error: () => this.error.set('No se pudo cargar el directorio.'),
      });
    this.http
      .get<{ enabled: boolean }>(this.base + '/notification-preferences')
      .subscribe({
        next: (v) => this.enabled.set(v.enabled),
        error: () => this.error.set('No se pudieron cargar las preferencias.'),
      });
    this.refresh();
    this.timer = setInterval(() => this.refresh(), 3000);
  }
  ngOnDestroy() {
    this.destroyed = true;
    clearInterval(this.timer);
  }
  refresh() {
    const account = this.me();
    this.http.get<Contact[]>(this.base + '/contacts').subscribe({
      next: (v) => {
        if (!this.destroyed && account === this.me()) this.contacts.set(v);
      },
      error: () => this.error.set('No se pudo actualizar. Se reintentará automáticamente.'),
    });
    this.http.get<Notice[]>(this.base + '/notifications?page=' + this.page).subscribe({
      next: (v) => {
        if (!this.destroyed && account === this.me()) {
          this.notices.set(v);
          this.error.set('');
        }
      },
      error: () => this.error.set('No se pudo consultar la bandeja.'),
    });
  }
  name(id: string) {
    return this.directory().find((x) => x.accountId === id)?.name ?? id;
  }
  payload(n: Notice) {
    return JSON.parse(n.payload) as {
      accountId: string;
      id: string;
      status: string;
      type: string;
      latitude: number;
      longitude: number;
    };
  }
  private action(request: import('rxjs').Observable<unknown>) {
    request.subscribe({
      next: () => {
        this.error.set('');
        this.refresh();
      },
      error: () =>
        this.error.set('No se pudo completar la operación. Comprueba tu sesión y tus permisos.'),
    });
  }
  invite() {
    this.action(this.http.post(this.base + '/contacts', { accountId: this.target }));
  }
  accept(id: string) {
    this.action(this.http.put(this.base + '/contacts/' + id + '/accept', {}));
  }
  revoke(id: string) {
    this.action(this.http.delete(this.base + '/contacts/' + id));
  }
  read(id: string) {
    this.action(this.http.put(this.base + '/notifications/' + id + '/read', {}));
  }
  preference(enabled: boolean) {
    this.http
      .put(this.base + '/notification-preferences', { enabled })
      .subscribe({
        next: () => this.enabled.set(enabled),
        error: () => this.error.set('No se guardaron las preferencias.'),
      });
  }
  previous() {
    this.page--;
    this.refresh();
  }
  next() {
    this.page++;
    this.refresh();
  }
}
