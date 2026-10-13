# Hướng dẫn cài GitLab Runner cho pipeline `product`

Tài liệu này dành cho project **Tester_client**:

- GitLab instance: `http://103.163.118.212:30151`
- Project: `tester-ied/tester/Tester_client`
- Nhánh phát hành: `product`
- Runner tag bắt buộc: `electron`
- Executor: Windows `shell`
- Shell: Windows PowerShell (`powershell`)

Pipeline hiện tại chỉ chạy khi commit nằm trên nhánh `product`. Hai job `build_electron` và
`publish_update_package` đều yêu cầu tag `electron`.

## 1. Kết quả sau khi cài

Máy mới sẽ hoạt động như một project runner độc lập:

1. GitLab giao job có tag `electron` cho một runner đang rảnh.
2. Runner checkout source của `Tester_client`.
3. `npm ci` cài đúng dependency từ `package-lock.json`.
4. `npm run electron:build` tạo installer Windows.
5. GitLab lưu toàn bộ `dist_electron/` dưới dạng job artifact trong 30 ngày.
6. Job publish tải ba file sau lên Generic Package Registry:
   - `latest.yml`
   - `AT-Digital-Tester-Setup-<version>.exe`
   - `AT-Digital-Tester-Setup-<version>.exe.blockmap`

Runner không cần Project Access Token để publish. Pipeline đang dùng biến có sẵn
`CI_JOB_TOKEN`, `CI_API_V4_URL` và `CI_PROJECT_ID` do GitLab cấp riêng cho từng job.

## 2. Thông số máy khuyến nghị

- Windows 10/11 x64 hoặc Windows Server x64.
- CPU từ 4 core, khuyến nghị 8 core.
- RAM tối thiểu 8 GB, khuyến nghị 16 GB.
- Trống tối thiểu 30 GB trên ổ cài runner/cache.
- Máy truy cập được:
  - `http://103.163.118.212:30151`
  - `https://registry.npmjs.org`
  - `https://github.com`
  - các host tải Electron/electron-builder trên GitHub.
- Đồng hồ Windows được đồng bộ đúng thời gian.

Nên dùng một máy CI riêng. Runner kiểu `shell` thực thi trực tiếp script từ repository với
quyền của Windows Service, vì vậy không dùng máy chứa dữ liệu cá nhân hoặc thông tin nhạy cảm.

> **Cảnh báo:** GitLab hiện được truy cập qua `http://`, vì vậy lưu lượng đăng ký runner,
> checkout source và giao tiếp job không được HTTPS mã hóa. Chỉ cho máy runner kết nối qua
> LAN/VPN tin cậy, giới hạn port `30151` bằng firewall và không public port này ra Internet.
> Giải pháp lâu dài là đặt GitLab sau HTTPS/reverse proxy; khi đó phải cập nhật URL của runner.

## 3. Chuẩn bị thông tin từ GitLab admin

Trước khi cài, cần có:

1. Quyền Maintainer hoặc Owner của project.
2. Phiên bản GitLab server đang chạy.
3. Runner authentication token dạng `glrt-...` được tạo ở bước 6.

GitLab Runner nên cùng `major.minor` với GitLab server. Nếu máy runner hiện tại đang chạy ổn,
cách ít rủi ro nhất là dùng đúng phiên bản hiển thị bởi lệnh sau trên máy đó:

```powershell
gitlab-runner --version
```

Không lưu token trong repository, ảnh chụp màn hình, tài liệu bàn giao hoặc tin nhắn nhóm.

## 4. Tạo cấu trúc thư mục

Mở **PowerShell bằng Run as administrator**:

```powershell
New-Item -ItemType Directory -Force -Path D:\GitLab-Runner
New-Item -ItemType Directory -Force -Path D:\GitLab-Runner\builds
New-Item -ItemType Directory -Force -Path D:\GitLab-Runner\cache
New-Item -ItemType Directory -Force -Path D:\CI-Tools
```

Nếu máy không có ổ `D:`, thay toàn bộ đường dẫn trong tài liệu bằng một ổ còn đủ dung lượng.

