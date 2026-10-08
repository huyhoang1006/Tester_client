<template>
    <div v-if="!licensed" class="license-gate">
        <div v-if="loading && !setupLoaded" class="license-gate__preloader" aria-live="polite">
            <div class="license-gate__brand license-gate__brand--preloader" aria-label="AT License Manager">
                <span class="license-gate__brand-mark" aria-hidden="true">
                    <img src="@/assets/images/atdigitaltester_logo.png" alt="">
                </span>
                <span class="license-gate__brand-name">AT License Manager</span>
            </div>
            <div class="license-gate__preloader-progress" aria-hidden="true">
                <span></span>
            </div>
            <p>Loading application...</p>
        </div>

        <section v-else class="license-gate__panel" aria-live="polite">
            <header class="license-gate__header">
                <div class="license-gate__brand" aria-label="AT License Manager">
                    <span class="license-gate__brand-mark" aria-hidden="true">
                        <img src="@/assets/images/atdigitaltester_logo.png" alt="">
                    </span>
                    <span class="license-gate__brand-name">AT License Manager</span>
                </div>
            </header>

            <div class="license-gate__content">
                <div class="license-gate__title-row">
                    <span class="license-gate__title-icon" aria-hidden="true">
                        <i class="el-icon-key"></i>
                    </span>
                    <div>
                        <h1>Product activation</h1>
                        <p>An active online license is required to use AT Digital Tester.</p>
                    </div>
                </div>

                <el-alert
                    v-if="errorMessage"
                    class="license-gate__alert"
                    :title="errorTitle"
                    :description="errorMessage"
                    type="error"
                    :closable="false"
                    show-icon />

                <div v-if="fingerprint" class="license-gate__device">
                    <span>Device fingerprint</span>
                    <strong>{{ fingerprint }}</strong>
                    <small>{{ fingerprintStrategy || 'Default' }}</small>
                </div>

                <el-form
                    ref="activationForm"
                    :model="form"
                    :rules="rules"
                    label-position="top"
                    @submit.native.prevent="activate">
                    <el-form-item label="License key" prop="licenseKey">
                        <el-input
                            v-model.trim="form.licenseKey"
                            show-password
                            autocomplete="off"
                            @keyup.enter.native="activate" />
                    </el-form-item>
                </el-form>

                <div class="license-gate__actions">
                    <el-button icon="el-icon-close" @click="closeApplication">Close</el-button>
                    <el-button
                        v-if="activated"
                        icon="el-icon-refresh"
                        :loading="loading"
                        @click="checkLicense">
                        Retry
                    </el-button>
                    <el-button
                        type="primary"
                        icon="el-icon-check"
                        :loading="activating"
                        :disabled="loading && !activating"
                        @click="activate">
                        Activate
                    </el-button>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
const LICENSE_CHECK_INTERVAL_MS = 5 * 60 * 1000

export default {
    name: 'OnlineLicenseGate',
    data() {
        return {
            licensed: false,
            loading: true,
            activating: false,
            setupLoaded: false,
            activated: false,
            fingerprint: '',
            fingerprintStrategy: '',
            errorCode: '',
            errorMessage: '',
            checkTimer: null,
            form: {
                licenseKey: ''
            },
            rules: {
                licenseKey: [{required: true, message: 'License key is required', trigger: 'blur'}]
            }
        }
    },
    computed: {
        errorTitle() {
            if (this.errorCode === 'LICENSE_SERVER_UNREACHABLE') return 'License server unavailable'
            if (this.errorCode === 'FINGERPRINT_HELPER_NOT_FOUND') return 'Fingerprint helper missing'
            if (this.errorCode === 'LICENSE_CONFIG_REQUIRED') return 'License server is not configured'
            if (this.errorCode === 'LICENSE_DEVICE_CHANGED') return 'Device changed'
            return 'License verification failed'
        }
    },
    mounted() {
        const bypassed = process.env.IS_TEST
            || (process.env.NODE_ENV === 'development'
                && process.env.VUE_APP_LICENSE_ENFORCEMENT === 'disabled')
        if (bypassed) {
            this.setLicensed(true)
            return
        }
        this.initialize()
    },
    beforeDestroy() {
        this.stopPeriodicCheck()
    },
    methods: {
        applySetup(data) {
            if (!data) return
            this.activated = Boolean(data.activated)
            this.fingerprint = data.fingerprint || this.fingerprint
            this.fingerprintStrategy = data.fingerprintStrategy || this.fingerprintStrategy
        },
        setError(result) {
            this.errorCode = (result && result.code) || 'LICENSE_CHECK_FAILED'
            this.errorMessage = (result && result.message) || 'Could not verify the application license.'
        },
        clearError() {
            this.errorCode = ''
            this.errorMessage = ''
        },
        setLicensed(value) {
            this.licensed = value
            this.$emit('licensed-change', value)
            if (value) this.startPeriodicCheck()
            else this.stopPeriodicCheck()
        },
        async initialize() {
            this.loading = true
            this.clearError()
            try {
                const setup = await window.electronAPI.getOnlineLicenseSetup()
                if (!setup.success) {
                    this.setError(setup)
                    return
                }
                this.applySetup(setup.data)
                if (setup.data.activated) await this.checkLicense()
            } catch (error) {
                this.setError({message: error.message})
            } finally {
                this.setupLoaded = true
                this.loading = false
            }
        },
        async checkLicense() {
            this.loading = true
            this.clearError()
            try {
                const result = await window.electronAPI.checkOnlineLicense()
                if (!result.success) {
                    this.setLicensed(false)
                    this.setError(result)
                    return
                }

                this.applySetup(result.data)
                if (result.data.licensed) {
                    this.setLicensed(true)
                } else {
                    this.setLicensed(false)
                    this.errorCode = result.data.code || 'LICENSE_INVALID'
                    this.errorMessage = result.data.message || 'Activate AT Digital Tester to continue.'
                }
            } catch (error) {
                this.setLicensed(false)
                this.setError({message: error.message})
            } finally {
                this.loading = false
            }
        },
        activate() {
            this.$refs.activationForm.validate(async valid => {
                if (!valid || this.activating) return
                this.activating = true
                this.clearError()
                try {
                    const result = await window.electronAPI.activateOnlineLicense({licenseKey: this.form.licenseKey})
                    if (!result.success) {
                        this.setError(result)
                        return
                    }
                    this.applySetup({...result.data, configured: true, activated: true})
                    this.form.licenseKey = ''
                    this.$message.success('AT Digital Tester activated successfully')
                    this.setLicensed(true)
                } catch (error) {
                    this.setError({message: error.message})
                } finally {
                    this.activating = false
                }
            })
        },
        startPeriodicCheck() {
            this.stopPeriodicCheck()
            this.checkTimer = setInterval(() => this.checkLicense(), LICENSE_CHECK_INTERVAL_MS)
        },
        stopPeriodicCheck() {
            if (this.checkTimer) clearInterval(this.checkTimer)
            this.checkTimer = null
        },
        closeApplication() {
            window.electronAPI.closeApp()
        }
    }
}
</script>

