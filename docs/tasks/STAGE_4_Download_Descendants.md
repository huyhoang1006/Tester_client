# STAGE 4: DOWNLOAD DESCENDANTS

## Mục tiêu
Download tất cả descendants: Substations → VoltageLevels → Bays → Assets

## Chức năng chính
- `downloadDescendants()`
- `downloadSubstations()`
- `downloadVoltageLevels()`
- `downloadBays()`
- `downloadAssets()`

## Tasks

### STAGE 4.1: SUBSTATIONS

- [ ] Update progress: 30% → 45%
- [ ] Lấy `context.descendants.substations`
- [ ] Implement pagination: chunk 100 items/batch
- [ ] For each batch:
  - [ ] Map: Server → DTO → Entity
  - [ ] Verify parent exists in DB
  - [ ] Upsert to SQLite
  - [ ] Update progress
- [ ] Log statistics: X created, Y updated, Z skipped
- [ ] Handle partial failure: log failed items + continue

### STAGE 4.2: VOLTAGE LEVELS

- [ ] Update progress: 45% → 60%
- [ ] Lấy `context.descendants.voltageLevels`
- [ ] Implement pagination: chunk 100 items/batch
- [ ] For each batch:
  - [ ] Map: Server → DTO → Entity
  - [ ] Verify parent Substation exists in DB
  - [ ] Upsert to SQLite
  - [ ] Update progress
- [ ] Log statistics
- [ ] Handle partial failure

### STAGE 4.3: BAYS

- [ ] Update progress: 60% → 75%
- [ ] Lấy `context.descendants.bays`
- [ ] Implement pagination: chunk 100 items/batch
- [ ] For each batch:
  - [ ] Map: Server → DTO → Entity
  - [ ] Verify parent VoltageLevel exists in DB
  - [ ] Upsert to SQLite
  - [ ] Update progress
- [ ] Log statistics
- [ ] Handle partial failure

### STAGE 4.4: ASSETS

- [ ] Update progress: 75% → 90%
- [ ] Lấy `context.descendants.assets`
- [ ] Implement pagination: chunk 100 items/batch
- [ ] For each batch:
  - [ ] Map: Server → DTO → Entity
  - [ ] Verify parent Bay exists in DB
  - [ ] Upsert to SQLite
  - [ ] Update progress
- [ ] Log statistics
- [ ] Handle partial failure

### STAGE 4.5: PARALLEL OPTIMIZATION (Optional)

- [ ] Cho phép chạy 4.1-4.4 song song với Promise.all
- [ ] Cần đảm bảo parents được download trước
- [ ] Cân nhắc trade-off: speed vs error handling

### STAGE 4.6: PARTIAL FAILURE STRATEGY

- [ ] Nếu 1 entity type fail → Tiếp tục với entity types khác
- [ ] Log failed items vào `context.failedItems`
- [ ] Log failed entity type vào `context.stageErrors`
- [ ] Cuối cùng: thông báo user về các items lỗi

## Code Template

