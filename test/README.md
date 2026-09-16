# Automation Test — AT Digital Tester

Thư mục này chứa bộ kiểm thử tự động (automation test) của dự án và tài liệu học đi kèm.

## Bắt đầu từ đâu

Nếu bạn chưa từng viết kiểm thử tự động: mở **[`BAI-1-SETUP.md`](./BAI-1-SETUP.md)** và đọc tuần tự từ đầu. Tài liệu đó giải thích từng khái niệm, từng biến, từng dòng lệnh, viết cho người mới bập bẹ lập trình.

## Chạy nhanh (khi đã cài đặt xong)

Cần **hai cửa sổ dòng lệnh** mở cùng lúc, cả hai đứng tại thư mục gốc dự án.

Cửa sổ 1 — bật máy chủ phát triển, để chạy suốt, không tắt:

```
npm run electron:serve
```

Chờ tới khi hiện dòng `App running at: http://localhost:8080/`.

Cửa sổ 2 — chạy kiểm thử:

```
npm run test:e2e
```

## Các lệnh khác

| Lệnh | Tác dụng |
|------|----------|
| `npm run test:e2e` | Chạy toàn bộ |
| `npm run test:e2e:ui` | Mở giao diện đồ hoạ — nên dùng khi đang học |
| `npm run test:e2e:headed` | Chạy và hiện cửa sổ ứng dụng ra |
| `npm run test:report` | Mở báo cáo của lần chạy gần nhất |
| `npx playwright test -g "TC02"` | Chỉ chạy trường hợp có chữ `TC02` trong tên |

## Cấu trúc thư mục

```
playwright.config.js          Cấu hình chung (nằm ở thư mục gốc dự án)
test/
├── README.md                 File này
├── BAI-1-SETUP.md            Tài liệu học bài 1, đọc file này trước
├── fixtures/
│   └── electronApp.js        Bật ứng dụng trước mỗi trường hợp, tắt sau khi xong
├── pages/
│   └── LoginPage.js          Gom mọi cách tìm phần tử của màn Đăng nhập
└── e2e/
    └── login.spec.js         5 trường hợp kiểm thử cho màn Đăng nhập
```

## Ba quy tắc phải nhớ

1. **Mọi dòng thao tác giao diện đều phải có `await` đứng trước.** Quên `await` khiến trường hợp kiểm thử báo Đạt trong khi thực tế chưa chạy gì.
2. **Không bao giờ dùng `waitForTimeout(3000)`.** Câu `expect(...)` đã tự chờ sẵn rồi. Lệnh ngủ cứng là nguyên nhân số một gây ra kiểm thử bấp bênh.
3. **Selector chỉ được nằm trong thư mục `pages/`.** Tệp trong `e2e/` chỉ mô tả nghiệp vụ.

## Yêu cầu môi trường

- Node.js phiên bản 16 trở lên
- `@playwright/test` bản `~1.44.1` (bản 1.48 trở lên yêu cầu Node 18)
- Không cần chạy `npx playwright install` — Electron đã chứa sẵn Chromium
