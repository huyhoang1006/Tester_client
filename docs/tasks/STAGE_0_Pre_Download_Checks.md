# STAGE 0: PRE-DOWNLOAD CHECKS

## Mục tiêu
Kiểm tra các điều kiện trước khi bắt đầu download organisation

## Chức năng chính
- `validateDownloadRequest()`

## Tasks

### Task 0.1: Kiểm tra node được chọn
- [ ] Kiểm tra `selectedNodes` có giá trị không
- [ ] Lấy node cuối cùng được chọn
- [ ] Kiểm tra node không bị disabled
- [ ] Nếu không có node → Hiển thị warning: "Vui lòng chọn một node để download"

### Task 0.2: Kiểm tra loại node
- [ ] Kiểm tra `node.type` hoặc `node.mode === 'organisation'`
- [ ] Nếu không phải organisation → Hiển thị warning: "Chỉ hỗ trợ download Organisation"
- [ ] Cho phép các loại khác (Substation, Bay, Asset) nếu cần

### Task 0.3: Kiểm tra network
- [ ] Kiểm tra navigator.onLine
- [ ] Hoặc gọi API health check đơn giản
- [ ] Nếu offline → Hiển thị error: "Không có kết nối mạng"

### Task 0.4: Hiển thị confirmation dialog
- [ ] Hiển thị dialog xác nhận
- [ ] Nội dung: "Bạn có muốn download [Tên Organisation]?"
- [ ] Hiển thị thông tin: Số lượng descendants có thể download
- [ ] Nút Confirm / Cancel
- [ ] Nếu Cancel → Kết thúc

### Task 0.5: Kiểm tra quyền
- [ ] Kiểm tra user có quyền download không
- [ ] Kiểm tra user có quyền write local DB không

## Code Template

```javascript
async function validateDownloadRequest(selectedNode) {
  // 0.1: Kiểm tra node được chọn
  if (!selectedNode || selectedNode.length === 0) {
    return { valid: false, error: 'Vui lòng chọn một node để download' }
  }

  const node = selectedNode[selectedNode.length - 1]

  if (node.disabled) {
    return { valid: false, error: 'Node này bị vô hiệu hóa' }
  }

  // 0.2: Kiểm tra loại node
  if (node.type !== 'organisation' && node.mode !== 'organisation') {
    return { valid: false, error: 'Chỉ hỗ trợ download Organisation' }
  }

  // 0.3: Kiểm tra network
  if (!navigator.onLine) {
    return { valid: false, error: 'Không có kết nối mạng' }
  }

  // 0.4: Hiển thị confirmation
  const confirmed = await this.$confirm(
    `Bạn có muốn download "${node.name}"?`,
    'Xác nhận Download',
    {
      confirmButtonText: 'Download',
      cancelButtonText: 'Hủy',
      type: 'info'
    }
  )

  if (!confirmed) {
    return { valid: false, error: 'User cancelled', cancelled: true }
  }

  // 0.5: Kiểm tra quyền
  const hasPermission = await checkDownloadPermission()
  if (!hasPermission) {
    return { valid: false, error: 'Bạn không có quyền download' }
  }

  return { valid: true, node }
}
```

## Error Handling

| Error | Message | Action |
|-------|---------|--------|
| No node selected | "Vui lòng chọn một node" | Show warning |
| Invalid node type | "Chỉ hỗ trợ Organisation" | Show warning |
| Offline | "Không có kết nối mạng" | Show error |
| User cancelled | - | End gracefully |
| No permission | "Không có quyền" | Show error |

## Dependencies
- UI: Confirmation dialog component
- API: Health check endpoint (optional)
- Store: Permission check

## Previous Stage
- Input: `selectedNodes` từ tree component

## Next Stage
- Output: Validated `node` → Stage 1: Initialize