## 5. Cài công cụ build

### 5.1 Git for Windows

Cài Git for Windows bản x64 cho toàn máy. Sau khi cài, mở PowerShell mới và kiểm tra:

```powershell
git --version
```

Để tránh lỗi đường dẫn dài của `node_modules`, chạy bằng quyền Administrator:

```powershell
git config --system core.longpaths true
```

### 5.2 Node.js đúng phiên bản của project

Project hiện được build ổn định bằng:

- Node.js `16.20.2` x64
- npm `8.19.4`

Tải file chính thức:

`https://nodejs.org/dist/v16.20.2/node-v16.20.2-win-x64.zip`

Giải nén thành:

```text
D:\CI-Tools\node-v16.20.2-win-x64
```

Thêm thư mục trên vào **Machine PATH**, không chỉ User PATH. Runner chạy dưới Windows Service
nên có thể không nhìn thấy PATH riêng của người đang đăng nhập.

Mở PowerShell mới và kiểm tra:

```powershell
node --version
npm --version
```

Kết quả mong đợi:

```text
v16.20.2
8.19.4
```

Node 16 đã cũ nhưng đang được ghim để tương thích với Electron 13, `node-sass` 7 và native
dependencies hiện tại. Không tự ý nâng Node trên riêng runner mới; việc nâng Node cần được thực
hiện như một thay đổi dependency của project và kiểm thử trên tất cả runner.

### 5.3 Native build tools

Project có SQLite/SQLCipher và các native dependency. Cài các công cụ sau để runner vẫn build
được khi package không có prebuilt binary phù hợp:

- Python 3.10 x64, thêm vào Machine PATH.
- Visual Studio Build Tools 2022.
- Workload `Desktop development with C++`.
- MSVC C++ build tools và Windows 10/11 SDK.

Visual Studio Installer cho phép đặt phần lớn workload/cache trên ổ `D:`.

Kiểm tra:

```powershell
python --version
where.exe node
where.exe npm
where.exe git
```

## 6. Tạo Project Runner trên GitLab

Mở project:

`http://103.163.118.212:30151/tester-ied/tester/Tester_client`

Project hiện đã có runner cũ `#523 (jQEf8kaa)` với tag `electron`. Không sửa, xóa hoặc dùng
lại token của runner này. Runner mới phải được tạo bằng nút **Create project runner** để GitLab
cấp một runner ID và authentication token riêng.

Trên máy mới, lấy hostname để đặt tên runner không trùng:

```powershell
$env:COMPUTERNAME
```

Quy ước tên đề xuất là `tester-client-product-<HOSTNAME>`, ví dụ
`tester-client-product-CI02`. Tên runner phải khác runner cũ; riêng tag `electron` phải giống
nhau vì `.gitlab-ci.yml` dùng tag này để tìm runner.

Phân biệt các giá trị khi setup:

| Thành phần | Runner mới |
|---|---|
| GitLab runner ID | Phải là ID mới do GitLab tự cấp, không phải `#523` |
| Authentication token | Phải dùng token `glrt-...` mới, không copy token runner cũ |
| Description/name | Phải khác, nên chứa hostname máy mới |
| Tag | Giữ đúng `electron` giống runner cũ |
| Thư mục `D:\GitLab-Runner` | Được dùng giống đường dẫn vì đây là máy Windows khác |
| Windows service | Cài mới trên máy mới, không thao tác service trên máy runner cũ |

Hai runner cùng tag `electron` không khiến một job chạy hai lần. Với mỗi job, GitLab chỉ chọn
một runner phù hợp đang rảnh. Job chỉ bị lặp khi người dùng retry hoặc tạo thêm pipeline.

Thực hiện:

