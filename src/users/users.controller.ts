import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { EmailService } from '../email/email.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  async findAll(
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(role, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      return { message: 'User not found' };
    }
    const { password, ...result } = user;
    return result;
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;
    
    // Send welcome email with credentials
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        user.firstName,
        createUserDto.password,
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail the user creation if email fails
    }
    
    return result;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      // Remove email from update data (email should not be changed)
      const { email, ...updateData } = updateUserDto;
      
      const user = await this.usersService.update(id, updateData);
      if (!user) {
        return { statusCode: 404, message: 'User not found' };
      }
      const { password, ...result } = user;
      return result;
    } catch (error) {
      console.error('Error updating user:', error);
      return { 
        statusCode: 400, 
        message: error.message || 'Failed to update user' 
      };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const user = await this.usersService.findById(id);
      if (!user) {
        return { statusCode: 404, message: 'User not found' };
      }
      
      await this.usersService.remove(id);
      return { 
        statusCode: 200,
        message: 'User deleted successfully',
        id: id 
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { 
        statusCode: 400, 
        message: error.message || 'Failed to delete user' 
      };
    }
  }

  @Get('profile/me')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      return { message: 'User not found' };
    }
    const { password, ...result } = user;
    return result;
  }

  @Post('change-password')
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const result = await this.usersService.changePassword(
      req.user.userId,
      body.currentPassword,
      body.newPassword,
    );
    
    // Send notification email
    try {
      const user = await this.usersService.findById(req.user.userId);
      if (user) {
        await this.emailService.sendPasswordChangedNotification(
          user.email,
          user.firstName,
        );
      }
    } catch (error) {
      console.error('Failed to send password changed notification:', error);
    }
    
    return result;
  }

  @Post('upload-avatar')
  async uploadAvatar(
    @Request() req,
    @Body() body: { avatar: string },
  ) {
    const user = await this.usersService.update(req.user.userId, {
      avatar: body.avatar,
    });
    if (!user) {
      return { message: 'User not found' };
    }
    const { password, ...result } = user;
    return result;
  }
}
