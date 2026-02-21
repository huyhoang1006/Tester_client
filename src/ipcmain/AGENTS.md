# src/ipcmain/ Directory

**Parent:** ../AGENTS.md

## OVERVIEW
Electron IPC handlers for database operations and entity management. Organized by entity type.

## STRUCTURE
```
ipcmain/
├── index.js           # Main IPC registry
├── entity/            # Entity handlers
│   ├── index.js      # Central registry
│   ├── breaker/
│   ├── transformer/
│   ├── job/
│   └── ...
├── cim/              # CIM-related handlers
├── uploadCustom/     # Upload handlers
└── ...
```

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Add entity handler | `entity/{entity}/index.js` |
| Modify IPC registry | `entity/index.js` |
| CIM handlers | `cim/` |
| Upload logic | `uploadCustom/` |

## CONVENTIONS
- Use `ipcMain.handle()` for all handlers
- Database queries in handlers
- Entity pattern: CRUD + custom ops
- Job handlers in `entity/job/`

## UNIQUE STYLES
- Each entity has dedicated folder
- Job entities have sub-handlers by type
- CIM handlers separate from core entities