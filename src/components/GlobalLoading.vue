<template>
    <transition name="loading-fade">
        <div v-if="showModal" class="global-loading-mask">
            <div class="loading-modal">
                <p class="loading-text">{{ displayText }}</p>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: internalPercent + '%' }"></div>
                    </div>
                    <span class="progress-percent">{{ internalPercent }}%</span>
                </div>
            </div>
        </div>
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
    default: 'Processing...'
};

export default {
    name: 'GlobalLoading',
    data() {
        return {
            internalPercent: 0,
            progressInterval: null,
            showModal: false,
            cachedDisplayText: ''
        };
    },
    computed: {
        isActive() {
            return this.$store.state.loading.active;
        },
        displayText() {
            // Trả về cached text hoặc text từ store
            return this.cachedDisplayText || ACTION_TEXTS.default;
        }
    },
    watch: {
        isActive: {
            immediate: true,
            handler(newVal) {
                console.log('[GlobalLoading] isActive changed:', newVal);
                if (newVal) {
                    // Cache display text khi loading bắt đầu
                    const customText = this.$store.state.loading.customText;
                    const action = this.$store.state.loading.action;
                    this.cachedDisplayText = customText || ACTION_TEXTS[action] || ACTION_TEXTS.default;
                    
                    console.log('[GlobalLoading] Starting - Text:', this.cachedDisplayText);
                    
                    // Hiển thị modal, reset về 0 và chạy progress
                    this.showModal = true;
                    this.internalPercent = 0;
                    this.startProgress();
                } else {
                    console.log('[GlobalLoading] Stopping - Running finishProgress');
                    // Kết thúc loading: chạy siêu nhanh đến 100%, sau đó mới ẩn modal
                    this.stopProgress();
                    this.finishProgress();
                }
            }
        }
    },
    methods: {
        startProgress() {
            this.stopProgress(); // Clear interval cũ nếu có
            
            this.progressInterval = setInterval(() => {
                if (this.internalPercent < 99) {
                    // Tính toán tốc độ tăng - chạy nhanh hơn để bắt kịp tác vụ
                    let increment;
                    if (this.internalPercent < 60) {
                        increment = 3; // Chạy siêu nhanh 0-60%
                    } else if (this.internalPercent < 75) {
                        increment = 2; // Chạy nhanh 60-75%
                    } else if (this.internalPercent < 85) {
                        increment = 1; // Chậm lại 75-85%
                    } else if (this.internalPercent < 92) {
                        increment = 0.5; // Chậm hơn 85-92%
                    } else {
                        increment = 0.2; // Cực chậm 92-99%
                    }
                    
                    this.internalPercent = Math.min(99, this.internalPercent + increment);
                } else {
                    // Dừng lại ở 99% và không tự động tăng nữa
                    this.stopProgress();
                }
            }, 80); // Cập nhật mỗi 80ms (nhanh hơn)
        },
        finishProgress() {
            // Chạy siêu nhanh từ vị trí hiện tại lên 100%
            const finishInterval = setInterval(() => {
                if (this.internalPercent < 100) {
                    this.internalPercent = Math.min(100, this.internalPercent + 10); // Nhảy 10% mỗi lần (siêu nhanh)
                } else {
                    clearInterval(finishInterval);
                    // Đợi 300ms ở 100% để người dùng thấy rõ
                    setTimeout(() => {
                        this.showModal = false; // Ẩn modal sau khi đạt 100%
                        // Đợi transition hoàn tất (400ms) rồi emit event
                        setTimeout(() => {
                            this.internalPercent = 0;
                            // Emit event để thông báo loading đã hoàn tất
                            this.$root.$emit('loading-complete');
                        }, 400);
                    }, 300);
                }
            }, 20); // Cập nhật mỗi 20ms (siêu siêu nhanh)
        },
        stopProgress() {
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
                this.progressInterval = null;
            }
        }
    },
    beforeDestroy() {
        this.stopProgress();
    }
};
</script>

<style scoped>
/* Backdrop: Loại bỏ background mờ, chỉ giữ lại để center modal */
.global-loading-mask {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 2500;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none; /* Cho phép click qua backdrop */
}

/* Modal: Glassmorphism nhẹ nhàng hơn - Giống el-dialog */
.loading-modal {
    background: #ffffff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 30px 40px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 280px;
    pointer-events: auto; /* Modal có thể tương tác */
}

/* Text: Hiển thị phía trên thanh progress */
.loading-text {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin: 0 0 20px 0;
    text-align: center;
}

/* Container cho thanh progress và % */
.progress-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

/* Thanh progress nền */
.progress-bar {
    width: 100%;
    height: 6px;
    background: #ebeef5;
    border-radius: 100px;
    overflow: hidden;
    position: relative;
}

/* Thanh progress chạy - Màu xanh #409EFF giống Element UI */
.progress-fill {
    height: 100%;
    background: #409EFF;
    border-radius: 100px;
    transition: width 0.3s ease;
}

/* Hiển thị phần trăm */
.progress-percent {
    font-size: 13px;
    font-weight: 600;
    color: #409EFF;
    min-width: 45px;
    text-align: center;
}

/* Chuyển động: Mượt mà với fade và scale */
.loading-fade-enter-active {
    transition: all 0.3s ease;
}

.loading-fade-leave-active {
    transition: all 0.25s ease;
}

.loading-fade-enter,
.loading-fade-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

/* Animation modal khi xuất hiện */
.loading-modal {
    animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
</style>