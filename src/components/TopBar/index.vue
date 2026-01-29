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
                <div @click.stop="handleDropdown">
                    <el-dropdown ref="dropdown" @command="handleCommand" trigger="click">
                        <el-button style="padding: 0; margin: 0; border: none; background-color: inherit;">
                            <i style="font-size: 20px; color: white;" class="far fa-user-circle"></i>
                        </el-button>
                        <el-dropdown-menu slot="dropdown">
                            <template v-if="user">
                                <el-dropdown-item command="manage_user"> User Manager </el-dropdown-item>
                                <el-dropdown-item command="update_password">Change password</el-dropdown-item>
                                <el-dropdown-item command="config">Config Server address</el-dropdown-item>
                                <el-divider></el-divider>
                                <el-dropdown-item command="log_out">Log out</el-dropdown-item>
                            </template>
                            <template v-else>
                                <el-dropdown-item command="config">Config Server address</el-dropdown-item>
                            </template>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
                <div @click="minimizeApp">
                    <i class="far fa-minus-square"></i>
                </div>
                <div @click="maximizeApp">
                    <i class="fa-solid fa-window-restore"></i>
                </div>
                <div @click="closeApp" class="close-icon">
                    <i class="fa-solid fa-xmark "></i>
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
                <el-button class="footer-btn" size="small" type="danger"
                    @click="dialogConfig = false">Cancel</el-button>
                <el-button class="footer-btn" size="small" type="primary" @click="setServerAddr">Save</el-button>
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
            isSearchCollapsed: false
        }
    },
    mounted() {
        this.formConfig.domain = this.serverAddr
        this.updateSearchState()
        window.addEventListener('resize', this.updateSearchState)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.updateSearchState)
    },
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
            this.$refs.dropdown.handleClick(); // Kích hoạt dropdown khi click vào div
        }
    }
}
</script>

<style lang="scss" scoped>
#top-windows {
    position: relative;
    height: 48px;
    width: 100%;
    display: flex;
    align-items: center;
    -webkit-app-region: drag;
    transition: background-color 0.25s ease;
}

#top-windows.not-logged-in {
    background-color: transparent;
}

#top-windows.logged-in {
    background-color: #012596;
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
}

.topbar-logo {
    height: 20px;
    user-select: none;
    -webkit-user-drag: none;
    pointer-events: none;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.75));
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
    gap: 8px;
    height: 32px;
    padding: 0 12px;
    background-color: #ffffff;
    border-radius: 4px;
    width: 320px;

    .search-icon {
        font-size: 14px;
        color: #666;
    }

    .topbar-search {
        flex: 1;
        min-width: 0;
        height: 100%;
        border: none;
        outline: none;
        background: transparent;
        font-size: 13px;
        color: #333;
    }

    // &.collapsed {
    //     width: 40px;
    //     height: 40px;
    //     padding: 0;
    //     justify-content: center;
    //     background-color: transparent;
    //     cursor: pointer;

    //     .search-icon {
    //         font-size: 18px;
    //         color: #ffffff;
    //     }

    //     &:hover {
    //         background-color: rgba(255, 255, 255, 0.1);
    //         border-radius: 50%;
    //     }
    // }
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
    font-size: 18px;
    color: #fff;
}

.right-bar>div:hover {
    background-color: #409eff;
    cursor: pointer;
}

.close-icon:hover {
    background-color: red !important;
    cursor: pointer;
}
</style>

<style lang="scss" scoped>
::v-deep(.app-dialog) {
    box-sizing: border-box;
}

::v-deep(.app-dialog.el-dialog) {
    width: 35%;
    margin-top: 15vh !important;
    border-radius: 6px;
    max-height: 90vh;
    height: auto !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

::v-deep(.app-dialog .el-dialog__body) {
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    flex: 1;
}

::v-deep(.app-dialog .el-dialog__body::-webkit-scrollbar) {
    width: 0px;
    height: 0px;
}

::v-deep(.app-dialog .el-dialog__footer) {
    padding: 10px 20px;
    border-top: 1px solid #ebeef5;
}

::v-deep(.custom-footer) {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

::v-deep(.custom-footer .footer-btn) {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100px;
}

@media (max-width: 1199px) {
    ::v-deep(.app-dialog.el-dialog) {
        width: 50%;
    }
}

@media (max-width: 767px) {
    ::v-deep(.app-dialog.el-dialog) {
        width: 75%;
    }

    ::v-deep(.custom-footer) {
        justify-content: center;
    }
}
</style>