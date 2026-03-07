# Technology Stack

**Analysis Date:** 2026-03-07

## Languages

**Primary:**
- JavaScript (ES6+) - Core application logic in renderer and main process
- Vue 2.6.14 - Frontend framework

**Secondary:**
- Python - Importer binary (`extra_binaries/importer/importer_mac/importer`)
- SQL - Database queries

## Runtime

**Environment:**
- Electron 13.0.0 - Desktop runtime (Chromium + Node.js)
- Node.js built into Electron

**Package Manager:**
- npm (version defined by project, uses package-lock.json)
- Lockfile: `package-lock.json` (implicit in npm projects)

## Frameworks

**Core:**
- Vue 2.6.14 - UI framework
- Vue Router 3.6.5 - Client-side routing
- Vuex 3.6.2 - State management

**UI:**
- Element UI 2.15.8 - Component library
- AG Grid 28.2.1 (ag-grid-community, ag-grid-vue) - Data tables

**Desktop:**
- Electron 13.0.0 - Desktop app framework
- electron-builder 23.0.3 - Build/packaging

**Testing:**
- Not explicitly configured in package.json

**Build/Dev:**
- Vue CLI 5.0.0 - Build tooling
- Babel 7 - JavaScript transpilation
- Sass/SCSS - CSS preprocessing

## Key Dependencies

**Critical:**
- `@journeyapps/sqlcipher` 5.3.0 - SQLite with encryption
- `sqlite3` 5.0.8 - SQLite bindings
- `axios` 0.27.2 - HTTP client
- `knex` 3.1.0 - Query builder (not actively used in renderer)

**UI/Data:**
- `element-ui` 2.15.8 - UI components
- `ag-grid-community` 28.2.1 - Advanced tables
- `vue2-leaflet` 2.7.1 - Leaflet wrapper
- `leaflet` 1.9.4 - Mapping library

**Document Generation:**
- `exceljs` 4.3.0 - Excel export
- `docx` 7.8.2 - Word document generation
- `csv` 6.3.11 - CSV handling

**Automation/Integration:**
- `puppeteer` 14.0.0 - Browser automation
- `@electron/remote` 2.1.2 - Remote module access
- `uuid` 8.3.2 - UUID generation

**Utilities:**
- `semver` 7.7.4 - Version comparison
- `qs` 6.14.0 - Query string parsing

## Configuration

**Environment:**
- LocalStorage-based configuration for frontend (SERVER_ADDR, token)
- Database path: `database/database.db` (relative to app root)
- User data stored via Electron's `app.getPath('userData')`

**Build:**
- `vue.config.js` - Vue CLI + Electron Builder configuration
- `babel.config.js` - Babel presets
- `.eslintrc.js` - Linting rules
- `.prettierrc` - Code formatting

**Electron:**
- App ID: `com.at.digitaltester`
- Product Name: `AT Digital Tester`
- Windows target: NSIS installer
- macOS target: DMG + ZIP

## Platform Requirements

**Development:**
- Node.js (matching Electron's Node version)
- npm or yarn
- Python (for importer binary on macOS)

**Production:**
- Windows (NSIS installer) or macOS (DMG)
- No additional runtime dependencies

---

*Stack analysis: 2026-03-07*
