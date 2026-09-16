// =============================================================================
//  test/fixtures/electronApp.js — "ĐỒ NGHỀ DÙNG CHUNG" CHO MỌI TEST
// =============================================================================
//  Vì sao cần file này?
//  Mỗi test đều phải làm y hệt nhau ở đầu và cuối:
//      1. Bật ứng dụng Electron lên
//      2. Lấy cửa sổ đầu tiên để thao tác
//      3. ... chạy test ...
//      4. Tắt ứng dụng đi
//  Nếu copy 4 bước đó vào từng test thì rất dài dòng và dễ quên bước tắt app.
//  Playwright có khái niệm FIXTURE: khai báo đồ nghề một lần ở đây, test nào cần
//  thì chỉ việc "xin" bằng cách viết tên nó vào tham số. Playwright tự bật trước
//  khi test chạy và tự dọn sau khi test xong — kể cả khi test bị trượt.
// =============================================================================

const path = require('path')
const fs = require('fs')
const { _electron: electron, test: base, expect } = require('@playwright/test')

// Thư mục gốc của dự án (đi ngược 2 cấp từ test/fixtures/)
const ROOT = path.resolve(__dirname, '..', '..')

// File main process đã được webpack đóng gói khi bạn chạy `npm run electron:serve`.
// CHÚ Ý: phải trỏ thẳng vào index.js, KHÔNG trỏ vào thư mục dist_electron.
// Lý do: dist_electron/package.json ghi "main": "background.js" — file đó không
// tồn tại trong dist_electron, nên Electron sẽ báo lỗi "Unable to find Electron app".
// Đây chính là lỗi của file test/testLogin.spec.js cũ.
const MAIN_FILE = path.join(ROOT, 'dist_electron', 'index.js')

// Địa chỉ dev server của Vue. `npm run electron:serve` mặc định chạy ở cổng 8080.
const DEV_SERVER_URL = process.env.WEBPACK_DEV_SERVER_URL || 'http://localhost:8080/'

const test = base.extend({
    // -------------------------------------------------------------------------
    // Fixture 1: electronApp — đại diện cho cả ứng dụng (main process)
    // -------------------------------------------------------------------------
    electronApp: async ({}, use) => {
        if (!fs.existsSync(MAIN_FILE)) {
            throw new Error(
                `Không tìm thấy ${MAIN_FILE}\n` +
                `=> Hãy mở một terminal khác và chạy: npm run electron:serve\n` +
                `   Đợi tới khi thấy dòng "App running at http://localhost:8080" rồi mới chạy test.`
            )
        }

        const app = await electron.launch({
            args: [MAIN_FILE],
            cwd: ROOT,
            env: {
                ...process.env,
                NODE_ENV: 'development',
                // Báo cho background.js biết phải nạp giao diện từ dev server
                WEBPACK_DEV_SERVER_URL: DEV_SERVER_URL,
                // Cờ này làm background.js KHÔNG mở DevTools -> cửa sổ sạch sẽ khi test
                IS_TEST: 'true'
            },
            timeout: 60 * 1000
        })

        // `use(...)` = "giao đồ nghề cho test dùng". Mọi dòng phía sau use()
        // chỉ chạy SAU KHI test kết thúc — đó là phần dọn dẹp.
        await use(app)

        await app.close()
    },

    // -------------------------------------------------------------------------
    // Fixture 2: window — cửa sổ giao diện, nơi ta click và gõ chữ
    // -------------------------------------------------------------------------
    // Đặt tên là `window` chứ không phải `page` để tránh đè lên fixture `page`
    // có sẵn của Playwright (cái đó dành cho trình duyệt Chrome/Firefox).
    window: async ({ electronApp }, use) => {
        const window = await electronApp.firstWindow()

        // Đợi HTML nạp xong. Vue cần thêm chút thời gian để vẽ giao diện,
        // nhưng ta KHÔNG dùng sleep cứng ở đây — mỗi test sẽ tự đợi đúng phần
        // tử mà nó cần (xem giải thích "auto-waiting" trong test/README.md).
        await window.waitForLoadState('domcontentloaded')

        await use(window)
    }
})

module.exports = { test, expect }
