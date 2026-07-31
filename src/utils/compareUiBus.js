import Vue from 'vue'

/**
 * Cầu nối giữa bảng Compare và panel Object Properties.
 *
 * VÌ SAO CẦN BUS: bảng Compare nằm rất sâu
 *   treeNavigation → ContextData → Tabs → JobView → TestInformation → CompareResultsPanel
 * còn nút ẩn/hiện Object Properties lại nằm ở treeNavigation. Đẩy sự kiện qua từng
 * tầng thì phải thêm prop/emit ở 5 file trung gian chẳng liên quan gì đến Compare.
 *
 * QUY TẮC — chỉ báo ở LẦN CHUYỂN TRẠNG THÁI, không báo lặp:
 *   không có bảng nào mở  →  có bảng đầu tiên mở   →  phát 'true'  (ẩn panel)
 *   bảng cuối cùng đóng   →  không còn bảng nào    →  phát 'false' (hiện panel)
 *
 * Đếm số bảng đang mở chứ không dùng cờ bật/tắt, vì mỗi tab test có một bảng
 * Compare riêng. Mở compare ở 2 tab rồi đóng 1 tab thì vẫn còn 1 bảng đang mở,
 * lúc đó chưa được hiện lại panel.
 *
 * KHÔNG khoá nút Object Properties: sau khi bus báo, người dùng vẫn tự bấm
 * ẩn/hiện tuỳ ý, bus không ép lại trạng thái lần nữa.
 */

export const COMPARE_ACTIVE = 'compare-active'

const bus = new Vue()

let openCount = 0

/** Một bảng Compare vừa mở */
export const notifyCompareOpened = () => {
    openCount += 1
    if (openCount === 1) bus.$emit(COMPARE_ACTIVE, true)
}

/** Một bảng Compare vừa đóng (đóng nút, hoặc tab test bị huỷ khi đang mở) */
export const notifyCompareClosed = () => {
    if (openCount === 0) return
    openCount -= 1
    if (openCount === 0) bus.$emit(COMPARE_ACTIVE, false)
}

export const compareOpenCount = () => openCount

export default bus
