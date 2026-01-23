<template>
    <div id="login" class="login-page">
        <div class="app-container">
            <div class="sidebar">
                <div class="brand-section">
                    <div class="brand-logo">
                        <img src="@/assets/images/atenergy_logo_dark.png" class="brand-logo-img" />
                    </div>
                    <div class="sidebar-title">
                        <div class="title-row">
                            <h2 class="asset">Asset</h2>
                            <h2>Health</h2>
                        </div>
                        <h2>Management</h2>
                    </div>
                    <ul class="feature-list">
                        <li>Asset data modeling</li>
                        <li>Maintenance strategy selection</li>
                        <li>Evaluation of test results</li>
                    </ul>
                </div>
                <div class="footer-text">Standard by IEC 61968</div>
            </div>
            <div class="main-content">
                <div class="mobile-header">
                    <div class="brand-logo">
                        <img src="@/assets/images/atenergy_key_light.png" class="brand-logo-img" />
                    </div>
                </div>
                <div class="login-header">
                    <h1>Login</h1>
                    <p>Sign in to continue</p>
                </div>
                <el-form :model="model" :rules="loginRules" ref="form" @submit.native.prevent="login">
                    <div class="form-group">
                        <label class="form-label">Username</label>
                        <el-form-item prop="username">
                            <el-input v-model="model.username" placeholder="Username"
                                prefix-icon="fas fa-user"></el-input>
                        </el-form-item>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <el-form-item prop="password">
                            <el-input prefix-icon="fas fa-lock" placeholder="Password" type="password"
                                v-model="model.password" show-password></el-input>
                        </el-form-item>
                    </div>
                    <div class="checkbox-row">
                        <el-checkbox v-model="remember" class="remember-checkbox">Remember</el-checkbox>
                    </div>
                    <el-button :loading="loadingLogin" class="submit-btn" type="primary"
                        native-type="submit">Login</el-button>
                </el-form>
            </div>
            <div class="mobile-footer">
                Standard by IEC 61968
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import * as userApi from '@/api/user'

export default {
    name: 'LoginView',
    data() {
        return {
            formLabelWidth: '140px',
            model: {
                // Tài khoản test mặc định
                username: 'EVN_HCM',
                password: 'evn_admin'
            },
            remember: true,
            loadingLogin: false,
            loginRules: {
                username: [
                    {
                        required: true,
                        message: 'Username is required',
                        trigger: 'blur'
                    }
                ],
                password: [
                    {
                        required: true,
                        message: 'Password is required',
                        trigger: 'blur'
                    }
                ]
            },
            redirect: undefined,
            otherQuery: {}
        }
    },
    watch: {
        $route: {
            handler: function (route) {
                const query = route.query
                if (query) {
                    this.redirect = query.redirect
                    this.otherQuery = this.getOtherQuery(query)
                }
            },
            immediate: true
        }
    },
    methods: {
        async login() {
            let valid = await this.$refs.form.validate()
            if (!valid) {
                return
            }
            this.loadingLogin = true

            // Gọi API login (Lưu ý: api/user.js phải được cấu hình dùng qs và Basic Auth)
            userApi
                .login(this.model)
                .then((response) => {
                    // Xử lý response từ OAuth2
                    // console.log("Login Success:", response) 

                    // Gán username vào response để tiện hiển thị (vì OAuth response không trả về username)
                    response.name = this.model.username

                    this.$message.success('Login successfully')

                    // Lưu thông tin token vào localStorage
                    localStorage.setItem('authInfo', JSON.stringify(response))

                    // Gọi helper xử lý state (store/vuex)
                    // Đảm bảo this.$helper.afterLogin của bạn xử lý được object chứa access_token
                    if (this.$helper && this.$helper.afterLogin) {
                        this.$helper.afterLogin(this.remember, response)
                    }

                    this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
                })
                .catch((error) => {
                    console.log("Login Error:", error)

                    // Xử lý hiển thị lỗi chi tiết từ OAuth server
                    let msg = 'Login failed'
                    if (error.response && error.response.data) {
                        // Ưu tiên hiển thị 'error_description' nếu có
                        msg = error.response.data.error_description || error.response.data.message || msg
                    }
                    this.$message.error(msg)
                })
                .finally(async () => {
                    this.loadingLogin = false
                })
        },
        getOtherQuery(query) {
            return Object.keys(query).reduce((acc, cur) => {
                if (cur !== 'redirect') {
                    acc[cur] = query[cur]
                }
                return acc
            }, {})
        }
    }
}
</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.login-page {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    height: 100%;
    background: #D5D8DC;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.app-container {
    width: 900px;
    height: 550px;
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 25px 50px rgba(1, 37, 150, 0.15);
    display: flex;
}

