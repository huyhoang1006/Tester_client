# Pitfalls Research

**Domain:** Tree Node Download/Sync Feature (Electron + Vue 2)
**Researched:** 2026-03-07
**Confidence:** MEDIUM-HIGH

## Critical Pitfalls

### Pitfall 1: Race Condition in Lazy Loading Children

**What goes wrong:**
When user rapidly expands/collapses tree nodes, multiple concurrent fetch requests fire. If responses return out of order, the wrong data gets displayed under the wrong parent node, causing visual corruption or data inconsistency.

**Why it happens:**
- User clicks expand twice quickly → two fetch requests sent
- Network latency varies → Response A (slow) returns after Response B (fast)
- Both responses update the same node's children
- Final state shows data from Response A but children count from Response B
- Existing code at `src/views/TreeNode/Server/mixin/Download/downloadNode.js` has async operations without cancellation tokens

**How to avoid:**
```javascript
// Add abort controller per node
let currentFetchController = null;

async fetchNodeData(nodeId) {
    // Cancel any pending request for this node
    if (currentFetchController) {
        currentFetchController.abort();
    }
    currentFetchController = new AbortController();
    
    try {
        const data = await api.fetchChildren(nodeId, { 
            signal: currentFetchController.signal 
        });
        this.updateNodeChildren(nodeId, data);
    } catch (error) {
        if (error.name !== 'AbortError') {
            throw error;
        }
    }
}
```

**Warning signs:**
- Console shows overlapping fetch logs for same node
- Users report "wrong items under wrong folder"
- Network tab shows multiple pending requests for same endpoint
- Spinners appear briefly then wrong content shows

**Phase to address:** Feature Implementation Phase - Add request cancellation

---

### Pitfall 2: Bulk Insert Without Transaction (UI Freeze)

**What goes wrong:**
Downloading a large voltage level with many child bays/assets freezes the UI for 10+ seconds. The app appears crashed or unresponsive.

**Why it happens:**
- Each insert runs in its own transaction (autocommit mode)
- SQLite defaults to autocommit = true
- 500 asset inserts × ~10ms each = 5 seconds blocking
- Vue reactivity system also freezes during synchronous DB writes
- Existing code calls `insertVoltageLevelEntity` and `insertBayEntity` individually without explicit transactions

**How to avoid:**
```javascript
// Batch within single transaction
async downloadVoltageLevelToDb(voltageLevel, parentId) {
    await runAsync('BEGIN TRANSACTION');
    try {
        // Insert parent
        await runAsync('INSERT INTO voltage_level ...', [voltageLevel]);
        
        // Batch insert children in chunks
        const children = await fetchAllChildren(voltageLevel.id);
        const chunkSize = 50;
        
        for (let i = 0; i < children.length; i += chunkSize) {
            const chunk = children.slice(i, i + chunkSize);
            await batchInsert(chunk);
            // Yield to UI between chunks
            await Vue.nextTick();
        }
        
        await runAsync('COMMIT');
    } catch (error) {
        await runAsync('ROLLBACK');
        throw error;
    }
}
```

**Warning signs:**
- Progress bar stops updating during download
- Electron main process CPU spikes to 100%
- Users report "app hangs when downloading substation"
- Database file grows but UI freezes

**Phase to address:** Database Integration Phase - Implement batched transactions

---

### Pitfall 3: Orphaned Children After Partial Download Failure

**What goes wrong:**
Download fails partway through (e.g., at bay 50 of 100). Retrying downloads duplicates existing data or leaves partial records.

**Why it happens:**
- No idempotency check before insert
- No transaction wrapping entire download
- On retry, duplicate key errors or partial data remains
- Parent voltage level inserted but child bays failed silently

**How to avoid:**
```javascript
// Check existence before insert
async downloadVoltageLevelToDb(voltageLevel, parentId) {
    const existing = await getVoltageLevelByMrid(voltageLevel.mrid);
    if (existing) {
        // Option 1: Skip (idempotent)
        return { success: true, skipped: true };
        // Option 2: Update (sync)
        // Option 3: Fail with clear message
    }
    // Proceed with insert...
}

// Or use INSERT OR IGNORE
await runAsync('INSERT OR IGNORE INTO voltage_level ...');
```

**Warning signs:**
- Console shows "UNIQUE constraint failed" errors after retry
- Duplicate entries appear in tree
- Downloaded voltage level has no children but shows expansion arrow
- Users report "some items missing after failed download"

**Phase to address:** Data Integrity Phase - Add idempotency checks

---

### Pitfall 4: Tree State Desync After Download

**What goes wrong:**
After successful download, the tree doesn't reflect new data. Or expanded nodes collapse unexpectedly.

**Why it happens:**
- Vuex store not updated after DB write completes
- Tree component still showing cached server tree data
- Component re-render blocked by reactive object issues
- `showLocationRoot()` called but tree state not merged properly

**How to avoid:**
```javascript
async downloadVoltageLevelToDb(voltageLevel, parentId) {
    // ... DB operations ...
    
    // Refresh Vuex store
    await this.$store.dispatch('fetchLocationTree');
    
    // Expand to show new node
    this.expandToNode(voltageLevel.mrid);
    
    // Re-fetch children for parent to update view
    await this.fetchChildrenForNode(parentId);
}
```

**Warning signs:**
- Download shows "success" message but tree doesn't change
- New node only appears after manual refresh (F5 or re-login)
- Console shows store mutation but UI doesn't reflect
- Expanded nodes collapse when new sibling added

**Phase to address:** UI Sync Phase - Ensure store + UI synchronization

