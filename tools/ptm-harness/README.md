# Bộ chạy thử mapper PTM ngoài Electron

Chạy `ptmToCtJobDto` và `jobDtoToEntity` — **code thật, không mô phỏng lại** — trên một file
`.ptm` thật, rồi soi entity sinh ra trước khi nó chạm vào CSDL.

## Vì sao cần

Ba lỗi import liên tiếp đều cùng một dạng: một trường thiếu trong DTO, và lỗi chỉ lộ ra ở
tầng SQLite dưới dạng thông báo chẳng liên quan gì tới nguyên nhân. Mỗi vòng phải khởi động
lại app, bấm lại chuỗi thao tác, đọc log — để tìm ra đúng một trường.

Bộ này chạy hết cả chuỗi trong vài giây và liệt kê **mọi** vi phạm một lượt.

## Chạy

```bash
node --experimental-loader ./loader.mjs read.mjs   # .ptm -> ptm.json
node --experimental-loader ./loader.mjs run.mjs    # ptm.json -> entity.json
```

## Ba thứ loader phải xử lý, vì Node không có

- **`@/...`** — bí danh của webpack, không phải chuẩn Node.
- **`require.context`** — tính năng RIÊNG của webpack, dùng ở 20+ file config. Thay bằng
  hàm đọc thư mục thật, giữ nguyên giao diện `.keys()` / `context(key)`.
- **gói `uuid`** — `wrapper.mjs` của nó hỏng khi chạy ESM thuần. Thay bằng bản sinh id đơn
  giản; kiểm chứng cấu trúc thì id trông thế nào không quan trọng.

## Bẫy đã dính khi viết bộ này

Regex bắt tham số thứ ba của `require.context` khớp nhầm dấu `/` nằm trong chuỗi `'./'` của
tham số thứ nhất, cho ra một mẫu không khớp gì và thư mục ra rỗng — mà biểu hiện lại là
"test không được hỗ trợ", trông y hệt lỗi cấu hình thật. Phải bỏ chuỗi trước khi tìm regex.
