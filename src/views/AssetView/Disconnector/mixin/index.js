import DisconnectorDTO from "@/views/Dto/Disconnector"
import uuid from "@/utils/uuid";
import * as Mapping from "@/views/Mapping/Disconnector"
export default {
    data() {
        return {
            disconnector: new DisconnectorDTO,
            attachmentData: []
        }
    },

    async beforeMount() {
        try {
            const mode = this.$route && this.$route.query ? this.$route.query.mode : null
            const assetId = this.$route && this.$route.query ? this.$route.query.asset_id : null
            if (mode === 'edit' || mode === 'dup') {
                if (assetId) {
                    const rs = await window.electronAPI.getDisconnectorById(assetId)
                    if (rs && rs.success && rs.data && rs.data.length) {
                        const row = rs.data[0]
                        const properties = JSON.parse(row.properties || '{}')
                        const ratings = JSON.parse(row.ratings || '{}')
                        const config = JSON.parse(row.config || '{}')
                        if (mode === 'dup') {
                            properties.serial_no = ''
                        }
                        // Bind back to form
                        this.disconnector.properties = Object.assign({}, this.disconnector.properties, properties)
                        this.disconnector.ratings = Object.assign({}, this.disconnector.ratings, ratings)
                        this.disconnector.config = Object.assign({}, this.disconnector.config || {}, config)
                        // keep id if needed later
                        this.disconnector.id = row.id
                    }
                }
            }
        } catch (e) {
            console.error('Failed to load disconnector for edit:', e)
        }
    },
    methods: {
        async deleteAsset() {
            try {
                const assetMrid = this.disconnector && this.disconnector.properties && this.disconnector.properties.mrid
                const psrId = this.parentData && this.parentData.mrid ? this.parentData.mrid : null
                if (!assetMrid) {
                    this.$message.error('Không tìm thấy MRID của asset để xóa')
                    return { success: false }
                }

                await this.$confirm('Xóa Disconnector này và toàn bộ dữ liệu liên quan?', 'Cảnh báo', {
                    type: 'warning',
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Hủy'
                })

                // Lấy entity đầy đủ theo MRID để xóa theo đúng quan hệ
                const entityRs = await window.electronAPI.getDisconnectorEntityByMrid(assetMrid, psrId)
                if (!entityRs || !entityRs.success || !entityRs.data) {
                    this.$message.error('Không lấy được dữ liệu entity để xóa')
                    return { success: false }
                }

                const rt = await window.electronAPI.deleteDisconnectorEntity(entityRs.data)
                if (rt && rt.success) {
                    this.$message.success('Đã xóa Disconnector')
                    // Optional: điều hướng về danh sách hoặc đóng tab hiện tại
                    if (this.$router) {
                        this.$router.back()
                    }
                    return { success: true }
                }
                this.$message.error(rt && rt.message ? rt.message : 'Xóa thất bại')
                return { success: false }
            } catch (err) {
                // Người dùng bấm Cancel hoặc lỗi runtime
                if (err !== 'cancel') {
                    console.error('Delete Disconnector error:', err)
                    this.$message.error('Xóa thất bại')
                }
                return { success: false }
            }
        },
        async saveAsset() {
            try {
                if (this.disconnector.properties.serial_no !== null && this.disconnector.properties.serial_no !== '') {
                    const data = JSON.parse(JSON.stringify(this.disconnector));
                    const result = this.checkDisconnectorData(data);
                    const resultEntity = Mapping.disconnectorDtoToEntity(result);
                    let rs = await window.electronAPI.insertDisconnectorEntity(resultEntity)
                    if (rs.success) {
                        return {
                            success: true,
                            data: rs.data,
                        };
                    } else {
                        this.$message.error("Error saving Disconnector entity: " + rs.message);
                        return {
                            success: false,
                            error: rs.error,
                        };
                    }
                } else {
                    this.$message.error("Serial number is required");
                    return {
                        success: false,
                    };
                }
            } catch (error) {
                console.error("Error saving asset:", error);
                this.$message.error("Error saving asset: " + error.message);
                return {
                    success: false,
                };
            }
        },

        async saveCtrS() {
            const data = await this.saveAsset()
            if (data && data.success) {
                // Load back the saved entity so the UI shows exactly what was stored
                if (data.data) {
                    // Convert Entity -> DTO before binding to UI
                    const dto = Mapping.disconnectorEntityToDto(data.data)
                    this.loadData(dto)
                }
                this.$message.success("Asset saved successfully")
            } else {
                this.$message.error("Failed to save asset")
            }
        },

        resetForm() {
            this.disconnector = new DisconnectorDTO
            this.attachmentData = [];
        },

        loadData(data) {
            this.disconnector = data;
            if (data.attachment && data.attachment.path) {
                this.attachmentData = JSON.parse(data.attachment.path)
            } else {
                this.attachmentData = []
            }
        },

        checkDisconnectorData(data) {
            try {
                this.checkProperty(data);
                this.checkLifecycleDate(data);
                this.checkPsrId(data);
                this.checkProductAssetModel(data);
                this.checkAssetPrs(data);
                this.checkAttachment(data);
                this.checkLocationId(data);
                this.checkAssetInfoId(data)
                return data;
            } catch (error) {
                console.error("Error checking Disconnector data:", error);
            }
        },

        checkProperty(data) {
            if (data.properties.mrid == null || data.properties.mrid == '') {
                data.properties.mrid = uuid.newUuid();
            }
        },
        checkLifecycleDate(data) {
            if (data.lifecycleDateId == null || data.lifecycleDateId == '') {
                data.lifecycleDateId = uuid.newUuid();
            }
        },

        checkPsrId(data) {
            if (this.parentData.mrid !== null && this.parentData.mrid !== '' && this.parentData.mrid !== undefined) {
                data.psrId = this.parentData.mrid
            }
        },

        checkProductAssetModel(data) {
            if (data.productAssetModelId === null || data.productAssetModelId === '') {
                data.productAssetModelId = uuid.newUuid()
            }
        },

        checkAssetPrs(data) {
            if (data.assetPsrId === null || data.assetPsrId === '') {
                data.assetPsrId = uuid.newUuid();
            }
        },

        checkProductAssetModelId(data) {
            if (data.productAssetModelId === null || data.productAssetModelId === '') {
                data.productAssetModelId = uuid.newUuid();
            }
        },

        checkAttachment(data) {
            if (data.attachmentId === null || data.attachmentId === '') {
                if (this.attachmentData.length > 0) {
                    data.attachmentId = uuid.newUuid()
                    data.attachment.id = data.attachmentId
                    data.attachment.name = null
                    data.attachment.path = JSON.stringify(this.attachmentData)
                    data.attachment.type = 'asset'
                    data.attachment.id_foreign = data.properties.mrid
                }
            } else {
                data.attachment.path = JSON.stringify(this.attachmentData)
            }
        },

        checkLocationId(data) {
            if (data.locationId === null || data.locationId === '') {
                data.locationId = this.locationId;
            }
        },

        checkAssetInfoId(data) {
            if (data.assetInfoId === null || data.assetInfoId === '') {
                data.assetInfoId = uuid.newUuid()
            }
        }
    }
}