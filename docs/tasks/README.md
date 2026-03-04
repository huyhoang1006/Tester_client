# DOWNLOAD ORGANISATION WORKFLOW - TASK FILES (CHAIN ONLY)

## Overview
Tổng hợp các file task chi tiết cho từng stage của luồng Download Organisation.
**Chỉ tải chain (ancestors) từ root đến selected organisation, KHÔNG tải descendants.**

## File List

| # | File | Stage | Mô tả |
|---|------|-------|-------|
| 0 | [STAGE_0_Pre_Download_Checks.md](./STAGE_0_Pre_Download_Checks.md) | Stage 0 | Kiểm tra trước khi download |
| 1 | [STAGE_1_Initialize_Download.md](./STAGE_1_Initialize_Download.md) | Stage 1 | Khởi tạo môi trường |
| 2 | [STAGE_2_Build_Chain.md](./STAGE_2_Build_Chain.md) | Stage 2 | Xây dựng chain (ancestors) |
| 3 | [STAGE_3_Download_Chain.md](./STAGE_3_Download_Chain.md) | Stage 3 | Download chain to local DB |
| 4 | [STAGE_4_Validate_Downloaded_Data.md](./STAGE_4_Validate_Downloaded_Data.md) | Stage 4 | Xác thực dữ liệu |
| 5 | [STAGE_5_Commit_Transaction.md](./STAGE_5_Commit_Transaction.md) | Stage 5 | Commit transaction |
| 6 | [STAGE_6_Refresh_UI.md](./STAGE_6_Refresh_UI.md) | Stage 6 | Refresh UI |

## Flow Overview (CHAIN ONLY)

```
[START]
    │
    ▼
┌─────────────────────────────────────────┐
│ STAGE 0: Pre-Download Checks            │ ← Validate request
└─────────────────────────────────────────┘
    │ (validated node)
    ▼
┌─────────────────────────────────────────┐
│ STAGE 1: Initialize                     │ ← Create context, transaction
└─────────────────────────────────────────┘
    │ (context)
    ▼
┌─────────────────────────────────────────┐
│ STAGE 2: Build Chain                    │ ← Build ancestors only
│ (ROOT → Parent → Selected Org)          │   NO descendants!
└─────────────────────────────────────────┘
    │ (chain)
    ▼
┌─────────────────────────────────────────┐
│ STAGE 3: Download Chain                 │ ← Download to local DB
└─────────────────────────────────────────┘
    │ (chain downloaded)
    ▼
┌─────────────────────────────────────────┐
│ STAGE 4: Validate Data                  │ ← Verify, check FK
└─────────────────────────────────────────┘
    │ (validation result)
    ▼
┌─────────────────────────────────────────┐
│ STAGE 5: Commit Transaction             │ ← Commit/Rollback
└─────────────────────────────────────────┘
    │ (success/fail)
    ▼
┌─────────────────────────────────────────┐
│ STAGE 6: Refresh UI                     │ ← Update tree, show message
└─────────────────────────────────────────┘
    │
    ▼
  [END]
```

## Implementation Priority

### Phase 1: Core Functionality
1. Stage 0 - Pre-download checks
2. Stage 1 - Initialize
3. Stage 2 - Build chain
4. Stage 3 - Download chain
5. Stage 5 - Commit transaction

### Phase 2: Validation & UI
6. Stage 4 - Validate data
7. Stage 6 - Refresh UI

## Progress Tracking

| Stage | Progress Range |
|-------|---------------|
| Stage 0 | 0% → 5% |
| Stage 1 | 5% → 10% |
| Stage 2 | 10% → 30% |
| Stage 3 | 30% → 70% |
| Stage 4 | 70% → 80% |
| Stage 5-6 | 80% → 100% |

## Key Differences: Chain Only vs Full Download

| Aspect | Chain Only (v3.0) | Full Download (v2.0) |
|--------|-------------------|---------------------|
| Stages | 6 stages | 7 stages + 4 sub-stages |
| Descendants | ❌ Không tải | ✅ Tải Sub, VL, Bay, Asset |
| Thời gian | Nhanh hơn | Chậm hơn |
| Dữ liệu | Chỉ organisations | Tất cả entities |
