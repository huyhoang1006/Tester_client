<template>
    <transition name="loading-fade">
        <el-dialog
            :title="dialogTitle"
            :visible="showModal"
            width="420px"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :show-close="false"
            custom-class="global-progress-dialog"
            append-to-body>

            <div class="prog-body">
                <div class="prog-current">
                    <span class="prog-spinner"><i class="el-icon-loading"></i></span>
                    <span class="prog-label">{{ displayText }}</span>
                </div>

                <el-progress
                    :percentage="displayPercent"
                    :stroke-width="14"
                    :text-inside="true"
                    status="success" />

                <div class="prog-count">{{ progressHint }}</div>
            </div>
        </el-dialog>
    </transition>
</template>

<script>
const ACTION_TEXTS = {
    delete: 'Deleting...',
    add: 'Adding...',
    save: 'Saving...',
    move: 'Moving...',
    import: 'Importing...',
    export: 'Exporting...',
    update: 'Updating...',
    download: 'Downloading...',
    load: 'Loading...',
    default: 'Processing...'
};

const ACTION_TITLES = {
    delete: 'Deleting',
    add: 'Adding',
    save: 'Saving',
    move: 'Moving',
    import: 'Importing',
    export: 'Exporting',
    update: 'Updating',
    download: 'Downloading',
    load: 'Loading',
    default: 'Processing'
};

export default {
    name: 'GlobalLoading',
    data() {
        return {
            internalPercent: 0,
            progressInterval: null,
            finishInterval: null,
            showModal: false,
            cachedDisplayText: '',
            cachedAction: 'default'
        };
    },
    computed: {
        isActive() {
            return this.$store.state.loading.active;
        },
        displayText() {
            return this.cachedDisplayText || ACTION_TEXTS.default;
        },
        displayPercent() {
            return parseInt(Math.round(this.internalPercent));
        },
        dialogTitle() {
            return ACTION_TITLES[this.cachedAction] || ACTION_TITLES.default;
        },
        progressHint() {
            return this.displayPercent >= 100 ? 'Completed' : 'Please wait...';
        }
    },
    watch: {
        isActive: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    const customText = this.$store.state.loading.customText;
                    const action = this.$store.state.loading.action;
                    this.cachedDisplayText = customText || ACTION_TEXTS[action] || ACTION_TEXTS.default;
                    this.cachedAction = action || 'default';
                    this.showModal = true;
                    this.internalPercent = 0;
                    this.startProgress();
                } else if (this.showModal) {
                    this.stopProgress();
                    this.finishProgress();
                }
            }
        }
    },
    methods: {
        startProgress() {
            this.stopProgress();
            this.stopFinishProgress();

            this.progressInterval = setInterval(() => {
                if (this.internalPercent < 99) {
                    let increment;
                    if (this.internalPercent < 60) {
                        increment = 3;
                    } else if (this.internalPercent < 75) {
                        increment = 2;
                    } else {
                        increment = 1;
                    }

                    this.internalPercent = Math.min(99, Math.round(this.internalPercent + increment));
                } else {
                    this.stopProgress();
                }
            }, 80);
        },
        finishProgress() {
            this.stopFinishProgress();

            this.finishInterval = setInterval(() => {
                if (this.internalPercent < 100) {
                    this.internalPercent = Math.min(100, this.internalPercent + 10);
                } else {
                    this.stopFinishProgress();
                    setTimeout(() => {
                        this.showModal = false;
                        setTimeout(() => {
                            this.internalPercent = 0;
                            this.$root.$emit('loading-complete');
                        }, 300);
                    }, 250);
                }
            }, 20);
        },
        stopProgress() {
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
                this.progressInterval = null;
            }
        },
        stopFinishProgress() {
            if (this.finishInterval) {
                clearInterval(this.finishInterval);
                this.finishInterval = null;
            }
        }
    },
    beforeDestroy() {
        this.stopProgress();
        this.stopFinishProgress();
    }
};
</script>

<style scoped>
.prog-body {
    padding: 4px 2px;
}

.prog-current {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    font-size: 14px;
    color: #303133;
}

.prog-spinner {
    color: #409eff;
    font-size: 16px;
}

.prog-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.prog-count {
    margin-top: 10px;
    text-align: right;
    font-size: 12px;
    color: #909399;
}

.loading-fade-enter-active {
    transition: opacity 0.3s ease;
}

.loading-fade-leave-active {
    transition: opacity 0.25s ease;
}

.loading-fade-enter,
.loading-fade-leave-to {
    opacity: 0;
}

::v-deep .global-progress-dialog .el-dialog__body {
    padding-top: 14px;
}
</style>
