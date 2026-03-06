# STAGE 5: COMMIT TRANSACTION

## Mục tiêu
Commit transaction và hoàn tất quá trình download

## Chức năng chính
- `commitTransaction()`
- `rollbackTransaction()`

## Tasks

### Task 5.1: Final Validation Check
- [ ] Kiểm tra `context.validationResult.success`
- [ ] Nếu có quá nhiều failed items (> 50%) → Cân nhắc rollback

### Task 5.2: Commit SQLite Transaction
- [ ] Gọi `db.commitTransaction(context.transaction)`
- [ ] Kiểm tra commit thành công
- [ ] Nếu commit fail → Rollback

### Task 5.3: Handle Commit Failure
- [ ] Nếu commit fail → Gọi rollback
- [ ] Log error chi tiết
- [ ] Throw error để notify user

### Task 5.4: Clear Timeout
- [ ] Clear global timeout đã set ở Stage 1

### Task 5.5: Log Final Status
- [ ] Log: "Download completed successfully" hoặc "Download failed"
- [ ] Lưu vào download history
- [ ] Lưu validation result

### Task 5.6: Cleanup
- [ ] Clear cancellation token
- [ ] Clear progress listeners
- [ ] Giải phóng memory

## Code Template

```javascript
async function commitTransaction(context) {
  updateProgress(80, 'committing', 'Đang hoàn tất...')

  try {
    // Task 5.1: Final Validation Check
    const validation = context.validationResult

    // Nếu > 50% items failed, cân nhắc rollback
    const totalItems = validation.summary.totalCreated + validation.summary.totalUpdated
    const failureRate = totalItems > 0
      ? validation.summary.totalFailed / totalItems
      : 0

    if (failureRate > 0.5) {
      logError(`High failure rate: ${(failureRate * 100).toFixed(1)}%, rolling back`)
      await rollbackTransaction(context)
      throw new Error(`Quá nhiều lỗi (${failureRate * 100}%), đã rollback`)
    }

    // Task 5.2: Commit SQLite Transaction
    logInfo('Attempting to commit transaction...')

    try {
      await db.commitTransaction(context.transaction)
      logInfo('SQLite transaction committed successfully')
    } catch (commitError) {
      logError(`Commit failed: ${commitError.message}`)

      // Task 5.3: Handle Commit Failure
      logInfo('Rolling back transaction...')
      await rollbackTransaction(context)

      throw new Error(`Lỗi khi lưu dữ liệu: ${commitError.message}`)
    }

    // Task 5.4: Clear Timeout
    if (context.timeoutId) {
      clearTimeout(context.timeoutId)
      context.timeoutId = null
    }

    // Task 5.5: Log Final Status
    const duration = Date.now() - context.startTime

    await logDownloadHistory({
      organisationMrid: context.node.mrid,
      organisationName: context.node.name,
      status: 'SUCCESS',
      createdCount: validation.summary.totalCreated,
      updatedCount: validation.summary.totalUpdated,
      durationMs: duration,
      validationResult: validation
    })

    logInfo(`===== DOWNLOAD COMPLETED SUCCESSFULLY =====`)
    logInfo(`Duration: ${(duration / 1000).toFixed(2)}s`)
    logInfo(`Created: ${validation.summary.totalCreated}`)
    logInfo(`Updated: ${validation.summary.totalUpdated}`)

    // Task 5.6: Cleanup
    cleanup(context)

    return {
      success: true,
      stats: validation.summary,
      duration
    }

  } catch (error) {
    logError(`Commit stage failed: ${error.message}`)
    await rollbackTransaction(context)
    cleanup(context)

    return {
      success: false,
      error: error.message,
      failedItems: context.failedItems
    }
  }
}

async function rollbackTransaction(context) {
  if (context.transaction) {
    try {
      await db.rollbackTransaction(context.transaction)
      logInfo('Transaction rolled back successfully')
    } catch (rollbackError) {
      logError(`Rollback failed: ${rollbackError.message}`)
    }
  }
}

function cleanup(context) {
  if (context.timeoutId) {
    clearTimeout(context.timeoutId)
  }
  if (context.signal) {
    context.signal.removeEventListener('abort', handleUserCancellation)
  }
  context.transaction = null
  context.signal = null
}
```

## Progress Values
- Start: 80%
- End: 80% (chờ Stage 6 hoàn thành)

## Error Handling

| Error | Action |
|-------|--------|
| High failure rate (>50%) | Rollback + Notify user |
| Commit failed | Rollback + Notify user |
| Any error | Rollback + Return error object |

## Dependencies
- Database: `commitTransaction()`, `rollbackTransaction()`

## Previous Stage
- Input: `context.validationResult` từ Stage 4

## Next Stage
- Output: Success/Fail result → Stage 6: Refresh UI
