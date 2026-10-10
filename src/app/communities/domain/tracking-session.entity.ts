export interface TrackingSession {
  sessionId: string;
  citizenId: number;
  citizenName: string;
  currentLocation: { lat: number; lng: number };
  status: 'Active' | 'Arrived' | 'Danger';
  lastUpdate: string;
}
