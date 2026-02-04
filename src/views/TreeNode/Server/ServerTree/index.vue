<template>
    <div ref="sidebarServer" class="sidebar">
        <div class="title-temp">
            <div ref="tabContainer" class="tab-container">
                <div ref="ownerRootServer" @click="$emit('showOwnerServerRoot')" class="tab">Organisation</div>
            </div>
        </div>

        <div class="child-nav">
            <ul>
                <TreeNode v-for="item in ownerServerList" :key="item.id" :node="item" :selectedNodes="selectedNodes"
                    @update:selectedNodes="$emit('update:selectedNodes', $event)"
                    @fetch-children="$emit('fetch-children-server', $event)"
                    @show-properties="$emit('show-properties', $event)"
                    @update-selection="$emit('update-selection', $event)"
                    @clear-selection="$emit('clear-selection', $event)"
                    @double-click-node="$emit('double-click-node-server', $event)" @open-context-menu="openContextMenu">
                </TreeNode>
            </ul>

            <contextMenu ref="contextMenu" @show-data="$emit('show-data', $event)"
                @export-json="$emit('export-json', $event)" @export-json-cim="$emit('export-json-cim', $event)"
                @export-xml="$emit('export-xml', $event)" @export-excel="$emit('export-excel', $event)"
                @export-word="$emit('export-word', $event)" @export-pdf="$emit('export-pdf', $event)"
                @duplicate-node="$emit('duplicate-node', $event)" @move-node="$emit('move-node', $event)"
                @import-json="$emit('import-json', $event)" @import-json-cim="$emit('import-json-cim', $event)">
            </contextMenu>
        </div>
    </div>
</template>

<script>
// Đừng quên import
import TreeNode from '@/views/Common/TreeNode.vue';
import ContextMenu from '@/views/Common/ContextMenu.vue';

export default {
    name: "ServerTreePanel",
    components: {
        TreeNode,
        ContextMenu
    },
    props: {
        // Dữ liệu Server
        ownerServerList: {
            type: Array,
            required: true
        },
        selectedNodes: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        // Hàm mở menu nội bộ
        async openContextMenu(event, node) {
            // 1. Lấy element của menu Server (ref="contextMenu")
            // Lưu ý: Đảm bảo ref bên HTML là 'contextMenu'
            const menu = this.$refs.contextMenu.$el

            const menuHeight = menu.offsetHeight || 320
            const menuWidth = menu.offsetWidth || 180

            // 2. Lấy vị trí click từ event
            const clickX = event.clientX
            const clickY = event.clientY
            const windowHeight = window.innerHeight
            const windowWidth = window.innerWidth

            // 3. Tính toán vị trí hiển thị (Logic y hệt bên Client)
            let top = clickY
            let left = clickX

            // Xử lý tràn mép dưới
            if (clickY + menuHeight > windowHeight) {
                top = clickY - menuHeight
                if (top < 0) top = 0
            }

            // Xử lý tràn mép phải
            if (clickX + menuWidth > windowWidth) {
                left = clickX - menuWidth
                if (left < 0) left = 0
            }

            // 4. Gọi hàm mở menu và TRUYỀN THÊM object { top, left }
            this.$refs.contextMenu.openContextMenu(event, node, { top, left })
        },

    }
};
</script>

<style scoped>
.sidebar {
  width: 20%;
  background-color: white;
  color: #555;
  flex-shrink: 0;
  height: 100%;
  box-sizing: border-box;
}

.sidebar ul {
  list-style: none;
  padding-left: 20px;
}

.sidebar li {
  margin: 5px 0;
  cursor: pointer;
}

.sidebar .folder,
.sidebar .file {
  display: block;
  padding: 5px;
  white-space: nowrap;
  /* Ngăn văn bản xuống dòng */
  overflow: hidden;
  /* Ẩn phần văn bản vượt quá kích thước */
  text-overflow: ellipsis;
  /* Hiển thị dấu ... khi văn bản quá dài */
  font-size: 12px;
  /* Cỡ chữ cho thư mục và tệp */
}

.sidebar .folder:hover,
.sidebar .file:hover {
  background-color: #555;
  color: white;
}

.sidebar .folder i,
.sidebar .file i {
  margin-right: 8px;
  /* Khoảng cách giữa icon và văn bản */
  width: 16px;
  /* Kích thước icon */
  text-align: center;
  font-size: 12px;
  /* Cỡ chữ cho icon */
}

.title-content {
  width: 100%;
  height: 5px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.folder-item {
  text-align: center;
  padding: 10px;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 12px;
  /* Cỡ chữ cho các mục trong nội dung */
}

.folder-item:hover {
  background-color: #f0f0f0;
}

.child-nav {
  overflow-y: hidden;
  height: calc(100% - 80px);
  box-sizing: border-box;
}

.child-nav:hover {
  overflow-y: auto;
}

.title-node {
  margin-top: 50px;
}

.title-temp {
  height: 40px;
  color: #555;
  font-weight: 600;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  background-color: white;
}

.location {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 5px;
  cursor: pointer;
  border-bottom: 2px #e6e4e4 solid;
  box-sizing: border-box;
}

.tab {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  padding-left: 5px;
  width: 100%;
  box-sizing: border-box;
  border-bottom: 2px #e6e4e4 solid;
}

.tab-container {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  overflow: hidden;
}
</style>