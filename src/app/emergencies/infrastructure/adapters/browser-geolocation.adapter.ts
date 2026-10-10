import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ILocationProvider } from '../../domain/ports/location-provider.interface';
import { Geolocation } from '../../domain/value-objects/geolocation.value-object';

@Injectable({
  providedIn: 'root',
})
export class BrowserGeolocationAdapter implements ILocationProvider {
  private http = inject(HttpClient);

  public getCurrentLocation(): Promise<Geolocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La geolocalización no está soportada por este navegador.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude, accuracy } = position.coords;

            // Llamada a Nominatim de OpenStreetMap para traducir la coordenada
            let streetAddress = 'Dirección no encontrada';
            try {
              const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
              const response = await firstValueFrom(this.http.get<any>(url));
              if (response && response.display_name) {
                // Tomamos solo la parte principal de la dirección para no saturar la UI
                streetAddress = response.display_name.split(',').slice(0, 3).join(',');
              }
            } catch (httpError) {
              console.warn('Fallo al obtener el nombre de la calle:', httpError);
            }

            const domainGeolocation = Geolocation.create(
              latitude,
              longitude,
              accuracy,
              streetAddress,
            );
            resolve(domainGeolocation);
          } catch (domainError) {
            reject(domainError);
          }
        },
        (error) => {
          let errorMessage = 'Error al obtener la ubicación geográfica.';
          if (error.code === error.PERMISSION_DENIED) errorMessage = 'Acceso denegado.';
          reject(new Error(errorMessage));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }
}
