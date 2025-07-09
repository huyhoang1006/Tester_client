<template>
    <div>
        <div id="top-windows">
            <div class="left-bar">
                <div @click="$router.push({name: 'home'}).catch(() => {})">
                    <span>
                        <a href="#">
                            <img src="@/assets/images/atdigitaltester_logo.png" style="max-height: 2.5vh; margin-left: 10px;" />
                        </a>
                    </span>
                </div>
            </div>

            <div class="center-bar">
                <input v-if="user"
                style="width: 30vw; padding: 5px; border-radius: 10px; border: 1px solid #ccc; outline: none;"
                type="text"
                placeholder="Search..."
                >
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
                <div style="height: 100%;" @click="minimizeApp">
                    <i style="font-size: 20px; color: white;" class="far fa-minus-square"></i>
                </div>
                <div @click="maximizeApp">
                    <i style="font-size: 20px; color: white;" class="fa-solid fa-window-restore"></i>
                </div>
                <div class="close-icon" @click="closeApp">
                    <i style="font-size: 20px; color: white;" class="fa-solid fa-xmark "></i>
                </div>
            </div>
        </div>

        <!-- Server address -->
        <el-dialog title="Config server address" :visible.sync="dialogConfig" width="600px">
            <el-form :model="formConfig" :label-width="formLabelWidth" :label-position="'left'" size="small" :rules="configRules" ref="formConfig">
                <el-form-item label="Domain" prop="domain">
                    <el-input type="text" v-model="formConfig.domain" placeholder="https://domain.com/api/"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" type="danger" @click="dialogConfig = false">Cancel</el-button>
                <el-button size="small" type="primary" @click="setServerAddr">Save</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
// eslint-disable-next-line
/* eslint-disable */
import {mapState} from 'vuex'
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
            formLabelWidth: '140px',
            configRules: {
                domain: [
                    {
                        required: true,
                        pattern: /^https?:\/\//,
                        message: 'Invalid domain',
                        trigger: 'change'
                    }
                ]
            }
        }
    },
    mounted() {
        this.formConfig.domain = this.serverAddr
    },
    computed: mapState(['user', 'serverAddr']),
    methods: {
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
                    this.$router.push({path: '/login'})
                    break
                case 'update_password':
                    this.dialogChangePw = true
                    break
                case 'manage_user':
                    this.$router.push({path: '/manage-user'})
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
    z-index: 10;
    background-color: #012596;
    height: inherit;
    width: 100%;
    position: fixed;
    top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    -webkit-app-region: drag;
    box-sizing: border-box;
    // border-bottom: 1px solid #aeb6bf;
}

#top-windows div {
    -webkit-app-region: no-drag; /* Cho phép click vào các div con */
}

.close-svg:hover {
    fill: white;
    background-color: #ed553b;
}

.svg {
    -webkit-app-region: no-drag;
    padding: 10px 14px;
    cursor: pointer;
    fill: #ccc;
}

.left-bar {
    display: flex;
}

.center-bar {
    display: flex;
}

.right-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
}

.right-bar > div {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 5vh;
}

.right-bar > div:hover {
    fill: #fff;
    background-color: #409eff;
    cursor: pointer;
}

.close-icon:hover {
    fill: #fff;
    background-color: red !important;
    cursor: pointer;
}
</style>