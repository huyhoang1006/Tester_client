# Stage Diagram: Download Organisation Function

## Tổng quan luồng Download

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              DOWNLOAD ORGANISATION FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  User Action    │
│  (Click Download│
│   Button)       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Stage 1: User Selection & Trigger                                                            │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  TreeToolbar.vue → handleDownloadNode()                                              │   │
│  │  • User selects a node in the tree                                                   │   │
│  │  • Clicks download button                                                            │   │
│  │  • Selected node type: organisation / substation / asset                           │   │
│  └──────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Stage 2: Prepare Download Data                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐   │
│  │  prepareOrganisationDownloadData(node)                                              │   │
│  │                                                                                       │   │
│  │  Step 2.1: Build Organisation Chain (parentArr)                                      │   │
│  │           • Fetch ancestors from parentArr                                           │   │
│  │           • API: getChildOrganisation(ancestorId)                                     │   │
│  │           • API: getOwnerOrganisation() (if root)                                    │   │
│  │                                                                                       │   │
│  │  Step 2.2: Fetch All Descendants                                                     │   │
│  │           • fetchAllDescendants(nodeId, 'organisation')                              │   │
│  │           • Recursive: Org → Substation → VoltageLevel → Bay → Asset                │   │
│  └──────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Stage 3: Recursive Descendant Fetching (fetchAllDescendants)                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐     │
│   │  Organisation                                                                   │     │
│   │  ├──► getChildSubstation(orgId) ──────────────────────────────────────────┐    │     │
│   │                                                                          ▼    │     │
│   │  Substation                                                                  │    │     │
│   │  ├──► getVoltageLevelBySubstationId(subId) ──────────────────────────┐    │    │     │
│   │                                                                      ▼    │    │     │
│   │  VoltageLevel                                                             │    │    │     │
│   │  ├──► getBayByVoltageLevel(vlId) ─────────────────────────────────┐    │    │    │     │
│   │                                                              ▼    │    │    │    │     │
│   │  Bay                                                                 │    │    │    │     │
│   │  ├──► getAssetByOwner(bayId, assetType) ───────────────────┐     │    │    │    │    │
│   │                                                        ▼     │    │    │    │    │    │
│   │  Asset (11 types)                                          │    │    │    │    │    │
│   │  • PowerCable                                               │    │    │    │    │    │
│   │  • Transformer                                              │    │    │    │    │    │
│   │  • CircuitBreaker                                           │    │    │    │    │    │
│   │  • CurrentTransformer                                       │    │    │    │    │    │
│   │  • Disconnector                                             │    │    │    │    │    │
│   │  • SurgeArrester                                             │    │    │    │    │    │
│   │  • VoltageTransformer                                       │    │    │    │    │    │
│   │  • Capacitor                                                 │    │    │    │    │    │
│   │  • Reactor                                                   │    │    │    │    │    │
│   │  • RotatingMachine                                          │    │    │    │    │    │
│   │  • Bushing                                                   │    │    │    │    │    │
│   └──────────────────────────────────────────────────────────────┘    │    │    │    │    │
│                                                                        │    │    │    │    │
│   Returns: Array of all descendants with _type, _serverData, parentId └────┴────┴────┘    │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Stage 4: Download Execution (Correct Order - Dependency Based)                            │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐     │
│   │  CRITICAL: Download must follow dependency order to maintain FK integrity     │     │
│   └─────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                              │
│   ┌─────────────┐     ┌──────────────┐     ┌────────────┐     ┌───────────┐               │
│   │  Chain      │     │  Substation  │     │VoltageLevel│     │    Bay    │  →  Asset    │
│   │  (Orgs)     │ ──► │              │ ──► │            │ ──► │           │ ──►          │
│   └─────────────┘     └──────────────┘     └────────────┘     └───────────┘               │
│                                                                                              │
│   Download Sequence:                                                                        │
│   1. Organisation (chain)          → ROOT → Parent → Selected Org                         │
│   2. Substation                    → Must have Org exist first                            │
│   3. VoltageLevel                  → Must have Substation exist first                    │
│   4. Bay                           → Must have VoltageLevel exist first                   │
│   5. Asset (all 11 types)          → Must have Bay exist first                             │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Stage 5: Data Mapping (3-Layer Transformation)                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────────────────┐    │
│   │  SERVER RESPONSE ──► DTO ──► ENTITY ──► LOCAL DATABASE                          │    │
│   └──────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                              │
│   Layer 1: Server → DTO (Data Transfer Object)                                             │
│   ┌────────────────────────────────────────────────────────────────────────────────┐      │
│   │  mapServerToDto()                                                                  │      │
│   │  • ServerToDTO/Organisation/index.js    → OrgDto                                │      │
│   │  • ServerToDTO/Substation/index.js      → SubstationDto                         │      │
│   │  • ServerToDTO/VoltageLevel/index.js     → VoltageLevelDto                       │      │
│   │  • ServerToDTO/Bay/index.js              → BayDto                                │      │
│   │  • ServerToDTO/PowerCable/index.js      → PowerCableDto                         │      │
│   │  • ServerToDTO/Transformer/index.js     → TransformerDto                        │      │
│   │  • ... (other asset types)                                                       │      │
│   └────────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                              │
│   Layer 2: DTO → Entity (Flatten Structure)                                                │
│   ┌────────────────────────────────────────────────────────────────────────────────┐      │
│   │  OrgDtoToOrgEntity() / mapDtoToEntity()                                          │      │
│   │  • Mapping/Organisation/index.js      → Flatten Organisation Entity            │      │
│   │  • Mapping/Substation/index.js         → Flatten Substation Entity               │      │
│   │  • Mapping/VoltageLevel/index.js       → Flatten VoltageLevel Entity            │      │
│   │  • Mapping/Bay/index.js                → Flatten Bay Entity                     │      │
│   │  • Mapping/PowerCable/index.js         → Flatten PowerCable Entity               │      │
│   │  • ... (other asset types)                                                       │      │
│   └────────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                              │
│   Layer 3: Entity → Local Database (Electron IPC)                                          │
│   ┌────────────────────────────────────────────────────────────────────────────────┐      │
│   │  window.electronAPI.insertXXXEntity(entity)                                       │      │
│   │  • insertParentOrganizationEntity()    → SQLite: parent_organisation          │      │
│   │  • insertSubstationEntity()             → SQLite: substation                    │      │
│   │  • insertVoltageLevelEntity()           → SQLite: voltage_level                 │      │
│   │  • insertBayEntity()                    → SQLite: bay                            │      │
│   │  • insertPowerCableEntity()             → SQLite: power_cable                   │      │
│   │  • insertTransformerEntity()            → SQLite: transformer                   │      │
│   │  • ... (other asset types)                                                       │      │
│   └────────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Stage 6: Save to Local Database (Upsert Logic)                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────────────────┐    │
│   │  For each entity:                                                                 │    │
│   │                                                                                    │    │
│   │  1. Check if exists:  getOrganisationEntityByMrid(mrid)                        │    │
│   │                                                                                    │    │
│   │  2. If exists → DELETE + INSERT (Overwrite)                                      │    │
│   │        deleteParentOrganizationEntity({ mrid })                                 │    │
│   │        insertParentOrganizationEntity(entity)                                    │    │
│   │                                                                                    │    │
│   │  3. If not exists → INSERT                                                        │    │
│   │        insertParentOrganizationEntity(entity)                                    │    │
│   │                                                                                    │    │
│   └──────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                              │
│   Special Handling:                                                                          │
│   ┌──────────────────────────────────────────────────────────────────────────────────┐    │
│   │  • ROOT Organisation: Auto-create if not exists (mrid = 'ROOT')                 │    │
│   │  • Parent Organisation: Verify exists before linking, fallback to ROOT         │    │
│   │  • VoltageLevel: Verify exists before Bay insertion                             │    │
│   │  • Bay: Verify exists before Asset insertion                                     │    │
│   └──────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Stage 7: Refresh Client Tree                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   ┌────────────────────────────────────────────────────────────────────────────────┐      │
│   │  After successful download:                                                      │      │
│   │                                                                                   │      │
│   │  1. Find root node in client tree                                                │      │
│   │  2. Set rootNode._childrenFetched = false                                        │      │
│   │  3. Call fetchChildren(rootNode)                                                 │      │
│   │  4. Set rootNode.expanded = true                                                │      │
│   │                                                                                   │      │
│   │  Result: Client tree refreshes with newly downloaded data                       │      │
│   └────────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Stage 8: Completion & Error Handling                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│   ┌────────────────────────────────────────────────────────────────────────────────┐      │
│   │  Loading States:                                                                 │      │
│   │  • startDownload()        → Set isDownloading flag                              │      │
│   │  • start()               → Show loading progress                                │      │
│   │  • update(customText)    → Update progress message                               │      │
│   │  • stop()                → Hide loading                                         │      │
│   │  • endDownload()         → Clear isDownloading flag                              │      │
│   │                                                                                   │      │
│   └────────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                              │
│   Error Handling:                                                                            │
│   ┌────────────────────────────────────────────────────────────────────────────────┐      │
│   │  • Collect failed assets in array                                                │      │
│   │  • Continue download for other items                                             │      │
│   │  • Report all failures at end                                                    │      │
│   │  • Show warning message with failure count                                       │      │
│   └────────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                              │
│   Success:                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────┐      │
│   │  • $message.success('Download organisation completed!')                       │      │
│   └────────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## API Endpoints Used

