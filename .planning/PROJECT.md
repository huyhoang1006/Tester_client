# AT Project Phase 2

## What This Is

Desktop application for power grid asset management and testing. Built with Electron + Vue 2, used by power grid technicians to manage assets, run tests, and track results.

## Core Value

Enable technicians to efficiently manage power grid assets and execute standardized tests with reliable result tracking.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Download voltage level nodes from ServerTree to ClientTree with full ancestor chain

### Out of Scope

- Real-time sync between server and client
- Multi-user collaboration
- Cloud backup

## Context

**Tech Stack:**
- Electron 13 + Vue 2 + SQLite (sqlcipher)
- Element UI + AG Grid for data tables
- IPC-based main/renderer communication

**Existing Features:**
- Tree view for ServerTree and ClientTree
- Asset management for various equipment types
- Test definitions and procedures
- Result logging

**New Feature Context:**
- ServerTree displays voltage levels from server
- ClientTree stores local voltage levels
- Need ability to download voltage hierarchy from server to local

## Constraints

- **Tech Stack**: Vue 2, Electron 13 (EOL) — no major refactors
- **Database**: SQLite with sqlcipher encryption
- **Offline**: Must work offline after initial sync

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vue 2 + Element UI | Existing codebase, stability | ⚠️ EOL - consider migration |
| SQLite (sqlcipher) | Encrypted local storage for asset data | ✓ Good |

---

*Last updated: 2025-03-07 after milestone v1.0 started*
