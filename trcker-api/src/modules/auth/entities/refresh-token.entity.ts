import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('refresh_tokens')
@Index(['token'], { unique: true })
@Index(['userId'])
@Index(['expiresAt'])
export class RefreshToken {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne('User')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ApiProperty({
    description: 'Refresh token value',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Column({ type: 'text' })
  token: string;

  @ApiProperty({
    description: 'Token expiration date',
    example: '2024-01-14T10:30:00.000Z',
  })
  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @ApiProperty({
    description: 'Whether token has been revoked',
    example: false,
  })
  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;

  @ApiProperty({
    description: 'IP address used during token creation',
    example: '192.168.1.1',
  })
  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string | null;

  @ApiProperty({
    description: 'User agent string',
    example: 'Mozilla/5.0...',
  })
  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt: Date | null;
}