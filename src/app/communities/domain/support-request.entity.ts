export interface SupportRequest {
  id: number;
  userId: number;
  userName: string;
  type: 'Robo' | 'Sospechoso' | 'Médica' | 'Incendio';
  description: string;
  location: string;
  timestamp: string;
  status: 'Activa' | 'Atendida';
}
