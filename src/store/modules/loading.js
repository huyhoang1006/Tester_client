/**
 * Loading Module - Vuex Store
 * Quản lý trạng thái Loading toàn cục với Singleton Pattern và Failsafe Timer
 */

const state = {
    active: false,
    action: 'default',
    customText: null,
    failsafeTimer: null
};

const getters = {
    isActive: (state) => state.active,
    currentAction: (state) => state.action,
    displayText: (state) => state.customText
};

const mutations = {
    SET_ACTIVE(state, active) {
        state.active = active;
    },
    SET_ACTION(state, action) {
        state.action = action;
    },
    SET_CUSTOM_TEXT(state, text) {
        state.customText = text;
    },
    SET_FAILSAFE_TIMER(state, timer) {
        state.failsafeTimer = timer;
    },
    RESET_STATE(state) {
        state.active = false;
        state.action = 'default';
        state.customText = null;
        if (state.failsafeTimer) {
            clearTimeout(state.failsafeTimer);
            state.failsafeTimer = null;
        }
    }
};

const actions = {
    /**
     * Bắt đầu Loading với Singleton Pattern và Failsafe Timer
     * @param {Object} payload - { action, customText, type }
     */
    start({ commit, state, rootState }, { action = 'default', customText = null, type = 'default' } = {}) {
        // Singleton: Nếu đã active thì bỏ qua
        if (state.active) {
            console.warn('Loading already active, ignoring new start request');
            return;
        }

        // Thiết lập state
        commit('SET_ACTIVE', true);
        commit('SET_ACTION', action);
        commit('SET_CUSTOM_TEXT', customText);

        // Lấy timeout value từ store chính (nếu có)
        const timeouts = rootState.timeouts || { default: 10000, heavy: 30000 };
        let timeoutValue = timeouts[type];

        // Failsafe: Heavy tasks (timeout = 0) get 30s safety limit
        const HEAVY_TASK_SAFETY_LIMIT = 30000; // 30 seconds
        const effectiveTimeout = timeoutValue === 0 ? HEAVY_TASK_SAFETY_LIMIT : timeoutValue;

        // Thiết lập Failsafe Timer
        if (effectiveTimeout > 0) {
            const timer = setTimeout(() => {
                console.error(`Loading failsafe triggered after ${effectiveTimeout}ms - System not responding`);
                
                // Reset state
                commit('RESET_STATE');
                
                // Hiển thị thông báo lỗi (sẽ được xử lý bởi component)
                if (typeof window !== 'undefined' && window.$message) {
                    window.$message.error('System is not responding. Please try again.');
                }
            }, effectiveTimeout);

            commit('SET_FAILSAFE_TIMER', timer);
        }
    },

    /**
     * Dừng Loading và xóa Failsafe Timer
     */
    stop({ commit, state }) {
        // Xóa timer
        if (state.failsafeTimer) {
            clearTimeout(state.failsafeTimer);
        }

        // Reset toàn bộ state
        commit('RESET_STATE');
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};
