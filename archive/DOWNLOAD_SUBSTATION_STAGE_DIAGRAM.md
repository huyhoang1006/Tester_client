# Download Substation Stage Machine Diagram

## Overview

Tài liệu này mô tả Stage Machine Diagram cho chức năng Download Substation từ Server Tree về Client Tree.

---

## 1. Current State

| Chức năng | Status | Ghi chú |
|------------|--------|---------|
| Organisation Download | ✅ Đã implement | Hoàn chỉnh |
| Substation Download | ❌ Chưa implement | Placeholder only |
| Asset Download | ✅ Đã implement | PowerCable |

---

## 2. So sánh Organisation vs Substation

| Khía cạnh | Organisation | Substation |
|-----------|-------------|------------|
| **API Endpoint** | `/api/organisation/cim/{id}` | `/api/substation/cim/{id}` hoặc `getSubstationByMrid` |
| **Parent Reference** | `parent_organisation` | `organisation_id` |
| **ServerToDTO Mapper** | ✅ `ServerToDTO/Organisation` | ✅ `ServerToDTO/Substation` |
| **DTO→Entity Mapper** | ✅ `Mapping/Organisation` | ✅ `Mapping/Substation` |
| **Entity** | ✅ `Flatten/Organisation` | ✅ `Flatten/Substation` |
| **IPC Handler** | ✅ `parentOrganization` | ✅ `substation` |

---

## 3. Stage Machine Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DOWNLOAD SUBSTATION FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  STAGE 1     │
│  START       │
│  User click  │
│  Download    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STAGE 1.1: Validate Selected Node                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │ if node.mode !== 'substation' → return error                           │  │
│  │ if !node.mrid → return error                                          │  │
│  │ if !node.parentId → return error (need parent organisation)           │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
└──────┬───────────────────────────────────────────────────────────────────────┘
       │ Valid
       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STAGE 2: Prepare Substation Download Data                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │ STAGE 2.1: Verify Parent Organisation                                  │  │
│  │   - Get parentId from node.parentId                                    │  │
│  │   - Call: getOrganisationEntityByMrid(parentId)                      │  │
│  │   - If parent NOT exists in Client DB →                               │  │
│  │       → Download parent Organisation first                             │  │
│  │   - If parent exists → Continue                                      │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │ STAGE 2.2: Get Full Substation Details from API                       │  │
│  │   - Call: demoAPI.getSubstationById(node.mrid)                        │  │
│  │   - API returns: { name, mRID, organisation_id, location, ... }      │  │
│  │   - Transform to standard format                                      │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
└──────┬───────────────────────────────────────────────────────────────────────┘
       │ Chain + Data prepared
       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STAGE 3: Download Substation to DB                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │ STAGE 3.1: Import Mappers                                             │  │
│  │   - Import: ServerToDTO/Substation/index.js                          │  │
│  │   - Import: Mapping/Substation/index.js (DTO → Entity)               │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │ STAGE 3.2: Map Server → DTO                                           │  │
│  │   - serverData = {                                                    │  │
│  │       name: "Substation Name",                                        │  │
│  │       mRID: "substation-id",                                          │  │
│  │       organisation_id: "parent-org-id",                               │  │
│  │       location: { ... },                                              │  │
│  │       ...                                                              │  │
│  │   }                                                                   │  │
│  │   - dto = mapServerToDto(serverData)                                  │  │
│  │   - dto.organisationId = parentOrg.mrid                              │  │
│  │   - dto.subsId = serverData.mRID                                     │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │ STAGE 3.3: Map DTO → Entity                                           │  │
│  │   - entity = SubstationDtoToEntity(dto)                               │  │
│  │   - entity.substation.organisation_id = parent org mrid              │  │
│  │   - entity.substation.mrid = dto.subsId                              │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │ STAGE 3.4: Check if Substation exists in DB                           │  │
│  │   - Call: getSubstationEntityByMrid(mrid, user_id, org_id)           │  │
│  │   - If exists → Delete → Insert (Upsert)                             │  │
│  │   - If not exists → Insert new                                       │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │ STAGE 3.5: Insert/Update in DB                                        │  │
│  │   - Call: insertSubstationEntity(entity)                              │  │
│  │   - Transaction handling with rollback                                │  │
│  │   - Insert Location, StreetAddress, TownDetail, etc.                 │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
└──────┬───────────────────────────────────────────────────────────────────────┘
       │ Success
       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STAGE 4: Refresh Client Tree                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │ - Call: fetchChildren(parentNode)                                      │  │
│  │ - Expand parent node                                                  │  │
│  │ - Show success message: "Substation downloaded successfully!"         │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
└──────┬───────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│    END       │
│  SUCCESS     │
└──────────────┘
```

---

## 4. Chi tiết từng Stage

### STAGE 1: START
- **Input**: User chọn node trong Server Tree
- **Validate**:
  - `node.mode === 'substation'`
  - `node.mrid` exists
  - `node.parentId` exists (cần parent Organisation)

### STAGE 2: PREPARE DATA

#### STAGE 2.1: Verify Parent Organisation
```javascript
// Pseudo-code
const parentId = node.parentId
const parentExists = await window.electronAPI.getOrganisationEntityByMrid(parentId)

