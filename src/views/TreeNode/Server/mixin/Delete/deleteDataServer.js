/* eslint-disable */
import * as demoAPI from '@/api/demo'
import * as bushingAPI from '@/api/demo/Bushing'
import * as transformerAPI from '@/api/demo/Transformer'
import * as voltageTransformerAPI from '@/api/demo/VoltageTransformer'
import * as currentTransformerAPI from '@/api/demo/CurrentTransformer'
import * as circuitBreakerAPI from '@/api/demo/CircuitBreaker'
import * as disconnectorAPI from '@/api/demo/Disconnector'
import * as surgeArresterAPI from '@/api/demo/SurgeArrester'

export default {
    methods: {
        async deleteDataServer(node) {
            const id = this.getServerNodeId(node)
            if (!id) {
                throw new Error('Server node id not found')
            }

            await this.callServerDeleteApi(node, id)
            this.removeServerNodeFromTree(node)
            this.$message.success('Deleted successfully')
        },

        getServerNodeId(node) {
            return node?.id || node?._serverId || node?.mrid || null
        },

        async callServerDeleteApi(node, id) {
            if (node.mode === 'organisation') {
                return demoAPI.deleteOrganisation(id)
            }
            if (node.mode === 'substation') {
                return demoAPI.deleteSubstation(id)
            }
            if (node.mode === 'voltageLevel') {
                return demoAPI.deleteVoltageLevel(id)
            }
            if (node.mode === 'bay') {
                return demoAPI.deleteBay(id)
            }
            if (node.mode === 'asset') {
                return this.callServerAssetDeleteApi(node, id)
            }

            throw new Error('Delete from server is not supported for this node type')
        },

        async callServerAssetDeleteApi(node, id) {
            if (node.asset === 'Transformer') {
                return transformerAPI.deleteTransformer(id)
            }
            if (node.asset === 'Voltage transformer') {
                return voltageTransformerAPI.deleteVoltageTransformer(id)
            }
            if (node.asset === 'Current transformer') {
                return currentTransformerAPI.deleteCurrentTransformer(id)
            }
            if (node.asset === 'Circuit breaker') {
                return circuitBreakerAPI.deleteCircuitBreaker(id)
            }
            if (node.asset === 'Disconnector') {
                return disconnectorAPI.deleteDisconnector(id)
            }
            if (node.asset === 'Surge arrester') {
                return surgeArresterAPI.deleteSurgeArrester(id)
            }
            if (node.asset === 'Bushing') {
                return bushingAPI.deleteBushing(id)
            }
            if (node.asset === 'Power cable') {
                return demoAPI.deletePowerCable(id)
            }

            throw new Error(`Delete from server is not supported for asset: ${node.asset || 'unknown'}`)
        },

        removeServerNodeFromTree(node) {
            const removed = this.removeNodeFromListByServerId(this.ownerServerList, node)
            if (removed) return

            const parentNode = this.findNodeById(node.parentId, this.ownerServerList)
            if (parentNode && Array.isArray(parentNode.children)) {
                this.removeNodeFromListByServerId(parentNode.children, node)
            }
        },

        removeNodeFromListByServerId(list, node) {
            if (!Array.isArray(list) || !node) return false

            const targetKeys = [node.id, node._serverId, node.mrid].filter(Boolean).map(String)

            for (let index = 0; index < list.length; index += 1) {
                const item = list[index]
                const itemKeys = [item.id, item._serverId, item.mrid].filter(Boolean).map(String)
                if (targetKeys.some(key => itemKeys.includes(key))) {
                    list.splice(index, 1)
                    return true
                }

                if (this.removeNodeFromListByServerId(item.children, node)) {
                    return true
                }
            }

            return false
        }
    }
}
