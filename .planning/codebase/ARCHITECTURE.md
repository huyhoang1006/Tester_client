# Architecture

**Analysis Date:** 2026-03-07

## Pattern Overview

**Overall:** Electron + Vue 2 Desktop Application with Layered Architecture

**Key Characteristics:**
- **Main/Renderer Separation**: Electron main process (`background.js`) handles database and system operations; Vue renderer (`main.js`) handles UI
- **IPC-Driven Communication**: Renderer communicates with main process exclusively through `ipcMain.handle()` / `ipcRenderer.invoke()` pattern via contextBridge
- **Entity-Based Organization**: Domain entities (Transformer, Substation, Bay, etc.) drive code organization in `ipcmain/entity/`, `preload/entity/`, and `function/entity/`
- **CIM Compliant**: Data models follow Common Information Model (CIM) standards for power grid assets

## Layers

**Electron Main Process (Layer 1 - Backend):**
- Purpose: Database operations, file system access, window management
- Location: `src/background.js`
- Contains: SQLite database access, IPC handler registration, Python worker spawn, Electron app lifecycle
- Depends on: `@journeyapps/sqlcipher` (SQLite), `electron` APIs
- Used by: IPC handlers via direct db access

**IPC Handler Layer (Layer 2 - API):**
- Purpose: Expose database operations to renderer via named channels
- Location: `src/ipcmain/entity/{entity}/index.js` and `src/ipcmain/cim/{entity}/index.js`
- Contains: CRUD operations for each entity type (insert, get, delete, update)
- Depends on: `src/function/` modules for business logic
- Used by: Renderer via preload bridge

**Business Logic Layer (Layer 3 - Domain):**
- Purpose: Data transformation, validation, and domain-specific operations
- Location: `src/function/entity/{entity}/index.js` and `src/function/cim/{entity}/index.js`
- Contains: Entity functions that construct SQL queries, map data between formats
- Depends on: Direct SQLite access via db object from background.js
- Used by: IPC handlers

**Preload Bridge Layer (Layer 4 - IPC Bridge):**
- Purpose: Expose IPC channels to renderer in a type-safe manner
- Location: `src/preload/entity/{entity}/index.js` and `src/preload.js` (aggregator)
- Contains: Functions that call `window.electronAPI.{channel}()`
- Depends on: IPC channels registered in ipcmain
- Used by: Vue components

**Vue Application Layer (Layer 5 - UI):**
- Purpose: User interface and state management
- Location: `src/views/`, `src/store/`, `src/components/`
- Contains: Vue components, Vuex store, Vue Router
- Depends on: Element UI, AG Grid, preload APIs
- Uses: IPC via preload to access main process data

## Data Flow

**Read Operation (e.g., Get Transformer):**

1. Vue Component calls: `window.electronAPI.getTransformerEntityByMrid(mrid, psrId)`
2. Preload (`src/preload/entity/transformer/index.js`) forwards to `ipcRenderer.invoke('getTransformerEntityByMrid', mrid, psrId)`
3. IPC Main Handler (`src/ipcmain/entity/transformer/index.js`) receives via `ipcMain.handle('getTransformerEntityByMrid', ...)`
4. Handler calls: `entityFunc.transformerEntityFunc.getTransformerEntityById(mrid, psrId)`
5. Business Logic (`src/function/entity/Transformer/index.js`) executes SQL query via `db.all()`
6. Result flows back up through the same chain to Vue component

**Write Operation (e.g., Create Transformer):**

1. Vue Component collects form data and calls: `window.electronAPI.insertTransformerEntity(oldData, data)`
2. Preload forwards via IPC
3. IPC Handler receives and calls business logic
4. Business logic validates, transforms data, executes INSERT via `db.run()`
5. Result returned through chain

## Key Abstractions

**Entity Abstraction:**
- Purpose: Represent power grid assets (Transformers, Breakers, Substations, etc.)
- Examples: `src/ipcmain/entity/transformer/index.js`, `src/ipcmain/entity/breaker/index.js`
- Pattern: Each entity has dedicated folder with CRUD handlers

**CIM Abstraction:**
- Purpose: Handle Common Information Model data structures for interoperability
- Examples: `src/ipcmain/cim/asset/index.js`, `src/ipcmain/cim/substation/index.js`
- Pattern: Separate from entity handlers, handles normalized CIM data

**Job Abstraction:**
- Purpose: Represent testing/maintenance work on assets
- Examples: `src/ipcmain/entity/job/transformer/index.js`, `src/ipcmain/entity/job/breaker/index.js`
- Pattern: Nested under `job/` directory with type-specific handlers

## Entry Points

**Electron Main Entry:**
- Location: `src/background.js`
- Triggers: Electron app ready event (`app.on('ready', ...)`)
- Responsibilities: Initialize SQLite, register IPC handlers, create BrowserWindow, spawn Python worker

**Vue Application Entry:**
- Location: `src/main.js`
- Triggers: BrowserWindow loads renderer
- Responsibilities: Bootstrap Vue app, router, store, Element UI, attach to #app

**Preload Bridge Entry:**
- Location: `src/preload.js`
- Triggers: BrowserWindow creation with preload script
- Responsibilities: Aggregate all entity preloads, expose via contextBridge

**Router Entry:**
- Location: `src/router/index.js`
- Triggers: Vue app mount
- Responsibilities: Define routes, handle authentication guards

## Error Handling

**Strategy:** Try-catch with structured error responses

**Patterns:**
- IPC Handlers wrap operations in try-catch, return `{ success: false, message: error.message }`
- Business logic functions return `{ success: boolean, data?: any, message?: string }`
- Vue components handle errors via `.catch()` on promises

## Cross-Cutting Concerns

**Logging:** Console-based logging in main process; Vue components use browser console

**Validation:** Performed in business logic layer before database operations

**Authentication:** Vue Router guards in `src/router/index.js` check `store.state.isAuthenticated`

**Database:** SQLite with sqlcipher encryption; foreign keys enabled; accessed directly from IPC handlers via shared db object

---

*Architecture analysis: 2026-03-07*