1. Vào **Settings > CI/CD**.
2. Mở phần **Runners**.
3. Chọn **New project runner** hoặc **Create project runner**.
4. Chọn hệ điều hành Windows nếu GitLab hỏi platform.
5. Description: `tester-client-product-<HOSTNAME>`, ví dụ `tester-client-product-CI02`.
6. Tags: nhập chính xác `electron`.
7. Tắt **Run untagged jobs**.
8. Đặt maximum job timeout ít nhất 60 phút nếu có trường này.
9. Chỉ bật **Protected** nếu nhánh `product` là protected branch.
10. Chọn **Create runner**.
11. Sao chép token `glrt-...` đang hiển thị. Token này chỉ hiển thị trong thời gian ngắn.

Kiểm tra trạng thái protected của nhánh ở **Settings > Repository > Protected branches** hoặc
trang quản lý Branches. Nếu runner là Protected nhưng `product` không protected, job sẽ bị stuck.

## 7. Cài GitLab Runner binary

Xác định phiên bản runner trùng với GitLab server hoặc runner cũ. Ví dụ, nếu phiên bản cần cài
là `17.11.1`:

```powershell
$RunnerVersion = '17.11.1' # Thay bằng phiên bản thực tế
$RunnerUrl = "https://gitlab-runner-downloads.s3.amazonaws.com/v$RunnerVersion/binaries/gitlab-runner-windows-amd64.exe"
Invoke-WebRequest -Uri $RunnerUrl -OutFile D:\GitLab-Runner\gitlab-runner.exe
Set-Location D:\GitLab-Runner
.\gitlab-runner.exe --version
```

Không mặc định lấy bản mới nhất nếu GitLab self-managed đang dùng phiên bản cũ.

## 8. Đăng ký runner

Trong PowerShell Administrator, tại `D:\GitLab-Runner`:

```powershell
Set-Location D:\GitLab-Runner
$RunnerToken = Read-Host 'Paste runner authentication token'

.\gitlab-runner.exe register `
  --non-interactive `
  --url 'http://103.163.118.212:30151/' `
  --token $RunnerToken `
  --executor 'shell'

Remove-Variable RunnerToken
```

Lưu ý:

- URL là URL gốc của GitLab, không phải URL đầy đủ của project.
- Dùng `--token` cho token mới dạng `glrt-...`.
- Tag `electron`, trạng thái Protected và Run untagged đã được đặt trong GitLab UI.

Nếu GitLab cũ chỉ cung cấp **registration token** thay vì token `glrt-...`, dùng quy trình legacy:

```powershell
.\gitlab-runner.exe register
```

Sau đó nhập lần lượt URL GitLab, registration token, description, tag `electron`, executor
`shell`. Quy trình token mới vẫn là lựa chọn ưu tiên.

## 9. Kiểm tra `config.toml`

Sau đăng ký, file nằm tại:

```text
D:\GitLab-Runner\config.toml
```

Giữ nguyên `id` và `token` do GitLab tạo. Điều chỉnh các trường không chứa secret theo mẫu:

```toml
concurrent = 1
check_interval = 0

[[runners]]
  name = "tester-client-product-CI02"
  url = "http://103.163.118.212:30151/"
  id = 123
  token = "REDACTED"
  executor = "shell"
  shell = "powershell"
  builds_dir = "D:\\GitLab-Runner\\builds"
  cache_dir = "D:\\GitLab-Runner\\cache"
```

Không copy `id` hoặc `token` từ ví dụ. Không gửi file `config.toml` cho người khác.

`shell = "powershell"` giúp pipeline dùng Windows PowerShell có sẵn trên Windows. File
`.gitlab-ci.yml` hiện tại đã viết bằng cú pháp PowerShell.

## 10. Cài runner thành Windows Service

Electron build hiện tại không chạy GUI test, vì vậy nên chạy runner dưới dạng service để không
phụ thuộc người dùng đăng nhập Windows.

```powershell
Set-Location D:\GitLab-Runner
.\gitlab-runner.exe install
.\gitlab-runner.exe start
.\gitlab-runner.exe status
.\gitlab-runner.exe verify
```

Sau khi cài thêm Node, Git hoặc thay đổi Machine PATH, restart service:

```powershell
.\gitlab-runner.exe restart
```

