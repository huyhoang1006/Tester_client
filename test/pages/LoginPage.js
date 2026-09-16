// =============================================================================
//  test/pages/LoginPage.js — PAGE OBJECT CHO MÀN HÌNH ĐĂNG NHẬP
// =============================================================================
//  Ý tưởng "Page Object" (rất quan trọng, dùng suốt đời làm automation):
//
//  - Test chỉ nên mô tả NGHIỆP VỤ: "nhập user, nhập pass, bấm Login".
//  - Còn CÁCH TÌM phần tử trên giao diện (CSS selector, id, class...) thì gom
//    hết vào một chỗ duy nhất — chính là file này.
//
//  Lợi ích: hôm nào dev đổi placeholder từ "Username" thành "Tài khoản",
//  bạn chỉ sửa 1 dòng ở đây, 50 test kia vẫn chạy ngon. Nếu viết selector rải
//  rác trong từng test thì phải đi sửa 50 chỗ.
// =============================================================================

class LoginPage {
    /**
     * @param {import('@playwright/test').Page} window cửa sổ Electron
     */
    constructor(window) {
        this.window = window

        // ---------------------------------------------------------------------
        // KHAI BÁO LOCATOR
        // ---------------------------------------------------------------------
        // Locator KHÔNG phải là phần tử. Nó là "công thức đi tìm phần tử".
        // Dòng dưới đây chưa hề đụng vào giao diện — chỉ khi bạn gọi .click()
        // hay .fill() thì Playwright mới thực sự đi tìm, và tìm lại mỗi lần.
        // Nhờ vậy locator không bị "hết hạn" khi Vue vẽ lại DOM.
        // ---------------------------------------------------------------------

        // Ưu tiên 1: tìm theo vai trò + nhãn (giống cách người dùng thật nhìn màn hình)
        this.loginButton = window.getByRole('button', { name: 'Login' })

        // Ưu tiên 2: tìm theo placeholder — vẫn là thứ người dùng đọc được
        this.usernameInput = window.getByPlaceholder('Username')
        this.passwordInput = window.getByPlaceholder('Password')

        // Ưu tiên 3 (hạn chế dùng): CSS selector theo class của thư viện Element UI.
        // Dùng ở đây vì thông báo lỗi / toast không có "vai trò" rõ ràng.
        this.fieldError = window.locator('.el-form-item__error')
        this.successToast = window.locator('.el-message--success')
        this.errorToast = window.locator('.el-message--error')

        this.heading = window.locator('.login-header h1')
        this.rememberCheckbox = window.locator('.remember-checkbox')
    }

    // -------------------------------------------------------------------------
    // HÀNH ĐỘNG (actions) — mô tả bằng ngôn ngữ nghiệp vụ
    // -------------------------------------------------------------------------

    /** Đợi màn hình đăng nhập hiện ra hẳn rồi mới trả về */
    async waitUntilReady() {
        await this.usernameInput.waitFor({ state: 'visible' })
    }

    /** Xoá trắng cả 2 ô (vì app tự điền sẵn EVN_HCM / evn_admin) */
    async clearForm() {
        await this.usernameInput.fill('')
        await this.passwordInput.fill('')
    }

    /**
     * Điền form và bấm Login.
     * @param {string} username
     * @param {string} password
     */
    async login(username, password) {
        // .fill() = chọn hết nội dung cũ rồi gõ đè. An toàn hơn .type() rất nhiều.
        await this.usernameInput.fill(username)
        await this.passwordInput.fill(password)
        await this.loginButton.click()
    }
}

module.exports = { LoginPage }
