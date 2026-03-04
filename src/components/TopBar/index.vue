<template>
    <div>
        <div id="top-windows" :class="{ 'logged-in': user, 'not-logged-in': !user }">
            <div class="left-bar">
                <div class="logo-wrapper" @click="$router.push({ name: 'home' }).catch(() => { })">
                    <img class="topbar-logo" src="@/assets/images/atdigitaltester_logo.png" draggable="false" />
                </div>
            </div>

            <div class="center-bar">
                <div v-if="user" class="search-wrapper" :class="{ collapsed: isSearchCollapsed }">
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input v-if="!isSearchCollapsed" class="topbar-search" type="text" placeholder="Search...">
                </div>
            </div>

            <div class="right-bar">
                <el-tooltip v-if="user" content="Notifications" placement="bottom" trigger="hover"
                    :append-to-body="true">
                    <div class="dropdown-trigger-wrapper" style="-webkit-app-region: no-drag;"
                        @click.stop="handleNotificationDropdown">
                        <el-dropdown ref="notificationDropdown" trigger="click" placement="bottom-end"
                            :hide-on-click="false">
                            <div class="topbar-btn notification-btn">
                                <i style="font-size: 15px; color: white;" class="fas fa-bell"></i>
                                <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
                            </div>
                            <el-dropdown-menu slot="dropdown" class="notification-dropdown-menu">
                                <div class="notification-header">
                                    <span class="notification-title">Notifications</span>
                                    <div class="notification-header-actions">
                                        <el-button type="text" size="mini" @click.stop="loadNotifications"
                                            title="Refresh Notifications">
                                            <i class="fas fa-sync-alt" :class="{ 'fa-spin': isReloading }"></i>
                                        </el-button>
                                    </div>
                                </div>
                                <div class="notification-list">
                                    <div v-for="notification in displayedNotifications" :key="notification.mrid"
                                        class="notification-item"
                                        :class="{ 'unread': notification.status === 'unread' }">
                                        <div class="notification-content"
                                            @click.stop="openNotificationDetail(notification)">
                                            <div class="notification-icon">
                                                <i :class="notification.icon"></i>
                                            </div>
                                            <div class="notification-text">
                                                <div class="notification-message">{{ notification.message }}</div>
                                                <div class="notification-time">{{ notification.name }}</div>
                                            </div>
                                        </div>
                                        <el-dropdown trigger="click" placement="bottom-end" :append-to-body="false">
                                            <div class="notification-menu-btn" @click.stop>
                                                <i class="fas fa-ellipsis-v"></i>
                                            </div>
                                            <el-dropdown-menu slot="dropdown" class="notification-action-menu">
                                                <el-dropdown-item @click.native.stop="loadMoreNotifications">
                                                    <i class="fas fa-plus-circle"></i>
                                                    Show More Notifications
                                                </el-dropdown-item>
                                                <el-dropdown-item @click.native.stop="markAsRead(notification.mrid)">
                                                    <i class="fas fa-check"></i>
                                                    Mark as Read
                                                </el-dropdown-item>
                                                <el-dropdown-item
                                                    @click.native.stop="deleteNotification(notification.mrid)">
                                                    <i class="fas fa-trash"></i>
                                                    Delete Notification
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    </div>
                                </div>
                                <div class="notification-footer">
                                    <span class="notification-pagination">Page {{ currentPage }}/{{ totalPages }}</span>
                                    <div class="notification-footer-actions">
                                        <el-button v-if="currentPage < totalPages" size="mini" type="text"
                                            @click.stop="nextPage">
                                            Next Page
                                        </el-button>
                                        <el-button v-if="currentPage > 1" size="mini" type="text"
                                            @click.stop="prevPage">
                                            Previous Page
                                        </el-button>
                                    </div>
                                </div>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </div>
                </el-tooltip>

                <el-tooltip content="Settings" placement="bottom">
                    <div @click.stop="handleDropdown" class="dropdown-trigger-wrapper">
                        <el-dropdown ref="dropdown" @command="handleCommand" trigger="click" placement="bottom-end">
                            <div class="topbar-btn">
                                <i style="font-size: 15px; color: white;" class="fas fa-cog"></i>
                            </div>
                            <el-dropdown-menu slot="dropdown" class="dropdown-menu">
                                <template v-if="user">
                                    <el-dropdown-item command="check_update">
                                        <i class="fas fa-sync-alt"></i>
                                        Check for update
                                    </el-dropdown-item>
                                    <el-dropdown-item command="config">
                                        <i class="fas fa-wrench"></i>
                                        Config server address
                                    </el-dropdown-item>
                                    <el-divider></el-divider>
                                    <el-dropdown-item command="manage_user">
                                        <i class="fas fa-user-cog"></i>
                                        User management
                                    </el-dropdown-item>
                                    <el-dropdown-item command="update_password">
                                        <i class="fas fa-key"></i>
                                        Change password
                                    </el-dropdown-item>
                                    <el-divider></el-divider>
                                    <el-dropdown-item command="log_out" class="danger-item">
                                        <i class="fas fa-sign-out-alt"></i>
                                        Log out
                                    </el-dropdown-item>
                                </template>
                                <template v-else>
                                    <el-dropdown-item command="check_update">
                                        <i class="fas fa-sync-alt"></i>
                                        Check for update
                                    </el-dropdown-item>
                                    <el-dropdown-item command="config">
                                        <i class="fas fa-wrench"></i>
                                        Config server address
                                    </el-dropdown-item>
                                </template>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </div>
                </el-tooltip>

                <el-tooltip content="Minimize" placement="bottom">
                    <div @click="minimizeApp" class="topbar-btn">
                        <i style="font-size: 15px; color: white;" class="fas fa-minus"></i>
                    </div>
                </el-tooltip>

                <el-tooltip content="Maximize" placement="bottom">
                    <div @click="maximizeApp" class="topbar-btn">
                        <i style="font-size: 15px; color: white;" v-if="isMaximized" class="far fa-window-restore"></i>
                        <i style="font-size: 15px; color: white;" v-else class="far fa-window-maximize"></i>
                    </div>
                </el-tooltip>

                <el-tooltip content="Close" placement="bottom">
                    <div @click="closeApp" class="close-icon">
                        <i style="font-size: 18px; color: white;" class="fas fa-times"></i>
                    </div>
                </el-tooltip>
            </div>
        </div>

        <!-- Server address -->
        <el-dialog custom-class="app-dialog" title="Config server address" :visible.sync="dialogConfig" :modal="true"
            append-to-body>
            <el-form :model="formConfig" :label-width="formLabelWidth" :label-position="'left'" size="small"
                :rules="configRules" ref="formConfig">
                <el-form-item label="Domain" prop="domain">
                    <el-input type="text" v-model="formConfig.domain" placeholder="https://domain.com/api/"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" @click="dialogConfig = false">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="setServerAddr">Save</el-button>
            </span>
        </el-dialog>

        <!-- Update Dialog -->
        <el-dialog custom-class="app-dialog" title="New Version Available" :visible.sync="dialogUpdate" :modal="true"
            append-to-body>
            <div class="update-wrapper">
                <div class="update-top-section">
                    <div class="version-info">
                        <div class="info-label">New version: </div>
                        <div class="version-number">v{{ updateInfo.version }}</div>
                        <div v-if="updateInfo.releasedAt" class="release-date">
                            Released: {{ formatReleaseDate(updateInfo.releasedAt) }}
                        </div>
                    </div>
                    <div class="app-logo-mini">
                        <img src="@/assets/images/atenergy_key_light.png" alt="" />
                    </div>
                </div>
                <div class="changelog">
                    <div class="changelog-title">What's new:</div>
                    <div class="changelog-body" v-html="formatReleaseNotes(updateInfo.releaseNotes)">
                    </div>
                </div>
            </div>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" @click="dialogUpdate = false">
                    Not now
                </el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="handleUpdate">
                    <i class="fas fa-download"></i>
                    Download Update
                </el-button>
            </span>
        </el-dialog>

        <!-- Notification Detail Dialog -->
        <el-dialog custom-class="app-dialog" title="Notifications Details" :visible.sync="dialogNotificationDetail"
            :modal="true" append-to-body width="500px">
            <div v-if="selectedNotification" class="notification-detail">
                <div class="notification-detail-header">
                    <div class="notification-detail-icon">
                        <i :class="getNotificationIcon(selectedNotification.type)"></i>
                    </div>
                    <div class="notification-detail-title">
                        <h3>{{ selectedNotification.name }}</h3>
                        <!-- <span class="notification-detail-status" :class="selectedNotification.status">
                            {{ selectedNotification.status === 'read' ? 'Read' : 'Unread' }}
                        </span> -->
                    </div>
                </div>
                <div class="notification-detail-body">
                    <p>{{ selectedNotification.message }}</p>
                </div>
                <div class="notification-detail-meta">
                    <div class="notification-detail-type">
                        <strong>Type:</strong> {{ selectedNotification.type }}
                    </div>
                    <!-- <div class="notification-detail-time" v-if="selectedNotification.created_at">
                        <strong>Time:</strong> {{ formatDateTime(selectedNotification.created_at) }}
                    </div> -->
                </div>
            </div>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" @click="dialogNotificationDetail = false">
                    Close
                </el-button>
                <el-button class="footer-btn" size="small" type="danger" @click="deleteNotification(selectedNotification.mrid)">
                    <i class="fas fa-trash"></i> Delete
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
// eslint-disable-next-line
/* eslint-disable */
import { mapState } from 'vuex'
import * as userApi from '@/api/user'

