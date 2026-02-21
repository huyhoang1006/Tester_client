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

<!-- Beads Guidelines START -->

# Beads Guidelines
Read `BEADS_WORKFLOW_GUIDE.md` for complete instructions. 

<!-- Beads Guidelines END -->

<!-- bv-agent-instructions-v1 -->

---

## Beads Workflow Integration

This project uses [beads_viewer](https://github.com/Dicklesworthstone/beads_viewer) for issue tracking. Issues are stored in `.beads/` and tracked in git.

### Essential Commands

```bash
# View issues (launches TUI - avoid in automated sessions)
bv

# CLI commands for agents (use these instead)
bd ready              # Show issues ready to work (no blockers)
bd list --status=open # All open issues
bd show <id>          # Full issue details with dependencies
bd create --title="..." --type=task --priority=2
bd update <id> --status=in_progress
bd close <id> --reason="Completed"
bd close <id1> <id2>  # Close multiple issues at once
bd sync               # Commit and push changes
```

### Workflow Pattern

1. **Start**: Run `bd ready` to find actionable work
2. **Claim**: Use `bd update <id> --status=in_progress`
3. **Work**: Implement the task
4. **Complete**: Use `bd close <id>`
5. **Sync**: Always run `bd sync` at session end

### Key Concepts

- **Dependencies**: Issues can block other issues. `bd ready` shows only unblocked work.
- **Priority**: P0=critical, P1=high, P2=medium, P3=low, P4=backlog (use numbers, not words)
- **Types**: task, bug, feature, epic, question, docs
- **Blocking**: `bd dep add <issue> <depends-on>` to add dependencies

### Session Protocol

**Before ending any session, run this checklist:**

```bash
git status              # Check what changed
git add <files>         # Stage code changes
bd sync                 # Commit beads changes
git commit -m "..."     # Commit code
bd sync                 # Commit any new beads changes
git push                # Push to remote
```

### Best Practices

- Check `bd ready` at session start to find available work
- Update status as you work (in_progress → closed)
- Create new issues with `bd create` when you discover tasks
- Use descriptive titles and set appropriate priority/type
- Always `bd sync` before ending session

<!-- end-bv-agent-instructions -->
