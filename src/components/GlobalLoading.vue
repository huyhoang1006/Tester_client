<template>
    <transition name="loading-fade">
        <el-dialog
            :title="dialogTitle"
            :visible="showModal"
            width="460px"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :show-close="false"
            custom-class="global-progress-dialog"
            append-to-body>

            <div class="prog-body">
                <div class="prog-current">
                    <span class="prog-spinner"><i class="el-icon-loading"></i></span>
                    <span class="prog-label" :title="displayText">{{ displayText }}</span>
                </div>

                <!--
                  CHỈ hiện thanh phần trăm khi biết tổng số bước. Bản trước cộng thêm
                  mỗi 80ms tới 99% rồi ngồi đó — con số hoàn toàn bịa, và tệ hơn cả
                  không có gì: nó khiến người dùng tin là gần xong trong khi việc mới
                  bắt đầu, rồi ngồi đợi ở 99% không biết còn sống hay không.
                -->
                <el-progress
                    v-if="hasRealPercent"
                    :percentage="percent"
                    :stroke-width="14"
                    :text-inside="true"
                    :status="aborted ? 'warning' : 'success'" />

                <!-- Không biết tổng thì hiện vạch chạy vô định: nói "đang làm", không
                     nói "làm được bao nhiêu". -->
                <div v-else class="prog-indeterminate" :class="{ stopping: aborted }">
                    <div class="bar"></div>
                </div>

                <div class="prog-foot">
                    <span class="prog-count">{{ progressHint }}</span>
                    <el-button
                        v-if="showStopButton"
                        size="mini"
                        type="warning"
                        plain
                        :disabled="aborted"
                        @click="onStop">
                        {{ aborted ? 'Stopping...' : 'Stop' }}
                    </el-button>
                </div>
            </div>
        </el-dialog>
    </transition>
</template>

<script>
import { requestAbortLoading } from '@/utils/loading'

const ACTION_TEXTS = {
    delete: 'Deleting...',
    add: 'Adding...',
    duplicate: 'Duplicating...',
    save: 'Saving...',
    move: 'Moving...',
    import: 'Importing...',
    export: 'Exporting...',
    update: 'Updating...',
    download: 'Downloading...',
    upload: 'Uploading...',
    load: 'Loading...',
    default: 'Processing...'
}

const ACTION_TITLES = {
    delete: 'Deleting',
    add: 'Adding',
    duplicate: 'Duplicating',
    save: 'Saving',
    move: 'Moving',
    import: 'Importing',
    export: 'Exporting',
    update: 'Updating',
    download: 'Downloading',
    upload: 'Uploading',
    load: 'Loading',
    default: 'Processing'
}

/** Sau bấy nhiêu giây mới cho phép bấm Dừng — việc ngắn thì nút chỉ gây phân tâm. */
const STOP_BUTTON_AFTER = 5

export default {
    name: 'GlobalLoading',
    data() {
        return {
            showModal: false,
            elapsed: 0,
            elapsedTimer: null,
        }
    },
    computed: {
        isActive() {
            return this.$store.state.loading.active
        },
        aborted() {
            return this.$store.state.loading.aborted
        },
        percent() {
            return this.$store.getters['loading/percent'] || 0
        },
        hasRealPercent() {
            return this.$store.getters['loading/percent'] !== null
        },
        displayText() {
            const state = this.$store.state.loading
            return state.text || ACTION_TEXTS[state.action] || ACTION_TEXTS.default
        },
        dialogTitle() {
            return ACTION_TITLES[this.$store.state.loading.action] || ACTION_TITLES.default
        },
        /**
         * Dòng dưới cùng. Biết tổng thì đếm bước, không biết thì đếm giây — cả hai đều
         * là số THẬT, và số giây tăng đều là bằng chứng rõ nhất rằng chương trình còn
         * sống, thứ mà thanh 99% đứng im không bao giờ cho được.
         */
        progressHint() {
            const { done, total } = this.$store.state.loading
            if (this.aborted) return 'Waiting for the operation to stop...'
            if (total > 0) return `${done}/${total}`
            return `Running ${this.elapsed}s`
        },
        showStopButton() {
            return this.elapsed >= STOP_BUTTON_AFTER
        },
    },
    watch: {
        isActive: {
            immediate: true,
            handler(active) {
                if (active) {
                    this.showModal = true
                    this.elapsed = 0
                    this.startElapsed()
                } else if (this.showModal) {
                    this.stopElapsed()
                    // Đóng ngay, không diễn hoạt "chạy nốt lên 100%" như bản trước:
                    // việc đã xong thật thì kéo dài thêm nửa giây chỉ làm chậm.
                    this.showModal = false
                    this.$nextTick(() => {
                        setTimeout(() => this.$root.$emit('loading-complete'), 300)
                    })
                }
            }
        }
    },
    methods: {
        startElapsed() {
            this.stopElapsed()
            this.elapsedTimer = setInterval(() => { this.elapsed += 1 }, 1000)
        },
        stopElapsed() {
            if (this.elapsedTimer) {
                clearInterval(this.elapsedTimer)
                this.elapsedTimer = null
            }
        },
        onStop() {
            requestAbortLoading(this, 'cancelled by user')
        },
    },
    beforeDestroy() {
        this.stopElapsed()
    }
}
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
    flex: none;
}

.prog-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Vạch chạy vô định: nói "đang làm", không hứa "làm được bao nhiêu". */
.prog-indeterminate {
    height: 14px;
    border-radius: 7px;
    background: #ebeef5;
    overflow: hidden;
}
.prog-indeterminate .bar {
    width: 35%;
    height: 100%;
    border-radius: 7px;
    background: #67c23a;
    animation: slide 1.4s ease-in-out infinite;
}
.prog-indeterminate.stopping .bar {
    background: #e6a23c;
}
@keyframes slide {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(320%); }
}

.prog-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
}

.prog-count {
    font-size: 12px;
    color: #909399;
}

.loading-fade-enter-active { transition: opacity 0.3s ease; }
.loading-fade-leave-active { transition: opacity 0.25s ease; }
.loading-fade-enter,
.loading-fade-leave-to { opacity: 0; }

::v-deep .global-progress-dialog .el-dialog__body {
    padding-top: 14px;
}
</style>
