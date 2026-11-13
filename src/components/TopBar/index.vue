<template>
    <div>
        <div id="top-windows" :class="{ 'logged-in': user, 'not-logged-in': !user }">
            <div class="left-bar">
                <div class="logo-wrapper" @click="$router.push({ name: 'home' }).catch(() => { })">
                    <img class="topbar-logo" src="@/assets/images/atdigitaltester_logo.png" draggable="false" />
                </div>
            </div>

            <div class="center-bar">
                <!-- <div v-if="user" class="search-wrapper" :class="{ collapsed: isSearchCollapsed }">
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input v-if="!isSearchCollapsed" class="topbar-search" type="text" placeholder="Searching...">
                </div> -->
            </div>

            <div class="right-bar">
                <section v-if="user" class="sync-counters" aria-label="Synchronization status">
                    <el-tooltip :content="pendingUploadTooltip" :disabled="dialogPendingUploads" placement="bottom">
                        <button type="button" class="sync-counter sync-counter-upload"
                            :aria-label="pendingUploadTooltip" @click="dialogPendingUploads = true">
                            <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
                            <span class="sync-counter-label">Pending Upload</span>
                            <strong class="sync-counter-value">{{ pendingUploadCount === null ? '—' : pendingUploadCount }}</strong>
                        </button>
                    </el-tooltip>
                    <el-tooltip :content="serverUpdateTooltip" :disabled="dialogServerUpdates" placement="bottom">
                        <button type="button" class="sync-counter sync-counter-download"
                            :aria-label="serverUpdateTooltip" @click="dialogServerUpdates = true">
                            <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
                            <span class="sync-counter-label">Server Updates</span>
                            <strong class="sync-counter-value">{{ serverUpdateCount === null ? '—' : serverUpdateCount }}</strong>
                        </button>
                    </el-tooltip>
                </section>
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
                                        <el-button type="text" size="mini" @click.stop="deleteAllNotifications"
                                            title="Delete All Notifications" style="color: #f56c6c;">
                                            <i class="fas fa-trash-alt"></i>
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
                                        <!-- Thông báo có bản mới: bấm là tải, cài và mở lại app luôn -->
                                        <el-button v-if="notification.type === 'update'" class="notification-update-btn"
                                            type="primary" size="mini" @click.stop="installUpdate(notification)">
                                            <i class="fas fa-download"></i> Update
                                        </el-button>
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
                                                <el-dropdown-item v-if="notification.type !== 'update'"
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
                                    <el-dropdown-item command="config">
                                        <i class="fas fa-wrench"></i>
                                        Config server address
                                    </el-dropdown-item>
                                    <el-dropdown-item command="user_info">
                                        <i class="fas fa-user-circle"></i>
                                        User information
                                    </el-dropdown-item>
                                    <el-dropdown-item command="toggle_pet">
                                        <i class="fas fa-bolt"></i>
                                        {{ showElectricPet ? 'Hide Pet' : 'Show Pet' }}
                                    </el-dropdown-item>
                                    <el-divider></el-divider>
                                    <!-- <el-dropdown-item command="manage_user">
                                        <i class="fas fa-user-cog"></i>
                                        User management
                                    </el-dropdown-item>
                                    <el-dropdown-item command="update_password">
                                        <i class="fas fa-key"></i>
                                        Change password
                                    </el-dropdown-item>
                                    <el-divider></el-divider> -->
                                    <el-dropdown-item command="log_out" class="danger-item">
                                        <i class="fas fa-sign-out-alt"></i>
                                        Log out
                                    </el-dropdown-item>
                                </template>
                                <template v-else>
                                    <el-dropdown-item command="config">
                                        <i class="fas fa-wrench"></i>
                                        Config server address
                                    </el-dropdown-item>
                                    <el-dropdown-item command="toggle_pet">
                                        <i class="fas fa-bolt"></i>
                                        {{ showElectricPet ? 'Hide Pet' : 'Show Pet' }}
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

        <div v-if="showElectricPet" class="electric-pet" :class="{ 'is-dragging': petIsDragging }"
            :style="petPosition ? { left: `${petPosition.x}px`, top: `${petPosition.y}px`, right: 'auto', bottom: 'auto' } : null"
            role="img" aria-label="Electric transformer pet" @pointerdown="startPetDrag"
            @pointermove="movePet" @pointerup="endPetDrag" @pointercancel="endPetDrag"
            @lostpointercapture="endPetDrag" @contextmenu.prevent.stop="openPetContextMenu">
            <div class="electric-pet-figure">
                <img class="electric-pet-frame" src="@/assets/images/electric-transformer-pet.png"
                    alt="" draggable="false" />
                <img class="electric-pet-frame electric-pet-wave"
                    src="@/assets/images/electric-transformer-pet-wave.png" alt="" draggable="false" />
                <img class="electric-pet-frame electric-pet-blink"
                    src="@/assets/images/electric-transformer-pet-blink.png" alt="" draggable="false" />
            </div>
        </div>
        <div v-if="showElectricPet && petMenuPosition" class="electric-pet-menu"
            :style="{ left: `${petMenuPosition.x}px`, top: `${petMenuPosition.y}px` }"
            @pointerdown.stop @contextmenu.prevent>
            <button type="button" @click="hidePet">
                <i class="fas fa-eye-slash" aria-hidden="true"></i>
                Hide Pet
            </button>
        </div>

        <el-dialog :visible.sync="dialogPendingUploads" width="720px"
            custom-class="pending-upload-dialog" append-to-body @open="loadPendingUploadItems">
            <div slot="title" class="pending-upload-heading">
                <span class="pending-upload-heading-icon"><i class="fas fa-arrow-up" aria-hidden="true"></i></span>
                <strong>Pending Upload</strong>
                <span class="pending-upload-heading-count">{{ pendingUploadItems.length }}</span>
            </div>
            <div class="pending-upload-toolbar">
                <el-input v-model="pendingUploadSearch" size="small" clearable
                    placeholder="Search by name or location" aria-label="Search pending uploads">
                    <i slot="prefix" class="el-icon-search"></i>
                </el-input>
                <el-select v-model="pendingUploadType" size="small" class="pending-upload-type-filter"
                    aria-label="Filter pending uploads by type" placeholder="All types">
                    <el-option label="All types" value="" />
                    <el-option v-for="type in pendingUploadTypeOptions" :key="type.value"
                        :label="type.label" :value="type.value" />
                </el-select>
                <div class="pending-upload-toolbar-actions">
                    <el-button size="small" icon="el-icon-refresh" :loading="pendingUploadItemsLoading"
                        @click="loadPendingUploadItems">Refresh</el-button>
                    <span title="Sync all is not available yet">
                        <el-button size="small" type="primary" icon="el-icon-upload2" disabled>Sync all</el-button>
                    </span>
                </div>
            </div>
            <el-alert v-if="pendingUploadItemsError" :title="pendingUploadItemsError" type="error"
                :closable="false" show-icon />
            <div v-else ref="pendingUploadList" class="pending-upload-list">
                <div v-if="pendingUploadItemsLoading && !pendingUploadItems.length" class="pending-upload-empty">
                    Loading local changes...
                </div>
                <div v-else-if="!filteredPendingUploadItems.length" class="pending-upload-empty">
                    {{ pendingUploadItems.length ? 'No matching items' : 'No items pending upload' }}
                </div>
                <div v-for="item in pagedPendingUploadItems" :key="item.mrid" class="pending-upload-item">
                    <span class="pending-upload-item-icon" :class="item.is_testing_equipment ? 'pending-upload-icon-equipment' : `pending-upload-icon-${item.mode}`">
                        <Icon v-if="item.mode === 'asset' && !item.is_testing_equipment"
                            folder-type="asset" :asset-detail="item.asset_kind" size="20px" />
                        <i v-else :class="pendingUploadIcon(item)" aria-hidden="true"></i>
                    </span>
                    <div class="pending-upload-item-content">
                        <div class="pending-upload-item-heading">
                            <span class="pending-upload-item-name">{{ item.name }}</span>
                            <span class="pending-upload-item-type">{{ pendingUploadTypeLabel(item) }}</span>
                        </div>
                        <button type="button" class="pending-upload-item-path" :title="item.path"
                            @click="openPendingUploadItem(item)">
                            <i class="el-icon-location-outline" aria-hidden="true"></i>
                            <span>{{ item.path }}</span>
                        </button>
                        <div v-if="item.last_error" class="pending-upload-item-error">{{ item.last_error }}</div>
                    </div>
                    <div class="pending-upload-item-actions">
                        <span class="pending-upload-item-status" :class="`pending-upload-status-${item.sync_status}`">
                            {{ pendingUploadStatusLabel(item.sync_status) }}
                        </span>
                        <span :title="item.mode === 'substation' || (item.mode === 'asset' && !item.is_testing_equipment) ? 'Upload this item' : 'Sync for this item is not available yet'">
                            <el-button size="mini" type="primary" icon="el-icon-refresh"
                                class="pending-upload-item-sync" :disabled="!(item.mode === 'substation' || (item.mode === 'asset' && !item.is_testing_equipment)) || !!pendingUploadSyncingMrid"
                                :loading="pendingUploadSyncingMrid === item.mrid"
                                @click="syncPendingUploadItem(item)">Sync</el-button>
                        </span>
                    </div>
                </div>
            </div>
            <el-pagination v-if="!pendingUploadItemsError && filteredPendingUploadItems.length > pendingUploadPageSize"
                class="pending-upload-pagination" background small layout="prev, pager, next"
                :current-page="pendingUploadPage" :page-size="pendingUploadPageSize"
                :total="filteredPendingUploadItems.length" :pager-count="5"
                @current-change="changePendingUploadPage" />
            <span slot="footer" class="dialog-footer">
                <span class="pending-upload-total">
                    {{ filteredPendingUploadItems.length }} item(s)<template v-if="pendingUploadSearch || pendingUploadType"> of {{ pendingUploadItems.length }}</template>
                </span>
                <el-button size="small" type="danger" @click="dialogPendingUploads = false">Close</el-button>
            </span>
        </el-dialog>

        <el-dialog :visible.sync="dialogServerUpdates" width="720px"
            custom-class="pending-upload-dialog" append-to-body @open="loadServerUpdatePaths">
            <div slot="title" class="pending-upload-heading">
                <span class="pending-upload-heading-icon"><i class="fas fa-arrow-down" aria-hidden="true"></i></span>
                <strong>Server Updates</strong>
                <span class="pending-upload-heading-count">{{ serverUpdateItems.length }}</span>
            </div>
            <div class="pending-upload-toolbar">
                <el-input v-model="serverUpdateSearch" size="small" clearable
                    placeholder="Search by name or location" aria-label="Search server updates">
                    <i slot="prefix" class="el-icon-search"></i>
                </el-input>
                <el-button size="small" icon="el-icon-refresh" :loading="serverUpdateLoading"
                    @click="refreshServerUpdates">Refresh</el-button>
            </div>
            <el-alert v-if="serverUpdateError" :title="serverUpdateError" type="error"
                :closable="false" show-icon />
            <div class="pending-upload-list">
                <div v-if="serverUpdateLoading && !serverUpdateItems.length" class="pending-upload-empty">
                    Checking server versions...
                </div>
                <div v-else-if="!filteredServerUpdateItems.length" class="pending-upload-empty">
                    {{ serverUpdateItems.length ? 'No matching items' : 'No newer server versions' }}
                </div>
                <div v-for="item in filteredServerUpdateItems" :key="item.mrid" class="pending-upload-item">
                    <span class="pending-upload-item-icon" :class="`pending-upload-icon-${item.mode}`">
                        <Icon v-if="item.mode === 'asset'" folder-type="asset"
                            :asset-detail="item.asset_kind" size="20px" />
                        <i v-else :class="pendingUploadIcon(item)" aria-hidden="true"></i>
                    </span>
                    <div class="pending-upload-item-content">
                        <div class="pending-upload-item-heading">
                            <span class="pending-upload-item-name">{{ item.name }}</span>
                            <span class="pending-upload-item-type">{{ pendingUploadTypeLabel(item) }}</span>
                        </div>
                        <button type="button" class="pending-upload-item-path" :title="item.path"
                            @click="openServerUpdateItem(item)">
                            <i class="el-icon-location-outline" aria-hidden="true"></i>
                            <span>{{ item.path }}</span>
                        </button>
                    </div>
                    <div class="pending-upload-item-actions">
                        <span class="pending-upload-item-status pending-upload-status-newer">Newer on server</span>
                        <el-button v-if="item.mode === 'substation'" size="mini" type="primary"
                            icon="el-icon-refresh" :loading="serverUpdateSyncingMrid === item.mrid"
                            :disabled="Boolean(serverUpdateSyncingMrid)" @click="syncServerUpdateSubstation(item)">
                            Sync
                        </el-button>
                    </div>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <span class="pending-upload-total">{{ serverUpdateItems.length }} item(s)</span>
                <el-button size="small" type="danger" @click="dialogServerUpdates = false">Close</el-button>
            </span>
        </el-dialog>

        <!-- Server address -->
        <el-dialog custom-class="app-dialog" title="Config server address" :visible.sync="dialogConfig" :modal="true"
            append-to-body>
            <el-form :model="formConfig" :label-width="formLabelWidth" :label-position="'left'" size="small"
                :rules="configRules" ref="formConfig">
                <el-form-item label="Login Domain" prop="loginDomain">
                    <el-input type="text" v-model="formConfig.loginDomain"
                        placeholder="https://login.domain.com"></el-input>
                </el-form-item>
                <el-form-item label="Service Domain" prop="serviceDomain">
                    <el-input type="text" v-model="formConfig.serviceDomain"
                        placeholder="https://service.domain.com"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" @click="dialogConfig = false">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="setServerAddr">Save</el-button>
            </span>
        </el-dialog>

        <el-dialog title="User information" :visible.sync="dialogUserInfo"
            custom-class="user-info-dialog" append-to-body width="480px">
            <div v-if="user" class="user-info-content">
                <div class="user-info-heading">
                    <span class="user-info-avatar"><i class="fas fa-user" aria-hidden="true"></i></span>
                    <div>
                        <strong>{{ user.name || user.username || 'User' }}</strong>
                        <span>{{ user.email || 'No email available' }}</span>
                    </div>
                </div>
                <dl class="user-info-fields">
                    <div><dt>Username</dt><dd>{{ user.username || user.name || '—' }}</dd></div>
                    <div><dt>User ID</dt><dd>{{ user.user_id || user.id || '—' }}</dd></div>
                    <div><dt>Email</dt><dd>{{ user.email || '—' }}</dd></div>
                    <div><dt>Role</dt><dd>{{ userRoleLabel }}</dd></div>
                </dl>
            </div>
            <span slot="footer"><el-button size="small" @click="dialogUserInfo = false">Close</el-button></span>
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
                <el-button v-if="selectedNotification && selectedNotification.type === 'update'"
                    class="footer-btn" size="small" type="primary"
                    @click="installUpdate(selectedNotification)">
                    <i class="fas fa-download"></i> Update
                </el-button>
                <el-button v-else class="footer-btn" size="small" type="danger"
                    @click="deleteNotification(selectedNotification.mrid)">
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
import { createSsoRedirectUri } from '@/utils/sso'
import { formatApiError } from '@/utils/apiError'
import Icon from '@/views/Common/Icon.vue'
import client from '@/utils/client'
import jobClient from '@/api/demo/jobClient'
import { JOB_KIND_BY_ASSET } from '@/api/demo/Job'
import { JOB_SERVICE_DOMAIN, getServiceDomain } from '@/config/server'
import { toServerId } from '@/utils/serverId'
import { streamServerUpdates } from '@/utils/serverUpdateStream'

