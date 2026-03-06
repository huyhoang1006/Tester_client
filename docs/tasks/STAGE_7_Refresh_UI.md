# STAGE 7: REFRESH UI

## Mục tiêu
Cập nhật giao diện người dùng sau khi download hoàn tất

## Chức năng chính
- `refreshClientTree()`
- `showSuccessMessage()`
- `showErrorMessage()`

## Tasks

### Task 7.1: Fetch Children cho Parent Node
- [ ] Gọi `fetchChildren(parentNode)`
- [ ] Refresh tree data từ local DB
- [ ] Chỉ refresh các nodes bị ảnh hưởng (optimized)

### Task 7.2: Update Tree Data
- [ ] Cập nhật tree store/với dữ liệu mới
- [ ] Merge với existing tree data
- [ ] Xử lý trường hợp: node đã tồn tại (update) vs node mới (add)

### Task 7.3: Expand Downloaded Nodes
- [ ] Tự động expand các nodes vừa download
- [ ] Focus vào selected organisation

### Task 7.4: Highlight New/Updated Nodes
- [ ] Highlight các entities mới được tạo
- [ ] Highlight các entities được cập nhật
- [ ] Sử dụng visual indicator (color/icon)

### Task  Update7.5: Progress to 100%
- [ ] Emit progress event với giá trị 100%
- [ ] Đảm bảo progress bar hiển thị complete

### Task 7.6: Show Success Message
- [ ] Hiển thị success notification
- [ ] Message: "Download hoàn thành!"
- [ ] Thêm statistics: Created X, Updated Y, Duration Zs
- [ ] Option: Show details (click để xem chi tiết)

### Task 7.7: Show Error Message (nếu có)
- [ ] Nếu có failed items
- [ ] Hiển thị error/warning notification
- [ ] Message: "Download hoàn thành với X lỗi"
- [ ] Option: Xem danh sách lỗi

### Task 7.8: Close Progress Dialog
- [ ] Đóng progress dialog sau X giây (delay)
- [ ] Hoặc đợi user click close

## Code Template

```javascript
async function refreshClientTree(context, result) {
  // ============================================
  // Task 7.1: Fetch Children
  // ============================================
  const parentNode = context.node

  // Fetch fresh data từ local DB
  await fetchChildren(parentNode)

  // ============================================
  // Task 7.2: Update Tree Data
  // ============================================
  // Update store với dữ liệu mới
  treeStore.updateNode(parentNode.mrid, {
    _childrenFetched: false,
    expanded: true,
    _stats: {
      created: result.stats.totalCreated,
      updated: result.stats.totalUpdated,
      timestamp: Date.now()
    }
  })

  // ============================================
  // Task 7.3: Expand Downloaded Nodes
  // ============================================
  // Expand parent node
  parentNode.expanded = true

  // ============================================
  // Task 7.4: Highlight New/Updated Nodes
  // ============================================
  // Add visual indicators
  const newNodes = await db.getRecentlyCreated(context.startTime)
  const updatedNodes = await db.getRecentlyUpdated(context.startTime)

  // Highlight in tree
  treeStore.highlightNodes(newNodes.map(n => n.mrid), 'new')
  treeStore.highlightNodes(updatedNodes.map(n => n.mrid), 'updated')

  // Auto-remove highlight after 10 seconds
  setTimeout(() => {
    treeStore.clearHighlights()
  }, 10000)

  // ============================================
  // Task 7.5: Update Progress to 100%
  // ============================================
  updateProgress(100, 'complete', 'Hoàn tất!')

  // ============================================
  // Task 7.6: Show Success Message
  // ============================================
  if (result.success) {
    const duration = (result.duration / 1000).toFixed(2)

    this.$notify({
      title: 'Download thành công',
      message: `
        <div>
          <p>🎉 <strong>${context.node.name}</strong></p>
          <ul>
            <li>✅ Tạo mới: <strong>${result.stats.totalCreated}</strong></li>
            <li>🔄 Cập nhật: <strong>${result.stats.totalUpdated}</strong></li>
            <li>⏱️ Thời gian: <strong>${duration}s</strong></li>
          </ul>
        </div>
      `,
      type: 'success',
      duration: 10000,
      dangerouslyUseHTMLString: true
    })
  }

  // ============================================
  // Task 7.7: Show Error/Warning Message
  // ============================================
  if (result.stats.totalFailed > 0) {
    const failedItems = context.failedItems

    this.$notify({
      title: 'Download hoàn thành với lỗi',
      message: `
        <div>
          <p>⚠️ <strong>${result.stats.totalFailed}</strong> items lỗi</p>
          <ul>
            ${failedItems.slice(0, 5).map(item =>
              `<li>${item.type}: ${item.mrid} - ${item.error}</li>`
            ).join('')}
            ${failedItems.length > 5
              ? `<li>...và ${failedItems.length - 5} items khác</li>`
              : ''}
          </ul>
          <button class="btn-details">Xem chi tiết</button>
        </div>
      `,
      type: 'warning',
      duration: 15000,
      dangerouslyUseHTMLString: true,
      onClick: () => showFailedItemsDialog(failedItems)
    })
  }

  // ============================================
  // Task 7.8: Close Progress Dialog
  // ============================================
  setTimeout(() => {
    this.downloadProgressVisible = false
  }, 3000)

  return result
}

// Helper: Show failed items dialog
function showFailedItemsDialog(failedItems) {
  // Hiển thị dialog với danh sách failed items
  // Cho phép retry cho từng item
}
```

## Progress Values
- Start: 95%
- End: 100%

## UI Components

| Component | Mô tả |
|-----------|-------|
| Progress Bar | 0-100% với stage indicator |
| Success Notification | Toast với statistics |
| Warning Notification | Toast nếu có failed items |
| Tree View | Cập nhật với new/updated nodes |
| Highlight | Visual indicator cho changes |

## Dependencies
- Store: Tree store
- UI: Notification/Toast component
- Database: Query operations

## Previous Stage
- Input: `result` từ Stage 6: Commit

## Next Stage
- Output: None (END)

## Post-Download Actions (Optional)

- [ ] Send analytics event
- [ ] Update last sync timestamp
- [ ] Show "Open in Tree" button
- [ ] Enable "View Details" action
