# src/preload/ Directory

**Parent:** ../AGENTS.md

## OVERVIEW
Preload entity modules exposed via contextBridge. Aggregated in parent preload.js.

## STRUCTURE
```
preload/
├── index.js          # Aggregator (main preload)
├── entity/           # Entity IPC APIs
│   ├── index.js
│   ├── breaker/
│   ├── transformer/
│   ├── job/
│   └── ...
├── cim/             # CIM-related APIs
├── appOption/       # App settings API
├── userPreload/     # User API
└── ...
```

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Add entity API | `entity/{entity}/index.js` |
| Modify aggregation | `index.js` |
| App options | `appOption/` |
| User APIs | `userPreload/` |

## CONVENTIONS
- Expose via `contextBridge.exposeInMainWorld()`
- Use `ipcRenderer.invoke()` pattern
- Entity pattern mirrors ipcmain/

## SECURITY NOTE
- Main preload.js aggregates ALL entity APIs
- Large IPC surface - review security implications
- Consider splitting for tighter security