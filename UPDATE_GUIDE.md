# Hướng Dẫn Implement Auto-Update Cho AT Digital Tester

**Document:** Auto-Update Implementation Guide  
**Project:** AT Digital Tester (Vue 2 + Electron + SQLite)  
**Created:** 2026-02-16  
**Version:** 1.0.0

---

## Mục Lục

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Hiện Trạng](#2-hiện-trạng)
3. [Các Phương Án Update](#3-các-phương-án-update)
4. [Git-Based Update (Khuyến Nghị)](#4-git-based-update-khuyến-nghị)
5. [Implementation Chi Tiết](#5-implementation-chi-tiết)
6. [CI/CD Configuration](#6-cicd-configuration)
7. [Database Migration](#7-database-migration)
8. [FAQ](#8-faq)

---

## 1. Tổng Quan Dự Án

### 1.1 Thông Tin Project

| Thành phần | Chi tiết |
|------------|----------|
| **Tên** | AT Digital Tester |
| **Version hiện tại** | 0.1.0 |
| **Stack** | Vue 2 + Electron + SQLite (sqlcipher) |
| **UI Library** | Element UI, AG Grid |
| **Build Tool** | electron-builder (vue-cli-plugin-electron-builder) |
| **Platform** | Windows (NSIS installer) |

### 1.2 Cấu Trúc Thư Mục Quan Trọng

```
ATDigitalTester/
├── src/
│   ├── background.js      # Electron main process
│   ├── main.js           # Vue renderer entry
│   ├── preload.js        # IPC bridge
│   ├── update/           # Database/Procedure update
│   │   ├── index.js
│   │   ├── organisationRoot/
│   │   └── procedure/
│   ├── ipcmain/         # IPC handlers
│   ├── preload/          # Preload entities
│   └── views/            # Vue components
├── database/             # SQLite DB files
├── public/               # Static assets
├── build/                # Build configs (license, installer scripts)
├── icon/                 # App icons
├── etrc-icon/            # Custom icons
├── attachment/           # Attachment files
├── template/             # Templates
├── vue.config.js         # Electron builder config
├── .gitlab-ci.yml        # CI/CD pipeline
└── package.json          # Dependencies & scripts
```

### 1.3 Entry Points

| File | Vai trò |
|------|---------|
| `src/background.js` | Electron main process, DB access, IPC wiring |
| `src/main.js` | Vue 2 entry, router, store, Element UI |
| `src/preload.js` | ContextBridge IPC surface |
| `src/router/index.js` | Vue Router configuration |

---

## 2. Hiện Trạng

### 2.1 Update Hiện Tại (Database/Procedure Only)

Thư mục `src/update/` hiện tại chỉ xử lý:

- **Tạo root organization** (`createRootOrganisation`)
- **Update procedure** (`updateProcedure`)
- **Lưu version** vào `userData/procedure.json`

```js
// src/update/index.js
export const active = async () => {
    await createRootOrganisation()
    await updateProcedure()
}
```

### 2.2 Điểm Yếu Hiện Tại

| Vấn đề | Mô tả |
|--------|-------|
| **Chưa có auto-update** | User phải tự download và cài đặt thủ công |
| **Không có version check** | App không biết có bản mới không |
| **Không có release notes** | User không biết update có gì mới |
| **Manual deployment** | Build xong phải upload thủ công |

### 2.3 Yêu Cầu Update

```
┌─────────────────────────────────────────────────────┐
│              AT Digital Tester Needs                 │
├─────────────────────────────────────────────────────┤
│ ✅ Auto-check version khi mở app                    │
│ ✅ Thông báo khi có bản mới                        │
│ ✅ Download & install tự động (hoặc semi-auto)     │
│ ✅ Rollback nếu update thất bại                     │
│ ✅ Database migration khi update                   │
│ ✅ CI/CD tự động khi release                        │
│ ✅ Release notes cho user                           │
└─────────────────────────────────────────────────────┘
```

---

## 3. Các Phương Án Update

### 3.1 So Sánh Các Phương Án

| Phương án | Độ khó | Server | User Experience | Chi phí | Phù hợp khi |
|-----------|--------|--------|-----------------|---------|-------------|
| **electron-updater** | Trung bình | Cần | Seamless, tự động | Thấp | Public/private apps |
| **Manual NSIS** | Dễ | Không cần | User tự cài | Miễn phí | Internal apps |
| **Kết hợp** | Trung bình | Cần | Linh hoạt nhất | Trung bình | Production |

### 3.2 Phương Án 1: electron-updater

#### 3.2.1 Ưu Điểm

- Tích hợp sẵn với electron-builder
- Hỗ trợ GitHub Releases, S3, custom server
- Incremental update (chỉ download phần thay đổi)
- Signature verification (bảo mật)
- Rollback nếu lỗi
- Free với GitHub public repos

#### 3.2.2 Nhược Điểm

- Cần server/hosting cho artifacts
- Private repos cần paid GitHub
- Complex setup ban đầu

#### 3.2.3 Cấu Trúc Update

```
GitHub Releases / Server
│
├── latest.yml              # Metadata (version, url, sha512)
├── AT-Digital-Tester-1.0.0.exe      # Full installer
├── AT-Digital-Tester-1.0.0.exe.blockmap  # Incremental info
└── AT-Digital-Tester-1.0.1.exe      # Next version...
```

### 3.3 Phương Án 2: Manual NSIS

#### 3.3.1 Ưu Điểm

- Đơn giản, không cần server
- User kiểm soát hoàn toàn
- Test offline được
- Không phụ thuộc network

#### 3.3.2 Nhược Điểm

- User phải tự download
- Không có thông báo auto
- Không có incremental update
- User phải technical

#### 3.3.3 Workflow

```
1. Build → dist_electron/*.exe
2. Upload lên website/SFTP
3. User download file .exe
4. User chạy installer thủ công
```

### 3.4 Phương Án 3: Kết Hợp (Khuyến Nghị)

#### 3.4.1 Chiến Lược Update

| Loại Update | Chiến lược | User Experience |
|-------------|------------|-----------------|
| **Minor (patch)** | Auto-download + notify | Seamless |
| **Minor (feature)** | Auto-download + notify + restart | Seamless |
| **Major** | Manual installer + notification | User control |
| **Emergency fix** | Force update | Required |

#### 3.4.2 Ví Dụ Quyết Định

```
Version hiện tại: 1.0.0
Version mới: 1.0.1 (patch)
→ Tự động download & notify

Version hiện tại: 1.0.0
Version mới: 1.1.0 (feature)
→ Tự động download & notify + restart

Version hiện tại: 1.0.0
Version mới: 2.0.0 (major)
→ Thông báo major update + link download manual
```

---

## 4. Git-Based Update (Khuyến Nghị)

### 4.1 Tổng Quan

Dùng **GitHub Releases** hoặc **GitLab Packages** làm update server.

```
┌─────────────────────────────────────────────────────┐
│                    GitHub / GitLab                   │
│  ┌─────────────┐    ┌─────────────────────────┐   │
│  │ Source Code │───▶│ Releases / Packages     │   │
│  │             │    │ • latest.yml            │   │
│  │             │    │ • *.exe                 │   │
│  │             │    │ • *.blockmap            │   │
│  │             │    │ • release-notes.md       │   │
│  └─────────────┘    └─────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                            │
                            │ HTTPS API
                            ▼
┌─────────────────────────────────────────────────────┐
│              AT Digital Tester App                   │
│  ┌──────────────────────────────────────────────┐ │
│  │ electron-updater                               │ │
│  │ • checkForUpdates()                           │ │
│  │ • downloadUpdate()                             │ │
│  │ • quitAndInstall()                             │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 4.2 Yêu Cầu Hạ Tầng

#### 4.2.1 GitHub

| Thành phần | Yêu cầu |
|------------|----------|
| **Repository** | Public (miễn phí) hoặc Private ($7/tháng) |
| **Scopes** | repo (full control) |
| **Personal Access Token** | Cho CI/CD upload |
| **Bandwidth** | 500GB/tháng (free tier) |

#### 4.2.2 GitLab

| Thành phần | Yêu cầu |
|------------|----------|
| **Repository** | Public/Private |
| **CI/CD** | Có sẵn `.gitlab-ci.yml` |
| **CI Minutes** | 2000 phút/tháng (free) |
| **Packages Registry** | Lưu artifacts |

### 4.3 Security Considerations

#### 4.3.1 Bảo Mật

```
⚠️ QUAN TRỌNG:

1. KHÔNG commit tokens vào code
2. Dùng CI/CD variables cho sensitive data
3. Enable signature verification
4. HTTPS bắt buộc cho update channel
```

#### 4.3.2 Secure Token Storage

```yaml
# .gitlab-ci.yml
variables:
  GITHUB_TOKEN: $GITHUB_TOKEN  # Secure variable

release_github:
  script:
    - curl -H "Authorization: token $GITHUB_TOKEN" ...
```

### 4.4 Chi Phí So Sánh

| Nền tảng | Chi phí | Giới hạn |
|-----------|---------|----------|
| GitHub Public | Miễn phí | 500GB bandwidth/tháng |
| GitHub Private | $7/tháng | 500GB bandwidth/tháng |
| GitLab Free | Miễn phí | 2000 CI minutes/tháng |
| S3 | Tùy usage | Pay-as-you-go |
| Custom Server | Server cost | Tùy server |

---

## 5. Implementation Chi Tiết

### 5.1 Cài Đặt Dependencies

```bash
# Cài đặt electron-updater
npm install electron-updater

# Cài đặt logger (recommended)
npm install electron-log
```

### 5.2 Cập Nhật package.json

```json
{
  "name": "ATDigitalTester",
  "version": "1.0.0",
  "dependencies": {
    "electron-updater": "^6.1.8",
    "electron-log": "^5.1.2",
    ...
  }
}
```

### 5.3 Cấu Hình vue.config.js

```javascript
// vue.config.js
module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        // Extra resources đi kèm app
        extraResources: [
          "./database/**",
          "./icon/**",
          "./attachment/**",
          "./etrc-icon/**",
          "./template/**"
        ],
        
        productName: "AT Digital Tester",
        
        // Windows configuration
        win: {
          target: ["nsis"],
          icon: "icon/icon.ico",
          signedTruthQuality: "high"
        },
        
        // NSIS Installer configuration
        nsis: {
          guid: "ATDigitalTester",
          oneClick: false,
          perMachine: false,
          allowToChangeInstallationDirectory: true,
          createDesktopShortcut: true,
          installerIcon: "icon/icon.ico",
          uninstallerIcon: "icon/icon.ico",
          license: "build/license.txt",
          shortcutName: "ATDigital Tester",
          include: "build/installer.nsh",
          oneClick: true,
          allowElevation: false,
          uninstallDisplayName: "ATDigital Tester uninstaller"
        },
        
        // Auto-update configuration
        autoUpdate: true,
        
        // Publish to GitHub Releases
        publish: [
          {
            provider: "github",
            owner: "your-org",
            repo: "ATDigitalTester",
            private: false,
            token: process.env.GITHUB_TOKEN
          }
        ]
      }
    }
  }
}
```

### 5.4 Implementation Trong background.js

```javascript
// src/background.js
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import path from 'path'
import fs from 'fs'

// ============================================
// LOGGING SETUP
// ============================================
log.transports.file.resolvePath = () => path.join(app.getPath('userData'), 'logs/main.log')
log.transports.file.level = 'info'
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'

// ============================================
// UPDATE CONFIGURATION
// ============================================

// GitHub Configuration
const updateConfig = {
  provider: 'github',
  owner: 'your-org',  // Thay bằng GitHub organization/user
  repo: 'ATDigitalTester',
  token: process.env.GITHUB_TOKEN,  // Optional, cho private repos
  autoDownload: true,
  autoInstallOnAppQuit: true
}

// Set update URL
autoUpdater.setFeedURL(updateConfig)

// ============================================
// UPDATE FUNCTIONS
// ============================================

/**
 * Check for updates và notify user
 * Gọi khi app ready
 */
export function checkForUpdates() {
  if (process.env.DEBUG) {
    console.log('[Update] Debug mode - skipping check')
    return
  }

  console.log('[Update] Checking for updates...')
  
  autoUpdater.checkForUpdatesAndNotify()
    .then((updateCheckResult) => {
      if (updateCheckResult) {
        console.log('[Update] Check completed:', updateCheckResult)
      }
    })
    .catch((err) => {
      console.error('[Update] Check failed:', err)
    })
}

/**
 * Force check for updates (user triggered)
 */
export function forceCheckForUpdates() {
  dialog.showMessageBox({
    type: 'info',
    title: 'Kiểm tra cập nhật',
    message: 'Đang kiểm tra...',
    buttons: ['OK']
  })

  autoUpdater.checkForUpdatesAndNotify()
}

/**
 * Download update manually
 */
export function downloadUpdate() {
  return autoUpdater.downloadUpdate()
}

/**
 * Quit and install update
 */
export function installUpdate() {
  autoUpdater.quitAndInstall()
}

// ============================================
// UPDATE EVENTS
// ============================================

// Update found and downloading
autoUpdater.on('checking-for-update', () => {
  console.log('[Update] Checking for update...')
  log.info('Checking for update...')
})

// Update available
autoUpdater.on('update-available', (info) => {
  console.log('[Update] Update available:', info.version)
  log.info('Update available:', info.version)
  
  dialog.showMessageBox({
    type: 'info',
    title: '📦 Cập nhật mới',
    message: `Phiên bản ${info.version} có sẵn`,
    detail: `Đang tải về...\n\n${info.releaseNotes || ''}`,
    buttons: ['OK']
  })
})

// No update available
autoUpdater.on('update-not-available', (info) => {
  console.log('[Update] No update available:', info)
  log.info('No update available:', info)
})

// Update downloaded
autoUpdater.on('update-downloaded', (info) => {
  console.log('[Update] Downloaded:', info.version)
  log.info('Update downloaded:', info.version)
  
  dialog.showMessageBox({
    type: 'info',
    title: '✅ Sẵn sàng cập nhật',
    message: `Phiên bản ${info.version} đã tải xong`,
    detail: 'Nhấn "Khởi động lại" để áp dụng thay đổi.',
    buttons: ['Khởi động lại', 'Để sau']
  }).then((result) => {
    if (result.response === 0) {
      installUpdate()
    }
  })
})

// Download progress
autoUpdater.on('download-progress', (progressObj) => {
  const percent = Math.round(progressObj.percent)
  console.log(`[Update] Downloaded ${percent}%`)
  log.info(`Download progress: ${percent}%`)
  
  // Send to renderer for UI progress bar
  if (mainWindow) {
    mainWindow.webContents.send('update-progress', percent)
  }
})

// Update error
autoUpdater.on('error', (err) => {
  console.error('[Update] Error:', err)
  log.error('Update error:', err)
  
  dialog.showMessageBox({
    type: 'error',
    title: 'Lỗi cập nhật',
    message: 'Đã xảy ra lỗi trong quá trình cập nhật',
    detail: err.message || String(err),
    buttons: ['OK']
  })
})

// Signature verification error
autoUpdater.on('update-downloaded', (info) => {
  console.log('[Update] Update signature verified')
})

// ============================================
// IPC HANDLERS FOR RENDERER
// ============================================

ipcMain.handle('check-for-updates', async () => {
  try {
    forceCheckForUpdates()
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('get-update-status', async () => {
  return {
    version: app.getVersion(),
    currentVersion: app.getVersion()
  }
})

// ============================================
// MAIN WINDOW CREATION
// ============================================

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadURL('http://localhost:8080')
  
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// ============================================
// APP LIFECYCLE
// ============================================

app.whenReady().then(() => {
  createWindow()
  
  // Check for updates after app is ready
  // Delay để app khởi động hoàn tất
  setTimeout(() => {
    checkForUpdates()
  }, 3000)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
```

### 5.5 UI Component Cho Update (Vue)

```vue
<!-- src/views/UpdateDialog/index.vue -->
<template>
  <el-dialog
    title="Cập nhật ứng dụng"
    :visible.sync="dialogVisible"
    width="400px"
    :close-on-click-modal="false"
  >
    <div v-if="updateStatus === 'checking'">
      <p>Đang kiểm tra cập nhật...</p>
      <el-progress :percentage="100" :indeterminate="true"></el-progress>
    </div>
    
    <div v-else-if="updateStatus === 'downloading'">
      <p>Đang tải: {{ downloadPercent }}%</p>
      <el-progress :percentage="downloadPercent"></el-progress>
    </div>
    
    <div v-else-if="updateStatus === 'ready'">
      <p>Phiên bản {{ newVersion }} đã sẵn sàng</p>
      <p>{{ releaseNotes }}</p>
    </div>
    
    <div v-else-if="updateStatus === 'up-to-date'">
      <p>Ứng dụng đã là phiên bản mới nhất!</p>
    </div>
    
    <span slot="footer" class="dialog-footer">
      <el-button 
        v-if="updateStatus === 'ready'" 
        type="primary" 
        @click="restartApp"
      >
        Khởi động lại ngay
      </el-button>
      <el-button 
        v-if="updateStatus === 'ready'" 
        @click="dialogVisible = false"
      >
        Để sau
      </el-button>
      <el-button @click="dialogVisible = false">
        {{ updateStatus === 'up-to-date' ? 'OK' : 'Đóng' }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'UpdateDialog',
  
  data() {
    return {
      dialogVisible: false,
      updateStatus: 'idle', // idle, checking, downloading, ready, up-to-date, error
      downloadPercent: 0,
      newVersion: '',
      releaseNotes: ''
    }
  },
  
  mounted() {
    // Listen for update events from main process
    this.$electron.ipcRenderer.on('update-progress', (event, percent) => {
      this.updateStatus = 'downloading'
      this.downloadPercent = percent
    })
    
    // Check for updates periodically or on mount
    this.checkForUpdates()
  },
  
  methods: {
    async checkForUpdates() {
      this.updateStatus = 'checking'
      this.dialogVisible = true
      
      try {
        await this.$electron.ipcRenderer.invoke('check-for-updates')
      } catch (error) {
        this.$message.error('Không thể kiểm tra cập nhật')
        this.dialogVisible = false
      }
    },
    
    restartApp() {
      this.$electron.ipcRenderer.invoke('install-update')
    }
  },
  
  beforeDestroy() {
    this.$electron.ipcRenderer.removeAllListeners('update-progress')
  }
}
</script>
```

### 5.6 Preload.js Update API

```javascript
// src/preload.js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronUpdater', {
  // Check for updates
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  
  // Get current version
  getVersion: () => ipcRenderer.invoke('get-update-status'),
  
  // Force download
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  
  // Install update
  installUpdate: () => ipcRenderer.invoke('install-update'),
  
  // Events
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, info) => callback(info)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (event, info) => callback(info)),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, progress) => callback(progress)),
  onError: (callback) => ipcRenderer.on('update-error', (event, error) => callback(error))
})
```

---

## 6. CI/CD Configuration

### 6.1 GitLab CI (.gitlab-ci.yml)

```yaml
# .gitlab-ci.yml
stages:
  - install
  - lint
  - build
  - test
  - release

variables:
  NODE_VERSION: "16"
  npm_config_cache: "$CI_PROJECT_DIR/.npm"
  GITHUB_TOKEN: $GITHUB_TOKEN  # Secure variable

cache:
  paths:
    - .npm/
    - node_modules/

# ============================================
# INSTALL STAGE
# ============================================
install_deps:
  stage: install
  script:
    - npm ci
  artifacts:
    paths:
      - node_modules/
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"
    - if: $CI_COMMIT_TAG

# ============================================
# LINT STAGE
# ============================================
lint_code:
  stage: lint
  script:
    - npm run lint
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"
    - if: $CI_COMMIT_TAG

# ============================================
# BUILD STAGE
# ============================================
build_app:
  stage: build
  script:
    - npm run electron:build
  artifacts:
    paths:
      - dist_electron/
    expire_in: 1 week
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"
    - if: $CI_COMMIT_TAG

# ============================================
# TEST STAGE (nếu có tests)
# ============================================
test_app:
  stage: test
  script:
    - echo "Run tests here"
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"

# ============================================
# RELEASE STAGE (GitHub Releases)
# ============================================
release_github:
  stage: release
  image: curlimages/curl:latest
  only:
    - tags
  script:
    - |
      echo "Upload to GitHub Releases"
      
      # Get release info
      RELEASE_TAG=$CI_COMMIT_TAG
      RELEASE_NOTES=$(cat release-notes.md 2>/dev/null || echo "Version $RELEASE_TAG")
      
      # Upload to GitHub Releases
      for FILE in dist_electron/*.exe; do
        if [ -f "$FILE" ]; then
          echo "Uploading $FILE..."
          curl -X POST \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Content-Type: application/octet-stream" \
            --data-binary @"$FILE" \
            "https://uploads.github.com/repos/$CI_PROJECT_PATH/releases/$CI_COMMIT_TAG/assets?name=$(basename $FILE)&label=$(basename $FILE)"
        fi
      done
      
      # Upload latest.yml
      if [ -f "dist_electron/latest.yml" ]; then
        echo "Uploading latest.yml..."
        curl -X POST \
          -H "Authorization: token $GITHUB_TOKEN" \
          -H "Content-Type: application/octet-stream" \
          --data-binary @"dist_electron/latest.yml" \
          "https://uploads.github.com/repos/$CI_PROJECT_PATH/releases/$CI_COMMIT_TAG/assets?name=latest.yml&label=latest.yml"
      fi
      
      # Upload blockmap files
      for FILE in dist_electron/*.blockmap; do
        if [ -f "$FILE" ]; then
          echo "Uploading $FILE..."
          curl -X POST \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Content-Type: application/octet-stream" \
            --data-binary @"$FILE" \
            "https://uploads.github.com/repos/$CI_PROJECT_PATH/releases/$CI_COMMIT_TAG/assets?name=$(basename $FILE)&label=$(basename $FILE)"
        fi
      done
      
      echo "Release $RELEASE_TAG published!"
  rules:
    - if: $CI_COMMIT_TAG
```

### 6.2 GitHub Actions (.github/workflows/release.yml)

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Electron App
        run: npm run electron:build
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Upload Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: electron-build
          path: dist_electron/
          retention-days: 7

  release:
    needs: build
    runs-on: ubuntu-latest
    
    steps:
      - name: Download Artifacts
        uses: actions/download-artifact@v3
        with:
          name: electron-build
          path: dist_electron/
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist_electron/*.exe
            dist_electron/latest.yml
            dist_electron/*.blockmap
          body_path: release-notes.md
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 6.3 Release Notes Template

```markdown
# release-notes.md

## Version 1.0.0 (2026-02-16)

### ✨ New Features
- Auto-update functionality
- Improved database migration

### 🐛 Bug Fixes
- Fixed issue #1
- Fixed issue #2

### 🔧 Improvements
- Performance improvements
- UI/UX enhancements

### 📝 Notes
- Requires Windows 10+
- .NET Framework 4.8+ required
```

---

## 7. Database Migration

### 7.1 Chiến Lược Migration

Khi update app, database có thể cần migrate.

```
┌─────────────────────────────────────────────────────┐
│              Update Flow với Database                │
├─────────────────────────────────────────────────────┤
│ 1. Backup database hiện tại                        │
│ 2. Áp dụng migration scripts                      │
│ 3. Verify migration thành công                    │
│ 4. Nếu lỗi → rollback từ backup                  │
└─────────────────────────────────────────────────────┘
```

### 7.2 Implementation Database Migration

```javascript
// src/update/databaseMigration.js
import db from '@/function/datacontext/index'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'

const MIGRATIONS_DIR = path.join(__dirname, '../../database/migrations')

/**
 * Lấy database version hiện tại
 */
async function getDbVersion() {
  try {
    const result = await db('system_info')
      .where({ key: 'db_version' })
      .first()
    return result ? parseInt(result.value) : 0
  } catch (err) {
    // Table chưa tồn tại
    return 0
  }
}

/**
 * Set database version
 */
async function setDbVersion(version) {
  await db('system_info')
    .insert({ key: 'db_version', value: String(version) })
}

/**
 * Backup database
 */
function backupDatabase() {
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'ATDigitalTester.db')
  const backupPath = path.join(userDataPath, `ATDigitalTester.backup.${Date.now()}.db`)
  
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, backupPath)
    console.log(`[Migration] Database backed up to: ${backupPath}`)
    return backupPath
  }
  return null
}

