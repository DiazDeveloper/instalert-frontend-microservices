export interface RiskZone {
  id: number;
  name: string;
  level: 'high' | 'medium' | 'low';
  incidentCount: number;
  coordinates: { lat: number; lng: number };
}
