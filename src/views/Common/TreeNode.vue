<template>
    <li class="tree-li">
        <div
            class="tree-row"
            :class="{
                selected: isSelected(node),
                refreshing: node._isRefreshing,
                'drag-source': isDragSource,
                'drop-allowed': isDropTarget && dragState.allowed,
                'drop-denied': isDropTarget && !dragState.allowed
            }"
            :title="rowTitle"
            :draggable="draggableNodes"
            @dragstart="onDragStart"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
            @dragend="onDragEnd"
            @contextmenu.prevent="openContextMenu($event, node)"
            @click="toggle"
            @dblclick="doubleToggle">

            <!-- mũi tên expand / placeholder cho node lá để thẳng hàng -->
            <span v-if="node.mode != 'job'" class="arrow-wrapper" @click.stop="fetchNodeData" @dblclick.stop>
                <i class="fa-solid fa-angle-right arrow-icon" :class="{ open: node.expanded }"></i>
            </span>
            <span v-else class="arrow-wrapper placeholder"></span>

            <!-- icon công ty (PNG) cho substation / voltageLevel / bay / asset: GIỮ NGUYÊN -->
            <icon
                v-if="usesCompanyIcon"
                size="16px"
                :folderType="iconProps.folderType"
                :assetDetail="iconProps.assetDetail"
                :transformerType="node.type"
                :badgeColor="iconProps.badgeColor"></icon>
            <!-- chỉ organisation + job dùng icon phẳng mới -->
            <i v-else-if="node.mode === 'job'" class="fa-solid fa-clipboard-list type-icon icon-job"></i>
            <i v-else class="fa-solid fa-building type-icon icon-org"></i>
            <span
                v-if="showSyncBadge"
                class="sync-badge"
                :class="'sync-' + syncStatus"
                :title="syncTitle"></span>
            <span class="node-name">{{ displayLabel }}</span>
        </div>

        <spinner class="tree-spinner" v-if="isLoading"></spinner>

        <ul v-if="node.expanded" class="tree-children">
            <TreeNode
                v-for="child in sortedChildren"
                :key="getChildUniqueKey(child)" :node="child"
                :selectedNodes="selectedNodes"
                :draggableNodes="draggableNodes"
                @drop-node="(payload) => $emit('drop-node', payload)"
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
import { canDropInto } from '@/views/TreeNode/Common/MoveNode/moveRules'
import { dragState, startDrag, setDragOver, clearDragOver, endDrag } from '@/views/TreeNode/Common/MoveNode/dragDropState'

