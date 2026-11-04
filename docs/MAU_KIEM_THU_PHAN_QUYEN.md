# Mẫu kiểm thử phân quyền Asset Tree

## Thông tin lần chạy

| Trường | Điền kết quả |
| --- | --- |
| Ngày / người kiểm thử |  |
| Môi trường / phiên bản Client |  |
| Server Asset / Job Service |  |
| Tài khoản thường / role |  |
| Tài khoản admin |  |
| Organisation trong scope (A) |  |
| Organisation ngoài scope (B) |  |
| Substation, Voltage Level, Bay và Device dùng để thử |  |

**Chuẩn bị:** Dùng dữ liệu thử, không dùng asset thật. Cấp quyền cho tài khoản thường trên SSO, gán scope A, rồi đăng nhập lại hoặc đợi quyền được làm mới trước mỗi nhóm kịch bản. Mỗi ca cần kiểm tra cả giao diện **Online/Server**, request API và dữ liệu sau khi Refresh; thao tác chỉ thành công ở SQLite local không được tính là qua.

Mã quyền bên dưới là mã nội bộ của Server Asset; đối chiếu với node SSO tương ứng (ví dụ `DEVICE_ADD` / `device:add`). Quyền `list`, `add`, `update`, `delete`, `enable-disable` là độc lập. Organisation hiện không có nhóm quyền chức năng riêng, nhưng vẫn chịu giới hạn tree scope.

## Kịch bản mẫu

| ID | Quyền của tài khoản thường (ngoài quyền `list` cần để xem cây) | Thao tác trong scope A | Kết quả mong đợi | Kết quả thực tế / Pass-Fail |
| --- | --- | --- | --- | --- |
| PQ-01 | Chỉ `substation:list`, `voltage-level:list`, `bay:list`, `device:list` | Mở cây, xem trạm/ngăn lộ/thiết bị; thử tạo hoặc sửa một node | Xem được; tạo/sửa bị chặn ở UI hoặc API; dữ liệu server không đổi |  |
| PQ-02 | Thêm `substation:add`, không có `substation:update` | Tạo trạm thử, sau đó sửa tên trạm | Tạo thành công; sửa bị chặn; Refresh vẫn giữ tên ban đầu |  |
| PQ-03 | Thêm `substation:update`, không có `substation:add` | Sửa trạm có sẵn, rồi thử tạo trạm khác | Sửa thành công; tạo bị chặn |  |
| PQ-04 | Thêm `voltage-level:add`, không có `voltage-level:update` | Tạo cấp điện áp, rồi sửa giá trị/tên | Tạo thành công; sửa bị chặn; server không nhận thay đổi |  |
| PQ-05 | Thêm `bay:add`, không có `bay:update` | Tạo Bay, rồi sửa tên Bay | Tạo thành công; sửa bị chặn; server không nhận thay đổi |  |
| PQ-06 | Thêm `device:add`, không có `device:update` | Tạo **Current Transformer** và **Power Cable**; sửa serial của một thiết bị vừa tạo | Cả hai loại đều tạo được; sửa bị chặn; serial trên server không đổi |  |
| PQ-07 | Thêm `device:update`, không có `device:add` | Sửa thiết bị có sẵn, rồi thử tạo thiết bị mới | Sửa thành công; tạo bị chặn |  |
| PQ-08 | Có `device:list`, `device:update` trong scope A | Thử xem/sửa thiết bị thuộc organisation B ngoài scope | Không thấy dữ liệu B qua cây/tìm kiếm; gọi API trực tiếp với ID của B cũng bị từ chối |  |
| PQ-09 | Có `device:list`, không có `device:delete` hoặc `device:enable-disable` | Thử xóa và bật/tắt một thiết bị | Cả hai thao tác bị chặn; trạng thái và bản ghi trên server giữ nguyên |  |
| PQ-10 | Đăng nhập bằng role `admin` từ SSO | Thử tạo/sửa/xóa **dữ liệu thử** thuộc các nhóm Substation, Voltage Level, Bay, Device trong scope được phép | Không bị chặn bởi quyền chức năng; kết quả mỗi thao tác khớp dữ liệu server sau Refresh |  |

## Phiếu ghi lỗi (sao chép cho mỗi ca không đạt)

- **ID ca / tài khoản / quyền SSO / scope:**
- **Node thử (loại, ID, organisation cha):**
- **Các bước tái hiện:**
- **Kết quả mong đợi:**
- **Kết quả thực tế trên UI:**
- **Request URL + method / HTTP status / response body:**
- **Dữ liệu server sau Refresh:**
- **Ảnh hoặc log đính kèm:**
- **Kết luận:** Chưa chạy / Pass / Fail / Bị chặn bởi môi trường

**Lưu ý:** Nếu request trả HTML `Smart-SSO Login` thay vì JSON, ghi riêng là lỗi đăng nhập/chuyển hướng; không kết luận ca phân quyền đạt hay không đạt từ response đó.
