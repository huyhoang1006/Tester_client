# src/ Directory

**Parent:** ./AGENTS.md

## OVERVIEW
Electron + Vue 2 application source. Main process (background.js), renderer (main.js), IPC bridge (preload.js).

## STRUCTURE
```
src/
├── background.js    # Electron main process (DB access, IPC wiring)
├── main.js         # Vue 2 entry (router, store, Element UI)
├── preload.js      # ContextBridge IPC surface
├── views/          # UI components (domain-driven)
├── ipcmain/        # IPC handlers (main process)
├── preload/        # Preload entity modules
├── store/          # Vuex modules
├── router/         # Vue Router config
├── config/         # Test/procedure definitions
├── utils/          # Helpers
├── components/     # Shared components
├── layout/         # Layout wrappers
├── api/            # API clients
└── function/       # Business logic utilities
```

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Electron main process | `background.js` |
| Vue bootstrap | `main.js` |
| IPC handlers | `ipcmain/entity/` |
| Preload APIs | `preload/entity/` |
| Vuex store | `store/` |
| Routing | `router/index.js` |

## CONVENTIONS
- IPC handlers: `ipcmain.handle('channel', handler)`
- Preload exposes: `window.ipcRenderer.invoke()`
- Vuex modules: `store/modules/{name}.js`
- Views: `views/{Domain}/index.vue`

## ANTI-PATTERNS
- Don't modify preload directly - add to `preload/entity/`
- Don't access DB from renderer - use IPC
- Don't disable webSecurity in production

## UNIQUE STYLES
- Monolithic preload aggregates all entity APIs
- Node integration enabled (security consideration)
- SQLite in `database/` folder, accessed from main process