<template>
    <div id="login" class="login-page"
        :style="{ backgroundImage: `url(${require('@/assets/images/login-background.jpg')})` }">
        <div class="app-container">
            <div class="sidebar">
                <div class="brand-section">
                    <div class="brand-logo no-select">
                        <img src="@/assets/images/atenergy_logo_dark.png" class="brand-logo-img" draggable="false"/>
                    </div>
                    <div class="sidebar-title no-select">
                        <div class="title-row">
                            <h2 class="asset">Asset</h2>
                            <h2>Health</h2>
                        </div>
                        <h2>Management</h2>
                    </div>
                    <ul class="feature-list no-select">
                        <li>Asset data modeling</li>
                        <li>Maintenance strategy selection</li>
                        <li>Evaluation of test results</li>
                    </ul>
                </div>
                <div class="footer-text no-select">Standard by IEC 61968</div>
            </div>
            <div class="main-content">
                <div class="mobile-header no-select">
                    <div class="brand-logo">
                        <img src="@/assets/images/atenergy_logo_dark.png" class="brand-logo-img" draggable="false" />
                    </div>
                </div>
                <div class="login-header no-select">
                    <h1>{{ greeting.title }}</h1>
                    <p class="login-desc">{{ greeting.desc }}</p>
                </div>
                <div class="sso-login-panel">
                    <div class="sso-icon"><i class="fas fa-shield-alt"></i></div>
                    <p>Use your organisation account to continue.</p>
                    <el-button class="submit-btn" :class="{ 'is-pending': loadingLogin }" type="primary"
                        @click="loginWithSso(false)">
                        <template v-if="loadingLogin">
                            <i class="el-icon-loading"></i> {{ ssoStatus }} (click to cancel)
                        </template>
                        <template v-else><i class="fas fa-sign-in-alt"></i> Login with SSO</template>
                    </el-button>
                    <el-button class="switch-account-btn" type="text" :disabled="loadingLogin"
                        @click="loginWithSso(true)">
                        <i class="fas fa-user-circle"></i> Use another account
                    </el-button>
                </div>
            </div>
            <div class="mobile-footer no-select">
                Standard by IEC 61968
            </div>
        </div>
    </div>
</template>

<script>
import * as userApi from '@/api/user'
import { createSsoRedirectUri, requireSsoReauthentication } from '@/utils/sso'

