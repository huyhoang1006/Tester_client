import * as demoAPI from '@/api/demo'
export default {
    methods: {
        // 4. Handler cho việc chọn node trong tree dialog (tương tự move node)
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
        // 1. Khi nhấn nút Download trên toolbar
        async handleDownloadNode() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a node to download')
                return
            }

            const node = this.selectedNodes[this.selectedNodes.length - 1]

            try {
                // 1. Lấy dữ liệu thô từ Server
                const serverResponse = await demoAPI.getAssetById(node.mrid, 'PowerCable')
                if (!serverResponse) return

                // 2. Map sang DTO bằng hàm của bạn
                const PowerCableServerMapper = require('@/views/Mapping/PowerCableTest/index.js')
                const dto = PowerCableServerMapper.mapServerToDto(serverResponse)

                // 3. QUAN TRỌNG: Gán các ID quan hệ để Map về Entity local không bị lỗi
                // Vì Database local của bạn chia làm nhiều bảng (Asset, AssetInfo, Model...)
                dto.assetInfoId = serverResponse.cableInfo?.mRID || serverResponse.cableInfo?.mrid || this.generateUuid()
                dto.productAssetModelId = serverResponse.assetData?.productAssetModel?.mRID || this.generateUuid()
                dto.lifecycleDateId = this.generateUuid() // Thường server không trả về ID bảng này, nên tạo mới
                dto.oldCableInfoId = dto.assetInfoId // Trong PowerCable, OldCableInfo dùng chung ID với AssetInfo
                dto.assetPsrId = this.generateUuid()

                // 4. Kiểm tra node cha trên Client
                // node.parentId là ID của cha (Substation/Bay) từ server
                const clientParent = this.findNodeById(node.parentId, this.organisationClientList)

                if (clientParent) {
                    // Trường hợp 1: Đã có cha trên Client -> Tự động gắn
                    dto.psrId = clientParent.mrid
                    dto.locationId = clientParent.location || clientParent.mrid
                    await this.executeDownloadAndSave(dto, clientParent)
                } else {
                    // Trường hợp 2: Chưa có cha -> Hiện cây Client để chọn cha
                    this.nodeToDownloadData = dto
                    this.moveTreeData = this.buildMoveTreeData(this.organisationClientList, { mrid: 'none' }, this.getValidParentTypes('asset'))
                    this.downloadDialogVisible = true
                }
            } catch (error) {
                console.error('Download error:', error)
                this.$message.error('Download failed: ' + error.message)
            }
        },

        // 2. Hàm thực hiện lưu vào DB (Xử lý ghi đè nếu đã tồn tại)
        async executeDownloadAndSave(dto, parentNode) {
            try {
                const PowerCableMapping = require('@/views/Mapping/PowerCable/index')

                // 1. Kiểm tra xem node này đã có ở client chưa (Dựa vào MRID từ server)
                const existingLocalRes = await window.electronAPI.getPowerCableEntityByMrid(dto.properties.mrid, dto.psrId)

                let oldEntity
                if (existingLocalRes.success && existingLocalRes.data) {
                    // ĐÃ CÓ -> Đây là trường hợp GHI ĐÈ
                    oldEntity = existingLocalRes.data
                } else {
                    // CHƯA CÓ -> Tạo mới hoàn toàn
                    const PowerCableEntity = require('@/views/Flatten/PowerCable/index').default
                    oldEntity = new PowerCableEntity()
                }

                // 2. Chuyển DTO thành Entity chuẩn của client
                const newEntity = PowerCableMapping.mapDtoToEntity(dto)

                // 3. Lưu vào Database local
                // Nhờ lệnh "ON CONFLICT(mrid) DO UPDATE" trong các hàm của bạn,
                // dữ liệu mới sẽ tự động ghi đè lên các bản ghi cũ cùng MRID.
                const saveRs = await window.electronAPI.insertPowerCableEntity(oldEntity, newEntity)

                if (saveRs.success) {
                    this.$message.success('Download and overwrite successful!')
                    this.downloadDialogVisible = false

                    // 4. Refresh lại cây bên Client để thấy node mới/cập nhật
                    if (parentNode) {
                        this.$set(parentNode, '_childrenFetched', false)
                        await this.fetchChildren(parentNode)
                        this.$set(parentNode, 'expanded', true)
                    }
                } else {
                    this.$message.error('Save failed: ' + saveRs.message)
                }
            } catch (error) {
                console.error('Save error:', error)
                this.$message.error('Error saving to local database')
            }
        },
    }
}