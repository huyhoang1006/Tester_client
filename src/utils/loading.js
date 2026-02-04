/**
 * Global Loading Utility
 */

if (typeof document !== 'undefined' && !document.getElementById('v-loading-style')) {
    const style = document.createElement('style');
    style.id = 'v-loading-style';
    style.innerHTML = `
        .v-loading-mask.el-loading-mask {
            backdrop-filter: blur(10px) saturate(160%);
            -webkit-backdrop-filter: blur(10px) saturate(160%);
            background-color: rgba(255, 255, 255, 0.4) !important;
        }
        .v-loading-mask .el-loading-spinner {
            display: flex; flex-direction: column; align-items: center; top: 45% !important;
        }
        .v-loading-mask .el-icon-loading { font-size: 55px !important; margin-bottom: 20px !important; }
        .v-loading-mask .el-loading-text { font-size: 16px !important; font-weight: bold; margin-bottom: 25px !important; text-transform: uppercase; letter-spacing: 1px; }

        .v-loading-mask .el-loading-spinner::after { content: ''; width: 250px; height: 8px; background: rgba(0, 0, 0, 0.08); border-radius: 10px; display: block; }
        .v-loading-mask .el-loading-spinner::before { 
            content: ''; position: absolute; bottom: 0; left: 50%; margin-left: -125px; 
            width: 0; height: 8px; border-radius: 10px; z-index: 10; 
        }

        /* Chỉnh animation sử dụng biến --progress-speed, mặc định là 0.5s */
        .v-loading-danger .el-loading-spinner::before { 
            background: #cc0514; 
            animation: vProgress var(--progress-speed, 0.5s) linear forwards; 
        }
        .v-loading-primary .el-loading-spinner::before { 
            background: #409EFF; 
            animation: vProgress var(--progress-speed, 0.5s) linear forwards; 
        }

        .v-loading-mask.is-infinity .el-loading-spinner::before {
            animation-iteration-count: infinite !important;
        }

        .v-loading-danger .el-icon-loading, .v-loading-danger .el-loading-text { color: #cc0514 !important; }
        .v-loading-primary .el-icon-loading, .v-loading-primary .el-loading-text { color: #409EFF !important; }

        @keyframes vProgress { from { width: 0; } to { width: 250px; } }
    `;
    document.head.appendChild(style);
}

export const startLoading = (vm, { text = 'Processing...', isDanger = false, type = 'default' } = {}) => {
    // Lấy giá trị từ Store
    const timeouts = vm.$store.state.timeouts || { default: 500, heavy: 0 };
    const timeoutValue = timeouts[type];

    // Tính toán thời gian animation
    const isHeavy = timeoutValue === 0;
    // Ép kiểu số để tránh lỗi tính toán: (500 / 1000) = 0.5
    const animationDuration = isHeavy ? '2s' : (Number(timeoutValue) / 1000) + 's';

    const themeClass = isDanger ? 'v-loading-danger' : 'v-loading-primary';
    const infinityClass = isHeavy ? 'is-infinity' : '';

    const instance = vm.$loading({
        lock: true,
        text: text,
        spinner: 'el-icon-loading',
        background: 'transparent',
        customClass: `v-loading-mask ${themeClass} ${infinityClass}`
    });

    // CẬP NHẬT BIẾN CSS NGAY LẬP TỨC
    vm.$nextTick(() => {
        // Tìm tất cả các mask đang hiện và áp dụng style
        const masks = document.querySelectorAll('.v-loading-mask');
        masks.forEach(mask => {
            mask.style.setProperty('--progress-speed', animationDuration);
        });
    });

    return { instance, timeoutValue };
};