export default {
    name: 'LoginView',
    data() {
        return {
            loadingLogin: false,
            ssoAttempt: 0,
            ssoStatus: '',
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
        async loginWithSso(forceLogin = false) {
            if (this.loadingLogin) {
                this.ssoAttempt++
                if (window.electronAPI && window.electronAPI.cancelSsoWindow) {
                    await window.electronAPI.cancelSsoWindow()
                }
                this.loadingLogin = false
                return
            }

            this.loadingLogin = true
            this.ssoStatus = 'Connecting to login server...'
            const attempt = ++this.ssoAttempt
            let stage = 'login_url'
            try {
                if (!window.electronAPI || !window.electronAPI.openSsoLogin) {
                    throw new Error('SSO login is only available in the desktop application')
                }
                const redirectUri = createSsoRedirectUri()
                const loginResponse = await userApi.getSsoLoginUrl(redirectUri, { forceLogin })
                if (attempt !== this.ssoAttempt) return
                if (!loginResponse || loginResponse.code !== 1 || !loginResponse.data) {
                    throw new Error((loginResponse && loginResponse.message) || 'Unable to get SSO login URL')
                }

                stage = 'browser'
                this.ssoStatus = 'Waiting for sign-in...'
                const loginUrl = forceLogin
                    ? requireSsoReauthentication(loginResponse.data)
                    : loginResponse.data
                const openLogin = forceLogin && window.electronAPI.openSsoLoginFresh
                    ? window.electronAPI.openSsoLoginFresh
                    : window.electronAPI.openSsoLogin
                const callback = await openLogin(loginUrl, redirectUri)
                if (attempt !== this.ssoAttempt) return
                if (!callback || callback.canceled) return
                if (!callback.success || !callback.code) {
                    throw new Error((callback && callback.message) || 'SSO login failed')
                }

                stage = 'access-token'
                this.ssoStatus = 'Completing sign-in with login server...'
                const tokenResponse = await userApi.exchangeSsoCode(callback.code)
                if (attempt !== this.ssoAttempt) return
                if (!tokenResponse || tokenResponse.code !== 1 || !tokenResponse.data) {
                    throw new Error((tokenResponse && tokenResponse.message) || 'Unable to exchange SSO code')
                }

                this.$helper.afterSsoLogin(tokenResponse.data)
                this.$message.success('Login successfully')
                await this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
                if (window.electronAPI && window.electronAPI.focusApp) {
                    await window.electronAPI.focusApp()
                }
            } catch (error) {
                if (attempt !== this.ssoAttempt) return
                const responseData = error && error.response && error.response.data
                const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
                const timeoutMessage = timedOut && stage === 'access-token'
                    ? 'Browser authorization was received, but the login server did not return a session within 20 seconds (access-token). Please check the login server and try signing in again.'
                    : timedOut && stage === 'login_url'
                        ? 'The login server did not return the sign-in URL within 20 seconds. Please check the login server connection.'
                        : null
                const message = timeoutMessage || (responseData && (responseData.message || responseData.error_description))
                    || error.message
                    || 'Login failed'
                this.$message.error(message)
            } finally {
                if (attempt === this.ssoAttempt) this.loadingLogin = false
            }
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

<style lang="scss" scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.login-page {
    font-family: 'Segoe UI', sans-serif;
    height: 100%;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
}

.login-page::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(1, 37, 150, 0.15) 0%, rgba(204, 5, 20, 0.1) 100%);
    /* backdrop-filter: blur(5px); */
    z-index: 0;
}

.app-container {
    width: 900px;
    height: 550px;
    position: relative;
    z-index: 10;
    display: flex;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 24px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3),
        0 10px 20px rgba(0, 0, 0, 0.15),
        inset 0 1px 1px rgba(255, 255, 255, 0.4);
    overflow: hidden;
}

.sidebar {
    width: 350px;
    background: linear-gradient(165deg, rgba(1, 37, 150, 0.85) 0%, rgba(1, 37, 150, 0.92) 100%);
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
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

.sso-login-panel {
    text-align: center;
}

.sso-login-panel p {
    margin: 0 0 24px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.55);
}

.sso-icon {
    width: 52px;
    height: 52px;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.35);
    color: #fff;
    font-size: 22px;
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
    color: rgba(255, 255, 255, 0.8) !important;
    transition: all 0.2s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15),
        inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

::v-deep(.el-input__inner:focus) {
    outline: none;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(15px);
    border: 2px solid rgba(255, 255, 255, 0.9);
    color: #ffffff !important;
}

::v-deep(.el-input__inner::placeholder) {
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.2s ease;
}

::v-deep(.el-input__prefix) {
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.2s ease;
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

.submit-btn.el-button {
    width: 100%;
    padding: 14px;
    background: linear-gradient(180deg, #1e5bb8 0%, #0f3d80 100%);
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 16px;
    box-shadow: 0 4px 15px rgba(30, 91, 184, 0.4),
        0 2px 8px rgba(0, 0, 0, 0.2);
}

.submit-btn.el-button:hover {
    background: linear-gradient(180deg, #2869cc 0%, #1e5bb8 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(30, 91, 184, 0.5),
        0 4px 12px rgba(0, 0, 0, 0.25);
}

.submit-btn.el-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(30, 91, 184, 0.4);
}

.switch-account-btn.el-button {
    margin: 0;
    padding: 8px 12px;
    color: rgba(255, 255, 255, 0.92);
    font-size: 14px;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.55);
}

.switch-account-btn.el-button:hover,
.switch-account-btn.el-button:focus {
    color: #ffffff;
    text-decoration: underline;
}

.switch-account-btn.el-button.is-disabled {
    color: rgba(255, 255, 255, 0.45);
}

.mobile-header {
    display: none;
}

.mobile-footer {
    display: none;
}

.no-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-user-drag: none;
    cursor: default;
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
