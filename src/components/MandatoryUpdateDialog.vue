<template>
    <div>
        <el-dialog
            custom-class="mandatory-update-dialog"
            title="Update required"
            :visible="dialogVisible"
            :before-close="closeApplication"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :show-close="true"
            :modal="true"
            append-to-body
            width="460px">
            <div class="mandatory-update-dialog__body">
                <div class="mandatory-update-dialog__icon" aria-hidden="true">
                    <i class="fas fa-cloud-download-alt"></i>
                </div>
                <div class="mandatory-update-dialog__content">
                    <strong>AT Digital Tester {{ versionLabel }} is available</strong>
                    <p>This update must be installed before you can continue using the application.</p>
                </div>
            </div>

            <div v-if="downloading || installing" class="mandatory-update-dialog__progress">
                <el-progress
                    :percentage="downloadProgress"
                    :status="downloadProgress === 100 ? 'success' : undefined">
                </el-progress>
                <span>{{ installing ? 'Installing update...' : `Downloading update... ${downloadProgress}%` }}</span>
            </div>

            <div v-if="downloadError" class="mandatory-update-dialog__error">
                {{ downloadError }}
            </div>

            <span slot="footer" class="mandatory-update-dialog__footer">
                <el-button
                    type="primary"
                    :loading="downloading || installing"
                    :disabled="downloading || installing"
                    @click="downloadUpdate">
                    <i v-if="!downloading && !installing" class="fas fa-download" aria-hidden="true"></i>
                    {{ updateButtonLabel }}
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'MandatoryUpdateDialog',
    data() {
        return {
            dialogVisible: false,
            version: '',
            downloading: false,
            installing: false,
            downloadProgress: 0,
            downloadError: '',
            startupCheckInProgress: false,
            startupResolved: false,
            hourlyCheckTimer: null
        }
    },
    computed: {
        serviceDomain() {
            return this.$store.state.serviceAddr || localStorage.getItem('SERVICE_ADDR') || ''
        },
        versionLabel() {
            return this.version ? `v${this.version}` : ''
        },
        updateButtonLabel() {
            if (this.installing) return 'Installing...'
            if (this.downloading) return 'Downloading...'
            return 'Update'
        }
    },
    mounted() {
        this.registerUpdateEvents()
        this.initializeUpdateFlow()
    },
    watch: {
        serviceDomain(value) {
            if (!value) return
            this.scheduleHourlyChecks()
            if (!this.startupResolved && !this.startupCheckInProgress) this.initializeUpdateFlow()
        }
    },
    beforeDestroy() {
        if (this.hourlyCheckTimer) clearInterval(this.hourlyCheckTimer)
    },
    methods: {
        registerUpdateEvents() {
            if (!window.electronAPI) return

            window.electronAPI.onUpdateAvailable((info) => {
                if (this.dialogVisible && info && info.version) this.version = info.version
            })

            window.electronAPI.onUpdateError((message) => {
                if (this.dialogVisible) {
                    this.downloading = false
                    this.installing = false
                    this.downloadError = message || 'Unable to download the update. Please try again.'
                }
            })

            window.electronAPI.onDownloadProgress((progress) => {
                const percentage = Number(progress && progress.percent)
                this.downloadProgress = Number.isFinite(percentage)
                    ? Math.min(100, Math.max(0, Math.round(percentage)))
                    : 0
            })

            window.electronAPI.onUpdateDownloaded(() => {
                this.downloading = false
                this.installing = true
                this.downloadProgress = 100
            })
        },
        async initializeUpdateFlow() {
            if (!window.electronAPI || !window.electronAPI.checkForStartupUpdate) {
                this.startupResolved = true
                return
            }

            this.startupCheckInProgress = true
            try {
                const result = await window.electronAPI.checkForStartupUpdate(this.serviceDomain)
                const state = result && result.success ? result.data : null
                if (state && state.mandatory) {
                    this.version = state.version || ''
                    this.dialogVisible = true
                }
                this.startupResolved = Boolean(this.serviceDomain) || Boolean(state && state.mandatory)
            } catch {
                this.startupResolved = Boolean(this.serviceDomain)
            } finally {
                this.startupCheckInProgress = false
                this.scheduleHourlyChecks()
            }
        },
        scheduleHourlyChecks() {
            if (this.hourlyCheckTimer || !this.serviceDomain) return
            this.hourlyCheckTimer = setInterval(() => this.checkForBackgroundUpdate(), 60 * 60 * 1000)
        },
        async checkForBackgroundUpdate() {
            if (this.dialogVisible || !this.serviceDomain) return
            if (!window.electronAPI || !window.electronAPI.checkForBackgroundUpdate) return

            try {
                await window.electronAPI.checkForBackgroundUpdate(this.serviceDomain)
            } catch {
                return
            }
        },
        async downloadUpdate() {
            this.downloading = true
            this.downloadProgress = 0
            this.downloadError = ''

            try {
                const result = await window.electronAPI.downloadUpdate(this.serviceDomain)
                if (result && result.success) return

                this.downloading = false
                this.downloadError = result && (result.message || result.error)
                    ? result.message || result.error
                    : 'Unable to download the update. Please try again.'
            } catch (error) {
                this.downloading = false
                this.downloadError = error && error.message
                    ? error.message
                    : 'Unable to download the update. Please try again.'
            }
        },
        closeApplication() {
            window.electronAPI.closeApp()
        }
    }
}
</script>

<style lang="scss">
.mandatory-update-dialog {
    max-width: calc(100vw - 32px);
    border-radius: 6px;
}

.mandatory-update-dialog .el-dialog__header {
    padding: 20px 24px 14px;
    border-bottom: 1px solid #e4e8ef;
}

.mandatory-update-dialog .el-dialog__title {
    color: #1f2937;
    font-size: 18px;
    font-weight: 700;
}

.mandatory-update-dialog .el-dialog__body {
    padding: 24px;
}

.mandatory-update-dialog__body {
    display: flex;
    align-items: flex-start;
    gap: 16px;
}

.mandatory-update-dialog__icon {
    flex: 0 0 46px;
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: #eaf0ff;
    color: #0b3daa;
    font-size: 21px;
}

.mandatory-update-dialog__content {
    min-width: 0;
    color: #374151;
}

.mandatory-update-dialog__content strong {
    display: block;
    margin-bottom: 7px;
    color: #1f2937;
    font-size: 15px;
}

.mandatory-update-dialog__content p {
    margin: 0;
    line-height: 1.55;
    font-size: 13px;
}

.mandatory-update-dialog__progress {
    margin-top: 22px;
}

.mandatory-update-dialog__progress span {
    display: block;
    margin-top: 8px;
    color: #606b7a;
    font-size: 12px;
    text-align: center;
}

.mandatory-update-dialog__error {
    margin-top: 18px;
    padding: 10px 12px;
    border: 1px solid #f3c7c7;
    border-radius: 4px;
    background: #fff3f3;
    color: #b42318;
    font-size: 12px;
    line-height: 1.45;
}

.mandatory-update-dialog .el-dialog__footer {
    padding: 14px 24px 20px;
    border-top: 1px solid #e4e8ef;
}

.mandatory-update-dialog__footer {
    display: flex;
    justify-content: flex-end;
}

.mandatory-update-dialog__footer .el-button {
    min-width: 116px;
}

.mandatory-update-dialog__footer .el-button i {
    margin-right: 7px;
}
</style>