export default {
    name: 'TopBar',
    data() {
        return {
            dialogChangePw: false,
            dialogConfig: false,
            loading: false,
            formChangePass: {
                oldPassword: '',
                newPassword: ''
            },
            formConfig: {
                domain: ''
            },
            formLabelWidth: '120px',
            configRules: {
                domain: [
                    {
                        required: true,
                        pattern: /^https?:\/\//,
                        message: 'Invalid domain',
                        trigger: 'change'
                    }
                ]
            },
            isSearchCollapsed: false,
            isMaximized: false,
            dialogUpdate: false,
            updateInfo: {
                version: '',
                releaseNotes: '',
                releasedAt: null
            },
            notificationLimit: 10,
            currentPage: 1,
            itemsPerPage: 10,
            notifications: [],
            isReloading: false,
            dialogNotificationDetail: false,
            selectedNotification: null
        }
    },
    mounted() {
        this.formConfig.domain = this.serverAddr

        if (window.electronAPI && window.electronAPI.onWindowStateChange) {
            window.electronAPI.onWindowStateChange((isMax) => {
                this.isMaximized = isMax;
            })
        }

        // Load notifications from database
        this.loadNotifications()
        // this.updateSearchState()
        // window.addEventListener('resize', this.updateSearchState)
    },
    // beforeDestroy() {
    //     window.removeEventListener('resize', this.updateSearchState)
    // },
    computed: {
        ...mapState(['user', 'serverAddr']),
        unreadCount() {
            return this.notifications.filter(n => n.status === 'unread').length
        },
        displayedNotifications() {
            const visibleNotifications = this.notifications
            const startIndex = (this.currentPage - 1) * this.itemsPerPage

            // Nếu trang 1 đã hiển thị 15, thì trang 2 bắt đầu từ index 15
            const actualStartIndex = this.currentPage === 1 ? 0 :
                (this.currentPage === 2 && this.notificationLimit > this.itemsPerPage) ? this.notificationLimit : startIndex

            const itemsToShow = this.currentPage === 1 ? this.notificationLimit : this.itemsPerPage

            return visibleNotifications.slice(actualStartIndex, actualStartIndex + itemsToShow)
        },
        totalPages() {
            const visibleCount = this.notifications.length
            // Nếu trang 1 hiển thị 15, tổng số trang phải tính lại
            const page1Items = this.notificationLimit
            const remainingItems = visibleCount - page1Items
            return remainingItems > 0 ? 2 : 1
        },
        canLoadMore() {
            const visibleNotifications = this.notifications
            const maxForCurrentPage = this.itemsPerPage + 5 // 10 + 5 = 15 max
            return this.currentPage === 1 &&
                this.notificationLimit < maxForCurrentPage &&
                this.notificationLimit < visibleNotifications.length
        }
    },
    methods: {
        // updateSearchState() {
        //     const topbar = document.getElementById('top-windows')
        //     if (!topbar) return
        //     this.isSearchCollapsed = topbar.offsetWidth < 900
        // },
        closeApp() {
            window.electronAPI.closeApp()
        },
        minimizeApp() {
            window.electronAPI.minimizeApp()
        },
        maximizeApp() {
            window.electronAPI.maximizeApp()
        },
        handleCommand(command) {
            switch (command) {
                case 'log_out':
                    this.$helper.afterLogout()
                    this.$router.push({ path: '/login' })
                    break
                case 'update_password':
                    this.dialogChangePw = true
                    break
                case 'manage_user':
                    this.$router.push({ path: '/manage-user' })
                    break
                case 'config':
                    this.dialogConfig = true
                    break
                case 'check_update':
                    this.checkForUpdate()
                    break
            }
        },
        checkForUpdate() {
            const loadingMessage = this.$message({
                type: 'info',
                message: "Checking for new version...",
                duration: 0,
                showClose: false
            })

            window.electronAPI.checkForUpdate()
                .then((result) => {
                    loadingMessage.close()
                    
                    if (!result.success) {
                        this.$message.error('Failed to check for updates: ' + result.error)
                        return
                    }

                    if (result.needsUpdate) {
                        this.updateInfo = {
                            version: result.latestVersion,
                            releaseNotes: result.releaseNotes || 'No release notes available',
                            releasedAt: result.releasedAt
                        }
                        this.dialogUpdate = true
                    } else {
                        this.$message.success('You are using the latest version: v' + result.currentVersion)
                    }
                })
                .catch((error) => {
                    loadingMessage.close()
                    console.error('Check for update error:', error)
                    this.$message.error('Failed to check for updates')
                })
        },
        handleUpdate() {
            this.dialogUpdate = false
            
            const loadingMessage = this.$message({
                type: 'info',
                message: 'Opening download page...',
                duration: 0,
                showClose: false
            })

            window.electronAPI.performUpdate()
                .then((result) => {
                    loadingMessage.close()
                    
                    if (result.success) {
                        if (result.manual) {
                            this.$message({
                                type: 'info',
                                message: 'Please download and install the latest version from the opened page.',
                                duration: 5000
                            })
                        } else {
                            this.$message({
                                type: 'success',
                                message: 'Download started! Please install the new version after download completes.',
                                duration: 5000
                            })
                        }
                    } else {
                        this.$message.error('Update failed: ' + result.message)
                    }
                })
                .catch((error) => {
                    loadingMessage.close()
                    console.error('Update error:', error)
                    this.$message.error('Update failed')
                })
        },
        async changePass() {
            this.loading = true
            await this.$common.simulateLoading()

            userApi
                .changePass(this.formChangePass)
                .then(() => {
                    this.$message.success('Changed password successfully')
                    this.dialogChangePw = false
                    this.formChangePass = {
                        oldPassword: '',
                        newPassword: ''
                    }
                })
                .catch((error) => {
                    console.log(error)
                    this.$message.error(error.message)
                })
        },
        setServerAddr() {
            this.$refs.formConfig.validate((valid) => {
                if (valid) {
                    this.$helper.setServerAddr(this.formConfig.domain)
                    this.dialogConfig = false
                    this.$message.success('Config successfully')
                    return
                }
            })
        },
        handleNotificationDropdown() {
            if (this.$refs.notificationDropdown) {
                this.$refs.notificationDropdown.handleClick();
            }
        },
        handleDropdown() {
            this.$refs.dropdown.handleClick();
        },
        async loadNotifications() {
            this.isReloading = true
            try {
                const response = await window.electronAPI.getAllNotifications()
                if (response.success) {
                    this.notifications = response.data.map(n => ({
                        mrid: n.mrid,
                        name: n.name,
                        message: n.message,
                        type: n.type,
                        status: n.status || 'unread',
                        created_at: n.created_at,
                        icon: this.getIconByType(n.type)
                    }))
                    // this.$message.success('Loaded notifications successfully')
                }
            } catch (error) {
                console.error('Error loading notifications:', error)
                this.$message.error('Failed to load notifications')
            } finally {
                this.isReloading = false
            }
        },
        openNotificationDetail(notification) {
            this.selectedNotification = notification
            this.dialogNotificationDetail = true
            if (notification.status !== 'read') {
                this.markAsRead(notification.mrid)
            }
        },
        getIconByType(type) {
            const iconMap = {
                'success': 'fas fa-check-circle',
                'info': 'fas fa-info-circle',
                'warning': 'fas fa-exclamation-triangle',
                'error': 'fas fa-times-circle',
                'update': 'fas fa-download',
                'maintenance': 'fas fa-wrench',
                'user': 'fas fa-user-plus',
                'test': 'fas fa-clipboard-check',
                'backup': 'fas fa-database',
                'calendar': 'fas fa-calendar-alt',
                'report': 'fas fa-file-alt'
            }
            return iconMap[type] || 'fas fa-bell'
        },
        getNotificationIcon(type) {
            return this.getIconByType(type)
        },
        formatDateTime(dateStr) {
            if (!dateStr) return ''
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) return dateStr
            return date.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        },
        async markAsRead(notificationId) {
            try {
                const response = await window.electronAPI.markNotificationAsRead(notificationId)
                if (response.success) {
                    const notification = this.notifications.find(n => n.mrid === notificationId)
                    if (notification) {
                        notification.status = 'read'
                    }
                }
            } catch (error) {
                console.error('Error marking notification as read:', error)
            }
        },
        async hideNotification(notificationId) {
            try {
                const response = await window.electronAPI.hideNotification(notificationId)
                if (response.success) {
                    const notification = this.notifications.find(n => n.mrid === notificationId)
                    if (notification) {
                        notification.status = 'hidden'
                    }
                    this.$message.success('Notifications have been hidden.')
                }
            } catch (error) {
                console.error('Error hiding notification:', error)
                this.$message.error('Notifications cannot be hidden.')
            }
        },
        async deleteNotification(notificationId) {
            try {
                const response = await window.electronAPI.deleteNotification(notificationId)
                if (response.success) {
                    const index = this.notifications.findIndex(n => n.mrid === notificationId)
                    if (index !== -1) {
                        this.notifications.splice(index, 1)
                    }
                    this.$message.success('Notification has been deleted.')
                }
            } catch (error) {
                console.error('Error deleting notification:', error)
                this.$message.error('Unable to delete notification')
            }
        },
        handleNotificationAction(command) {
            const { action, mrid } = command
            const notification = this.notifications.find(n => n.mrid === mrid)

            if (!notification) return

            switch (action) {
                case 'show_more':
                    this.loadMoreNotifications()
                    break
                case 'hide':
                    notification.status = 'hidden'
                    this.$message.success('Notifications have been hidden.')
                    break
                case 'delete':
                    const index = this.notifications.findIndex(n => n.mrid === mrid)
                    if (index !== -1) {
                        this.notifications.splice(index, 1)
                        this.$message.success('Notification has been deleted.')
                    }
                    break
            }
        },
        loadMoreNotifications() {
            this.notificationLimit += 5
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++
                // Không reset notificationLimit, giữ nguyên để tính toán đúng
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--
                // Không reset notificationLimit
            }
        },
        formatReleaseDate(dateStr) {
            if (!dateStr) return ''
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) return dateStr
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        },
        formatReleaseNotes(notes) {
            if (!notes) return 'No release notes available'
            
            // Convert markdown-style lists to HTML
            let formatted = notes
                .replace(/^- (.+)$/gm, '<li>$1</li>')
                .replace(/^\* (.+)$/gm, '<li>$1</li>')
                .replace(/^• (.+)$/gm, '<li>$1</li>')
            
            // Wrap lists in ul tags
            if (formatted.includes('<li>')) {
                formatted = '<ul>' + formatted + '</ul>'
            }
            
            // Convert line breaks to <br>
            formatted = formatted.replace(/\n/g, '<br>')
            
            return formatted
        }
    }
}
</script>

