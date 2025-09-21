export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'lead' | 'member';
  parentOrgId: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'lead';
}

export interface VerifyRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface CreateLeadRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CreateMemberRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
