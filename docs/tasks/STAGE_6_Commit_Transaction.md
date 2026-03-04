# STAGE 6: COMMIT TRANSACTION

## Mục tiêu
Commit transaction và hoàn tất quá trình download

## Chức năng chính
- `commitTransaction()`
- `rollbackTransaction()`

## Tasks

### Task 6.1: Final Validation Check
- [ ] Kiểm tra `context.validationResult.success`
- [ ] Nếu có quá nhiều failed items (> 50%) → Cân nhắc rollback

### Task 6.2: Commit SQLite Transaction
- [ ] Gọi `db.commitTransaction(context.transaction)`
- [ ] Kiểm tra commit thành công
- [ ] Nếu commit fail → Rollback

### Task 6.3: Handle Commit Failure
- [ ] Nếu commit fail → Gọi rollback
- [ ] Log error chi tiết
- [ ] Throw error để notify user

### Task 6.4: Clear Timeout
- [ ] Clear global timeout đã set ở Stage 1
- [ ] Ngăn timeout unnecessary fires

### Task 6.5: Log Final Status
- [ ] Log: "Download completed successfully" hoặc "Download failed"
- [ ] Lưu vào download history
- [ ] Lưu validation result

### Task 6.6: Cleanup
- [ ] Clear cancellation token
- [ ] Clear progress listeners
- [ ] Giải phóng memory

## Code Template

```javascript
async function commitTransaction(context) {
  updateProgress(95, 'committing', 'Đang hoàn tất...')

  try {
    // Task 6.1: Final Validation Check
    const validation = context.validationResult

    // Nếu > 50% items failed, cân nhắc rollback
    const failureRate = validation.summary.totalFailed /
      (validation.summary.totalCreated + validation.summary.totalUpdated + validation.summary.totalFailed)

    if (failureRate > 0.5) {
      logError(`High failure rate: ${(failureRate * 100).toFixed(1)}%, rolling back`)
      await rollbackTransaction(context)
      throw new Error(`Quá nhiều lỗi (${failureRate * 100}%), đã rollback`)
    }

    // Task 6.2: Commit SQLite Transaction
    logInfo('Attempting to commit transaction...')

    try {
      await db.commitTransaction(context.transaction)
      logInfo('SQLite transaction committed successfully')
    } catch (commitError) {
      logError(`Commit failed: ${commitError.message}`)

      // Task 6.3: Handle Commit Failure
      logInfo('Rolling back transaction...')
      await rollbackTransaction(context)

      throw new Error(`Lỗi khi lưu dữ liệu: ${commitError.message}`)
    }

    // Task 6.4: Clear Timeout
    if (context.timeoutId) {
      clearTimeout(context.timeoutId)
      context.timeoutId = null
    }

    // Task 6.5: Log Final Status
    const duration = Date.now() - context.startTime

    await logDownloadHistory({
      organisationMrid: context.node.mrid,
      organisationName: context.node.name,
      status: 'SUCCESS',
      createdCount: validation.summary.totalCreated,
      updatedCount: validation.summary.totalUpdated,
      skippedCount: validation.summary.totalSkipped,
      failedCount: validation.summary.totalFailed,
      durationMs: duration,
      validationResult: validation
    })

    logInfo(`===== DOWNLOAD COMPLETED SUCCESSFULLY =====`)
    logInfo(`Duration: ${(duration / 1000).toFixed(2)}s`)
    logInfo(`Created: ${validation.summary.totalCreated}`)
    logInfo(`Updated: ${validation.summary.totalUpdated}`)

    // Task 6.6: Cleanup
    cleanup(context)

    return {
      success: true,
      stats: validation.summary,
      duration
    }

  } catch (error) {
    // Handle any errors during commit
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
      // Database có thể đang trong trạng thái không nhất quán
    }
  }

  // Log rollback vào history
  await logDownloadHistory({
    organisationMrid: context.node?.mrid,
    organisationName: context.node?.name,
    status: 'ROLLBACK',
    error: context.stageErrors,
    failedItems: context.failedItems
  })
}

function cleanup(context) {
  // Clear timeout
  if (context.timeoutId) {
    clearTimeout(context.timeoutId)
  }

  // Remove event listeners
  if (context.signal) {
    context.signal.removeEventListener('abort', handleUserCancellation)
  }

  // Clear references
  context.transaction = null
  context.signal = null
}
```

## Progress Values
- Start: 95%
- End: 95% (chờ Stage 7 hoàn thành)

## Error Handling

| Error | Action |
|-------|--------|
| High failure rate (>50%) | Rollback + Notify user |
| Commit failed | Rollback + Notify user |
| Rollback failed | Log error + Manual intervention needed |
| Any error | Rollback + Return error object |

## Dependencies
- Database: `commitTransaction()`, `rollbackTransaction()`
- Logging: Download history

## Previous Stage
- Input: `context.validationResult` từ Stage 5

## Next Stage
- Output: Success/Fail result → Stage 7: Refresh UI
