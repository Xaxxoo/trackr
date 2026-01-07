export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}