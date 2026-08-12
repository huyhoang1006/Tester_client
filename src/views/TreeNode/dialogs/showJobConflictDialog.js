import Vue from 'vue'
import JobConflictDialog from './JobConflictDialog.vue'

/**
 * Mở hộp thoại gộp và chờ người dùng quyết.
 *
 * ─── VÌ SAO GỌI THẲNG CHỨ KHÔNG QUA `ctx.$showConflictDialog` ────────────────
 *
 * Tám file tải xuống của asset gọi `ctx.$showConflictDialog({...})`. Hàm đó
 * **không được định nghĩa ở đâu cả** — quét toàn bộ `src` chỉ ra chín chỗ GỌI và
 * không chỗ nào KHAI. Nó chưa nổ lỗi vì nhánh chứa nó không bao giờ chạy: nhánh
 * đó cần bản gốc trong `entity_snapshot`, mà bản gốc thì chưa từng được ghi.
 *
 * Đi theo lối đó là chép lại một thứ đang hỏng. Cách này tự dựng lấy một instance
 * Vue rời rồi gắn vào body — cùng kiểu ElementUI làm với `$confirm`. Không cần
 * đăng ký component, không phụ thuộc `ctx` là component nào, và không thể gọi
 * nhầm chỗ.
 *
 * @param {Array}  conflicts danh sách xung đột từ `mergeJob`; mỗi phần tử được
 *                           sửa TẠI CHỖ ở trường `choice` khi người dùng chọn
 * @param {string} jobName   tên job, để hiện trên tiêu đề
 * @returns {Promise<Array>} danh sách đã có `choice`; reject với Error('CANCELED')
 *                           nếu người dùng huỷ — `executeDownload` đã bắt sẵn mã
 *                           này và im lặng bỏ qua, không báo lỗi đỏ
 */
export function showJobConflictDialog(conflicts, jobName = '') {
    return new Promise((resolve, reject) => {
        const mount = document.createElement('div')
        document.body.appendChild(mount)

        let settled = false
        const cleanup = (instance) => {
            // Chờ hết hoạt ảnh đóng của el-dialog rồi mới gỡ, không thì hộp thoại
            // biến mất giật cục.
            setTimeout(() => {
                instance.$destroy()
                if (mount.parentNode) mount.parentNode.removeChild(mount)
            }, 300)
        }

        // `conflicts` phải đi qua `data` để Vue theo dõi được.
        //
        // Mảng này do `mergeJob` dựng bằng JavaScript thuần, ngoài tầm Vue. Truyền
        // thẳng vào `props` trong hàm render thì Vue KHÔNG biến nó thành reactive, nên
        // sửa `item.choice` không kéo theo lần vẽ lại nào. Hậu quả nhìn rất giống lỗi
        // radio: bấm chọn xong giao diện không đổi theo, và nút "Apply to all" bấm như
        // không. Đặt vào `data` là Vue duyệt sâu và theo dõi từng phần tử.
        const instance = new Vue({
            data: { conflicts },
            // Hàm thường, KHÔNG dùng arrow: cần `this` trỏ vào instance để đọc
            // `this.conflicts` — tức bản ĐÃ được Vue theo dõi, chứ không phải mảng
            // gốc trong closure.
            render(h) {
                return h(JobConflictDialog, {
                    props: { conflicts: this.conflicts, jobName },
                    on: {
                        resolve: (result) => {
                            if (settled) return
                            settled = true
                            cleanup(instance)
                            resolve(result)
                        },
                        cancel: () => {
                            if (settled) return
                            settled = true
                            cleanup(instance)
                            reject(new Error('CANCELED'))
                        },
                    },
                })
            },
        }).$mount(mount)
    })
}