```javascript
async function downloadDescendants(context) {
  // STAGE 4.1: SUBSTATIONS
  context = await downloadSubstations(context)

  // STAGE 4.2: VOLTAGE LEVELS
  context = await downloadVoltageLevels(context)

  // STAGE 4.3: BAYS
  context = await downloadBays(context)

  // STAGE 4.4: ASSETS
  context = await downloadAssets(context)

  return context
}

// ============================================
// 4.1: SUBSTATIONS
// ============================================
async function downloadSubstations(context) {
  updateProgress(30, 'substations', 'Đang tải trạm biến áp...')

  const substations = context.descendants.substations || []
  const batchSize = 100
  const batches = chunk(substations, batchSize)

  logInfo(`Bắt đầu download ${substations.length} substations (${batches.length} batches)`)

  for (let i = 0; i < batches.length; i++) {
    if (context.signal.aborted) throw new Error('Cancelled')

    const batch = batches[i]
    const batchResult = await downloadBatch({
      type: 'Substation',
      entities: batch,
      parentType: 'Organisation',
      context
    })

    // Update stats
    context.stats.created += batchResult.created
    context.stats.updated += batchResult.updated
    context.stats.skipped += batchResult.skipped
    context.stats.failed += batchResult.failed

    // Progress: 30% → 45%
    const progress = 30 + (15 * (i + 1) / batches.length)
    updateProgress(progress, 'substations', `Đã tải ${i + 1}/${batches.length} batches`)
  }

  logInfo(`Substations: ${context.stats.created} created, ${context.stats.updated} updated`)

  return context
}

// ============================================
// 4.2: VOLTAGE LEVELS
// ============================================
async function downloadVoltageLevels(context) {
  updateProgress(45, 'voltageLevels', 'Đang tải cấp điện áp...')

  const voltageLevels = context.descendants.voltageLevels || []
  const batchSize = 100
  const batches = chunk(voltageLevels, batchSize)

  for (let i = 0; i < batches.length; i++) {
    if (context.signal.aborted) throw new Error('Cancelled')

    const batch = batches[i]
    const batchResult = await downloadBatch({
      type: 'VoltageLevel',
      entities: batch,
      parentType: 'Substation',
      context
    })

    context.stats.created += batchResult.created
    context.stats.updated += batchResult.updated
    context.stats.skipped += batchResult.skipped
    context.stats.failed += batchResult.failed

    // Progress: 45% → 60%
    const progress = 45 + (15 * (i + 1) / batches.length)
    updateProgress(progress, 'voltageLevels', `Đã tải ${i + 1}/${batches.length} batches`)
  }

  return context
}

// ============================================
// GENERIC BATCH DOWNLOAD
// ============================================
async function downloadBatch({ type, entities, parentType, context }) {
  const result = { created: 0, updated: 0, skipped: 0, failed: 0 }
  const failedItems = []

  for (const entity of entities) {
    try {
      // 1. Fetch from server (nếu cần fresh data)
      const serverData = await fetchWithRetry({
        fn: () => getEntityFromServer(type, entity.mrid),
        maxRetries: 3,
        signal: context.signal
      })

      // 2. Map: Server → DTO → Entity
      const dto = mapper[type].serverToDto(serverData)
      const mappedEntity = mapper[type].dtoToEntity(dto)

      // 3. Verify parent exists
      const parentExists = await db.verifyParent(mappedEntity.parentMrid, parentType)
      if (!parentExists) {
        logWarning(`Parent not found for ${type} ${entity.mrid}, skipping`)
        result.skipped++
        continue
      }

      // 4. Upsert to SQLite
      const existing = await db.getByMrid(type, mappedEntity.mrid)

      if (existing) {
        await db.delete(type, mappedEntity.mrid)
        await db.insert(type, mappedEntity)
        await logHistory('UPDATE', type, mappedEntity, existing)
        result.updated++
      } else {
        await db.insert(type, mappedEntity)
        await logHistory('CREATE', type, mappedEntity, null)
        result.created++
      }

    } catch (error) {
      failedItems.push({ mrid: entity.mrid, error: error.message })
      result.failed++
      logError(`Failed to download ${type} ${entity.mrid}: ${error.message}`)
    }
  }

  // Log failed items
  if (failedItems.length > 0) {
    context.failedItems.push(...failedItems.map(f => ({ type, ...f })))
  }

  return result
}

// ============================================
// 4.3: BAYS & 4.4: ASSETS (tương tự)
// ============================================
async function downloadBays(context) {
  // ... tương tự VoltageLevels
}

async function downloadAssets(context) {
  // ... tương tự VoltageLevels
}
```

## Progress Values
- Start: 30%
- 4.1 Substations: 30% → 45%
- 4.2 VoltageLevels: 45% → 60%
- 4.3 Bays: 60% → 75%
- 4.4 Assets: 75% → 90%
- End: 90%

## Error Handling

| Error | Action |
|-------|--------|
| Network timeout | Retry 3 → Skip batch item → Continue |
| Server error (4xx/5xx) | Skip item → Log → Continue |
| Parent not found | Skip item → Log warning → Continue |
| Duplicate MRID | Ghi đè + log history |
| SQLite error | Rollback → Notify user |

## Dependencies
- API: `getSubstations()`, `getVoltageLevels()`, `getBays()`, `getAssets()`
- Database: Batch insert operations
- Utils: `chunk()`, `fetchWithRetry()`

## Previous Stage
- Input: `context` với chain downloaded từ Stage 3

## Next Stage
- Output: `context` với tất cả descendants đã download → Stage 5: Validate
