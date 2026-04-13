export const MIGRATIONS_DATABASE = {
    // 1: `
    //     -- Version 1: Khởi tạo cơ bản
    //     CREATE TABLE IF NOT EXISTS "acceptance_test" (
    //         "mrid" TEXT PRIMARY KEY,
    //         "type" TEXT
    //     );
    // `,
    // 2: `
    //     -- Version 2: Thêm bảng mới hoặc thêm cột
    //     CREATE TABLE IF NOT EXISTS "activity_record" (
    //         "mrid" TEXT PRIMARY KEY,
    //         "status" TEXT
    //     );
    //     -- Ví dụ thêm cột vào bảng cũ nếu cần
    //     -- ALTER TABLE "acceptance_test" ADD COLUMN "description" TEXT;
    // `,
    // 3: `
    //     -- Version 3: Cập nhật dữ liệu cấu hình bắt buộc
    //     INSERT OR REPLACE INTO "acceptance_test" ("mrid", "type") VALUES ('INIT_001', 'System Check');
    // `
};