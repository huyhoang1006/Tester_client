# Chi tiết luồng Download Organisation - Phân chia theo Phase

Dựa trên phân tích code, dưới đây là **Plan chi tiết** cho chức năng Download Organisation:

---

## **PHASE 1: UI Trigger & Preparation** 
**File:** `src/views/TreeNode/Server/mixin/Download/downloadNode.js`

| Bước | Function | Mô tả |
|------|----------|-------|
| 1.1 | `handleDownloadNode()` | Entry point - kiểm tra node.mode === 'organisation' |
| 1.2 | `downloadOrganisationWithDescendants(node)` | Gọi chính - chuẩn bị data |
| 1.3 | `prepareOrganisationDownloadData(node)` | Xây dựng chain (parentArr) + fetch descendants |
| 1.4 | `fetchAllDescendants(nodeId, 'organisation')` | Đệ quy lấy Substation → VoltageLevel → Bay → Assets |
| 1.5 | Loading state | `$store.dispatch('loading/startDownload')` |

---

## **PHASE 2: Server API Calls**
**File:** `src/api/demo/index.js`

| Bước | API Function | Endpoint |
|------|--------------|----------|
| 2.1 | `getChildOrganisation(organisationId)` | `/organisation/get-child-organisation/{id}` |
| 2.2 | `getOrganisationById(organisationId)` | Lấy chi tiết tổ chức |
| 2.3 | `getChildSubstation(organisationId)` | `/substation/get-by-organisation/{id}` |
| 2.4 | `getVoltageLevelBySubstationId(substationId)` | Lấy voltage level |
| 2.5 | `getBayByVoltageLevel(voltageLevelId)` | Lấy các bay |
| 2.6 | `getAssetByOwner(ownerId, assetType)` | Lấy 11 loại asset |

---

## **PHASE 3: Data Mapping (Server → DTO → Entity)**

| Bước | Mapper File | Chức năng |
|------|------------|-----------|
| 3.1 | `views/Mapping/ServerToDTO/Organisation/index.js` | Server → DTO |
| 3.2 | `views/Mapping/Organisation/index.js` | DTO → Entity |
| 3.3 | `mapOrganisationServerToDto(serverResponse)` | Map các trường |
| 3.4 | `mapOrganisationDtoToEntity(dto)` | Tạo entity object với các sub-entities |

**Entity Structure sau map:**
```javascript
{
  organisation: { mrid, name, parent_organisation, ... },
  streetDetail: { mrid, ... },
  townDetail: { mrid, ... },
  streetAddress: { mrid, street_detail, town_detail, ... },
  electronicAddress: { mrid, ... },
  telephoneNumber: { mrid, ... },
  attachment: { id, path, ... },
  positionPoints: [...],
  configurationEvent: [...]
}
```

---

## **PHASE 4: Preload IPC Bridge**
**File:** `src/preload.js` (aggregated)

| Bước | IPC Channel | Chức năng |
|------|------------|-----------|
| 4.1 | `insertParentOrganizationEntity(entity)` | Insert mới |
| 4.2 | `getOrganisationEntityByMrid(mrid)` | Kiểm tra tồn tại |
| 4.3 | `deleteParentOrganizationEntity(mrid)` | Xóa cũ nếu tồn tại |

---

## **PHASE 5: IPC Main Handler**
**File:** `src/ipcmain/entity/parentOrganization/index.js`

| Bước | Handler | Xử lý |
|------|---------|-------|
| 5.1 | `insertParentOrganizationEntity` | Gọi entityFunc |
| 5.2 | `getOrganisationEntityByMrid` | Query DB |
| 5.3 | `deleteParentOrganizationEntity` | Delete transaction |

---

## **PHASE 6: Business Logic Layer**
**File:** `src/function/entity/parentOrganisation/index.js`

