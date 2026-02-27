/**
 * Refresh node logic
 * Làm mới node hiện tại và fetch lại children để đảm bảo dữ liệu được cập nhật
 */

export default async function refreshNode(node, fetchChildrenCallback) {
  try {
    if (!node) {
      console.warn('Refresh: No node provided')
      return false
    }

    // Nếu node đang expanded, fetch lại children
    if (node.expanded) {
      // Gọi callback fetchChildren để load lại dữ liệu
      if (typeof fetchChildrenCallback === 'function') {
        await fetchChildrenCallback(node)
      }
    }

    return true
  } catch (error) {
    console.error('Error refreshing node:', error)
    return false
  }
}
