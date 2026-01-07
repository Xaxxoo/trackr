export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: {
      id: string;
      name: string;
      permissions: Array<{
        resource: string;
        action: string;
      }>;
    };
  };
}

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}