.sidebar {
    width: 350px;
    background: #012596;
    padding: 48px 36px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
}

.sidebar::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 400px;
    height: 400px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
}

.sidebar::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -30%;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
}

.brand-section {
    position: relative;
    z-index: 1;
}

.brand-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
}

.brand-logo-img {
    max-width: 180px;
    height: auto;
    object-fit: contain;
}

.sidebar-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: 64px;
}

.sidebar-title .title-row {
    display: flex;
    gap: 8px;
}

.sidebar-title h2 {
    font-size: 34px;
    font-weight: 700;
    color: white;
    line-height: 1.3;
    margin: 0;
}

.sidebar-title .asset {
    color: #cb0514;
}

.feature-list {
    list-style: none;
    margin: 64px 0px 0px 4px;
}

.feature-list li {
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    margin-bottom: 12px;
    padding-left: 24px;
    position: relative;
}

.feature-list li::before {
    content: "✓";
    position: absolute;
    left: 0;
    font-weight: bold;
    color: #cb0514;
}

.footer-text {
    text-align: center;
    z-index: 1;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
}

.main-content {
    flex: 1;
    padding: 48px 52px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.login-header {
    margin-bottom: 36px;
}

.login-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: #17202a;
    margin-bottom: 8px;
}

.login-header p {
    font-size: 14px;
    color: #808080;
}

.form-group {
    margin-bottom: 30px;
}

.form-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #17202a;
    margin-bottom: 10px;
}

::v-deep(.el-input__inner) {
    width: 100%;
    padding: 13px 14px 13px 44px;
    background: #eaecee;
    border: 2px solid #d5d8dc;
    border-radius: 8px;
    font-size: 14px;
    color: #17202a;
    transition: all 0.2s;
}

::v-deep(.el-input__inner:focus) {
    outline: none;
    border-color: #012596;
    background: #ffffff;
}

::v-deep(.el-input__inner::placeholder) {
    color: #abb2b9;
}

::v-deep(.el-input__prefix) {
    color: #808b96;
}

::v-deep(.el-form-item) {
    margin-bottom: 0;
}

.checkbox-row {
    display: flex;
    align-items: center;
    margin: 30px 0px;
}

::v-deep(.remember-checkbox.el-checkbox) {
    display: inline-flex;
    align-items: center;
}

::v-deep(.remember-checkbox .el-checkbox__input) {
    display: flex;
    align-items: center;
}

::v-deep(.remember-checkbox .el-checkbox__inner) {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 1.5px solid #d5d8dc;
    background-color: #ffffff;
    box-sizing: border-box;
}

::v-deep(.remember-checkbox .el-checkbox__input:hover .el-checkbox__inner) {
    border-color: #012596;
}

::v-deep(.remember-checkbox.is-checked .el-checkbox__inner) {
    background-color: #012596;
    border-color: #012596;
}

::v-deep(.remember-checkbox .el-checkbox__inner::after) {
    left: 5px;
    top: 1px;
    width: 4px;
    height: 8px;
    border: 2px solid #ffffff;
    border-top: 0;
    border-left: 0;
    transform: rotate(45deg);
}

::v-deep(.remember-checkbox .el-checkbox__label) {
    font-size: 13px;
    font-weight: 500;
    color: #17202a;
    padding-left: 10px;
    line-height: 18px;
    display: inline-flex;
    align-items: center;
}


::v-deep(.submit-btn.el-button) {
    width: 100%;
    padding: 14px;
    background: #012596;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 16px;
}

::v-deep(.submit-btn.el-button:hover) {
    background: #011d6e;
    transform: translateY(-1px);
}

::v-deep(.submit-btn.el-button:active) {
    transform: translateY(0);
}

.mobile-header {
    display: none;
}

.mobile-footer {
    display: none;
}

@media (max-width: 991px) {
    .sidebar {
        display: none;
    }

    .app-container {
        width: 480px;
        height: auto;
        flex-direction: column;
    }

    .main-content {
        padding: 36px 32px 28px;
    }

    .mobile-header {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-bottom: 50px;
    }

    .mobile-header .brand-logo {
        margin-bottom: 0;
    }

    .mobile-header .brand-logo-img {
        max-width: 100px;
        height: auto;
        object-fit: contain;
    }

    .mobile-footer {
        display: block;
        margin-bottom: 16px;
        text-align: center;
        font-size: 12px;
        color: #808080;
    }

    .mobile-footer::before {
        content: '';
        display: block;
        width: 100%;
        height: 1px;
        background: #d5d8dc;
        margin: 16px 0px;
    }

    .login-header {
        text-align: center;
        margin-bottom: 24px;
    }
}
</style>