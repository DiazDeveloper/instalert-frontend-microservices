export interface EmergencyRequestDto {
  id?: number;
  userId: number;
  type: string;
  location: string;
  time: string;
  status: string;
  statusClass: string;
  createdAt: string;
}
