import { uploadSingleTest, downloadSingleTest } from '@/utils/testSync'
import { toServerId } from '@/utils/serverId'

const errorMessage = error => {
    const data = error && error.response && error.response.data
    if (error && error.response && error.response.status === 409) {
        return 'This test has changed on the server. Download and merge it before uploading again.'
    }
    if (data && Array.isArray(data.violations) && data.violations.length) {
        return data.violations.map(violation => {
            const field = violation.path || 'Payload'
            const reason = violation.message || violation.code || 'Invalid value'
            const value = violation.rejectedValue
            return `${field}: ${reason}${value == null ? '' : ` (${value})`}`
        }).join('; ')
    }
    return (data && (data.message || data.error)) || (error && error.message) || 'Test synchronization failed'
}

export default {
    methods: {
        formatTestSyncError: errorMessage,
        async processUploadTest(node) {
            try {
                const result = await uploadSingleTest(node)
                await this.refreshServerTestAsset(node.parentId)
                this.$message.success('Test uploaded successfully')
                return result
            } catch (error) {
                throw new Error(errorMessage(error))
            }
        },
        async processDownloadTest(node) {
            try {
                const result = await downloadSingleTest(node, this.$store.state.user.user_id, name => this.$confirm(
                    `Replace the local test "${name || node.name}" with the server version?`, 'Download test',
                    { confirmButtonText: 'Download', cancelButtonText: 'Cancel', type: 'warning' }
                ))
                await this.handleClientJobUpdated({ assetMrid: result.assetMrid })
                this.$message.success('Test downloaded successfully')
                return result
            } catch (error) {
                if (error === 'cancel' || error === 'close' || error.message === 'CANCELED') return null
                throw new Error(errorMessage(error))
            }
        },
        async refreshServerTestAsset(assetId) {
            const visit = nodes => {
                for (const node of (nodes || [])) {
                    if (node.mode === 'asset' && String(toServerId(node.mrid)) === String(toServerId(assetId))) return node
                    const found = visit(node.children)
                    if (found) return found
                }
                return null
            }
            const asset = visit(this.ownerServerList)
            if (asset) await this.fetchChildrenServer(asset)
        }
    }
}
