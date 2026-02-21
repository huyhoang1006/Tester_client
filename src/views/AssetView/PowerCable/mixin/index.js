/* eslint-disable */
import PowerCableDto from "@/views/Dto/PowerCable"
import * as powerCableMapping from "@/views/Mapping/PowerCable/index"
import uuid from "@/utils/uuid";
export default {
    data() {
        return {
            powerCable: new PowerCableDto(),
            powerCableOld: new PowerCableDto(),
            attachmentData: [],
        }
    },
    methods: {
        async saveAsset() {
            try {
                if (this.powerCable.properties.serial_no !== null && this.powerCable.properties.serial_no !== '') {
                    const data = JSON.parse(JSON.stringify(this.powerCable));
                    const result = await this.checkPowerCableData(data);
                    const resultEntity = powerCableMapping.mapDtoToEntity(result);
                    console.log(resultEntity)
                    const oldResultEntity = powerCableMapping.mapDtoToEntity(this.powerCableOld);
                    let rs = await window.electronAPI.insertPowerCableEntity(oldResultEntity, resultEntity)
                    if (rs.success) {

                        return {
                            success: true,
                            data: rs.data,
                        };
                    } else {
                        this.$message.error("Error saving Power Cable entity: " + rs.message);
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
            if (data.success) {
                this.$message.success("Asset saved successfully")
            } else {
                this.$message.error("Failed to save asset")
            }
        },

        resetForm() {
            this.powerCable = new PowerCableDto();
            this.attachmentData = [];
        },

        loadData(data) {
            this.powerCableOld = JSON.parse(JSON.stringify(data));
            this.powerCable = data;
            if (data.attachment && data.attachment.path) {
                this.attachmentData = JSON.parse(data.attachment.path)
            } else {
                this.attachmentData = []
            }
        },

        async checkPowerCableData(data) {
            try {
                this.checkProperty(data);
                this.checkLifecycleDate(data);
                this.checkPsrId(data);
                this.checkProductAssetModel(data);
                await this.checkAssetPrs(data);
                this.checkAttachment(data);
                this.checkLocationId(data);
                this.checkPowerCableTree(data);
                this.checkAssetInfoId(data)
                this.checkOldCableInfoId(data)
                return data;
            } catch (error) {
                console.error("Error checking power cable data:", error);
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

        checkPowerCableTree(data) {
            this.traverseAndFillMrid(data);
        },

        checkAssetInfoId(data) {
            if (data.assetInfoId === null || data.assetInfoId === '') {
                data.assetInfoId = uuid.newUuid()
            }
        },

        checkOldCableInfoId(data) {
            if (data.oldCableInfoId === null || data.oldCableInfoId === '') {
                data.oldCableInfoId = uuid.newUuid()
            }
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
        }

    }

}