import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import {
  AuthResponse,
  TokenResponse,
} from './interfaces/auth-response.interface';
import { JwtPayload, JwtRefreshPayload } from './interfaces/jwt-payload.interface';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordReset } from './entities/password-reset.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository('User')
    private usersRepository: Repository<any>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
  ) {}

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['role', 'role.permissions'],
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  /**
   * User login
   */
  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Update last login
    await this.usersRepository.update(user.id, {
      lastLogin: new Date(),
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      user,
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<number>('jwt.expiresIn', 900), // 15 minutes
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: {
          id: user.role.id,
          name: user.role.name,
          permissions: user.role.permissions.map((p) => ({
            resource: p.resource,
            action: p.action,
          })),
        },
      },
    };
  }

  /**
   * User registration
   */
  async register(
    registerDto: RegisterDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    // Create user
    const user = this.usersRepository.create({
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      roleId: registerDto.roleId,
      isActive: true,
    });

    const savedUser = await this.usersRepository.save(user);

    // Load relations
    const userWithRelations = await this.usersRepository.findOne({
      where: { id: savedUser.id },
      relations: ['role', 'role.permissions'],
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      userWithRelations,
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<number>('jwt.expiresIn', 900),
      tokenType: 'Bearer',
      user: {
        id: userWithRelations.id,
        email: userWithRelations.email,
        firstName: userWithRelations.firstName,
        lastName: userWithRelations.lastName,
        role: {
          id: userWithRelations.role.id,
          name: userWithRelations.role.name,
          permissions: userWithRelations.role.permissions.map((p) => ({
            resource: p.resource,
            action: p.action,
          })),
        },
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(
    userId: string,
    tokenId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenResponse> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid user');
    }

    const accessToken = await this.generateAccessToken(user);

    return {
      accessToken,
      expiresIn: this.configService.get<number>('jwt.expiresIn', 900),
      tokenType: 'Bearer',
    };
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.passwordHash,
    );

    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(changePasswordDto.newPassword, salt);

    // Update password
    await this.usersRepository.update(userId, { passwordHash });

    // Revoke all refresh tokens for security
    await this.revokeAllUserTokens(userId);

    return { message: 'Password changed successfully' };
  }

  /**
   * Forgot password - send reset token
   */
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save reset token
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    const passwordReset = this.passwordResetRepository.create({
      userId: user.id,
      token: hashedToken,
      expiresAt,
      isUsed: false,
    });

    await this.passwordResetRepository.save(passwordReset);

    // In production, send email with resetToken
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetPasswordDto.token)
      .digest('hex');

    const passwordReset = await this.passwordResetRepository.findOne({
      where: {
        token: hashedToken,
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(resetPasswordDto.newPassword, salt);

    // Update password
    await this.usersRepository.update(passwordReset.userId, { passwordHash });

    // Mark token as used
    await this.passwordResetRepository.update(passwordReset.id, {
      isUsed: true,
      usedAt: new Date(),
    });

    // Revoke all refresh tokens
    await this.revokeAllUserTokens(passwordReset.userId);

    return { message: 'Password reset successfully' };
  }

  /**
   * Logout - revoke refresh token
   */
  async logout(userId: string, tokenId?: string): Promise<{ message: string }> {
    if (tokenId) {
      await this.refreshTokenRepository.update(
        { id: tokenId, userId },
        { isRevoked: true, revokedAt: new Date() },
      );
    } else {
      // Revoke all tokens for user
      await this.revokeAllUserTokens(userId);
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
      select: ['id', 'email', 'firstName', 'lastName', 'isActive', 'lastLogin', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      role: {
        id: user.role.id,
        name: user.role.name,
        permissions: user.role.permissions.map((p) => ({
          resource: p.resource,
          action: p.action,
        })),
      },
    };
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    user: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(
      user.id,
      ipAddress,
      userAgent,
    );

    return { accessToken, refreshToken };
  }

  /**
   * Generate access token
   */
  private async generateAccessToken(user: any): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions.map(
        (p) => `${p.resource}:${p.action}`,
      ),
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn', '15m'),
    });
  }

  /**
   * Generate refresh token
   */
  private async generateRefreshToken(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    // Create refresh token record
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() +
        this.configService.get<number>('jwt.refreshExpiresInDays', 7),
    );

    const refreshTokenRecord = this.refreshTokenRepository.create({
      userId,
      token: '', // Will be set after JWT generation
      expiresAt,
      ipAddress,
      userAgent,
    });

    const savedRecord = await this.refreshTokenRepository.save(refreshTokenRecord);

    const payload: JwtRefreshPayload = {
      sub: userId,
      tokenId: savedRecord.id,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '7d'),
    });

    // Update record with token
    await this.refreshTokenRepository.update(savedRecord.id, { token });

    return token;
  }

  /**
   * Revoke all user tokens
   */
  private async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() },
    );
  }

  /**
   * Clean up expired tokens (should be run periodically)
   */
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    
    // Delete expired refresh tokens
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now })
      .execute();

    // Delete used password reset tokens older than 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await this.passwordResetRepository
      .createQueryBuilder()
      .delete()
      .where('isUsed = :isUsed AND usedAt < :yesterday', {
        isUsed: true,
        yesterday,
      })
      .execute();
  }
}