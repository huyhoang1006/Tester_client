# External Integrations

**Analysis Date:** 2026-03-07

## APIs & External Services

**Version Management:**
- GitLab Self-Hosted - Application version checking
  - Host: `103.163.118.212:30151`
  - API: `/api/v4/projects/test2Ftester%er-ied%2FTester_client/releases`
  - Fallback: GitLab Tags API
  - Token: Configured via `app-config.json` or hardcoded (see `src/update/VersionService.js`)
  - Purpose: Check for app updates on startup

**OAuth 2.0 Authentication:**
- External OAuth server (configurable via SERVER_ADDR)
  - Endpoint: `{SERVER_ADDR}/oauth/token`
  - Grant types: password, refresh_token
  - Client credentials: `tester-client:tester-client`
  - Token storage: localStorage
  - Implementation: `src/utils/client.js`, `src/api/user.js`

**Backend API:**
- REST API client (axios-based)
  - Base URL: Configurable via localStorage `SERVER_ADDR`
  - Prefix: `api/v1`
  - Resources: users, monitoring, entities
  - Implementation: `src/utils/client.js` with interceptors

## Data Storage

**Database:**
- SQLite with SQLCipher encryption
  - Type: `@journeyapps/sqlcipher` (SQLCipher variant)
  - Location: `database/database.db`
  - Backup: `database/database-full.db`, `database/database-backup.db`
  - Client: Direct sqlite3 module in Electron main process
  - Schema: PRAGMA foreign_keys=ON
  - Access: From main process only (via IPC)

**File Storage:**
- Local filesystem (attachments, uploads)
  - Path: `attachment/` directory
  - Handled via: `src/ipcmain/uploadCustom/index.js`
  - Document types: DOCX files supported

**Caching:**
- None detected (no Redis, Memcached, or in-memory caching)

## Authentication & Identity

**Auth Provider:**
- Custom OAuth 2.0 implementation
  - Approach: Bearer token + refresh token
  - Token refresh: Automatic via axios interceptor
  - Token storage: localStorage (token, refresh_token)
  - Session management: Server address stored in localStorage

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Bugsnag, TrackJS)

**Logs:**
- Console logging (console.log, console.error)
- Electron main process: `src/background.js`
- Python importer output: Via stdout readline
- No structured logging framework

## CI/CD & Deployment

**Hosting:**
- Not applicable (desktop application)

**CI Pipeline:**
- Not detected (no GitHub Actions, GitLab CI, Jenkins)

**Auto-Update:**
- GitLab-based version checking
  - Fetches releases/tags from self-hosted GitLab
  - Compares semantic versions using `semver` library
  - Creates in-app notification on available update
  - Implementation: `src/update/VersionService.js`

## Environment Configuration

**Required env vars:**
- Not applicable (uses localStorage for frontend config)

**Secrets location:**
- OAuth credentials: Hardcoded in source (`src/api/user.js`)
  - CLIENT_ID: `tester-client`
  - CLIENT_SECRET: `tester-client`
- GitLab token: In source or `app-config.json`

**Stored in localStorage:**
- `SERVER_ADDR` - Backend server URL
- `token` - OAuth access token
- `refresh_token` - OAuth refresh token

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Special Integrations

**Python Importer:**
- Binary: `extra_binaries/importer/importer_mac/importer` (macOS)
- Communication: stdin/stdout via child_process spawn
- Protocol: JSON messages with request ID correlation
- Purpose: Data import/processing
- Implementation: `src/background.js` lines 32-81

---

*Integration audit: 2026-03-07*