export default {
    name: 'TopBar',
    components: { Icon },
    data() {
        return {
            dialogChangePw: false,
            dialogConfig: false,
            dialogUserInfo: false,
            showElectricPet: localStorage.getItem('at-digital-tester:show-electric-pet') === 'true',
            petPosition: null,
            petDrag: null,
            petIsDragging: false,
            petMenuPosition: null,
            loading: false,
            formChangePass: {
                oldPassword: '',
                newPassword: ''
            },
            formConfig: {
                loginDomain: '',
                serviceDomain: ''
            },
            formLabelWidth: '120px',
            configRules: {
                loginDomain: [
                    {
                        required: true,
                        pattern: /^https?:\/\//,
                        message: 'Invalid login domain',
                        trigger: ['blur', 'change']
                    }
                ],
                serviceDomain: [
                    {
                        required: true,
                        pattern: /^https?:\/\//,
                        message: 'Invalid service domain',
                        trigger: ['blur', 'change']
                    }
                ]
            },
            isSearchCollapsed: false,
            isMaximized: false,
            notificationLimit: 10,
            currentPage: 1,
            itemsPerPage: 10,
            notifications: [],
            isReloading: false,
            dialogNotificationDetail: false,
            selectedNotification: null,
            removeUpdateNotificationListener: null,
            removeNotificationListener: null,
            pendingUploadCount: null,
            pendingUploadError: false,
            pendingUploadTimer: null,
            pendingUploadRefreshTimer: null,
            pendingUploadRequestId: 0,
            dialogPendingUploads: false,
            pendingUploadItems: [],
            pendingUploadItemsLoading: false,
            pendingUploadSyncingMrid: '',
            pendingUploadItemsError: '',
            pendingUploadSearch: '',
            pendingUploadType: '',
            pendingUploadPage: 1,
            pendingUploadPageSize: 10,
            pendingUploadItemsRequestId: 0,
            serverUpdateCount: null,
            serverUpdateItems: [],
            serverUpdateError: '',
            serverUpdateLoading: false,
            serverUpdateSearch: '',
            serverUpdateSyncingMrid: '',
            dialogServerUpdates: false,
            serverUpdateRequestId: 0,
            serverUpdatePathRequestId: 0,
            serverUpdateRefreshTimer: null,
            serverUpdatePollTimer: null,
            serverUpdateStreams: []
        }
    },
    mounted() {
        this.formConfig.loginDomain = this.loginAddr
        this.formConfig.serviceDomain = this.serviceAddr
        try {
            const savedPosition = JSON.parse(localStorage.getItem('at-digital-tester:pet-position'))
            if (savedPosition && Number.isFinite(savedPosition.x) && Number.isFinite(savedPosition.y)) {
                this.petPosition = this.clampPetPosition(savedPosition.x, savedPosition.y)
            }
        } catch (error) {
            // Ignore an invalid saved position and use the default corner.
        }
        window.addEventListener('resize', this.keepPetInViewport)
        window.addEventListener('pointerdown', this.closePetContextMenu)
        window.addEventListener('keydown', this.handlePetMenuKeydown)

        if (window.electronAPI && window.electronAPI.onWindowStateChange) {
            window.electronAPI.onWindowStateChange((isMax) => {
                this.isMaximized = isMax;
            })
        }

        // Load notifications from database
        this.loadNotifications()
        if (window.electronAPI && window.electronAPI.onUpdateNotificationCreated) {
            this.removeUpdateNotificationListener = window.electronAPI.onUpdateNotificationCreated(() => {
                this.loadNotifications()
            })
        }
        if (window.electronAPI && window.electronAPI.onNotificationCreated) {
            this.removeNotificationListener = window.electronAPI.onNotificationCreated(() => {
                this.loadNotifications()
            })
        }
        this.refreshPendingUploadCount()
        this.pendingUploadTimer = setInterval(this.refreshPendingUploadCount, 15000)
        window.addEventListener('focus', this.refreshPendingUploadCount)
        window.addEventListener('sync-state-changed', this.schedulePendingUploadRefresh)
        window.addEventListener('pending-upload-changed', this.schedulePendingUploadRefresh)
        this.startServerUpdateMonitoring()
        window.addEventListener('focus', this.scheduleServerUpdateRefresh)
        window.addEventListener('sync-state-changed', this.scheduleServerUpdateRefresh)
        window.addEventListener('pending-upload-changed', this.scheduleServerUpdateRefresh)
        // this.updateSearchState()
        // window.addEventListener('resize', this.updateSearchState)
    },
    beforeDestroy() {
        this.pendingUploadItemsRequestId++
        this.stopServerUpdateMonitoring()
        if (this.removeUpdateNotificationListener) this.removeUpdateNotificationListener()
        if (this.removeNotificationListener) this.removeNotificationListener()
        if (this.pendingUploadTimer) clearInterval(this.pendingUploadTimer)
        if (this.pendingUploadRefreshTimer) clearTimeout(this.pendingUploadRefreshTimer)
        window.removeEventListener('focus', this.refreshPendingUploadCount)
        window.removeEventListener('sync-state-changed', this.schedulePendingUploadRefresh)
        window.removeEventListener('pending-upload-changed', this.schedulePendingUploadRefresh)
        window.removeEventListener('focus', this.scheduleServerUpdateRefresh)
        window.removeEventListener('sync-state-changed', this.scheduleServerUpdateRefresh)
        window.removeEventListener('pending-upload-changed', this.scheduleServerUpdateRefresh)
        window.removeEventListener('resize', this.keepPetInViewport)
        window.removeEventListener('pointerdown', this.closePetContextMenu)
        window.removeEventListener('keydown', this.handlePetMenuKeydown)
    },
    computed: {
        ...mapState(['user', 'loginAddr', 'serviceAddr']),
        userRoleLabel() {
            if (!this.user) return '—'
            const roles = Array.isArray(this.user.roles) ? this.user.roles : []
            return roles.length ? roles.map(role => typeof role === 'string'
                ? role : role.name || role.coded || role.code).filter(Boolean).join(', ')
                : this.user.role || '—'
        },
        pendingUploadTooltip() {
            if (this.pendingUploadError) return 'Pending Upload: unable to read local changes'
            if (this.pendingUploadCount === null) return 'Pending Upload: checking local changes'
            return `${this.pendingUploadCount} local item(s) pending upload. Click to view.`
        },
        serverUpdateTooltip() {
            if (this.serverUpdateCount === null) return this.serverUpdateError
                ? 'Server Updates: could not check server versions' : 'Server Updates: checking for changes'
            const count = `${this.serverUpdateCount} item(s) have newer server versions. Click to view.`
            return this.serverUpdateError ? `${count} Some services could not be checked.` : count
        },
        filteredServerUpdateItems() {
            const search = this.serverUpdateSearch.trim().toLowerCase()
            if (!search) return this.serverUpdateItems
            return this.serverUpdateItems.filter(item =>
                [item.name, item.path].some(value => String(value || '').toLowerCase().includes(search))
            )
        },
        filteredPendingUploadItems() {
            const search = this.pendingUploadSearch.trim().toLowerCase()
            return this.pendingUploadItems.filter(item => {
                if (this.pendingUploadType && this.pendingUploadTypeKey(item) !== this.pendingUploadType) return false
                return !search || [item.name, item.path, item.mrid]
                    .some(value => String(value || '').toLowerCase().includes(search))
            })
        },
        pendingUploadTypeOptions() {
            const types = new Map()
            this.pendingUploadItems.forEach(item => {
                const value = this.pendingUploadTypeKey(item)
                if (!types.has(value)) types.set(value, this.pendingUploadTypeLabel(item))
            })
            return Array.from(types, ([value, label]) => ({ value, label }))
                .sort((a, b) => a.label.localeCompare(b.label))
        },
        pagedPendingUploadItems() {
            const start = (this.pendingUploadPage - 1) * this.pendingUploadPageSize
            return this.filteredPendingUploadItems.slice(start, start + this.pendingUploadPageSize)
        },
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
    watch: {
        pendingUploadSearch() {
            this.pendingUploadPage = 1
        },
        pendingUploadType() {
            this.pendingUploadPage = 1
        },
        pendingUploadItems(items) {
            if (this.pendingUploadType && !items.some(item => this.pendingUploadTypeKey(item) === this.pendingUploadType)) {
                this.pendingUploadType = ''
            }
            const pageCount = Math.max(1, Math.ceil(this.filteredPendingUploadItems.length / this.pendingUploadPageSize))
            if (this.pendingUploadPage > pageCount) this.pendingUploadPage = pageCount
        },
        user() {
            this.pendingUploadCount = null
            this.dialogPendingUploads = false
            this.pendingUploadItemsRequestId++
            this.pendingUploadItems = []
            this.refreshPendingUploadCount()
            this.startServerUpdateMonitoring()
        },
        serviceAddr() {
            this.startServerUpdateMonitoring()
        }
    },
    methods: {
        pendingUploadTypeKey(item) {
            return item.mode === 'asset' ? `asset:${item.asset_kind || 'Equipment'}` : item.mode
        },
        changePendingUploadPage(page) {
            this.pendingUploadPage = page
            if (this.$refs.pendingUploadList) this.$refs.pendingUploadList.scrollTop = 0
        },
        openPetContextMenu(event) {
            this.petMenuPosition = {
                x: Math.max(8, Math.min(event.clientX, window.innerWidth - 136)),
                y: Math.max(8, Math.min(event.clientY, window.innerHeight - 48))
            }
        },
        closePetContextMenu() {
            this.petMenuPosition = null
        },
        handlePetMenuKeydown(event) {
            if (event.key === 'Escape') this.closePetContextMenu()
        },
        hidePet() {
            this.showElectricPet = false
            this.closePetContextMenu()
            localStorage.setItem('at-digital-tester:show-electric-pet', 'false')
        },
        clampPetPosition(x, y) {
            const maxX = Math.max(0, window.innerWidth - 64)
            const maxY = Math.max(0, window.innerHeight - 64 - 28)
            const minY = Math.min(48, maxY)
            return {
                x: Math.round(Math.max(0, Math.min(x, maxX))),
                y: Math.round(Math.max(minY, Math.min(y, maxY)))
            }
        },
        keepPetInViewport() {
            if (!this.petPosition) return
            this.petPosition = this.clampPetPosition(this.petPosition.x, this.petPosition.y)
            localStorage.setItem('at-digital-tester:pet-position', JSON.stringify(this.petPosition))
        },
        startPetDrag(event) {
            if (event.button !== 0 || this.petDrag) return
            this.closePetContextMenu()
            const rect = event.currentTarget.getBoundingClientRect()
            this.petDrag = {
                pointerId: event.pointerId,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top
            }
            this.petPosition = this.clampPetPosition(rect.left, rect.top)
            this.petIsDragging = true
            event.currentTarget.setPointerCapture(event.pointerId)
            event.preventDefault()
        },
        movePet(event) {
            if (!this.petDrag || this.petDrag.pointerId !== event.pointerId) return
            this.petPosition = this.clampPetPosition(
                event.clientX - this.petDrag.offsetX,
                event.clientY - this.petDrag.offsetY
            )
        },
        endPetDrag(event) {
            if (!this.petDrag || this.petDrag.pointerId !== event.pointerId) return
            this.petDrag = null
            this.petIsDragging = false
            localStorage.setItem('at-digital-tester:pet-position', JSON.stringify(this.petPosition))
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId)
            }
        },
        pendingUploadTypeLabel(item) {
            if (item.mode === 'asset') {
                return item.asset_kind === 'WorkEquipmentAsset' ? 'Work equipment' : item.asset_kind
            }
            return {
                organisation: 'Organisation', substation: 'Substation', powerPlant: 'Power plant',
                voltageLevel: 'Voltage level', bay: 'Bay', test: 'Test'
            }[item.mode] || 'Node'
        },
        pendingUploadIcon(item) {
            if (item.is_testing_equipment) return 'fas fa-tools'
            return {
                organisation: 'fas fa-building',
                substation: 'fas fa-home',
                powerPlant: 'fas fa-industry',
                voltageLevel: 'fas fa-bolt',
                bay: 'fas fa-sitemap',
                test: 'fas fa-clipboard-check'
            }[item.mode] || 'fas fa-folder'
        },
        pendingUploadStatusLabel(status) {
            return { new: 'New', dirty: 'Changed', syncing: 'Uploading', failed: 'Failed' }[status] || status
        },
        openPendingUploadItem(item) {
            this.dialogPendingUploads = false
            this.$emit('pending-upload-navigate', item)
        },
        async syncPendingUploadItem(item) {
            if (!(item.mode === 'substation' || (item.mode === 'asset' && !item.is_testing_equipment)) || this.pendingUploadSyncingMrid) return
            this.pendingUploadSyncingMrid = item.mrid
            try {
                await new Promise((resolve, reject) => {
                    this.$emit('pending-upload-sync', item, resolve, reject)
                })
            } catch (error) {
                if (error && error.code === 'SUBSTATION_DOWNLOAD_REQUIRED') this.$message.warning(error.message)
                else this.$message.error(formatApiError(error))
            } finally {
                this.pendingUploadSyncingMrid = ''
                await this.loadPendingUploadItems()
            }
        },
        openServerUpdateItem(item) {
            this.dialogServerUpdates = false
            this.$emit('pending-upload-navigate', item)
        },
        async syncServerUpdateSubstation(item) {
            if (item.mode !== 'substation' || this.serverUpdateSyncingMrid) return
            this.serverUpdateSyncingMrid = item.mrid
            try {
                const completed = await new Promise((resolve, reject) => {
                    this.$emit('server-update-sync', item, resolve, reject)
                })
                if (!completed) return
                this.$message.success('Substation downloaded and local changes merged.')
                await this.refreshServerUpdates()
                await this.loadPendingUploadItems()
            } catch (error) {
                if (!error || error.message !== 'CANCELED') this.$message.error(formatApiError(error))
            } finally {
                this.serverUpdateSyncingMrid = ''
            }
        },
        stopServerUpdateMonitoring() {
            this.serverUpdateRequestId++
            this.serverUpdatePathRequestId++
            if (this.serverUpdateRefreshTimer) clearTimeout(this.serverUpdateRefreshTimer)
            if (this.serverUpdatePollTimer) clearInterval(this.serverUpdatePollTimer)
            this.serverUpdateRefreshTimer = null
            this.serverUpdatePollTimer = null
            this.serverUpdateStreams.forEach(controller => controller.abort())
            this.serverUpdateStreams = []
        },
        startServerUpdateMonitoring() {
            this.stopServerUpdateMonitoring()
            this.serverUpdateItems = []
            this.serverUpdateCount = null
            this.serverUpdateError = ''
            if (!this.user || !this.serviceAddr) return
            this.refreshServerUpdates()
            this.serverUpdatePollTimer = setInterval(this.scheduleServerUpdateRefresh, 5 * 60 * 1000)
            const endpoints = [
                `${getServiceDomain().replace(/\/+$/, '')}/api/sync-updates/events`,
                `${JOB_SERVICE_DOMAIN.replace(/\/+$/, '')}/api/job/updates/events`
            ]
            endpoints.forEach(url => {
                const controller = new AbortController()
                this.serverUpdateStreams.push(controller)
                this.runServerUpdateStream(url, controller.signal)
            })
        },
        async runServerUpdateStream(url, signal) {
            let retryMs = 1000
            while (!signal.aborted) {
                try {
                    await streamServerUpdates(url, signal, this.scheduleServerUpdateRefresh)
                    retryMs = 1000
                } catch (error) {
                    if (signal.aborted) return
                    retryMs = Math.min(retryMs * 2, 30000)
                }
                if (signal.aborted) return
                this.scheduleServerUpdateRefresh()
                await new Promise(resolve => {
                    const onAbort = () => { clearTimeout(timer); resolve() }
                    const timer = setTimeout(() => {
                        signal.removeEventListener('abort', onAbort)
                        resolve()
                    }, retryMs)
                    signal.addEventListener('abort', onAbort, { once: true })
                })
            }
        },
        scheduleServerUpdateRefresh() {
            if (this.serverUpdateRefreshTimer) clearTimeout(this.serverUpdateRefreshTimer)
            this.serverUpdateRefreshTimer = setTimeout(() => {
                this.serverUpdateRefreshTimer = null
                this.refreshServerUpdates()
            }, 500)
        },
        async refreshServerUpdates() {
            const userId = this.user && (this.user.user_id || this.user.id)
            const requestId = ++this.serverUpdateRequestId
            if (!userId || !window.electronAPI || !window.electronAPI.getServerUpdateCandidates) return
            this.serverUpdateLoading = true
            this.serverUpdateError = ''
            try {
                const result = await window.electronAPI.getServerUpdateCandidates(userId)
                if (requestId !== this.serverUpdateRequestId) return
                if (!result || !result.success || !Array.isArray(result.data)) {
                    throw new Error(result && result.message || 'Could not read downloaded items')
                }
                const assetItems = result.data.filter(item => item.type !== 'test'
                    && /^(organisation|substation|voltagelevel|bay|transformer|bushing|circuitbreaker|currenttransformer|voltagetransformer|surgearrester|disconnector|powercable)$/i
                        .test(String(item.type).replace(/[^a-z]/gi, ''))
                    && /^\d+$/.test(String(toServerId(item.server_id))))
                const testItems = result.data.filter(item => item.type === 'test'
                    && JOB_KIND_BY_ASSET[item.asset_kind] && Number.isSafeInteger(Number(item.version)))
                const checks = []
                const clientNow = new Date().toISOString()
                for (let offset = 0; offset < assetItems.length; offset += 500) {
                    const batch = assetItems.slice(offset, offset + 500)
                    checks.push(client.post('/api/sync-updates/check', batch.map(item => ({
                        type: item.type, id: String(toServerId(item.server_id)),
                        lastSyncedAt: item.last_synced_at, clientNow
                    })), { silentBackgroundRequest: true }).then(changed => ({ batch, changed })))
                }
                for (let offset = 0; offset < testItems.length; offset += 500) {
                    const batch = testItems.slice(offset, offset + 500)
                    checks.push(jobClient.post('/api/job/updates/check', batch.map(item => ({
                        kind: JOB_KIND_BY_ASSET[item.asset_kind], testId: String(toServerId(item.server_id)),
                        version: Number(item.version)
                    })), { silentBackgroundRequest: true }).then(changed => ({ batch, changed })))
                }
                const responses = await Promise.allSettled(checks)
                if (requestId !== this.serverUpdateRequestId) return
                const updated = []
                for (const response of responses) {
                    if (response.status !== 'fulfilled' || !Array.isArray(response.value.changed)) continue
                    const { batch, changed } = response.value
                    for (const item of batch) {
                        const match = changed.find(entry => String(entry.id || entry.testId) === String(toServerId(item.server_id)))
                        if (match) {
                            updated.push({
                                ...item,
                                mode: item.type === 'test' ? 'test' : item.asset_kind ? 'asset' : item.type,
                                path: 'Locating...',
                                serverRevision: String(match.updatedAt || match.version || item.last_synced_at || item.version || '')
                            })
                        }
                    }
                }
                this.serverUpdateItems = updated
                const checkFailed = responses.some(response => response.status === 'rejected')
                this.serverUpdateCount = responses.length && responses.every(response => response.status === 'rejected')
                    ? null : updated.length
                this.serverUpdateError = checkFailed
                    ? 'Some server versions could not be checked. Try Refresh.' : ''
                await this.notifyNewServerUpdates(updated, userId)
                if (this.dialogServerUpdates) this.loadServerUpdatePaths()
            } catch (error) {
                if (requestId !== this.serverUpdateRequestId) return
                this.serverUpdateError = error.message || 'Could not check server versions'
            } finally {
                if (requestId === this.serverUpdateRequestId) this.serverUpdateLoading = false
            }
        },
        async notifyNewServerUpdates(items, userId) {
            if (!items.length || !window.electronAPI || !window.electronAPI.recordServerUpdateNotice) return
            const scope = `${userId}:${getServiceDomain()}:${JOB_SERVICE_DOMAIN}`
            const storageKey = `at-digital-tester:server-update-notices:${scope}`
            let legacySeen = {}
            try {
                const stored = JSON.parse(localStorage.getItem(storageKey) || '{}')
                if (stored && typeof stored === 'object' && !Array.isArray(stored)) legacySeen = stored
            } catch (error) {
                // Ignore a malformed marker from an older release.
            }
            try {
                const result = await window.electronAPI.recordServerUpdateNotice({ scope, items, legacySeen })
                if (!result || !result.success || !result.notified) return
                await this.loadNotifications()
                this.$notify({
                    title: 'Server Updates', message: result.message, type: 'info', duration: 6000,
                    onClick: () => { this.dialogServerUpdates = true }
                })
            } catch (error) {
                // Version checks should still work if notification storage fails.
            }
        },
        async loadServerUpdatePaths() {
            const requestId = ++this.serverUpdatePathRequestId
            for (let offset = 0; offset < this.serverUpdateItems.length; offset += 8) {
                if (requestId !== this.serverUpdatePathRequestId || !this.dialogServerUpdates) return
                await Promise.all(this.serverUpdateItems.slice(offset, offset + 8).map(async item => {
                    try {
                        const response = await window.electronAPI.getNodePath(item.mrid, item.mode)
                        if (requestId !== this.serverUpdatePathRequestId) return
                        const path = response && response.success && Array.isArray(response.data)
                            ? response.data.map(step => step.mrid === item.mrid
                                ? item.name : (step.name || step.mrid)).join(' / ') : ''
                        this.$set(item, 'path', path || 'Location unavailable')
                    } catch (error) {
                        if (requestId === this.serverUpdatePathRequestId) this.$set(item, 'path', 'Location unavailable')
                    }
                }))
            }
        },
        async loadPendingUploadItems() {
            const userId = this.user && (this.user.user_id || this.user.id)
            const requestId = ++this.pendingUploadItemsRequestId
            this.pendingUploadItems = []
            this.pendingUploadItemsError = ''
            this.pendingUploadItemsLoading = true
            if (!userId || !window.electronAPI || !window.electronAPI.getPendingUploadItems) {
                this.pendingUploadItemsLoading = false
                this.pendingUploadItemsError = 'Local change list is unavailable'
                return
            }
            try {
                const result = await window.electronAPI.getPendingUploadItems(userId)
                if (requestId !== this.pendingUploadItemsRequestId) return
                if (!result || !result.success || !Array.isArray(result.data)) {
                    throw new Error(result && result.message ? result.message : 'Could not read local changes')
                }
                this.pendingUploadItems = result.data.map(item => ({ ...item, path: 'Locating...' }))
                this.pendingUploadCount = result.data.length
                this.pendingUploadItemsLoading = false

                for (let offset = 0; offset < this.pendingUploadItems.length; offset += 8) {
                    if (requestId !== this.pendingUploadItemsRequestId || !this.dialogPendingUploads) return
                    await Promise.all(this.pendingUploadItems.slice(offset, offset + 8).map(async item => {
                        if (item.is_testing_equipment) {
                            this.$set(item, 'path', `Testing Equipment / ${item.name}`)
                            return
                        }
                        if (!window.electronAPI.getNodePath || item.mode === 'unknown') {
                            this.$set(item, 'path', 'Location unavailable')
                            return
                        }
                        try {
                            const pathResult = await window.electronAPI.getNodePath(item.mrid, item.mode)
                            if (requestId !== this.pendingUploadItemsRequestId) return
                            const path = pathResult && pathResult.success && Array.isArray(pathResult.data)
                                ? pathResult.data.map(step => step.mrid === item.mrid
                                    ? item.name : (step.name || step.mrid)).join(' / ') : ''
                            this.$set(item, 'path', path || 'Location unavailable')
                        } catch (error) {
                            if (requestId === this.pendingUploadItemsRequestId) this.$set(item, 'path', 'Location unavailable')
                        }
                    }))
                }
            } catch (error) {
                if (requestId !== this.pendingUploadItemsRequestId) return
                this.pendingUploadItemsLoading = false
                this.pendingUploadItemsError = error.message || 'Could not read local changes'
            }
        },
        schedulePendingUploadRefresh() {
            if (this.pendingUploadRefreshTimer) clearTimeout(this.pendingUploadRefreshTimer)
            this.pendingUploadRefreshTimer = setTimeout(() => {
                this.pendingUploadRefreshTimer = null
                this.refreshPendingUploadCount()
            }, 300)
        },
        async refreshPendingUploadCount() {
            const userId = this.user && (this.user.user_id || this.user.id)
            const requestId = ++this.pendingUploadRequestId
            if (!userId || !window.electronAPI || !window.electronAPI.getPendingUploadCount) {
                this.pendingUploadCount = null
                this.pendingUploadError = false
                return
            }
            try {
                const result = await window.electronAPI.getPendingUploadCount(userId)
                if (requestId !== this.pendingUploadRequestId) return
                if (!result || !result.success) throw new Error('Count pending uploads failed')
                const count = Number(result.data)
                if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid pending upload count')
                this.pendingUploadCount = count
                this.pendingUploadError = false
            } catch (error) {
                if (requestId !== this.pendingUploadRequestId) return
                this.pendingUploadCount = null
                this.pendingUploadError = true
            }
        },
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
        async handleCommand(command) {
            switch (command) {
                case 'log_out':
                    {
                        const redirectUri = createSsoRedirectUri()
                        const ssoLogout = userApi.getSsoLogoutUrl(redirectUri)
                            .then(response => {
                                const logoutUrl = response && response.code === 1 ? response.data : null
                                if (logoutUrl && window.electronAPI && window.electronAPI.openSsoLogout) {
                                    return window.electronAPI.openSsoLogout(logoutUrl, redirectUri)
                                }
                                return null
                            })
                            .catch(error => {
                                console.warn('SSO logout failed:', error)
                                this.$message.warning(formatApiError(error))
                            })

                        await this.$helper.afterLogout()
                        await this.$router.push({ path: '/login' })
                        if (window.electronAPI && window.electronAPI.focusApp) {
                            await window.electronAPI.focusApp()
                        }
                        void ssoLogout
                    }
                    break
                case 'update_password':
                    this.dialogChangePw = true
                    break
                case 'manage_user':
                    // this.$router.push({ path: '/manage-user' })
                    break
                case 'config':
                    this.dialogConfig = true
                    break
                case 'user_info':
                    this.dialogUserInfo = true
                    break
                case 'toggle_pet':
                    this.showElectricPet = !this.showElectricPet
                    this.closePetContextMenu()
                    localStorage.setItem('at-digital-tester:show-electric-pet', String(this.showElectricPet))
                    break
            }
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
            this.$refs.formConfig.validate(async (valid) => {
                if (valid) {
                    const cleanLoginDomain = this.formConfig.loginDomain.trim().replace(/\/+$/, '')
                    const cleanServiceDomain = this.formConfig.serviceDomain.trim().replace(/\/+$/, '')

                    this.formConfig.loginDomain = cleanLoginDomain
                    this.formConfig.serviceDomain = cleanServiceDomain

                    try {
                        const configChanged = cleanLoginDomain !== this.loginAddr || cleanServiceDomain !== this.serviceAddr
                        await this.$helper.setServerAddr({
                            loginDomain: this.formConfig.loginDomain,
                            serviceDomain: this.formConfig.serviceDomain
                        })

                        this.dialogConfig = false
                        if (configChanged) this.$emit('server-config-changed')
                        this.$message.success('Config successfully')
                    } catch (error) {
                        this.$message.error(error.message || 'Unable to save server configuration')
                    }
                    return
                }
            })
        },
        /**
         * Cài bản cập nhật ngay từ thông báo. Việc tải / cài / mở lại app do
         * MandatoryUpdateDialog (gắn ở App.vue) đảm nhận, kèm thanh tiến trình.
         */
        installUpdate(notification) {
            const match = String(notification && notification.message || '').match(/Version\s+v?([0-9A-Za-z.+-]+)/i)
            const version = match ? match[1].replace(/\.$/, '') : ''
            this.dialogNotificationDetail = false
            if (this.$refs.notificationDropdown) this.$refs.notificationDropdown.hide()
            this.$root.$emit('app-update:install', version)
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
            if (notification.type === 'server_update') {
                if (notification.status !== 'read') this.markAsRead(notification.mrid)
                if (this.$refs.notificationDropdown) this.$refs.notificationDropdown.hide()
                this.dialogServerUpdates = true
                return
            }
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
                'server_update': 'fas fa-arrow-down',
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
                // Keep dropdown open
                this.$nextTick(() => {
                    if (this.$refs.notificationDropdown) {
                        this.$refs.notificationDropdown.handleClick()
                    }
                })
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
                // Keep dropdown open
                this.$nextTick(() => {
                    if (this.$refs.notificationDropdown) {
                        this.$refs.notificationDropdown.handleClick()
                    }
                })
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
                // Keep dropdown open
                this.$nextTick(() => {
                    if (this.$refs.notificationDropdown) {
                        this.$refs.notificationDropdown.handleClick()
                    }
                })
            } catch (error) {
                console.error('Error deleting notification:', error)
                this.$message.error('Unable to delete notification')
            }
        },
        async deleteAllNotifications() {
            try {
                const response = await window.electronAPI.deleteAllNotifications()
                if (response.success) {
                    await this.loadNotifications()
                    this.$message.success('Notifications have been cleared.')
                }
                // Keep dropdown open
                this.$nextTick(() => {
                    if (this.$refs.notificationDropdown) {
                        this.$refs.notificationDropdown.handleClick()
                    }
                })
            } catch (error) {
                console.error('Error deleting all notifications:', error)
                this.$message.error('Unable to delete all notifications')
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

.electric-pet {
    position: fixed;
    right: 16px;
    bottom: 34px;
    z-index: 1200;
    width: 64px;
    height: 64px;
    -webkit-app-region: no-drag;
    cursor: grab;
    touch-action: none;
    user-select: none;
}

.electric-pet.is-dragging {
    cursor: grabbing;
}

.electric-pet-menu {
    position: fixed;
    z-index: 1201;
    min-width: 128px;
    padding: 4px;
    border: 1px solid #dce3ec;
    border-radius: 4px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(19, 37, 65, 0.18);
    -webkit-app-region: no-drag;
}

.electric-pet-menu button {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    min-height: 32px;
    padding: 6px 8px;
    border: 0;
    border-radius: 3px;
    background: transparent;
    color: #34445d;
    font: inherit;
    text-align: left;
    cursor: pointer;
}

.electric-pet-menu button:hover,
.electric-pet-menu button:focus-visible {
    background: #edf3fd;
    color: #012596;
    outline: none;
}

.electric-pet-figure {
    position: relative;
    width: 100%;
    height: 100%;
    pointer-events: none;
    animation: electric-pet-bob 3s ease-in-out infinite;
}

.electric-pet.is-dragging .electric-pet-figure {
    animation-play-state: paused;
}

.electric-pet-frame {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    -webkit-user-drag: none;
}

.electric-pet-wave,
.electric-pet-blink {
    opacity: 0;
    animation-duration: 6s;
    animation-timing-function: steps(1, end);
    animation-iteration-count: infinite;
}

.electric-pet-wave {
    animation-name: electric-pet-wave;
}

.electric-pet-blink {
    animation-name: electric-pet-blink;
}

@keyframes electric-pet-bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
}

@keyframes electric-pet-wave {
    0%, 4%, 8%, 12%, 100% { opacity: 0; }
    5%, 7%, 9%, 11% { opacity: 1; }
}

@keyframes electric-pet-blink {
    0%, 54%, 57%, 100% { opacity: 0; }
    55%, 56% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
    .electric-pet-figure,
    .electric-pet-wave,
    .electric-pet-blink {
        animation: none;
    }
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

.sync-counters {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 100%;
    padding: 0 10px;
    -webkit-app-region: no-drag;
}

.sync-counter {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 7px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.16);
    color: #fff;
    font-size: 11px;
    white-space: nowrap;
}

.sync-counter-upload i {
    color: #ffba59;
}

.sync-counter-upload,
.sync-counter-download {
    cursor: pointer;
    font-family: inherit;
}

.sync-counter-upload:hover,
.sync-counter-upload:focus-visible,
.sync-counter-download:hover,
.sync-counter-download:focus-visible {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.55);
    outline: none;
}

