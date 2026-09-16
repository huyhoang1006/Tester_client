// =============================================================================
//  test/e2e/login.spec.js — BÀI HỌC SỐ 1: TỰ ĐỘNG HOÁ MÀN HÌNH ĐĂNG NHẬP
// =============================================================================
//  Cách đọc file này: đọc từ trên xuống, mỗi test là một test case bạn vẫn làm
//  bằng tay hằng ngày, chỉ khác là viết bằng code.
//
//  Đối chiếu với test manual:
//     Test case (Excel)          ->  test('...')
//     Precondition               ->  fixture / beforeEach
//     Step: "Nhập username"      ->  await loginPage.usernameInput.fill(...)
//     Expected result            ->  await expect(...).toBeVisible()
//     Pass / Fail                ->  expect đúng hết = Pass, sai 1 cái = Fail
// =============================================================================

// Lấy `test` và `expect` từ fixture của chúng ta (KHÔNG lấy từ '@playwright/test'),
// nhờ vậy mọi test dưới đây tự động có sẵn app đã bật và cửa sổ đã sẵn sàng.
const { test, expect } = require('../fixtures/electronApp')
const { LoginPage } = require('../pages/LoginPage')

// -----------------------------------------------------------------------------
// Dữ liệu giả lập trả về từ server OAuth khi đăng nhập đúng.
// Vì sao phải giả lập (mock)? Vì nếu test gọi server thật thì:
//   - Mất mạng / server bảo trì -> test trượt dù phần mềm không hề lỗi (flaky test)
//   - Test chạy chậm
//   - Không kiểm thử được các tình huống hiếm (server trả lỗi 500, timeout...)
// Giả lập giúp test luôn cho cùng một kết quả -> đó là "deterministic test".
// -----------------------------------------------------------------------------
const FAKE_LOGIN_RESPONSE = {
    access_token: 'fake-access-token-for-testing',
    refresh_token: 'fake-refresh-token-for-testing',
    token_type: 'bearer',
    expires_in: 43199,
    scope: 'read write',
    actionUser: {
        id: 5,
        username: 'EVN_HCM',
        email: 'evn@mail.com',
        is_active: 1,
        is_verified: 1,
        usersGroups: [
            { id: 4, named: 'Role Tester', coded: 'ROLE_TESTER', isActive: 1 }
        ]
    }
}

