<template>
    <li>
        <span @contextmenu.prevent="openContextMenu($event, node)" :class="{ selected: selectedNodes.some(n => n.id === node.id) }" class="folder" @click="toggle">
            <div v-if="dataType.includes(node.mode)"><i class="fas fa-location-dot"></i> {{ node.name }}</div>
            <div v-if="assetType.includes(node.asset)"><i class="fa-solid fa-gears"></i> {{ node.serial_no }}</div>
            <div v-if="node.type == 'job'"><i class="fa-solid fa-toolbox"></i> {{ node.name }}</div>
            <div v-if="node.type == 'test'"><i class="fa-solid fa-clipboard-check"></i> {{ node.name }}</div>
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

export default {
    props: ["node", "selectedNodes"],
    name : "TreeNode",
    computed: {
    },
    components: {
        spinner,
    },
    data() {
        return {
            isLoading : false,
            contextMenuVisible: false,
            contextMenuX: 0,
            contextMenuY: 0,
            dataType : ["OWNER1", "OWNER2", "OWNER3", "OWNER4", "OWNER5", "location", "voltage", "feeder"],
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
  