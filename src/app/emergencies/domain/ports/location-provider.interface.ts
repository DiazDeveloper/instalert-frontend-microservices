import { Geolocation } from '../value-objects/geolocation.value-object';

export interface ILocationProvider {
  /**
   * Obtiene la ubicación actual del usuario.
   * @returns Una promesa que resuelve en un objeto de valor Geolocation perfectamente válido.
   */
  getCurrentLocation(): Promise<Geolocation>;
}
