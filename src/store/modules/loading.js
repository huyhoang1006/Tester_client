/**
 * Trạng thái LOADING toàn cục.
 *
 * ─── BA LỖI CỦA BẢN TRƯỚC ────────────────────────────────────────────────────
 *
 * 1. HẸN GIỜ TÍNH TỪ LÚC BẮT ĐẦU. Quá 30 giây là ẩn overlay và báo "System is not
 *    responding" — nhưng công việc VẪN CHẠY. Giao diện nói xong rồi trong khi DB còn
 *    đang ghi. Người dùng bấm tiếp, và hai thao tác chạy chồng lên nhau.
 *
 *    Giờ hẹn giờ tính từ LẦN CUỐI có dấu hiệu sống. Việc nào còn báo tiến độ thì
 *    overlay còn đứng, chạy mười phút cũng được. Chỉ khi thật sự im lặng quá lâu mới
 *    coi là treo.
 *
 * 2. HẾT GIỜ THÌ CHỈ ẨN, KHÔNG DỪNG. Ẩn overlay mà để việc chạy tiếp là điều tệ nhất
 *    trong ba lựa chọn. Giờ nó bật cờ `aborted`; vòng lặp nào có kiểm cờ sẽ dừng ở
 *    ranh giới an toàn — xong việc đang làm, không bắt đầu việc kế tiếp.
 *
 * 3. THANH TIẾN ĐỘ LÀ SỐ BỊA. Bản trước cộng thêm mỗi 80ms tới 99% rồi ngồi đó, không
 *    liên quan gì tới công việc. Nên "chạy một mạch tới 99% xong không rõ còn sống
 *    hay không" là đúng — nó đạt 99% sau ba giây bất kể đang làm gì.
 *
 *    Giờ phần trăm chỉ hiện khi chỗ gọi báo `total`. Không biết tổng thì thà hiện số
 *    giây đã chạy còn hơn vẽ ra một con số không có thật.
 */

const HEARTBEAT_TIMEOUT = {
    default: 15000,   // viec ngan: 15 giay im lang la co van de
    heavy: 60000,     // viec dai (tai ca cay, xoa ca nhanh): moi buoc tu bao tien do
}

/** Sau khi xin dừng, chờ thêm bấy nhiêu để vòng lặp kịp thoát tử tế. */
const ABORT_GRACE = 8000

const state = {
    active: false,
    action: 'default',
    text: null,
    done: 0,
    total: 0,
    aborted: false,
    startedAt: 0,
    heartbeatTimer: null,
    abortTimer: null,
    timeoutMs: HEARTBEAT_TIMEOUT.default,
}

const getters = {
    isActive: (state) => state.active,
    currentAction: (state) => state.action,
    displayText: (state) => state.text,
    isAborted: (state) => state.aborted,
    /** Chỉ có phần trăm thật khi chỗ gọi biết tổng số bước. */
    percent: (state) => (state.total > 0
        ? Math.min(100, Math.round((state.done / state.total) * 100))
        : null),
}

const clearTimers = (state) => {
    if (state.heartbeatTimer) { clearTimeout(state.heartbeatTimer); state.heartbeatTimer = null }
    if (state.abortTimer) { clearTimeout(state.abortTimer); state.abortTimer = null }
}

const mutations = {
    BEGIN(state, { action, text, total, timeoutMs }) {
        clearTimers(state)
        state.active = true
        state.action = action
        state.text = text
        state.done = 0
        state.total = total || 0
        state.aborted = false
        state.startedAt = Date.now()
        state.timeoutMs = timeoutMs
    },
    PROGRESS(state, { text, done, total }) {
        if (text !== undefined && text !== null) state.text = text
        if (done !== undefined && done !== null) state.done = done
        if (total !== undefined && total !== null) state.total = total
    },
    SET_HEARTBEAT(state, timer) {
        if (state.heartbeatTimer) clearTimeout(state.heartbeatTimer)
        state.heartbeatTimer = timer
    },
    SET_ABORT_TIMER(state, timer) {
        if (state.abortTimer) clearTimeout(state.abortTimer)
        state.abortTimer = timer
    },
    MARK_ABORTED(state) {
        state.aborted = true
    },
    RESET(state) {
        clearTimers(state)
        state.active = false
        state.action = 'default'
        state.text = null
        state.done = 0
        state.total = 0
        state.aborted = false
        state.startedAt = 0
    },
}

const actions = {
    /**
     * Mở overlay.
     *
     * @param {string} action  loại việc, quyết định tiêu đề (delete, download…)
     * @param {string} text    dòng mô tả đầu tiên
     * @param {number} total   tổng số bước, nếu biết. Có thì thanh tiến độ là thật
     * @param {string} type    'default' hoặc 'heavy' — chỉ đổi ngưỡng im lặng
     */
    start({ commit, dispatch, state }, { action = 'default', text = null, total = 0, type = 'default' } = {}) {
        if (state.active) {
            // Không lặng lẽ bỏ qua như bản trước. Việc thứ hai chạy mà overlay đang mô
            // tả việc thứ nhất thì người dùng đọc sai hoàn toàn thứ đang diễn ra.
            console.warn('[loading] da co viec dang chay, viec moi se khong hien overlay rieng:', action)
            return
        }
        commit('BEGIN', { action, text, total, timeoutMs: HEARTBEAT_TIMEOUT[type] || HEARTBEAT_TIMEOUT.default })
        dispatch('armHeartbeat')
    },

    /**
     * Báo còn sống, kèm mô tả việc đang làm.
     *
     * Đây là thứ giữ overlay đứng lại. Mỗi lần gọi là hẹn giờ im lặng đặt lại từ đầu.
     */
    progress({ commit, dispatch, state }, { text = null, done = null, total = null } = {}) {
        if (!state.active) return
        commit('PROGRESS', { text, done, total })
        dispatch('armHeartbeat')
    },

    armHeartbeat({ commit, dispatch, state }) {
        const timer = setTimeout(() => {
            console.error(`[loading] khong co dau hieu song trong ${state.timeoutMs}ms — xin dung`)
            dispatch('requestAbort', 'no response for too long')
        }, state.timeoutMs)
        commit('SET_HEARTBEAT', timer)
    },

    /**
     * Xin dừng công việc đang chạy.
     *
     * Gọi khi hết thời gian im lặng, hoặc khi người dùng bấm Dừng. KHÔNG ẩn overlay
     * ngay: việc vẫn đang chạy, và nói dối là xong chính là lỗi của bản trước. Overlay
     * đổi sang "đang dừng" và chờ vòng lặp thoát.
     *
     * Vẫn phải có chốt cuối: nếu công việc kẹt hẳn, không chỗ nào kiểm cờ, thì sau
     * `ABORT_GRACE` đóng overlay để người dùng không mắc kẹt vĩnh viễn — nhưng lúc đó
     * nói thẳng là việc có thể còn chạy, chứ không báo thành công.
     */
    requestAbort({ commit, state }, reason = null) {
        if (!state.active || state.aborted) return
        commit('MARK_ABORTED')
        commit('PROGRESS', { text: reason ? `Stopping: ${reason}...` : 'Stopping...' })

        const timer = setTimeout(() => {
            console.error('[loading] cong viec khong dung sau khi xin — dong overlay')
            commit('RESET')
            if (typeof window !== 'undefined' && window.$message) {
                window.$message.warning(
                    'The operation has not stopped yet. Check your data before continuing.'
                )
            }
        }, ABORT_GRACE)
        commit('SET_ABORT_TIMER', timer)
    },

    stop({ commit }) {
        commit('RESET')
    },
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
}
