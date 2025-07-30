<template>
    <li>
        <span @contextmenu.prevent="openContextMenu($event, node)" :class="{ selected: selectedNodes.some(n => n.id === node.id) }" class="folder" @click="toggle">
            <div v-if="node.mode == 'substation'" class="icon-wrapper">
                <icon size="16px" folderType="location" badgeColor="146EBE"></icon>
                <span class="node-name">{{ node.name }}</span>
            </div>
            <div v-else-if="node.mode == 'voltageLevel'" class="icon-wrapper">
                <icon size="16px" folderType="voltageLevel" badgeColor="146EBE"></icon>
                <span class="node-name">{{ node.name }}</span>
            </div>
            <div v-else-if="node.mode == 'bay'" class="icon-wrapper">
                <icon size="16px" folderType="bay" badgeColor="146EBE"></icon>
                <span class="node-name">{{ node.name }}</span>
            </div>
            <div v-else-if="node.mode == 'asset'" class="icon-wrapper">
                <icon size="16px" folderType="asset" badgeColor="146EBE"></icon>
                <span class="node-name">{{ node.serial_no }} </span>
            </div>
            <div v-else-if="node.mode == 'job'" class="icon-wrapper">
                <icon size="16px" folderType="job" badgeColor="FF0000"></icon>
                <span class="node-name">{{ node.name }}</span>
            </div>
            <div v-else-if="node.mode == 'test'" class="icon-wrapper">
                <icon size="16px" folderType="test" badgeColor="008001"></icon>
                <span class="node-name">{{ node.name }}</span>
            </div>
            <div v-else class="icon-wrapper">
                <icon size="14px" folderType="building" badgeColor="008001"></icon>
                <span class="node-name">{{ node.name }}</span>
            </div>
        </span>
        
        <spinner style="margin-left: 20px;" v-if="isLoading"></spinner>
        
        <ul v-if="node.expanded">
            <TreeNode 
                v-for="child in node.children" 
                :key="child.id" :node="child" 
                :selectedNodes="selectedNodes" 
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
            assetType : ["Transformer", "Circuit breaker", "Current transformer", "Disconnector", "Surge arrester", "Power cable", "Voltage transformer"]
        }
    },
    methods: {
        async toggle(event) {
            if(event.ctrlKey) {
                this.updateSelection(this.node);
            } else {
                this.clearSelection();
                this.$emit("show-properties", this.node);
                if (!this.node.expanded) {
                    this.isLoading = true
                    this.$emit("fetch-children", this.node);
                    this.isLoading = false
                }
                Vue.set(this.node, "expanded", !this.node.expanded);
            }
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
    }
}
</script>

<style scoped>
.folder {
    display: block;
    padding: 5px;
    white-space: nowrap; /* Ngăn văn bản xuống dòng */
    overflow: hidden; /* Ẩn phần văn bản vượt quá kích thước */
    text-overflow: ellipsis; /* Hiển thị dấu ... khi văn bản quá dài */
    font-size: 12px; /* Cỡ chữ cho thư mục và tệp */
}

.folder:hover {
    background-color: #555;
    color: white;
}

.folder i {
    margin-right: 8px; /* Khoảng cách giữa icon và văn bản */
    width: 16px; /* Kích thước icon */
    text-align: center;
    font-size: 12px; /* Cỡ chữ cho icon */
}

ul {
    list-style: none;
    padding-left: 20px;
}

.selected {
    background-color: #007bff;
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
</style>
  