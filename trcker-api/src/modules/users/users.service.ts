import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateProfileDto,
  UserQueryDto,
} from './dto';
import { User } from './entities/user.entity';
import {
  PaginatedUsersResponse,
  UserWithoutPassword,
} from './interfaces/user-response.interface';
import { UserStatistics } from './interfaces/user-statistics.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {}

  /**
   * Create new user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    // Create user
    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash,
    });

    const savedUser = await this.usersRepository.save(user);

    // Return user with relations
    return this.findById(savedUser.id);
  }

  /**
   * Find all users with pagination and filters
   */
  async findAll(query: UserQueryDto): Promise<PaginatedUsersResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      roleId,
      isActive,
      isEmailVerified,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .where('user.deletedAt IS NULL')
      .skip(skip)
      .take(limit);

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (roleId) {
      queryBuilder.andWhere('user.roleId = :roleId', { roleId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    if (isEmailVerified !== undefined) {
      queryBuilder.andWhere('user.isEmailVerified = :isEmailVerified', {
        isEmailVerified,
      });
    }

    // Apply sorting
    const allowedSortFields = ['createdAt', 'email', 'firstName', 'lastName', 'lastLogin'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`user.${sortField}`, sortOrder);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['role', 'role.permissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Check if email is being changed and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailTaken = await this.usersRepository.isEmailTaken(
        updateUserDto.email,
        id,
      );

      if (emailTaken) {
        throw new ConflictException('Email already exists');
      }
    }

    // Update user
    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    return this.findById(updatedUser.id);
  }

  /**
   * Update user profile (self-update with restricted fields)
   */
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    // Only allow specific fields to be updated
    const allowedFields: (keyof UpdateProfileDto)[] = [
      'firstName',
      'lastName',
      'phone',
      'avatar',
      'timezone',
      'language',
    ];

    allowedFields.forEach((field) => {
      if (updateProfileDto[field] !== undefined) {
        (user as any)[field] = updateProfileDto[field];
      }
    });

    const updatedUser = await this.usersRepository.save(user);
    return this.findById(updatedUser.id);
  }

  /**
   * Delete user (soft delete)
   */
  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.softDelete(id);
  }

  /**
   * Restore soft deleted user
   */
  async restore(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!user.deletedAt) {
      throw new BadRequestException('User is not deleted');
    }

    await this.usersRepository.restore(id);
    return this.findById(id);
  }

  /**
   * Activate user
   */
  async activate(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isActive = true;
    await this.usersRepository.save(user);
    return this.findById(id);
  }

  /**
   * Deactivate user
   */
  async deactivate(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isActive = false;
    await this.usersRepository.save(user);
    return this.findById(id);
  }

  /**
   * Lock user account
   */
  async lockAccount(id: string, durationMinutes: number = 30): Promise<User> {
    const user = await this.findById(id);
    const lockedUntil = new Date();
    lockedUntil.setMinutes(lockedUntil.getMinutes() + durationMinutes);

    user.lockedUntil = lockedUntil;
    await this.usersRepository.save(user);
    return this.findById(id);
  }

  /**
   * Unlock user account
   */
  async unlockAccount(id: string): Promise<User> {
    const user = await this.findById(id);
    user.lockedUntil = null;
    user.failedLoginAttempts = 0;
    await this.usersRepository.save(user);
    return this.findById(id);
  }

  /**
   * Increment failed login attempts
   */
  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    const user = await this.findById(userId);
    user.failedLoginAttempts += 1;

    // Lock account after 5 failed attempts
    if (user.failedLoginAttempts >= 5) {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + 30);
      user.lockedUntil = lockedUntil;
    }

    await this.usersRepository.save(user);
  }

  /**
   * Reset failed login attempts
   */
  async resetFailedLoginAttempts(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<User> {
    const user = await this.findById(userId);
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await this.usersRepository.save(user);
    return this.findById(userId);
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<UserStatistics> {
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      lockedUsers,
      usersByRole,
      recentRegistrations,
    ] = await Promise.all([
      this.usersRepository.count({ where: { deletedAt: IsNull() } }),
      this.usersRepository.count({
        where: { isActive: true, deletedAt: IsNull() },
      }),
      this.usersRepository.count({
        where: { isEmailVerified: true, deletedAt: IsNull() },
      }),
      this.usersRepository.findLockedUsers().then((users) => users.length),
      this.usersRepository.getUserStatisticsByRole(),
      this.usersRepository.getRecentRegistrations(7),
    ]);

    const inactiveUsers = totalUsers - activeUsers;
    const unverifiedUsers = totalUsers - verifiedUsers;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      verifiedUsers,
      unverifiedUsers,
      lockedUsers,
      usersByRole: usersByRole.map((item) => ({
        roleId: item.roleId,
        roleName: item.roleName,
        count: parseInt(item.count),
      })),
      recentRegistrations: recentRegistrations.map((item) => ({
        date: item.date,
        count: parseInt(item.count),
      })),
    };
  }

  /**
   * Get active users count
   */
  async getActiveUsersCount(): Promise<number> {
    return this.usersRepository.count({
      where: { isActive: true, deletedAt: IsNull() },
    });
  }

  /**
   * Search users
   */
  async searchUsers(searchTerm: string, limit: number = 10): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.deletedAt IS NULL')
      .andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${searchTerm}%` },
      )
      .take(limit)
      .getMany();
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      lastLogin: new Date(),
    });
  }

  /**
   * Cleanup - unlock expired accounts
   */
  async unlockExpiredAccounts(): Promise<number> {
    return this.usersRepository.unlockExpiredAccounts();
  }
}