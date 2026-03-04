================================================================================
STAGE DIAGRAM: DOWNLOAD ORGANISATION WORKFLOW (CHAIN ONLY - VERSION 3.0)
================================================================================
Version: 3.0
Last Updated: 2026-03-03
Description: Chỉ tải ancestors (chain) từ root đến selected organisation
================================================================================

                                    [START]
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 0: PRE-DOWNLOAD CHECKS                                                │
│ validateDownloadRequest()                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Kiểm tra user đã chọn node chưa                                           │
│ • Kiểm tra node.type === 'organisation'                                     │
│ • Kiểm tra network available                                                │
│ • Hiển thị confirmation dialog                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                            ┌──────────┴──────────┐
                            │ Validation passed?   │
                            └──────────┬──────────┘
                                  YES  │  NO
                            ┌──────────┴──────────┐
                            ▼                     ▼
                       [CONTINUE]            [SHOW ERROR + END]
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: INITIALIZE DOWNLOAD                                                 │
│ initializeDownload()                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Tạo CancellationToken (hỗ trợ user hủy)                                  │
│ • Bắt đầu SQLite Transaction                                                │
│ • Khởi tạo ProgressEmitter (0%)                                             │
│ • Ghi log: "Bắt đầu download organisation..."                              │
│ • Set timeout cho toàn bộ operation (default: 5 phút)                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: BUILD CHAIN (ANCESTORS)                                            │
│ buildAncestors()                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  2.1: Get parentArr from node                                                │
│       • Lấy mảng parentArr từ tree node                                    │
│                                                                             │
│  2.2: Process each ancestor                                                 │
│       • ROOT → Parent_1 → ... → Selected Org                                │
│       • Fetch data từ API nếu chưa có _serverData                          │
│                                                                             │
│  2.3: Add selected organisation                                            │
│       • Thêm selected org vào cuối chain                                    │
│                                                                             │
│                              [Progress: 10% → 30%]                          │
│                                                                             │
│ ⚠️ XỬ LÝ LỖI:                                                               │
│ • Network timeout → Retry (max 3 lần)                                       │
│ • Server 404/500 → Skip + Log warning                                      │
│ • Missing fields → Use default values                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 3: DOWNLOAD CHAIN TO LOCAL DB                                         │
│ downloadOrganisationChain()                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Thứ tự download:  ROOT ──► Parent_1 ──► ... ──► Selected Org            │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ For each node in chain:                                              │  │
│  │   1. Map: Server → DTO → Entity                                     │  │
│  │   2. Verify parent exists in local DB (trừ root)                   │  │
│  │   3. Nếu đã tồn tại → Delete old + Insert new                      │  │
│  │   4. Nếu chưa có → Insert new                                      │  │
│  │   5. Ghi log thành công                                             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│                              [Progress: 30% → 70%]                          │
│                                                                             │
│ ⚠️ XỬ LÝ LỖI:                                                               │
│ • Parent not found → Auto-download parent trước                            │
│ • Duplicate MRID → Ghi đè + log history                                    │
│ • SQLite error → Rollback + Thông báo                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 4: VALIDATE DOWNLOADED DATA                                           │
│ validateDownloadedData()                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Kiểm tra số lượng entities đã download                                    │
│ • Verify referential integrity (FK constraints)                             │
│ • Log statistics: X created, Y updated, Z skipped                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 5: COMMIT TRANSACTION                                                 │
│ commitTransaction()                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Commit SQLite transaction                                                 │
│ • Ghi log: "Download hoàn thành thành công"                                │
│ • Clear failed items queue                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                              ┌────────┴────────┐
                              │ Commit success?  │
                              └────────┬────────┘
                                  YES  │  NO
                            ┌──────────┴──────────┐
                            ▼                     ▼
                       [CONTINUE]            [ROLLBACK + END]
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 6: REFRESH UI                                                        │
│ refreshClientTree()                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Fetch children cho parent node                                           │
│ • Update tree data (chỉ refresh affected nodes)                            │
│ • Expand newly downloaded nodes                                            │
│ • Highlight newly downloaded entities                                      │
│                              [Progress: 100%]                               │
│ • Hiển thị success message với statistics                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
                                   [END]

