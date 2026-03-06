# STAGE 5: VALIDATE DOWNLOADED DATA

## Mục tiêu
Kiểm tra và xác thực dữ liệu đã download trước khi commit

## Chức năng chính
- `validateDownloadedData()`

## Tasks

### Task 5.1: Kiểm tra số lượng entities
- [ ] Đếm số lượng Organisation đã download
- [ ] Đếm số lượng Substations đã download
- [ ] Đếm số lượng VoltageLevels đ已 download
- [ ] Đếm số lượng Bays đã download
- [ ] Đếm số lượng Assets đã download
- [ ] So sánh với số lượng từ Stage 2 (server response)
- [ ] Nếu chênh lệch > 10% → Log warning

### Task 5.2: Verify Referential Integrity
- [ ] Kiểm tra tất cả Substations có parent Organisation trong DB
- [ ] Kiểm tra tất cả VoltageLevels có parent Substation trong DB
- [ ] Kiểm tra tất cả Bays có parent VoltageLevel trong DB
- [ ] Kiểm tra tất cả Assets có parent Bay trong DB
- [ ] Ghi log các entities có vấn đề FK

### Task 5.3: Kiểm tra required fields
- [ ] Với mỗi entity đã download
- [ ] Kiểm tra các trường bắt buộc: mrid, name
- [ ] Log warning nếu thiếu optional fields
- [ ] Đánh dấu entities có dữ liệu không đầy đủ

### Task 5.4: Kiểm tra duplicates
- [ ] Query database để tìm duplicate MRIDs
- [ ] Kiểm tra xem có entities trùng lặp không
- [ ] X nếu cóử lý duplicates

### Task 5.5: Compile Statistics
- [ ] Tổng hợp statistics: created, updated, skipped, failed
- [ ] Log chi tiết từng loại entity
- [ ] Tính thời gian download
- [ ] Format thành message cho user

### Task 5.6: Generate Failed Report
- [ ] Tạo report về các items failed
- [ ] Bao gồm: type, mrid, error message
- [ ] Lưu vào context để hiển thị cho user

## Code Template

```javascript
async function validateDownloadedData(context) {
  updateProgress(90, 'validating', 'Đang kiểm tra dữ liệu...')

  const validationResult = {
    entityCounts: {},
    fkIssues: [],
    missingFields: [],
    duplicates: [],
    stats: { ...context.stats }
  }

  // ============================================
  // Task 5.1: Kiểm tra số lượng entities
  // ============================================
  logInfo('===== VALIDATION: Entity Counts =====')

  const entityTypes = ['Organisation', 'Substation', 'VoltageLevel', 'Bay', 'Asset']

  for (const type of entityTypes) {
    const serverCount = context.descendants[type.toLowerCase() + 's']?.length || 0
    const localCount = await db.count(type)

    validationResult.entityCounts[type] = {
      server: serverCount,
      local: localCount,
      diff: serverCount - localCount
    }

    const diffPercent = serverCount > 0
      ? Math.abs((serverCount - localCount) / serverCount * 100)
      : 0

    if (diffPercent > 10) {
      logWarning(`Validation Warning: ${type} count diff ${diffPercent.toFixed(1)}% `
        + `(${serverCount} server vs ${localCount} local)`)
    } else {
      logInfo(`${type}: ${localCount} (server: ${serverCount})`)
    }
  }

  // ============================================
  // Task 5.2: Verify Referential Integrity
  // ============================================
  logInfo('===== VALIDATION: FK Integrity =====')

  // Check Substation → Organisation
  const substationFKIssues = await db.query(`
    SELECT s.mrid, s.name
    FROM Substation s
    LEFT JOIN Organisation o ON s.parent_mrid = o.mrid
    WHERE o.mrid IS NULL
  `)

  if (substationFKIssues.length > 0) {
    validationResult.fkIssues.push({
      type: 'Substation',
      count: substationFKIssues.length,
      items: substationFKIssues
    })
    logWarning(`Found ${substationFKIssues.length} Substations without Organisation parent`)
  }

  // Check VoltageLevel → Substation
  const voltageLevelFKIssues = await db.query(`
    SELECT v.mrid, v.name
    FROM VoltageLevel v
    LEFT JOIN Substation s ON v.parent_mrid = s.mrid
    WHERE s.mrid IS NULL
  `)

  // Check Bay → VoltageLevel
  const bayFKIssues = await db.query(`
    SELECT b.mrid, b.name
    FROM Bay b
    LEFT JOIN VoltageLevel v ON b.parent_mrid = v.mrid
    WHERE v.mrid IS NULL
  `)

  // Check Asset → Bay
  const assetFKIssues = await db.query(`
    SELECT a.mrid, a.name
    FROM Asset a
    LEFT JOIN Bay b ON a.parent_mrid = b.mrid
    WHERE b.mrid IS NULL
  `)

  // ============================================
  // Task 5.3: Kiểm tra required fields
  // ============================================
  logInfo('===== VALIDATION: Required Fields =====')

  for (const type of entityTypes) {
    const missingRequired = await db.query(`
      SELECT mrid, name FROM ${type}
      WHERE mrid IS NULL OR name IS NULL OR mrid = ''
    `)

    if (missingRequired.length > 0) {
      validationResult.missingFields.push({
        type,
        count: missingRequired.length,
        items: missingRequired.slice(0, 10) // Limit to 10
      })
      logWarning(`Found ${missingRequired.length} ${type} with missing required fields`)
    }
  }

  // ============================================
  // Task 5.4: Kiểm tra duplicates
  // ============================================
  logInfo('===== VALIDATION: Duplicates =====')

  for (const type of entityTypes) {
    const duplicates = await db.query(`
      SELECT mrid, COUNT(*) as count
      FROM ${type}
      GROUP BY mrid
      HAVING count > 1
    `)

    if (duplicates.length > 0) {
      validationResult.duplicates.push({
        type,
        count: duplicates.length,
        items: duplicates
      })
      logError(`Found ${duplicates.length} duplicate MRIDs in ${type}`)
    }
  }

  // ============================================
  // Task 5.5: Compile Statistics
  // ============================================
  const duration = Date.now() - context.startTime
  const durationSeconds = (duration / 1000).toFixed(2)

  validationResult.summary = {
    totalCreated: context.stats.created,
    totalUpdated: context.stats.updated,
    totalSkipped: context.stats.skipped,
    totalFailed: context.stats.failed,
    totalFailedItems: context.failedItems.length,
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
  // Task 5.6: Generate Failed Report
  // ============================================
  context.validationResult = validationResult

  return context
}
```

## Progress Values
- Start: 90%
- End: 95%

## Error Handling

| Issue | Action |
|-------|--------|
| Count diff > 10% | Log warning → Continue |
| FK issues | Log warning → Continue (đã được download) |
| Missing required fields | Log warning → Skip items |
| Duplicates | Log error → Cần manual intervention |

## Dependencies
- Database: Query operations
- Utils: Logging

## Previous Stage
- Input: `context` với descendants đã download từ Stage 4

## Next Stage
- Output: `context.validationResult` → Stage 6: Commit Transaction
