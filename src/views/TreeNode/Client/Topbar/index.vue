<template>
    <PathBar
        :path="pathMapClient"
        key-prefix="client"
        @reset-all="resetAllClient"
        @path-click="resetPathClient"
        @go-path="$emit('go-path', $event)"
        @copy-path="$emit('copy-path')" />
</template>

<script>
/**
 * Thanh đường dẫn của cây CLIENT.
 *
 * Phần hiển thị và chế độ sửa nằm hết trong `PathBar` dùng chung với cây server — file này
 * chỉ còn nối dữ liệu và hai hành động riêng của phía client (`resetAllClient`,
 * `resetPathClient` nằm trong mixin bên dưới).
 */
import PathBar from '@/views/TreeNode/Common/PathBar.vue'
import mixin from './mixin'

export default {
    name: "ClientSideTopBar",
    components: { PathBar },
    props: {
        pathMapClient: {
            type: Array,
            required: true
        },
        organisationClientList: {
            type: Array,
            required: true
        }
    },
    computed: {
        pathMapClientData: {
            get() {
                return this.pathMapClient
            },
            set(value) {
                this.$emit('update:pathMapClient', value)
            }
        }
    },
    mixins: [mixin],
}
</script>
