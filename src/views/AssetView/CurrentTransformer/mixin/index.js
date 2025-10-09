import CurrentTransformerDto from "@/views/Dto/CurrentTransformer";
import uuid from "@/utils/uuid";
import * as CurrentTransformerMapping from "@/views/Mapping/CurrentTransformer";
export default {
    data() {
        return {
            currentTransformer: new CurrentTransformerDto(),
            old_data: new CurrentTransformerDto(),
            attachmentData: [],
        }
    },

    methods: {
        async saveAsset() {
            try {
                if (this.currentTransformer.properties.serial_no !== null && this.currentTransformer.properties.serial_no !== '') {
                    const data = JSON.parse(JSON.stringify(this.currentTransformer));
                    const result = await this.checkCurrentTransformerData(data)
                    console.log("result: ", result)
                    const oldResult = JSON.parse(JSON.stringify(this.old_data))
                    const oldEntity = CurrentTransformerMapping.mapDtoToEntity(oldResult)
                    const entity = CurrentTransformerMapping.mapDtoToEntity(result)
                    console.log("entity: ", entity)
                    let rs = await window.electronAPI.insertCurrentTransformerEntity(oldEntity, entity)
                    console.log("rs: ", rs)
                    if (rs.success) {
                        return {
                            success: true,
                            data: rs.data,
                        };
                    } else {
                        this.$message.error("Error saving Current Transformer entity: " + rs.message);
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
                    error: error,
                };
            }
        },

        loadData(data) {
            // SỬA LỖI: Gán dữ liệu cũ vào đúng biến 'old_data'
            this.old_data = JSON.parse(JSON.stringify(data));
            this.currentTransformer = data;
            if (data.attachment && data.attachment.path) {
                this.attachmentData = JSON.parse(data.attachment.path)
            } else {
                this.attachmentData = []
            }
        },
        async saveCtrS() {
            const data = await this.saveAsset()
            if (data.success) {
                this.$message.success("Asset saved successfully")
            } else {
                this.$message.error("Failed to save asset")
            }
        },



        async checkCurrentTransformerData(data) {
            try {
                this.checkProperty(data)
                this.checkLifecycleDate(data)
                this.checkPsrId(data)
                this.checkProductAssetModel(data)
                this.checkAssetPrs(data)
                this.checkProductAssetModelId(data)
                this.checkAssetInfoId(data)
                this.checkAttachment(data)
                this.checkLocationId(data)
                this.checkCurrentTransformerTree(data)
                return data;
            }
            catch (error) {
                console.error("Error checking current transformer data:", error);
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

        async checkAssetPrs(data) {
            if (data.assetPsrId === null || data.assetPsrId === '') {
                data.assetPsrId = uuid.newUuid();
            }
        },

        checkProductAssetModelId(data) {
            if (data.productAssetModelId === null || data.productAssetModelId === '') {
                data.productAssetModelId = uuid.newUuid();
            }
        },

        checkAssetInfoId(data) {
            if (data.assetInfoId === null || data.assetInfoId === '') {
                data.assetInfoId = uuid.newUuid();
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
            }
        },

        checkLocationId(data) {
            if (data.locationId === null || data.locationId === '') {
                data.locationId = this.locationId;
            }
        },

        checkCurrentTransformerTree(data) {
            this.traverseAndFillMrid(data);
        },

        traverseAndFillMrid(obj) {
            if (Array.isArray(obj)) {
                obj.forEach(item => this.traverseAndFillMrid(item));
            } else if (obj !== null && typeof obj === "object") {
                // Nếu có thuộc tính mrid
                if ("mrid" in obj) {
                    if (!obj.mrid || obj.mrid === "") {
                        obj.mrid = uuid.newUuid();
                    }
                }
                // Duyệt tiếp các key con
                Object.values(obj).forEach(val => this.traverseAndFillMrid(val));
            }
            return obj;
        },

    }



}