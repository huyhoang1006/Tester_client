# Stack Research

**Domain:** Desktop Application - Tree Node Download Feature (Voltage Level)
**Researched:** 2026-03-07
**Confidence:** HIGH

## Executive Summary

The voltage level download feature from ServerTree to ClientTree is **already implemented** in the existing codebase. The current stack (Electron 13 + Vue 2 + Element UI + SQLite) is fully sufficient - **no new stack additions are required**.

Key finding: The existing `downloadNode.js` mixin handles organisation, substation, and voltage level downloads through a proven pattern of Server → DTO → Entity mapping, IPC communication, and ClientTree refresh.

## Recommended Stack

### Core Technologies (No Changes Needed)

| Technology | Version | Purpose | Why Already Sufficient |
|------------|---------|---------|----------------------|
| Electron | 13.0.0 | Desktop runtime | Already handles IPC and DB access |
| Vue 2 | 2.6.14 | UI framework | Powers all components including trees |
| Element UI | 2.15.8 | Component library | Provides el-tree with all needed features |
| SQLite (sqlcipher) | 5.3.0 | Local database | Stores downloaded voltage levels |
| Vuex | 3.6.2 | State management | Available for tree sync state if needed |
| IPC | — | Main/Renderer bridge | All DB operations use existing handlers |

### Supporting Libraries (No Additions Needed)

| Library | Status | Purpose | When to Use |
|---------|--------|---------|-------------|
| axios | ✅ Already | HTTP client | Already used for server communication |
| uuid | ✅ Already | ID generation | Already used for entity IDs |
| knex | ✅ Already | Query builder | Available in main process |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Additional tree libraries | Element UI el-tree has full feature set | Existing el-tree component |
| Vue 3 migration | Not needed for this feature | Stay on Vue 2 |
| Pinia | Vuex 3.6.2 is sufficient | Vuex (already installed) |
| Additional state management | Component-level state works well | Current approach |
| Redux / MobX | Unnecessary for this use case | Vuex or component state |

## Existing Implementation Summary

### Current Download Architecture

```
ServerTree (Vue Component)
    ↓ select node
downloadNode.js (mixin)
    ↓ map: Server → DTO → Entity
IPC (window.electronAPI)
    ↓
Main Process (ipcmain/entity/voltageLevel)
    ↓
SQLite Database (sqlcipher)
    ↓ refresh
ClientTree (Vue Component)
```

### Key Files Already in Place

| File | Purpose |
|------|---------|
| `src/views/TreeNode/Server/mixin/Download/downloadNode.js` | Main download logic (1400+ lines) |
| `src/views/TreeNode/dialogs/DownloadDialog.vue` | Target selection UI |
| `src/ipcmain/entity/voltageLevel/index.js` | DB insert handler |
| `src/ipcmain/cim/voltageLevel/index.js` | CIM operations |
| `src/views/Mapping/ServerToDTO/VoltageLevel/` | Server→DTO mapping |
| `src/views/Mapping/VoltageLevel/` | DTO→Entity mapping |

## Installation

**No new packages required.** The feature is implemented using existing dependencies.

```bash
# Already installed - no changes needed
npm list element-ui vuex axios uuid
```

## Patterns Used (Already Established)

### Tree Data Flow Pattern

```javascript
// Already implemented in downloadNode.js
async downloadVoltageLevelToDb(voltageLevel, parentSubstationId) {
    // 1. Transform server data
    const serverData = { ...voltageLevel._serverData, mRID: voltageLevel.mrid }
    
    // 2. Map to DTO
    const dto = VoltageLevelServerMapper.mapServerToDto(serverData)
    dto.substationId = parentSubstationId
    
    // 3. Map to Entity
    const entity = VoltageLevelMapper.volDtoToVolEntity(dto)
    
    // 4. Insert via IPC
    await window.electronAPI.insertVoltageLevelEntity(entity)
    
    // 5. Refresh ClientTree
    await this.showLocationRoot()
}
```

### IPC Handler Pattern

```javascript
// Already exists in src/ipcmain/entity/voltageLevel/index.js
ipcMain.handle('insertVoltageLevelEntity', async function (event, data) {
    const rs = await entityFunc.voltageLevelEntityFunc.insertVoltageLevelEntity(data)
    return rs
})
```

## Optional Enhancements (Not Required)

If you want to improve tree sync state management, consider:

| Enhancement | Complexity | When to Add |
|-------------|------------|-------------|
| Vuex module for tree state | Low | If component state becomes complex |
| Lazy loading for large trees | Medium | If performance issues arise |
| Optimistic UI updates | Medium | If refresh is too slow |

## Version Compatibility

| Package | Current Version | Compatible With | Notes |
|---------|-----------------|-----------------|-------|
| Element UI | 2.15.8 | Vue 2.6.14 | ✅ Fully compatible |
| Vuex | 3.6.2 | Vue 2.6.14 | ✅ Fully compatible |
| electron | 13.0.0 | Node.js in Electron | ✅ Already in use |

## Sources

- **Codebase Analysis:** Complete review of existing download implementation
- **Existing IPC Handlers:** `src/ipcmain/entity/voltageLevel/index.js` — verified active
- **Existing Mappers:** `src/views/Mapping/ServerToDTO/VoltageLevel/` — verified functional
- **Element UI Docs:** el-tree component provides all needed tree features (lazy, async, drag-drop)

---

*Stack research for: AT Project - Voltage Level Download Feature*
*Researched: 2026-03-07*
*Confidence: HIGH*