/**
 * Rollback từ backup
 */
function rollbackFromBackup(backupPath) {
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'ATDigitalTester.db')
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, dbPath)
    console.log(`[Migration] Rolled back from: ${backupPath}`)
    return true
  }
  return false
}

/**
 * Run migrations
 */
export async function runMigrations() {
  const currentVersion = await getDbVersion()
  const targetVersion = 2 // Version mới nhất
  
  if (currentVersion >= targetVersion) {
    console.log(`[Migration] DB version ${currentVersion} is up to date`)
    return { success: true, migrated: false }
  }
  
  console.log(`[Migration] Migrating from ${currentVersion} to ${targetVersion}`)
  
  // Backup trước khi migrate
  const backupPath = backupDatabase()
  
  try {
    // Run migration scripts
    for (let v = currentVersion + 1; v <= targetVersion; v++) {
      const migrationFile = path.join(MIGRATIONS_DIR, `v${v}.js`)
      
      if (fs.existsSync(migrationFile)) {
        console.log(`[Migration] Running v${v}...`)
        const migration = require(migrationFile)
        await migration.up(db)
        console.log(`[Migration] v${v} completed`)
      }
    }
    
    // Update version
    await setDbVersion(targetVersion)
    
    console.log(`[Migration] Success! DB updated to v${targetVersion}`)
    return { success: true, migrated: true, fromVersion: currentVersion, toVersion: targetVersion }
    
  } catch (err) {
    console.error(`[Migration] Error: ${err}`)
    
    // Rollback nếu có lỗi
    if (backupPath) {
      console.log('[Migration] Rolling back...')
      rollbackFromBackup(backupPath)
    }
    
    return { success: false, error: err.message }
  }
}

