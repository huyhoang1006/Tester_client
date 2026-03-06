# STAGE 6: REFRESH UI

## Mục tiêu
Cập nhật giao diện người dùng sau khi download hoàn tất

## Chức năng chính
- `refreshClientTree()`
- `showSuccessMessage()`

## Tasks

### Task 6.1: Fetch Children cho Parent Node
- [ ] Gọi `fetchChildren(parentNode)`
- [ ] Refresh tree data từ local DB

### Task 6.2: Update Tree Data
- [ ] Cập nhật tree store với dữ liệu mới
- [ ] Merge với existing tree data

### Task 6.3: Expand Downloaded Nodes
- [ ] Tự động expand các nodes vừa download
- [ ] Focus vào selected organisation

### Task 6.4: Highlight New/Updated Nodes
- [ ] Highlight các entities mới được tạo
- [ ] Highlight các entities được cập nhật

### Task 6.5: Update Progress to 100%
- [ ] Emit progress event với giá trị 100%

### Task 6.6: Show Success Message
- [ ] Hiển thị success notification
- [ ] Message: "Download hoàn thành!"
- [ ] Thêm statistics: Created X, Updated Y, Duration Zs

### Task 6.7: Show Error Message (nếu có)
- [ ] Nếu có failed items
- [ ] Hiển thị error/warning notification

### Task 6.8: Close Progress Dialog
- [ ] Đóng progress dialog sau X giây

## Code Template

```javascript
async function refreshClientTree(context, result) {
  // ============================================
  // Task 6.1: Fetch Children
  // ============================================
  const parentNode = context.node
  await fetchChildren(parentNode)

  // ============================================
  // Task 6.2: Update Tree Data
  // ============================================
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
  // Task 6.3: Expand Downloaded Nodes
  // ============================================
  parentNode.expanded = true

  // ============================================
  // Task 6.4: Highlight New/Updated Nodes
  // ============================================
  const newNodes = await db.getRecentlyCreated(context.startTime)
  const updatedNodes = await db.getRecentlyUpdated(context.startTime)

  treeStore.highlightNodes(newNodes.map(n => n.mrid), 'new')
  treeStore.highlightNodes(updatedNodes.map(n => n.mrid), 'updated')

  // Auto-remove highlight after 10 seconds
  setTimeout(() => {
    treeStore.clearHighlights()
  }, 10000)

  // ============================================
  // Task 6.5: Update Progress to 100%
  // ============================================
  updateProgress(100, 'complete', 'Hoàn tất!')

  // ============================================
  // Task 6.6: Show Success Message
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
  // Task 6.7: Show Error/Warning Message
  // ============================================
  if (result.stats.totalFailed > 0) {
    this.$notify({
      title: 'Download hoàn thành với lỗi',
      message: `<p>⚠️ <strong>${result.stats.totalFailed}</strong> items lỗi</p>`,
      type: 'warning',
      duration: 15000
    })
  }

  // ============================================
  // Task 6.8: Close Progress Dialog
  // ============================================
  setTimeout(() => {
    this.downloadProgressVisible = false
  }, 3000)

  return result
}
```

## Progress Values
- Start: 80%
- End: 100%

## Dependencies
- Store: Tree store
- UI: Notification/Toast component

## Previous Stage
- Input: `result` từ Stage 5: Commit

## Next Stage
- Output: None (END)
