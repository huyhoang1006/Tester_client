/* eslint-disable */
import VoltageTransformerDto from "@/views/Dto/VoltageTransformer"
import uuid from "@/utils/uuid";
import * as voltageTransformerMapping from "@/views/Mapping/VoltageTransformer/index"
import ValueWithUnit from "@/views/Cim/ValueWithUnit";

export default {
    data() {
        return {
            voltageTransformer: new VoltageTransformerDto(),
            old_data: new VoltageTransformerDto(),
            attachmentData: [],
        }
    },

    methods: {
        async saveAsset() {
            try {
                if (this.voltageTransformer.properties.serial_no !== null && this.voltageTransformer.properties.serial_no !== '') {
                    const data = JSON.parse(JSON.stringify(this.voltageTransformer))
                    const result = await this.checkVoltageTransformerData(data)
                    console.log('result: ', result)
                    const oldResult = JSON.parse(JSON.stringify(this.old_data))
                    const oldEntity = voltageTransformerMapping.mapDtoToEntity(oldResult)
                    const entity = voltageTransformerMapping.mapDtoToEntity(result)
                    console.log('entity: ', entity)
                    let rs = await window.electronAPI.insertVoltageTransformerEntity(oldEntity, entity)
                    if (rs.success) {
                        return {
                            success: true,
                            data: rs.data,
                        };
                    } else {
                        this.$message.error("Error saving voltage transformer entity: " + rs.message);
                        return {
                            success: false,
                            error: rs.error,
                        };
                    }
                } else {
                    console.log('Serial number is required')
                    this.$message.error("Serial number is required");
                    return {
                        success: false,
                    };
                }
            } catch (error) {
                console.log('Error saving voltage transformer entity:', error);
                this.$message.error("Error saving voltage transformer entity: " + error.message);
                return {
                    success: false,
                    error: error,
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

        loadData(data) {
            this.old_data = JSON.parse(JSON.stringify(data));
            const cloned = JSON.parse(JSON.stringify(data));
            if (cloned.vt_Configuration) {
                console.log('cloned.vt_Configuration: ', cloned.vt_Configuration)
            }
            this.voltageTransformer = cloned;
            if (data.attachment && data.attachment.path) {
                this.attachmentData = JSON.parse(data.attachment.path);
            } else {
                this.attachmentData = [];
            }
        },


        async resetForm() {
            this.voltageTransformer = new VoltageTransformerDto();
            this.attachmentData = [];
        },

        async checkVoltageTransformerData(data) {
            try {
                this.checkRatedFrequency(data)
                this.checkProperty(data);
                this.checkLifecycleDate(data);
                this.checkWindings(data)
                this.checkProductAssetModel(data);
                await this.checkAssetPrs(data);
                this.checkAttachment(data);
                this.checkLocationId(data);
                this.checkVoltageTransformerTree(data);
                this.checkPsrId(data);
                this.checkAssetInfoId(data);
                return data;
            } catch (error) {
                console.error("Error checking voltage transformer data:", error);
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

        checkVoltageTransformerTree(data) {
            this.traverseAndFillMrid(data);
        },


        checkWindings(data) {
            if (data.vt_Configuration.windings.mrid === null || data.vt_Configuration.windings.mrid === '') {
                data.vt_Configuration.windings.mrid = uuid.newUuid()
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
        },

        



        checkAssetInfoId(data) {
            if (data.assetInfoId === null || data.assetInfoId === '') {
                data.assetInfoId = uuid.newUuid()
            }
        },

        checkRatedFrequency(data) {
            if (data.ratings.rated_frequency.value === 'Custom') {
                data.ratings.rated_frequency.value = data.ratings.rated_frequency_custom
            }
        }



    }
}