export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  permissions?: string[];
  iat?: number; // Issued at
  exp?: number; // Expiration
}

export interface JwtRefreshPayload {
  sub: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}