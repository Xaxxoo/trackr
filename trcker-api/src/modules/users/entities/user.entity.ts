import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['roleId'])
@Index(['isActive'])
@Index(['createdAt'])
export class User {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @Column({ unique: true, length: 255 })
  email: string;

  @ApiProperty({
    description: 'Hashed password',
    example: '$2b$10$...',
  })
  @Column({ name: 'password_hash' })
  @Exclude()
  passwordHash: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @Transform(({ obj }) => `${obj.firstName} ${obj.lastName}`)
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @ApiProperty({
    description: 'Role ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @ApiProperty({
    description: 'User role details',
  })
  @ManyToOne('Role', { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: any;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    required: false,
  })
  @Column({ length: 50, nullable: true })
  phone: string | null;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatars/john.jpg',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  avatar: string | null;

  @ApiProperty({
    description: 'User timezone',
    example: 'America/New_York',
    required: false,
  })
  @Column({ length: 100, nullable: true, default: 'UTC' })
  timezone: string;

  @ApiProperty({
    description: 'User language preference',
    example: 'en',
    required: false,
  })
  @Column({ length: 10, nullable: true, default: 'en' })
  language: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether email is verified',
    example: true,
  })
  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Email verification token',
    required: false,
  })
  @Column({ name: 'email_verification_token', type: 'text', nullable: true })
  @Exclude()
  emailVerificationToken: string | null;

  @ApiProperty({
    description: 'Last login timestamp',
    example: '2024-01-07T10:30:00.000Z',
    required: false,
  })
  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date | null;

  @ApiProperty({
    description: 'Failed login attempts count',
    example: 0,
  })
  @Column({ name: 'failed_login_attempts', default: 0 })
  @Exclude()
  failedLoginAttempts: number;

  @ApiProperty({
    description: 'Account locked until timestamp',
    required: false,
  })
  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  @Exclude()
  lockedUntil: Date | null;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2024-01-01T10:00:00.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2024-01-07T10:30:00.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Soft delete timestamp',
    required: false,
  })
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  @Exclude()
  deletedAt: Date | null;

  // Computed property
  @ApiProperty({
    description: 'Whether the account is locked',
    example: false,
  })
  get isLocked(): boolean {
    if (!this.lockedUntil) return false;
    return new Date() < this.lockedUntil;
  }

  // Hash password before insert/update
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.passwordHash && !this.passwordHash.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
  }
}