/* eslint-disable */
import constant from '@/utils/constant'
import { executeDownloadChainWithResults } from './index.js'
import * as coreUtils from './core-utils.js'
import { toLocalMrid } from '@/utils/serverId'

/**
 * Download nhiều node một lượt, có bảng kết quả và bỏ qua node lỗi.
 *
 *  - Download path node : từ node lên gốc
 *  - Download full tree  : từ node lên gốc + toàn bộ con cháu của node
 */
export default {
    methods: {
        async handleDownloadPathTree() {
            await this.startDownloadTree({ includeDescendants: false, title: 'Download path node' })
        },

        async handleDownloadFullTree() {
            await this.startDownloadTree({ includeDescendants: true, title: 'Download full tree' })
        },

        async startDownloadTree({ includeDescendants, title }) {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a node to download')
                return
            }
            const node = this.selectedNodes[this.selectedNodes.length - 1]

            this.$store.dispatch('loading/start', { action: 'download', type: 'heavy' })

            let results = []
            try {
                // buildOrgAncestors trả về gốc → node, đúng thứ tự cha trước con
                const chain = await coreUtils.buildOrgAncestors(node)

                if (includeDescendants) {
                    const descendants = await this.collectDownloadDescendants(node)
                    const seen = new Set(chain.map(item => String(item.mrid || item.id)))
                    let prevParentId = String(node.mrid || node.id)
                    for (const child of descendants) {
                        // đổi sang mrid local (có hậu tố loại node) như buildOrgAncestors
                        const childId = String(toLocalMrid(child.mrid || child.id, child))
                        if (seen.has(childId)) continue
                        seen.add(childId)
                        chain.push({
                            id: childId,
                            mrid: childId,
                            name: child.name || '',
                            aliasName: child.aliasName || '',
                            parentId: String(child.parentId || prevParentId || constant.ROOT),
                            _type: child.mode,
                            asset: child.asset || null
                        })
                    }
                }

                if (!chain.length) {
                    this.$message.warning('No node found to download')
                    return
                }

                results = await executeDownloadChainWithResults(chain, this)
            } catch (error) {
                console.error('[Download tree] error:', error)
                this.$message.error('Error in download: ' + (error.message || 'Unknown error'))
                return
            } finally {
                this.$store.dispatch('loading/stop')
            }

            await this.writeSyncLogBatch('DOWNLOAD', results)
            this.showOpResult(title, results)
        },

        /**
         * Gom con cháu của node trên cây SERVER theo thứ tự cha trước con.
         * Node có thể chưa expand nên phải fetchChildrenServer để nạp vào tree.
         */
        async collectDownloadDescendants(node) {
            const result = []
            const visit = async (current) => {
                if (this.fetchChildrenServer) {
                    try {
                        await this.fetchChildrenServer(current)
                    } catch (error) {
                        console.error('Fetch server children failed while collecting download nodes:', error)
                        return
                    }
                }
                const children = Array.isArray(current.children) ? [...current.children] : []
                for (const child of children) {
                    result.push(child)
                    await visit(child)
                }
            }
            await visit(node)
            return result
        }
    }
}
