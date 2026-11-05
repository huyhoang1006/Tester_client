/* eslint-disable */
/**
 * Khởi tạo ECharts chỉ khi khung đã có kích thước.
 *
 * Các biểu đồ trong tab test đang ẩn (chưa bấm vào) có clientWidth/clientHeight = 0.
 * Gọi echarts.init lúc đó → ECharts cảnh báo "Can't get DOM width or height" và vẽ
 * sai kích thước. Thay vào đó: trả null, theo dõi khung bằng ResizeObserver và gọi
 * lại hàm vẽ đúng 1 lần khi khung hiện ra.
 */
import * as echarts from 'echarts'

export const hasRenderableSize = (el) => !!el && el.clientWidth > 0 && el.clientHeight > 0

const pendingOf = (owner) => {
    if (!owner._echartsPending) owner._echartsPending = new Map()
    return owner._echartsPending
}

/**
 * @param owner     component Vue (để huỷ theo dõi khi component bị huỷ)
 * @param el        phần tử chứa biểu đồ
 * @param onVisible hàm vẽ lại, gọi 1 lần khi phần tử có kích thước
 * @returns instance ECharts, hoặc null nếu phần tử đang ẩn
 */
export const initChartWhenVisible = (owner, el, onVisible) => {
    if (hasRenderableSize(el)) return echarts.init(el)
    if (!el || typeof window === 'undefined' || !window.ResizeObserver) return null
    const pending = pendingOf(owner)
    if (pending.has(el)) return null
    const observer = new window.ResizeObserver(() => {
        if (!hasRenderableSize(el)) return
        observer.disconnect()
        pending.delete(el)
        if (owner._isDestroyed || owner._isBeingDestroyed) return
        owner.$nextTick(() => {
            if (!owner._isDestroyed) onVisible()
        })
    })
    pending.set(el, observer)
    observer.observe(el)
    return null
}

/** Gọi trong beforeDestroy */
export const disposeChartWatchers = (owner) => {
    if (!owner._echartsPending) return
    owner._echartsPending.forEach(observer => observer.disconnect())
    owner._echartsPending.clear()
}
