const WORKSPACE_STATE_KEY = 'ATD_WORKSPACE_STATE'
const RESTORE_AFTER_LOGIN_KEY = 'ATD_RESTORE_AFTER_LOGIN'

const NODE_FIELDS = [
    'id',
    'mrid',
    'name',
    'aliasName',
    'mode',
    'type',
    'asset',
    'job',
    'parentId',
    'parent',
    'parentArr',
    'serial_number',
    'serial_no',
    'apparatus_id',
    'psrId',
    'ownerId',
    'owner_id',
    'organisationId',
    'locationId',
    'workOrder',
    'work_order'
]

const hasStorage = () => typeof window !== 'undefined' && window.localStorage

const pickNode = (node, depth = 0) => {
    if (!node || typeof node !== 'object') return null

    return NODE_FIELDS.reduce((result, field) => {
        if (node[field] !== undefined && node[field] !== null) {
            if (field === 'parent' && typeof node[field] === 'object') {
                if (depth < 4) {
                    result[field] = pickNode(node[field], depth + 1)
                }
            } else {
                result[field] = node[field]
            }
        }
        return result
    }, {})
}

const pickNodeList = (nodes) => {
    if (!Array.isArray(nodes)) return []
    return nodes.map(pickNode).filter(Boolean)
}

export const normalizeWorkspaceState = (state = {}) => ({
    side: state.side === 'server' ? 'server' : 'client',
    activeClientTab: pickNode(state.activeClientTab),
    activeServerTab: pickNode(state.activeServerTab),
    tabsClient: pickNodeList(state.tabsClient),
    tabs: pickNodeList(state.tabs),
    selectedNodes: pickNodeList(state.selectedNodes),
    expandedClientIds: Array.isArray(state.expandedClientIds) ? state.expandedClientIds : [],
    expandedServerIds: Array.isArray(state.expandedServerIds) ? state.expandedServerIds : [],
    ts: Date.now()
})

export const saveWorkspaceState = (state) => {
    if (!hasStorage()) return

    try {
        window.localStorage.setItem(WORKSPACE_STATE_KEY, JSON.stringify(normalizeWorkspaceState(state)))
    } catch (error) {
        console.warn('Cannot save workspace restore state:', error)
    }
}

export const loadWorkspaceState = () => {
    if (!hasStorage()) return null

    try {
        const rawState = window.localStorage.getItem(WORKSPACE_STATE_KEY)
        return rawState ? JSON.parse(rawState) : null
    } catch (error) {
        console.warn('Cannot load workspace restore state:', error)
        return null
    }
}

export const markRestoreAfterLogin = () => {
    if (hasStorage()) {
        window.localStorage.setItem(RESTORE_AFTER_LOGIN_KEY, '1')
    }
}

export const shouldRestoreAfterLogin = () => hasStorage() && window.localStorage.getItem(RESTORE_AFTER_LOGIN_KEY) === '1'

export const clearRestoreAfterLogin = () => {
    if (hasStorage()) {
        window.localStorage.removeItem(RESTORE_AFTER_LOGIN_KEY)
    }
}
