# Codebase Concerns

**Analysis Date:** 2026-03-07

## Tech Debt

### Database Hardcoded Credentials
- **Issue:** Database encryption key and password are hardcoded directly in source code
- **Files:** `src/function/datacontext/index.js` (lines 9, 12)
- **Impact:** Any person with access to the source code can decrypt the database. Passwords exposed in `attester` string literals
- **Fix approach:** Store credentials in environment variables or secure config storage

### Extensive Console Logging
- **Issue:** 1053+ console.log/console.error statements throughout codebase
- **Files:** Scattered across Vue components, IPC handlers, mixins, and utils
- **Impact:** Performance degradation in production, potential information leakage through browser devtools
- **Fix approach:** Replace with structured logging library (winston, electron-log), add log level filtering

### Disabled Web Security
- **Issue:** `webSecurity: false` is set in Electron browser window configuration
- **Files:** `src/background.js` (line 110)
- **Impact:** Application vulnerable to cross-origin attacks, content injection
- **Fix approach:** Enable webSecurity, properly configure CSP headers

### Node Integration Enabled
- **Issue:** `nodeIntegration: true` in Electron webPreferences
- **Files:** `src/background.js` (line 106)
- **Impact:** Renderer process has full Node.js access, increased attack surface
- **Fix approach:** Use contextIsolation: true and preload scripts for secure IPC

### Incomplete Feature Implementation
- **Issue:** JSON import from CIM is marked as TODO
- **Files:** `src/views/TreeNode/Common/Import/import.js` (line 32)
- **Impact:** Feature not functional, blocks certain import workflows
- **Fix approach:** Implement the CIM JSON import logic

### Version Manager Incomplete
- **Issue:** Download logic and release notes loading marked as TODO
- **Files:** `src/components/VersionManager/index.vue` (lines 171, 191)
- **Impact:** Version update feature incomplete
- **Fix approach:** Implement actual GitLab release download and release notes fetching

## Known Bugs

### Attachment Delete Query Returns Wrong Result
- **Issue:** Delete operation uses `db.all()` instead of `db.run()` for DELETE statements
- **Files:** `src/background.js` (line 199)
- **Trigger:** Deleting attachments may not work correctly
- **Workaround:** None identified - DELETE queries should use `db.run()`

### Console Log Not Removed in Production
- **Issue:** ESLint only warns about console in production but doesn't prevent builds
- **Files:** `.eslintrc.js` (line 14)
- **Trigger:** Application deployed with debug logging active
- **Workaround:** Build passes but logs may expose sensitive information

## Security Considerations

### Database Credentials Exposed
- **Risk:** Hardcoded SQLCipher password 'attester' in source
- **Files:** `src/function/datacontext/index.js`
- **Current mitigation:** None - credentials visible in source
- **Recommendations:** Move to secure environment variable storage

### Electron Security Misconfiguration
- **Risk:** Combined nodeIntegration + webSecurity disabled creates vulnerable configuration
- **Files:** `src/background.js` (lines 106, 110)
- **Current mitigation:** None
- **Recommendations:** 
  - Set `nodeIntegration: false`
  - Set `contextIsolation: true`
  - Set `webSecurity: true`
  - Use preload scripts with contextBridge for IPC

### Potential SQL Injection (Low Risk)
- **Risk:** PRAGMA statement uses string interpolation
- **Files:** `src/function/datacontext/index.js` (line 48)
- **Current mitigation:** DB_PASSWORD is hardcoded (not from user input)
- **Recommendations:** Use parameterized queries for all dynamic values

## Performance Bottlenecks

### Large Vue Component Tree
- **Problem:** Application loads 100+ Vue components on startup
- **Files:** `src/views/` directory contains numerous components
- **Cause:** Monolithic component loading, no lazy loading configured
- **Improvement path:** Implement route-based code splitting with Vue dynamic imports

### Heavy Console Logging in Loops
- **Problem:** Some download operations log extensively in loops
- **Files:** `src/views/TreeNode/Server/mixin/Download/downloadNode.js` (500+ console.log calls)
- **Cause:** Debug logging left in production code
- **Improvement path:** Remove or conditionally compile debug logs

### No Query Optimization
- **Problem:** Database queries may lack proper indexing hints
- **Files:** `src/ipcmain/entity/*.js`, `src/function/cim/*.js`
- **Cause:** No visible query optimization or EXPLAIN analysis
- **Improvement path:** Add database indexes on frequently queried columns (mrid, id_foreign)

## Fragile Areas

### Download Node Complex Flow
- **Files:** `src/views/TreeNode/Server/mixin/Download/downloadNode.js`
- **Why fragile:** 500+ lines with extensive console logging, complex multi-stage download logic with many conditional branches
- **Safe modification:** Add unit tests, reduce logging, break into smaller functions
- **Test coverage:** No test coverage detected

### IPC Handler Error Handling
- **Files:** `src/ipcmain/entity/transformer/index.js`
- **Why fragile:** Each handler wraps errors but returns different error formats inconsistently
- **Safe modification:** Standardize error response format across all handlers
- **Test coverage:** No test coverage detected

### Tree Navigation Logic
- **Files:** `src/views/TreeNode/`
- **Why fragile:** Complex mixin inheritance and tree manipulation with potential null reference issues
- **Safe modification:** Add null checks, defensive coding
- **Test coverage:** No test coverage detected

## Scaling Limits

### SQLite Database
- **Current capacity:** Single file SQLite, suitable for desktop use
- **Limit:** Not designed for concurrent multi-user access, file locking issues
- **Scaling path:** Consider migration to PostgreSQL for multi-user scenarios

### Vuex Store
- **Current capacity:** In-memory store, no persistence
- **Limit:** State lost on app restart, no offline capability beyond SQLite
- **Scaling path:** Add state persistence or consider Pinia with plugins

## Dependencies at Risk

### Vue 2 (End of Life)
- **Risk:** Vue 2 reached end of life in 2023, no longer receiving security updates
- **Impact:** Potential security vulnerabilities unpatched
- **Migration plan:** Migrate to Vue 3 (major breaking changes)

### Element UI 2.x
- **Risk:** Based on Vue 2, also end of life
- **Impact:** No updates, potential compatibility issues
- **Migration plan:** Migrate to Element Plus (Vue 3)

### Axios 0.27.x
- **Risk:** Outdated version with known vulnerabilities
- **Impact:** HTTP request security issues
- **Migration plan:** Upgrade to latest axios 1.x

### Electron 13.x
- **Risk:** Two major versions behind current (Electron 33+)
- **Impact:** Missing security patches, Chrome version outdated
- **Migration plan:** Upgrade to latest Electron LTS

### Puppeteer 14.x
- **Risk:** Version significantly outdated
- **Impact:** Browser automation features may be limited
- **Migration plan:** Upgrade to latest puppeteer

## Missing Critical Features

### No Automated Testing
- **Problem:** No test files detected in codebase
- **Blocks:** Safe refactoring, regression detection, CI/CD integration

### No TypeScript
- **Problem:** Entire codebase in JavaScript without type checking
- **Blocks:** Refactoring safety, IDE autocomplete, runtime error prevention

### No Component Library Documentation
- **Problem:** No Storybook or component documentation
- **Blocks:** Component reuse, onboarding new developers

## Test Coverage Gaps

### Entire Application
- **What's not tested:** All business logic, IPC handlers, Vue components
- **Files:** No test files found in project
- **Risk:** Any change could break existing functionality without detection
- **Priority:** High

---

*Concerns audit: 2026-03-07*
