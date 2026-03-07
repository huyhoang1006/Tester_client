# Requirements: AT Project Phase 2

**Defined:** 2025-03-07
**Core Value:** Enable technicians to efficiently manage power grid assets and execute standardized tests with reliable result tracking.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Download Voltage Level

- [x] **DVL-01**: User can download a voltage level node from ServerTree to ClientTree
- [x] **DVL-02**: Download includes full ancestor chain (Organisation → Substation → VoltageLevel)
- [x] **DVL-03**: If node exists in ClientTree, overwrite with server data
- [x] **DVL-04**: User can trigger download via toolbar button
- [x] **DVL-05**: Download shows success/error message after completion
- [x] **DVL-06**: ClientTree refreshes to show downloaded nodes after completion

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Download Enhancements

- **DVL-07**: Download progress indication for large downloads
- **DVL-08**: Option to include descendant nodes (bays/assets) with voltage level
- **DVL-09**: Bulk download queue for multiple nodes
- **DVL-10**: Offline sync status indicator

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time sync | Network reliability issues in power grid environments |
| Auto-download all descendants | Can cause memory issues with large substations |
| Delete from server after download | Data safety - prevent accidental loss |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DVL-01 | Phase 1 | Complete |
| DVL-02 | Phase 1 | Complete |
| DVL-03 | Phase 1 | Complete |
| DVL-04 | Phase 1 | Complete |
| DVL-05 | Phase 1 | Complete |
| DVL-06 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 6 total
- Mapped to phases: 6
- Unmapped: 0 ✓

---
*Requirements defined: 2025-03-07*
*Last updated: 2025-03-07 - Roadmap created*
