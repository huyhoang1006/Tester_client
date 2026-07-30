/**
 * Quy tắc phân cấp khi di chuyển node — nguồn dữ liệu DUY NHẤT.
 * Dùng chung cho dialog Move (moveNode.js) và kéo thả trên cây (TreeNode.vue).
 */

// node.mode -> các mode được phép làm cha
export const VALID_PARENT_MODES = {
    organisation: ['organisation'],
    substation:   ['organisation'],
    voltageLevel: ['substation'],
    bay:          ['voltageLevel', 'substation'],
    asset:        ['bay', 'substation'],
    job:          ['asset']
}

export const getValidParentModes = (nodeMode) => VALID_PARENT_MODES[nodeMode] || []

/** target có nằm trong cây con của node đang kéo không (thả vào sẽ tạo vòng lặp) */
export const isDescendantOf = (target, node) => {
    if (!target || !node) return false
    if (Array.isArray(target.parentArr)) {
        return target.parentArr.some((p) => p && p.mrid === node.mrid)
    }
    // parentArr chưa có (node fetch lẻ) → duyệt children đã load
    const walk = (n) => {
        if (!n || !Array.isArray(n.children)) return false
        return n.children.some((c) => c.mrid === target.mrid || walk(c))
    }
    return walk(node)
}

/**
 * Kiểm tra có được thả dragNode vào targetNode làm con hay không.
 * @returns {{ allowed: boolean, reason: string }}
 */
export const canDropInto = (dragNode, targetNode) => {
    if (!dragNode || !targetNode) {
        return { allowed: false, reason: 'Invalid node' }
    }
    if (dragNode.mrid === targetNode.mrid) {
        return { allowed: false, reason: 'Cannot drop a node onto itself' }
    }
    if (targetNode.parentId === undefined && targetNode.mrid === undefined) {
        return { allowed: false, reason: 'Invalid target' }
    }
    if (dragNode.parentId && dragNode.parentId === targetNode.mrid) {
        return { allowed: false, reason: 'Node is already in this location' }
    }
    const validModes = getValidParentModes(dragNode.mode)
    if (!validModes.includes(targetNode.mode)) {
        return {
            allowed: false,
            reason: `Cannot move ${dragNode.mode || 'node'} into ${targetNode.mode || 'node'}`
        }
    }
    if (isDescendantOf(targetNode, dragNode)) {
        return { allowed: false, reason: 'Cannot move a node into its own child' }
    }
    return { allowed: true, reason: '' }
}
