# State Diagram: Upload Node to Server

## Flow: Select Node → Upload to Server → Attach to Parent

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           UPLOAD NODE TO SERVER FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │   START      │
    │  User selects│
    │  node in    │
    │  Client Tree │
    └──────┬───────┘
           │
           ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │                         STATE 1: VALIDATE                            │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ • Kiểm tra node đã được chọn                                    │  │
    │  │ • Kiểm tra node có parent hợp lệ                                │  │
    │  │ • Kiểm tra node type (Organisation/Substation/VoltageLevel/    │  │
    │  │   Bay/Asset types)                                            │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    └──────┬────────────────────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────┐      ┌──────────────────┐
    │   VALID?     │──────│     YES          │
    └──────┬───────┘      └──────────────────┘
           │ NO
           ▼
    ┌─────────────────────────────────────┐
    │         STATE 1.1: ERROR             │
    │  • Hiển thị thông báo lỗi            │
    │  • Kết thúc flow                     │
    └─────────────────────────────────────┘


           │
           ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │                         STATE 2: PREPARE DATA                        │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ • Lấy entity data từ local SQLite                              │  │
    │  │ • Map entity → DTO theo server format                           │  │
    │  │ • Xác định parentNode để lấy parentId                          │  │
    │  │                                                                │  │
    │  │  PARENT MAPPING:                                               │  │
    │  │  ┌─────────────────┬──────────────────────────────┐             │  │
    │  │  │ Node Type      │ Parent ID Field              │             │  │
    │  │  ├─────────────────┼──────────────────────────────┤             │  │
    │  │  │ Organisation    │ parent_organisation          │             │  │
    │  │  │ Substation     │ parentSubstationMRID        │             │  │
    │  │  │ VoltageLevel   │ parentVoltageLevelMRID      │             │  │
    │  │  │ Bay            │ parentBayMRID               │             │  │
    │  │  │ Transformer    │ PSR (PowerSystemResource)   │             │  │
    │  │  │ Breaker        │ PSR (PowerSystemResource)   │             │  │
    │  │  │ ...            │ ...                         │             │  │
    │  │  └─────────────────┴──────────────────────────────┘             │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    └──────┬────────────────────────────────────────────────────────────────┘
           │
           ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │                         STATE 3: GET PARENT ID                      │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │  Case 1: Parent is Organisation                                  │  │
    │  │    • parentNode.mrid → parent_organisation                     │  │
    │  │                                                                  │  │
    │  │  Case 2: Parent is Substation                                    │  │
    │  │    • Tìm parent trong Server Tree hoặc lookup                  │  │
    │  │    • Lấy parentNode.serverId hoặc parentNode.mrid               │  │
    │  │                                                                  │  │
    │  │  Case 3: Parent is VoltageLevel                                  │  │
    │  │    • parentNode.mrid → voltageLevelMRID                         │  │
    │  │                                                                  │  │
    │  │  Case 4: Parent is Bay                                          │  │
    │  │    • parentNode.mrid → bayMRID                                  │  │
    │  │                                                                  │  │
    │  │  Case 5: Asset under Substation/Bay                             │  │
    │  │    • Asset cần PSR (PowerSystemResource) ID của parent          │  │
    │  │    • Gán: dto.psrId = parentNode.mrid                          │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    └──────┬────────────────────────────────────────────────────────────────┘
           │
           ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │                         STATE 4: API CALL                            │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │  POST to Server API with parentId                               │  │
    │  │                                                                  │  │
    │  │  API ENDPOINTS (từ api-docs.json):                              │  │
    │  │  ┌──────────────────────────────┬─────────────────────────────┐ │  │
    │  │  │ Entity Type                 │ API Endpoint                │ │  │
    │  │  ├──────────────────────────────┼─────────────────────────────┤ │  │
    │  │  │ Organisation                 │ POST /organisation/create   │ │  │
    │  │  │ Substation                  │ POST /substation/create    │ │  │
    │  │  │ VoltageLevel                │ POST /voltage-level/create │ │  │
    │  │  │ Bay                         │ POST /bay/create          │ │  │
    │  │  │ Transformer                 │ POST /transformer/create   │ │  │
    │  │  │ CircuitBreaker              │ POST /circuit-breaker/... │ │  │
    │  │  │ CurrentTransformer         │ POST /current-transformer/ │ │  │
    │  │  │ VoltageTransformer         │ POST /voltage-transformer/ │ │  │
    │  │  │ PowerCable                 │ POST /power-cable/create  │ │  │
    │  │  │ SurgeArrester              │ POST /surge-arrester/... │ │  │
    │  │  │ Disconnector               │ POST /disconnector/...   │ │  │
    │  │  │ ...                        │ ...                      │ │  │
    │  │  └──────────────────────────────┴─────────────────────────────┘ │  │
    │  │                                                                  │  │
    │  │  REQUEST BODY (ví dụ - Organisation):                          │  │
    │  │  {                                                              │  │
    │  │    "name": "Org Name",                                         │  │
    │  │    "parentOrganisation": 20   ←── PARENT ID QUAN TRỌNG!       │  │
    │  │    ...                                                          │  │
    │  │  }                                                              │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    └──────┬────────────────────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────────┐      ┌──────────────────┐
    │   API SUCCESS?   │──────│     YES          │
    └────────┬─────────┘      └──────────────────┘
             │ NO
             ▼
    ┌─────────────────────────────────────┐
    │         STATE 4.1: API ERROR         │
    │  • Hiển thị error message           │
    │  • Kết thúc flow                    │
    └─────────────────────────────────────┘


           │
           ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │                         STATE 5: SUCCESS                             │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ • Nhận response từ server (serverId/mrid mới)                   │  │
    │  │ • Update local entity với server ID                             │  │
    │  │ • Sync local DB nếu cần                                         │  │
    │  │ • Refresh tree view                                            │  │
    │  │ • Hiển thị success message                                      │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    └──────┬────────────────────────────────────────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │     END      │
    └──────────────┘
