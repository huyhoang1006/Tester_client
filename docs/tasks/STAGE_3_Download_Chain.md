# STAGE 3: DOWNLOAD CHAIN TO LOCAL DB

## Mục tiêu
Download tất cả organisations trong chain từ root đến selected organisation vào local DB

## Chức năng chính
- `downloadOrganisationChain()`
- `downloadSingleOrganisation()`

## Tasks

### Task 3.1: Loop through chain
- [ ] Lấy danh sách `chain` từ Stage 2
- [ ] Thứ tự: ROOT → Parent_1 → ... → Selected Org
- [ ] Log bắt đầu download chain

### Task 3.2: Map each entity
- [ ] Map: Server Data → DTO
- [ ] Map: DTO → Entity
- [ ] Validate required fields

### Task 3.3: Verify parent exists
- [ ] Với mỗi entity (trừ ROOT):
  - [ ] Kiểm tra parent trong local DB
  - [ ] Nếu parent không tồn tại:
    - **Option A**: Auto-download parent (đệ quy)
    - **Option B**: Skip + Log warning

### Task 3.4: Upsert to SQLite
- [ ] Kiểm tra entity đã tồn tại trong DB chưa
- [ ] Nếu đã tồn tại:
  - [ ] Delete old record
  - [ ] Log: "Updated organisation: {name}"
  - [ ] Tăng `context.stats.updated`
- [ ] Nếu chưa tồn tại:
  - [ ] Insert new record
  - [ ] Log: "Created organisation: {name}"
  - [ ] Tăng `context.stats.created`

### Task 3.5: Update Progress
- [ ] Cập nhật progress: 30% → 70%
- [ ] Emit progress event
- [ ] Log: "Đã download {x}/{y} organisations"

## Code Template

```javascript
async function downloadOrganisationChain(chain, context) {
  // Update progress
  updateProgress(30, 'downloading_chain', 'Đang tải tổ chức...')
  logInfo(`Bắt đầu download chain: ${chain.length} organisations`)

  for (let i = 0; i < chain.length; i++) {
    // Kiểm tra cancellation
    if (context.signal.aborted) {
      throw new Error('User cancelled')
    }

    const node = chain[i]
    const isRoot = (i === 0)

    logInfo(`Downloading chain node ${i + 1}/${chain.length}: ${node.mrid}`)

    try {
      await downloadSingleOrganisation(node, context, isRoot)
    } catch (error) {
      logError(`Lỗi khi download ${node.mrid}: ${error.message}`)
      context.stageErrors[`chain_${i}`] = error.message

      // Decision: Continue or Rollback
      const shouldContinue = await handleChainError(error, node, context)
      if (!shouldContinue) {
        throw error
      }
    }

    // Progress: 30% → 70%
    const progress = 30 + (40 * (i + 1) / chain.length)
    updateProgress(progress, 'downloading_chain', `Đã tải ${i + 1}/${chain.length}`)
  }

  // Update progress
  updateProgress(70, 'chain_complete', 'Hoàn tất tải chain')

  return context
}

async function downloadSingleOrganisation(node, context, isRoot) {
  // Task 3.2: Map dữ liệu
  const serverData = node._serverData

  if (!serverData) {
    throw new Error(`Không có data cho ${node.mrid}`)
  }

  // Map: Server → DTO → Entity
  const dto = organisationServerMapper.mapToDto(serverData)
  const entity = organisationDtoMapper.mapToEntity(dto)

  // Task 3.3: Verify Parent Exists (trừ root)
  if (!isRoot && node.parentId) {
    const parentExists = await db.verifyParent(node.parentId)
    if (!parentExists) {
      logWarning(`Parent ${node.parentId} không tồn tại, thử download parent trước`)

      // Auto-download parent
      const parentData = await api.getOrganisationById(node.parentId)
      await downloadSingleOrganisation({ ...parentData, parentId: '' }, context, false)
    }
  }

  // Task 3.4: Upsert to SQLite
  const existing = await db.getOrganisationByMrid(entity.mrid)

  if (existing) {
    // Update
    await db.delete(entity.mrid)
    await db.insertOrganisation(entity)
    context.stats.updated++

    // Log history
    await logHistory('UPDATE', 'Organisation', entity, existing)
    logInfo(`Updated organisation: ${entity.name}`)
  } else {
    // Insert
    await db.insertOrganisation(entity)
    context.stats.created++

    await logHistory('CREATE', 'Organisation', entity, null)
    logInfo(`Created organisation: ${entity.name}`)
  }

  return entity
}
```

## Progress Values
- Start: 30%
- End: 70%

## Error Handling

| Error | Action |
|-------|--------|
| Network timeout | Retry 3 lần → Skip + Log → Continue |
| Server 404 | Mark as deleted in local DB |
| Server 500 | Rollback + Notify |
| Parent not found | Auto-download parent hoặc skip |
| Duplicate MRID | Ghi đè + log history |
| SQLite error | Rollback + Notify |

## Dependencies
- API: `getOrganisationById()`
- Mappers: `organisationServerMapper`, `organisationDtoMapper`
- Database: `db.getOrganisationByMrid()`, `db.insertOrganisation()`

## Previous Stage
- Input: `chain` array từ Stage 2

## Next Stage
- Output: `context` với chain đã download → Stage 4: Validate
