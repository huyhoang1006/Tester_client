# BÁO CÁO THIẾT KẾ PHÂN QUYỀN NGƯỜI DÙNG

## 1. Phạm vi

Tài liệu đề xuất cơ chế phân quyền cho AT Digital Tester trong giai đoạn đầu, gồm bốn vai trò:

1. System Admin
2. Organisation Admin
3. Asset Manager
4. Test Engineer

Tạm thời chưa triển khai Reviewer/Approver và Viewer/Auditor. Vì vậy, giai đoạn này chưa có luồng submit, reject hoặc approve kết quả thử nghiệm.

## 2. Mục tiêu

- Người dùng chỉ được xem và thao tác trong phạm vi được giao.
- Quyền trên node cha được kế thừa xuống các node con.
- Quyền xem được tách khỏi quyền tạo, sửa, xóa và đồng bộ.
- Server là nơi kiểm tra quyền cuối cùng; giao diện chỉ phản ánh quyền.
- Có thể làm việc offline trong thời gian giới hạn.
- Các thao tác quan trọng phải ghi audit log.
- License của máy và quyền của người đăng nhập là hai cơ chế độc lập.

## 3. Mô hình đề xuất

Áp dụng RBAC kết hợp phạm vi dữ liệu:

```text
Quyền hiệu lực = Vai trò + Permission + Scope
```

- **Vai trò** xác định nhóm nghiệp vụ.
- **Permission** xác định hành động được phép thực hiện.
- **Scope** xác định khu vực dữ liệu được phép thao tác.

Ví dụ:

```text
Người dùng: Nguyễn Văn An
Vai trò: Test Engineer
Phạm vi: Substation Điện mặt trời Fujiwara
Quyền: job.create, job.update_own, test.edit_result_own, sync.upload_job
```

Nguyễn Văn An được tạo và cập nhật job của mình trên các asset thuộc trạm Fujiwara, nhưng không được sửa asset hoặc thao tác tại trạm khác.

## 4. Cây phạm vi dữ liệu

```text
Organisation
└── Substation
    └── Voltage Level
        └── Bay
            └── Asset
                └── Job
                    └── Test
```

Quyền tại node cha được kế thừa xuống dưới. Ví dụ, `asset.update` tại Substation có hiệu lực với các asset nằm trong mọi Voltage Level và Bay của Substation đó.

Quyền tại Asset chỉ có hiệu lực với Asset, Job và Test của Asset; không mở rộng ngược lên Bay hoặc Substation.

## 5. Các vai trò

### 5.1. System Admin

System Admin quản trị toàn hệ thống và không bị giới hạn bởi Organisation.

Quyền chính:

- Quản lý Organisation và Organisation Admin.
- Xem và xử lý dữ liệu của tất cả Organisation.
- Quản lý tiêu chuẩn test và FMECA demo dùng chung.
- Quản lý license, activation và cấu hình cập nhật phần mềm.
- Xem audit log toàn hệ thống.
- Khôi phục hoặc xử lý dữ liệu khi có sự cố.

Tài khoản System Admin không nên dùng cho công việc test hàng ngày.

### 5.2. Organisation Admin

Organisation Admin quản trị một hoặc nhiều Organisation được giao.

Quyền chính:

- Tạo, khóa và cập nhật người dùng trong Organisation.
- Gán vai trò Asset Manager hoặc Test Engineer.
- Gán phạm vi theo Substation, Bay hoặc Asset.
- Quản lý FMECA của Organisation.
- Quản lý testing equipment của Organisation.
- Chuyển người phụ trách job khi nhân sự thay đổi.
- Đồng bộ dữ liệu thuộc Organisation.

Organisation Admin không được thay đổi license hệ thống, FMECA demo toàn cục hoặc dữ liệu của Organisation khác.

### 5.3. Asset Manager

Asset Manager quản lý topology và thông tin tài sản trong phạm vi được giao.

Quyền chính:

- Tạo và cập nhật Substation, Voltage Level, Bay nếu scope cho phép.
- Tạo, duplicate, cập nhật và soft-delete Asset.
- Import/export cấu trúc Asset.
- Upload/download Asset giữa client và server.
- Quản lý attachment và nameplate của Asset.
- Xem Job, Test, FMECA và Health Index của Asset.