```

---

## Key Points for Parent ID Attachment

### 1. **Xác định Parent Node**
```javascript
// Trong quá trình upload, cần xác định parent:
// - Từ selected node trong tree
// - Hoặc từ dialog chọn parent

const parentNode = this.selectedParentNode || this.findParentInTree(selectedNode)
const parentId = parentNode.mrid  // hoặc server-side ID
```

### 2. **Mapping theo Entity Type**
```javascript
const parentIdMap = {
  'organisation': { field: 'parent_organisation', value: parentNode.mrid },
  'substation':   { field: 'parentOrganisationMRID', value: parentNode.mrid },
  'voltageLevel': { field: 'parentVoltageLevelMRID', value: parentNode.mrid },
  'bay':          { field: 'parentBayMRID', value: parentNode.mrid },
  // Assets: gán vào PSR của parent
  'transformer':  { field: 'psrId', value: parentNode.mrid },
  'breaker':      { field: 'psrId', value: parentNode.mrid },
}
```

### 3. **API Call với Parent ID**
```javascript
// Ví dụ: Tạo Organisation với parent
await axios.post('/organisation/create', {
  name: entity.name,
  parent_organisation: parentId,  // ← QUAN TRỌNG
  // ... các trường khác
})
```

---

## Validation Rules

| Node Type | Allowed Parent | Parent ID Field |
|-----------|---------------|-----------------|
| Organisation | Organisation | `parent_organisation` |
| Substation | Organisation | `parentOrganisationMRID` |
| VoltageLevel | Substation | `parentSubstationMRID` |
| Bay | VoltageLevel | `parentVoltageLevelMRID` |
| Transformer | Bay, Substation | `psrId` (PowerSystemResource) |
| Breaker | Bay, Substation | `psrId` |
| CurrentTransformer | Bay, VoltageLevel | `psrId` |
| VoltageTransformer | Bay, VoltageLevel | `psrId` |
| Disconnector | Bay, VoltageLevel | `psrId` |
| PowerCable | Bay, VoltageLevel | `psrId` |
| SurgeArrester | Bay, VoltageLevel | `psrId` |

---

## Error Handling

1. **Parent not found**: Báo lỗi và yêu cầu chọn parent
2. **Invalid parent type**: Kiểm tra quan hệ hợp lệ
3. **API error**: Hiển thị message từ server
4. **Duplicate mrid**: Reset mrid và thử lại (nếu clone)
