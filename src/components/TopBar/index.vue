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
                <div @click="minimizeApp" class="topbar-btn">
                    <i style="font-size: 15px; color: white;" class="far fa-window-minimize"></i>
                </div>
                <div @click="maximizeApp" class="topbar-btn">
                    <i style="font-size: 15px; color: white;" v-if="isMaximized" class="far fa-window-restore"></i>
                    <i style="font-size: 15px; color: white;" v-else class="far fa-window-maximize"></i>
                </div>
                <div @click="closeApp" class="close-icon">
                    <i style="font-size: 15px; color: white;" class="fas fa-window-close"></i>
                </div>
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
                        <div class="info-label">Latest version: </div>
                        <div class="version-number">v{{ updateInfo.version }}</div>
                    </div>
                    <div class="app-logo-mini">
                        <img src="@/assets/images/atenergy_key_light.png" alt="" />
                    </div>
                </div>
                <div class="changelog">
                    <div class="changelog-title">What's new:</div>
                    <div class="changelog-body">
                        {{ updateInfo.releaseNotes }}
                    </div>
                </div>
            </div>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" @click="dialogUpdate = false">
                    Not now
                </el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="handleUpdate">
                    Update
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
                releaseNotes: ''
            }
        }
    },
    mounted() {
        this.formConfig.domain = this.serverAddr

        if (window.electronAPI && window.electronAPI.onWindowStateChange) {
            window.electronAPI.onWindowStateChange((isMax) => {
                this.isMaximized = isMax;
            })
        }
        // this.updateSearchState()
        // window.addEventListener('resize', this.updateSearchState)
    },
    // beforeDestroy() {
    //     window.removeEventListener('resize', this.updateSearchState)
    // },
    computed: mapState(['user', 'serverAddr']),
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
            const mockUpdateData = {
                version: '1.0.0',
                releaseNotes: ` • Improve performance
                                • Fix login bug
                                • Enhance UI glass effect
                                • Enhance UI glass effect
                                • Enhance UI glass effect
                                • Enhance UI glass effect
                                • Enhance UI glass effect
                                • Enhance UI glass effect
                                • Optimize memory usage`
            }
            this.updateInfo = mockUpdateData
            this.dialogUpdate = true
        },
        handleUpdate() {
            this.dialogUpdate = false
            this.$message({
                type: 'success',
                message: 'Starting update...'
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
        handleDropdown() {
            this.$refs.dropdown.handleClick();
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

.info-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 4px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.version-number {
    font-size: 24px;
    font-weight: 800;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
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
    font-weight: 540;
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
</style>