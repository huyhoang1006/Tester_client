const TABLE_SELECTOR = '#job #tests table.table-strip-input-data'

function isVisible(element) {
    const rect = element.getBoundingClientRect()
    const style = window.getComputedStyle(element)
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
}

function findActiveTable(container) {
    const containerRect = container.getBoundingClientRect()
    return Array.from(container.querySelectorAll(TABLE_SELECTOR)).find((table) => {
        if (!isVisible(table) || !table.tHead) return false
        const tableRect = table.getBoundingClientRect()
        const headerRect = table.tHead.getBoundingClientRect()
        return headerRect.bottom < containerRect.top
            && tableRect.bottom > containerRect.top + headerRect.height
    }) || null
}

function copyHeaderGeometry(sourceTable, clonedTable) {
    const sourceCells = sourceTable.tHead.querySelectorAll('th')
    const clonedCells = clonedTable.tHead.querySelectorAll('th')

    sourceCells.forEach((cell, index) => {
        const clone = clonedCells[index]
        if (!clone) return
        const rect = cell.getBoundingClientRect()
        clone.style.boxSizing = 'border-box'
        clone.style.width = `${rect.width}px`
        clone.style.minWidth = `${rect.width}px`
        clone.style.maxWidth = `${rect.width}px`
        clone.style.height = `${rect.height}px`
    })
}

export function createStickyTestTableHeader(container) {
    if (!container) return null

    const host = document.createElement('div')
    host.className = 'sticky-test-table-header'
    host.setAttribute('aria-hidden', 'true')
    document.body.appendChild(host)

    let frameId = null

    const hide = () => {
        host.style.display = 'none'
        host.replaceChildren()
    }

    const sync = () => {
        frameId = null
        const table = findActiveTable(container)
        if (!table) {
            hide()
            return
        }

        const containerRect = container.getBoundingClientRect()
        const tableRect = table.getBoundingClientRect()
        const wrapper = table.closest('.table-scroll') || table.parentElement
        const wrapperRect = wrapper.getBoundingClientRect()
        const left = Math.max(containerRect.left, wrapperRect.left)
        const right = Math.min(containerRect.right, wrapperRect.right)
        if (right <= left) {
            hide()
            return
        }

        const clonedTable = table.cloneNode(false)
        clonedTable.appendChild(table.tHead.cloneNode(true))
        clonedTable.style.position = 'absolute'
        clonedTable.style.top = '0'
        clonedTable.style.left = `${tableRect.left - left}px`
        clonedTable.style.width = `${tableRect.width}px`
        clonedTable.style.margin = '0'
        copyHeaderGeometry(table, clonedTable)

        host.replaceChildren(clonedTable)
        host.style.display = 'block'
        host.style.top = `${containerRect.top}px`
        host.style.left = `${left}px`
        host.style.width = `${right - left}px`
        host.style.height = `${table.tHead.getBoundingClientRect().height}px`
    }

    const scheduleSync = () => {
        if (frameId !== null) cancelAnimationFrame(frameId)
        frameId = requestAnimationFrame(sync)
    }

    container.addEventListener('scroll', scheduleSync, true)
    window.addEventListener('resize', scheduleSync)

    const observer = new MutationObserver(scheduleSync)
    observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    })

    scheduleSync()

    return {
        refresh: scheduleSync,
        destroy() {
            if (frameId !== null) cancelAnimationFrame(frameId)
            observer.disconnect()
            container.removeEventListener('scroll', scheduleSync, true)
            window.removeEventListener('resize', scheduleSync)
            host.remove()
        }
    }
}
