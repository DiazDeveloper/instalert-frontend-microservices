export interface TrustedContact {
  id: number;
  name: string;
  email: string;
  role: string;
  currentLocation: string;
  phone: string;
  avatar?: string;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
}
