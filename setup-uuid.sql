-- Chạy query này trong pgAdmin 4 để kích hoạt UUID
-- Chọn database hyperg_db, sau đó chạy query này

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Kiểm tra extension đã được cài đặt
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';
