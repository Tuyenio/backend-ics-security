import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // Cấu hình email transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Tìm user theo email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Tạo JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    // Trả về thông tin user (không bao gồm password)
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Tìm user theo email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Không tiết lộ thông tin user có tồn tại hay không
      return {
        message: 'Nếu email tồn tại, link reset mật khẩu đã được gửi',
      };
    }

    // Tạo reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 giờ

    // Lưu token vào database
    await this.usersService.saveResetToken(
      email,
      resetToken,
      resetTokenExpires,
    );

    // Tạo reset link
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    // Gửi email
    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_USER'),
        to: email,
        subject: 'Reset mật khẩu - ICS Security',
        html: `
          <h2>Yêu cầu reset mật khẩu</h2>
          <p>Bạn đã yêu cầu reset mật khẩu cho tài khoản của mình.</p>
          <p>Vui lòng click vào link bên dưới để reset mật khẩu:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>Link này sẽ hết hạn sau 1 giờ.</p>
          <p>Nếu bạn không yêu cầu reset mật khẩu, vui lòng bỏ qua email này.</p>
        `,
      });
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      throw new BadRequestException('Không thể gửi email reset mật khẩu');
    }

    return {
      message: 'Email reset mật khẩu đã được gửi',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    // Tìm user theo reset token
    const user = await this.usersService.findByResetToken(token);
    if (!user) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    // Kiểm tra token còn hạn không
    if (
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException('Token đã hết hạn');
    }

    // Cập nhật mật khẩu mới
    await this.usersService.updatePassword(user.id, password);

    // Xóa reset token
    await this.usersService.clearResetToken(user.id);

    return {
      message: 'Mật khẩu đã được reset thành công',
    };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }
}
