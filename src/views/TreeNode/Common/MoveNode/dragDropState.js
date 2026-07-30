import Vue from 'vue'

/**
 * Trạng thái kéo thả dùng chung cho cây.
 *
 * TreeNode.vue là component đệ quy nên truyền state qua props/emit rất rườm rà;
 * dùng 1 observable chung để mọi cấp đọc được ngay.
 */
export const dragState = Vue.observable({
    dragNode: null,     // node đang được kéo
    overMrid: null,     // mrid của node đang hover
    allowed: false      // hover hiện tại có hợp lệ không
})

export const startDrag = (node) => {
    dragState.dragNode = node
    dragState.overMrid = null
    dragState.allowed = false
}

export const setDragOver = (mrid, allowed) => {
    dragState.overMrid = mrid
    dragState.allowed = allowed
}

export const clearDragOver = (mrid) => {
    if (dragState.overMrid === mrid) {
        dragState.overMrid = null
        dragState.allowed = false
    }
}

export const endDrag = () => {
    dragState.dragNode = null
    dragState.overMrid = null
    dragState.allowed = false
}
