/* eslint-disable */
import { executeDownload } from './index.js'

export default {
    methods: {
        handleDownloadTargetSelection(node) {
            const targetNode = Array.isArray(node) ? node[node.length - 1] : node
            if (!targetNode || targetNode.disabled) {
                this.selectedDownloadTargetNodes = []
                this.selectedDownloadTargetNode = null
                return
            }
            this.selectedDownloadTargetNodes = [targetNode]
            this.selectedDownloadTargetNode = targetNode
        },

        openDropdown() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a node to download')
            } else {
                this.$refs.treeToolBar.showDownloadDropdown()
            }
        },

        async handleDownloadNode() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                return this.$message.warning('Please select a node to download')
            }
            const node = this.selectedNodes[this.selectedNodes.length - 1]
            
            await executeDownload(node, this, { includePath: true })
        },

        async handleDownloadOnlyNode() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                return this.$message.warning('Please select a node to download')
            }
            const node = this.selectedNodes[this.selectedNodes.length - 1]

            const hasParent = await this.hasLocalParentForDownload(node)
            if (!hasParent) {
                return this.$message.warning('Must download parent node first')
            }

            const nodeExists = await this.hasLocalNodeForDownload(node)
            if (nodeExists) {
                try {
                    await this.$confirm(
                        'This node already exists on client. Do you want to overwrite it?',
                        'Download node',
                        {
                            confirmButtonText: 'Overwrite',
                            cancelButtonText: 'Cancel',
                            type: 'warning'
                        }
                    )
                } catch (error) {
                    return
                }
            }

            await executeDownload(node, this, { includePath: false })
        },

        getDownloadParentId(node) {
            const parentArr = Array.isArray(node.parentArr) ? node.parentArr : []
            const lastParent = parentArr.length ? parentArr[parentArr.length - 1] : null
            return node.parentId || lastParent?.mrid || lastParent?.id || null
        },

        getDownloadParentNode(node) {
            const parentId = this.getDownloadParentId(node)
            if (!parentId) return null
            return this.findNodeById(parentId, this.organisationClientList)
        },

        async hasLocalParentForDownload(node) {
            if (!node || node.mode === 'organisation') return true

            const parentNode = this.getDownloadParentNode(node)
            if (parentNode) return true

            const parentId = this.getDownloadParentId(node)
            if (!parentId) return false

            const parentArr = Array.isArray(node.parentArr) ? node.parentArr : []
            const parentMeta = parentArr.length ? parentArr[parentArr.length - 1] : null
            return this.hasLocalNodeForDownload({
                ...parentMeta,
                mrid: parentId,
                id: parentId,
                mode: parentMeta?.mode,
                asset: parentMeta?.asset,
                parentId: parentMeta?.parentId
            })
        },

        async hasLocalNodeForDownload(node) {
            if (!node) return false

            const mrid = node.mrid || node.id
            if (!mrid) return false

            try {
                let result = null

                if (node.mode === 'organisation') {
                    result = await window.electronAPI.getOrganisationEntityByMrid(mrid)
                } else if (node.mode === 'substation') {
                    result = await window.electronAPI.getSubstationEntityByMrid(
                        mrid,
                        this.$store.state.user.user_id,
                        this.getDownloadParentId(node)
                    )
                } else if (node.mode === 'voltageLevel') {
                    result = await window.electronAPI.getVoltageLevelEntityByMrid(mrid)
                } else if (node.mode === 'bay') {
                    result = await window.electronAPI.getBayEntityByMrid(mrid)
                } else if (node.mode === 'asset') {
                    result = await this.getLocalAssetForDownload(node, mrid)
                }

                return Boolean(result && result.success && result.data)
            } catch (error) {
                console.error('[Download only node] Failed to check local node:', error)
                return false
            }
        },

        async getLocalAssetForDownload(node, mrid) {
            const psrId = this.getDownloadParentId(node)

            if (node.asset === 'Transformer') {
                return window.electronAPI.getTransformerEntityByMrid(mrid, psrId)
            }
            if (node.asset === 'Circuit breaker') {
                return window.electronAPI.getBreakerEntityByMrid(mrid, psrId)
            }
            if (node.asset === 'Surge arrester') {
                return window.electronAPI.getSurgeArresterEntityByMrid(mrid, psrId)
            }
            if (node.asset === 'Current transformer') {
                return window.electronAPI.getCurrentTransformerEntityByMrid(mrid, psrId)
            }
            if (node.asset === 'Voltage transformer') {
                return window.electronAPI.getVoltageTransformerEntityByMrid(mrid, psrId)
            }
            if (node.asset === 'Power cable') {
                return window.electronAPI.getPowerCableEntityByMrid(mrid, psrId)
            }
            if (node.asset === 'Disconnector') {
                return window.electronAPI.getDisconnectorEntityByMrid(mrid, psrId)
            }
            if (node.asset === 'Bushing') {
                return window.electronAPI.getBushingEntityByMrid(mrid, psrId)
            }
            if (node.asset === 'Capacitor') {
                return window.electronAPI.getCapacitorEntityByMrid(mrid, psrId)
            }
            if (node.asset === 'Reactor') {
                return window.electronAPI.getReactorEntityByMrid(mrid, psrId)
            }
            if (node.asset === 'Rotating machine') {
                return window.electronAPI.getRotatingMachineEntityByMrid(mrid, psrId)
            }

            return null
        },
    }
}