.sync-counter-download i {
    color: #79d1ed;
}

.sync-counter-value {
    display: inline-flex;
    min-width: 18px;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
}

.sync-counter-upload .sync-counter-value {
    color: #ffba59;
}

.sync-counter-download .sync-counter-value {
    color: #79d1ed;
}

@media (max-width: 900px) {
    .sync-counter-label {
        display: none;
    }
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

@media (max-width: 767px) {
    ::v-deep(.custom-footer) {
        justify-content: center;
    }
}
</style>

<style lang="scss">
.user-info-dialog.el-dialog {
    width: min(480px, calc(100vw - 32px)) !important;
    border: 1px solid #dce3ec;
    border-radius: 6px;
    overflow: hidden;
    background: #fff;

    .el-dialog__header {
        padding: 18px 24px;
        border-bottom: 1px solid #e5eaf1;
    }

    .el-dialog__title {
        color: #1c2d47;
        font-size: 18px;
        font-weight: 600;
    }

    .el-dialog__body {
        padding: 24px;
    }

    .el-dialog__footer {
        padding: 14px 24px;
        border-top: 1px solid #e5eaf1;
    }
}

.user-info-heading {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 22px;
    border-bottom: 1px solid #e5eaf1;

    > div {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    strong {
        color: #1c2d47;
        font-size: 17px;
        overflow-wrap: anywhere;
    }

    span:not(.user-info-avatar) {
        color: #68778d;
        font-size: 13px;
        overflow-wrap: anywhere;
    }
}

.user-info-avatar {
    width: 44px;
    height: 44px;
    flex: none;
    display: grid;
    place-items: center;
    border-radius: 6px;
    background: #e8f0ff;
    color: #163c91;
    font-size: 18px;
}

.user-info-fields {
    margin: 18px 0 0;

    > div {
        display: grid;
        grid-template-columns: 110px minmax(0, 1fr);
        gap: 14px;
        padding: 10px 0;
        border-bottom: 1px solid #edf0f5;
    }

    > div:last-child {
        border-bottom: 0;
    }

    dt {
        color: #68778d;
    }

    dd {
        margin: 0;
        color: #263951;
        font-weight: 500;
        overflow-wrap: anywhere;
    }
}

.pending-upload-dialog.el-dialog {
    width: min(760px, calc(100vw - 32px)) !important;
    max-height: 85vh;
    margin-top: 7vh !important;
    display: flex;
    flex-direction: column;
    border-radius: 6px;
    border: 1px solid #dce3ec;
    box-shadow: 0 16px 48px rgba(19, 37, 65, 0.2);
}

.pending-upload-dialog .el-dialog__header {
    padding: 17px 24px;
    border-bottom: 1px solid #e7ebf1;
    background: #f9fbfe;
}

.pending-upload-heading {
    display: flex;
    align-items: center;
    gap: 11px;
    color: #1c2b42;
    font-size: 17px;
}

.pending-upload-heading strong {
    font-weight: 650;
}

.pending-upload-heading-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: #e7efff;
    color: #16449d;
    font-size: 14px;
}

.pending-upload-heading-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 23px;
    height: 23px;
    padding: 0 6px;
    border-radius: 12px;
    background: #e9edf4;
    color: #52637a;
    font-size: 11px;
    font-weight: 700;
}

