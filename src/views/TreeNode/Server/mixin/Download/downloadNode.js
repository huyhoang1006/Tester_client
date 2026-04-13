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
            
            await executeDownload(node, this) 
        },
    }
}