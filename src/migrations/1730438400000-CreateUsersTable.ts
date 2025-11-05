import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class CreateUsersTable1730438400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng users
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar UNIQUE NOT NULL,
        "password" varchar NOT NULL,
        "firstName" varchar NOT NULL,
        "lastName" varchar NOT NULL,
        "role" varchar NOT NULL DEFAULT 'user',
        "country" varchar,
        "companyName" varchar,
        "position" varchar,
        "androidTimes" int DEFAULT 0,
        "iosTimes" int DEFAULT 0,
        "resetPasswordToken" varchar,
        "resetPasswordExpires" timestamp,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);

    // Hash mật khẩu cho tài khoản mẫu
    const adminPassword = await bcrypt.hash('12345678', 10);
    const userPassword = await bcrypt.hash('12345678', 10);

    // Thêm tài khoản admin mẫu
    await queryRunner.query(`
      INSERT INTO "users" 
        (email, password, "firstName", "lastName", role, country, "companyName", position)
      VALUES 
        ('tt98tuyen@gmail.com', '${adminPassword}', 'Admin', 'ICS', 'admin', 'Vietnam', 'ICS Security', 'Administrator')
      ON CONFLICT (email) DO NOTHING
    `);

    // Thêm tài khoản user mẫu
    await queryRunner.query(`
      INSERT INTO "users" 
        (email, password, "firstName", "lastName", role, country, "companyName", position, "androidTimes", "iosTimes")
      VALUES 
        ('tuyenkoikop@gmail.com', '${userPassword}', 'User', 'Demo', 'user', 'Vietnam', 'ICS', 'Developer', 45, 50)
      ON CONFLICT (email) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
