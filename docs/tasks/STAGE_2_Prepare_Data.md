# STAGE 2: PREPARE DATA

## Mục tiêu
Chuẩn bị dữ liệu cần thiết trước khi download: xây dựng chain (ancestors) và lấy danh sách descendants

## Chức năng chính
- `prepareOrganisationDownloadData()`
- `buildAncestors()`
- `fetchDescendants()`

## Tasks

### Task 2.1: Build Chain (Ancestors)
- [ ] Xác định root organisation
- [ ] Truy vết ngược từ selected node lên root
- [ ] Tạo mảng `ancestors` theo thứ tự: [root, parent1, parent2, ..., selected]
- [ ] Log số lượng ancestors tìm thấy

### Task 2.2: Fetch Descendants - Substations
- [ ] Gọi API lấy danh sách Substations của organisation
- [ ] Sử dụng `fetchWithRetry()` với CancellationToken
- [ ] Validate dữ liệu trả về
- [ ] Lưu vào `context.descendants.substations`
- [ ] Log số lượng substations

### Task 2.3: Fetch Descendants - VoltageLevels
- [ ] Gọi API lấy danh sách VoltageLevels
- [ ] Có thể parallel với Substations
- [ ] Validate dữ liệu
- [ ] Lưu vào `context.descendants.voltageLevels`

### Task 2.4: Fetch Descendants - Bays
- [ ] Gọi API lấy danh sách Bays
- [ ] Validate dữ liệu
- [ ] Lưu vào `context.descendants.bays`

### Task 2.5: Fetch Descendants - Assets
- [ ] Gọi API lấy danh sách Assets
- [ ] Validate dữ liệu
- [ ] Lưu vào `context.descendants.assets`

### Task 2.6: Optimize - Parallel Fetch (Optional)
- [ ] Sử dụng `Promise.all()` để fetch Substations, VoltageLevels, Bays song song
- [ ] Chỉ áp dụng nếu không có dependencies
- [ ] Đánh dấu nếu dùng parallel

### Task 2.7: Validate Required Data
- [ ] Kiểm tra dữ liệu không bị missing fields nghiêm trọng
- [ ] Log warnings cho các optional fields missing
- [ ] Quyết định có tiếp tục hay rollback

## Code Template

```javascript
async function prepareOrganisationDownloadData(node, context) {
  // Update progress
  updateProgress(10, 'preparing', 'Đang chuẩn bị dữ liệu...')

  // ============================================
  // Task 2.1: Build Chain (Ancestors)
  // ============================================
  context.ancestors = await buildAncestors(node)
  logInfo(`Tìm thấy ${context.ancestors.length} ancestors`)

  // ============================================
  // Task 2.2-2.5: Fetch Descendants
  // ============================================
  // Parallel fetch option (Task 2.6)
  const fetchOptions = { signal: context.signal }

  // Sequential fetch (đảm bảo thứ tự)
  const [substations, voltageLevels, bays, assets] = await Promise.all([
    // Task 2.2: Substations
    fetchWithRetry({
      fn: () => api.getSubstations(node.mrid),
      maxRetries: 3,
      timeout: 60000,
      ...fetchOptions
    }),

    // Task 2.3: VoltageLevels
    fetchWithRetry({
      fn: () => api.getVoltageLevels(node.mrid),
      maxRetries: 3,
      timeout: 60000,
      ...fetchOptions
    }),

    // Task 2.4: Bays
    fetchWithRetry({
      fn: () => api.getBays(node.mrid),
      maxRetries: 3,
      timeout: 60000,
      ...fetchOptions
    }),

    // Task 2.5: Assets
    fetchWithRetry({
      fn: () => api.getAssets(node.mrid),
      maxRetries: 3,
      timeout: 60000,
      ...fetchOptions
    })
  ])

  // Validate and store
  context.descendants = {
    substations: validateArray(substations, 'substations'),
    voltageLevels: validateArray(voltageLevels, 'voltageLevels'),
    bays: validateArray(bays, 'bays'),
    assets: validateArray(assets, 'assets')
  }

  // Task 2.7: Validate
  const hasValidData = validateRequiredData(context.descendants)
  if (!hasValidData) {
    throw new Error('Dữ liệu không hợp lệ, không thể tiếp tục')
  }

  // Log statistics
  logInfo(`Descendants: ${context.descendants.substations.length} Substations, `
    + `${context.descendants.voltageLevels.length} VoltageLevels, `
    + `${context.descendants.bays.length} Bays, `
    + `${context.descendants.assets.length} Assets`)

  return context
}

// Task 2.1: Build Ancestors
async function buildAncestors(node) {
  const ancestors = []
  let currentNode = node

  while (currentNode) {
    ancestors.unshift(currentNode) // Add to beginning

    if (currentNode.parentId) {
      // Fetch parent từ server hoặc local cache
      currentNode = await api.getOrganisationById(currentNode.parentId)
    } else {
      break // Đã đến root
    }
  }

  return ancestors
}
```

## Progress Values
- Start: 10%
- End: 15%

## Error Handling

| Error | Action |
|-------|--------|
| Network timeout | Retry (max 3) → Rollback if fail |
| Server 404/500 | Rollback + Notify user |
| Missing fields | Skip + Log warning + Continue |
| User cancelled | Rollback + End |

## Dependencies
- API: `getOrganisationById()`, `getSubstations()`, `getVoltageLevels()`, `getBays()`, `getAssets()`
- Utils: `fetchWithRetry()`, `validateArray()`

## Previous Stage
- Input: `DownloadContext` từ Stage 1

## Next Stage
- Output: `context` với `ancestors` và `descendants` → Stage 3: Download Chain