<style lang="scss" scoped>
.license-gate {
    position: fixed;
    inset: 0;
    z-index: 1900;
    display: grid;
    place-items: center;
    padding: 24px;
    box-sizing: border-box;
    background: #f2f4f7;
    color: #202936;
}

.license-gate__panel {
    width: min(560px, 100%);
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    background: #ffffff;
    border: 1px solid #d9dee7;
    border-radius: 6px;
    box-shadow: 0 16px 40px rgba(20, 32, 52, 0.16);
}

.license-gate__header {
    min-height: 60px;
    display: flex;
    align-items: center;
    padding: 0 24px;
    border-bottom: 1px solid #e5e8ee;
}

.license-gate__brand {
    display: flex;
    align-items: center;
    gap: 12px;
}

.license-gate__brand-mark {
    flex: 0 0 52px;
    width: 52px;
    height: 34px;
    overflow: hidden;
}

.license-gate__brand-mark img {
    display: block;
    width: auto;
    max-width: none;
    height: 34px;
}

.license-gate__brand-name {
    font-size: 18px;
    line-height: 1.2;
    font-weight: 600;
    color: #202936;
    letter-spacing: 0;
}

.license-gate__content {
    padding: 28px 30px 30px;
}

.license-gate__preloader {
    width: min(360px, 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.license-gate__brand--preloader {
    gap: 14px;
}

.license-gate__brand--preloader .license-gate__brand-mark {
    flex-basis: 62px;
    width: 62px;
    height: 40px;
}

.license-gate__brand--preloader .license-gate__brand-mark img {
    height: 40px;
}

.license-gate__brand--preloader .license-gate__brand-name {
    font-size: 22px;
}

.license-gate__preloader-progress {
    width: min(280px, 100%);
    height: 4px;
    margin-top: 28px;
    overflow: hidden;
    background: #dce2eb;
}

.license-gate__preloader-progress span {
    display: block;
    width: 38%;
    height: 100%;
    background: #123b78;
    animation: license-preload 1.2s ease-in-out infinite;
}

.license-gate__preloader p {
    margin-top: 14px;
    font-size: 13px;
}

@keyframes license-preload {
    0% { transform: translateX(-110%); }
    100% { transform: translateX(300%); }
}

.license-gate h1 {
    margin: 0;
    font-size: 22px;
    line-height: 1.35;
    font-weight: 500;
    letter-spacing: 0;
}

.license-gate p {
    margin: 6px 0 0;
    color: #657084;
    line-height: 1.5;
}

.license-gate__title-row {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 22px;
}

.license-gate__title-icon {
    flex: 0 0 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 6px;
    background: #eaf1fb;
    color: #123b78;
    font-size: 21px;
}

.license-gate__alert {
    margin-bottom: 20px;
}

.license-gate__device {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    margin-bottom: 20px;
    padding: 11px 12px;
    background: #f6f8fb;
    border-left: 3px solid #123b78;
    color: #596579;
}

.license-gate__device strong {
    min-width: 0;
    overflow-wrap: anywhere;
    color: #202936;
    font-family: Consolas, monospace;
    font-weight: 500;
}

.license-gate__device small {
    color: #7c8595;
}

.license-gate__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 8px;
}

@media (max-width: 640px) {
    .license-gate {
        padding: 12px;
    }

    .license-gate__panel {
        max-height: calc(100vh - 24px);
    }

    .license-gate__content {
        padding: 22px 18px 20px;
    }

    .license-gate__device {
        grid-template-columns: 1fr;
        gap: 4px;
    }

    .license-gate__actions {
        flex-wrap: wrap;
    }
}
</style>
