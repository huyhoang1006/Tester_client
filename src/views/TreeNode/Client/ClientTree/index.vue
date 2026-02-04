<template>
  <div ref="sidebarClient" class="sidebar">
    <div class="title-temp">
      <div ref="tabContainer" class="tab-container">
        <div @contextmenu.prevent="showContext" ref="locationRoot" @click="triggerClickLocation" class="location">
          Organisation
        </div>
      </div>

      <contextMenu ref="contextSubstation" @show-addSubs="$emit('show-addSubs', $event)"></contextMenu>
    </div>

    <div class="child-nav">
      <ul>
        <TreeNode v-for="item in organisationClientList" :key="item.id" :node="item" :selectedNodes="selectedNodes"
          @update:selectedNodes="$emit('update:selectedNodes', $event)"
          @double-click-node="$emit('double-click-node', $event)" @fetch-children="$emit('fetch-children', $event)"
          @show-properties="$emit('show-properties', $event)" @update-selection="$emit('update-selection', $event)"
          @clear-selection="$emit('clear-selection', $event)" @open-context-menu="openContextMenuClient">
        </TreeNode>
      </ul>

      <contextMenu ref="contextMenuClient" @delete-data="$emit('delete-data', $event)"
      @show-zero-diagram="$emit('show-zero-diagram', $event)"
        @show-addSubsInTree="$emit('show-addSubsInTree', $event)"
        @show-addOrganisation="$emit('show-addOrganisation', $event)"
        @show-addVoltageLevel="$emit('show-addVoltageLevel', $event)"
        @show-addTransformer="$emit('show-addTransformer', $event)" @show-addJob="$emit('show-addJob', $event)"
        @show-addBushing="$emit('show-addBushing', $event)"
        @show-addSurgeArrester="$emit('show-addSurgeArrester', $event)"
        @show-addCircuit="$emit('show-addCircuit', $event)" @show-addVt="$emit('show-addVt', $event)"
        @show-addCt="$emit('show-addCt', $event)" @show-addPowerCable="$emit('show-addPowerCable', $event)"
        @show-addDisconnector="$emit('show-addDisconnector', $event)"
        @show-addCapacitor="$emit('show-addCapacitor', $event)" @show-addReactor="$emit('show-addReactor', $event)"
        @show-addRotatingMachine="$emit('show-addRotatingMachine', $event)" @show-addBay="$emit('show-addBay', $event)"
        @export-json="$emit('export-json', $event)" @export-json-cim="$emit('export-json-cim', $event)"
        @export-xml="$emit('export-xml', $event)" @export-excel="$emit('export-excel', $event)"
        @export-word="$emit('export-word', $event)" @export-pdf="$emit('export-pdf', $event)"
        @duplicate-node="$emit('duplicate-node', $event)" @move-node="$emit('move-node', $event)"
        @import-json="$emit('import-json', $event)" @import-json-cim="$emit('import-json-cim', $event)"
        @show-data="$emit('show-data', $event)">
      </contextMenu>
    </div>
  </div>
</template>

<script>
import contextMenu from '@/views/Common/ContextMenu.vue'
import TreeNode from '@/views/Common/TreeNode.vue'

export default {
  name: "ClientTreePanel",
  components: {
    TreeNode,
    contextMenu
  },
  props: {
    // Tên biến phải CHUẨN 100% như cũ
    organisationClientList: {
      type: Array,
      required: true
    },
    selectedNodes: {
      type: Array,
      default: () => []
    }
  },
  methods: {

    async openContextMenuClient(event, node) {
      const menu = this.$refs.contextMenuClient.$el
      const menuHeight = menu.offsetHeight || 320 // fallback nếu chưa render
      const menuWidth = menu.offsetWidth || 180
      // Lấy vị trí click
      const clickX = event.clientX
      const clickY = event.clientY
      // Lấy kích thước cửa sổ
      const windowHeight = window.innerHeight
      const windowWidth = window.innerWidth

      // Tính toán vị trí hiển thị
      let top = clickY
      let left = clickX

      // Nếu click quá gần mép dưới, hiện menu lên trên
      if (clickY + menuHeight > windowHeight) {
        top = clickY - menuHeight
        if (top < 0) top = 0
      }

      // Nếu click quá gần mép phải, hiện menu sang trái
      if (clickX + menuWidth > windowWidth) {
        left = clickX - menuWidth
        if (left < 0) left = 0
      }
      this.$refs.contextMenuClient.openContextMenu(event, node, { top, left })
    },

    async showContext(event) {
      this.$refs.contextSubstation.openContextMenuSubstation(event, this.$constant.ROOT)
    },
    triggerClickLocation() {
      this.$emit('showLocationRoot');
    }
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
  width: 100%; /* Thêm dòng này để chiếm hết chiều rộng */
  display: flex;
  align-items: center;
  justify-content: center; /* Thêm dòng này để căn giữa chữ */
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