.pending-upload-dialog .el-dialog__body {
    min-height: 0;
    padding: 18px 24px 20px;
    display: flex;
    flex-direction: column;
}

.pending-upload-dialog .el-dialog__footer {
    padding: 12px 24px;
    border-top: 1px solid #e7ebf1;
    background: #f8fafc;
}

.pending-upload-toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
}

.pending-upload-toolbar .el-input {
    min-width: 0;
    flex: 1;
}

.pending-upload-toolbar .pending-upload-type-filter {
    flex: 0 0 168px;
    min-width: 0;
}

.pending-upload-toolbar .el-input__prefix {
    display: flex;
    align-items: center;
    left: 10px;
    color: #8390a3;
}

.pending-upload-toolbar .el-input__inner:focus {
    border-color: #4d73af;
    box-shadow: 0 0 0 2px rgba(44, 91, 167, 0.11);
}

.pending-upload-toolbar-actions {
    display: flex;
    flex: none;
    gap: 8px;
}

.pending-upload-toolbar-actions .el-button + .el-button {
    margin-left: 0;
}

.pending-upload-toolbar-actions .el-button.is-disabled {
    color: #8390a2;
    border-color: #d8e0eb;
    background: #f4f7fb;
}

.pending-upload-list {
    min-height: 110px;
    max-height: 52vh;
    overflow-y: auto;
    border: 1px solid #e3e8f0;
    border-radius: 5px;
}

