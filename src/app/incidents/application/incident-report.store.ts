import { Injectable, inject, signal } from '@angular/core';
import { IncidentApi } from '../infrastructure/incident-api';
import { Incident } from '../domain/incident.entity';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class IncidentReportStore {
  private api = inject(IncidentApi);

  private readonly incidentsSignal = signal<Incident[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly incidents = this.incidentsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor() {
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.loadingSignal.set(true);
    this.api
      .getIncidents()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (data) => {
          this.incidentsSignal.set(data);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al cargar incidentes');
          this.loadingSignal.set(false);
        },
      });
  }

  createIncident(incident: Partial<Incident>): void {
    this.api.createIncident(incident).subscribe({
      next: (created) => this.incidentsSignal.update((list) => [created, ...list]),
      error: () => this.errorSignal.set('Error al crear incidente'),
    });
  }

  deleteIncident(id: number): void {
    this.api.deleteIncident(id).subscribe({
      next: () => this.incidentsSignal.update((list) => list.filter((i) => i.id !== id)),
      error: () => this.errorSignal.set('Error al eliminar incidente'),
    });
  }
}