<style lang="scss" scoped>
* {
    box-sizing: border-box;
}

#top-windows {
    position: relative;
    height: 48px;
    width: 100%;
    display: flex;
    align-items: center;
    -webkit-app-region: drag;
}

#top-windows.not-logged-in {
    background-color: transparent;
    box-shadow: none;
    border-bottom: none;
}

#top-windows.logged-in {
    background: linear-gradient(0deg, #012596 0%, #0f3d80 100%);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.left-bar {
    display: flex;
    align-items: center;
    height: 100%;
    z-index: 2;
    padding-left: 10px;
}

.logo-wrapper {
    height: 100%;
    display: flex;
    align-items: center;
    // -webkit-app-region: no-drag;
}

.topbar-logo {
    height: 20px;
    user-select: none;
    -webkit-user-drag: none;
    pointer-events: none;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.center-bar {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    -webkit-app-region: no-drag;
}

.search-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 32px;
    width: 380px;
    padding: 0 14px;
    border-radius: 12px;

    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);

    transition: all 0.2s ease;

    .search-icon {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
    }

    .topbar-search {
        flex: 1;
        min-width: 0;
        height: 100%;
        border: none;
        outline: none;
        background: transparent;
        font-size: 13px;
        color: #ffffff;
        font-weight: 500;

        &::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }
    }
}

