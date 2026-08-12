/* eslint-disable */
import { executeDownload } from './index.js'
import { toLocalMrid } from '@/utils/serverId'

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

            const originalMessage = this.$message
            let captured = ''
            this.$message = {
                success: (m) => originalMessage.success(m),
                info: (m) => originalMessage.info(m),
                warning: (m) => { captured = captured || m; originalMessage.warning(m) },
                error: (m) => { captured = captured || m; originalMessage.error(m) }
            }
            try {
                await executeDownload(node, this, { includePath: false })
            } finally {
                this.$message = originalMessage
            }
            await this.writeSyncLog('DOWNLOAD', node, !captured, captured)
        },

        /**
         * mrid của node cha, ở DẠNG LOCAL (có hậu tố loại).
         *
         * Node truyền vào đây đến từ CÂY SERVER, nơi `parentId` là id server trần
         * ('12'). Mọi thứ hàm này phục vụ thì lại tra ở phía LOCAL — cây client và DB
         * SQLite — nơi mọi id đều mang hậu tố ('12@sub'). So thẳng hai dạng đó với
         * nhau là không bao giờ khớp.
         *
         * Triệu chứng: bấm "Download only node" trên bất cứ thứ gì dưới trạm đều bị
         * chặn bằng "Must download parent node first", dù trạm cha đã nằm sẵn ở máy.
         *
         * Trước đây tổ chức vô tình thoát nạn, vì mrid tổ chức bị ghi TRẦN do lỗi ở
         * `Download/organisation.js` — trần so với trần thì khớp. Sửa lỗi đó xong là
         * trạm cũng dính theo, nên hai chỗ phải đi cùng nhau.
         *
         * `toLocalMrid` là thao tác idempotent: giá trị đã có hậu tố thì giữ nguyên.
         *
         * @param {object} node node trên cây server
         * @returns {string|null} mrid cha dạng local, null nếu node không có cha
         */
        getDownloadParentId(node) {
            const parentArr = Array.isArray(node.parentArr) ? node.parentArr : []
            const lastParent = parentArr.length ? parentArr[parentArr.length - 1] : null
            const rawParentId = node.parentId || lastParent?.mrid || lastParent?.id || null
            if (!rawParentId) return null
            // Hậu tố suy từ META của CHA (`lastParent.mode` / `.asset`), không phải của
            // node hiện tại — cùng một id nhưng khác loại thì ra hai hậu tố khác nhau.
            return lastParent ? toLocalMrid(rawParentId, lastParent) : rawParentId
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

            // Cùng lý do với `getDownloadParentId`: id vào từ cây server là dạng trần,
            // còn DB local lưu dạng có hậu tố. Không đổi thì hàm này luôn trả về false,
            // và hộp thoại "đã tồn tại, ghi đè?" KHÔNG BAO GIỜ hiện — bản ở máy bị ghi
            // đè lặng lẽ, kể cả khi người dùng vừa sửa dở.
            const mrid = toLocalMrid(node.mrid || node.id, node)
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
                } else if (node.mode === 'job') {
                    result = await this.getLocalJobForDownload(node, mrid)
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

        /**
         * Job này đã có ở máy chưa.
         *
         * Chỉ phục vụ hộp thoại "đã tồn tại, ghi đè?" ở `handleDownloadOnlyNode`.
         * Chừng nào chưa có bước gộp thì đó là chỗ DUY NHẤT người dùng được hỏi
         * trước khi bản ở máy bị bản trên server ghi đè — thiếu nhánh này thì hộp
         * thoại không bao giờ hiện và công sửa ở máy biến mất không một lời cảnh báo.
         *
         * `node.job` giữ nhãn loại THIẾT BỊ, giống `node.asset` ở cấp trên.
         */
        async getLocalJobForDownload(node, mrid) {
            if (node.job === 'Transformer') {
                return window.electronAPI.getTransformerJobByMrid(mrid)
            }
            if (node.job === 'Voltage transformer') {
                return window.electronAPI.getVoltageTransformerJobByMrid(mrid)
            }
            if (node.job === 'Current transformer') {
                return window.electronAPI.getCurrentTransformerJobByMrid(mrid)
            }
            if (node.job === 'Circuit breaker') {
                return window.electronAPI.getCircuitBreakerJobByMrid(mrid)
            }
            if (node.job === 'Disconnector') {
                return window.electronAPI.getDisconnectorJobByMrid(mrid)
            }
            if (node.job === 'Surge arrester') {
                return window.electronAPI.getSurgeArresterJobByMrid(mrid)
            }

            return null
        },
    }
}