| Bước | Function | Mô tả |
|------|----------|-------|
| 6.1 | `insertOrganisationEntity(entity)` | Entry point |
| 6.2 | Backup files | `backupAllFilesInDir()` nếu có attachment |
| 6.3 | Sync files | `syncFilesWithDeletion()` |
| 6.4 | **BEGIN TRANSACTION** | Bắt đầu transaction |
| 6.5 | Insert streetDetail | `insertStreetDetailTransaction()` |
| 6.6 | Insert townDetail | `insertTownDetailTransaction()` |
| 6.7 | Insert streetAddress | `insertStreetAddressTransaction()` |
| 6.8 | Insert electronicAddress | `insertElectronicAddressTransaction()` |
| 6.9 | Insert telephoneNumber | `insertTelephoneNumberTransaction()` |
| 6.10 | Insert ParentOrganization | `insertParentOrganizationTransaction()` |
| 6.11 | Insert GeoMap | `insertGeoMapArrayTransaction()` |
| 6.12 | Insert Attachment | `uploadAttachmentTransaction()` |
| 6.13 | Insert ConfigurationEvent | `insertConfigurationEventArrayTransaction()` |
| 6.14 | **COMMIT** | Commit transaction |
| 6.15 | Error handling | **ROLLBACK** nếu lỗi |

---

## **PHASE 7: Database Layer**
**SQLite Tables:**

| Table | Mục đích |
|-------|----------|
| `ParentOrganization` | Thông tin tổ chức chính |
| `StreetDetail` | Chi tiết đường |
| `TownDetail` | Chi tiết thành phố/quận |
| `StreetAddress` | Địa chỉ (liên kết streetDetail, townDetail) |
| `ElectronicAddress` | Email, website |
| `TelephoneNumber` | Số điện thoại |
| `Attachment` | File đính kèm |
| `GeoMap` | Tọa độ bản đồ |
| `ConfigurationEvent` | Log thay đổi |

---

## **PHASE 8: Post-Download**
**File:** `src/views/TreeNode/Server/mixin/Download/downloadNode.js`

| Bước | Function | Mô tả |
|------|----------|-------|
| 8.1 | Refresh tree | `$store.dispatch('loading/stop')` |
| 8.2 | Update client tree | `fetchChildren(rootNode)` |
| 8.3 | Error reporting | Hiển thị danh sách lỗi nếu có |

---

## Data Flow Diagram

```
User clicks Download
       ↓
┌─────────────────────────────────────────┐
│  PHASE 1: UI Layer                      │
│  handleDownloadNode()                   │
│  downloadOrganisationWithDescendants() │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│  PHASE 2: API Calls                     │
│  getChildOrganisation()                 │
│  getChildSubstation()                   │
│  getVoltageLevelBySubstationId()        │
│  getBayByVoltageLevel()                 │
│  getAssetByOwner()                      │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│  PHASE 3: Data Mapping                  │
│  Server → DTO → Entity                  │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│  PHASE 4: Preload IPC                   │
│  electronAPI.insertParentOrganization   │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│  PHASE 5: IPC Main Handler              │
│  ipcMain.handle()                       │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│  PHASE 6: Business Logic                │
│  insertOrganisationEntity()              │
│  - BEGIN TRANSACTION                     │
│  - Insert multiple tables                │
│  - COMMIT / ROLLBACK                    │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│  PHASE 7: SQLite Database               │
│  ParentOrganization, StreetDetail,       │
│  TownDetail, StreetAddress, etc.        │
└─────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────┐
│  PHASE 8: Post-Download                  │
│  Refresh tree, show result              │
└─────────────────────────────────────────┘
```

---

## Các Files liên quan

| File | Vai trò |
|------|---------|
| `src/views/TreeNode/Server/mixin/Download/downloadNode.js` | UI Layer - Vue component |
| `src/api/demo/index.js` | API calls đến server |
| `src/views/Mapping/ServerToDTO/Organisation/index.js` | Map server response → DTO |
| `src/views/Mapping/Organisation/index.js` | Map DTO → Entity |
| `src/preload.js` | IPC Bridge (preload) |
| `src/ipcmain/entity/parentOrganization/index.js` | IPC Main handlers |
| `src/function/entity/parentOrganisation/index.js` | Business logic |
| `src/datacontext/index.js` | Database context |
