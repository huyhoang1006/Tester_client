/* eslint-disable */
import constant from '@/utils/constant'
import { executeDownloadChainWithResults } from './index.js'
import * as coreUtils from './core-utils.js'
import { toLocalMrid } from '@/utils/serverId'
import { startLoading } from '@/utils/loading'

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

            // Mở overlay TRƯỚC khi dựng chuỗi, vì gom con cháu cũng phải gọi mạng và
            // có thể mất vài giây. Chưa biết tổng nên `total` để 0; đặt lại ngay sau
            // khi dựng xong chuỗi, và từ đó thanh tiến độ là số thật.
            const reporter = startLoading(this, {
                action: 'download',
                text: 'Collecting nodes...',
                type: 'heavy'
            })

            let results = []
            try {
                const userId = this.$store && this.$store.state && this.$store.state.user
                    ? this.$store.state.user.user_id
                    : null
                // buildOrgAncestors trả về gốc → node, đúng thứ tự cha trước con
                const chain = await coreUtils.buildOrgAncestors({ ...node, _currentUserId: userId })

                if (includeDescendants) {
                    const descendants = await this.collectDownloadDescendants(node)
                    const seen = new Set(chain.map(item => String(item.mrid || item.id)))
                    for (const child of descendants) {
                        // đổi sang mrid local (có hậu tố loại node) như buildOrgAncestors
                        const childId = String(toLocalMrid(child.mrid || child.id, child, userId))
                        if (seen.has(childId)) continue
                        seen.add(childId)
                        const parentArr = Array.isArray(child.parentArr) ? child.parentArr : []
                        const parentMeta = parentArr.length ? parentArr[parentArr.length - 1] : null
                        const rawParentId = child.parentId || parentMeta?.mrid || parentMeta?.id || node.mrid || node.id || constant.ROOT
                        const localParentId = parentMeta
                            ? toLocalMrid(rawParentId, parentMeta, userId)
                            : toLocalMrid(rawParentId, node, userId)
                        chain.push({
                            id: childId,
                            mrid: childId,
                            name: child.name || '',
                            aliasName: child.aliasName || '',
                            parentId: String(localParentId),
                            _type: child.mode,
                            asset: child.asset || null,
                            job: child.job || null
                        })
                    }
                }

                if (!chain.length) {
                    this.$message.warning('No node found to download')
                    return
                }

                // In ra chuỗi TRƯỚC khi tải. Mọi `parentId` phải mang hậu tố người
                // dùng; còn id trần nghĩa là node đó sẽ trỏ khoá ngoại vào một bản ghi
                // không tồn tại và lượt ghi đổ với thông báo trống rỗng ("fail").
                const unscoped = chain.filter(item => item.parentId
                    && String(item.parentId) !== String(constant.ROOT)
                    && String(item.parentId).indexOf('@') === -1)
                if (unscoped.length) {
                    console.error('[Download tree] CO NODE CHA CHUA GAN HAU TO:',
                        unscoped.map(i => ({ node: i.mrid, type: i._type, parentId: i.parentId })))
                }
                console.log('[Download tree] chuoi tai xuong:',
                    chain.map(i => `${i._type}:${i.mrid} <- ${i.parentId}`))

                // Từ đây đã biết tổng số node, nên thanh tiến độ hiện số thật thay vì
                // vạch chạy vô định.
                reporter.progress(`Preparing to download ${chain.length} node(s)`, 0, chain.length)

                results = await executeDownloadChainWithResults(chain, this, reporter)
            } catch (error) {
                console.error('[Download tree] error:', error)
                if (error.message !== 'CANCELED') {
                    this.$message.error('Error in download: ' + (error.message || 'Unknown error'))
                }
                return
            } finally {
                await reporter.close()
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