.search-wrapper:focus-within {
    background: rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

.search-wrapper:focus-within .search-icon {
    color: #fff;
}

.right-bar {
    display: flex;
    align-items: center;
    height: 100%;
    z-index: 2;
    -webkit-app-region: no-drag;
    margin-left: auto;
}

.right-bar>div {
    width: 48px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.right-bar>div:hover {
    background-color: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(5px);
}

.close-icon:hover {
    background-color: red !important;
}

.notification-btn {
    position: relative;
}

.notification-badge {
    position: absolute;
    top: 5px;
    left: 8px;
    background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
    color: white;
    font-size: 10px;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    box-shadow: 0 2px 6px rgba(255, 0, 0, 0.4);
    border: 2px solid rgba(1, 37, 150, 0.8);
}

::v-deep(.app-dialog) {
    box-sizing: border-box;
}

::v-deep(.app-dialog.el-dialog) {
    max-width: 600px;
    width: 90%;
    margin-top: 12vh !important;
    border-radius: 16px;
    height: auto !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.3) !important;
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.25) !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3),
        0 10px 20px rgba(0, 0, 0, 0.15),
        inset 0 1px 1px rgba(255, 255, 255, 0.4);
    font-family: "Segoe UI", sans-serif;
}

::v-deep(.app-dialog .el-dialog__header) {
    padding: 20px 25px;
}