export default {
    props: {
        node: {},
        selectedNodes: {},
        // Chỉ bật kéo thả ở cây client; cây server không sửa dữ liệu local được
        draggableNodes: { type: Boolean, default: false }
    },
    name : "TreeNode",
    computed: {
        isDragSource() {
            return !!(dragState.dragNode && this.node && dragState.dragNode.mrid === this.node.mrid)
        },
        isDropTarget() {
            return !!(dragState.dragNode && this.node && dragState.overMrid === this.node.mrid)
        },
        // Đang kéo mà hover node không hợp lệ thì cho tooltip nói rõ lý do
        rowTitle() {
            if (this.isDropTarget && !dragState.allowed && this.dropCheck.reason) {
                return this.dropCheck.reason
            }
            return this.getNodeDisplayName
        },
        dropCheck() {
            if (!dragState.dragNode) return { allowed: false, reason: '' }
            return canDropInto(dragState.dragNode, this.node)
        },
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
        },
        // các mode dùng icon PNG của công ty -> không đụng vào
        usesCompanyIcon() {
            const mode = this.node ? this.node.mode : ''
            return ['substation', 'voltageLevel', 'bay', 'asset'].includes(mode)
        },
        // gom cấu hình icon theo mode về 1 chỗ (trước đây là 6 nhánh v-if trong template)
        iconProps() {
            const mode = this.node ? this.node.mode : ''
            if (mode === 'substation')    return { folderType: 'location',     badgeColor: '146EBE', assetDetail: undefined }
            if (mode === 'voltageLevel')  return { folderType: 'voltageLevel', badgeColor: '146EBE', assetDetail: undefined }
            if (mode === 'bay')           return { folderType: 'bay',          badgeColor: '146EBE', assetDetail: undefined }
            if (mode === 'asset')         return { folderType: 'asset',        badgeColor: '146EBE', assetDetail: this.node.asset }
            if (mode === 'job')           return { folderType: 'job',          badgeColor: 'FF0000', assetDetail: undefined }
            return { folderType: 'building', badgeColor: '008001', assetDetail: undefined }
        },
        displayLabel() {
            if (!this.node) return ''
            if (this.node.mode === 'asset') return this.node.apparatus_id || this.node.serial_number
            if (this.node.mode === 'job') return this.node.name
            return this.node.aliasName || this.node.name
        },
        syncStatus() {
            if (!this.node) return ''
            return this.node.sync_status || this.node.syncStatus || ''
        },
        showSyncBadge() {
            return ['dirty', 'syncing', 'failed'].includes(this.syncStatus)
        },
        syncTitle() {
            if (this.syncStatus === 'dirty') return 'Changed locally, not synced to server'
            if (this.syncStatus === 'syncing') return 'Syncing with server'
            if (this.syncStatus === 'failed') return this.node.sync_error || 'Sync failed'
            return ''
        },
        sortedChildren() {
            if (!this.node || !Array.isArray(this.node.children) || this.node.children.length === 0) {
                return []
            }

            // Tạo bản sao để không mutate data gốc
            const children = [...this.node.children]

            return children.sort((a, b) => {
                // Lấy tên để so sánh
                const getDisplayName = (node) => {
                    if (node.mode === 'asset') {
                        // Asset: ưu tiên apparatus_id, sau đó serial_number, cuối cùng name
                        return (node.apparatus_id || node.serial_number || node.name || '').toLowerCase()
                    } else if (node.mode === 'job') {
                        // Job: dùng name
                        return (node.name || '').toLowerCase()
                    } else {
                        // Organisation, Substation, VoltageLevel, Bay: dùng name hoặc aliasName
                        return (node.name || node.aliasName || '').toLowerCase()
                    }
                }

                const nameA = getDisplayName(a)
                const nameB = getDisplayName(b)

                // So sánh theo bảng chữ cái
                return nameA.localeCompare(nameB, 'en', { numeric: true, sensitivity: 'base' })
            })
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
            clickTimeout: null,
            // observable dùng chung cho kéo thả (xem MoveNode/dragDropState.js)
            dragState
        }
    },
    methods: {
        // ── Kéo thả ─────────────────────────────────────────────────────────
        onDragStart(event) {
            if (!this.draggableNodes) return
            startDrag(this.node)
            if (event.dataTransfer) {
                event.dataTransfer.effectAllowed = 'move'
                // Firefox bắt buộc phải setData thì dragstart mới có hiệu lực
                event.dataTransfer.setData('text/plain', this.node.mrid || '')
            }
            event.stopPropagation()
        },
        onDragOver(event) {
            if (!this.draggableNodes || !dragState.dragNode) return
            const allowed = this.dropCheck.allowed
            setDragOver(this.node.mrid, allowed)
            // Chặn mặc định thì mới drop được; dropEffect 'none' cho ra con trỏ cấm
            event.preventDefault()
            event.stopPropagation()
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = allowed ? 'move' : 'none'
            }
        },
        onDragLeave() {
            if (!this.draggableNodes) return
            clearDragOver(this.node.mrid)
        },
        onDrop(event) {
            if (!this.draggableNodes || !dragState.dragNode) return
            event.preventDefault()
            event.stopPropagation()
            const dragNode = dragState.dragNode
            const check = this.dropCheck
            endDrag()
            if (!check.allowed) return
            this.$emit('drop-node', { dragNode, targetNode: this.node })
        },
        onDragEnd() {
            endDrag()
        },
        getChildUniqueKey(child) {
            if (!child.mrid) return Math.random().toString(36).substr(2, 9)
            if (child.mode === 'asset') {
                return `${child.mrid}_${child.asset}`
            }
            return `${child.mrid}_${child.mode}`
        },
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
.tree-li {
    list-style: none;
    min-width: 0;
    max-width: 100%;
}
/* chặn CSS bên ngoài (global/ag-grid...) vẽ border ngang lên các phần tử của tree */
.tree-li,
.tree-row,
.tree-children {
    border-top: none !important;
    border-bottom: none !important;
    border-right: none !important;
    box-shadow: none !important;
}

