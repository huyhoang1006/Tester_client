<template>
  <div class="version-manager">
    <el-card class="version-card">
      <div slot="header" class="version-header">
        <span>📦 Quản lý phiên bản</span>
        <el-button 
          type="primary" 
          size="small" 
          @click="checkForUpdates"
          :loading="checking"
        >
          Kiểm tra cập nhật
        </el-button>
      </div>
      
      <div class="version-info">
        <div class="version-item">
          <label>Phiên bản hiện tại:</label>
          <el-tag>{{ currentVersion || 'Đang tải...' }}</el-tag>
        </div>
        
        <div class="version-item">
          <label>Phiên bản mới nhất:</label>
          <el-tag 
            :type="needsUpdate ? (updateType === 'major' ? 'danger' : 'warning') : 'success'"
          >
            {{ latestVersion || 'Chưa kiểm tra' }}
            <span v-if="updateType" class="update-type">({{ updateType }})</span>
          </el-tag>
        </div>
        
        <div v-if="needsUpdate" class="update-available">
          <el-alert
            :title="`${updateType?.toUpperCase()} Update Available`"
            :type="updateType === 'major' ? 'error' : 'warning'"
            :description="`Version ${latestVersion} is ready to install. You're currently on ${currentVersion}.`"
            show-icon
            :closable="false"
          />
          
          <div class="update-actions">
            <el-button 
              type="success" 
              @click="downloadUpdate"
              :loading="downloading"
            >
              {{ downloading ? 'Đang tải...' : 'Tải cập nhật' }}
            </el-button>
            
            <el-button @click="showReleaseNotes">
              Xem chi tiết
            </el-button>
          </div>
        </div>
        
        <div v-else-if="!needsUpdate && latestVersion" class="up-to-date">
          <el-alert
            title="Ứng dụng đã cập nhật mới nhất"
            type="success"
            show-icon
            :closable="false"
          />
        </div>
        
        <div v-if="error" class="error-message">
          <el-alert
            title="Lỗi"
            :description="error"
            type="error"
            show-icon
            :closable="false"
          />
        </div>
      </div>
    </el-card>
    
    <!-- Release Notes Dialog -->
    <el-dialog
      title="Chi tiết phiên bản"
      :visible.sync="showNotesDialog"
      width="50%"
    >
      <div v-if="releaseNotes">
        <h3>Phiên bản {{ latestVersion }}</h3>
        <div v-html="releaseNotes"></div>
      </div>
      <div v-else>
        <p>Không có thông tin chi tiết cho phiên bản này.</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'VersionManager',
  data() {
    return {
      currentVersion: null,
      latestVersion: null,
      needsUpdate: false,
      updateType: null, // major, minor, patch
      checking: false,
      downloading: false,
      error: null,
      showNotesDialog: false,
      releaseNotes: ''
    }
  },
  mounted() {
    this.loadCurrentVersion()
    this.checkForUpdates()
    
    // Lắng nghe thông báo real-time từ enterprise system
    window.electronAPI.versionAPI.onUpdateAvailable((data) => {
      console.log('📦 Real-time update available:', data)
      
      this.currentVersion = data.currentVersion
      this.latestVersion = data.latestVersion
      this.needsUpdate = true
      this.updateType = data.updateType
      
      // Show notification based on update type
      const notificationType = data.updateType === 'major' ? 'warning' : 'info'
      this.showNotification(`${data.updateType?.toUpperCase()} Update Available`, data.message, notificationType)
    })
  },
  methods: {
    async loadCurrentVersion() {
      try {
        const result = await window.electronAPI.versionAPI.getAppVersion()
        if (result.success) {
          this.currentVersion = result.data
        }
      } catch (error) {
        console.error('Error loading current version:', error)
        this.error = 'Không thể tải phiên bản hiện tại'
      }
    },
    
    async checkForUpdates() {
      this.checking = true
      this.error = null
      
      try {
        const result = await window.electronAPI.versionAPI.checkVersionUpdate()
        if (result.success) {
          const data = result.data
          this.latestVersion = data.latestVersion
          this.needsUpdate = data.needsUpdate
          this.updateType = data.updateType
          
          if (data.needsUpdate) {
            this.showNotification(`${data.updateType?.toUpperCase()} Update Available`, `Version ${data.latestVersion} is available!`)
          }
        } else {
          this.error = result.message || 'Không thể kiểm tra cập nhật'
        }
      } catch (error) {
        console.error('Error checking updates:', error)
        this.error = 'Lỗi khi kiểm tra cập nhật'
      } finally {
        this.checking = false
      }
    },
    
    async downloadUpdate() {
      this.downloading = true
      
      try {
        // TODO: Implement actual download logic
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate download
        
        this.$message.success('Tải cập nhật thành công!')
        
        // Update version after successful download
        const versionNum = this.versionToNumber(this.latestVersion)
        await window.electronAPI.updateUserVersion(versionNum)
        this.currentVersion = this.latestVersion
        this.needsUpdate = false
        
      } catch (error) {
        console.error('Error downloading update:', error)
        this.$message.error('Tải cập nhật thất bại')
      } finally {
        this.downloading = false
      }
    },
    
    showReleaseNotes() {
      // TODO: Load actual release notes from GitLab
      this.releaseNotes = `
        <h4>Tính năng mới:</h4>
        <ul>
          <li>Thêm quản lý phiên bản tự động</li>
          <li>Cải thiện hiệu năng database</li>
          <li>Sửa lỗi kết nối</li>
        </ul>
        <h4>Sửa lỗi:</h4>
        <ul>
          <li>Fix crash khi mở file lớn</li>
          <li>Cải thiện UI/UX</li>
        </ul>
      `
      this.showNotesDialog = true
    },
    
    showNotification(message) {
      this.$notify({
        title: 'Thông báo',
        message,
        type: 'info',
        duration: 5000
      })
    },
    
    formatVersion(version) {
      if (!version) return '0.0.0'
      
      // Convert number back to version string
      if (typeof version === 'number') {
        const major = Math.floor(version / 1000)
        const minor = Math.floor((version % 1000) / 100)
        const patch = Math.floor((version % 100) / 10)
        return `${major}.${minor}.${patch}`
      }
      
      return version.toString()
    },
    
    versionToNumber(version) {
      const parts = version.split('.').map(p => parseInt(p) || 0)
      return (parts[0] * 1000) + (parts[1] * 100) + (parts[2] * 10)
    }
  }
}
</script>

<style scoped>
.version-manager {
  padding: 20px;
}

.version-card {
  max-width: 600px;
  margin: 0 auto;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-item label {
  font-weight: bold;
  color: #606266;
}

.update-available {
  margin-top: 15px;
}

.update-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.up-to-date {
  margin-top: 15px;
}

.error-message {
  margin-top: 15px;
}

.update-type {
  margin-left: 5px;
  font-size: 12px;
  opacity: 0.8;
}
</style>
