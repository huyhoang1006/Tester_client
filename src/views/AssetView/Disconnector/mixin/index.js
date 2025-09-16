import DisconnectorDTO from "@/views/Dto/Disconnector"
import uuid from "@/utils/uuid";
import * as Mapping from "@/views/Mapping/Disconnector"
export default {
    data() {
        return {
            disconnector : new DisconnectorDTO,
            attachmentData : []
        }
    },
    methods : {
        async saveAsset() {
            try {
                if(this.disconnector.properties.serial_no !== null && this.disconnector.properties.serial_no !== '') {
                    const data = JSON.parse(JSON.stringify(this.disconnector));
                    const result = this.checkDisconnectorData(data);
                    const resultEntity = Mapping.disconnectorDtoToEntity(result);
                    let rs = await window.electronAPI.insertDisconnectorEntity(resultEntity)
                    if(rs.success) {
                        return {
                            success: true,
                            data: rs.data,
                        };
                    } else {
                        this.$message.error("Error saving Surge Arrester entity: " + rs.message);
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
            if(data.success) {
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
            if(data.attachment && data.attachment.path) {
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
            if(data.properties.mrid == null || data.properties.mrid == '') {
                data.properties.mrid = uuid.newUuid();
            }
        },
        checkLifecycleDate(data) {
            if(data.lifecycleDateId == null || data.lifecycleDateId == '') {
                data.lifecycleDateId = uuid.newUuid();
            }
        },

        checkPsrId(data) {
            if(this.parentData.mrid !== null && this.parentData.mrid !== '' && this.parentData.mrid !== undefined) {
                data.psrId = this.parentData.mrid
            }
        },

        checkProductAssetModel(data) {
            if(data.productAssetModelId === null || data.productAssetModelId === '') {
                data.productAssetModelId = uuid.newUuid()
            }
        },

        checkAssetPrs(data) {
            if(data.assetPsrId === null || data.assetPsrId === '') {
                data.assetPsrId = uuid.newUuid();
            }
        },

        checkProductAssetModelId(data) {
            if(data.productAssetModelId === null || data.productAssetModelId === '') {
                data.productAssetModelId = uuid.newUuid();
            }
        },

        checkAttachment(data) {
            if(data.attachmentId === null || data.attachmentId === '') {
                if (this.attachmentData.length > 0) {
                    data.attachmentId = uuid.newUuid()
                    data.attachment.id = data.attachmentId
                    data.attachment.name = null
                    data.attachment.path = JSON.stringify(this.attachmentData)
                    data.attachment.type = 'asset'
                    data.attachment.id_foreign = data.properties.mrid
                }
            } 
        },

        checkLocationId(data) {
            if(data.locationId === null || data.locationId === '') {
                data.locationId = this.locationId;
            }
        },

        checkAssetInfoId(data) {
            if(data.assetInfoId === null || data.assetInfoId === '') {
                data.assetInfoId = uuid.newUuid()
            }
        }
    }
}