/**
 * Check và run migrations khi app update
 */
export async function checkAndRunMigrations() {
  const userDataPath = app.getPath('userData')
  const versionFile = path.join(userDataPath, 'app_version.json')
  
  // Đọc app version hiện tại
  let appVersion = '0.1.0'
  try {
    if (fs.existsSync(versionFile)) {
      const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf-8'))
      appVersion = versionData.currentVersion
    }
  } catch (err) {
    console.error('[Migration] Error reading version file:', err)
  }
  
  // Nếu app version thay đổi, chạy migrations
  const newVersion = require('../package.json').version
  
  if (appVersion !== newVersion) {
    console.log(`[Migration] App updated from ${appVersion} to ${newVersion}`)
    
    // Lưu version mới
    fs.writeFileSync(
      versionFile,
      JSON.stringify({
        previousVersion: appVersion,
        currentVersion: newVersion,
        updatedAt: new Date().toISOString()
      }, null, 2),
      'utf-8'
    )
    
    // Run migrations
    return await runMigrations()
  }
  
  return { success: true, migrated: false }
}
```

### 7.3 Migration Script Example

```javascript
// database/migrations/v2.js
export async function up(db) {
  // Tạo bảng mới
  await db.schema.createTable('new_feature_table', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.text('description')
    table.timestamp('created_at').defaultTo(db.fn.now())
  })
  
  // Thêm column vào bảng hiện tại
  await db.schema.table('existing_table', (table) => {
    table.string('new_column').defaultTo('default_value')
  })
  
  // Insert default data
  await db('system_config').insert({
    key: 'new_feature_enabled',
    value: 'true',
    created_at: db.fn.now()
  })
}

