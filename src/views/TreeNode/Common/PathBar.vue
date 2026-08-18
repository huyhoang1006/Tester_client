<template>
    <div class="toolbar" @click="enterEdit">

        <!-- ─── Chế độ SỬA: một ô text chiếm cả thanh, giống thanh địa chỉ Windows ─── -->
        <input
            v-if="editing"
            ref="input"
            v-model="draft"
            class="path-edit"
            spellcheck="false"
            :placeholder="placeholder"
            @keyup.enter="submit"
            @keyup.esc="cancel"
            @blur="cancel"
            @click.stop />

        <!-- ─── Chế độ XEM: chuỗi cấp bậc bấm được ─────────────────────────────── -->
        <template v-else>
            <div class="crumb-row">
                <div class="path-hover" @click.stop="$emit('reset-all')">Organisation</div>
                <i v-if="path && path.length > 0" class="fa-solid fa-angle-right sep"></i>
            </div>

            <div class="crumb-row" v-for="(item, index) in path" :key="`${keyPrefix}-${item.id}-${index}`">
                <div class="path-hover" @click.stop="$emit('path-click', index)">{{ item.parent }}</div>
                <i v-if="index < path.length - 1" class="fa-solid fa-angle-right sep"></i>
            </div>

            <!--
              Vùng trống bên phải là chỗ bấm để vào chế độ sửa. Windows Explorer làm y vậy:
              bấm vào cấp bậc thì đi tới cấp đó, bấm vào khoảng trống thì sửa đường dẫn.
              Nhờ đó không cần ô nhập chiếm chỗ thường trực.
            -->
            <div class="edit-zone" :title="hint"></div>

            <i class="fa-solid fa-copy path-btn"
               :title="copyTitle"
               @click.stop="$emit('copy-path')"></i>
        </template>
    </div>
</template>

<script>
/**
 * Thanh đường dẫn dùng chung cho cả cây client và cây server.
 *
 * Trước đây hai bên là hai file riêng gần như giống hệt nhau — sửa một bên quên bên kia là
 * chuyện sớm muộn. Gộp về một component, hai bên chỉ khác dữ liệu truyền vào.
 *
 * ─── HAI CHẾ ĐỘ, GIỐNG THANH ĐỊA CHỈ WINDOWS ─────────────────────────────────
 *
 *   XEM  : chuỗi cấp bậc bấm được, bấm cấp nào thì lùi về cấp đó.
 *   SỬA  : bấm vào khoảng trống -> thành một ô text, bôi đen sẵn toàn bộ đường dẫn.
 *          Enter đi tới, Esc huỷ, rời ô cũng huỷ.
 *
 * Bôi đen sẵn là chi tiết nhỏ nhưng quan trọng: nó khiến "chép đường dẫn" chỉ còn là bấm
 * rồi Ctrl+C, và "thay đường dẫn" chỉ còn là bấm rồi dán đè.
 */
export default {
    name: 'PathBar',
    props: {
        /** Mảng cấp bậc, mỗi phần tử { id, mrid, parent } — `parent` là nhãn hiển thị. */
        path:      { type: Array,  default: () => [] },
        /** Chỉ để tạo `:key` không trùng khi hai thanh cùng tồn tại trong DOM. */
        keyPrefix: { type: String, default: 'path' },
    },
    data() {
        return {
            editing: false,
            draft: '',
        }
    },
    computed: {
        placeholder() {
            return 'Type a path, e.g. Root / ADMIN / Substation / Bay'
        },
        hint() {
            return 'Click to edit the path'
        },
        copyTitle() {
            return 'Copy current path'
        },
    },
    methods: {
        /** Đường dẫn hiện tại dạng text — đúng những gì thanh đang hiển thị. */
        currentText() {
            return (this.path || []).map(item => String((item && item.parent) || '')).join(' / ')
        },

        async enterEdit() {
            if (this.editing) return
            this.draft = this.currentText()
            this.editing = true
            await this.$nextTick()
            const el = this.$refs.input
            if (el) {
                el.focus()
                el.select()   // bôi đen sẵn: Ctrl+C là chép, gõ luôn là thay
            }
        },

        submit() {
            const value = String(this.draft || '').trim()
            this.editing = false
            if (!value) return
            // Không đổi gì thì đừng đi lại — tránh cây thu gọn rồi mở lại vô ích.
            if (value === this.currentText()) return
            this.$emit('go-path', value)
        },

        cancel() {
            // Esc và rời ô đều huỷ, KHÔNG đi. Đi khi người dùng chưa xác nhận thì họ mất
            // vị trí đang đứng chỉ vì lỡ bấm ra chỗ khác.
            this.editing = false
            this.draft = ''
        },
    },
}
</script>

<style scoped>
.toolbar {
    background-color: #d9d9d9;
    height: 30px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid #cccccc;
    font-size: 12px;
    color: #555;
    font-weight: 600;
    box-sizing: border-box;
    width: 100%;
    padding-left: 10px;
    overflow: hidden;
}

.crumb-row {
    display: flex;
    align-items: center;
    flex: none;
}

.sep {
    margin-left: 10px;
}

.path-hover:hover {
    color: black;
    text-decoration: underline;
    cursor: pointer;
}

/* Chiếm hết chỗ trống còn lại — đây là vùng bấm để vào chế độ sửa. */
.edit-zone {
    flex: 1 1 auto;
    min-width: 24px;
    height: 100%;
    cursor: text;
}

.path-edit {
    flex: 1 1 auto;
    height: 22px;
    margin-right: 10px;
    padding: 0 8px;
    border: 1px solid #409eff;
    border-radius: 3px;
    background: #fff;
    font-size: 12px;
    font-weight: 400;
    color: #303133;
    outline: none;
}

.path-btn {
    flex: none;
    margin-right: 10px;
    cursor: pointer;
    color: #666;
}

.path-btn:hover {
    color: #409eff;
}
</style>
