<template>
    <transition name="loading-fade">
        <div v-if="isActive" class="global-loading-mask">
            <div class="loading-modal">
                <div class="icon-wrapper">
                    <i class="el-icon-loading loading-icon"></i>
                </div>
                <p class="loading-text">{{ displayText }}</p>
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
    computed: {
        isActive() {
            return this.$store.state.loading.active;
        },
        displayText() {
            const customText = this.$store.state.loading.customText;
            const action = this.$store.state.loading.action;
            return customText || ACTION_TEXTS[action] || ACTION_TEXTS.default;
        }
    }
};
</script>

<style scoped>
/* Backdrop: Làm sâu hơn với Gradient để nổi bật hiệu ứng Glass */
.global-loading-mask {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 2500;
    background: radial-gradient(circle, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Modal: Glassmorphism hiện đại (viền sáng, bóng đổ mềm) */
.loading-modal {
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    padding: 35px 50px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 220px;
}

/* Hiệu ứng Icon: Thêm đổ bóng nhẹ để icon không bị bẹt */
.icon-wrapper {
    margin-bottom: 20px;
}

.loading-icon {
    font-size: 50px;
    color: #409EFF; /* Màu xanh đặc trưng Element UI hoặc #606266 nếu muốn giữ xám */
    filter: drop-shadow(0 0 8px rgba(64, 158, 255, 0.3));
}

/* Text: Tăng spacing cho chuyên nghiệp */
.loading-text {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.8px;
    color: #303133;
    margin: 0;
    text-align: center;
}

/* Chuyển động: Mượt mà hơn với Scale và Opacity */
.loading-fade-enter-active,
.loading-fade-leave-active {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.loading-fade-enter,
.loading-fade-leave-to {
    opacity: 0;
    transform: scale(1.05);
}

/* Animation modal khi xuất hiện (Spring effect nhẹ) */
@keyframes modalSlideUp {
    from {
        opacity: 0;
        transform: translateY(15px) scale(0.98);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
</style>