Asset Manager không được sửa kết quả Test hoặc tính CI thay Test Engineer.

### 5.4. Test Engineer

Test Engineer thực hiện thử nghiệm trên các Asset trong phạm vi được giao.

Quyền chính:

- Xem Asset và topology liên quan.
- Tạo Job trên Asset.
- Sửa Job do mình sở hữu trong phạm vi được giao.
- Nhập và sửa dữ liệu Test trong Job của mình.
- Import PTM/CPXpert khi file chỉ chứa Job/Test của Asset đã có.
- Tính Condition Indicator và Health Index.
- So sánh với các lần đo trước.
- Quản lý attachment của Job/Test.
- Upload/download Job/Test trong scope.
- Sử dụng testing equipment đã được Organisation khai báo.

Test Engineer không được tạo, sửa hoặc xóa Organisation, Substation, Bay và Asset.

## 6. Ma trận quyền

Ký hiệu:

- `A`: toàn quyền trong scope.
- `O`: chỉ dữ liệu do người dùng sở hữu hoặc tạo.
- `R`: chỉ đọc.
- `-`: không có quyền.

| Tài nguyên/Hành động | System Admin | Organisation Admin | Asset Manager | Test Engineer |
|---|---:|---:|---:|---:|
| Quản lý Organisation | A | - | - | - |
| Quản lý user, role và scope | A | A | - | - |
| Xem topology | A | A | R | R |
| Tạo/sửa/xóa topology | A | A | A | - |
| Xem Asset | A | A | A | R |
| Tạo/duplicate/sửa Asset | A | A | A | - |
| Soft-delete Asset | A | A | A | - |
| Xem Job/Test | A | A | R | A |
| Tạo Job | A | A | - | A |
| Sửa Job của mình | A | A | - | O |
| Sửa Job của người khác | A | A | - | - |
| Sửa kết quả Test | A | A | - | O |
| Tính CI/Health Index | A | A | - | O |
| So sánh kết quả Test | A | A | R | A |
| Import Job/Test | A | A | - | O |
| Import Asset/topology | A | A | A | - |
| Export dữ liệu | A | A | A | A |
| Upload Asset/topology | A | A | A | - |
| Upload Job/Test | A | A | - | O |
| Download trong scope | A | A | A | A |
| Quản lý testing equipment | A | A | A | R |
| Quản lý FMECA toàn cục | A | - | - | - |
| Quản lý FMECA Organisation | A | A | - | - |
| Đọc FMECA | A | A | R | R |
| Xem audit log | A | A | - | - |
| Quản lý license/update | A | - | - | - |

## 7. Danh mục permission

### 7.1. Hệ thống và người dùng

```text
system.manage
license.manage
update.manage
organisation.read
organisation.create
organisation.update
organisation.delete
user.read
user.create
user.update
user.disable
user.assign_role
user.assign_scope
audit.read
audit.export
```

### 7.2. Topology và Asset

```text
topology.read
topology.create
topology.update
topology.delete
topology.import
topology.export
asset.read
asset.create
asset.duplicate
asset.update
asset.delete
asset.import
asset.export
asset.manage_attachment
```

`asset.delete` và `topology.delete` nên là soft-delete. Xóa vật lý chỉ dành cho công cụ bảo trì của System Admin.

### 7.3. Job và Test

```text
job.read
job.create
job.update_own
job.update_all
job.delete_own
job.delete_all
job.import
job.export
job.manage_attachment
test.read
test.edit_result_own
test.edit_result_all
test.compare
test.calculate_ci
health_index.read
health_index.calculate
```

Hệ thống hiện tại chưa có workflow trạng thái cho Job/Test, vì vậy quyền sửa không phụ thuộc vào trạng thái nghiệp vụ:

- Test Engineer được sửa Job/Test do mình sở hữu trong scope được giao.
- Organisation Admin được sửa Job/Test trong Organisation, không phụ thuộc ownership.
- Nếu sau này bổ sung trạng thái khóa kết quả hoặc luồng duyệt, cần thiết kế thành một workflow riêng và cập nhật permission tương ứng.

### 7.4. Đồng bộ

```text
sync.download
sync.upload_topology
sync.upload_asset
sync.upload_job
sync.resolve_conflict
```

Không dùng một quyền chung như `sync.all`. Server phải kiểm tra quyền theo từng loại entity trong payload.