---

### Pitfall 5: Missing Parent Chain Validation

**What goes wrong:**
User tries to download a voltage level but parent substation isn't downloaded. Download fails with cryptic error or worse - downloads without proper relationship.

**Why it happens:**
- No validation that parent exists in local DB
- Code at line 103-111 checks parent existence but may have edge cases
- User selects voltage level from server tree without downloading parent first
- Foreign key constraint violations or orphaned records

**How to avoid:**
```javascript
async validateDownloadPrerequisites(node) {
    const errors = [];
    
    // Walk up the chain and check each parent
    let current = node;
    while (current.parentId) {
        const parentType = getParentType(current.mode);
        const parentExists = await checkEntityExists(parentType, current.parentId);
        
        if (!parentExists) {
            errors.push(`Parent ${parentType} not downloaded. Download ${current.name}'s parent first.`);
        }
        
        current = await getParentNode(current.parentId);
    }
    
    if (errors.length > 0) {
        throw new ValidationError(errors.join('\n'));
    }
}
```

**Warning signs:**
- "Parent not found" errors during download
- Voltage level appears under wrong parent in tree
- SQL foreign key constraint errors in console
- Users report "I downloaded it but it's not showing"

**Phase to address:** Validation Phase - Add parent chain validation

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip idempotency checks | Faster initial dev | Data duplicates, retry failures | Never - always check before insert |
| Single-row transactions | Simpler code | 10-100x slower for bulk | Only for single-record updates |
| Skip parent validation | Works for simple cases | Orphaned records, FK errors | Never - always validate chain |
| Ignore UI freeze | "Works on my machine" | Users think app crashed | Only for < 10 records |
| No progress indication | Less code | User thinks it's hung | Never - always show progress |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| SQLite | Not using transactions for bulk | Wrap 50-100 row chunks in transaction |
| Vuex | Mutating state outside mutations | Use actions for async + mutations for sync |
| IPC | Not handling errors in main process | Always wrap in try-catch + send error back |
| API | No retry with backoff | Implement exponential backoff (3 retries) |
| Tree UI | Not debouncing expand clicks | 300ms debounce on expand/collapse |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 inserts | 500ms for 50 records | Batch insert | At > 20 child records |
| Deep tree render | 3+ second initial load | Virtual scrolling / lazy render | At > 100 visible nodes |
| No request debounce | Duplicate fetches | Debounce 300ms | When user scrolls/expands rapidly |
| Full reactivity on large trees | UI lag on expand | Use shallowRef for children | At > 500 nodes in memory |
| Sync DB writes on main thread | App freeze | Use worker thread or chunk | For any bulk operation |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Download without auth check | Unauthorized data access | Validate user permissions before fetch |
| Store credentials in localStorage | Credential theft | Use electron-safeStorage or encrypted store |
| No input sanitization on node IDs | SQL injection | Use parameterized queries (already done) |
| Download from untrusted server | Malware injection | Validate response schema before insert |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No progress indicator | User thinks app hung | Show progress bar + current item |
| Silent failures | User doesn't know download failed | Clear error toast with retry option |
| No cancel option | Can't stop long download | Provide cancel button |
| Download in wrong order | Fails with confusing error | Guide user: "Download parent first" |
| Lost selection after refresh | User loses context | Preserve expanded/selected state in localStorage |

---

## "Looks Done But Isn't" Checklist

- [ ] **Download:** Check returns `success: true` but doesn't verify children loaded
- [ ] **Tree refresh:** Calls `showLocationRoot()` but doesn't merge with existing tree
- [ ] **Error handling:** Catches error but doesn't show user-friendly message
- [ ] **Validation:** Checks parent exists but doesn't handle race condition where parent gets deleted
- [ ] **Progress:** Shows "100%" but database transaction not yet committed
- [ ] **Idempotency:** Handle duplicate key errors but don't tell user what happened

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Partial download | MEDIUM | Delete parent, re-download with all children |
| Duplicate entries | LOW | Run cleanup query: `DELETE WHERE mrid IN (SELECT mrid GROUP BY mrid HAVING COUNT > 1)` |
| Orphaned children | MEDIUM | Query for records with missing parent, offer re-download |
| Tree desync | LOW | Force refresh: `store.dispatch('fetchLocationTree')` |
| Frozen UI | HIGH | Need app restart - implement chunked processing to prevent |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Race condition in lazy loading | Feature Implementation | Rapid expand/collapse test |
| Bulk insert freeze | Database Integration | Download 100+ assets, verify UI responsive |
| Orphaned children | Data Integrity | Fail download mid-way, retry, verify no duplicates |
| Tree state desync | UI Sync | Download new item, verify it appears immediately |
| Missing parent validation | Validation Phase | Try downloading child without parent, verify clear error |
| N+1 queries | Database Integration | Check DB queries in DevTools profiler |

---

## Sources

- Vue.js Tree Performance Issues: https://github.com/primefaces/primevue/issues/6196
- Vuetify Treeview Race Conditions: https://github.com/vuetifyjs/vuetify/issues/12269
- SQLite Bulk Insert Optimization: https://stackoverflow.com/questions/1711631/improve-insert-per-second-performance-of-sqlite
- Vue State Management: https://vuejs.org/guide/scaling-up/state-management
- Electron IPC Best Practices: https://bugfender.com/blog/how-to-identify-and-troubleshoot-issues-in-your-electron-app/

---

*Pitfalls research for: AT Project - Voltage Level Download Feature*
*Researched: 2026-03-07*
