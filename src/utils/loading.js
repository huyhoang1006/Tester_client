/**
 * Overlay loading — lớp gọi cho code nghiệp vụ.
 *
 * `startLoading` trả về ba thứ, và **cả ba đều nên dùng**:
 *
 *     const { progress, aborted, close } = startLoading(this, {
 *         action: 'delete', text: 'Dang xoa...', total: nodes.length, type: 'heavy'
 *     })
 *     try {
 *         for (let i = 0; i < nodes.length; i++) {
 *             if (aborted()) break                                  // <- ton trong lenh dung
 *             progress(`Dang xoa ${nodes[i].name}`, i)               // <- bao con song
 *             await deleteNode(nodes[i])
 *         }
 *     } finally {
 *         await close()
 *     }
 *
 * `progress()` là thứ giữ overlay đứng lại. Hẹn giờ tính từ LẦN CUỐI gọi nó, không phải
 * từ lúc bắt đầu — nên việc chạy mười phút vẫn ổn miễn là còn báo tiến độ. Không gọi
 * thì sau ngưỡng im lặng overlay coi như treo và xin dừng.
 *
 * `aborted()` phải được kiểm trong mọi vòng lặp dài. Không kiểm thì lệnh dừng vô nghĩa,
 * và ta lại về đúng lỗi cũ: overlay tắt mà việc vẫn chạy.
 */

const dispatch = (vm, name, payload) => {
    if (!vm || !vm.$store) {
        console.error('[loading] khong co Vue instance hoac store')
        return
    }
    vm.$store.dispatch(`loading/${name}`, payload)
}

/**
 * Mở overlay.
 *
 * @param {object} vm      Vue instance
 * @param {string} action  loại việc: delete, download, upload, save…
 * @param {string} text    dòng mô tả đầu tiên
 * @param {number} total   tổng số bước nếu biết trước. CÓ thì thanh tiến độ là số
 *                         thật; KHÔNG thì overlay hiện số giây đã chạy, vì thà vậy còn
 *                         hơn vẽ một phần trăm không có thật
 * @param {string} type    'heavy' cho việc dài (tải cả cây, xoá cả nhánh)
 * @returns {{progress: Function, aborted: Function, close: Function, throwIfAborted: Function}}
 */
export const startLoading = (vm, { action = 'default', text = null, customText = null, total = 0, type = 'default' } = {}) => {
    // `customText` giữ lại cho những chỗ gọi cũ chưa đổi sang `text`.
    dispatch(vm, 'start', { action, text: text || customText, total, type })

    return {
        /**
         * Báo còn sống và cập nhật mô tả.
         * @param {string} stepText việc đang làm, hiện thẳng lên overlay
         * @param {number} done     đã xong bao nhiêu bước
         * @param {number} newTotal đổi tổng nếu lúc đầu chưa biết
         */
        progress: (stepText = null, done = null, newTotal = null) =>
            dispatch(vm, 'progress', { text: stepText, done, total: newTotal }),

        /** Người dùng bấm Dừng, hoặc quá lâu không phản hồi. */
        aborted: () => Boolean(vm && vm.$store && vm.$store.state.loading.aborted),

        /** Dùng trong vòng lặp muốn thoát bằng ngoại lệ thay vì `break`. */
        throwIfAborted: () => {
            if (vm && vm.$store && vm.$store.state.loading.aborted) {
                throw new Error('CANCELED')
            }
        },

        close: () => stopLoading(vm),
    }
}

/**
 * Đóng overlay, chờ đến khi nó biến mất hẳn.
 *
 * Chờ hẳn là cố ý: đóng xong mà hộp thoại còn đang mờ dần thì hộp thoại kế tiếp
 * (báo kết quả, hỏi xung đột) chồng lên nó và người dùng thấy hai lớp.
 */
export const stopLoading = (vm) => {
    return new Promise((resolve) => {
        if (!vm || !vm.$store) {
            console.error('[loading] khong co Vue instance hoac store')
            resolve()
            return
        }
        const handler = () => {
            vm.$root.$off('loading-complete', handler)
            resolve()
        }
        vm.$root.$once('loading-complete', handler)
        vm.$store.dispatch('loading/stop')

        // Chốt cuối: không nhận được event thì vẫn phải resolve, không để chỗ gọi
        // treo mãi ở `await close()`.
        setTimeout(() => {
            vm.$root.$off('loading-complete', handler)
            resolve()
        }, 1000)
    })
}

/** Xin dừng từ bên ngoài (nút Dừng trên overlay). */
export const requestAbortLoading = (vm, reason = null) => dispatch(vm, 'requestAbort', reason)

export const forceCloseLoading = (vm) => stopLoading(vm)
