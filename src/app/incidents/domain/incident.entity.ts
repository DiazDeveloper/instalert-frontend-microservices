export interface Incident {
  id: number;
  userId: number;
  type: string;
  severity: 'critical' | 'warning' | 'resolved' | 'closed' | 'info';
  timeReported: string;
  address: string;
  description: string;
  status: string;
  coordinates: { lat: number; lng: number };
}
