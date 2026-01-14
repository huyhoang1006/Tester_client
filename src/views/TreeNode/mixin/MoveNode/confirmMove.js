export default {
    methods: {
        // handleTargetNodeClick(data, node, component) {
        //     if (data.disabled) {
        //         this.$message.warning('Cannot move to this node type')
        //         this.selectedTargetNode = null
        //         return
        //     }
        //     this.selectedTargetNode = data
        // },

        // 5. Xác nhận di chuyển
        async confirmMoveNode() {
            if (!this.selectedTargetNode) {
                this.$message.warning('Please select a target node')
                return
            }

            // Sử dụng nodeToMove đã được lưu trong handleMoveNode thay vì selectedNodes
            // vì selectedNodes có thể bị clear khi user tương tác với dialog
            if (!this.nodeToMove) {
                this.$message.warning('No node selected to move')
                return
            }

            const nodeToMove = this.nodeToMove
            const newParent = this.selectedTargetNode

            if (!nodeToMove) {
                this.$message.error('Cannot find node to move')
                return
            }

            if (!newParent) {
                this.$message.error('Cannot find target parent')
                return
            }

            // Kiểm tra trùng cha
            if (nodeToMove.parentId === newParent.mrid) {
                this.$message.warning('Node is already in this location')
                return
            }
            let sourceName = nodeToMove.name
            // Nếu name rỗng hoặc null, thử lấy serial_number hoặc serial_no
            if (!sourceName || sourceName.toString().trim() === '') {
                sourceName = nodeToMove.serial_number || nodeToMove.serial_no
            }
            // Nếu vẫn không có, hiển thị giá trị mặc định
            sourceName = sourceName || 'Unknown Item'

            let targetName = newParent.name || 'Unknown Location'
            this.$confirm(`Move "${sourceName}" to "${targetName}"?`, 'Confirm Move', {
                confirmButtonText: 'Confirm',
                cancelButtonText: 'Cancel',
                cancelButtonClass: 'el-button--danger',
                type: 'warning'
            })
                .then(async () => {
                    try {
                        let success = false
                        let updateResult = null

                        // --- XỬ LÝ ASSET (Power Cable, Transformer, ...) ---
                        if (nodeToMove.mode === 'asset') {
                            // 1. Lấy thông tin location của Substation đích (newParent)
                            const targetLocRes = await window.electronAPI.getLocationByPowerSystemResourceMrid(newParent.mrid)
                            let newLocationMrid = null
                            if (targetLocRes.success && targetLocRes.data) {
                                newLocationMrid = targetLocRes.data.mrid
                            }

                            // 2. Lấy dữ liệu chi tiết của Asset hiện tại để chuẩn bị update
                            const assetEntity = await window.electronAPI.getAssetByMrid(nodeToMove.mrid)
                            if (assetEntity.success && assetEntity.data) {
                                const assetData = assetEntity.data

                                // 3. CẬP NHẬT TRƯỜNG LOCATION CHO ASSET
                                if (newLocationMrid) {
                                    assetData.location = newLocationMrid // Gán ID location của Substation mới vào đây

                                    // Gọi API update bản ghi Asset (Sử dụng hàm updateAsset chung hoặc theo loại)
                                    // Lưu ý: Đảm bảo preload đã expose hàm updateAssetByMrid
                                    const updateAssetRes = await window.electronAPI.updateAssetByMrid(assetData.mrid, assetData)
                                    if (!updateAssetRes.success) {
                                        console.error('Lỗi khi cập nhật trường location của Asset:', updateAssetRes.message)
                                    }
                                }
                            }

                            // 4. CẬP NHẬT LIÊN KẾT CÂY (AssetPsr) - Giữ nguyên hoặc tối ưu logic cũ của bạn
                            let currentAssetPsr = null
                            if (nodeToMove.parentId) {
                                const searchRes = await window.electronAPI.getAssetPsrByAssetIdAndPsrId(nodeToMove.mrid, nodeToMove.parentId)
                                if (searchRes.success && searchRes.data) {
                                    currentAssetPsr = searchRes.data
                                }
                            }

                            if (currentAssetPsr) {
                                currentAssetPsr.psr_id = newParent.mrid // Chuyển sang cha mới (Substation 2)
                                updateResult = await window.electronAPI.updateAssetPsr(currentAssetPsr.mrid, currentAssetPsr)
                                success = updateResult.success
                            } else {
                                // Nếu trước đó không có cha (mồ côi), tạo mới liên kết
                                const newAssetPsr = {
                                    mrid: this.generateUuid(),
                                    asset_id: nodeToMove.mrid,
                                    psr_id: newParent.mrid
                                }
                                updateResult = await window.electronAPI.insertAssetPsr(newAssetPsr)
                                success = updateResult.success
                            }
                        }
                        // --- XỬ LÝ CÁC LOẠI KHÁC (Giữ nguyên logic cũ của bạn) ---
                        else if (nodeToMove.mode === 'organisation') {
                            // ... (Code cũ của bạn đúng rồi)
                            const orgEntity = await window.electronAPI.getOrganisationEntityByMrid(nodeToMove.mrid)
                            if (orgEntity.success) {
                                orgEntity.data.organisation.parent_organization = newParent.mrid
                                updateResult = await window.electronAPI.updateParentOrganizationByMrid(nodeToMove.mrid, orgEntity.data.organisation)
                                success = updateResult.success
                            }
                        } else if (nodeToMove.mode === 'substation') {
                            // ... (Code cũ của bạn)
                            // Lưu ý: Substation thường update Location refId
                            const subData = await window.electronAPI.getSubstationByMrid(nodeToMove.mrid)
                            if (subData.success && subData.data.location) {
                                const locData = await window.electronAPI.getLocationByMrid(subData.data.location)
                                if (locData.success) {
                                    locData.data.refId = newParent.mrid
                                    updateResult = await window.electronAPI.updateLocationByMrid(subData.data.location, locData.data)
                                    success = updateResult.success
                                }
                            }
                        }
                        // ... (Voltage, Bay logic giữ nguyên) ...
                        else if (nodeToMove.mode === 'voltageLevel') {
                            const vl = await window.electronAPI.getVoltageLevelByMrid(nodeToMove.mrid)
                            if (vl.success) {
                                vl.data.substation = newParent.mrid
                                updateResult = await window.electronAPI.updateVoltageLevelByMrid(nodeToMove.mrid, vl.data)
                                success = updateResult.success
                            }
                        } else if (nodeToMove.mode === 'bay') {
                            const bay = await window.electronAPI.getBayByMrid(nodeToMove.mrid)
                            if (bay.success) {
                                if (newParent.mode === 'voltageLevel') {
                                    bay.data.voltage_level = newParent.mrid
                                    bay.data.substation = null
                                } else {
                                    bay.data.substation = newParent.mrid
                                    bay.data.voltage_level = null
                                }
                                updateResult = await window.electronAPI.updateBayByMrid(nodeToMove.mrid, bay.data)
                                success = updateResult.success
                            }
                        }

                        // --- CẬP NHẬT UI SAU KHI THÀNH CÔNG ---
                        if (success) {
                            // 1. Xóa khỏi cha cũ
                            const sourceList = this.clientSlide ? this.organisationClientList : this.ownerServerList
                            const oldParentNode = this.findNodeById(nodeToMove.parentId, sourceList)

                            if (oldParentNode && oldParentNode.children) {
                                const idx = oldParentNode.children.findIndex((c) => c.mrid === nodeToMove.mrid)
                                if (idx !== -1) oldParentNode.children.splice(idx, 1)
                            }

                            // 2. Thêm vào cha mới
                            const newParentInTree = this.findNodeById(newParent.mrid, sourceList)
                            if (newParentInTree) {
                                // Force reload children từ server để đảm bảo dữ liệu đúng
                                this.$set(newParentInTree, '_childrenFetched', false)
                                await this.fetchChildren(newParentInTree)
                                this.$set(newParentInTree, 'expanded', true)
                            }

                            this.$message.success('Moved successfully')
                            this.moveDialogVisible = false
                            this.selectedNodes = []
                        } else {
                            this.$message.error('Move failed: ' + (updateResult?.message || 'Unknown error'))
                        }
                    } catch (error) {
                        console.error(error)
                        this.$message.error('Error: ' + error.message)
                    }
                })
                .catch((err) => {
                    if (err !== 'cancel') {
                        console.error('Move confirmation error:', err)
                    }
                })
        },
    }
}