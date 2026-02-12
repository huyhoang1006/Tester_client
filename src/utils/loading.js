/**
 * Global Loading Utility - Vuex Store Wrapper
 * 
 * Wrapper functions để dispatch actions lên Vuex Store
 * Giúp giữ nguyên cách gọi hàm ở các file nghiệp vụ
 * nhưng quản lý trạng thái tập trung trong Store
 */

/**
 * Start loading - Dispatch action lên Vuex Store
 * @param {Object} vm - Vue instance
 * @param {Object} options - Configuration options
 * @param {string} options.action - Action type (delete, add, save, etc.)
 * @param {string} options.customText - Custom text to override default
 * @param {string} options.type - Timeout type from store (default, heavy)
 * @returns {Object} { close: Function, timeoutValue: number }
 */
export const startLoading = (vm, { action = 'default', customText = null, type = 'default' } = {}) => {
    console.log('[startLoading] Called with:', { action, customText, type });
    
    // Dispatch action lên Vuex Store
    if (vm && vm.$store) {
        console.log('[startLoading] Dispatching to store...');
        vm.$store.dispatch('loading/start', { action, customText, type });
        console.log('[startLoading] Store state after dispatch:', vm.$store.state.loading);
    } else {
        console.error('Vue instance or Store not available');
    }

    // Lấy timeout value từ store (nếu có)
    const timeouts = vm?.$store?.state?.timeouts || { default: 10000, heavy: 30000 };
    const timeoutValue = timeouts[type] || 10000;

    // Trả về object tương thích với API cũ
    return {
        close: () => stopLoading(vm),
        timeoutValue: timeoutValue
    };
};

/**
 * Stop loading - Dispatch action lên Vuex Store và đợi modal biến mất hoàn toàn
 * @param {Object} vm - Vue instance
 * @returns {Promise} Promise resolve khi modal đã biến mất hoàn toàn
 */
export const stopLoading = (vm) => {
    return new Promise((resolve) => {
        if (vm && vm.$store) {
            // Đăng ký listener một lần để đợi event 'loading-complete'
            const handler = () => {
                vm.$root.$off('loading-complete', handler);
                resolve();
            };
            vm.$root.$once('loading-complete', handler);
            
            // Dispatch stop action
            vm.$store.dispatch('loading/stop');
            
            // Fallback: Nếu không nhận được event sau 1s, vẫn resolve
            setTimeout(() => {
                vm.$root.$off('loading-complete', handler);
                resolve();
            }, 1000);
        } else {
            console.error('Vue instance or Store not available');
            resolve();
        }
    });
};

/**
 * Force close any active loading (Emergency use only)
 * @param {Object} vm - Vue instance
 */
export const forceCloseLoading = (vm) => {
    return stopLoading(vm);
};