// `test.describe` = gom nhóm các test cùng chủ đề, giống 1 sheet trong file test case.
test.describe('Màn hình Đăng nhập', () => {

    let loginPage

    // beforeEach chạy TRƯỚC MỖI test trong nhóm. Đây là phần "Precondition".
    // Mỗi test được cấp một app hoàn toàn mới -> test này không ảnh hưởng test kia.
    test.beforeEach(async ({ window }) => {
        loginPage = new LoginPage(window)
        await loginPage.waitUntilReady()
    })

    // =========================================================================
    // TC01 — SMOKE TEST: ứng dụng mở được và màn Login hiển thị đủ thành phần
    // =========================================================================
    // Đây là test quan trọng nhất, nên viết đầu tiên cho mọi dự án: nếu nó
    // trượt thì mọi test khác chắc chắn cũng trượt, khỏi cần chạy tiếp.
    test('TC01 - Mở app thì hiển thị đầy đủ form đăng nhập', async () => {
        // expect(...).toBeVisible() không kiểm tra ngay lập tức 1 lần rồi thôi.
        // Playwright sẽ hỏi đi hỏi lại trong tối đa 10 giây (cấu hình ở
        // playwright.config.js) cho tới khi phần tử hiện ra. Cơ chế này gọi là
        // AUTO-WAITING và nó là lý do bạn KHÔNG cần viết sleep(3000) lung tung.
        await expect(loginPage.usernameInput).toBeVisible()
        await expect(loginPage.passwordInput).toBeVisible()
        await expect(loginPage.loginButton).toBeVisible()
        await expect(loginPage.rememberCheckbox).toBeVisible()

        // Lời chào thay đổi theo giờ trong ngày (Good Morning / Afternoon /
        // Evening / Night). Đừng hard-code "Good Morning!" — test sẽ trượt vào
        // buổi chiều. Thay vào đó kiểm tra bằng biểu thức chính quy.
        await expect(loginPage.heading).toHaveText(/Good (Morning|Afternoon|Evening|Night)!/)
    })

    // =========================================================================
    // TC02 — NEGATIVE TEST: bỏ trống Username thì phải báo lỗi
    // =========================================================================
    // Người mới thường chỉ viết test "đường hạnh phúc" (happy path). Nhưng bug
    // hay nấp ở đường xấu: bỏ trống, nhập sai định dạng, bấm 2 lần...
    test('TC02 - Bỏ trống Username thì hiện lỗi và không đăng nhập', async () => {
        // Lưu ý: app tự điền sẵn EVN_HCM / evn_admin nên phải xoá trắng trước.
        await loginPage.clearForm()

        await loginPage.loginButton.click()

        await expect(loginPage.fieldError.first()).toHaveText('Username is required')

        // Kiểm tra thêm: vẫn còn ở màn Login, tức là KHÔNG bị lọt vào trong app.
        await expect(loginPage.usernameInput).toBeVisible()
    })

    // =========================================================================
    // TC03 — Kiểm tra ô nhập liệu nhận đúng giá trị
    // =========================================================================
    test('TC03 - Nhập username và password thì ô nhập ghi nhận đúng giá trị', async () => {
        await loginPage.usernameInput.fill('EVN_HCM')
        await loginPage.passwordInput.fill('evn_admin')

        // toHaveValue dùng cho thẻ <input>. Đừng nhầm với toHaveText (dùng cho
        // chữ hiển thị trong thẻ div, span, h1...).
        await expect(loginPage.usernameInput).toHaveValue('EVN_HCM')
        await expect(loginPage.passwordInput).toHaveValue('evn_admin')
    })

    // =========================================================================
    // TC04 — Server trả lỗi thì app phải hiện thông báo lỗi
    // =========================================================================
    test('TC04 - Sai mật khẩu thì hiện thông báo lỗi từ server', async ({ window }) => {
        // window.route = "chặn đường" một request trước khi nó ra ngoài mạng,
        // rồi tự mình trả lời thay cho server. '**' nghĩa là khớp mọi tiền tố,
        // nên cả 'http://localhost:8080/oauth/token' lẫn
        // 'http://103.x.x.x:8080/oauth/token' đều bị chặn.
        await window.route('**/oauth/token', (route) => {
            route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: 'invalid_grant',
                    error_description: 'Bad credentials'
                })
            })
        })

        await loginPage.login('EVN_HCM', 'sai_mat_khau')

        // App lấy error_description từ server để hiện lên toast đỏ.
        await expect(loginPage.errorToast.first()).toContainText('Bad credentials')

        // Và tất nhiên vẫn phải ở lại màn hình đăng nhập.
        await expect(loginPage.usernameInput).toBeVisible()
    })

    // =========================================================================
    // TC05 — HAPPY PATH: đăng nhập thành công thì vào được trong app
    // =========================================================================
    test('TC05 - Đăng nhập đúng thì báo thành công và rời khỏi màn Login', async ({ window }) => {
        await window.route('**/oauth/token', (route) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(FAKE_LOGIN_RESPONSE)
            })
        })

        await loginPage.login('EVN_HCM', 'evn_admin')

        await expect(loginPage.successToast.first()).toContainText('Login successfully')

        // Bằng chứng mạnh nhất là form đăng nhập biến mất -> đã chuyển sang màn Home.
        await expect(loginPage.usernameInput).toBeHidden()

        // Kiểm tra tầng dữ liệu: token đã được lưu vào localStorage chưa?
        // evaluate() cho phép chạy JavaScript ngay bên trong ứng dụng.
        const token = await window.evaluate(() => localStorage.getItem('token'))
        expect(token).toBe('fake-access-token-for-testing')
    })
})
