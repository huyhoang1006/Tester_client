<template>
    <PathBar
        :path="pathMapServer"
        key-prefix="server"
        @reset-all="$emit('reset-all')"
        @path-click="$emit('path-click', $event)"
        @go-path="$emit('go-path', $event)"
        @copy-path="$emit('copy-path')" />
</template>

<script>
/**
 * Thanh đường dẫn của cây SERVER.
 *
 * Dùng chung `PathBar` với cây client. Khác biệt duy nhất: bên này không tự xử lý hành
 * động nào, chỉ chuyển tiếp lên `treeNavigation`.
 */
import PathBar from '@/views/TreeNode/Common/PathBar.vue'

export default {
    name: "ServerSideTopBar",
    components: { PathBar },
    props: {
        // Nhận dữ liệu path từ cha truyền vào
        pathMapServer: {
            type: Array,
            default: () => []
        }
    }
}
</script>
