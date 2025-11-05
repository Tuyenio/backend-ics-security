import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

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
}
