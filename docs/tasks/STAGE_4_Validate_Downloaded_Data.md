# STAGE 4: VALIDATE DOWNLOADED DATA

## Mục tiêu
Kiểm tra và xác thực dữ liệu đã download trước khi commit

## Chức năng chính
- `validateDownloadedData()`

## Tasks

### Task 4.1: Kiểm tra số lượng entities
- [ ] Đếm số lượng Organisation đã download
- [ ] So sánh với số lượng từ Stage 2 (chain length)
- [ ] Log kết quả

### Task 4.2: Verify Referential Integrity
- [ ] Kiểm tra mỗi organisation (trừ root) có parent trong DB
- [ ] Ghi log các entities có vấn đề FK

### Task 4.3: Kiểm tra required fields
- [ ] Với mỗi entity đã download
- [ ] Kiểm tra các trường bắt buộc: mrid, name
- [ ] Log warning nếu thiếu

### Task 4.4: Compile Statistics
- [ ] Tổng hợp statistics: created, updated, skipped, failed
- [ ] Log chi tiết
- [ ] Tính thời gian download

### Task 4.5: Generate Failed Report
- [ ] Tạo report về các items failed
- [ ] Lưu vào context để hiển thị cho user

## Code Template

```javascript
async function validateDownloadedData(context) {
  updateProgress(70, 'validating', 'Đang kiểm tra dữ liệu...')

  const validationResult = {
    entityCounts: {},
    fkIssues: [],
    missingFields: [],
    stats: { ...context.stats }
  }

  // ============================================
  // Task 4.1: Kiểm tra số lượng entities
  // ============================================
  logInfo('===== VALIDATION: Entity Counts =====')

  const serverCount = context.chain.length
  const localCount = await db.count('Organisation')

  validationResult.entityCounts = {
    Organisation: {
      server: serverCount,
      local: localCount,
      diff: serverCount - localCount
    }
  }

  logInfo(`Organisation: ${localCount} (server: ${serverCount})`)

  // ============================================
  // Task 4.2: Verify Referential Integrity
  // ============================================
  logInfo('===== VALIDATION: FK Integrity =====')

  const fkIssues = await db.query(`
    SELECT o.mrid, o.name
    FROM Organisation o
    LEFT JOIN Organisation parent ON o.parent_mrid = parent.mrid
    WHERE o.parent_mrid IS NOT NULL AND parent.mrid IS NULL
  `)

  if (fkIssues.length > 0) {
    validationResult.fkIssues.push({
      type: 'Organisation',
      count: fkIssues.length,
      items: fkIssues
    })
    logWarning(`Found ${fkIssues.length} Organisations without parent`)
  }

  // ============================================
  // Task 4.3: Kiểm tra required fields
  // ============================================
  logInfo('===== VALIDATION: Required Fields =====')

  const missingRequired = await db.query(`
    SELECT mrid, name FROM Organisation
    WHERE mrid IS NULL OR name IS NULL OR mrid = ''
  `)

  if (missingRequired.length > 0) {
    validationResult.missingFields.push({
      type: 'Organisation',
      count: missingRequired.length,
      items: missingRequired.slice(0, 10)
    })
    logWarning(`Found ${missingRequired.length} Organisations with missing required fields`)
  }

  // ============================================
  // Task 4.4: Compile Statistics
  // ============================================
  const duration = Date.now() - context.startTime
  const durationSeconds = (duration / 1000).toFixed(2)

  validationResult.summary = {
    totalCreated: context.stats.created,
    totalUpdated: context.stats.updated,
    totalSkipped: context.stats.skipped,
    totalFailed: context.stats.failed,
    duration: durationSeconds,
    success: context.stats.failed === 0
  }

  logInfo(`===== VALIDATION SUMMARY =====`)
  logInfo(`Created: ${validationResult.summary.totalCreated}`)
  logInfo(`Updated: ${validationResult.summary.totalUpdated}`)
  logInfo(`Skipped: ${validationResult.summary.totalSkipped}`)
  logInfo(`Failed: ${validationResult.summary.totalFailed}`)
  logInfo(`Duration: ${durationSeconds}s`)

  // ============================================
  // Task 4.5: Generate Failed Report
  // ============================================
  context.validationResult = validationResult

  return context
}
```

## Progress Values
- Start: 70%
- End: 80%

## Error Handling

| Issue | Action |
|-------|--------|
| Count diff | Log warning → Continue |
| FK issues | Log warning → Continue |
| Missing required fields | Log warning → Skip items |

## Dependencies
- Database: Query operations

## Previous Stage
- Input: `context` với chain đã download từ Stage 3

## Next Stage
- Output: `context.validationResult` → Stage 5: Commit Transaction
