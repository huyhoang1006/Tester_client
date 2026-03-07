# Architecture Research: Tree Node Download Feature

**Domain:** Desktop application feature integration (Electron + Vue 2 + SQLite)
**Researched:** 2026-03-07
**Confidence:** HIGH

## Executive Summary

This architecture document maps how a **tree node download feature** integrates into the existing AT Project (Electron + Vue 2 + SQLite). The project already has established patterns for IPC communication, export functionality, and tree navigation. The download feature should follow the same patterns: IPC handlers in `src/ipcmain/entity/`, preload APIs in `src/preload/entity/`, and context menu integration in the tree views.

---

## Current Architecture Overview

### Existing Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Vue Renderer (UI)                        │
│  src/views/TreeNode/    src/views/Common/TreeNode.vue       │
│  src/views/VoltageLevel/                                        │
├─────────────────────────────────────────────────────────────┤
│                    Preload Bridge (IPC)                      │
│  src/preload.js exposes: window.electronAPI                  │
│  src/preload/entity/voltageLevel/index.js                   │
├─────────────────────────────────────────────────────────────┤
│                    Electron Main Process                      │
│  src/background.js     src/ipcmain/entity/                   │
│  - IPC handlers       - Database access                      │
│  - Dialog API         - File operations                      │
├─────────────────────────────────────────────────────────────┤
│                    SQLite Database                           │
│  database/database.db (sqlcipher)                            │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Location |
|-----------|---------------|----------|
| `background.js` | Main process entry, IPC registration | `src/background.js` |
| `ipcmain/entity/` | IPC handlers for database operations | `src/ipcmain/entity/{entity}/index.js` |
| `preload.js` | ContextBridge API surface | `src/preload.js` |
| `preload/entity/` | Renderer-side IPC invoke wrappers | `src/preload/entity/{entity}/index.js` |
| `TreeNode.vue` | Recursive tree rendering | `src/views/Common/TreeNode.vue` |
| `ServerTree/index.vue` | Server tree panel with context menu | `src/views/TreeNode/Server/ServerTree/index.vue` |
| ContextMenu | Right-click actions | `src/views/Common/ContextMenu.vue` |

---

## Integration Points for Download Feature

### 1. IPC Handler (Main Process)

**Location:** `src/ipcmain/entity/voltageLevel/index.js` (extend existing)

The voltageLevel entity already has IPC handlers. Add a download handler:

```javascript
// NEW: Add to src/ipcmain/entity/voltageLevel/index.js
export const downloadVoltageLevel = () => {
    ipcMain.handle('downloadVoltageLevel', async function (event, mrid) {
        try {
            // 1. Fetch voltage level data from DB
            const data = await entityFunc.voltageLevelEntityFunc.getVoltageLevelEntity(mrid)
            
            // 2. Show save dialog (reuse dialog from export/index.js)
            const { dialog } = require('electron')
            const result = await dialog.showSaveDialog({
                title: 'Save Voltage Level',
                defaultPath: `voltage-level-${mrid}.json`,
                filters: [{ name: 'JSON Files', extensions: ['json'] }]
            })
            
            if (result.canceled) {
                return { success: false, message: 'Download cancelled' }
            }
            
            // 3. Write file
            const fs = require('fs')
            await fs.promises.writeFile(result.filePath, JSON.stringify(data, null, 2))
            
            return { success: true, filePath: result.filePath }
        } catch (err) {
            return { success: false, message: err.message }
        }
    })
}
```

**Register in `src/ipcmain/entity/index.js`:**
```javascript
import * as ipcVoltageLevel from './voltageLevel/index.js'
// ... inside active():
ipcVoltageLevel.downloadVoltageLevel()  // ADD THIS
```

### 2. Preload API (Renderer Bridge)

**Location:** `src/preload/entity/voltageLevel/index.js` (extend existing)

```javascript
// ADD to existing export
export const voltageLevelEntityPreload = () => {
    return {
        // ... existing methods
        downloadVoltageLevel: (mrid) => ipcRenderer.invoke('downloadVoltageLevel', mrid)
    }
}
```

### 3. Preload Aggregation

**Location:** `src/preload.js`

Add to aggregation (existing pattern):
```javascript
const voltageLevelEntityAPI = entityPreload.voltageLevelPreload.voltageLevelEntityPreload()
// ... in Object.assign:
voltageLevelEntityAPI,  // ALREADY EXISTS - just ensure download is exposed
```

### 4. Context Menu Integration

**Location:** `src/views/TreeNode/Server/ServerTree/index.vue`

The ServerTree already has context menu with export actions. Add download:

```vue
<!-- ADD new event handler -->
<contextMenu ref="contextMenu" 
    @show-data="$emit('show-data', $event)"
    @export-json="$emit('export-json', $event)"
    @download-voltage-level="$emit('download-voltage-level', $event)"
    <!-- existing handlers -->
>
</contextMenu>
```

### 5. Context Menu Definition

**Location:** `src/views/Common/ContextMenu.vue`

Add the menu item alongside existing export options:

```vue
<el-menu-item @click="handleCommand('download-voltage-level')">
    <i class="el-icon-download"></i>
    <span>Download Voltage Level</span>
</el-menu-item>
```

---

## New Components Required

| Component | Type | Purpose | Location |
|-----------|------|---------|----------|
| Download handler | IPC Handler | Fetch + save voltage level data | Extend `src/ipcmain/entity/voltageLevel/index.js` |
| Download API | Preload wrapper | Expose to renderer | Extend `src/preload/entity/voltageLevel/index.js` |
| Download emit | Vue emit | Trigger from tree context | `src/views/TreeNode/Server/ServerTree/index.vue` |
| Download handler | Vue method | Handle context menu action | Parent of ServerTree |