export async function down(db) {
  // Rollback nếu cần
  await db.schema.dropTableIfExists('new_feature_table')
  
  await db.schema.table('existing_table', (table) => {
    table.dropColumn('new_column')
  })
}
```

### 7.4 Tích Hợp Vào App Update

```javascript
// Trong background.js
import { checkAndRunMigrations } from './update/databaseMigration'

app.whenReady().then(async () => {
  createWindow()
  
  // Check for app updates
  checkForUpdates()
  
  // Run database migrations nếu cần
  const migrationResult = await checkAndRunMigrations()
  
  if (migrationResult.migrated) {
    dialog.showMessageBox({
      type: 'info',
      title: 'Cập nhật database',
      message: 'Database đã được cập nhật',
      detail: `Từ phiên bản ${migrationResult.fromVersion} lên ${migrationResult.toVersion}`,
      buttons: ['OK']
    })
  }
})
```

---

## 8. FAQ

### Q1: electron-updater có hoạt động với Vue 2 không?

**Có.** electron-updater hoạt động ở Electron main process level, không phụ thuộc vào framework renderer (Vue 2, Vue 3, React, etc.).

---

### Q2: Private repos có dùng được không?

**Có,** nhưng cần:
- GitHub Pro ($7/tháng) hoặc
- Personal Access Token với quyền repo
- Token phải được set trong `autoUpdater.setFeedURL()`

---

### Q3: App có update được khi đang chạy không?

**Có,** nhưng:
- Download update trong khi app chạy
- Install + restart khi user confirm
- Auto-restart có thể cấu hình

---

### Q4: Làm sao test update locally?

```javascript
// Trong development
if (process.env.DEBUG) {
  // Disable update check
  return
}