if (!parentExists.success) {
    // Prompt user to download parent first
    // Or auto-download parent organisation
}
```

#### STAGE 2.2: Get Full Substation Details
```javascript
// Call API to get full details
const response = await demoAPI.getSubstationById(node.mrid)
// Response: { name, mRID, organisation_id, location, voltageLevels, ... }
```

### STAGE 3: DOWNLOAD TO DB

#### STAGE 3.1: Import Mappers
```javascript
const SubstationServerMapper = require('@/views/Mapping/ServerToDTO/Substation/index.js')
const SubstationMapper = require('@/views/Mapping/Substation/index.js')
```

#### STAGE 3.2: Map Server → DTO
```javascript
const serverData = {
    name: substation.name,
    mRID: substation.mRID,
    organisation_id: substation.organisation_id,
    location: substation.location,
    // ...
}

const dto = SubstationServerMapper.mapServerToDto(serverData)
dto.organisationId = parentOrg.mrid  // Set parent relationship
```

#### STAGE 3.3: Map DTO → Entity
```javascript
const entity = SubstationMapper.SubstationDtoToEntity(dto)
entity.substation.organisation_id = parentOrg.mrid
entity.substation.mrid = dto.subsId
```

#### STAGE 3.4: Check Existence
```javascript
const existing = await window.electronAPI.getSubstationEntityByMrid(
    dto.subsId, 
    userId, 
    dto.organisationId
)

if (existing.success) {
    // Delete and re-insert (upsert)
    await window.electronAPI.deleteSubstationEntity(existing.data)
}
```

#### STAGE 3.5: Insert to DB
```javascript
const result = await window.electronAPI.insertSubstationEntity(entity)
```

### STAGE 4: REFRESH
```javascript
// Refresh parent node to show new substation
const parentNode = findNodeById(parentId, organisationClientList)
fetchChildren(parentNode)
expand(parentNode)
```

---

## 5. Error Handling

| Stage | Error | Handling |
|-------|-------|----------|
| STAGE 1 | Invalid node mode | Show warning "Please select a substation node" |
| STAGE 2.1 | Parent org not exists | Prompt to download parent first |
| STAGE 2.2 | API call failed | Show error, stop process |
| STAGE 3.4 | Entity check failed | Log warning, continue with insert |
| STAGE 3.5 | Insert failed | Rollback transaction, show error |

---

## 6. Các file cần tạo/sửa đổi

### Files cần Sửa

| File | Action | Mô tả |
|------|--------|-------|
| `src/views/TreeNode/Server/mixin/Download/downloadNode.js` | **Sửa** | Thêm logic xử lý substation mode (lines 60-63) |

### Files cần Kiểm tra/Tạo mới

| File | Action | Mô tả |
|------|--------|-------|
| `src/api/demo/index.js` | **Kiểm tra** | Thêm `getSubstationById(mrid)` nếu chưa có |
| `src/views/Mapping/Substation/index.js` | **Kiểm tra** | Đảm bảo map đúng `organisation_id` |
| `src/views/Dto/Substation/index.js` | **Kiểm tra** | Đảm bảo có `organisationId` field |

### Existing Resources

| Resource | Location | Status |
|----------|----------|--------|
| ServerToDTO Mapper | `src/views/Mapping/ServerToDTO/Substation/index.js` | ✅ Có sẵn |
| DTO→Entity Mapper | `src/views/Mapping/Substation/index.js` | ✅ Có sẵn |
| Substation Entity | `src/views/Flatten/Substation/index.js` | ✅ Có sẵn |
| IPC Handler | `src/ipcmain/entity/substation/index.js` | ✅ Có sẵn |
| API Client | `src/api/demo/index.js` | Cần thêm method |

---

## 7. API Endpoints

### Organisation (đã có)
```
GET /api/organisation/cim/{id}
  Response: { name, aliasName, organisation: {...}, ... }

GET /api/organisation/get-child-organisation/{id}
  Response: [{ name, mRID, ... }]
```

### Substation (cần tạo/thêm)
```
GET /api/substation/cim/{id}        ← Cần tạo mới
  Response: { 
    name: "Trạm 110kV ABC",
    mRID: "sub-123",
    organisation_id: "org-456",
    location: { mRID, name, mainAddress: {...}, ... },
    voltageLevels: [...],
    ...
  }

GET /api/substation/get-by-organisation/{id}  ← Đã có
  Response: [{ name, mRID, ... }]
```

---

## 8. Console Log Checkpoints

Khi implement, thêm các checkpoint sau để debug:

```
[STAGE 1] handleDownloadNode - START
[STAGE 1] Selected node: {mrid, name, mode, parentId}
[STAGE 1] Node mode: substation

[STAGE 2.1] Verifying parent organisation...
[STAGE 2.1] Parent org exists: true/false

[STAGE 2.2] Fetching substation from API...
[STAGE 2.2] API response: {...}

[STAGE 3.1] Importing mappers...
[STAGE 3.2] Mapping server to DTO...
[STAGE 3.3] Mapping DTO to Entity...
[STAGE 3.4] Checking if entity exists in DB...
[STAGE 3.5] Inserting to DB...

[STAGE 4] Refreshing client tree...
[STAGE 4] SUCCESS - Substation downloaded
```

---

## 9. Related Documents

- [Download Organisation Stage Diagram](./DOWNLOAD_ORGANISATION_STAGE_DIAGRAM.md) - Tài liệu organisation download đã có
- [API Documentation](./API.md) - Tài liệu API endpoints

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-05 | - | Initial draft |
