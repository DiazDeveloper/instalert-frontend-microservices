export interface AlertHistory {
  id: string;
  accountId?: string;
  userId?: number;
  latitude?: number;
  longitude?: number;
  accuracyM?: number;
  locationRecordedAt?: string;
  type: string;
  location: string;
  time: string;
  status: string;
  statusClass: string;
  createdAt?: string;
}

export type PermissionState = 'pending' | 'granted' | 'denied';
export type DashboardState = 'idle' | 'active' | 'canceled';