================================================================================
                              ERROR HANDLING
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│                        ERROR HANDLING STRATEGY                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [BẤT KỲ STAGE NÀO BỊ LỖI]                                                  │
│           │                                                                  │
│           ▼                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     KIỂM TRA LOẠI LỖI                                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│           │                                                                  │
│     ┌─────┴─────┬──────────────┬──────────────┬──────────────┐              │
│     │           │              │              │              │              │
│     ▼           ▼              ▼              ▼              ▼              │
│ ┌───────┐ ┌─────────┐   ┌──────────┐  ┌───────────┐  ┌───────────┐          │
│ │Network│ │ Server  │   │  Parent  │  │ SQLite    │  │   User    │          │
│ │Timeout│ │ 404/500 │   │ Not Found│  │  Error    │  │ Cancelled │          │
│ └───┬───┘ └───┬───┘   └──────┬────┘  └─────┬─────┘  └─────┬─────┘          │
│     │         │              │             │             │                  │
│     ▼         ▼              ▼             ▼             ▼                  │
│ ┌───────┐ ┌─────────┐   ┌──────────┐  ┌───────────┐  ┌───────────┐        │
│ │Retry 3│ │ Skip +  │   │ Auto-    │  │ Rollback  │  │ Rollback  │        │
│ │times  │ │ Log     │   │ download │  │ + Error   │  │ + Clean   │        │
│ │1s2s4s │ │ Warning │   │ parent   │  │ message   │  │ up        │        │
│ │       │ │         │   │ first    │  │           │  │           │        │
│ └───────┘ └─────────┘   └──────────┘  └───────────┘  └───────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                            PROGRESS TRACKING
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│  Progress Bar Integration                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Stage 0: Pre-download checks    ████░░░░░░░░░░░░░░░░  5%                  │
│  Stage 1: Initialize              ██████░░░░░░░░░░░░░░░  10%                 │
│  Stage 2: Build chain             ██████████████░░░░░░░░░  30%                 │
│  Stage 3: Download chain          ████████████████████░░░  70%                 │
│  Stage 4: Validate                █████████████████████░░  80%                 │
│  Stage 5-6: Commit & Refresh     ███████████████████████  100%                │
│                                                                             │
│  User Messages:                                                              │
│  - "Đang kiểm tra..." (Stage 0)                                            │
│  - "Đang khởi tạo..." (Stage 1)                                           │
│  - "Đang xây dựng cây tổ chức..." (Stage 2)                               │
│  - "Đang tải tổ chức..." (Stage 3)                                         │
│  - "Đang hoàn tất..." (Stage 4-6)                                          │
│                                                                             │
│  Error Messages:                                                            │
│  - "Mất kết nối mạng. Đang thử lại... (lần 1/3)"                          │
│  - "Server bảo trì. Vui lòng thử lại sau."                                 │
│  - "Lỗi ghi dữ liệu. Đang khôi phục..."                                    │
│  - "Bạn đã hủy download. Đang dọn dẹp..."                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                          DEPENDENCY ORDER
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│                         Chain Dependency                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ROOT ──► Parent_1 ──► Parent_2 ──► ... ──► Selected Org                │
│                                                                             │
│    INSERT ORDER (để tránh FK violation):                                   │
│    ────────────────────────────────────                                     │
│    1. ROOT                                                                   │
│    2. Parent_1                                                              │
│    3. Parent_2                                                              │
│    ...                                                                      │
│    N. Selected Org                                                         │
│                                                                             │
│    ⚠️ CHỈ TẢI CHAIN, KHÔNG TẢI DESCENDANTS                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                        EACH DOWNLOAD FUNCTION
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│  Standard Download Function Pattern                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  async function downloadChainEntity(entity) {                               │
│                                                                             │
│    // 1. WITH RETRY + TIMEOUT                                               │
│    const data = await fetchWithRetry({                                     │
│      fn: () => api.getOrganisationById(entity.mrid),                      │
│      maxRetries: 3,                                                         │
│      timeout: 30000,                                                        │
│      signal: cancellationToken                                             │
│    })                                                                       │
│                                                                             │
│    // 2. VALIDATE                                                           │
│    if (!data) {                                                             │
│      logWarning(`No data for ${entity.mrid}`)                              │
│      return { skipped: true }                                              │
│    }                                                                        │
│                                                                             │
│    // 3. MAP: Server → DTO → Entity                                        │
│    const dto = serverMapper.mapToDto(data)                                 │
│    const mappedEntity = dtoMapper.mapToEntity(dto)                         │
│                                                                             │
│    // 4. VERIFY PARENT EXISTS (trừ ROOT)                                   │
│    if (entity.parentId) {                                                  │
│      const parentExists = await db.verifyParent(entity.parentId)           │
│      if (!parentExists) {                                                   │
│        await downloadChainEntity({ mrid: entity.parentId })                │
│      }                                                                      │
│    }                                                                        │
│                                                                             │
│    // 5. UPSERT: Delete old + Insert new                                   │
│    const existing = await db.getByMrid(entity.mrid)                        │
│    if (existing) {                                                          │
│      await db.delete(entity.mrid)                                           │
│      logHistory('UPDATE', entity)                                           │
│    }                                                                        │
│    await db.insert(mappedEntity)                                            │
│                                                                             │
│    // 6. EMIT PROGRESS                                                      │
│    emitProgress(currentProgress + itemProgress)                            │
│                                                                             │
│    return { success: true }                                                │
│  }                                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                          IMPLEMENTATION CHECKLIST
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│  Code Implementation Tasks                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  □ STAGE 0: Pre-download validation                                         │
│     □ Check selected node exists                                            │
│     □ Check network connectivity                                            │
│     □ Show confirmation dialog                                               │
│                                                                             │
│  □ STAGE 1: Initialize                                                      │
│     □ Create CancellationToken                                               │
│     □ Begin SQLite transaction                                              │
│     □ Initialize progress emitter                                           │
│     □ Set global timeout                                                    │
│                                                                             │
│  □ STAGE 2: Build Chain                                                     │
│     □ Get parentArr from node                                               │
│     □ Process each ancestor in order                                       │
│     □ Add selected org to chain                                            │
│                                                                             │
│  □ STAGE 3: Download Chain                                                 │
│     □ Loop through chain                                                    │
│     □ Map to entity                                                         │
│     □ Verify parent exists                                                  │
│     □ Insert/Update to DB                                                  │
│                                                                             │
│  □ STAGE 4: Validate                                                        │
│     □ Count verification                                                    │
│     □ FK integrity check                                                   │
│     □ Statistics logging                                                    │
│                                                                             │
│  □ STAGE 5: Commit                                                          │
│     □ SQLite commit                                                         │
│     □ Error handling for commit failure                                     │
│                                                                             │
│  □ STAGE 6: Refresh UI                                                      │
│     □ Fetch children                                                        │
│     □ Update tree view                                                     │
│     □ Show success message                                                  │
│                                                                             │
│  □ ERROR HANDLING                                                           │
│     □ Implement fetchWithRetry()                                           │
│     □ Implement rollback()                                                 │
│     □ Handle all error scenarios                                           │
│     □ User cancellation support                                              │
│                                                                             │
│  □ PROGRESS TRACKING                                                        │
│     □ Emit progress events                                                  │
│     □ Update progress bar                                                   │
│     □ Show stage messages                                                   │
│                                                                             │
│  □ TESTING                                                                  │
│     □ Unit tests cho từng stage                                            │
│     □ Integration tests                                                     │
│     □ Error scenario tests                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                          SỰ KHÁC BIỆT VỚI VERSION 2.0
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│  VERSION 2.0 (Cũ) vs VERSION 3.0 (Mới)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  VERSION 2.0:                                                               │
│  ─────────────                                                              │
│  • Stage 2: Build chain + Fetch descendants (Sub, VL, Bay, Asset)        │
│  • Stage 3: Download chain                                                 │
│  • Stage 4: Download descendants (4.1-4.4)                                │
│  • Stage 5: Validate                                                        │
│  • Stage 6: Commit                                                         │
│  • Stage 7: Refresh UI                                                     │
│  • Total: 7 stages + 4 sub-stages                                          │
│                                                                             │
│  VERSION 3.0 (HIỆN TẠI):                                                   │
│  ─────────────────────                                                      │
│  • Stage 2: Build chain only (NO descendants)                              │
│  • Stage 3: Download chain                                                 │
│  • Stage 4: Validate                                                        │
│  • Stage 5: Commit                                                         │
│  • Stage 6: Refresh UI                                                     │
│  • Total: 6 stages (đơn giản hơn)                                          │
│                                                                             │
│  LÝ DO THAY ĐỔI:                                                           │
│  ───────────────                                                            │
│  • User muốn chỉ tải ancestors, không tải descendants                     │
│  • Giảm thời gian download                                                 │
│  • Giảm tải cho server và local DB                                         │
│  • Phù hợp với use case: "tải cây tổ chức" thay vì "tải toàn bộ"         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
