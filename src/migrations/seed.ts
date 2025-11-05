import { DataSource } from 'typeorm';
import dataSource from '../data-source';

async function seed() {
  try {
    console.log('Đang khởi tạo data source...');
    await dataSource.initialize();
    console.log('✓ Data source đã khởi tạo');

    console.log('Đang chạy migrations...');
    await dataSource.runMigrations();
    console.log('✓ Migrations đã hoàn thành');

    console.log('✓ Seed dữ liệu thành công!');
    console.log('\nTài khoản mẫu:');
    console.log('Admin: tt98tuyen@gmail.com / 12345678');
    console.log('User: tuyenkoikop@gmail.com / 12345678');
    
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
}

seed();