::v-deep(.app-dialog .el-dialog__title) {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff !important;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}

::v-deep(.app-dialog .el-dialog__headerbtn) {
    top: 15px;
    right: 15px;
    padding: 8px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.15);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

}

::v-deep(.app-dialog .el-dialog__headerbtn .el-dialog__close) {
    color: rgba(255, 255, 255, 0.8) !important;
    font-size: 18px;
    font-weight: bold;
    transition: all 0.2s ease;
}

::v-deep(.app-dialog .el-dialog__headerbtn:hover) {
    background: rgba(255, 255, 255, 0.25);
}

::v-deep(.app-dialog .el-dialog__headerbtn:hover .el-dialog__close) {
    color: #ffffff !important;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
}

::v-deep(.app-dialog .el-dialog__headerbtn i) {
    line-height: 1;
    vertical-align: middle;
}

::v-deep(.app-dialog .el-dialog__body) {
    padding: 10px 25px;
    color: #ffffff;
}

::v-deep(.app-dialog .el-form-item__label) {
    color: rgba(255, 255, 255, 0.95) !important;
    font-size: 13px;
    font-weight: 600;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    margin-bottom: 6px !important;
}

::v-deep(.app-dialog .el-input__inner) {
    width: 100%;
    padding: 12px 14px !important;
    background: rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.25) !important;
    border-radius: 8px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8) !important;
    transition: all 0.2s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15),
        inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

