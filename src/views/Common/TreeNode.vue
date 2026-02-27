<template>
    <li>
        <div style="display: flex; align-items: center; gap: 10px;">
            <div class="arrow-wrapper" @click.stop="fetchNodeData" v-if="node.mode != 'job'">
                <i v-if="!node.expanded" class="fa-solid fa-angle-right" style="font-size: 12px; color: #CCCCCC;"></i>
                <i v-else class="fa-solid fa-angle-down" style="font-size: 12px; color: #CCCCCC;"></i>
            </div>
            
            <el-tooltip 
    effect="dark" 
    :content="getNodeDisplayName" 
    placement="top-start" 
    :open-delay="600"
>
    <span @contextmenu.prevent="openContextMenu($event, node)" :class="{ selected: isSelected(node), refreshing: node._isRefreshing }" class="folder" @click="toggle" @dblclick="doubleToggle">
        <div v-if="node.mode == 'substation'" class="icon-wrapper">
            <icon size="16px" folderType="location" :transformerType="node.type" badgeColor="146EBE"></icon>
            <span class="node-name">{{ node.name  }}</span>
        </div>
        <div v-else-if="node.mode == 'voltageLevel'" class="icon-wrapper">
            <icon size="16px" folderType="voltageLevel" :transformerType="node.type" badgeColor="146EBE"></icon>
            <span class="node-name">{{ node.name }}</span>
        </div>
        <div v-else-if="node.mode == 'bay'" class="icon-wrapper">
            <icon size="16px" folderType="bay" :transformerType="node.type" badgeColor="146EBE"></icon>
            <span class="node-name">{{ node.name }}</span>
        </div>
        <div v-else-if="node.mode == 'asset'" class="icon-wrapper">
            <icon size="16px" folderType="asset" :assetDetail="node.asset" :transformerType="node.type" badgeColor="146EBE"></icon>
            <span class="node-name">{{ node.apparatus_id || node.serial_number}} </span>
        </div>
        <div style="margin-left: 20px;" v-else-if="node.mode == 'job'" class="icon-wrapper">
            <icon size="16px" folderType="job" :transformerType="node.type" badgeColor="FF0000"></icon>
            <span class="node-name">{{ node.name }}</span>
        </div>
        <div v-else class="icon-wrapper">
            <icon size="16px" folderType="building" :transformerType="node.type" badgeColor="008001"></icon>
            <span class="node-name">{{ node.aliasName || node.name }}</span>
        </div>
    </span>
</el-tooltip>
        </div>
        
        <spinner style="margin-left: 20px;" v-if="isLoading"></spinner>
        
        <ul v-if="node.expanded">
            <TreeNode 
                v-for="child in node.children" 
                :key="child.id" :node="child" 
                :selectedNodes="selectedNodes"
                @double-click-node="(n) => $emit('double-click-node', n)" 
                @fetch-children="(n) => $emit('fetch-children', n)"
                @show-properties="(n) => $emit('show-properties', n)"
                @update-selection="updateSelection"
                @clear-selection="clearSelection"
                @open-context-menu="openContextMenu"
            >
            </TreeNode>
        </ul>
    </li>
</template>
  
<script>
/* eslint-disable */
import Vue from "vue"
import spinner from '@/views/Common/Spinner.vue'
import icon from '@/views/Common/Icon.vue'

