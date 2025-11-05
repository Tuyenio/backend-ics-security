import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(role?: string, search?: string): Promise<User[]> {
    const where: any = {};
    
    if (role && role !== 'all') {
      where.role = role;
    }

    if (search) {
      return this.usersRepository
        .createQueryBuilder('user')
        .where(role && role !== 'all' ? 'user.role = :role' : '1=1', { role })
        .andWhere(
          '(user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search OR user.companyName LIKE :search)',
          { search: `%${search}%` },
        )
        .getMany();
    }

    return this.usersRepository.find({ where });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.usersRepository.update(id, userData);
    return this.findById(id);
  }

  async saveResetToken(
    email: string,
    token: string,
    expires: Date,
  ): Promise<void> {
    await this.usersRepository.update(
      { email },
      { resetPasswordToken: token, resetPasswordExpires: expires },
    );
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { resetPasswordToken: token },
    });
  }

  async clearResetToken(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }

  async updatePassword(id: string, password: string): Promise<void> {
    const user = await this.findById(id);
    if (user) {
      user.password = password;
      await this.usersRepository.save(user);
    }
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await user.validatePassword(currentPassword);
    
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    await this.updatePassword(userId, newPassword);
    
    return { message: 'Password changed successfully' };
  }
}
