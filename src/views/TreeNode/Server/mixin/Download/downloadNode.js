/* eslint-disable */
import Vue from 'vue'
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

        async handleDownloadNode() {
            console.log(this.selectedNodes)
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                return this.$message.warning('Vui lòng chọn 1 node để tải')
            }
            const node = this.selectedNodes[this.selectedNodes.length - 1]

            // Bùm! Xong chuyện!
            await executeDownload(node, this)
        },
    }
}