export default {
    props: ["node", "selectedNodes"],
    name : "TreeNode",
    computed: {
        getNodeDisplayName() {
            if (!this.node) return '';
            if (this.node.mode === 'organisation') {
                return `Organization`;
            }
            else if (this.node.mode === 'substation') {
                return `Substation`;
            } else if (this.node.mode === 'voltageLevel') {
                return `Voltage Level`;
            } else if (this.node.mode === 'bay') {
                return `Bay`;
            }
            
            else if (this.node.mode === 'asset') {
                
                const type = this.node.asset;
                return `${type}`;
            }
            
            if (this.node.mode === 'job') {
                return `Job`;
            }

            return this.node.aliasName || this.node.name || 'Unknown';
        }
    },
    components: {
        spinner,
        icon
    },
    data() {
        return {
            isLoading : false,
            contextMenuVisible: false,
            contextMenuX: 0,
            contextMenuY: 0,
            dataType : ["OWNER1", "OWNER2", "OWNER3", "OWNER4", "OWNER5"],
            dataOwnerType : ["location", "voltage", "feeder"],
            assetType : ["Transformer", "Circuit breaker", "Current transformer", "Disconnector", "Surge arrester", "Power cable", "Voltage transformer","Reactor", "Bushing"],
            clickTimeout: null
        }
    },
    methods: {
        async toggle(event) {
            // Phân biệt click và double click
            if (this.clickTimeout) clearTimeout(this.clickTimeout);
            this.clickTimeout = setTimeout(() => {
                this.clearSelection();
                this.updateSelection(this.node);
                // Chỉ khi click vào thân node mới cập nhật Object Properties
                this.$emit("show-properties", this.node);
            }, 250); // 250ms là khoảng thời gian nhận biết double click
            document.addEventListener("click", this.onClickOutside);
        },

        fetchNodeData(event) {
            // Chỉ thực hiện expand/collapse và fetch children
            // KHÔNG cập nhật selectedNode hay show-properties
            if (!this.node.expanded) {
                this.isLoading = true
                this.$emit("fetch-children", this.node);
                this.isLoading = false
            }
            Vue.set(this.node, "expanded", !this.node.expanded);
        },

        doubleToggle(event) {
            // Nếu double click thì hủy xử lý click
            if (this.clickTimeout) clearTimeout(this.clickTimeout);
            this.$emit("double-click-node", this.node);
        },

        updateSelection(node) {
            this.$emit("update-selection", node);
        },
        clearSelection() {
            this.$emit("clear-selection");
        },
        openContextMenu(event, node) {
            this.$emit("open-context-menu", event, node);
        },
        isSelected(node) {
            if (!this.selectedNodes || !Array.isArray(this.selectedNodes)) return false
            return this.selectedNodes.some((n) => {
                if (!n || !node) return false
                if (n.mrid && node.mrid) return n.mrid === node.mrid
                if (n.id && node.id) return n.id === node.id
                return false
            })
        },
        onClickOutside(e) {
            const treeNodeEl = this.$el;
            const toolbarSettingEl = document.getElementById("toolbar-setting-id");
            if (treeNodeEl.contains(e.target)) return;
            if (toolbarSettingEl && toolbarSettingEl.contains(e.target)) return;
            this.clearSelection();
        }
    }
}
</script>

<style scoped>
/* --- Style mới cho nút mũi tên --- */
.arrow-wrapper {
    width: 24px;       /* Tăng vùng bấm lên 24px */
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s ease;
}

.arrow-wrapper:hover {
    background-color: #e6e6e6; /* Màu nền xám nhạt khi hover */
}

.arrow-wrapper:hover i {
    color: #555 !important; /* Đổi màu icon đậm hơn khi hover */
}
/* -------------------------------- */

.folder {
    display: block;
    padding: 5px;
    white-space: nowrap; /* Ngăn văn bản xuống dòng */
    overflow: hidden; /* Ẩn phần văn bản vượt quá kích thước */
    text-overflow: ellipsis; /* Hiển thị dấu ... khi văn bản quá dài */
    font-size: 12px; /* Cỡ chữ cho thư mục và tệp */
    cursor: pointer;
    border-radius: 4px;
}

.folder:hover {
    background-color:rgb(189, 184, 184);
    color: white;
}

.folder i {
    width: 16px; /* Kích thước icon */
    text-align: center;
    font-size: 12px; /* Cỡ chữ cho icon */
}

ul {
    list-style: none;
    padding-left: 20px;
}

.selected {
    background-color: #555;
    color: white;
}

/* Context Menu */
.context-menu {
    position: absolute;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    list-style: none;
    padding: 8px 0;
    z-index: 1000;
    min-width: 160px;
    font-size: 14px;
    animation: fadeIn 0.2s ease-in-out;
}

.context-menu li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 15px;
    cursor: pointer;
    transition: background 0.2s;
}

.context-menu li:hover {
    background-color: #F0F0F0;
}

/* Icon */
.context-menu i {
    width: 16px;
    text-align: center;
    color: #555;
}

/* Hiệu ứng menu */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}

.icon-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
}

.node-name {
    font-weight: 600;
}

/* Keyframes cho menu */
@keyframes fadeIn {
    from {
        transform: scale(0.95);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

/* Hiệu ứng nhấp nháy khi refresh */
@keyframes blink {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.3;
    }
}

.refreshing {
    animation: blink 0.5s ease-in-out infinite;
}
</style>