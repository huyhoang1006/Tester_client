# Git-Based Auto-Update Flow

**Quick reference for AT Digital Tester**

---

## Overview

```
┌──────────────┐     push tag      ┌─────────────────┐
│   Developer   │ ─────────────────▶│   GitHub/GitLab  │
│   (local)    │                   │   Releases       │
└──────────────┘                   └────────┬────────┘
                                             │
                                             │ HTTPS API
                                             ▼
┌──────────────┐     check &       ┌─────────────────┐
│   User App   │ ◀─────────────────│ electron-updater │
└──────────────┘                   └─────────────────┘
```

---

## Developer Workflow

### 1. Make Changes
```bash
git checkout -b feature/new-feature
# ... code changes ...
git add .
git commit -m "feat: add new feature"
```

### 2. Create Release Tag
```bash
# Semantic versioning: v[MAJOR].[MINOR].[PATCH]
git tag v1.0.0
```

### 3. Build & Push
```bash
npm run electron:build

git add dist_electron/
git commit -m "build: release v1.0.0"

git push origin v1.0.0
```

### 4. CI/CD Auto-Publish
```yaml
# .gitlab-ci.yml (auto triggers on tag)
release:
  stage: release
  only: [tags]
  script:
    - electron-builder upload
```

---

## CI/CD Configuration

### GitLab CI
```yaml
release_github:
  stage: release
  only: [tags]
  script:
    - npm run electron:build
    - curl -H "Authorization: token $GITHUB_TOKEN" \
      --data-binary @dist_electron/*.exe \
      "https://uploads.github.com/repos/org/repo/releases/$CI_COMMIT_TAG/assets"
```

### GitHub Actions
```yaml
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: npm run electron:build
      - name: Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist_electron/*.exe
```

---

## App Update Check

```javascript
// background.js
import { autoUpdater } from 'electron-updater'

autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'your-org',
  repo: 'ATDigitalTester'
})

autoUpdater.checkForUpdatesAndNotify()
```

---

## Quick Checklist

```
Developer:
□ Code changes
□ Update version in package.json
□ git tag v[X.X.X]
□ git push origin v[X.X.X]
□ CI/CD builds & publishes

App:
□ Check version on startup
□ Download update
□ Notify user
□ Install on restart
```

---

## File Locations

| What | Where |
|------|-------|
| Update logic | `src/background.js` |
| Config | `vue.config.js` |
| CI/CD | `.gitlab-ci.yml` |
| Release notes | `CHANGELOG.md` |

---

## Commands Summary

```bash
# Build
npm run electron:build

# Create tag
git tag v1.0.0

# Push tag
git push origin v1.0.0
```

---

## Support

- Docs: [electron-builder auto-update](https://www.electron.build/auto-update)
- Issues: Check GitHub repo issues