::v-deep(.app-dialog .el-input__inner:focus) {
    background: rgba(0, 0, 0, 0.5) !important;
    color: #ffffff !important;
    border: 2px solid rgba(255, 255, 255, 0.85) !important;
}

::v-deep(.app-dialog .el-dialog__footer) {
    padding: 20px 25px;
    border-top: none !important;
}

::v-deep(.custom-footer) {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

::v-deep(.custom-footer .footer-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 35px;
    min-width: 100px;
    padding: 10px 18px !important;
    border: none !important;
    border-radius: 8px !important;
    font-size: 12px;
    font-weight: 600;
    line-height: normal !important;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
}

::v-deep(.custom-footer .footer-btn.el-button--default) {
    background: rgba(255, 255, 255, 0.1) !important;
    color: #ffffff !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
}

::v-deep(.custom-footer .footer-btn.el-button--default:hover) {
    background: rgba(255, 255, 255, 0.2) !important;
    border: 1px solid rgba(255, 255, 255, 0.5) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

::v-deep(.custom-footer .footer-btn.el-button--primary) {
    background: linear-gradient(180deg, #1e5bb8 0%, #0f3d80 100%) !important;
    color: #ffffff !important;
    box-shadow: 0 4px 12px rgba(30, 91, 184, 0.4),
        0 2px 6px rgba(0, 0, 0, 0.2) !important;
}

::v-deep(.custom-footer .footer-btn.el-button--primary:hover) {
    background: linear-gradient(180deg, #2869cc 0%, #1e5bb8 100%) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(30, 91, 184, 0.5),
        0 4px 10px rgba(0, 0, 0, 0.25) !important;
}

::v-deep(.custom-footer .footer-btn.el-button--danger) {
    background: linear-gradient(180deg, #e61525 0%, #cc0514 100%) !important;
    color: #ffffff !important;
    box-shadow: 0 4px 12px rgba(204, 5, 20, 0.4),
        0 2px 6px rgba(0, 0, 0, 0.2) !important;
}

::v-deep(.custom-footer .footer-btn.el-button--danger:hover) {
    background: linear-gradient(180deg, #ff1a2e 0%, #e61525 100%) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(204, 5, 20, 0.5),
        0 4px 10px rgba(0, 0, 0, 0.25) !important;
}

::v-deep(.custom-footer .footer-btn:active) {
    transform: translateY(0);
    filter: brightness(0.9);
}

::v-deep(.custom-footer .footer-btn i) {
    font-size: 14px;
    color: inherit;
}

.update-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
    color: #ffffff;
}

.update-top-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
}

.version-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.version-number {
    font-size: 24px;
    font-weight: 800;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.release-date {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.app-logo-mini img {
    height: 50px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.changelog {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.changelog-title {
    font-size: 14px;
    font-weight: 600;
    margin-left: 10px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.changelog-body {
    height: 200px;
    overflow-y: auto;
    padding: 12px 20px;
    background: rgba(0, 0, 0, 0.2) !important;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15),
        inset 0 1px 1px rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    font-size: 13.5px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.8);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    white-space: pre-line;
}

.changelog-body::v-deep ul {
    margin: 0;
    padding-left: 20px;
    list-style-type: disc;
}

.changelog-body::v-deep li {
    margin: 6px 0;
    color: rgba(255, 255, 255, 0.85);
}

.changelog-body::v-deep br {
    display: block;
    content: "";
    margin: 4px 0;
}

.changelog-body::-webkit-scrollbar {
    display: none;
    width: 0 !important;
}

@media (max-width: 767px) {
    ::v-deep(.custom-footer) {
        justify-content: center;
    }
}
</style>

<style lang="scss">
.dropdown-menu.el-dropdown-menu {
    z-index: 3000 !important;
    margin-top: 12px !important;
    padding: 6px !important;
    background: rgba(20, 20, 20, 0.5) !important;
    backdrop-filter: blur(6px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(10px) saturate(180%) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3) !important;
    font-family: 'Segoe UI', sans-serif;
    -webkit-app-region: no-drag;
    min-width: 180px;
}

.dropdown-menu.el-dropdown-menu .popper__arrow {
    display: none !important;
}

.dropdown-menu.el-dropdown-menu .el-dropdown-menu__item {
    font-size: 13px;
    font-weight: 400;
    color: #ffffff !important;
    display: flex;
    align-items: center;
    gap: 12px;
    line-height: 30px !important;
    padding: 2px 14px !important;
    margin: 0 !important;
    border-radius: 8px;
    background: transparent;
    transition: background 0.2s ease;
    text-shadow: none !important;
}

.dropdown-menu.el-dropdown-menu .el-dropdown-menu__item i {
    width: 16px;
    text-align: center;
    font-size: 13px;
    color: #ffffff;
}

.dropdown-menu.el-dropdown-menu .el-dropdown-menu__item:hover {
    background: rgba(255, 255, 255, 0.2) !important;
    color: #ffffff !important;
}


.dropdown-menu.el-dropdown-menu .el-divider--horizontal {
    margin: 3px 6px !important;
    background: rgba(255, 255, 255, 0.2) !important;
    height: 1px !important;
    width: auto !important;
}

.dropdown-menu.el-dropdown-menu .danger-item {
    background: linear-gradient(180deg, #e61525 0%, #cc0514 100%) !important;
    color: #ffffff !important;
    font-weight: 600;
    margin: 6px 0 0 0 !important;
    padding: 10px 14px !important;
    border: none !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(204, 5, 20, 0.4),
        0 2px 6px rgba(0, 0, 0, 0.2) !important;
    line-height: normal !important;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.2s ease;
    cursor: pointer;
}

.dropdown-menu.el-dropdown-menu .danger-item i {
    color: #ffffff !important;
    font-size: 14px;
}

.dropdown-menu.el-dropdown-menu .danger-item:hover {
    background: linear-gradient(180deg, #ff1a2e 0%, #e61525 100%) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(204, 5, 20, 0.5),
        0 4px 10px rgba(0, 0, 0, 0.25) !important;
    color: #ffffff !important;
}

.dropdown-menu.el-dropdown-menu .danger-item:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(204, 5, 20, 0.4) !important;
}

.notification-dropdown-menu.el-dropdown-menu {
    z-index: 3000 !important;
    margin-top: 12px !important;
    padding: 0 !important;
    background: rgba(20, 20, 20, 0.5) !important;
    backdrop-filter: blur(6px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(10px) saturate(180%) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3) !important;
    font-family: 'Segoe UI', sans-serif;
    -webkit-app-region: no-drag;
    width: 380px;
    max-height: 600px;
    overflow: hidden;
    position: relative;
}

.notification-dropdown-menu.el-dropdown-menu .popper__arrow {
    display: none !important;
}

.notification-header {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.notification-title {
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
}

.notification-count {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
}

.notification-header-actions {
    display: flex;
    gap: 8px;
}

.notification-header-actions .el-button {
    color: rgba(255, 255, 255, 0.7);
    padding: 4px 8px;
}

.notification-header-actions .el-button:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
}

.notification-header-actions .fa-spin {
    animation: fa-spin 1s linear infinite;
}

@keyframes fa-spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.notification-list {
    max-height: 480px;
    overflow-y: auto;
    position: relative;
}

.notification-list::-webkit-scrollbar {
    width: 6px;
}

.notification-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}

.notification-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    transition: background 0.2s ease;
    gap: 8px;
}

.notification-item:hover {
    background: rgba(255, 255, 255, 0.08);
}

.notification-item.unread {
    background: rgba(30, 91, 184, 0.15);
}

.notification-item.unread .notification-message {
    font-weight: 600;
}

.notification-item.unread .notification-text {
    color: #ffffff;
}

.notification-item.unread:hover {
    background: rgba(30, 91, 184, 0.25);
}

.notification-item:not(.unread) {
    opacity: 0.7;
}

.notification-item:not(.unread):hover {
    opacity: 1;
}

.notification-content {
    flex: 1;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
}

.notification-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(30, 91, 184, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.notification-icon i {
    font-size: 16px;
    color: #ffffff;
}

.notification-text {
    flex: 1;
    min-width: 0;
}

.notification-message {
    font-size: 13px;
    font-weight: 500;
    color: #ffffff;
    line-height: 1.4;
    margin-bottom: 4px;
}

.notification-time {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
}

.notification-menu-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s ease;
    flex-shrink: 0;
}

.notification-menu-btn:hover {
    background: rgba(255, 255, 255, 0.15);
}

.notification-menu-btn i {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
}

.notification-footer {
    padding: 12px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.notification-pagination {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
}

.notification-footer-actions {
    display: flex;
    gap: 8px;
}

.notification-footer .el-button--text {
    color: #ffffff !important;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 8px !important;
}

.notification-footer .el-button--text:hover {
    color: rgba(255, 255, 255, 0.8) !important;
}

.notification-action-menu.el-dropdown-menu {
    z-index: 3001 !important;
    margin-top: 4px !important;
    padding: 6px !important;
    background: rgba(20, 20, 20, 0.5) !important;
    backdrop-filter: blur(6px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(10px) saturate(180%) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 8px !important;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3) !important;
    min-width: 160px;
}

.notification-action-menu.el-dropdown-menu .popper__arrow {
    display: none !important;
}

.notification-action-menu.el-dropdown-menu .el-dropdown-menu__item {
    font-size: 12px;
    font-weight: 540;
    color: #ffffff !important;
    display: flex;
    align-items: center;
    gap: 10px;
    line-height: 28px !important;
    padding: 2px 12px !important;
    margin: 0 !important;
    border-radius: 6px;
    background: transparent;
    transition: background 0.2s ease;
}

.notification-action-menu.el-dropdown-menu .el-dropdown-menu__item i {
    width: 14px;
    text-align: center;
    font-size: 12px;
    color: #ffffff;
}

.notification-action-menu.el-dropdown-menu .el-dropdown-menu__item:hover {
    background: rgba(255, 255, 255, 0.2) !important;
    color: #ffffff !important;
}

.notification-detail {
    color: #ffffff;
}

.notification-detail-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.notification-detail-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(30, 91, 184, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.notification-detail-icon i {
    font-size: 24px;
    color: #ffffff;
}

.notification-detail-title {
    flex: 1;
}

.notification-detail-title h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
}

.notification-detail-status {
    font-size: 12px;
    font-weight: bold;
    padding: 2px 8px;
    border-radius: 4px;
}

.notification-detail-status.read {
    background: rgba(31, 168, 65, 0.582);
    color: #ffffff;
}

.notification-detail-status.unread {
    background: rgba(255, 152, 0, 0.2);
    color: #ffb74d;
}

.notification-detail-body {
    margin-bottom: 16px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    line-height: 1.6;
}

.notification-detail-body p {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
}

.notification-detail-type {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
}

.notification-detail-meta {
    display: flex;
    gap: 20px;
    margin-top: 12px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
}

.notification-detail-time {
    color: rgba(255, 255, 255, 0.6);
}

.topbar-btn {
    -webkit-app-region: no-drag;
}

.right-bar {
    -webkit-app-region: no-drag;
}
</style>