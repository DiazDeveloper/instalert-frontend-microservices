export interface AlertHistory {
  id: number;
  userId?: number;
  type: string;
  location: string;
  time: string;
  status: string;
  statusClass: string;
  createdAt?: string;
}

export type PermissionState = 'pending' | 'granted' | 'denied';
export type DashboardState = 'idle' | 'active' | 'canceled';
