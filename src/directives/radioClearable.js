/**
 * v-radio-clearable — cho phép BỎ CHỌN radio bằng cách bấm lại vào cái đang chọn.
 *
 * Đặt trên <el-radio-group>. Element UI không hỗ trợ sẵn: bấm vào radio đã chọn
 * thì input native không phát sự kiện change, nên component không nhận được gì.
 * Ở đây bắt sự kiện click trên chính thẻ group, đọc value của radio vừa bấm rồi
 * so với giá trị hiện tại — trùng nghĩa là người dùng muốn bỏ chọn.
 *
 * Dùng:
 *   <el-radio-group v-model="form.type" v-radio-clearable>
 *   <el-radio-group v-model="form.type" v-radio-clearable="null">   // xoá thành null
 *
 * Giá trị sau khi xoá: mặc định chuỗi rỗng, truyền binding.value để đổi.
 */

const HANDLER = '__radioClearableHandler__'

const findRadioLabel = (target) => {
    let node = target
    while (node && node !== document) {
        if (node.classList && (node.classList.contains('el-radio') || node.classList.contains('el-radio-button'))) {
            return node
        }
        node = node.parentNode
    }
    return null
}

// DEBUG tạm: bật để xem directive có gắn / có bắt được click không
const DEBUG = true

const bind = (el, binding, vnode) => {
    const emptyValue = binding.value === undefined ? '' : binding.value
    if (DEBUG) console.log('[radio-clearable] bind vao', el.className)

    const handler = (event) => {
        const label = findRadioLabel(event.target)
        if (DEBUG) console.log('[radio-clearable] click, tim thay label:', !!label,
            '| is-checked:', label && label.classList.contains('is-checked'))
        if (!label || !el.contains(label)) return
        if (label.classList.contains('is-disabled')) return

        // Chỉ xử lý khi bấm đúng cái đang được chọn.
        // Lúc click, model chưa đổi (activation behaviour của input chạy SAU khi
        // click bubble xong) nên class này vẫn phản ánh giá trị cũ — đúng thứ ta cần.
        if (!label.classList.contains('is-checked')) return

        const group = vnode.componentInstance
        if (DEBUG) console.log('[radio-clearable] group:', !!group, '| value hien tai:', group && group.value)
        if (!group) return

        // Chặn hành vi mặc định của <label>: nếu không, trình duyệt sẽ chuyển tiếp
        // một click nữa xuống <input>. Lúc đó Vue đã vẽ lại (input hết tick) nên
        // click chuyển tiếp này TỰ TICK LẠI và bắn 'change' → el-radio set model về
        // giá trị cũ → giao diện thấy như chưa bao giờ bỏ chọn.
        // Cũng vì lý do này mà TUYỆT ĐỐI không set input.checked = false.
        event.preventDefault()
        event.stopPropagation()

        group.$emit('input', emptyValue)
        group.$emit('change', emptyValue)

        if (DEBUG) {
            group.$nextTick(() => {
                console.log('[radio-clearable] sau nextTick — group.value:', group.value,
                    '| label con is-checked:', label.classList.contains('is-checked'))
            })
        }
    }

    el[HANDLER] = handler
    // bubble phase: chạy SAU Element. Với radio đã chọn thì Element không làm gì
    // (không có change event) nên không ghi đè lại giá trị vừa xoá.
    el.addEventListener('click', handler)
}

const unbind = (el) => {
    if (el[HANDLER]) {
        el.removeEventListener('click', el[HANDLER])
        delete el[HANDLER]
    }
}

export default { bind, unbind }
