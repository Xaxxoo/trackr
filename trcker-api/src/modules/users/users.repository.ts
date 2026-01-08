import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull, Not, LessThan } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: { email, deletedAt: IsNull() },
      relations: ['role', 'role.permissions'],
    });
  }

  /**
   * Find active users only
   */
  async findActiveUsers(limit: number = 50): Promise<User[]> {
    return this.find({
      where: { isActive: true, deletedAt: IsNull() },
      relations: ['role'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Find locked users
   */
  async findLockedUsers(): Promise<User[]> {
    const now = new Date();
    return this.find({
      where: {
        lockedUntil: Not(IsNull()),
        deletedAt: IsNull(),
      },
      relations: ['role'],
    });
  }

  /**
   * Unlock expired locks
   */
  async unlockExpiredAccounts(): Promise<number> {
    const now = new Date();
    const result = await this.createQueryBuilder()
      .update(User)
      .set({
        lockedUntil: null,
        failedLoginAttempts: 0,
      })
      .where('lockedUntil < :now', { now })
      .andWhere('deletedAt IS NULL')
      .execute();

    return result.affected || 0;
  }

  /**
   * Get user statistics by role
   */
  async getUserStatisticsByRole(): Promise<any[]> {
    return this.createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .select('role.id', 'roleId')
      .addSelect('role.name', 'roleName')
      .addSelect('COUNT(user.id)', 'count')
      .where('user.deletedAt IS NULL')
      .groupBy('role.id')
      .addGroupBy('role.name')
      .getRawMany();
  }

  /**
   * Get recent registrations
   */
  async getRecentRegistrations(days: number = 7): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.createQueryBuilder('user')
      .select("DATE(user.createdAt)", 'date')
      .addSelect('COUNT(user.id)', 'count')
      .where('user.createdAt >= :startDate', { startDate })
      .andWhere('user.deletedAt IS NULL')
      .groupBy('DATE(user.createdAt)')
      .orderBy('DATE(user.createdAt)', 'DESC')
      .getRawMany();
  }

  /**
   * Soft delete user
   */
  async softDelete(userId: string): Promise<void> {
    await this.update(userId, { deletedAt: new Date() });
  }

  /**
   * Restore soft deleted user
   */
  async restore(userId: string): Promise<void> {
    await this.update(userId, { deletedAt: null });
  }

  /**
   * Permanently delete user
   */
  async hardDelete(userId: string): Promise<void> {
    await this.delete(userId);
  }

  /**
   * Check if email exists (excluding specific user)
   */
  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    const query = this.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .andWhere('user.deletedAt IS NULL');

    if (excludeUserId) {
      query.andWhere('user.id != :excludeUserId', { excludeUserId });
    }

    const count = await query.getCount();
    return count > 0;
  }
}