| Entity | API Function | Description |
|--------|--------------|-------------|
| Organisation | `getOwnerOrganisation()` | Get root organisation |
| Organisation | `getChildOrganisation(id)` | Get child organisations |
| Substation | `getChildSubstation(orgId)` | Get substations by org |
| VoltageLevel | `getVoltageLevelBySubstationId(subId)` | Get voltage levels |
| Bay | `getBayByVoltageLevel(vlId)` | Get bays by voltage level |
| Asset | `getAssetByOwner(bayId, assetType)` | Get assets by bay (11 types) |
| Asset | `getAssetById(mrid, assetType)` | Get single asset by ID |

## Key Files

| Layer | File Path |
|-------|-----------|
| UI/Dialog | `src/views/TreeNode/dialogs/DownloadDialog.vue` |
| Download Logic | `src/views/TreeNode/Server/mixin/Download/downloadNode.js` |
| Fetch Children | `src/views/TreeNode/Server/mixin/fetchChildrenServer.js` |
| API Layer | `src/api/demo/index.js` |
| Mapping (Server→DTO) | `src/views/Mapping/ServerToDTO/*/` |
| Mapping (DTO→Entity) | `src/views/Mapping/*/` |
| Entity (Flatten) | `src/views/Flatten/*/` |
| IPC Main | `src/ipcmain/entity/*/` |
| Preload | `src/preload/entity/*/` |

## Download Order (Critical)

```
1. Organisation Chain    (ROOT → Parent → Selected)
2. Substation             (depends on Organisation)
3. VoltageLevel          (depends on Substation)
4. Bay                   (depends on VoltageLevel)
5. Asset (all types)     (depends on Bay)
```

This order is CRITICAL because of foreign key constraints in the local SQLite database.