---

## Data Flow

### Download Flow

```
[User Right-Click on Voltage Level Node]
    │
    ▼
[TreeNode.vue] ──emits──→ [openContextMenu event]
    │
    ▼
[ContextMenu.vue] ──click──→ [handleCommand('download-voltage-level')]
    │
    ▼
[ServerTree/index.vue] ──$emit──→ [download-voltage-level event]
    │
    ▼
[Parent Component] ──calls──→ [window.electronAPI.downloadVoltageLevel(mrid)]
    │
    ▼
[Preload Bridge] ──invokes──→ [ipcRenderer.invoke('downloadVoltageLevel', mrid)]
    │
    ▼
[Main Process: ipcmain] ──fetches from DB──→ [SQLite]
    │
    ▼
[Main Process] ──shows──→ [dialog.showSaveDialog]
    │
    ▼
[Main Process] ──writes──→ [fs.promises.writeFile]
    │
    ▼
[Response returns to renderer with file path]
```

### State Management

No Vuex changes needed — download is a fire-and-forget action with dialog feedback. If progress tracking is needed later, add to existing Vuex store.

---

## Existing Patterns to Reuse

### 1. Export Pattern (JSON Export)

**Location:** `src/ipcmain/entity/export/index.js`

- Uses `dialog.showSaveDialog` for file location
- Uses `fs.promises.writeFile` for file writing
- Returns `{ success, filePath, message }` response

**Recommendation:** Copy this pattern for voltage level download.

### 2. Attachment Download Pattern

**Location:** `src/ipcmain/entity/attachment/index.js`

- `downloadFile` function shows directory picker
- Uses `shell.openPath` or direct file copy via `fileFunc.downloadFile`

**Use case:** If download should support multiple formats (not just JSON), extend this pattern.

### 3. Tree Node Fetch Pattern

**Location:** `src/views/Common/TreeNode.vue`

- Emits `fetch-children` to load node data on expand
- Uses `node.mode` to distinguish node types (`voltageLevel`, `bay`, `asset`, etc.)

**Use case:** For hierarchical download (voltage level + all children), follow this fetch pattern.

---

## Build Order (Considering Dependencies)

### Phase 1: Backend (IPC Handler)
1. Add download handler to `src/ipcmain/entity/voltageLevel/index.js`
2. Register in `src/ipcmain/entity/index.js`
3. Test with DevTools console: `ipcRenderer.invoke('downloadVoltageLevel', 'test-mrid')`

**Rationale:** No UI dependencies. Can be tested independently.

### Phase 2: Preload Bridge
1. Add download method to `src/preload/entity/voltageLevel/index.js`
2. Verify aggregation in `src/preload.js`

**Rationale:** Simple wrapper. Depends on IPC handler existing.

### Phase 3: UI Integration
1. Add menu item to `src/views/Common/ContextMenu.vue`
2. Add emit handler to `src/views/TreeNode/Server/ServerTree/index.vue`
3. Wire parent component to call preload API

**Rationale:** UI depends on backend + preload being ready.

### Phase 4: Testing & Polish
1. Test full flow from right-click to file saved
2. Handle error states (cancel, file write failure)
3. Add progress indicator if needed

---

## Anti-Patterns to Avoid

### 1. Direct File System Access from Renderer

**What people do:** Try to write files directly from Vue component using Node.js fs module.

**Why it's wrong:** Renderer process doesn't have Node.js access in production. Violates Electron security model.

**Do this instead:** Always go through IPC to main process.

### 2. Blocking Dialogs

**What people do:** Use synchronous `dialog.showSaveDialogSync`.

**Why it's wrong:** Blocks entire Electron UI thread.

**Do this instead:** Use async `dialog.showSaveDialog` (already used in export pattern).

### 3. Hardcoding File Paths

**What people do:** Hardcode download directory like `C:/Downloads/`.

**Why it's wrong:** Cross-platform issues, permission issues, doesn't respect user preference.

**Do this instead:** Always use `dialog.showSaveDialog` to let user choose location.

### 4. Not Handling Cancel

**What people do:** Assume user always selects a file, don't handle cancellation.

**Why it's wrong:** User cancels dialog often. Without handling, shows confusing errors.

**Do this instead:** Check `result.canceled` and return early with friendly message.

---

## Scalability Considerations

| Scale | Architecture Adjustments |
|-------|------------------------|
| 0-100 users | Single IPC handler, no optimization needed |
| 100-10k users | Consider streaming large exports, add progress events |
| 10k+ users | Consider Web Workers for data serialization |

### Scaling Priorities

1. **First bottleneck:** Large voltage level hierarchy (many child nodes)
   - **Fix:** Add progress reporting via IPC events, use streaming JSON write

2. **Second bottleneck:** Concurrent
   - **Fix:** Queue downloads or show " downloadsbusy" state in UI

---

## Sources

- **Existing export pattern:** `src/ipcmain/entity/export/index.js` (lines 80-113)
- **Existing attachment download:** `src/ipcmain/entity/attachment/index.js` (lines 46-69)
- **Preload aggregation:** `src/preload.js` (lines 93-160)
- **Tree component:** `src/views/Common/TreeNode.vue` (lines 1-100)
- **Server tree with context menu:** `src/views/TreeNode/Server/ServerTree/index.vue` (lines 21-29)

---

*Architecture research for: AT Project Phase 2 - Tree Node Download Feature*
*Researched: 2026-03-07*
