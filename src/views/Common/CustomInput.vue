<template>
    <ElInputOrigin ref="elInput" v-bind="$attrs" :value="value" :type="type" v-on="boundListeners">
        <!-- Kế thừa đích danh 4 slot mặc định của Element UI Input -->
        <template v-if="$slots.prepend" slot="prepend">
            <slot name="prepend"></slot>
        </template>
        <template v-if="$slots.append" slot="append">
            <slot name="append"></slot>
        </template>
        <template v-if="$slots.prefix" slot="prefix">
            <slot name="prefix"></slot>
        </template>
        <template v-if="$slots.suffix" slot="suffix">
            <slot name="suffix"></slot>
        </template>
    </ElInputOrigin>
</template>

<script>
import ElInputOrigin from 'element-ui/packages/input/src/input.vue'

export default {
    name: 'ElInput',
    inheritAttrs: false,

    components: {
        ElInputOrigin
    },

    props: {
        value: [String, Number],
        number: [String, Boolean], // Hỗ trợ: 'positive', 'negative', hoặc true/tồn tại
        text: [String, Boolean],
        type: String
    },

    computed: {
        boundListeners() {
            return {
                ...this.$listeners,
                input: this.handleInput
            }
        }
    },

    methods: {
        handleInput(val) {
            // Đảm bảo val luôn là chuỗi để dùng Regex
            let strVal = val === null || val === undefined ? '' : String(val)
            let newVal = strVal

            if (this.text !== undefined && this.text !== false) {
                newVal = newVal.replace(/[^a-zA-ZÀ-ỹđĐ.,\s]/g, '')
            } else if (this.number === 'year') {
                newVal = newVal.replace(/[^\d]/g, '')

                if (newVal.length > 4) {
                    newVal = newVal.substring(0, 4)
                }
            } else if (this.number !== undefined && this.number !== false) {
                // 1. Tự động chuyển dấu phẩy (,) thành dấu chấm (.)
                newVal = newVal.replace(/,/g, '.')

                // 2. Xác định cờ (flag) âm/dương dựa theo Prop truyền vào
                let isNegative = false
                if (this.number === 'negative') {
                    isNegative = true
                } else if (this.number === 'positive') {
                    isNegative = false
                } else {
                    // Nếu chỉ truyền <ElInput number />, cho phép cả âm và dương
                    isNegative = newVal.trim().startsWith('-')
                }

                // 3. Xoá TOÀN BỘ ký tự không phải số (0-9) và dấu chấm (.)
                newVal = newVal.replace(/[^\d.]/g, '')

                // 4. Xử lý ngăn chặn nhập nhiều dấu chấm (chỉ giữ lại dấu đầu tiên)
                // Ví dụ: 12.34.56 -> 12.3456
                const parts = newVal.split('.')
                if (parts.length > 1) {
                    newVal = parts[0] + '.' + parts.slice(1).join('')
                }

                // 5. UX Tối ưu: Nếu gõ dấu chấm đầu tiên, tự động thêm số 0 ở trước
                // Ví dụ: gõ ".5" -> thành "0.5"
                if (newVal.startsWith('.')) {
                    newVal = '0' + newVal
                }

                // 6. Xử lý gắn dấu trừ (-) dựa theo cờ isNegative
                if (isNegative) {
                    if (newVal !== '') {
                        newVal = '-' + newVal
                    } else if (strVal.trim().startsWith('-')) {
                        // Trường hợp user gõ dấu "-" vào input rỗng (để bắt đầu nhập số âm)
                        // Hoặc user xoá hết số chỉ còn lại dấu "-"
                        newVal = '-'
                    }
                }
            }

            // 🔥 Force UI: Ép DOM cập nhật lại nếu chuỗi bị Regex thay đổi
            // (Tránh lỗi user gõ chữ cái nhưng chữ vẫn dính trên màn hình)
            if (newVal !== strVal) {
                this.$nextTick(() => {
                    const inputEl = this.$refs.elInput.$refs.input || this.$refs.elInput.$refs.textarea
                    if (inputEl && inputEl.value !== String(newVal)) {
                        inputEl.value = newVal
                    }
                })
            }

            // Phát sự kiện input cập nhật v-model về cho Component cha
            this.$emit('input', newVal)
        }
    }
}
</script>