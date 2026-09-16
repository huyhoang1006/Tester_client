# BÀI 1 — DỰNG MÔI TRƯỜNG AUTOMATION TEST CHO AT DIGITAL TESTER

> **Tài liệu này viết cho ai?** Cho người đang làm kiểm thử thủ công (manual test), mới bập bẹ lập trình, chưa từng viết một dòng mã kiểm thử tự động nào.
>
> **Cách dùng:** đọc tuần tự từ trên xuống, không nhảy cóc. Chỗ nào có khung lệnh thì gõ theo đúng như vậy. Thời gian ước tính cho lần đầu: khoảng 2 đến 3 tiếng, trong đó phần đọc hiểu chiếm nhiều hơn phần gõ lệnh.
>
> **Nguyên tắc của tài liệu:** mọi thuật ngữ tiếng Anh đều được viết đầy đủ và giải thích nghĩa ngay lần đầu xuất hiện.

---

## MỤC LỤC

- [Phần 0. Sau bài này bạn làm được gì](#phần-0-sau-bài-này-bạn-làm-được-gì)
- [Phần 1. Bảy khái niệm nền tảng](#phần-1-bảy-khái-niệm-nền-tảng)
- [Phần 2. Kiểm tra máy tính đã sẵn sàng chưa](#phần-2-kiểm-tra-máy-tính-đã-sẵn-sàng-chưa)
- [Phần 3. Cài đặt Playwright](#phần-3-cài-đặt-playwright)
- [Phần 4. Ngữ pháp JavaScript tối thiểu](#phần-4-ngữ-pháp-javascript-tối-thiểu)
- [Phần 5. Đọc hiểu từng file, từng biến](#phần-5-đọc-hiểu-từng-file-từng-biến)
- [Phần 6. Chạy bộ kiểm thử lần đầu](#phần-6-chạy-bộ-kiểm-thử-lần-đầu)
- [Phần 7. Khi kiểm thử bị trượt thì làm gì](#phần-7-khi-kiểm-thử-bị-trượt-thì-làm-gì)
- [Phần 8. Bảng tra lỗi thường gặp](#phần-8-bảng-tra-lỗi-thường-gặp)
- [Phần 9. Bài tập](#phần-9-bài-tập)
- [Phần 10. Lộ trình các bài sau](#phần-10-lộ-trình-các-bài-sau)

---

# PHẦN 0. SAU BÀI NÀY BẠN LÀM ĐƯỢC GÌ

Kết thúc bài 1, trên máy bạn sẽ có một bộ kiểm thử tự động chạy được bằng **một câu lệnh duy nhất**. Khi gõ câu lệnh đó, máy sẽ:

1. Tự mở ứng dụng AT Digital Tester lên
2. Tự gõ tên đăng nhập và mật khẩu vào ô nhập liệu
3. Tự bấm nút Login
4. Tự kiểm tra xem màn hình phản ứng có đúng như mong đợi không
5. Tự tắt ứng dụng đi
6. Lặp lại 5 bước trên cho 5 trường hợp kiểm thử khác nhau
7. In ra bảng kết quả: cái nào Đạt (Pass), cái nào Trượt (Fail)

Và quan trọng hơn cả kết quả đó: bạn sẽ **hiểu từng dòng mã** đã tạo ra kết quả ấy, để tự viết thêm được trường hợp kiểm thử của riêng mình.

---

# PHẦN 1. BẢY KHÁI NIỆM NỀN TẢNG

Đừng vội gõ lệnh. Bảy khái niệm dưới đây là nền móng. Hiểu chúng rồi thì phần sau nhẹ nhàng; không hiểu thì bạn sẽ chỉ gõ theo như một cái máy và tắc ngay khi có lỗi lạ.

## 1.1. Kiểm thử tự động (automation test) là gì?

Bạn đang có bảng trường hợp kiểm thử (test case) trong Excel, đại khái thế này:

| Mã | Tên trường hợp | Điều kiện tiên quyết | Các bước thực hiện | Kết quả mong đợi |
|----|----------------|---------------------|--------------------|------------------|
| TC02 | Bỏ trống tên đăng nhập | Đã mở ứng dụng, đang ở màn Đăng nhập | 1. Xoá trắng ô Username<br>2. Bấm nút Login | Hiện dòng chữ đỏ "Username is required", không vào được bên trong |

Kiểm thử tự động **không phải là thứ gì huyền bí**. Nó chỉ là viết đúng cái bảng trên bằng ngôn ngữ mà máy hiểu:

```js
test('TC02 - Bỏ trống tên đăng nhập thì hiện lỗi', async () => {
    await loginPage.clearForm()                                              // Bước 1
    await loginPage.loginButton.click()                                      // Bước 2
    await expect(loginPage.fieldError).toHaveText('Username is required')    // Kết quả mong đợi
})
```

Đối chiếu một-một:

| Trong Excel | Trong mã kiểm thử |
|-------------|-------------------|
| Tên trường hợp | Chuỗi chữ trong `test('...')` |
| Điều kiện tiên quyết | Phần `beforeEach` (sẽ giải thích ở Phần 5) |
| Các bước thực hiện | Các câu lệnh **hành động**: `.click()`, `.fill()`, `.press()` |
| Kết quả mong đợi | Các câu lệnh **kiểm chứng**: `expect(...)` |
| Đạt / Trượt | Mọi `expect` đúng hết thì Đạt; sai một cái là Trượt ngay tại dòng đó |

Nói cách khác, toàn bộ nghề viết kiểm thử tự động chỉ xoay quanh **hai loại câu lệnh**:

- **Hành động (action)** — bảo máy làm gì đó lên giao diện
- **Kiểm chứng (assertion)** — bảo máy so sánh thực tế với mong đợi

Thuật ngữ **assertion** dịch là "khẳng định" hoặc "kiểm chứng": bạn khẳng định "dòng chữ này phải xuất hiện", máy đi kiểm tra xem khẳng định đó đúng hay sai.

### Kiểm thử tự động KHÔNG thay thế kiểm thử thủ công

Đây là hiểu lầm phổ biến nhất của người mới. Thực tế:

- **Máy giỏi việc lặp lại.** Chạy 200 trường hợp kiểm thử hồi quy (regression test — kiểm thử lại các chức năng cũ để chắc rằng bản sửa mới không làm hỏng chúng) trong 15 phút, không kêu ca, không bỏ sót bước, chạy lúc 2 giờ sáng cũng được.
- **Máy dốt việc phán đoán.** Nó không biết "nút này đặt ở đây thì người dùng khó bấm", không biết "màu chữ này chói mắt", không biết "luồng nghiệp vụ này vô lý". Đó là việc của bạn.

Cho nên mục tiêu đúng là: **giao phần lặp lại nhàm chán cho máy, để dành đầu óc bạn cho việc khám phá lỗi mới**.

## 1.2. Ba tầng kiểm thử và kim tự tháp kiểm thử

Có ba tầng kiểm thử tự động, xếp từ nhỏ tới lớn:

**Tầng 1 — Kiểm thử đơn vị (unit test).** "Đơn vị" ở đây là một hàm nhỏ trong mã nguồn. Ví dụ hàm tính tuổi thiết bị từ ngày sản xuất. Kiểm thử đơn vị đưa vào ngày `01/01/2020`, mong đợi nhận về `6` (năm). Không mở ứng dụng, không cần giao diện. Chạy cực nhanh — hàng trăm trường hợp trong vài giây.

**Tầng 2 — Kiểm thử tích hợp (integration test).** Kiểm tra nhiều mảnh ghép nói chuyện với nhau có đúng không. Ví dụ: gọi hàm lưu thiết bị vào cơ sở dữ liệu (database) rồi đọc lại xem có đúng dữ liệu vừa lưu không. Vẫn không cần mở giao diện. Chạy ở mức trung bình, vài giây cho mỗi trường hợp.

**Tầng 3 — Kiểm thử đầu-cuối (end-to-end test, viết tắt là E2E).** "Đầu-cuối" nghĩa là đi trọn vẹn từ thao tác của người dùng ở giao diện, xuyên qua mọi tầng bên dưới, tới tận cơ sở dữ liệu, rồi quay ngược trở lại giao diện. Đây chính là loại bạn sẽ viết trong bài này: mở ứng dụng thật, bấm nút thật, nhìn kết quả thật. Chạy chậm nhất — mỗi trường hợp mất vài giây tới vài chục giây.

**Kim tự tháp kiểm thử (testing pyramid)** là lời khuyên về tỷ lệ: nên có **nhiều** kiểm thử đơn vị ở đáy, **vừa phải** kiểm thử tích hợp ở giữa, và **ít** kiểm thử đầu-cuối ở đỉnh.

```
          /\
         /  \        Ít     — E2E (đầu-cuối): chậm, đắt, nhưng giống người dùng thật nhất
        /____\
       /      \
      /        \     Vừa    — Integration (tích hợp)
     /__________\
    /            \
   /              \  Nhiều  — Unit (đơn vị): nhanh, rẻ, chỉ vài mili-giây
  /________________\
```

**Vậy tại sao bài 1 lại bắt đầu từ đỉnh kim tự tháp, tức là từ loại chậm và đắt nhất?**

Vì bạn xuất thân từ kiểm thử thủ công. Kiểm thử đầu-cuối chính là công việc hằng ngày của bạn, chỉ khác là được viết bằng mã. Bạn sẽ thấy ngay sự liên hệ và học rất nhanh. Kiểm thử đơn vị đòi hỏi đọc hiểu mã nguồn bên trong — ta để dành tới bài 5.

## 1.3. Phần mềm AT Digital Tester được xây bằng gì?

Điều này quyết định trực tiếp việc chọn công cụ, nên phải nắm.

**Electron** là một bộ khung (framework — bộ khung lập trình, tức là tập hợp thư viện và quy tắc dựng sẵn để lập trình viên xây ứng dụng lên trên) cho phép dùng công nghệ web để làm ra phần mềm chạy trên máy tính để bàn. Nói dễ hiểu: **bên trong AT Digital Tester thực chất là một trình duyệt Chrome bị gọt bỏ thanh địa chỉ và các nút điều hướng, chỉ còn lại vùng hiển thị trang web.**

Một ứng dụng Electron có hai phần chạy song song:

- **Tiến trình chính (main process).** Đây là phần "hệ điều hành" của ứng dụng: tạo cửa sổ, đọc ghi tệp tin trên ổ đĩa, truy cập cơ sở dữ liệu. Trong dự án này nó nằm ở `src/background.js`.
- **Tiến trình hiển thị (renderer process).** Đây là phần giao diện, chính là "trang web" bên trong cửa sổ. Trong dự án này nó được viết bằng Vue.

**Vue** (đọc là "viu", phiên bản 2) là thư viện dựng giao diện web. **Element UI** là bộ thư viện các thành phần giao diện dựng sẵn (nút bấm, ô nhập liệu, bảng, hộp thoại) mà dự án dùng — đây là lý do trong mã kiểm thử bạn sẽ thấy những tên lớp kiểu `el-form-item__error`, chữ `el` là viết tắt của Element.

**SQLite** là cơ sở dữ liệu dạng một tệp tin duy nhất nằm ngay trên máy, không cần máy chủ riêng. Dự án dùng bản mã hoá tên là SQLCipher.

Tóm lại, sơ đồ ứng dụng:

```
┌─────────────────────────────────────────────────────┐
│  Cửa sổ ứng dụng AT Digital Tester                  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Tiến trình hiển thị (renderer)               │  │
│  │  = một trang web Vue 2 + Element UI           │  │  ← Playwright bấm nút, gõ chữ ở đây
│  │  Màn Đăng nhập, cây tài sản, bảng dữ liệu...  │  │
│  └───────────────────────────────────────────────┘  │
│                        ↕                            │
│  ┌───────────────────────────────────────────────┐  │
│  │  Tiến trình chính (main) — src/background.js  │  │
│  │  Tạo cửa sổ, đọc ghi tệp, truy vấn SQLite     │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         ↕ mạng
              Máy chủ OAuth để đăng nhập
```

## 1.4. Vì sao chọn Playwright chứ không phải Selenium?

**Selenium** là công cụ kiểm thử tự động lâu đời và nổi tiếng nhất. Nhưng Selenium sinh ra để điều khiển **trình duyệt web thông thường** (Chrome, Firefox, Edge) thông qua một chương trình trung gian gọi là driver. Ứng dụng Electron không phải trình duyệt thông thường — nó là một chương trình `.exe` riêng, có tiến trình chính riêng. Ép Selenium điều khiển Electron được, nhưng rất trầy trật.

**Playwright** là công cụ do Microsoft phát triển, và nó có sẵn một cổng vào dành riêng cho Electron gọi là `_electron`. Với cổng này, Playwright:

- Khởi chạy trực tiếp tệp tiến trình chính của ứng dụng Electron
- Lấy được cửa sổ giao diện để thao tác
- Điều khiển cả tiến trình chính lẫn tiến trình hiển thị

Ngoài ra Playwright còn ba thứ mà người mới rất cần:

**a) Tự động chờ (auto-waiting).** Đây là tính năng quan trọng nhất. Giao diện không hiện ra tức khắc — bấm nút Login xong phải chờ máy chủ trả lời, chờ Vue vẽ lại màn hình. Công cụ đời cũ bắt bạn tự viết lệnh "ngủ 3 giây". Playwright thì mỗi lệnh kiểm chứng sẽ **hỏi đi hỏi lại liên tục** cho tới khi điều kiện đúng, hoặc hết thời gian cho phép mới chịu báo trượt. Nhờ vậy bộ kiểm thử vừa nhanh vừa ổn định.

**b) Trình xem dấu vết (trace viewer).** Khi một trường hợp kiểm thử trượt, Playwright lưu lại toàn bộ "hộp đen": ảnh chụp màn hình từng bước, cấu trúc trang tại mỗi thời điểm, các yêu cầu mạng đã gửi đi. Bạn mở ra tua đi tua lại như xem video. Đây là thứ giúp bạn tìm nguyên nhân trong 2 phút thay vì 2 tiếng.

**c) Giả lập mạng (network mocking).** Playwright chặn được yêu cầu gửi lên máy chủ và tự trả lời thay. Nhờ vậy bạn kiểm thử được cả tình huống "máy chủ trả lỗi 500" mà không cần ai đi làm sập máy chủ thật.

## 1.5. Node.js là gì?

**JavaScript** là ngôn ngữ lập trình vốn sinh ra để chạy **bên trong trình duyệt web**. Nó làm cho trang web có tương tác: bấm nút thì hiện hộp thoại, cuộn chuột thì ảnh xuất hiện.

**Node.js** (thường gọi tắt là Node) là chương trình cho phép chạy JavaScript **bên ngoài trình duyệt**, ngay trên hệ điều hành, như một phần mềm bình thường. Node đọc tệp `.js` rồi thực thi nó.

Trong câu chuyện của chúng ta, Node đóng ba vai:

1. Bộ khung Electron chạy trên nền Node
2. Công cụ Playwright được viết bằng JavaScript, nên cần Node để chạy
3. Bộ kiểm thử bạn sắp viết cũng là các tệp `.js`, do Node thực thi

## 1.6. npm, package.json, node_modules

**npm** viết tắt của **Node Package Manager**, nghĩa là "trình quản lý gói của Node". Nó được cài kèm sẵn khi bạn cài Node.js. Nhiệm vụ của nó là tải thư viện của người khác về dùng.

**Gói (package)** hay **thư viện (library)** là một khối mã do người khác viết sẵn, đóng gói lại để ai cũng dùng được. Ví dụ `@playwright/test` là gói chứa toàn bộ công cụ Playwright.

**Tệp `package.json`** là "giấy khai sinh" của dự án. Nó nằm ở thư mục gốc và ghi ba nhóm thông tin quan trọng:

```json
{
  "name": "ATDigitalTester",        ← tên dự án
  "version": "26.0.1",              ← phiên bản dự án
  "scripts": {                      ← các lệnh tắt, xem giải thích bên dưới
    "electron:serve": "vue-cli-service electron:serve",
    "test:e2e": "playwright test"
  },
  "dependencies": {                 ← thư viện mà BẢN CHẠY THẬT cần
    "vue": "^2.6.14",
    "element-ui": "^2.15.8"
  },
  "devDependencies": {              ← thư viện chỉ DÂN LẬP TRÌNH cần
    "@playwright/test": "~1.44.1"
  }
}
```

**Phân biệt `dependencies` và `devDependencies` — rất quan trọng:**

- `dependencies` (phụ thuộc chạy thật): thư viện mà ứng dụng cần để hoạt động khi đã cài lên máy khách hàng. Ví dụ Vue — không có nó thì không có giao diện.
- `devDependencies` (phụ thuộc phát triển): thư viện chỉ cần trên máy người làm phần mềm. **Playwright thuộc nhóm này**, vì khách hàng dùng phần mềm thì không cần chạy kiểm thử. Xếp đúng nhóm giúp gói cài đặt gửi cho khách nhẹ đi hàng trăm megabyte.

**Mục `scripts` là gì?** Là các lệnh tắt do bạn tự đặt tên. Thay vì phải nhớ và gõ nguyên câu dài `npx playwright test --reporter=html`, bạn khai báo một lần trong `package.json`:

```json
"scripts": {
  "test:e2e": "playwright test"
}
```

rồi từ đó về sau chỉ cần gõ `npm run test:e2e`. Khi bạn gõ `npm run <tên>`, npm sẽ tìm `<tên>` trong mục `scripts` rồi chạy đúng câu lệnh dài đằng sau nó.

**Thư mục `node_modules`** là nơi npm đổ toàn bộ thư viện đã tải về. Nó thường rất nặng (hàng trăm megabyte, hàng chục nghìn tệp con) nên **không bao giờ được đưa vào hệ thống quản lý mã nguồn**. Khi ai đó lấy dự án về, họ chỉ cần gõ `npm install`, npm sẽ đọc `package.json` và tự tải lại đúng những gì cần.

## 1.7. Ký hiệu phiên bản: dấu mũ `^` và dấu ngã `~`

Trong `package.json` bạn thấy `"@playwright/test": "~1.44.1"`. Ba con số `1.44.1` tuân theo quy ước **đánh số phiên bản ngữ nghĩa (semantic versioning)**:

```
   1    .    44    .    1
   ↑         ↑          ↑
 MAJOR     MINOR      PATCH
(chính)   (phụ)      (vá lỗi)
```

- **MAJOR (chính)** tăng khi có thay đổi phá vỡ tương thích — mã cũ của bạn có thể hỏng
- **MINOR (phụ)** tăng khi thêm tính năng mới nhưng vẫn tương thích ngược — mã cũ vẫn chạy
- **PATCH (vá lỗi)** tăng khi chỉ sửa lỗi nhỏ

Dấu đứng trước con số quy định phạm vi npm được phép nâng cấp:

| Ký hiệu | Ví dụ | Cho phép nâng tới | Ý nghĩa thực tế |
|---------|-------|-------------------|-----------------|
| Không dấu | `1.44.1` | Đúng `1.44.1` | Ghim cứng, không bao giờ đổi |
| Dấu ngã `~` | `~1.44.1` | `1.44.x` (ví dụ `1.44.9`) | Chỉ nhận bản vá lỗi |
| Dấu mũ `^` | `^1.44.1` | `1.x.x` (ví dụ `1.99.0`) | Nhận cả tính năng mới |

**Vì sao dự án này dùng `~1.44.1` chứ không dùng `^`?**

Vì dự án chạy trên Node phiên bản 16. Playwright từ bản `1.48` trở đi **yêu cầu Node 18 trở lên**. Nếu ghi `^1.44.1`, npm sẽ vui vẻ tải về bản `1.5x` mới nhất, và bạn sẽ nhận một thông báo lỗi khó hiểu khi chạy. Dùng `~` để khoá lại trong nhánh `1.44.x` là an toàn.

Sau này nếu bạn nâng Node lên phiên bản 18 hoặc 20, có thể đổi sang `"@playwright/test": "latest"` để dùng bản mới nhất.

---

# PHẦN 2. KIỂM TRA MÁY TÍNH ĐÃ SẴN SÀNG CHƯA

## 2.1. Cửa sổ dòng lệnh là gì và mở thế nào?

**Cửa sổ dòng lệnh** (tiếng Anh: terminal, hoặc command line, hoặc console) là một cửa sổ chỉ có chữ, nơi bạn gõ lệnh cho máy tính thay vì bấm chuột. Trên Windows có hai loại phổ biến:

- **Command Prompt** (còn gọi là CMD) — loại cũ
- **PowerShell** — loại mới hơn, mạnh hơn, là mặc định trên Windows 10 và 11

Tài liệu này dùng PowerShell, nhưng mọi lệnh đều chạy được trên cả hai.

**Cách mở nhanh nhất, ngay tại thư mục dự án:**

1. Mở File Explorer (trình quản lý tệp của Windows), đi tới thư mục `D:\Working\TesterClient\Tester_client`
2. Bấm vào **thanh địa chỉ** ở phía trên (chỗ đang hiển thị đường dẫn)
3. Xoá hết nội dung trong đó, gõ `powershell` rồi bấm phím Enter

Một cửa sổ đen sẽ mở ra, và nó **đã nằm sẵn ở đúng thư mục dự án**. Đây là cách tiện nhất, tránh được lỗi gõ nhầm đường dẫn.

**Cách thứ hai — mở PowerShell rồi tự đi tới thư mục:**

Bấm phím Windows, gõ `powershell`, bấm Enter. Cửa sổ mở ra ở thư mục người dùng. Giờ phải tự đi tới dự án bằng lệnh `cd`:

```powershell
cd D:\Working\TesterClient\Tester_client
```

`cd` viết tắt của **change directory**, nghĩa là "đổi thư mục".

> **Lưu ý riêng cho Command Prompt (CMD):** nếu bạn đang ở ổ `C:` và muốn sang ổ `D:`, lệnh `cd D:\...` sẽ **không có tác dụng**. Phải thêm cờ `/d`:
> ```cmd
> cd /d D:\Working\TesterClient\Tester_client
> ```
> PowerShell không gặp vấn đề này.

**Ba lệnh cơ bản cần nhớ:**

| Lệnh | Tác dụng |
|------|----------|
| `cd <đường dẫn>` | Đi tới một thư mục |
| `cd ..` | Lùi lên thư mục cha (hai dấu chấm nghĩa là "cấp trên") |
| `dir` | Liệt kê các tệp và thư mục tại vị trí hiện tại |

Bạn có thể xác nhận mình đang đứng đúng chỗ bằng cách gõ `dir` và kiểm tra xem có thấy `package.json`, `src`, `vue.config.js` không.

## 2.2. Kiểm tra Node.js và npm

Gõ lần lượt hai lệnh sau, mỗi lệnh một dòng, bấm Enter sau mỗi dòng:

```powershell
node -v
npm -v
```

Cờ `-v` là viết tắt của **version**, nghĩa là "phiên bản".

**Kết quả mong đợi** sẽ giống thế này (con số có thể khác một chút):

```
v16.20.2
8.19.4
```

**Đọc kết quả:**

| Bạn nhận được | Nghĩa là | Phải làm gì |
|---------------|----------|-------------|
| `v16.x.x` | Node 16 — đúng phiên bản dự án dùng | Tốt, đi tiếp |
| `v18.x.x` hoặc `v20.x.x` | Node mới hơn | Vẫn chạy được, đi tiếp |
| `v14.x.x` hoặc thấp hơn | Node quá cũ | Cần nâng cấp, xem bên dưới |
| `'node' is not recognized...` | Chưa cài Node | Cần cài, xem bên dưới |

**Nếu chưa có Node hoặc Node quá cũ:** vào trang `https://nodejs.org`, tải bản có chữ **LTS** (viết tắt của Long Term Support, nghĩa là "hỗ trợ dài hạn" — bản ổn định, ít lỗi), cài như phần mềm bình thường, rồi **đóng và mở lại cửa sổ dòng lệnh** trước khi kiểm tra lại. Phải mở lại thì máy mới nhận ra lệnh mới.

## 2.3. Kiểm tra thư viện của dự án đã được cài chưa

```powershell
dir node_modules
```

Nếu hiện ra một danh sách rất dài các thư mục con, nghĩa là thư viện đã được cài. Nếu báo không tìm thấy, bạn phải cài trước bằng:

```powershell
npm install
npm run postinstall
```

Lệnh `npm install` đọc `package.json` và tải toàn bộ thư viện được liệt kê trong đó. Lệnh `npm run postinstall` là lệnh riêng của dự án, nó biên dịch lại vài thư viện cấp thấp cho khớp với phiên bản Electron đang dùng. Hai lệnh này có thể mất từ 5 tới 15 phút, tuỳ tốc độ mạng.

## 2.4. Kiểm tra tệp tiến trình chính đã được đóng gói chưa

```powershell
dir dist_electron
```

Bạn cần thấy một tệp tên **`index.js`** trong danh sách. Tệp này là toàn bộ tiến trình chính của Electron sau khi đã được gói lại thành một tệp duy nhất. **Bộ kiểm thử sẽ khởi chạy chính tệp này**, cho nên không có nó thì không chạy được gì cả.

Nếu chưa có, đừng lo — nó sẽ tự sinh ra ở Phần 6 khi bạn chạy `npm run electron:serve` lần đầu.

---

# PHẦN 3. CÀI ĐẶT PLAYWRIGHT

## 3.1. Gõ lệnh cài đặt

Vẫn tại cửa sổ dòng lệnh đang đứng ở thư mục dự án, gõ:

```powershell
npm install --save-dev @playwright/test@~1.44.1
```

**Mổ xẻ câu lệnh này, từng mảnh một:**

| Mảnh | Ý nghĩa |
|------|---------|
| `npm` | Gọi trình quản lý gói của Node |
| `install` | Ra lệnh: hãy tải và cài đặt |
| `--save-dev` | Cờ yêu cầu ghi tên gói vào mục `devDependencies` của `package.json` (thay vì `dependencies`). Viết tắt được thành `-D`. |
| `@playwright/test` | Tên gói cần cài. Dấu `@` ở đầu và dấu `/` ở giữa nghĩa là gói này thuộc một "không gian tên" (namespace) tên là `playwright` — cách các tổ chức lớn nhóm nhiều gói lại với nhau. |
| `@~1.44.1` | Dấu `@` thứ hai này lại mang nghĩa khác: "phiên bản là". Kèm dấu ngã `~` như đã giải thích ở mục 1.7. |

Quá trình cài mất khoảng 1 tới 3 phút. Khi xong bạn sẽ thấy dòng tương tự:

```
added 3 packages, and audited 1847 packages in 47s
```

## 3.2. Có cần tải trình duyệt riêng không?

**Không cần.**

Bình thường, khi dùng Playwright để kiểm thử trang web, bạn phải chạy thêm lệnh `npx playwright install` để tải về ba trình duyệt (Chromium, Firefox, WebKit), tốn khoảng 500 megabyte.

Nhưng chúng ta kiểm thử ứng dụng Electron. Mà Electron **đã chứa sẵn Chromium bên trong nó rồi**. Playwright sẽ điều khiển chính cái Chromium đó, không cần tải thêm gì.

Đây là một điểm rất hay, nhưng cũng là chỗ nhiều tài liệu trên mạng làm người mới rối — họ viết cho kiểm thử web, bạn đang làm kiểm thử ứng dụng máy tính để bàn.

## 3.3. Xác nhận cài thành công

```powershell
npx playwright --version
```

`npx` là một công cụ đi kèm npm. Nó có nhiệm vụ: **chạy một chương trình nằm trong `node_modules` của dự án**. Không có `npx`, cửa sổ dòng lệnh sẽ không biết `playwright` là gì, vì nó chỉ nằm trong thư mục dự án chứ không được cài vào toàn hệ thống.

Kết quả mong đợi:

```
Version 1.44.1
```

## 3.4. Kiểm tra package.json đã được cập nhật

Mở tệp `package.json` bằng bất kỳ trình soạn thảo nào (Visual Studio Code, Notepad++, hoặc Notepad thường). Bạn phải thấy hai chỗ sau:

```json
"scripts": {
    ...
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:report": "playwright show-report"
},
```

```json
"devDependencies": {
    "@playwright/test": "~1.44.1",
    ...
}
```

Bốn lệnh tắt trên có ý nghĩa như sau, sẽ dùng tới ở Phần 6:

| Lệnh tắt | Chạy gì | Dùng khi nào |
|----------|---------|--------------|
| `npm run test:e2e` | `playwright test` | Chạy toàn bộ, bình thường |
| `npm run test:e2e:ui` | `playwright test --ui` | Mở giao diện đồ hoạ để chạy từng bước — **rất nên dùng khi đang học** |
| `npm run test:e2e:headed` | `playwright test --headed` | Chạy và hiện cửa sổ ứng dụng ra cho bạn nhìn |
| `npm run test:report` | `playwright show-report` | Mở báo cáo kết quả lần chạy gần nhất |

---

# PHẦN 4. NGỮ PHÁP JAVASCRIPT TỐI THIỂU

Phần này giải thích đúng **mười một** cấu trúc JavaScript xuất hiện trong bốn tệp mã kiểm thử của chúng ta. Không hơn. Đọc xong phần này, bạn sẽ hiểu được mọi ký tự trong Phần 5.

## 4.1. Biến: `const` và `let`

**Biến (variable)** là một cái tên bạn đặt cho một giá trị, để lần sau khỏi phải viết lại giá trị đó.

```js
const ROOT = 'D:\\Working\\TesterClient\\Tester_client'
```

Đọc câu này từ trái sang phải:

- `const` — từ khoá khai báo biến. Viết tắt của **constant**, nghĩa là "hằng số", tức là **sau khi gán rồi thì không được gán lại nữa**.
- `ROOT` — tên biến do người viết tự đặt. Quy ước: tên viết hoa toàn bộ như `ROOT`, `MAIN_FILE` ám chỉ "đây là giá trị cố định, không đổi trong suốt chương trình".
- `=` — dấu gán. **Đây không phải dấu bằng trong toán học**, mà mang nghĩa "hãy đặt giá trị bên phải vào cái tên bên trái".
- `'D:\\Working\\...'` — giá trị, ở đây là một chuỗi ký tự (string), được bọc trong dấu nháy đơn.

Còn `let` cũng khai báo biến nhưng cho phép gán lại về sau:

```js
let loginPage            // khai báo trước, chưa có giá trị
loginPage = new LoginPage(window)   // gán giá trị sau
```

**Quy tắc thực hành:** mặc định luôn dùng `const`. Chỉ đổi sang `let` khi bạn thật sự cần gán lại. Làm vậy để máy giúp bạn bắt lỗi — nếu lỡ tay gán đè lên một hằng số, chương trình sẽ báo lỗi ngay thay vì chạy sai âm thầm.

## 4.2. Đối tượng: dấu ngoặc nhọn `{ }`

**Đối tượng (object)** là một túi đựng nhiều cặp *tên : giá trị*. Giống một dòng trong bảng Excel, trong đó tên cột là "tên" và ô là "giá trị".

```js
const nguoiDung = {
    username: 'EVN_HCM',
    password: 'evn_admin',
    remember: true
}
```

- Mỗi cặp gọi là một **thuộc tính (property)**
- Ngăn cách tên và giá trị bằng dấu hai chấm `:`
- Ngăn cách các thuộc tính bằng dấu phẩy `,`

Lấy giá trị ra bằng dấu chấm:

```js
nguoiDung.username        // cho ra 'EVN_HCM'
```

Đối tượng xuất hiện dày đặc trong Playwright vì nó là cách gọn nhất để truyền nhiều tuỳ chọn cùng lúc:

```js
route.fulfill({
    status: 400,
    contentType: 'application/json',
    body: '...'
})
```

Câu trên nghĩa là: gọi hàm `fulfill` và đưa cho nó **một** đối tượng chứa ba tuỳ chọn.

## 4.3. Hàm và hàm mũi tên

**Hàm (function)** là một khối lệnh được đặt tên, để gọi đi gọi lại nhiều lần.

Cách viết truyền thống:

```js
function cong(a, b) {
    return a + b
}

cong(2, 3)      // cho ra 5
```

- `a` và `b` gọi là **tham số (parameter)** — chỗ trống để người gọi điền giá trị vào
- `return` nghĩa là "trả kết quả về cho nơi gọi"

**Hàm mũi tên (arrow function)** là cách viết ngắn hơn, dùng dấu `=>` trông như mũi tên:

```js
const cong = (a, b) => {
    return a + b
}
```

Trong mã kiểm thử, hàm mũi tên hầu như luôn được dùng làm **hàm gọi lại (callback)**. Hàm gọi lại nghĩa là: bạn **không tự gọi** hàm đó, mà **đưa nó cho một hàm khác giữ hộ**, và hàm kia sẽ gọi nó vào đúng thời điểm thích hợp.

Ví dụ trong tệp kiểm thử:

```js
test('TC01 - Mở app thì hiển thị đủ form', async () => {
    ...
})
```

Ở đây bạn gọi hàm `test` và đưa cho nó **hai thứ**:

1. Chuỗi `'TC01 - Mở app thì hiển thị đủ form'` — tên trường hợp kiểm thử
2. Một hàm mũi tên chứa các bước cần làm

Bạn không tự chạy khối lệnh đó. Playwright sẽ chạy nó khi tới lượt, sau khi đã chuẩn bị xong mọi thứ. Đó chính là ý nghĩa của "hàm gọi lại".

Tương tự với:

```js
await window.route('**/oauth/token', (route) => {
    route.fulfill({ ... })
})
```

Bạn đưa cho hàm `route` một hàm gọi lại. Playwright sẽ gọi nó **mỗi khi** ứng dụng gửi yêu cầu tới địa chỉ `/oauth/token`.

## 4.4. `async` và `await` — phần quan trọng nhất

Đây là chỗ người mới vấp nhiều nhất. Hãy đọc kỹ.

### Vấn đề

Có những việc trong lập trình cho kết quả **tức khắc**: cộng hai số, nối hai chuỗi. Nhưng có những việc **tốn thời gian**: mở một ứng dụng (mất 3 tới 10 giây), chờ máy chủ trả lời (mất 0,2 tới 20 giây), chờ giao diện vẽ xong (mất vài trăm mili-giây).

Nếu JavaScript đứng chờ mỗi việc chậm như vậy thì cả chương trình sẽ đơ cứng. Nên nó không chờ — nó chạy tiếp dòng sau ngay lập tức, và hẹn "khi nào xong tôi sẽ báo".

### Lời hứa

Khi bạn gọi một việc tốn thời gian, JavaScript trả về ngay một đối tượng gọi là **Promise**, dịch là "lời hứa". Lời hứa này chưa chứa kết quả, nó chỉ là tờ phiếu hẹn: "kết quả sẽ có sau, lát nữa quay lại lấy".

### `await` — đứng chờ lời hứa

Từ khoá `await` (nghĩa đen: "chờ") bảo JavaScript: **hãy dừng tại dòng này cho tới khi lời hứa được thực hiện xong, rồi mới đi dòng tiếp theo.**

```js
await loginPage.usernameInput.fill('EVN_HCM')   // chờ gõ xong
await loginPage.loginButton.click()             // rồi mới bấm nút
```

### `async` — giấy phép được dùng `await`

Từ khoá `await` chỉ được phép xuất hiện **bên trong một hàm có gắn nhãn `async`**. Đó là lý do mọi hàm kiểm thử đều bắt đầu bằng `async`:

```js
test('TC03 - ...', async () => {
    await ...
    await ...
})
```

Hãy nhớ đơn giản: **thấy `await` ở đâu thì hàm bọc ngoài nó phải có `async`.** Hai từ này luôn đi thành cặp.

### Điều gì xảy ra nếu quên `await`?

Đây là nguồn gốc của khoảng 90 phần trăm lỗi khó hiểu đối với người mới, nên phải nói riêng.

```js
// SAI — thiếu await
loginPage.usernameInput.fill('EVN_HCM')
loginPage.loginButton.click()
expect(loginPage.fieldError).toHaveText('Username is required')
```

Đoạn trên **không báo lỗi cú pháp**, nó vẫn chạy. Nhưng nó chạy như thế này: dòng 1 khởi động việc gõ chữ rồi **đi ngay** xuống dòng 2; dòng 2 khởi động việc bấm nút rồi **đi ngay** xuống dòng 3; dòng 3 kiểm chứng khi chữ còn chưa gõ xong. Kết quả là trường hợp kiểm thử kết thúc trong 5 mili-giây và báo **Đạt** — trong khi thực tế nó chưa làm gì cả.

Loại lỗi này nguy hiểm hơn lỗi trượt rất nhiều, vì nó cho bạn cảm giác an toàn giả. Một bộ kiểm thử toàn màu xanh nhưng không kiểm tra gì còn tệ hơn là không có bộ kiểm thử nào.

> **Quy tắc vàng cho người mới: gần như mọi dòng bắt đầu bằng `loginPage.`, `window.`, hoặc `expect(` đều phải có `await` đứng trước.** Ngoại lệ duy nhất trong bài này là dòng `expect(token).toBe(...)` — vì nó so sánh một biến thường chứ không phải giao diện. Sẽ giải thích ở mục 5.5.

## 4.5. `require` — mượn mã từ tệp khác

Một chương trình được chia thành nhiều tệp. Để tệp này dùng được thứ viết trong tệp kia, JavaScript dùng cặp `module.exports` và `require`.

**Tệp cho mượn** ghi rõ nó cho mượn cái gì:

```js
// trong tệp LoginPage.js
module.exports = { LoginPage }
```

**Tệp đi mượn** nhận về:

```js
// trong tệp login.spec.js
const { LoginPage } = require('../pages/LoginPage')
```

Đường dẫn trong `require`:

| Cách viết | Ý nghĩa |
|-----------|---------|
| `require('path')` | Không có dấu chấm ở đầu — đây là thư viện có sẵn của Node hoặc trong `node_modules` |
| `require('./LoginPage')` | Một dấu chấm — tệp nằm **cùng thư mục** |
| `require('../pages/LoginPage')` | Hai dấu chấm — **lùi lên một cấp** rồi đi vào thư mục `pages` |

Không cần ghi đuôi `.js`, Node tự thêm.

## 4.6. Phá cấu trúc

**Phá cấu trúc (destructuring)** là cú pháp rút gọn để lấy vài thuộc tính ra khỏi một đối tượng.

Cách dài dòng:

```js
const goi = require('@playwright/test')
const test = goi.test
const expect = goi.expect
```

Cách rút gọn, hoàn toàn tương đương:

```js
const { test, expect } = require('@playwright/test')
```

Đọc là: "từ đối tượng mà `require` trả về, hãy lấy ra thuộc tính tên `test` và thuộc tính tên `expect`, rồi đặt chúng thành hai biến cùng tên."

Cú pháp này cũng dùng được cho **tham số của hàm**. Đây chính là chỗ bạn sẽ gặp trong tệp kiểm thử:

```js
test('TC04 - ...', async ({ window }) => { ... })
```

Nghĩa là: Playwright sẽ đưa cho hàm gọi lại này **một đối tượng chứa rất nhiều đồ nghề**. Cặp ngoặc nhọn `{ window }` nói rằng "tôi chỉ cần món tên `window` thôi, các món khác bỏ qua".

## 4.7. Toán tử trải

**Toán tử trải (spread operator)** viết bằng ba dấu chấm `...`. Nó "đổ" toàn bộ thuộc tính của một đối tượng vào một đối tượng khác.

```js
env: {
    ...process.env,
    NODE_ENV: 'development',
    IS_TEST: 'true'
}
```

Nghĩa là: "hãy lấy toàn bộ biến môi trường hiện có của máy, đổ hết vào đây, rồi thêm (hoặc ghi đè) hai biến `NODE_ENV` và `IS_TEST`."

Nếu không có `...process.env`, ứng dụng khởi chạy sẽ mất sạch biến môi trường của hệ thống — trong đó có `PATH` là biến chỉ cho máy biết tìm các chương trình ở đâu — và hỏng ngay lập tức.

## 4.8. Biến môi trường và `process.env`

**Biến môi trường (environment variable)** là các cặp *tên = giá trị* mà hệ điều hành đưa cho mọi chương trình khi khởi chạy. Chúng là cách phổ biến nhất để **cấu hình một chương trình từ bên ngoài mà không phải sửa mã nguồn**.

Trong Node, chúng nằm trong đối tượng `process.env`:

```js
process.env.WEBPACK_DEV_SERVER_URL      // đọc giá trị của biến này
```

Dự án này dùng ba biến môi trường quan trọng, và bộ kiểm thử phải đặt đúng cả ba:

| Biến | Giá trị ta đặt | Tác dụng |
|------|----------------|----------|
| `NODE_ENV` | `'development'` | Báo cho ứng dụng biết đang ở chế độ phát triển, không phải bản phát hành cho khách |
| `WEBPACK_DEV_SERVER_URL` | `'http://localhost:8080/'` | Báo cho tiến trình chính biết phải nạp giao diện từ địa chỉ nào. Bằng chứng nằm ở dòng 81 trong `src/background.js`: `if (process.env.WEBPACK_DEV_SERVER_URL) { win.loadURL(...) }` |
| `IS_TEST` | `'true'` | Cờ riêng của dự án. Dòng 84 trong `src/background.js` ghi `if (!process.env.IS_TEST) win.webContents.openDevTools()` — nghĩa là khi cờ này bật, ứng dụng sẽ **không** mở bảng công cụ nhà phát triển, giúp cửa sổ sạch sẽ khi chạy kiểm thử |

## 4.9. Chuỗi mẫu

**Chuỗi mẫu (template literal)** dùng dấu nháy ngược `` ` `` thay cho nháy đơn, và cho phép nhét biến vào giữa chuỗi bằng cú pháp `${...}`:

```js
const ten = 'index.js'
throw new Error(`Không tìm thấy tệp ${ten} trong thư mục dist_electron`)
// cho ra: Không tìm thấy tệp index.js trong thư mục dist_electron
```

Chuỗi mẫu cũng cho phép xuống dòng tự nhiên mà không cần ký hiệu đặc biệt.

## 4.10. Lớp, hàm khởi tạo và từ khoá `this`

**Lớp (class)** là một cái khuôn. Từ một cái khuôn có thể đúc ra nhiều vật thể giống nhau về cấu tạo nhưng khác nhau về dữ liệu.

```js
class LoginPage {
    constructor(window) {
        this.window = window
        this.loginButton = window.getByRole('button', { name: 'Login' })
    }

    async login(username, password) {
        await this.usernameInput.fill(username)
        await this.loginButton.click()
    }
}
```

Giải thích ba từ khoá:

- **`constructor`** nghĩa là "hàm khởi tạo". Nó chạy **đúng một lần**, ngay lúc bạn đúc ra một vật thể mới từ khuôn. Nhiệm vụ của nó là chuẩn bị sẵn mọi thứ cho vật thể đó.
- **`this`** nghĩa là "chính vật thể này". `this.loginButton = ...` nghĩa là "gắn thuộc tính `loginButton` vào vật thể đang được tạo ra". Sau này ở bất kỳ hàm nào trong lớp, gọi `this.loginButton` là lấy lại đúng thứ đã gắn.
- **`new`** là từ khoá đúc vật thể mới từ khuôn:

```js
const loginPage = new LoginPage(window)
```

Câu này nghĩa là: "hãy đúc một vật thể `LoginPage` mới, đưa cho hàm khởi tạo của nó biến `window`". Sau câu này, biến `loginPage` chứa một vật thể có sẵn các thuộc tính `usernameInput`, `passwordInput`, `loginButton` và các hàm `login`, `clearForm`.

## 4.11. Chú thích

Hai dấu gạch chéo `//` bắt đầu một **chú thích (comment)** — phần chữ dành cho người đọc, máy bỏ qua hoàn toàn.

```js
// Đây là chú thích, máy không chạy dòng này
await loginPage.loginButton.click()   // chú thích cũng đặt được ở cuối dòng
```

Chú thích nhiều dòng dùng cặp `/*` và `*/`.

---

# PHẦN 5. ĐỌC HIỂU TỪNG FILE, TỪNG BIẾN

## 5.0. Bản đồ bốn tệp và vì sao lại chia làm bốn

```
Tester_client/
├── playwright.config.js          ① CẤU HÌNH  — luật chơi chung
└── test/
    ├── fixtures/
    │   └── electronApp.js        ② ĐỒ NGHỀ   — bật app trước, tắt app sau
    ├── pages/
    │   └── LoginPage.js          ③ BẢN ĐỒ    — biết tìm nút ở đâu
    └── e2e/
        └── login.spec.js         ④ KỊCH BẢN  — biết phải làm gì với nút đó
```

**Vì sao không gộp hết vào một tệp cho gọn?**

Câu hỏi rất hợp lý, và câu trả lời là: **để sau này khỏi khổ.**

Giả sử bạn gộp tất cả vào một tệp. Sáu tháng nữa bạn đã có 80 trường hợp kiểm thử. Rồi một hôm lập trình viên đổi dòng chữ trên nút từ `Login` thành `Đăng nhập`. Nếu câu lệnh tìm nút nằm rải rác trong 80 chỗ, bạn phải đi sửa 80 chỗ, và chắc chắn sẽ sót vài chỗ.

Với cách chia bốn tầng này, câu lệnh tìm nút chỉ nằm **đúng một dòng** trong `LoginPage.js`. Sửa một dòng, 80 trường hợp kiểm thử chạy lại ngon lành.

Đây là một nguyên tắc lập trình có tên riêng: **DRY**, viết tắt của **Don't Repeat Yourself**, nghĩa là "đừng lặp lại chính mình". Mỗi mẩu kiến thức chỉ nên tồn tại ở đúng một nơi trong toàn bộ mã nguồn.

---

## 5.1. Tệp ① `playwright.config.js` — luật chơi chung

Tệp này Playwright **tự động đọc** mỗi khi bạn gõ `npx playwright test`. Bạn không phải gọi nó ở đâu cả. Nó phải nằm ở thư mục gốc của dự án và phải đúng tên này.

### Hai dòng đầu

```js
// @ts-check
const { defineConfig } = require('@playwright/test')
```

- `// @ts-check` là một chú thích đặc biệt. Nó bảo trình soạn thảo (như Visual Studio Code): "hãy kiểm tra giúp tôi xem tôi có gõ sai tên thuộc tính nào không". Nếu bạn gõ `timeOut` thay vì `timeout`, trình soạn thảo sẽ gạch chân đỏ ngay. Rất có ích cho người mới.
- `defineConfig` là một hàm của Playwright. Công dụng duy nhất của nó là giúp trình soạn thảo gợi ý tên các tuỳ chọn khi bạn gõ. Về mặt chạy thì viết `module.exports = { ... }` trần cũng được, nhưng mất gợi ý.

### `testDir` — nơi chứa các tệp kiểm thử

```js
testDir: './test/e2e',
```

Playwright sẽ quét thư mục này và tự tìm mọi tệp có tên kết thúc bằng `.spec.js` để chạy.

Chữ **spec** viết tắt của **specification**, nghĩa là "bản đặc tả". Tên gọi này hàm ý: một tệp kiểm thử chính là bản mô tả phần mềm **phải** hoạt động ra sao.

Dấu chấm `.` ở đầu `./test/e2e` nghĩa là "tính từ thư mục chứa tệp cấu hình này".

### `timeout` — thời hạn cho mỗi trường hợp kiểm thử

```js
timeout: 90 * 1000,
```

Đơn vị là mili-giây. `90 * 1000` = 90 000 mili-giây = 90 giây. Người ta viết `90 * 1000` thay vì `90000` cho dễ đọc — nhìn phát biết ngay là 90 giây.

**Ý nghĩa:** nếu một trường hợp kiểm thử chạy quá 90 giây mà chưa xong, Playwright coi như nó bị treo và đánh Trượt.

**Vì sao đặt 90 giây mà không dùng mặc định 30 giây?** Vì mở một ứng dụng Electron mất từ 3 tới 10 giây, chậm hơn nhiều so với mở một trang web. Cộng thêm các bước bên trong nữa thì 30 giây rất dễ thiếu, dẫn tới báo trượt oan.

### `expect.timeout` — thời hạn cho mỗi câu kiểm chứng

```js
expect: {
    timeout: 10 * 1000
},
```

Đây là thời hạn cho **từng câu `expect`**, khác với thời hạn cho cả trường hợp kiểm thử ở trên.

Khi bạn viết `await expect(nutLogin).toBeVisible()`, Playwright không kiểm tra một lần rồi kết luận. Nó hỏi đi hỏi lại khoảng 100 mili-giây một lần: "nút đã hiện chưa? chưa à, thôi hỏi lại... hiện chưa?..." cho tới khi hiện, hoặc tới khi hết 10 giây thì mới chịu báo Trượt.

Cơ chế này có tên là **tự động chờ (auto-waiting)**, và nó là lý do bạn **không bao giờ** cần viết lệnh ngủ cứng.

### `fullyParallel` và `workers` — chạy song song hay tuần tự

```js
fullyParallel: false,
workers: 1,
```

**Chạy song song (parallel)** nghĩa là mở nhiều tiến trình cùng lúc, mỗi tiến trình chạy một trường hợp kiểm thử khác nhau. Nhanh hơn nhiều. `workers` là số tiến trình chạy song song.

**Nhưng dự án này phải tắt tính năng đó đi.** Lý do: ứng dụng dùng **một tệp cơ sở dữ liệu SQLite duy nhất**. Nếu hai trường hợp kiểm thử cùng chạy, chúng sẽ cùng ghi vào một tệp và giẫm đạp lên dữ liệu của nhau — trường hợp A tạo một thiết bị, trường hợp B xoá sạch bảng, và A trượt một cách bí ẩn.

Đặt `workers: 1` nghĩa là chạy tuần tự, xong cái này mới tới cái kia. Chậm hơn nhưng **đúng**. Với kiểm thử, đúng quan trọng hơn nhanh.

### `retries` — chạy lại khi trượt

```js
retries: process.env.CI ? 1 : 0,
```

Dòng này dùng **toán tử ba ngôi (ternary operator)**, cú pháp `điều_kiện ? giá_trị_nếu_đúng : giá_trị_nếu_sai`. Đọc là: "nếu có biến môi trường `CI` thì lấy 1, ngược lại lấy 0".

**CI** viết tắt của **Continuous Integration**, nghĩa là "tích hợp liên tục" — hệ thống máy chủ tự động chạy kiểm thử mỗi khi có người đẩy mã nguồn mới lên. Dự án này có tệp `.gitlab-ci.yml` dành cho việc đó (hiện đang trống, ta sẽ dùng ở bài 7).

**Ý nghĩa thực tế:** trên máy bạn thì không chạy lại (để bạn thấy ngay lỗi thật). Trên máy chủ tự động thì cho chạy lại 1 lần, để lọc bớt các lần trượt do máy chủ bị chậm nhất thời.

> **Cảnh báo:** đừng lạm dụng `retries`. Chạy lại nhiều lần sẽ **che giấu** những trường hợp kiểm thử không ổn định. Một trường hợp lúc Đạt lúc Trượt gọi là **flaky test**, dịch là "kiểm thử bấp bênh", và nó là kẻ thù số một của nghề này: chạy vài tuần là cả đội mất niềm tin, rồi bỏ luôn bộ kiểm thử.

### `forbidOnly` — chống bỏ quên

```js
forbidOnly: !!process.env.CI,
```

Khi đang gỡ lỗi, người ta hay viết `test.only('TC03 ...')` để bảo Playwright "chỉ chạy mỗi cái này thôi". Tiện, nhưng nếu quên xoá chữ `only` rồi đẩy mã lên, thì trên máy chủ tự động cũng chỉ có **một** trường hợp được chạy, 79 cái còn lại bị bỏ qua âm thầm.

Cờ `forbidOnly` bảo Playwright: nếu thấy `only` trên máy chủ tự động thì báo lỗi ngay.

Hai dấu chấm than `!!` là mẹo chuyển một giá trị bất kỳ thành đúng kiểu đúng/sai (`true`/`false`).

### `reporter` — cách báo cáo kết quả

```js
reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }]
],
```

Hai bộ báo cáo chạy cùng lúc:

- `'list'` — in ra cửa sổ dòng lệnh theo kiểu danh sách, mỗi trường hợp một dòng có dấu tích hoặc dấu chéo
- `'html'` — sinh ra một trang web báo cáo đầy đủ trong thư mục `playwright-report`. Tuỳ chọn `open: 'never'` nghĩa là "đừng tự mở trình duyệt lên", để bạn chủ động mở khi cần bằng lệnh `npm run test:report`

### `use` — các tuỳ chọn áp dụng cho mọi trường hợp kiểm thử

```js
use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
},
```

| Tuỳ chọn | Giá trị | Nghĩa |
|----------|---------|-------|
| `trace` | `'retain-on-failure'` | Ghi lại "hộp đen" đầy đủ, nhưng **chỉ giữ lại khi trượt**. Nếu Đạt thì xoá đi cho đỡ tốn ổ cứng. |
| `screenshot` | `'only-on-failure'` | Chỉ chụp ảnh màn hình khi trượt |
| `video` | `'retain-on-failure'` | Chỉ giữ video khi trượt |

**Dấu vết (trace)** là thứ mạnh nhất trong ba cái. Nó không chỉ là video — nó lưu cả cấu trúc trang tại từng bước, danh sách yêu cầu mạng, và nội dung bản ghi lỗi. Bạn mở ra và tua tới đúng khoảnh khắc trước khi trượt để soi.

### `outputDir` — nơi đổ ảnh, video, dấu vết

```js
outputDir: 'test-results'
```

Thư mục này được liệt kê trong `.gitignore` nên sẽ không bị đưa vào hệ thống quản lý mã nguồn. Đúng — vì nó là kết quả tạm, sinh lại được bất cứ lúc nào.

---

## 5.2. Tệp ② `test/fixtures/electronApp.js` — đồ nghề dùng chung

### Vấn đề mà tệp này giải quyết

Mọi trường hợp kiểm thử đều phải làm y hệt nhau ở đầu và cuối:

```
1. Bật ứng dụng Electron lên          ← lặp lại ở mọi trường hợp
2. Lấy cửa sổ đầu tiên ra để thao tác ← lặp lại ở mọi trường hợp
3. ... phần riêng của từng trường hợp ...
4. Tắt ứng dụng đi                    ← lặp lại ở mọi trường hợp
```

Nếu chép tay bốn bước đó vào từng trường hợp thì vừa dài vừa dễ quên bước 4. Mà quên tắt ứng dụng thì sau 20 trường hợp, máy bạn có 20 cửa sổ Electron đang mở, ăn hết bộ nhớ.

### Fixture là gì?

**Fixture** trong kiểm thử nghĩa là "đồ gá", "bộ đồ nghề chuẩn bị sẵn". Bạn khai báo đồ nghề **một lần** ở đây, và mỗi trường hợp kiểm thử chỉ cần "xin" món mình cần. Playwright tự lo:

- Chuẩn bị đồ nghề **trước** khi trường hợp kiểm thử chạy
- Dọn dẹp đồ nghề **sau** khi chạy xong — **kể cả khi trường hợp đó bị trượt giữa chừng**

Điểm cuối cùng rất quan trọng: dù mã của bạn có lỗi ở giữa, ứng dụng vẫn được tắt đàng hoàng.

### Ba dòng nhập thư viện

```js
const path = require('path')
const fs = require('fs')
const { _electron: electron, test: base, expect } = require('@playwright/test')
```

- **`path`** là thư viện có sẵn của Node để xử lý đường dẫn tệp tin. Cần nó vì Windows dùng dấu gạch chéo ngược `\` còn macOS và Linux dùng dấu gạch chéo xuôi `/`. Thư viện `path` tự lo chuyện đó, giúp mã chạy được trên cả ba hệ điều hành.
- **`fs`** viết tắt của **file system**, nghĩa là "hệ thống tệp tin". Thư viện có sẵn của Node để kiểm tra tệp có tồn tại không, đọc tệp, ghi tệp.
- Dòng thứ ba dùng **phá cấu trúc có đổi tên**. Cú pháp `_electron: electron` nghĩa là "lấy thuộc tính tên `_electron`, nhưng trong tệp này tôi muốn gọi nó là `electron` cho gọn". Tương tự `test: base` nghĩa là "lấy `test` nhưng gọi nó là `base`" — vì lát nữa ta sẽ tạo ra một `test` mới mở rộng từ nó, nên phải đổi tên cái gốc để khỏi trùng.

### Biến `ROOT`

```js
const ROOT = path.resolve(__dirname, '..', '..')
```

- **`__dirname`** (hai dấu gạch dưới ở đầu) là biến có sẵn của Node, chứa **đường dẫn tuyệt đối tới thư mục đang chứa tệp này**. Ở đây nó là `D:\Working\TesterClient\Tester_client\test\fixtures`.
- **`'..'`** nghĩa là lùi lên một cấp.
- **`path.resolve`** ghép các mảnh lại thành một đường dẫn tuyệt đối hoàn chỉnh.

Vậy `path.resolve(__dirname, '..', '..')` = từ `test\fixtures` lùi lên `test`, rồi lùi lên nữa thành `Tester_client`. Tức là **thư mục gốc của dự án**.

**Vì sao phải tính toán vòng vo thế này mà không ghi thẳng `D:\Working\TesterClient\Tester_client`?**

Vì nếu ghi cứng đường dẫn, mã chỉ chạy được trên đúng máy bạn, đúng ổ đĩa đó. Đồng nghiệp để dự án ở `C:\Projects\` là hỏng. Máy chủ tự động để ở `/home/runner/work/` cũng hỏng. Cách tính tương đối từ `__dirname` thì chạy ở đâu cũng đúng.

### Biến `MAIN_FILE` — và cái bẫy lớn nhất của bài này

```js
const MAIN_FILE = path.join(ROOT, 'dist_electron', 'index.js')
```

`path.join` nối các mảnh thành đường dẫn, tự chèn dấu phân cách đúng kiểu hệ điều hành. Kết quả: `D:\Working\TesterClient\Tester_client\dist_electron\index.js`.

**Đây là chỗ tệp kiểm thử thử nghiệm cũ của bạn đã sai.** Tệp cũ viết:

```js
args: [ path.resolve(__dirname, '..', 'dist_electron') ]     // ❌ trỏ vào THƯ MỤC
```

Khi bạn đưa cho Electron một **thư mục**, Electron sẽ mở tệp `package.json` trong thư mục đó và đọc thuộc tính `main` để biết phải chạy tệp nào. Nhưng `dist_electron/package.json` là bản sao y hệt của `package.json` gốc, và trong đó ghi:

```json
"main": "background.js"
```

Mà trong `dist_electron` **không hề có** tệp `background.js` — tệp ở đó tên là `index.js` (vì công cụ đóng gói webpack đã gộp và đổi tên). Kết quả: Electron báo lỗi `Unable to find Electron app`, nghĩa là "không tìm thấy ứng dụng Electron".

Cách sửa là **trỏ thẳng vào tệp `index.js`**, bỏ qua bước đọc `package.json`:

```js
const MAIN_FILE = path.join(ROOT, 'dist_electron', 'index.js')   // ✅
```

### Biến `DEV_SERVER_URL`

```js
const DEV_SERVER_URL = process.env.WEBPACK_DEV_SERVER_URL || 'http://localhost:8080/'
```

**Toán tử `||`** đọc là "hoặc". Ý nghĩa: "lấy giá trị bên trái; nếu bên trái rỗng hoặc không tồn tại thì lấy giá trị bên phải làm mặc định".

Nghĩa là: nếu bạn đã tự đặt biến môi trường `WEBPACK_DEV_SERVER_URL` thì dùng giá trị đó; còn không thì mặc định là `http://localhost:8080/`.

**`localhost`** nghĩa là "chính máy này". **`8080`** là số hiệu cổng (port) — một máy tính có 65535 cổng, mỗi chương trình mạng chiếm một cổng để không đụng nhau. Công cụ phát triển của Vue mặc định dùng cổng 8080.

**Vì sao cần đường dẫn này?** Vì khi chạy ở chế độ phát triển, phần giao diện **không** nằm trong tệp mà được một máy chủ nhỏ phục vụ trực tiếp từ bộ nhớ. Nhờ vậy bạn sửa mã giao diện là thấy thay đổi ngay, không cần đóng gói lại. Tiến trình chính của Electron cần biết địa chỉ máy chủ nhỏ đó để nạp giao diện vào cửa sổ.

### Khối mở rộng fixture

```js
const test = base.extend({ ... })
```

`base` là bộ `test` gốc của Playwright. `.extend(...)` tạo ra một bộ `test` mới, có thêm các đồ nghề riêng của chúng ta. Từ đây về sau, các tệp kiểm thử sẽ nhập `test` từ tệp này chứ không nhập từ `@playwright/test` nữa.

### Fixture thứ nhất: `electronApp`

```js
electronApp: async ({}, use) => {
    if (!fs.existsSync(MAIN_FILE)) {
        throw new Error(`Không tìm thấy ${MAIN_FILE}\n=> Hãy chạy: npm run electron:serve`)
    }

    const app = await electron.launch({
        args: [MAIN_FILE],
        cwd: ROOT,
        env: {
            ...process.env,
            NODE_ENV: 'development',
            WEBPACK_DEV_SERVER_URL: DEV_SERVER_URL,
            IS_TEST: 'true'
        },
        timeout: 60 * 1000
    })

    await use(app)

    await app.close()
}
```

**Phần kiểm tra đầu tiên.** `fs.existsSync(MAIN_FILE)` trả về đúng hoặc sai tuỳ tệp có tồn tại không. Dấu chấm than `!` đảo ngược, nên `if (!...)` đọc là "nếu KHÔNG tồn tại". `throw new Error(...)` ném ra một lỗi kèm lời nhắc.

Đây là một thói quen tốt: **thà báo lỗi rõ ràng ngay từ đầu, còn hơn để Electron báo một lỗi khó hiểu 30 giây sau.** Khi bạn quên bật máy chủ phát triển, bạn sẽ nhận được đúng câu hướng dẫn phải làm gì.

**Các tuỳ chọn của `electron.launch`:**

| Tuỳ chọn | Giá trị | Ý nghĩa |
|----------|---------|---------|
| `args` | `[MAIN_FILE]` | Danh sách tham số dòng lệnh đưa cho Electron. Dấu ngoặc vuông `[ ]` là cú pháp **mảng (array)**, tức danh sách. Ở đây chỉ có một phần tử: đường dẫn tệp tiến trình chính. |
| `cwd` | `ROOT` | Viết tắt của **current working directory**, nghĩa là "thư mục làm việc hiện tại". Đặt về thư mục gốc dự án để các đường dẫn tương đối bên trong ứng dụng (ví dụ đường dẫn tới tệp cơ sở dữ liệu) tính đúng. |
| `env` | đối tượng | Bộ biến môi trường đưa cho tiến trình mới, như đã giải thích ở mục 4.7 và 4.8 |
| `timeout` | `60 * 1000` | Cho ứng dụng tối đa 60 giây để khởi động xong |

**`await use(app)` — dòng kỳ lạ nhất và quan trọng nhất.**

Hàm `use` do Playwright đưa vào. Gọi `await use(app)` nghĩa là: **"đồ nghề đã sẵn sàng, giao cho trường hợp kiểm thử dùng đi, tôi đứng đây đợi"**.

Dòng này sẽ "đứng yên" trong suốt thời gian trường hợp kiểm thử chạy. Chỉ khi trường hợp kiểm thử kết thúc — dù Đạt, Trượt, hay lỗi giữa chừng — thì `use` mới trả quyền điều khiển về, và các dòng phía dưới nó mới chạy.

Nói cách khác, tệp này chia làm ba đoạn rõ rệt:

```js
// ═══ ĐOẠN 1: CHUẨN BỊ ═══ (chạy TRƯỚC trường hợp kiểm thử)
const app = await electron.launch({...})

await use(app)            // ← ranh giới: trường hợp kiểm thử chạy ở đây

// ═══ ĐOẠN 2: DỌN DẸP ═══ (chạy SAU trường hợp kiểm thử, luôn luôn)
await app.close()
```

Nhờ cơ chế này mà ứng dụng **luôn** được tắt, kể cả khi mã kiểm thử của bạn ném lỗi giữa chừng.

**Còn cặp ngoặc nhọn rỗng `{}` ở đầu là gì?** Đó là chỗ khai báo "fixture này cần dùng những fixture nào khác". `electronApp` không cần gì cả nên để rỗng. Fixture tiếp theo thì có.

### Fixture thứ hai: `window`

```js
window: async ({ electronApp }, use) => {
    const window = await electronApp.firstWindow()
    await window.waitForLoadState('domcontentloaded')
    await use(window)
}
```

Lần này cặp ngoặc chứa `{ electronApp }` — nghĩa là fixture `window` **phụ thuộc vào** fixture `electronApp`. Playwright hiểu ngay: phải chuẩn bị `electronApp` trước, rồi mới tới `window`. Bạn không phải sắp xếp thứ tự bằng tay.

- **`electronApp.firstWindow()`** trả về cửa sổ giao diện đầu tiên mà ứng dụng mở ra.
- **`waitForLoadState('domcontentloaded')`** chờ cho tới khi cấu trúc trang được nạp xong. **DOM** viết tắt của **Document Object Model**, nghĩa là "mô hình đối tượng tài liệu" — đây là cách trình duyệt biểu diễn cấu trúc của một trang thành cây các thẻ lồng nhau.

**Vì sao đặt tên là `window` chứ không phải `page`?**

Vì Playwright đã có sẵn một fixture tên `page` dành cho kiểm thử trang web thông thường, và fixture đó phụ thuộc vào một trình duyệt do Playwright tự mở. Nếu ta đặt trùng tên, hai thứ sẽ xung đột. Đặt tên `window` vừa tránh xung đột, vừa đúng với thực tế: đây là một **cửa sổ** của ứng dụng máy tính để bàn.

### Dòng cuối cùng

```js
module.exports = { test, expect }
```

Cho các tệp khác mượn hai thứ: bộ `test` đã được gắn thêm đồ nghề, và `expect` để kiểm chứng.

---

## 5.3. Tệp ③ `test/pages/LoginPage.js` — bản đồ màn hình

### Mẫu thiết kế Page Object

**Page Object** dịch là "đối tượng trang". Đây là một **mẫu thiết kế (design pattern)** — tức là một cách tổ chức mã đã được cả ngành công nhận là tốt, được đặt tên để mọi người cùng nói chung một ngôn ngữ.

Nguyên tắc của nó chỉ có một câu:

> **Tệp kiểm thử chỉ mô tả nghiệp vụ. Cách tìm phần tử trên giao diện thì gom hết vào một chỗ.**

So sánh hai cách viết cùng một việc:

```js
// ❌ KHÔNG dùng Page Object — selector trộn lẫn vào nghiệp vụ
await window.locator('input[placeholder="Username"]').fill('EVN_HCM')
await window.locator('input[placeholder="Password"]').fill('evn_admin')
await window.locator('.submit-btn').click()
```

```js
// ✅ CÓ dùng Page Object — đọc như tiếng người
await loginPage.login('EVN_HCM', 'evn_admin')
```

Cách thứ hai vừa dễ đọc hơn, vừa dễ sửa hơn.

### Hàm khởi tạo và biến `this.window`

```js
class LoginPage {
    constructor(window) {
        this.window = window
        ...
    }
}
```

Hàm khởi tạo nhận vào cửa sổ Electron và cất nó vào `this.window` để các hàm khác trong lớp dùng lại.

### Locator — khái niệm then chốt

```js
this.loginButton = window.getByRole('button', { name: 'Login' })
```

**Locator** dịch sát nghĩa là "bộ định vị". Và đây là chỗ cần hiểu thật kỹ:

> **Locator KHÔNG phải là phần tử trên màn hình. Nó là CÔNG THỨC ĐI TÌM phần tử.**

Dòng trên **chưa hề đụng vào giao diện**. Nó chỉ ghi lại một công thức: "sau này khi cần, hãy đi tìm một phần tử có vai trò là nút bấm và có nhãn chữ là Login".

Chỉ tới khi bạn gọi `.click()` hay `.fill()` thì Playwright mới thực sự đi tìm. **Và nó tìm lại từ đầu ở mỗi lần gọi.**

**Vì sao thiết kế như vậy lại quan trọng?** Vì Vue liên tục vẽ lại giao diện. Một phần tử có thể bị xoá đi rồi tạo lại mới toanh chỉ vì dữ liệu thay đổi. Nếu locator lưu sẵn phần tử thì nó sẽ trỏ vào một thứ đã chết, và bạn nhận lỗi "phần tử không còn gắn với tài liệu". Vì locator chỉ lưu công thức nên nó luôn tìm ra phần tử mới nhất.

### Thứ tự ưu tiên khi chọn cách tìm phần tử

Đây là bảng bạn nên dán lên tường:

| Ưu tiên | Cách viết | Dùng cho | Vì sao |
|---------|-----------|----------|--------|
| **1** | `getByRole('button', { name: 'Login' })` | Nút, ô nhập, liên kết, tiêu đề | Tìm theo **vai trò** và **chữ hiển thị** — đúng cách người dùng thật nhìn màn hình. Bền nhất. Còn hỗ trợ kiểm thử khả năng tiếp cận cho người khiếm thị. |
| **2** | `getByPlaceholder('Username')` | Ô nhập liệu | Chữ mờ gợi ý trong ô — người dùng cũng đọc được nó |
| **3** | `getByText('Login successfully')` | Thông báo, nhãn | Tìm theo nội dung chữ |
| **4** | `locator('[data-testid="submit"]')` | Bất kỳ | Thuộc tính do lập trình viên gắn riêng cho kiểm thử. **Tốt nhất nếu xin được lập trình viên gắn thêm** — vì nó không bao giờ đổi do thiết kế giao diện thay đổi |
| **5** | `locator('.el-form-item__error')` | Khi hết cách | Tên lớp của thư viện Element UI. Đổi thư viện giao diện là gãy |
| **❌** | `locator('div > div:nth-child(3) > input')` | Không bao giờ | Phụ thuộc vào vị trí trong cây. Lập trình viên thêm một thẻ bọc là gãy hết |

**Vì sao trong `LoginPage.js` vẫn phải dùng tới mức ưu tiên 5?**

```js
this.fieldError = window.locator('.el-form-item__error')
this.successToast = window.locator('.el-message--success')
this.errorToast = window.locator('.el-message--error')
```

Vì ba thứ này do thư viện Element UI tự sinh ra, và chúng **không có vai trò rõ ràng** trong chuẩn giao diện web. Dòng chữ lỗi đỏ dưới ô nhập liệu chỉ là một thẻ `div` bình thường có gắn lớp `el-form-item__error`. Không còn cách nào tốt hơn.

Chữ **toast** trong `successToast` là thuật ngữ giao diện, chỉ **thông báo nhỏ tự hiện ra rồi tự biến mất sau vài giây** — gọi là "toast" vì nó bật lên giống lát bánh mì bật ra khỏi máy nướng.

### Các hàm hành động

```js
async waitUntilReady() {
    await this.usernameInput.waitFor({ state: 'visible' })
}
```

Chờ cho tới khi ô nhập tên đăng nhập hiện ra. Dùng để chắc chắn màn hình đã sẵn sàng trước khi thao tác.

```js
async clearForm() {
    await this.usernameInput.fill('')
    await this.passwordInput.fill('')
}
```

**Vì sao cần hàm xoá trắng này?**

Vì mã nguồn của màn Đăng nhập (`src/views/LoginView/index.vue`) có đoạn:

```js
model: {
    // Tài khoản test mặc định
    username: 'EVN_HCM',
    password: 'evn_admin'
}
```

Ứng dụng **tự điền sẵn** tài khoản kiểm thử vào hai ô. Nên nếu bạn muốn kiểm thử tình huống "bỏ trống tên đăng nhập", bạn phải xoá đi trước — không thì ô vẫn có chữ và sẽ không có lỗi nào hiện ra.

Đây là một bài học quan trọng: **phải đọc mã nguồn ứng dụng để biết trạng thái ban đầu thật sự là gì**, đừng đoán.

```js
async login(username, password) {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
}
```

**Vì sao dùng `.fill()` chứ không dùng `.type()`?**

- `.type('abc')` gõ từng ký tự một, giống hệt người gõ phím. Nhưng nó **không xoá nội dung cũ**, nên nếu ô đang có sẵn chữ thì bạn sẽ được `EVN_HCMabc`.
- `.fill('abc')` chọn hết nội dung cũ, xoá đi, rồi đặt giá trị mới vào. An toàn hơn nhiều.

Chỉ dùng `.type()` khi bạn cần kiểm thử phản ứng theo từng phím gõ, ví dụ ô tìm kiếm gợi ý tự động.

---

## 5.4. Tệp ④ `test/e2e/login.spec.js` — kịch bản kiểm thử

### Dòng nhập thư viện

```js
const { test, expect } = require('../fixtures/electronApp')
const { LoginPage } = require('../pages/LoginPage')
```

Chú ý dòng đầu: nhập `test` từ **tệp fixture của chúng ta**, không phải từ `@playwright/test`. Đây là điều bắt buộc — chỉ bộ `test` đã được mở rộng mới biết đồ nghề `window` là gì.

### Dữ liệu giả lập

```js
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
```

Đây là **bản sao y hệt cấu trúc dữ liệu mà máy chủ thật trả về** khi đăng nhập thành công.

**Làm sao biết cấu trúc này?** Đọc mã nguồn. Trong tệp `src/utils/helper.js`, hàm `afterLogin` đọc các trường sau:

```js
const accessToken = response.access_token
const userInfo = response.actionUser
roleCode = userInfo.usersGroups[0].coded
```

Nếu dữ liệu giả lập thiếu một trong các trường đó, ứng dụng sẽ ném lỗi và trường hợp kiểm thử trượt vì lý do sai.

Một vài thuật ngữ trong đó:

- **`access_token`** dịch là "thẻ truy cập" — một chuỗi ký tự máy chủ cấp sau khi xác thực thành công. Các lần gọi sau, ứng dụng gắn chuỗi này vào để máy chủ biết "đây là người đã đăng nhập".
- **`refresh_token`** là "thẻ làm mới", dùng để xin thẻ truy cập mới khi thẻ cũ hết hạn, mà không bắt người dùng đăng nhập lại.
- **`expires_in`** là số giây còn hiệu lực. `43199` giây tức khoảng 12 tiếng.
- **`OAuth`** (đọc là "ô-ót") là chuẩn cho phép một ứng dụng xin quyền truy cập thay mặt người dùng. Máy chủ đăng nhập của dự án này chạy theo chuẩn đó — bằng chứng là địa chỉ `/oauth/token`.

### Nhóm và điều kiện tiên quyết

```js
test.describe('Màn hình Đăng nhập', () => {

    let loginPage

    test.beforeEach(async ({ window }) => {
        loginPage = new LoginPage(window)
        await loginPage.waitUntilReady()
    })
    ...
})
```

- **`test.describe`** gom các trường hợp kiểm thử cùng chủ đề vào một nhóm, tương đương một sheet trong tệp Excel của bạn. Tên nhóm sẽ hiện trong báo cáo.
- **`let loginPage`** khai báo biến ở phạm vi nhóm để mọi trường hợp bên trong đều dùng được. Dùng `let` chứ không dùng `const` vì nó được gán lại trước mỗi trường hợp.
- **`test.beforeEach`** chạy **trước mỗi** trường hợp kiểm thử trong nhóm. Đây chính là cột "Điều kiện tiên quyết" trong bảng Excel của bạn.

**Rất quan trọng — `beforeEach` chạy trước MỖI trường hợp, không phải một lần cho cả nhóm.** Có 5 trường hợp thì nó chạy 5 lần. Cộng với fixture `electronApp` cũng được tạo lại 5 lần, nghĩa là **mỗi trường hợp kiểm thử được cấp một ứng dụng hoàn toàn mới**.

Điều đó khiến bộ kiểm thử chạy chậm hơn, nhưng đổi lại ta có tính chất quý giá nhất của kiểm thử tự động: **tính độc lập (test isolation)**. Trường hợp TC04 không thể làm hỏng TC05. Bạn chạy riêng một trường hợp bất kỳ cũng cho kết quả y hệt khi chạy cả bộ. Không có tính chất này, bộ kiểm thử sẽ dần biến thành một mớ bòng bong không ai dám động vào.

### TC01 — Kiểm thử khói

```js
test('TC01 - Mở app thì hiển thị đầy đủ form đăng nhập', async () => {
    await expect(loginPage.usernameInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.loginButton).toBeVisible()
    await expect(loginPage.rememberCheckbox).toBeVisible()

    await expect(loginPage.heading).toHaveText(/Good (Morning|Afternoon|Evening|Night)!/)
})
```

**Kiểm thử khói (smoke test)** là thuật ngữ mượn từ ngành điện tử: cắm điện vào mạch mới hàn, nếu không bốc khói thì mới kiểm tra tiếp. Trong phần mềm, nó là trường hợp kiểm thử cơ bản nhất — nếu cái này trượt thì mọi cái khác chắc chắn cũng trượt, khỏi cần chạy tiếp.

**Luôn viết kiểm thử khói đầu tiên cho mọi dự án.**

**Chú ý dòng cuối** — đó là một **biểu thức chính quy (regular expression)**, viết tắt là regex. Nó được bọc giữa hai dấu gạch chéo `/.../` thay vì dấu nháy, và mô tả một **khuôn mẫu chữ** chứ không phải một chuỗi cố định.

```
/Good (Morning|Afternoon|Evening|Night)!/
 └──┬─┘ └──────────────┬─────────────┘└┬┘
 chữ cố định      một trong bốn     dấu chấm than
```

Dấu gạch đứng `|` nghĩa là "hoặc".

**Vì sao phải dùng biểu thức chính quy ở đây?** Vì mã nguồn màn Đăng nhập có đoạn:

```js
computed: {
    greeting() {
        const hour = new Date().getHours()
        if (hour >= 5 && hour < 12) return { title: 'Good Morning!', ... }
        if (hour >= 12 && hour < 17) return { title: 'Good Afternoon!', ... }
        ...
    }
}
```

Lời chào **thay đổi theo giờ trong ngày**. Nếu bạn viết cứng `toHaveText('Good Morning!')`, trường hợp kiểm thử sẽ Đạt vào buổi sáng và Trượt vào buổi chiều. Đó lại là một kiểu **kiểm thử bấp bênh** kinh điển — và là lỗi mà người mới hay mắc nhất.

**Bài học rút ra: trước khi viết kiểm chứng cho một dòng chữ, hãy tự hỏi "dòng chữ này có thể thay đổi vì lý do gì không?"** — theo giờ, theo ngôn ngữ, theo quyền người dùng, theo dữ liệu.

### TC02 — Kiểm thử tiêu cực

```js
test('TC02 - Bỏ trống Username thì hiện lỗi và không đăng nhập', async () => {
    await loginPage.clearForm()
    await loginPage.loginButton.click()

    await expect(loginPage.fieldError.first()).toHaveText('Username is required')
    await expect(loginPage.usernameInput).toBeVisible()
})
```

**Kiểm thử tiêu cực (negative test)** là kiểm thử với dữ liệu sai, thiếu, hoặc thao tác bất thường. Người mới thường chỉ viết "đường hạnh phúc" (happy path) — mọi thứ suôn sẻ. Nhưng **lỗi thật hầu như luôn nấp ở đường xấu**: bỏ trống, nhập quá dài, nhập ký tự đặc biệt, bấm hai lần liên tiếp, mất mạng giữa chừng.

**`.first()` để làm gì?** Playwright chạy ở **chế độ nghiêm ngặt (strict mode)**: nếu một locator khớp với nhiều hơn một phần tử, nó **báo lỗi** thay vì tự đoán bạn muốn cái nào. Ở đây, nếu cả hai ô đều trống thì sẽ có hai dòng lỗi đỏ, locator khớp hai phần tử, và Playwright sẽ ném lỗi `strict mode violation`. Thêm `.first()` để nói rõ "lấy cái đầu tiên".

**Dòng kiểm chứng thứ hai quan trọng không kém dòng thứ nhất.** Nó xác nhận ứng dụng **vẫn ở lại màn Đăng nhập**, tức là không bị lọt vào trong. Đây là thói quen tốt: khi kiểm thử một lỗi, hãy kiểm tra cả "cái đáng lẽ phải xảy ra" lẫn "cái không được phép xảy ra".

### TC03 — Kiểm tra ô nhập liệu

```js
await expect(loginPage.usernameInput).toHaveValue('EVN_HCM')
```

**Phân biệt ba câu kiểm chứng hay bị nhầm:**

| Câu | Dùng cho | Ví dụ |
|-----|----------|-------|
| `toHaveValue('abc')` | Thẻ `<input>`, `<textarea>`, `<select>` — thứ người dùng gõ vào | Ô nhập tên đăng nhập |
| `toHaveText('abc')` | Thẻ `<div>`, `<span>`, `<h1>` — chữ hiển thị, phải **khớp hoàn toàn** | Tiêu đề, thông báo lỗi |
| `toContainText('abc')` | Như trên nhưng chỉ cần **chứa** chuỗi đó | An toàn hơn khi chuỗi có khoảng trắng thừa hoặc chữ kèm theo |

### TC04 — Giả lập máy chủ trả lỗi

```js
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
```

Đây là kỹ thuật mạnh nhất trong bài, nên giải thích kỹ.

**`window.route(khuôn_mẫu, hàm_xử_lý)`** nghĩa là: "kể từ giờ, mỗi khi ứng dụng gửi một yêu cầu mạng khớp với khuôn mẫu này, đừng cho nó ra ngoài internet — hãy gọi hàm xử lý của tôi."

**Khuôn mẫu `'**/oauth/token'`** dùng cú pháp **glob** — một kiểu khớp chuỗi đơn giản. Hai dấu sao `**` nghĩa là "bất kỳ thứ gì, kể cả dấu gạch chéo". Nhờ vậy khuôn mẫu này khớp với cả hai địa chỉ:

- `http://localhost:8080/oauth/token`
- `http://103.163.118.212:30151/oauth/token`

Điều này cần thiết vì mã nguồn `src/api/user.js` xây địa chỉ động tuỳ theo cấu hình người dùng nhập:

```js
const loginUrl = domain ? `${domain}/oauth/token` : '/oauth/token'
```

**`route.fulfill({...})`** nghĩa là "tôi tự trả lời yêu cầu này". Các tham số:

- **`status: 400`** — mã trạng thái HTTP. `200` là thành công, `400` là "yêu cầu sai", `401` là "chưa xác thực", `500` là "máy chủ hỏng".
- **`contentType: 'application/json'`** — báo cho ứng dụng biết nội dung trả về là định dạng JSON.
- **`body: ...`** — nội dung trả về.

**`JSON.stringify(...)`** chuyển một đối tượng JavaScript thành chuỗi ký tự theo định dạng JSON. **JSON** viết tắt của **JavaScript Object Notation**, là định dạng trao đổi dữ liệu phổ biến nhất trên mạng. Phải chuyển đổi vì đường truyền mạng chỉ gửi được chữ, không gửi được đối tượng.

**Vì sao lại là `'Bad credentials'`?** Vì mã nguồn màn Đăng nhập có đoạn:

```js
msg = error.response.data.error_description || error.response.data.message || 'Login failed'
```

Ứng dụng ưu tiên lấy trường `error_description` để hiện lên. Ta đặt giá trị đó là `Bad credentials` và kiểm chứng đúng chuỗi ấy.

**Ba lợi ích của việc giả lập, nói cho rõ ràng:**

1. **Ổn định.** Máy chủ bảo trì, mất mạng, đổi mật khẩu tài khoản kiểm thử — không cái nào làm trượt bộ kiểm thử của bạn nữa. Trường hợp kiểm thử chỉ trượt khi **phần mềm thật sự lỗi**, đó mới là điều bạn muốn.
2. **Kiểm thử được tình huống hiếm.** Muốn kiểm tra ứng dụng phản ứng ra sao khi máy chủ trả mã 500? Đổi một con số. Không cần nhờ ai đi làm sập máy chủ.
3. **Nhanh và sạch.** Không gọi mạng thật, không tạo phiên đăng nhập thật, không để lại rác trong cơ sở dữ liệu.

> **Khi nào KHÔNG nên giả lập?** Khi mục tiêu của bạn chính là kiểm tra máy chủ — đó gọi là kiểm thử tích hợp. Loại đó nên tách thành một bộ riêng, chạy ít lần hơn (ví dụ mỗi đêm một lần), không trộn vào bộ kiểm thử giao diện chạy liên tục.

### TC05 — Đường hạnh phúc và ba tầng kiểm chứng

```js
await expect(loginPage.successToast.first()).toContainText('Login successfully')
await expect(loginPage.usernameInput).toBeHidden()

const token = await window.evaluate(() => localStorage.getItem('token'))
expect(token).toBe('fake-access-token-for-testing')
```

Ba câu kiểm chứng này kiểm tra ba tầng khác nhau, và đó là một mẫu rất đáng học:

| Tầng | Câu kiểm chứng | Kiểm tra điều gì |
|------|----------------|------------------|
| **Phản hồi tức thì** | `successToast` chứa `'Login successfully'` | Ứng dụng có báo cho người dùng biết là đã thành công không |
| **Chuyển màn hình** | `usernameInput` đã ẩn | Có thật sự rời khỏi màn Đăng nhập không, hay chỉ hiện thông báo rồi đứng im |
| **Dữ liệu bên dưới** | `token` trong bộ nhớ trình duyệt đúng giá trị | Thẻ truy cập có được lưu lại không — nếu không lưu thì lần sau mở app sẽ bị đá ra ngoài |

Nhiều người mới chỉ kiểm tra tầng một rồi dừng. Nhưng một lỗi kinh điển là: thông báo thành công hiện ra nhưng thẻ truy cập không được lưu, và người dùng bị đăng xuất ngay lần thao tác sau.

**`window.evaluate(...)` là gì?**

Đây là cánh cửa cho phép bạn **chạy mã JavaScript ngay bên trong ứng dụng**, như thể bạn đang gõ vào bảng điều khiển của trình duyệt.

```js
const token = await window.evaluate(() => localStorage.getItem('token'))
```

Hàm mũi tên `() => localStorage.getItem('token')` được **gửi vào bên trong ứng dụng** để chạy ở đó, rồi kết quả được gửi ngược trở ra.

**`localStorage`** dịch là "kho lưu trữ cục bộ" — một vùng nhớ nhỏ mà trình duyệt dành cho mỗi trang web để lưu dữ liệu, và dữ liệu vẫn còn sau khi tắt ứng dụng. Ứng dụng này dùng nó để lưu thẻ truy cập, thông tin người dùng, và địa chỉ máy chủ.

**Chú ý dòng cuối KHÔNG có `await`:**

```js
expect(token).toBe('fake-access-token-for-testing')
```

Vì `token` lúc này đã là một **chuỗi ký tự bình thường** nằm trong bộ nhớ — không phải phần tử giao diện, không cần chờ đợi gì cả. Chỉ khi kiểm chứng giao diện mới cần `await`.

Đây chính là ngoại lệ duy nhất đã nhắc tới ở mục 4.4.

---

# PHẦN 6. CHẠY BỘ KIỂM THỬ LẦN ĐẦU

## 6.1. Vì sao cần hai cửa sổ dòng lệnh?

Bạn cần **hai cửa sổ dòng lệnh mở cùng lúc**, và đây là lý do:

```
┌─────────────────────────────────┐        ┌──────────────────────────────┐
│  CỬA SỔ 1                       │        │  CỬA SỔ 2                    │
│  npm run electron:serve         │        │  npm run test:e2e            │
│                                 │        │                              │
│  • Biên dịch mã Vue             │        │  • Đọc playwright.config.js  │
│  • Dựng máy chủ ở cổng 8080 ────┼───────▶│  • Bật ứng dụng Electron     │
│  • Đóng gói dist_electron/      │        │  • Ứng dụng nạp giao diện    │
│    index.js                     │        │    từ cổng 8080 ◀────────────┼──┐
│                                 │        │  • Bấm nút, kiểm chứng       │  │
│  ⚠ PHẢI CHẠY SUỐT, KHÔNG TẮT   │        │  • Tắt ứng dụng, in kết quả  │  │
└─────────────────────────────────┘        └──────────────────────────────┘  │
              │                                                              │
              └──────────────────────────────────────────────────────────────┘
```

Cửa sổ 1 giữ máy chủ phát triển sống. Nếu bạn tắt nó, ứng dụng do bộ kiểm thử bật lên sẽ chỉ hiện một cửa sổ **trắng trơn**, vì không lấy được giao diện từ đâu cả.

## 6.2. Cửa sổ 1 — bật máy chủ phát triển

Tại thư mục dự án, gõ:

```powershell
npm run electron:serve
```

Chờ. Lần đầu có thể mất 1 tới 3 phút. Bạn sẽ thấy các dòng đại ý:

```
 INFO  Starting development server...
 ...
  App running at:
  - Local:   http://localhost:8080/

 INFO  Launching Electron...
```

Khi thấy dòng `App running at`, nghĩa là đã sẵn sàng. Một cửa sổ ứng dụng sẽ tự mở ra — **kệ nó, đừng tắt**, cũng đừng dùng nó. Đó là cửa sổ của máy chủ phát triển, không phải cửa sổ mà bộ kiểm thử sẽ điều khiển.

Lệnh này cũng chính là thứ tạo ra tệp `dist_electron/index.js` mà bộ kiểm thử cần.

> **Nếu cổng 8080 đã bị chương trình khác chiếm**, công cụ sẽ tự nhảy sang 8081 và báo `App running at http://localhost:8081/`. Khi đó bạn phải báo cho bộ kiểm thử biết bằng cách đặt biến môi trường trước khi chạy, ở cửa sổ 2:
> ```powershell
> $env:WEBPACK_DEV_SERVER_URL = "http://localhost:8081/"
> npm run test:e2e
> ```
> Cú pháp `$env:TÊN = "giá trị"` là cách đặt biến môi trường trong PowerShell.

## 6.3. Cửa sổ 2 — chạy kiểm thử

Mở **một cửa sổ dòng lệnh mới** (theo cách ở mục 2.1), cũng đứng ở thư mục dự án, rồi gõ:

```powershell
npm run test:e2e
```

Bạn sẽ thấy ứng dụng tự bật lên, tự gõ chữ, tự bấm nút, rồi tự tắt — lặp lại 5 lần.

## 6.4. Đọc kết quả

**Khi mọi thứ tốt đẹp:**

```
Running 5 tests using 1 worker

  ✓  1 login.spec.js:60:5 › Màn hình Đăng nhập › TC01 - Mở app thì hiển thị đầy đủ form đăng nhập (8.2s)
  ✓  2 login.spec.js:78:5 › Màn hình Đăng nhập › TC02 - Bỏ trống Username thì hiện lỗi (7.1s)
  ✓  3 login.spec.js:90:5 › Màn hình Đăng nhập › TC03 - Nhập username và password (6.8s)
  ✓  4 login.spec.js:102:5 › Màn hình Đăng nhập › TC04 - Sai mật khẩu thì hiện thông báo lỗi (7.9s)
  ✓  5 login.spec.js:125:5 › Màn hình Đăng nhập › TC05 - Đăng nhập đúng thì rời khỏi màn Login (9.4s)

  5 passed (41.2s)
```

Giải nghĩa từng thành phần một dòng:

```
  ✓     1     login.spec.js:60:5   ›   Màn hình Đăng nhập   ›   TC01 - ...   (8.2s)
  │     │            │                        │                      │          │
  │     │            │                        │                      │      thời gian chạy
  │     │            │                        │                  tên trường hợp
  │     │            │                    tên nhóm (describe)
  │     │      tệp : dòng : cột  — bấm được vào trong nhiều trình soạn thảo
  │   thứ tự
dấu tích = Đạt
```

**Khi có trường hợp trượt:**

```
  ✘  2 login.spec.js:78:5 › TC02 - Bỏ trống Username thì hiện lỗi (11.3s)

    Error: expect(locator).toHaveText(expected)

    Locator:  locator('.el-form-item__error').first()
    Expected string:  "Username is required"
    Received string:  "Password is required"

      at D:\Working\TesterClient\Tester_client\test\e2e\login.spec.js:84:53
```

Cách đọc thông báo lỗi, theo đúng thứ tự:

1. **Dòng `Error:`** — loại kiểm chứng nào thất bại
2. **`Locator:`** — công thức tìm phần tử đã dùng
3. **`Expected` và `Received`** — mong đợi gì, nhận được gì. Đây là hai dòng quan trọng nhất.
4. **`at ...:84:53`** — vị trí chính xác: tệp `login.spec.js`, dòng 84, cột 53

## 6.5. Xem báo cáo dạng trang web

```powershell
npm run test:report
```

Trình duyệt sẽ mở ra một trang báo cáo có: danh sách trường hợp kiểm thử, thời gian chạy, ảnh chụp màn hình khi trượt, video, và nút mở dấu vết.

## 6.6. Bảng đầy đủ các cách chạy

| Lệnh | Tác dụng |
|------|----------|
| `npm run test:e2e` | Chạy tất cả |
| `npx playwright test login.spec.js` | Chỉ chạy một tệp |
| `npx playwright test -g "TC02"` | Chỉ chạy trường hợp có chữ `TC02` trong tên. Cờ `-g` viết tắt của **grep**, nghĩa là "lọc theo chữ" |
| `npm run test:e2e:headed` | Chạy và hiện cửa sổ ứng dụng ra cho bạn nhìn |
| `npm run test:e2e:ui` | **Mở giao diện đồ hoạ.** Xem mục 6.7 |
| `npx playwright test --debug` | Chạy chậm từng dòng, có thể dừng lại soi |
| `npx playwright test --workers=1 --repeat-each=3` | Chạy mỗi trường hợp 3 lần liên tiếp — cách tìm ra trường hợp bấp bênh |

## 6.7. Chế độ giao diện đồ hoạ — công cụ học tốt nhất

```powershell
npm run test:e2e:ui
```

Một cửa sổ riêng mở ra với bốn vùng:

- **Bên trái:** danh sách trường hợp kiểm thử, bấm vào để chạy riêng từng cái
- **Giữa trên:** dòng thời gian các bước — bấm vào bước nào thì thấy ảnh màn hình tại đúng khoảnh khắc đó
- **Giữa dưới:** cấu trúc trang, bản ghi lỗi, danh sách yêu cầu mạng
- **Nút "Pick locator":** rê chuột lên phần tử bất kỳ trên ảnh, Playwright **tự viết ra câu lệnh locator** cho bạn chép về dùng

Nút cuối cùng đó là thứ giúp bạn viết trường hợp kiểm thử mới nhanh gấp nhiều lần so với ngồi mò tên lớp trong mã nguồn. **Khi đang học, hãy dùng chế độ này thay vì chạy suông.**

---

# PHẦN 7. KHI KIỂM THỬ BỊ TRƯỢT THÌ LÀM GÌ

Làm theo đúng thứ tự sau, đừng nhảy cóc:

**Bước 1 — Đọc kỹ `Expected` và `Received`.** Rất nhiều lần nguyên nhân lộ ra ngay ở hai dòng này. Nhận được chuỗi rỗng nghĩa là phần tử tồn tại nhưng chưa có chữ. Nhận được thông báo `Timeout` nghĩa là phần tử chưa từng xuất hiện.

**Bước 2 — Xem ảnh chụp màn hình.** Mở thư mục `test-results`, tìm thư mục con mang tên trường hợp vừa trượt, mở tệp `test-failed-1.png`. Một tấm ảnh thường trả lời ngay được câu hỏi "lúc đó màn hình đang ở đâu".

**Bước 3 — Mở dấu vết.** Đây là vũ khí mạnh nhất:

```powershell
npx playwright show-trace test-results/<tên-thư-mục>/trace.zip
```

Cửa sổ dấu vết cho phép bạn tua tới từng bước, mỗi bước có ảnh trước và sau, có cấu trúc trang để soi, có danh sách yêu cầu mạng.

**Bước 4 — Chạy lại ở chế độ giao diện đồ hoạ** và bấm từng bước một.

**Bước 5 — Chèn điểm dừng.** Thêm dòng này vào giữa trường hợp kiểm thử:

```js
await window.pause()
```

Playwright sẽ dừng lại tại đó và mở một bảng điều khiển, cho bạn tự tay bấm thử, tự thử locator, rồi bấm nút tiếp tục khi xong. Nhớ xoá dòng này sau khi gỡ lỗi xong.

**Bước 6 — In giá trị ra để xem.** Cách thô sơ nhưng hiệu quả:

```js
const soLuong = await loginPage.fieldError.count()
console.log('Số dòng lỗi đang hiện:', soLuong)
```

`console.log` in ra cửa sổ dòng lệnh. `.count()` đếm số phần tử khớp với locator.

---

# PHẦN 8. BẢNG TRA LỖI THƯỜNG GẶP

| Thông báo lỗi | Nguyên nhân | Cách sửa |
|---------------|-------------|----------|
| `Không tìm thấy .../dist_electron/index.js` | Chưa chạy máy chủ phát triển | Mở cửa sổ 1, chạy `npm run electron:serve`, chờ dòng `App running at` |
| `Unable to find Electron app` | Trỏ vào thư mục `dist_electron` thay vì tệp `index.js` | Kiểm tra biến `MAIN_FILE` trong `electronApp.js` |
| Cửa sổ ứng dụng trắng trơn, mọi trường hợp đều trượt | Máy chủ phát triển chưa lên, hoặc đang ở cổng khác 8080 | Chờ dòng `App running at`; nếu cổng khác thì đặt biến `WEBPACK_DEV_SERVER_URL` |
| `Timeout 10000ms exceeded waiting for locator` | Công thức tìm phần tử sai, hoặc phần tử thật sự không hiện ra | Dùng `npm run test:e2e:ui` rồi bấm *Pick locator* để lấy công thức đúng |
| `strict mode violation: resolved to 3 elements` | Locator khớp nhiều phần tử cùng lúc | Thêm `.first()`, hoặc viết locator hẹp hơn |
| `'playwright' is not recognized` | Gõ thiếu `npx` ở đầu | Dùng `npx playwright ...` hoặc `npm run test:e2e` |
| Trường hợp kiểm thử báo Đạt trong 5 mili-giây | Quên `await` | Rà lại, thêm `await` vào mọi dòng thao tác giao diện |
| Lúc Đạt lúc Trượt | Dùng lệnh ngủ cứng, hoặc trường hợp này phụ thuộc dữ liệu trường hợp kia để lại | Bỏ `waitForTimeout`; đảm bảo mỗi trường hợp tự chuẩn bị dữ liệu của mình |
| `npm ERR! code ERESOLVE` | Xung đột phiên bản thư viện | Thử `npm install --save-dev @playwright/test@~1.44.1 --legacy-peer-deps` |
| `Error: EBUSY: resource busy or locked` | Ứng dụng từ lần chạy trước chưa tắt hẳn | Mở Task Manager, kết thúc mọi tiến trình `electron.exe`, rồi chạy lại |

---

# PHẦN 9. BÀI TẬP

Làm được bốn bài này nghĩa là bạn đã tự đi được. Viết xong mỗi bài thì chạy riêng nó bằng `npx playwright test -g "TC06"` để kiểm tra.

### Bài 9.1 — TC06: Bỏ trống mật khẩu

Điền tên đăng nhập nhưng xoá trắng ô mật khẩu, bấm Login, kiểm chứng hiện dòng chữ `Password is required`.

*Gợi ý:* chép nguyên TC02, sau `clearForm()` thì điền lại riêng ô tên đăng nhập.

### Bài 9.2 — TC07: Ô "Remember" mặc định phải được tích

*Gợi ý:* mã nguồn màn Đăng nhập có `remember: true`, nên mặc định nó được tích. Element UI bọc ô tích thật bên trong, nên phải đi vào:

```js
await expect(loginPage.rememberCheckbox.locator('input')).toBeChecked()
```

### Bài 9.3 — TC08: Ô mật khẩu phải che ký tự

*Gợi ý:* kiểm tra thuộc tính `type` của thẻ `input`:

```js
await expect(loginPage.passwordInput).toHaveAttribute('type', 'password')
```

### Bài 9.4 — TC09: Máy chủ không phản hồi

Dùng `route.abort()` thay cho `route.fulfill()` để mô phỏng yêu cầu mạng bị cắt đứt, rồi kiểm chứng ứng dụng hiện thông báo lỗi thay vì đơ cứng.

*Gợi ý:*

```js
await window.route('**/oauth/token', (route) => route.abort())
```

---

# PHẦN 10. LỘ TRÌNH CÁC BÀI SAU

| Bài | Nội dung | Bạn sẽ làm được gì |
|-----|----------|--------------------|
| **1** ✅ | Dựng môi trường, Playwright + Electron, màn Đăng nhập, locator, kiểm chứng, giả lập mạng | Có bộ kiểm thử chạy được và hiểu từng dòng |
| **2** | Điều hướng sau khi đăng nhập: cây tài sản, mở màn Asset, màn Job | Viết được kiểm thử đi qua nhiều màn hình |
| **3** | Bảng dữ liệu ag-Grid: đếm dòng, lọc, sửa ô, kiểm chứng nội dung | Xử lý được phần khó nhất của ứng dụng này |
| **4** | Quản lý dữ liệu kiểm thử: tự tạo dữ liệu đầu bài, tự dọn sau khi chạy | Bộ kiểm thử không còn phụ thuộc lẫn nhau |
| **5** | Kiểm thử đơn vị với Vitest cho `src/utils` và `src/function` | Bắt lỗi logic trong vài giây thay vì vài phút |
| **6** | Kiểm thử tầng liên lạc nội bộ và SQLite (`src/ipcmain/entity`) | Kiểm thử thêm sửa xoá dữ liệu không cần mở giao diện |
| **7** | Cân đối kim tự tháp và chạy tự động trên GitLab CI | Mỗi lần đẩy mã là bộ kiểm thử tự chạy |

---

# PHỤ LỤC — BẢNG TRA THUẬT NGỮ

| Thuật ngữ tiếng Anh | Tiếng Việt | Nghĩa ngắn gọn |
|---------------------|------------|----------------|
| assertion | kiểm chứng, khẳng định | Câu lệnh so sánh thực tế với mong đợi |
| auto-waiting | tự động chờ | Playwright tự hỏi lại nhiều lần thay vì bắt bạn viết lệnh ngủ |
| callback | hàm gọi lại | Hàm bạn đưa cho hàm khác giữ, để nó gọi vào lúc thích hợp |
| CI (Continuous Integration) | tích hợp liên tục | Máy chủ tự chạy kiểm thử mỗi khi có mã mới |
| DOM (Document Object Model) | mô hình đối tượng tài liệu | Cấu trúc cây của một trang |
| E2E (end-to-end) | đầu-cuối | Kiểm thử đi trọn vẹn từ giao diện xuống dữ liệu |
| fixture | đồ gá, đồ nghề | Thứ được chuẩn bị trước và dọn sau mỗi trường hợp kiểm thử |
| flaky test | kiểm thử bấp bênh | Trường hợp lúc Đạt lúc Trượt dù mã không đổi |
| happy path | đường hạnh phúc | Kịch bản mọi thứ suôn sẻ |
| locator | bộ định vị | Công thức đi tìm phần tử trên giao diện |
| main process | tiến trình chính | Phần Electron lo cửa sổ, tệp tin, cơ sở dữ liệu |
| mocking | giả lập | Thay máy chủ thật bằng câu trả lời dựng sẵn |
| negative test | kiểm thử tiêu cực | Kiểm thử với dữ liệu sai hoặc thiếu |
| Page Object | đối tượng trang | Mẫu gom mọi locator của một màn hình vào một lớp |
| regression test | kiểm thử hồi quy | Chạy lại chức năng cũ để chắc bản mới không làm hỏng |
| renderer process | tiến trình hiển thị | Phần giao diện của Electron, thực chất là một trang web |
| smoke test | kiểm thử khói | Trường hợp cơ bản nhất, trượt là khỏi chạy tiếp |
| strict mode | chế độ nghiêm ngặt | Locator khớp nhiều phần tử thì báo lỗi thay vì đoán |
| test isolation | tính độc lập | Mỗi trường hợp kiểm thử không ảnh hưởng trường hợp khác |
| toast | thông báo nổi | Hộp thông báo nhỏ tự hiện rồi tự tắt |
| trace | dấu vết | Hộp đen ghi lại mọi bước để xem lại khi trượt |
| unit test | kiểm thử đơn vị | Kiểm thử một hàm nhỏ, không cần giao diện |

---

*Hết bài 1. Có vướng mắc ở bước nào, hãy chép nguyên đoạn thông báo trong cửa sổ dòng lệnh ra hỏi.*
