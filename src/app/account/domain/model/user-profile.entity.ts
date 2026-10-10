export interface UserProfile {
  id: number;
  accountId: string;
  roles: string[];
  name: string;
  email: string;
  role: string;
  currentLocation: string;
  avatar: string;
  phone: string;
  birthDate?: string;
  gender?: string;
}

export interface AuthenticatedUser {
  accountId: string;
  profile: UserProfile;
  email: string;
  token: string;
}
