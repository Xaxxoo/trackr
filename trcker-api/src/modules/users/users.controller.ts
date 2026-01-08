import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateProfileDto,
  UserQueryDto,
} from './dto';
import { User } from './entities/user.entity';
import { PaginatedUsersResponse } from './interfaces/user-response.interface';
import { UserStatistics } from './interfaces/user-statistics.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Resource, Action } from './entities/permission.entity';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions(Resource.USERS, Action.READ)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve paginated list of users with filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  async findAll(@Query() query: UserQueryDto): Promise<PaginatedUsersResponse> {
    return this.usersService.findAll(query);
  }

  @Get('statistics')
  @RequirePermissions(Resource.USERS, Action.READ)
  @ApiOperation({
    summary: 'Get user statistics',
    description: 'Retrieve comprehensive user statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics(): Promise<UserStatistics> {
    return this.usersService.getUserStatistics();
  }

  @Get('search')
  @RequirePermissions(Resource.USERS, Action.READ)
  @ApiOperation({
    summary: 'Search users',
    description: 'Search users by name or email',
  })
  @ApiQuery({ name: 'q', type: String, description: 'Search query' })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Result limit',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async search(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ): Promise<User[]> {
    return this.usersService.searchUsers(query, limit);
  }

  @Get(':id')
  @RequirePermissions(Resource.USERS, Action.READ)
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve detailed user information',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Post()
  @RequirePermissions(Resource.USERS, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new user',
    description: 'Create a new user account',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @RequirePermissions(Resource.USERS, Action.UPDATE)
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user information',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Put('profile/me')
  @ApiOperation({
    summary: 'Update own profile',
    description: 'Update current user profile (restricted fields)',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: User,
  })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    return this.usersService.updateProfile(user.userId, updateProfileDto);
  }

  @Delete(':id')
  @RequirePermissions(Resource.USERS, Action.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Soft delete user account',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Patch(':id/restore')
  @RequirePermissions(Resource.USERS, Action.UPDATE)
  @ApiOperation({
    summary: 'Restore deleted user',
    description: 'Restore a soft-deleted user account',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'User restored successfully',
    type: User,
  })
  async restore(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.restore(id);
  }

  @Patch(':id/activate')
  @RequirePermissions(Resource.USERS, Action.UPDATE)
  @ApiOperation({
    summary: 'Activate user',
    description: 'Activate user account',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'User activated successfully',
    type: User,
  })
  async activate(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.activate(id);
  }

  @Patch(':id/deactivate')
  @RequirePermissions(Resource.USERS, Action.UPDATE)
  @ApiOperation({
    summary: 'Deactivate user',
    description: 'Deactivate user account',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully',
    type: User,
  })
  async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.deactivate(id);
  }

  @Patch(':id/lock')
  @RequirePermissions(Resource.USERS, Action.MANAGE)
  @ApiOperation({
    summary: 'Lock user account',
    description: 'Lock user account for security reasons',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiQuery({
    name: 'duration',
    type: Number,
    required: false,
    description: 'Lock duration in minutes (default: 30)',
  })
  @ApiResponse({
    status: 200,
    description: 'User account locked successfully',
    type: User,
  })
  async lock(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('duration') duration?: number,
  ): Promise<User> {
    return this.usersService.lockAccount(id, duration);
  }

  @Patch(':id/unlock')
  @RequirePermissions(Resource.USERS, Action.MANAGE)
  @ApiOperation({
    summary: 'Unlock user account',
    description: 'Unlock user account',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'User account unlocked successfully',
    type: User,
  })
  async unlock(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.unlockAccount(id);
  }

  @Patch(':id/verify-email')
  @RequirePermissions(Resource.USERS, Action.MANAGE)
  @ApiOperation({
    summary: 'Verify user email',
    description: 'Manually verify user email',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: User,
  })
  async verifyEmail(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.verifyEmail(id);
  }
}