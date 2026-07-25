import Vue from 'vue'

const DIRTY_STATUSES = ['dirty', 'syncing', 'failed']

export default {
    mounted() {
        window.addEventListener('sync-state-changed', this.handleSyncStateChanged)
    },
    beforeDestroy() {
        window.removeEventListener('sync-state-changed', this.handleSyncStateChanged)
    },
    methods: {
        getSyncNodeMrid(node) {
            if (!node) return null
            return node.mrid || node.id || null
        },

        getSyncNodeType(node) {
            if (!node) return ''
            if (node.mode === 'asset') return node.asset || 'Asset'
            if (node.mode === 'job') return node.job || 'Job'
            return node.mode || node._type || ''
        },

        collectSyncTreeNodes(nodes, result = []) {
            if (!Array.isArray(nodes)) return result
            nodes.forEach(node => {
                if (!node) return
                result.push(node)
                if (Array.isArray(node.children)) {
                    this.collectSyncTreeNodes(node.children, result)
                }
            })
            return result
        },

        async applySyncStatesToTree(nodes) {
            const flatNodes = this.collectSyncTreeNodes(nodes)
            const mrids = flatNodes
                .map(node => this.getSyncNodeMrid(node))
                .filter(Boolean)

            if (!mrids.length || !window.electronAPI || !window.electronAPI.getSyncStatesByMrids) return

            const response = await window.electronAPI.getSyncStatesByMrids(mrids)
            if (!response || !response.success || !Array.isArray(response.data)) return

            const stateMap = response.data.reduce((map, state) => {
                if (state && state.node_mrid) map[state.node_mrid] = state
                return map
            }, {})

            flatNodes.forEach(node => {
                const mrid = this.getSyncNodeMrid(node)
                const state = stateMap[mrid]
                if (state) {
                    Vue.set(node, 'sync_status', state.sync_status)
                    Vue.set(node, 'sync_error', state.last_error || '')
                    Vue.set(node, '_serverId', state.server_id || '')
                } else if (DIRTY_STATUSES.includes(node.sync_status)) {
                    Vue.delete(node, 'sync_status')
                    Vue.delete(node, 'sync_error')
                }
            })
        },

        updateTreeNodeSyncState(nodeOrMrid, status, options = {}) {
            const mrid = typeof nodeOrMrid === 'string' ? nodeOrMrid : this.getSyncNodeMrid(nodeOrMrid)
            if (!mrid || !Array.isArray(this.organisationClientList)) return

            const node = this.findNodeByIdOrMrid
                ? this.findNodeByIdOrMrid(mrid, this.organisationClientList)
                : null
            if (!node) return

            if (status === 'synced') {
                Vue.delete(node, 'sync_status')
                Vue.delete(node, 'sync_error')
            } else {
                Vue.set(node, 'sync_status', status)
                if (options.error) Vue.set(node, 'sync_error', options.error)
            }

            if (options.serverId) Vue.set(node, '_serverId', String(options.serverId))
        },

        async markDownloadedNodeSynced(node) {
            const mrid = this.getSyncNodeMrid(node)
            if (!mrid || !window.electronAPI || !window.electronAPI.markNodeSynced) return

            await window.electronAPI.markNodeSynced(mrid, this.getSyncNodeType(node), mrid)
            this.updateTreeNodeSyncState(mrid, 'synced', { serverId: mrid })
        },

        extractSavedSyncMrid(data) {
            if (!data || typeof data !== 'object') return null
            const directKeys = [
                'asset', 'organisation', 'substation', 'voltageLevel', 'bay', 'oldWork',
                'voltageTransformer', 'currentTransformer', 'circuitBreaker', 'breaker',
                'transformer', 'bushing', 'surgeArrester', 'disconnector', 'powerCable',
                'capacitor', 'reactor', 'rotatingMachine'
            ]

            for (const key of directKeys) {
                if (data[key] && (data[key].mrid || data[key].id)) return data[key].mrid || data[key].id
            }

            if (data.mrid || data.id) return data.mrid || data.id
            return null
        },

        async markSavedExistingResultDirtyIfChanged(result) {
            if (!result || result.changed !== true || !this.clientSlide) return

            const mrid = this.extractSavedSyncMrid(result.data)
            if (!mrid || !window.electronAPI || !window.electronAPI.getSyncStateByMrid) return

            const stateResponse = await window.electronAPI.getSyncStateByMrid(mrid)
            if (!stateResponse || !stateResponse.success || !stateResponse.data) {
                const looksLikeServerId = /^\d+$/.test(String(mrid))
                if (!looksLikeServerId) return
            }

            const node = this.findNodeByIdOrMrid
                ? this.findNodeByIdOrMrid(mrid, this.organisationClientList || [])
                : null
            const nodeType = this.getSyncNodeType(node) || (stateResponse.data && stateResponse.data.node_type) || ''

            await window.electronAPI.markNodeDirty(mrid, nodeType)
            this.updateTreeNodeSyncState(mrid, 'dirty')
        },

        async handleSyncStateChanged(event) {
            const detail = event && event.detail ? event.detail : (event || {})
            if (!detail.mrid || !detail.status) return
            if (detail.existingOnly && window.electronAPI && window.electronAPI.getSyncStateByMrid) {
                const stateResponse = await window.electronAPI.getSyncStateByMrid(detail.mrid)
                if (!stateResponse || !stateResponse.success || !stateResponse.data) {
                    const looksLikeServerId = /^\d+$/.test(String(detail.mrid))
                    if (!looksLikeServerId || detail.status !== 'dirty' || !window.electronAPI.markNodeDirty) return

                    const node = this.findNodeByIdOrMrid
                        ? this.findNodeByIdOrMrid(detail.mrid, this.organisationClientList || [])
                        : null
                    await window.electronAPI.markNodeDirty(detail.mrid, this.getSyncNodeType(node))
                }
            }
            this.updateTreeNodeSyncState(detail.mrid, detail.status, detail)
        }
    }
}
