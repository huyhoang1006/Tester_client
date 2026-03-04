# STAGE 1: INITIALIZE DOWNLOAD

## Mục tiêu
Khởi tạo môi trường và resources cần thiết cho quá trình download

## Chức năng chính
- `initializeDownload()`
- `createCancellationToken()`
- `beginTransaction()`

## Tasks

### Task 1.1: Tạo CancellationToken
- [ ] Tạo `AbortController` để hỗ trợ user hủy
- [ ] Lưu token vào context/state
- [ ] Gắn event listener cho nút Cancel

### Task 1.2: Bắt đầu SQLite Transaction
- [ ] Gọi `db.beginTransaction()`
- [ ] Kiểm tra transaction bắt đầu thành công
- [ ] Lưu transaction ID để rollback nếu cần

### Task 1.3: Khởi tạo ProgressEmitter
- [ ] Tạo progress state: `{ current: 0, stage: 'initializing', message: '' }`
- [ ] Emit event `download:progress` với giá trị 0%
- [ ] Đăng ký listener để UI cập nhật progress bar

### Task 1.4: Ghi log bắt đầu
- [ ] Log: "Bắt đầu download organisation: {name} ({mrid})"
- [ ] Log timestamp bắt đầu
- [ ] Lưu vào download history

### Task 1.5: Set timeout toàn bộ operation
- [ ] Tạo global timeout (default: 5 phút = 300000ms)
- [ ] Sử dụng `Promise.race()` để handle timeout
- [ ] Nếu timeout → Trigger cancellation + rollback

### Task 1.6: Khởi tạo error tracking
- [ ] Tạo array `failedItems` để log các items lỗi
- [ ] Tạo object `stageErrors` để track lỗi theo stage
- [ ] Khởi tạo statistics counters:
  - `created: 0`
  - `updated: 0`
  - `skipped: 0`
  - `failed: 0`

## Code Template

```javascript
class DownloadContext {
  constructor() {
    this.abortController = new AbortController()
    this.signal = this.abortController.signal
    this.failedItems = []
    this.stageErrors = {}
    this.stats = {
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0
    }
    this.startTime = null
    this.transaction = null
  }
}

async function initializeDownload(node) {
  // 1.1: Tạo CancellationToken
  const context = new DownloadContext()

  // Lắng nghe sự kiện hủy từ user
  context.signal.addEventListener('abort', () => {
    logInfo('Download cancelled by user')
    handleUserCancellation()
  })

  // 1.2: Bắt đầu SQLite Transaction
  try {
    context.transaction = await db.beginTransaction()
    logInfo('SQLite transaction started')
  } catch (error) {
    throw new Error('Không thể bắt đầu transaction: ' + error.message)
  }

  // 1.3: Khởi tạo ProgressEmitter
  context.progress = {
    current: 0,
    stage: 'initializing',
    message: 'Đang khởi tạo...'
  }
  emitProgress(context.progress)

  // 1.4: Ghi log bắt đầu
  context.startTime = Date.now()
  logInfo(`Bắt đầu download organisation: ${node.name} (${node.mrid})`)

  // 1.5: Set timeout toàn bộ operation
  const GLOBAL_TIMEOUT = 5 * 60 * 1000 // 5 phút
  context.timeoutId = setTimeout(() => {
    logError('Download timeout after 5 minutes')
    context.abortController.abort()
  }, GLOBAL_TIMEOUT)

  // 1.6: Khởi tạo error tracking
  context.failedItems = []
  context.stageErrors = {}

  return context
}
```

## Progress Values
- Start: 0%
- End: 10%

## Error Handling

| Error | Action |
|-------|--------|
| Transaction begin failed | Rollback + Throw error |
| Abort signal triggered | Cleanup + End |
| Timeout | Abort + Rollback + Notify user |

## Dependencies
- Database: SQLite transaction API
- UI: Progress bar component
- Logging: Logger service

## Previous Stage
- Input: Validated `node` từ Stage 0

## Next Stage
- Output: `DownloadContext` → Stage 2: Prepare Data