Trong GitLab, runner phải chuyển sang trạng thái **online**.

## 11. Kiểm tra thủ công trước pipeline đầu tiên

Clone project vào một thư mục test ngoài `builds` và chạy bằng đúng máy runner:

```powershell
Set-Location D:\GitLab-Runner
git clone http://103.163.118.212:30151/tester-ied/tester/Tester_client.git manual-test
Set-Location .\manual-test
git checkout product
node --version
npm --version
npm ci --prefer-offline --no-audit
npm run electron:build
```

Lệnh clone thủ công có thể yêu cầu đăng nhập bằng một tài khoản GitLab được phép đọc project.
Không ghi mật khẩu hoặc access token vào URL. Đây chỉ là bước kiểm tra môi trường; khi pipeline
chạy thật, GitLab Runner tự checkout source bằng thông tin xác thực dành riêng cho job.

Kết quả tối thiểu trong `dist_electron`:

```text
latest.yml
AT-Digital-Tester-Setup-<version>.exe
AT-Digital-Tester-Setup-<version>.exe.blockmap
```

Xoá thư mục test sau khi xác nhận thành công để tiết kiệm dung lượng.

## 12. Chạy pipeline kiểm thử trên GitLab

Để chứng minh pipeline đang chạy bằng runner mới:

1. Tạm **Pause** runner cũ trong GitLab.
2. Đảm bảo version trong `package.json` và `package-lock.json` là version phát hành mới, chưa có
   trong Package Registry.
3. Merge thay đổi vào `product`, hoặc chọn **Build > Pipelines > New pipeline** với branch
   `product`.
4. Mở job `build_electron`.
5. Kiểm tra đầu log có đúng phiên bản Node/npm.
6. Kiểm tra phần runner của job hiển thị đúng tên máy mới, ví dụ
   `tester-client-product-CI02`, và không phải runner cũ `#523`.
7. Đợi `publish_update_package` thành công.
8. Kiểm tra **Deploy > Package registry > at-digital-tester > <version>** có đúng ba file.
9. Bật lại runner cũ nếu muốn giữ cả hai runner làm dự phòng.

Không retry job publish nhiều lần với cùng version nếu không cần thiết. GitLab Generic Package
Registry có thể giữ nhiều asset cùng tên/version, tạo cảm giác một package có 6 hoặc 9 file.

## 13. Cách hai runner phối hợp

Nếu runner cũ và mới cùng online, cùng có tag `electron`:

- GitLab tự chọn runner đang rảnh.
- `build_electron` có thể chạy trên runner A và `publish_update_package` chạy trên runner B.
- Điều này vẫn hợp lệ vì job publish tải artifact của job build qua `needs: artifacts: true`.
- Không cần sửa `.gitlab-ci.yml` để thêm runner thứ hai.

Nếu muốn chỉ runner mới chạy pipeline, pause runner cũ. Không nên đổi tag sang tên cá nhân vì
mục tiêu của hai runner là dự phòng lẫn nhau.

Nên bật **Auto-cancel redundant pipelines** trong phần CI/CD settings hoặc huỷ pipeline product
cũ trước khi merge bản mới. Đồng thời mỗi bản phát hành phải có version riêng.

## 14. Xử lý lỗi thường gặp

### Job bị `stuck`

Kiểm tra:

- Runner có online không.
- Runner có tag chính xác `electron` không.
- **Run untagged jobs** đã tắt nhưng job có tag `electron` hay chưa.
- Runner Protected và branch `product` có cùng trạng thái protected hay không.
- Runner có bị Pause không.

### `node`, `npm` hoặc `git` không được nhận diện

- Công cụ phải nằm trong Machine PATH.
- Mở PowerShell mới để kiểm tra.
- Restart dịch vụ GitLab Runner.
- Không dựa vào PATH chỉ tồn tại trong profile của người cài.

### `npm ci` lỗi native module, `node-gyp`, SQLite hoặc SQLCipher

