export interface EmergencyRequestDto {
  id: string;
  accountId: string;
  type: string;
  latitude: number;
  longitude: number;
  accuracyM?: number;
  locationRecordedAt: string;
  createdAt: string;
  cancelledAt?: string;
  status: 'ACTIVE' | 'CANCELLED';
}
export interface EmergencyHistoryPage {
  content: EmergencyRequestDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
