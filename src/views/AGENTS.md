# src/views/ Directory

**Parent:** ../AGENTS.md

## OVERVIEW
Vue 2 components organized by domain (AssetView, JobView, TreeNode, etc.). 26+ subdirectories with mixin pattern.

## STRUCTURE
```
views/
├── AssetView/         # Asset management (Transformer, Breaker, etc.)
├── JobView/           # Job/test workflows
├── TreeNode/          # Tree navigation & dialogs
├── Common/            # Shared components
├── Cim/               # CIM entity views
├── VoltageLevel/      # Voltage level management
├── ConstantAsset/     # Constant data views
└── ...
```

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Add asset type | `AssetView/{AssetType}/` |
| Modify tree | `TreeNode/` |
| Job workflows | `JobView/{Type}/` |
| Dialogs | `TreeNode/dialogs/` |
| Mixins | `*/mixin/` |

## CONVENTIONS
- Single-word component names allowed
- index.vue for main views
- mixin pattern for shared logic
- Dialogs in TreeNode/dialogs/

## UNIQUE STYLES
- Deep nesting (up to 8 levels)
- Domain-driven organization
- Heavy use of mixins for reusable logic