// Hoặc dùng local server
autoUpdater.setFeedURL({
  provider: 'generic',
  url: 'file://C:/path/to/updates'
})
```

---

### Q5: Bandwidth giới hạn bao nhiêu?

| Nền tảng | Giới hạn |
|----------|----------|
| GitHub | 500GB/tháng (free) |
| GitLab Packages | Tùy plan |
| S3 | Pay-as-you-go |

---

### Q6: Làm sao rollback nếu update lỗi?

```javascript
// Trong autoUpdater error handler
autoUpdater.on('error', (err) => {
  // 1. Log error
  log.error('Update error:', err)
  
  // 2. Thông báo user
  dialog.showMessageBox({
    type: 'error',
    title: 'Lỗi cập nhật',
    message: 'Cập nhật thất bại. App sẽ tiếp tục với phiên bản hiện tại.',
    buttons: ['OK']
  })
  
  // 3. Không restart, app tiếp tục hoạt động với version cũ
})

// Database rollback tự động trong migration script
```

---

### Q7: Incremental update là gì?

**Incremental update** (delta update) chỉ download phần thay đổi giữa 2 version.

```
Version 1.0.0: 150MB
      ↓
Version 1.0.1 (full): 150MB
      ↓
Version 1.0.1 (incremental): 5MB (chỉ thay đổi)
```

**Lợi ích:**
- Tiết kiệm bandwidth
- Nhanh hơn
- Trải nghiệm user tốt hơn

**electron-builder tự động:**
- Tạo `.blockmap` file
- electron-updater tự quyết định download gì
- Signature verification đảm bảo an toàn

---

### Q8: Có thể disable update cho một số user không?

**Có,** nhiều cách:

```javascript
// Cách 1: Dựa trên config
const updateEnabled = await getUpdateEnabledFromConfig()
if (!updateEnabled) return

