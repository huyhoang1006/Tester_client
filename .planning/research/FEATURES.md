# Feature Research

**Domain:** Power Grid Asset Management - Tree Node Download
**Researched:** 2026-03-07
**Confidence:** HIGH

## Executive Summary

The AT Project already implements a comprehensive tree node download feature for hierarchical power grid assets. The existing implementation follows established patterns for downloading nodes with full ancestor chains, consistent with IEC 61850/CIM data models. This research documents the feature landscape for the voltage level download feature.

## Feature Landscape

### Table Stakes (Users Expect These)

These features are essential for the download to function in a power grid context. Users expect them based on industry standards and IEC 61850 data modeling.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Full Ancestor Chain Download** | Power grid hierarchy is strictly hierarchical (Org→Substation→VoltageLevel→Bay→Asset). A voltage level without its parent substation is invalid. | HIGH | Already implemented - downloads organisation chain first, then parent substation, then voltage level |
| **Node Validation** | Must verify parent exists before adding child. Prevents orphaned data in local DB. | MEDIUM | Already implemented - validates parentId exists in server tree |
| **Local DB Upsert** | Re-downloading same node should update, not fail. ON CONFLICT DO UPDATE pattern. | MEDIUM | Already implemented in insert*Entity functions |
| **Client Tree Refresh** | After download, UI must reflect new data. User needs visual confirmation. | LOW | Already implemented - showLocationRoot() and direct tree updates |
| **Error Handling with Messages** | Network/API failures must show clear user feedback. | LOW | Already implemented - $message.success/error throughout |

### Differentiators (Competitive Advantage)

These features go beyond basic download and add value for power grid operations.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Selective Descendant Download** | Allow downloading VoltageLevel + its Bays + Assets in one operation, not just the node itself. | HIGH | Currently downloads ancestors; descendants are fetched lazily |
| **Download Progress Indication** | Large substation downloads (100+ assets) need progress feedback. | MEDIUM | Currently no progress bar - all-or-nothing |
| **Bulk Download Queue** | Power engineers often need to download multiple related nodes (e.g., all VoltageLevels in a Substation). Queue with single commit. | HIGH | Currently one-by-one download |
| **Offline Mode Indicator** | Show sync status between local DB and server. Know what needs updating. | LOW | Not implemented - could show "synced" vs "local only" icons |
| **Selective Field Download** | Only download needed fields for offline work (e.g., just names for browsing, full details for testing). | MEDIUM | Currently downloads all fields from API |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem useful but create problems in this domain.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Auto-download all descendants** | Users want "download this substation and everything below it" | Can be thousands of assets; causes memory issues, long waits, huge local DB. Network interruption = partial state. | Explicit "download subtree" with depth limit, confirm dialog |
| **Real-time sync** | Keep local always up-to-date with server | Power grid networks may be slow/unavailable; conflicts common. Overhead for constant polling. | Manual refresh + optional background sync with conflict resolution |
| **Delete from server after download** | "I've downloaded it, don't need it on server" | Dangerous - data loss risk. Wrong download = lost data. Never auto-delete. | N/A - do not implement |
| **Download children without parent** | "I just want this voltage level" | Invalid in power grid hierarchy - voltage level must belong to substation. Would break referential integrity. | Always require ancestor chain |

## Feature Dependencies

```
[VoltageLevel Download]
    └──requires──> [Organisation Chain Download]
    └──requires──> [Substation Download]
    └──requires──> [Server Tree Lookup]
    └──requires──> [Local DB Entity Insert]

[Selective Descendant Download] ──enhances──> [VoltageLevel Download]
[Bulk Download Queue] ──enhances──> [VoltageLevel Download]
[Download Progress] ──enhances──> [Bulk Download Queue]
```

### Dependency Notes

