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
                        <img src="@/assets/images/atenergy_logo_dark.png" class="brand-logo-img" />
                    </div>
                </div>
                <div class="login-header">
                    <h1>{{ greeting.title }}</h1>
                    <p class="login-desc">{{ greeting.desc }}</p>
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
    },
    computed: {
        greeting() {
            const hour = new Date().getHours()

            if (hour >= 5 && hour < 12) {
                return {
                    title: 'Good Morning!',
                    desc: 'Ready to get started for today?'
                }
            }

            if (hour >= 12 && hour < 17) {
                return {
                    title: 'Good Afternoon!',
                    desc: 'Ready to continue where you left off?'
                }
            }

            if (hour >= 17 && hour < 22) {
                return {
                    title: 'Good Evening!',
                    desc: 'Ready to review and wrap things up?'
                }
            }

            return {
                title: 'Good Night!',
                desc: 'Need to check one last thing?'
            }
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
    font-family: 'Segoe UI', sans-serif;
    height: 100%;
    background: url('~@/assets/images/login-background.jpg') no-repeat center center;
    background-size: cover;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative
}

.login-page::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(1, 37, 150, 0.15) 0%, rgba(204, 5, 20, 0.1) 100%);
    backdrop-filter: blue(3px);
    z-index: 0;
}

.app-container {
    width: 900px;
    height: 550px;
    position: relative;
    z-index: 10;
    display: flex;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 24px;
    box-shadow: 0 25px 70px rgba(1, 37, 150, 0.3),
        0 10px 30px rgba(0, 0, 0, 0.15),
        inset 0 1px 1px rgba(255, 255, 255, 0.3);
    overflow: hidden;
}

.sidebar {
    width: 350px;
    background: linear-gradient(165deg, rgba(1, 37, 150, 0.85) 0%, rgba(1, 37, 150, 0.92) 100%);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border-right: 1px solid rgba(255, 255, 255, 0.15);
    padding: 48px 36px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    color: white;
    box-shadow: 5px 0 20px rgba(0, 0, 0, 0.1);
}

.brand-section {
    position: relative;
    z-index: 2;
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
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
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
    color: #cc0514;
}

.feature-list {
    list-style: none;
    margin: 64px 0px 0px 4px;
}

.feature-list li {
    color: rgba(255, 255, 255, 0.95);
    font-size: 14px;
    margin-bottom: 12px;
    padding-left: 24px;
    position: relative;
    font-weight: 500;
}

.feature-list li::before {
    content: "✓";
    position: absolute;
    left: 0;
    font-weight: bold;
    color: #cc0514;
}

.footer-text {
    text-align: center;
    z-index: 1;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
}

.main-content {
    flex: 1;
    padding: 48px 50px;
    background: transparent;
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
    color: #ffffff;
    margin-bottom: 8px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.75);
}

.login-header p {
    font-size: 14px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
    line-height: 1.5;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.75);
}

.form-group {
    margin-bottom: 24px;
}

.form-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 10px;
    margin-left: 5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

::v-deep(.el-input__inner) {
    width: 100%;
    padding: 13px 14px 13px 44px;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    font-size: 14px;
    color: #ffffff;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15),
        inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

::v-deep(.el-input__inner:focus) {
    outline: none;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(15px);
    border: 2px solid rgba(255, 255, 255, 0.9);
    color: #ffffff;
}

::v-deep(.el-input__inner::placeholder) {
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;
}

::v-deep(.el-input__prefix) {
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
}

::v-deep(.el-input__inner:focus::placeholder) {
    color: rgba(255, 255, 255, 0.7);
}

::v-deep(.el-input.is-focus .el-input__prefix) {
    color: rgba(255, 255, 255, 1);
}

::v-deep(.el-form-item) {
    margin-bottom: 0;
}

.checkbox-row {
    display: flex;
    align-items: center;
    margin: 25px 0px;
}

::v-deep(.remember-checkbox .el-checkbox__inner) {
    background-color: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(5px);
    border-color: rgba(255, 255, 255, 0.5);
}

::v-deep(.remember-checkbox .el-checkbox__label) {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 500;
    font-size: 13px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

::v-deep(.remember-checkbox.is-checked .el-checkbox__inner) {
    background-color: #1e5bb8;
    border-color: #1e5bb8;
}

::v-deep(.remember-checkbox.is-checked .el-checkbox__label) {
    color: #ffffff;
}

::v-deep(.submit-btn.el-button) {
    width: 100%;
    padding: 14px;
    background: linear-gradient(180deg, #1e5bb8 0%, #0f3d80 100%);
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 16px;
    box-shadow: 0 4px 15px rgba(30, 91, 184, 0.4),
        0 2px 8px rgba(0, 0, 0, 0.2);
}

::v-deep(.submit-btn.el-button:hover) {
    background: linear-gradient(180deg, #2869cc 0%, #1e5bb8 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(30, 91, 184, 0.5),
        0 4px 12px rgba(0, 0, 0, 0.25);
}

::v-deep(.submit-btn.el-button:active) {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(30, 91, 184, 0.4);
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
        background: rgba(255, 255, 255, 0.15);
    }

    .main-content {
        padding: 36px 32px 28px;
    }

    .mobile-header {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-bottom: 36px;
    }

    .mobile-header .brand-logo {
        margin-bottom: 0;
    }

    .mobile-header .brand-logo-img {
        max-width: 100px;
        height: auto;
        object-fit: contain;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 1));
    }

    .mobile-footer {
        display: block;
        margin-bottom: 16px;
        text-align: center;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .mobile-footer::before {
        content: '';
        display: block;
        width: 100%;
        height: 1px;
        background: rgba(255, 255, 255, 0.3);
        margin: 16px 0px;
    }

    .login-header {
        text-align: center;
        margin-bottom: 36px;
    }
}
</style>