// Cách 2: Dựa trên environment
if (process.env.DISABLE_AUTO_UPDATE) return

// Cách 3: Dựa trên command line flag
const argv = process.argv
if (argv.includes('--no-update')) return
```

---

### Q9: Khi nào nên update?

| Thời điểm | Mô tả |
|-----------|-------|
| **App startup** | Check và download tự động |
| **Periodic** | Mỗi 6 giờ / mỗi ngày |
| **Manual** | User click "Check for updates" |
| **Background** | Silent check, notify only |

**Recommendation:** Check khi app startup + periodic (mỗi 6h)

```javascript
// Check khi startup
app.whenReady().then(() => {
  checkForUpdates()
})

// Periodic check (mỗi 6 giờ)
setInterval(() => {
  checkForUpdates()
}, 6 * 60 * 60 * 1000)
```

---

### Q10: HTTPS có bắt buộc không?

**Có,** electron-updater yêu cầu HTTPS cho update channel.

**Lý do:**
- Bảo mật
- Tránh man-in-the-middle attack
- Signature verification

**Giải pháp cho development:**
- Dùng self-signed cert với flag `--allow-insecure-updates`
- Chỉ dùng cho test, KHÔNG production

---

## Tài Liệu Tham Khảo

### Official Documentation

- [electron-updater](https://www.electron.build/auto-update)
- [electron-builder](https://www.electron.build/)
- [electron-builder Configuration](https://www.electron.build/configuration/configuration)

### Related

- [electron-log](https://github.com/megahertz/electron-log)
- [GitHub Releases API](https://docs.github.com/en/rest/releases/releases)
- [GitLab CI/CD](https://docs.gitlab.com/ci/)

---

## Checklist Implement

```
□ Cài đặt electron-updater
□ Cấu hình vue.config.js với publish options
□ Thêm update code vào background.js
□ Tạo UI component cho update dialog
□ Cấu hình CI/CD (GitLab CI hoặc GitHub Actions)
□ Tạo release notes template
□ Test với staging environment
□ Deploy và production
□ Document cho end-users
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-16 | AI | Initial document |

---

**Document này sẽ được cập nhật khi có thay đổi.**