### 7.5. FMECA và testing equipment

```text
fmeca.read
fmeca.create_org
fmeca.update_org
fmeca.delete_org
fmeca.manage_global
testing_equipment.read
testing_equipment.create
testing_equipment.update
testing_equipment.delete
```

FMECA demo có scope `global`: mọi người được đọc, chỉ System Admin được cập nhật.

## 8. Ví dụ cụ thể

### 8.1. Test Engineer được giao một trạm

```text
Organisation: CÔNG TY TNHH FUJIWARA
Substation: Điện mặt trời Fujiwara
Voltage Level: 110 kV
Bay: T1
Asset: Transformer T1
Người dùng: Nguyễn Văn An
Vai trò: Test Engineer
Scope: Substation Điện mặt trời Fujiwara
```

Nguyễn Văn An được:

- Xem mọi Voltage Level, Bay và Asset trong trạm Fujiwara.
- Tạo Job DGA cho Transformer T1.
- Nhập kết quả DGA, Calculate CI và xem Health Index.
- Import file PTM nếu file chỉ chứa Job/Test của T1.
- Upload Job/Test của mình lên server.

Nguyễn Văn An không được:

- Sửa serial number hoặc vector group của T1.
- Tạo Transformer mới.
- Xem hoặc sửa tài sản tại trạm khác.
- Import file PTM có chứa Asset mới.

### 8.2. Import PTM/CPXpert theo nội dung file

**File chỉ chứa Job/Test:**

```text
Cần: job.import + asset.read trên Asset đích
```

Test Engineer chọn Asset T1 và import được.

**File chứa Asset và Job/Test:**

```text
Cần: asset.import + job.import trên Bay/Substation đích
```

Test Engineer bị chặn vì không có `asset.import`. Asset Manager có thể thực hiện import.

**File chứa Bay, Voltage Level, Asset và Job/Test:**

```text
Cần: topology.import + asset.import + job.import trên Substation đích
```

Hệ thống phải kiểm tra toàn bộ permission trước khi ghi dữ liệu để tránh import nửa chừng.

### 8.3. Asset Manager chuẩn bị tài sản

Trần Thị Bình là Asset Manager tại Substation Fujiwara:

1. Tạo Bay T2.
2. Tạo Transformer T2 trong Bay T2.
3. Khai báo nameplate và vector group.
4. Upload Transformer T2 lên server.

Sau đó Nguyễn Văn An có thể tạo Job/Test cho T2, nhưng không được sửa thông tin Asset.

### 8.4. Cô lập hai Organisation

User A là Organisation Admin của FUJIWARA; User B là Test Engineer của EVNHCMC.

- User A không nhìn thấy dữ liệu chỉ thuộc EVNHCMC.
- User B không thể lấy Asset của FUJIWARA qua API dù biết `mrid`.
- Server phải lọc scope trong truy vấn, không chỉ ẩn node trên giao diện.

Nếu cần chia sẻ một Asset, phải có bản ghi chia sẻ rõ ràng thay vì mở quyền cả cây.

### 8.5. Test Engineer nghỉ việc

Nguyễn Văn An còn các Job do mình phụ trách. Organisation Admin sẽ:

1. Disable tài khoản Nguyễn Văn An.
2. Chuyển `assigned_to` của Job sang Test Engineer mới.
3. Ghi audit gồm người cũ, người mới, thời gian và lý do.

Không sửa `created_by`; trường này phải giữ nguyên lịch sử tạo dữ liệu.

### 8.6. Auto-update và phân quyền

Máy đã activation hợp lệ và người dùng đang có vai trò Test Engineer:

- Auto-update chỉ kiểm tra license của máy và cài phiên bản mới.
- Activation certificate và dữ liệu người dùng trong AppData được giữ lại.
- Role không nằm trong bộ cài và không thay đổi theo phiên bản ứng dụng.
- Khi khởi động lại, quyền mới nhất được lấy từ server hoặc authorization certificate còn hiệu lực.

## 9. Cấu trúc database server

```text
role
----
id
code
name
description

permission
----------
id
code
resource
action

role_permission
---------------
role_id
permission_id

user_role_scope
---------------
id
user_id
role_id
scope_type
scope_id
valid_from
valid_to
status

entity_assignment
-----------------
id
entity_type
entity_id
assigned_to
assigned_by
assigned_at
status
```

