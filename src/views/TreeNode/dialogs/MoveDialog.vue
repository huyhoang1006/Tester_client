<template>
    <el-dialog 
        title="Move Node" 
        :visible="visible" 
        @close="handleClose"
        @update:visible="$emit('update:visible', $event)"
        custom-class="move-dialog app-dialog custom-dialog"
        :modal="modal"
        :show-close="showClose"
        :transition="transition"
    >
        <div style="height: 300px; overflow-y: auto">
            <div class="child-nav" style="height: 100%; cursor: pointer">
                <ul style="list-style: none; padding-left: 0">
                    <TreeNode v-for="item in moveTreeData" :key="item.mrid" :node="item"
                        :selectedNodes="selectedTargetNodes" @fetch-children="fetchChildrenForMove"
                        @update-selection="handleMoveNodeSelection" @open-context-menu="() => { }"
                        style="width: 100%">
                    </TreeNode>
                </ul>
            </div>
        </div>
        
        <!-- Dòng kẻ ngăn cách TreeNode và dòng chữ bên dưới -->
        <div style="border-top: 1px solid #e0e0e0; margin: 6px 0 4px 0"></div>
        
        <div v-if="moveDisplayText" style="
                margin-top: 8px;
                font-size: 13px;
                color: #606266;
                display: flex;
                align-items: center;
                width: 100%;
                box-sizing: border-box;
                padding: 0 12px;
                font-weight: bold;
            ">
            <!-- Cột 1: Move from (trái) -->
            <span style="flex: 1; text-align: center; color: black">
                {{ moveDisplayText.prefix }}
            </span>
            
            <!-- Cột 2: icon + node A (giữa trái) -->
            <div style="flex: 1; display: flex; align-items: center; gap: 4px; justify-content: center">
                <icon v-if="moveDisplayData.sourceIcon" :size="'16px'"
                    :folderType="moveDisplayData.sourceIcon.folderType"
                    :assetDetail="moveDisplayData.sourceIcon.assetDetail"
                    :badgeColor="moveDisplayData.sourceIcon.badgeColor"></icon>
                <span style="font-weight: 600" :title="moveDisplayText.sourceFull">
                    {{ moveDisplayText.source }}
                </span>
            </div>
            
            <!-- Cột 3: to (ở gần giữa, sát 2 node hơn) -->
            <span
                style="flex: 0; padding: 0 8px; text-align: center; white-space: nowrap; font-weight: bold; color: black">
                {{ moveDisplayText.middle }}
            </span>
            
            <!-- Cột 4: icon + node B (phải) -->
            <div style="flex: 1; display: flex; align-items: center; gap: 4px; justify-content: center">
                <icon v-if="moveDisplayData.targetIcon" :size="'16px'"
                    :folderType="moveDisplayData.targetIcon.folderType"
                    :assetDetail="moveDisplayData.targetIcon.assetDetail"
                    :badgeColor="moveDisplayData.targetIcon.badgeColor"></icon>
                <span style="font-weight: 600" :title="moveDisplayText.targetFull">
                    {{ moveDisplayText.target }}
                </span>
            </div>
        </div>
        
        <span slot="footer" class="dialog-footer custom-footer">
            <el-button class="footer-btn" size="small" @click="handleCancel"
                style="background-color: #d63743; color: #fff">Cancel</el-button>
            <el-button class="footer-btn" size="small" type="primary" @click="handleConfirm"
                :disabled="!selectedTargetNode">Move</el-button>
        </span>
    </el-dialog>
</template>

<script>
import Icon from '@/views/Common/Icon.vue'
import TreeNode from '@/views/Common/TreeNode.vue'

export default {
    name: 'MoveDialog',
    components: {
        Icon,
        TreeNode
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        moveTreeData: {
            type: Array,
            default: () => []
        },
        selectedTargetNodes: {
            type: Array,
            default: () => []
        },
        selectedTargetNode: {
            type: Object,
            default: null
        },
        nodeToMove: {
            type: Object,
            default: null
        },
        moveDisplayText: {
            type: Object,
            default: null
        },
        moveDisplayData: {
            type: Object,
            default: null
        },
        modal: {
            type: Boolean,
            default: true
        },
        showClose: {
            type: Boolean,
            default: true
        },
        transition: {
            type: String,
            default: 'dialog-fade'
        }
    },
    methods: {
        handleClose() {
            this.$emit('close')
        },
        handleCancel() {
            this.$emit('cancel')
        },
        handleConfirm() {
            this.$emit('confirm')
        },
        fetchChildrenForMove(node) {
            this.$emit('fetch-children', node)
        },
        handleMoveNodeSelection(nodes) {
            this.$emit('update-selection', nodes)
        }
    }
}
</script>

<style scoped>
::v-deep(.app-dialog) {
    box-sizing: border-box;
}

::v-deep(.app-dialog.el-dialog) {
    width: 50%;
    margin-top: 5vh !important;
    border-radius: 6px;
    max-height: 90vh;
    height: auto !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

::v-deep(.app-dialog .el-dialog__body) {
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    flex: 1;
}

::v-deep(.app-dialog .el-dialog__body::-webkit-scrollbar) {
    width: 0px;
    height: 0px;
}

::v-deep(.app-dialog .el-dialog__footer) {
    padding: 10px 20px;
    border-top: 1px solid #ebeef5;
}

.custom-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.custom-footer .footer-btn {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 80px;
    max-width: 100px;
    height: 32px;
    font-size: 12px;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.custom-footer .footer-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-dialog {
    max-height: 90vh;
    height: auto !important;
}

.move-dialog {
    width: 35% !important;
}

@media (max-width: 991px) {
    .move-dialog {
        width: 50% !important;
    }
}

@media (max-width: 767px) {
    .app-dialog.el-dialog {
        width: 95%;
        margin: 2vh auto;
    }
    
    .custom-footer {
        justify-content: center;
        flex-direction: column;
        gap: 8px;
    }
    
    .custom-footer .footer-btn {
        max-width: none;
        width: 100%;
    }
}

@media (max-width: 480px) {
    .app-dialog .el-dialog__footer {
        padding: 8px 16px;
    }
}
</style>