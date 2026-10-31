import { Injectable } from '@angular/core';
import { ILocationProvider } from '../../domain/ports/location-provider.interface';
import { Geolocation } from '../../domain/value-objects/geolocation.value-object';
@Injectable({ providedIn: 'root' })
export class BrowserGeolocationAdapter implements ILocationProvider {
  getCurrentLocation(): Promise<Geolocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Este navegador no dispone de geolocalización.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          try {
            const { latitude, longitude, accuracy } = position.coords;
            resolve(Geolocation.create(latitude, longitude, accuracy, 'Ubicación del navegador'));
          } catch (error) {
            reject(error);
          }
        },
        (error) =>
          reject(
            new Error(
              error.code === error.PERMISSION_DENIED
                ? 'Permite la ubicación en el navegador para registrar la alerta.'
                : 'No se pudo obtener tu ubicación. Comprueba el GPS y vuelve a intentar.',
            ),
          ),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }
}