- **VoltageLevel Download requires Organisation Chain Download:** The existing implementation follows IEC 61850/CIM hierarchy. A VoltageLevel must have a Substation parent, which must have an Organisation parent.
- **VoltageLevel Download requires Substation Download:** The parent substation must exist in local DB before VoltageLevel can be inserted (foreign key constraint).
- **Bulk Download Queue enhances VoltageLevel Download:** Adding queue enables batch operations without UI blocking; requires progress indication to be useful.
- **Selective Descendant Download conflicts with Auto-download all descendants:** Different UX - explicit user choice vs implicit bulk operation.

## MVP Definition

### Launch With (v1)

The existing implementation already covers these core requirements:

- [x] **Full ancestor chain download** — Downloads Organisation → Substation → VoltageLevel in correct order
- [x] **Node validation** — Verifies parent exists in server tree before proceeding
- [x] **Upsert to local DB** — ON CONFLICT DO UPDATE pattern prevents duplicate errors
- [x] **Client tree refresh** — Updates tree UI after successful download
- [x] **Error handling** — Clear success/error messages for each stage

### Add After Validation (v1.x)

Features to add once core is working and user feedback is gathered:

- [ ] **Download progress indication** — Add progress bar for large downloads (substations with 100+ assets)
- [ ] **Download descendants option** — "Include bays and assets" checkbox in download dialog
- [ ] **Offline indicator** — Show sync status in tree (local only, synced, needs update)

### Future Consideration (v2+)

Features to defer until product-market fit is established:

- [ ] **Bulk download queue** — Download multiple nodes with single progress indicator
- [ ] **Selective field download** — Download minimal fields for browsing mode
- [ ] **Background sync service** — Optional periodic sync with conflict detection
- [ ] **Download history** — Track what was downloaded when, support re-download

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Full ancestor chain download | HIGH | HIGH | P1 (existing) |
| Node validation | HIGH | MEDIUM | P1 (existing) |
| Local DB upsert | HIGH | LOW | P1 (existing) |
| Client tree refresh | HIGH | LOW | P1 (existing) |
| Error handling | HIGH | LOW | P1 (existing) |
| Download descendants option | MEDIUM | HIGH | P2 |
| Download progress indication | MEDIUM | MEDIUM | P2 |
| Offline indicator | MEDIUM | LOW | P2 |
| Bulk download queue | LOW | HIGH | P3 |
| Selective field download | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch (already implemented)
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Existing Implementation Analysis

The current download implementation in `src/views/TreeNode/Server/mixin/Download/downloadNode.js` demonstrates:

1. **Stage-based architecture** - Clear separation: Validate → Prepare → Download → Refresh
2. **Ancestor-first pattern** - Always downloads parents before children (Organisation → Substation → VoltageLevel)
3. **Server tree lookup** - Uses `findNodeById()` to locate parents in server tree before download
4. **Lazy client refresh** - Either updates tree directly (if parent exists) or calls full refresh
5. **Comprehensive logging** - Each stage logged for debugging

### Established Patterns

| Pattern | Implementation | How It Works |
|---------|---------------|--------------|
| **Ancestor-first download** | Lines 193-229 in downloadNode.js | Downloads full organisation chain before voltage level |
| **Parent validation** | Lines 177-190 | Checks parentId exists in node data |
| **Upsert pattern** | Lines 609-615 | Uses INSERT with ON CONFLICT DO UPDATE |
| **Tree refresh** | Lines 626-683 | Direct Vue.set() update or full reload |
| **Error propagation** | try/catch with $message | Clear error messages at each failure point |

### Integration Points

- **API calls**: Uses `demoAPI` for server communication (getOrganisationById, getSubstationById, getVoltageLevelBySubstationId)
- **Local DB**: Uses `window.electronAPI.insert*Entity()` for persistence
- **UI State**: Updates `organisationClientList` for tree display
- **Mapping layers**: ServerToDTO mappers → DTO → Entity mappers

## Sources

- Existing codebase analysis: `src/views/TreeNode/Server/mixin/Download/downloadNode.js`
- IEC 61850 data model hierarchy (ResearchGate, 2024)
- CIM (Common Information Model) power grid hierarchy structure
- Power grid asset management domain knowledge

---

*Feature research for: AT Project - Voltage Level Download Feature*
*Researched: 2026-03-07*