.pending-upload-pagination {
    display: flex;
    justify-content: center;
    padding-top: 14px;
}

.pending-upload-item {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) auto;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-bottom: 1px solid #e8edf3;
}

.pending-upload-item-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid #dce5f0;
    border-radius: 6px;
    background: #eef3f9;
    color: #44678d;
    font-size: 14px;
}

.pending-upload-icon-organisation,
.pending-upload-icon-substation,
.pending-upload-icon-powerPlant {
    border-color: #d8e8d9;
    background: #edf7ee;
    color: #357344;
}

.pending-upload-icon-test {
    border-color: #d7e9e8;
    background: #ebf7f6;
    color: #217774;
}

.pending-upload-icon-equipment {
    border-color: #e6dff4;
    background: #f5f1fb;
    color: #72569a;
}

.pending-upload-item:last-child {
    border-bottom: 0;
}

.pending-upload-item:hover {
    background: #f8fafd;
}

.pending-upload-item-content {
    min-width: 0;
}

.pending-upload-item-heading {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.pending-upload-item-actions {
    display: inline-flex;
    align-items: center;
    gap: 10px;
}

.pending-upload-item-name {
    color: #1c2b42;
    font-size: 13px;
    font-weight: 650;
    overflow-wrap: anywhere;
}

.pending-upload-item-type,
.pending-upload-item-status {
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 11px;
    line-height: 18px;
    white-space: nowrap;
}

.pending-upload-item-type {
    color: #536175;
    background: #edf1f6;
}

.pending-upload-item-status {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #8a570d;
    background: #fff1d9;
}

.pending-upload-item-status::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
}