`scope_type` gồm:

```text
SYSTEM
ORGANISATION
SUBSTATION
VOLTAGE_LEVEL
BAY
ASSET
```

Không cần lưu quyền riêng cho từng Job/Test. Server lần theo cây cha để xác định Job/Test có thuộc scope hay không.

## 10. Kiểm tra quyền trên server

Mọi API ghi dữ liệu phải:

1. Xác thực access token.
2. Xác định người dùng và Organisation.
3. Xác định resource và scope của entity.
4. Kiểm tra permission.
5. Kiểm tra ownership nếu permission là `*_own`.
6. Thực hiện transaction.
7. Ghi audit log.

Ví dụ cập nhật Job:

```text
PUT /api/jobs/{jobId}
```

Điều kiện với Test Engineer:

```text
job.update_own
AND job.created_by = current_user
AND job.asset nằm trong scope của current_user
```

Organisation Admin dùng `job.update_all`, không bị giới hạn bởi ownership nhưng vẫn bị giới hạn trong Organisation.

## 11. Xử lý trên Electron client

Client nên có một hàm tập trung:

```text
can(permissionCode, entity)
```

Ví dụ:

```text
can('asset.update', selectedAsset)
can('job.update_own', selectedJob)
can('test.calculate_ci', selectedTest)
```

Giao diện dùng kết quả để:

- Ẩn nút mà người dùng không có quyền.
- Disable trường dữ liệu khi chỉ có quyền đọc.
- Chặn context menu không hợp lệ.
- Hiện thông báo rõ ràng khi server từ chối.

Client không được xem `can()` là biện pháp bảo mật; server luôn kiểm tra lại.

## 12. Làm việc offline

Khi đăng nhập online, server có thể cấp authorization certificate đã ký:

```json
{
  "userId": "user-123",
  "organisationId": "org-21",
  "roles": ["TEST_ENGINEER"],
  "scopes": [
    {
      "type": "SUBSTATION",
      "id": "substation-45"
    }
  ],
  "issuedAt": "2026-09-29T00:00:00Z",
  "expiresAt": "2026-10-06T00:00:00Z"
}
```

Client kiểm tra chữ ký và thời hạn để cho phép offline. Khi upload, server vẫn kiểm tra quyền mới nhất; certificate offline không đảm bảo upload thành công nếu user đã bị khóa.

## 13. Audit bắt buộc

Ghi audit cho:

- Tạo, sửa, xóa topology và Asset.
- Duplicate và import Asset.
- Tạo, sửa, xóa Job/Test.
- Tính CI và Health Index nếu kết quả được lưu.
- Upload, download và xử lý conflict.
- Gán role, thay đổi scope và disable user.
- Thay đổi người phụ trách Job.
- Thay đổi FMECA.

Audit cần lưu giá trị trước/sau, user, thời gian, thiết bị, action code và entity ID.

## 14. Lộ trình triển khai

### Giai đoạn 1

- Tạo bốn role cố định.
- Tạo permission catalogue.
- Gán role theo Organisation/Substation.
- Kiểm tra quyền tại API Asset, Job/Test và sync.
- Ẩn/disable chức năng trên client.
- Ghi audit cho thao tác ghi dữ liệu.

### Giai đoạn 2

- Bổ sung scope Bay và Asset.
- Bổ sung ownership và chuyển người phụ trách Job.
- Cấp authorization certificate cho offline.
- Kiểm tra quyền import theo nội dung file.

### Giai đoạn 3

- Cho Organisation tạo custom role từ permission có sẵn.
- Bổ sung Reviewer/Approver và Viewer/Auditor nếu nghiệp vụ yêu cầu.
- Bổ sung revision cho kết quả đã hoàn tất.

## 15. Kết luận

RBAC kết hợp scope theo cây dữ liệu phù hợp với AT Digital Tester. Bốn vai trò hiện tại tách rõ quản trị hệ thống, quản trị đơn vị, quản lý tài sản và thực hiện thử nghiệm.

Quyền phải được kiểm tra trên server; client chỉ phản ánh quyền lên giao diện. Activation xác nhận máy được phép chạy phần mềm, không thay thế role và permission của người đăng nhập.
