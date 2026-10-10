import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RiskZone } from '../domain/risk-zone.entity';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RiskMapStore {
  private http = inject(HttpClient);
  private url = `${environment.serverBaseUrl}${environment.apiBasePath}${environment.riskZonesEndpointPath}`;

  private readonly zonesSignal = signal<RiskZone[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly zones = this.zonesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  constructor() {
    this.loadZones();
  }

  loadZones(): void {
    this.loadingSignal.set(true);
    this.http
      .get<RiskZone[]>(this.url)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (data) => {
          this.zonesSignal.set(data);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al cargar zonas de riesgo');
          this.loadingSignal.set(false);
        },
      });
  }
}