/* ===== Hàng node ===== */
.tree-row {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 26px;
    max-width: 100%;
    padding-right: 4px;
    box-sizing: border-box;
    border-radius: 4px;
    /* chống tràn ngang: mọi thứ trong hàng không được vẽ ra ngoài */
    overflow: hidden;
    cursor: pointer;
    user-select: none;
    font-size: 12px;
}
.tree-row:hover {
    background-color: #f0f2f5;
}
.tree-row.selected {
    background-color: #e6f1fb;
}

/* ── Kéo thả ─────────────────────────────────────────────────────────── */
.tree-row.drag-source {
    opacity: 0.45;
}
/* Thả được: viền xanh, báo node này sẽ thành cha mới */
.tree-row.drop-allowed {
    background-color: #eaf6ea;
    box-shadow: inset 0 0 0 2px #4ea72e;
}
/* Không thả được: viền đỏ + con trỏ cấm (dropEffect='none' lo phần con trỏ) */
.tree-row.drop-denied {
    background-color: #fdecea;
    box-shadow: inset 0 0 0 2px #d93025;
    cursor: not-allowed;
}
.tree-row.selected .node-name {
    color: #146ebe;
    font-weight: 600;
}
.tree-row.selected .type-icon {
    color: #146ebe;
}

.sync-badge {
    width: 7px;
    height: 7px;
    flex: 0 0 7px;
    border-radius: 50%;
    box-shadow: 0 0 0 2px #fff;
}
.sync-dirty {
    background: #f59e0b;
}
.sync-syncing {
    background: #146ebe;
    animation: sync-pulse 1.2s ease-in-out infinite;
}
.sync-failed {
    background: #d7001b;
}

/* ===== Mũi tên expand ===== */
.arrow-wrapper {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 4px;
}
.arrow-wrapper:hover:not(.placeholder) {
    background-color: #e4e7ed;
}
.arrow-wrapper.placeholder {
    cursor: default;
}
.arrow-icon {
    font-size: 12px;
    color: #a8abb2;
    transition: transform 0.15s ease;
}
.arrow-icon.open {
    transform: rotate(90deg);
}
.arrow-wrapper:hover .arrow-icon {
    color: #606266;
}

/* ===== Tên node ===== */
.node-name {
    flex: 1;
    min-width: 0;
    font-weight: 500;
    color: #303133;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 26px;
}

/* icon phẳng cho organisation + job (icon PNG công ty không đổi) */
.type-icon {
    width: 16px;
    text-align: center;
    font-size: 14px;
    flex-shrink: 0;
}
.icon-org { color: #3b6d11; }
.icon-job { color: #b3562e; }

/* ===== Cây con: thụt lề + guide line phân cấp ===== */
.tree-children {
    list-style: none;
    margin: 0 0 0 9px;
    padding-left: 10px;
    border-left: 1px solid #e8ebf0;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
}

.tree-spinner {
    margin-left: 20px;
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
@keyframes sync-pulse {
    0%, 100% {
        opacity: 0.4;
    }
    50% {
        opacity: 1;
    }
}
.refreshing {
    animation: blink 0.5s ease-in-out infinite;
}
</style>
