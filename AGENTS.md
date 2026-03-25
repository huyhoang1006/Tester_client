# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-16
**Stack:** Vue 2 + Electron + SQLite

## OVERVIEW
AT Project Phase 2 - Desktop application for power grid asset management/testing. Electron app with Vue 2 renderer, SQLite database (sqlcipher), Element UI + AG Grid.

## STRUCTURE
```
./
├── src/
│   ├── background.js    # Electron main process
│   ├── main.js         # Vue renderer entry
│   ├── preload.js       # IPC bridge (contextBridge)
│   ├── views/           # Vue components (26+ subdirs)
│   ├── ipcmain/         # Electron IPC handlers
│   ├── preload/         # Preload entity modules
│   ├── config/          # Test definitions, procedures
│   ├── store/           # Vuex state
│   ├── router/          # Vue Router
│   └── utils/           # Helpers
├── database/            # SQLite DB files
├── public/              # Static assets
└── build/               # Build configs
```

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Add new asset type | src/views/{AssetType}/, src/ipcmain/entity/ |
| Modify IPC handlers | src/ipcmain/entity/{entity}/index.js |
| UI changes | src/views/{Domain}/ |
| Database schema | src/ipcmain/entity/index.js |
| Test definitions | src/config/test-definitions/ |

## ENTRY POINTS
- Electron main: `src/background.js`
- Vue app: `src/main.js`  
- Preload: `src/preload.js`
- Router: `src/router/index.js`

## CONVENTIONS
- ESLint: extends vue/essential, no console in prod
- Single-word components allowed (vue/multi-word-component-names: 0)
- IPC: use ipcMain.handle() / ipcRenderer.invoke()
- Components: index.vue in subdirectories with mixin pattern

## COMMANDS
```bash
npm run electron:serve  # Dev
npm run electron:build   # Build
```
