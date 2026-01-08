import { User } from '../entities/user.entity';

export interface PaginatedUsersResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserWithoutPassword extends Omit<User, 'passwordHash' | 'emailVerificationToken' | 'failedLoginAttempts' | 'lockedUntil'> {}