- Xác nhận Node là `16.20.2` x64.
- Xác nhận Python 3.10 và C++ Build Tools đã cài.
- Xác nhận Windows SDK đã được chọn trong Visual Studio Installer.
- Xoá checkout lỗi và cache npm của pipeline đó rồi chạy lại một lần.

### Electron/electron-builder không tải được binary

Runner phải ra được GitHub. Kiểm tra:

```powershell
Test-NetConnection github.com -Port 443
Invoke-WebRequest https://github.com -UseBasicParsing
```

Nếu công ty dùng proxy, cấu hình `HTTP_PROXY`, `HTTPS_PROXY` và `NO_PROXY` ở mức Machine/Service.
Thêm GitLab nội bộ vào `NO_PROXY`.

### Upload Package Registry trả `401` hoặc `403`

- Không thêm token cá nhân vào máy runner.
- Kiểm tra Package Registry đang bật cho project.
- Kiểm tra job chạy đúng project và dùng `CI_JOB_TOKEN` mặc định.
- Kiểm tra quyền pipeline/job token trong GitLab nếu admin đã siết policy.

### Có nhiều file trùng trong cùng package version

Nguyên nhân thường là retry job publish hoặc nhiều pipeline dùng cùng version. Cách xử lý:

1. Mỗi lần phát hành tăng version trong cả `package.json` và `package-lock.json`.
2. Không để hai pipeline `product` cùng version chạy đồng thời.
3. Xoá package version lỗi rồi chạy lại đúng một pipeline nếu cần làm sạch.

### Lỗi đường dẫn quá dài

Chạy lại:

```powershell
git config --system core.longpaths true
```

Giữ `builds_dir` ngắn như `D:\GitLab-Runner\builds`.

### Service không khởi động

```powershell
Get-WinEvent -ProviderName gitlab-runner -MaxEvents 30 |
  Format-List TimeCreated, LevelDisplayName, Message
```

Nếu cài service bằng user riêng, user đó phải có quyền **Log on as a service** và quyền Modify
trên `D:\GitLab-Runner`.

## 15. Bảo trì runner

- Theo dõi dung lượng `D:\GitLab-Runner\builds` và `cache`.
- Chỉ nâng GitLab Runner sau khi đối chiếu phiên bản GitLab server.
- Trước khi thay binary:

```powershell
Set-Location D:\GitLab-Runner
.\gitlab-runner.exe stop
# Backup config.toml và thay gitlab-runner.exe
.\gitlab-runner.exe start
.\gitlab-runner.exe verify
```

- Nếu máy runner bị mất hoặc bàn giao, xóa runner khỏi GitLab để revoke authentication token.
- Không backup hoặc chia sẻ `config.toml` qua kênh không bảo mật.

## 16. Checklist bàn giao

- [ ] Runner mới hiển thị online trong project.
- [ ] Tag đúng `electron`.
- [ ] Protected khớp với branch `product`.
- [ ] Run untagged jobs đã tắt.
- [ ] Node `16.20.2`, npm `8.19.4`, Git hoạt động trong Machine PATH.
- [ ] `shell = "powershell"`.
- [ ] Runner chạy dưới Windows Service và tự khởi động lại cùng máy.
- [ ] `npm ci` và `npm run electron:build` chạy được thủ công.
- [ ] Pipeline `product` chạy bằng runner mới.
- [ ] Artifact `dist_electron/` tải được từ job build.
- [ ] Package Registry có đúng `latest.yml`, installer và blockmap.
- [ ] Runner cũ có thể pause mà CI/CD vẫn hoàn thành.

## Tài liệu chính thức

- GitLab Runner trên Windows: https://docs.gitlab.com/runner/install/windows/
- Tạo project runner: https://docs.gitlab.com/ci/runners/runners_scope/
- Đăng ký runner: https://docs.gitlab.com/runner/register/
- Tags và Protected runner: https://docs.gitlab.com/ci/runners/configure_runners/
- Generic Package Registry: https://docs.gitlab.com/user/packages/generic_packages/
- Node.js 16.20.2 archive: https://nodejs.org/download/release/v16.20.2/