.pending-upload-item-sync {
    height: 30px;
    min-width: 70px;
    white-space: nowrap;
}

.pending-upload-status-syncing {
    color: #19527b;
    background: #e5f3fc;
}

.pending-upload-status-failed {
    color: #a12631;
    background: #fce9eb;
}

.pending-upload-status-newer {
    color: #145884;
    background: #e5f3fc;
}

.pending-upload-item-path,
.pending-upload-item-error {
    margin-top: 6px;
    color: #708097;
    font-size: 12px;
    line-height: 1.5;
    overflow-wrap: anywhere;
}

.pending-upload-item-path {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
}

.pending-upload-item-path span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pending-upload-item-path:hover,
.pending-upload-item-path:focus-visible {
    color: #012596;
    text-decoration: underline;
}

.pending-upload-item-error {
    color: #a12631;
}

.pending-upload-empty {
    padding: 32px 12px;
    text-align: center;
    color: #78869a;
    font-size: 13px;
}

.pending-upload-dialog .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pending-upload-total {
    color: #607086;
    font-size: 12px;
    font-weight: 600;
}

@media (max-width: 560px) {
    .pending-upload-dialog .el-dialog__body {
        padding: 14px 16px 16px;
    }

    .pending-upload-toolbar {
        flex-wrap: wrap;
    }

    .pending-upload-toolbar .el-input {
        flex-basis: 100%;
    }

    .pending-upload-toolbar .pending-upload-type-filter {
        flex: 1 1 160px;
    }

    .pending-upload-item {
        grid-template-columns: 36px minmax(0, 1fr);
        gap: 10px;
        padding: 12px;
    }

    .pending-upload-item-actions {
        grid-column: 2;
        justify-content: space-between;
    }
}

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
    border-radius: 6px;
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
    border-radius: 6px !important;
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

.notification-update-btn.el-button {
    flex-shrink: 0;
    padding: 5px 10px;
    border-radius: 6px;
    font-weight: 600;
}

.notification-update-btn.el-button i {
    margin-right: 4px;
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
