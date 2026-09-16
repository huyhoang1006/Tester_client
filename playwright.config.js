// =============================================================================
//  playwright.config.js — CẤU HÌNH CHUNG CHO TOÀN BỘ TEST TỰ ĐỘNG
// =============================================================================
//  File này Playwright tự động đọc mỗi khi bạn gõ `npx playwright test`.
//  Nó trả lời 3 câu hỏi: test nằm ở đâu, chạy như thế nào, báo cáo ra sao.
// =============================================================================

// @ts-check
const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
    // Thư mục chứa các file test. Playwright sẽ quét mọi file *.spec.js ở đây.
    // Lưu ý: file cũ test/testLogin.spec.js nằm NGOÀI thư mục này nên sẽ không chạy.
    testDir: './test/e2e',

    // Một test chạy quá 90 giây thì coi như treo -> tự đánh trượt.
    // Electron khởi động khá chậm nên để rộng tay hơn mặc định (30s).
    timeout: 90 * 1000,

    expect: {
        // Mỗi câu lệnh kiểm tra (expect) được chờ tối đa 10 giây.
        // Đây là "auto-waiting": Playwright thử đi thử lại cho tới khi đúng hoặc hết giờ.
        timeout: 10 * 1000
    },

    // KHÔNG chạy song song. Ứng dụng Electron này dùng chung 1 file SQLite,
    // hai test chạy cùng lúc sẽ giẫm chân nhau lên dữ liệu của nhau.
    fullyParallel: false,
    workers: 1,

    // Chạy lại 1 lần nếu test trượt (giúp lọc bớt lỗi vặt do máy chậm).
    // Khi đã quen, nên để 0 để không giấu lỗi thật.
    retries: process.env.CI ? 1 : 0,

    // Cấm dùng test.only khi chạy trên CI (tránh vô tình chỉ chạy 1 test).
    forbidOnly: !!process.env.CI,

    // Báo cáo dạng web, mở bằng: npx playwright show-report
    reporter: [
        ['list'],                                   // in kết quả ra terminal
        ['html', { open: 'never', outputFolder: 'playwright-report' }]
    ],

    use: {
        // Ghi lại "hộp đen" (trace) khi test trượt: từng bước click, ảnh chụp, DOM.
        // Xem lại bằng: npx playwright show-trace test-results/.../trace.zip
        trace: 'retain-on-failure',

        // Chụp màn hình đúng lúc trượt.
        screenshot: 'only-on-failure',

        // Quay video toàn bộ test bị trượt.
        video: 'retain-on-failure'
    },

    // Nơi Playwright đổ ảnh/video/trace của các lần chạy.
    outputDir: 'test-results'
})
