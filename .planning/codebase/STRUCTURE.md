# Codebase Structure

**Analysis Date:** 2026-03-07

## Directory Layout

```
Tester_client/
├── src/
│   ├── background.js          # Electron main process
│   ├── main.js                # Vue renderer entry
│   ├── preload.js             # IPC bridge aggregator
│   ├── App.vue                # Root Vue component
│   ├── views/                 # Vue page components
│   ├── components/            # Shared Vue components
│   ├── layout/                # Layout wrappers
│   ├── ipcmain/               # Electron IPC handlers
│   ├── preload/               # Preload entity modules
│   ├── function/              # Business logic layer
│   ├── store/                 # Vuex state management
│   ├── router/                # Vue Router configuration
│   ├── config/                # Test definitions & procedures
│   ├── utils/                 # Helper utilities
│   └── api/                   # API client utilities
├── database/                  # SQLite database files
├── public/                    # Static assets
├── build/                     # Electron build configs
└── extra_binaries/            # Python importer executable
```

## Directory Purposes

**`src/`:**
- Purpose: All application source code
- Contains: Electron main, Vue app, IPC handlers, business logic

**`src/views/`:**
- Purpose: Page-level Vue components
- Contains: Domain-organized views (TreeNode, JobView, VoltageLevel, etc.)
- Key files: `TreeNode/treeNavigation.vue`, `JobView/Transformer/index.vue`

**`src/ipcmain/`:**
- Purpose: Electron IPC handlers for database operations
- Contains: Entity handlers (`entity/`) and CIM handlers (`cim/`)
- Key files: `entity/index.js` (central registry), `entity/transformer/index.js`

**`src/preload/`:**
- Purpose: Preload API modules for each entity
- Contains: Entity-specific preload functions
- Key files: `index.js` (aggregator), `entity/transformer/index.js`

**`src/function/`:**
- Purpose: Business logic and domain operations
- Contains: Entity functions (`entity/`) and CIM functions (`cim/`)
- Key files: `index.js` (exports all), `entity/Transformer/index.js`

**`src/store/`:**
- Purpose: Vuex state management
- Contains: Main store and modules
- Key files: `index.js` (main store with auth, selection state)

**`src/router/`:**
- Purpose: Vue Router configuration
- Contains: Route definitions and navigation guards
- Key files: `index.js` (all routes)

**`src/config/`:**
- Purpose: Test definitions and procedures configuration
- Contains: JSON files for testing conditions organized by asset type
- Key files: `testing-condition/Transformer/index.js`, `test-definitions/`

**`src/components/`:**
- Purpose: Shared Vue components
- Contains: TopBar, GlobalLoading, LogBar, VersionManager
- Key files: `TopBar/index.vue`, `GlobalLoading.vue`

**`src/utils/`:**
- Purpose: Helper utilities and constants
- Contains: Config, helper, client, mapper utilities
- Key files: `config.js`, `helper.js`, `constant.js`, `MapperServer/`, `MapperClient/`

## Key File Locations

**Entry Points:**
- `src/background.js`: Electron main process - app lifecycle, DB init, IPC registration
- `src/main.js`: Vue renderer bootstrap - router, store, Element UI
- `src/preload.js`: IPC bridge - aggregates all preload APIs to window.electronAPI
- `src/App.vue`: Root Vue component - router-view container
- `src/router/index.js`: Route definitions with auth guards

**Configuration:**
- `package.json`: Dependencies, scripts, version
- `vue.config.js`: Vue CLI configuration
- `.eslintrc.js`: ESLint rules
- `babel.config.js`: Babel transpilation config

**Core Logic:**
- `src/ipcmain/entity/index.js`: Central registry for all entity IPC handlers
- `src/function/entity/Transformer/index.js`: Transformer business logic
- `src/store/index.js`: Vuex store with auth and selection state

**Testing:**
- `src/config/testing-condition/`: JSON test condition definitions
- `src/config/test-definitions/`: Test procedure definitions

## Naming Conventions

**Files:**
- Components: `PascalCase.vue` (e.g., `TransformerDialog.vue`, `TopBar.vue`)
- Modules/Handlers: `camelCase.js` (e.g., `transformerEntityFunc.js`)
- Index files: `index.js` for directory exports
- Mixins: `index.js` in `mixin/` subdirectories

**Directories:**
- Entity names: `PascalCase` (e.g., `Transformer/`, `VoltageLevel/`)
- View directories: `PascalCase` (e.g., `JobView/`, `TreeNode/`)
- IPC/CIM handlers: `camelCase` (e.g., `entity/transformer/`)
- Mixin directories: `camelCase` (e.g., `mixin/Download/`)

**Variables/Functions:**
- Functions: `camelCase` (e.g., `insertTransformerEntity`, `getTransformerByMrid`)
- IPC channels: `camelCase` (e.g., `'getTransformerEntityByMrid'`)
- Vue components: `PascalCase`

**Vue Components in Views:**
- Pattern: `views/{Domain}/{Feature}/index.vue` or `views/{Domain}/{Feature}.vue`
- Mixins: `views/{Domain}/{Feature}/mixin/index.js`
- Dialogs: `views/TreeNode/dialogs/{EntityName}Dialog.vue`
- Components: `views/{Domain}/{Feature}/components/{ComponentName}/index.vue`

## Where to Add New Code

**New Asset Entity (e.g., New Equipment Type):**

1. IPC Handler: Create `src/ipcmain/entity/{entityName}/index.js`
2. Register in: `src/ipcmain/entity/index.js` (import and call in active())
3. Business Logic: Create `src/function/entity/{entityName}/index.js`
4. Preload API: Create `src/preload/entity/{entityName}/index.js`
5. Register in: `src/preload.js` (import and add to ipcMain object)
6. UI Component: Create `src/views/TreeNode/dialogs/{EntityName}Dialog.vue`
7. Add to tree: Update navigation/mixin logic in `src/views/TreeNode/`

**New View/Page:**

1. Create: `src/views/{Domain}/{PageName}/index.vue`
2. Add route: Update `src/router/index.js`
3. Add navigation: Update relevant components/mixins

**New Test Type:**

1. Definition: Add JSON to `src/config/test-definitions/{AssetType}/`
2. Conditions: Add JSON to `src/config/testing-condition/{AssetType}/`
3. Component: Create test UI in `src/views/JobView/{AssetType}/components/`

**New Utility Function:**

1. If server-side: Add to appropriate file in `src/utils/MapperServer/`
2. If client-side: Add to appropriate file in `src/utils/MapperClient/`
3. If general: Add to `src/utils/helper.js` or create new module

## Special Directories

**`database/`:**
- Purpose: SQLite database files
- Contains: `database.db` (sqlcipher encrypted)
- Generated: Yes (created at runtime if not exists)
- Committed: No (gitignored)

**`build/`:**
- Purpose: Electron builder configuration
- Contains: Installer scripts, license files
- Generated: No
- Committed: Yes

**`extra_binaries/`:**
- Purpose: Python importer executable for file conversion
- Contains: Platform-specific executables (`importer_win/`, `importer_mac/`)
- Generated: No (external binary)
- Committed: Yes (binary files)

**`public/`:**
- Purpose: Static assets served directly
- Contains: index.html, favicon
- Generated: Yes (Vue CLI)
- Committed: Yes

---

*Structure analysis: 2026-03-07*
