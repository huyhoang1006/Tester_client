<template>
    <div v-if="!licensed" class="license-gate">
        <section class="license-gate__panel" aria-live="polite">
            <header class="license-gate__header">
                <img
                    class="license-gate__logo"
                    src="@/assets/images/atdigitaltester_logo.png"
                    alt="AT Digital Tester">
                <el-tooltip v-if="!loading" content="License server configuration" placement="bottom">
                    <el-button
                        class="license-gate__settings"
                        type="text"
                        icon="el-icon-setting"
                        aria-label="License server configuration"
                        @click="showConfiguration = !showConfiguration" />
                </el-tooltip>
            </header>

            <div v-if="loading && !setupLoaded" class="license-gate__checking">
                <i class="el-icon-loading" aria-hidden="true"></i>
                <h1>Checking license</h1>
                <p>Connecting to the license server...</p>
            </div>

            <div v-else class="license-gate__content">
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
                    <div v-if="showConfiguration || !configured" class="license-gate__configuration">
                        <el-form-item label="License server" prop="serverUrl">
                            <el-input
                                v-model.trim="form.serverUrl"
                                placeholder="https://license.example.com"
                                autocomplete="off" />
                        </el-form-item>
                        <el-form-item label="Product ID" prop="productId">
                            <el-input v-model.trim="form.productId" autocomplete="off" />
                        </el-form-item>
                    </div>

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
            configured: false,
            activated: false,
            showConfiguration: false,
            fingerprint: '',
            fingerprintStrategy: '',
            errorCode: '',
            errorMessage: '',
            checkTimer: null,
            form: {
                serverUrl: '',
                productId: '',
                licenseKey: ''
            },
            rules: {
                serverUrl: [{required: true, message: 'License server is required', trigger: 'blur'}],
                productId: [{required: true, message: 'Product ID is required', trigger: 'blur'}],
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
            this.configured = Boolean(data.configured)
            this.activated = Boolean(data.activated)
            this.fingerprint = data.fingerprint || this.fingerprint
            this.fingerprintStrategy = data.fingerprintStrategy || this.fingerprintStrategy
            const config = data.config || {}
            this.form.serverUrl = config.serverUrl || this.form.serverUrl
            this.form.productId = config.productId || this.form.productId
            this.showConfiguration = !this.configured
        },
        setError(result) {
            this.errorCode = (result && result.code) || 'LICENSE_CHECK_FAILED'
            this.errorMessage = (result && result.message) || 'Could not verify the application license.'
            if (result && result.data && result.data.config) {
                this.applySetup({config: result.data.config})
            }
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
                this.setupLoaded = true
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
                    const result = await window.electronAPI.activateOnlineLicense({...this.form})
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
    justify-content: space-between;
    padding: 0 24px;
    border-bottom: 1px solid #e5e8ee;
}

.license-gate__logo {
    display: block;
    width: auto;
    max-width: 190px;
    height: 30px;
    object-fit: contain;
}

.license-gate__settings {
    font-size: 19px;
    color: #576174;
}

.license-gate__content,
.license-gate__checking {
    padding: 28px 30px 30px;
}

.license-gate__checking {
    min-height: 240px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.license-gate__checking > i {
    font-size: 34px;
    color: #123b78;
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

.license-gate__configuration {
    margin-bottom: 4px;
    padding-bottom: 2px;
    border-bottom: 1px solid #e5e8ee;
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

    .license-gate__content,
    .license-gate__checking {
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
