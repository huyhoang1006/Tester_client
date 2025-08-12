import SurgeArresterDto from '@/views/Dto/SurgeAsset/index.js';
import uuid from '@/utils/uuid';
import * as Mapping from '@/views/Mapping/SurgeArrester/index.js';
/* eslint-disable */
export default {
    data() {
        return {
            attachmentData : [],
            surge_arrester_data: new SurgeArresterDto(),
            surge_arrester_data_old: new SurgeArresterDto(),
        }
    },
    methods : {
        async saveAsset() {
            try {
                if(this.surge_arrester_data.properties.serial_no !== null && this.surge_arrester_data.properties.serial_no !== '') {
                    const data = JSON.parse(JSON.stringify(this.surge_arrester_data));
                    const result = this.checkSurgeArresterData(data);
                    const oldResult = this.checkSurgeArresterData(this.surge_arrester_data_old);
                    const resultEntity = Mapping.mapDtoToEntity(result);
                    const oldResultEntity = Mapping.mapDtoToEntity(oldResult);
                    let rs = await window.electronAPI.insertSurgeArresterEntity(oldResultEntity, resultEntity)
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
            this.surge_arrester_data = new SurgeArresterDto();
            this.attachmentData = [];
        },

        loadData(data) {
            this.surge_arrester_data_old = JSON.parse(JSON.stringify(data));
            this.surge_arrester_data = data;
            if(data.attachment && data.attachment.path) {
                this.attachmentData = JSON.parse(data.attachment.path)
            } else {
                this.attachmentData = []
            }
        },

        checkSurgeArresterData(data) {
            try {
                this.checkProperty(data);
                this.checkLifecycleDate(data);
                this.checkPsrId(data);
                this.checkProductAssetModel(data);
                this.checkAssetPrs(data);
                this.checkTableRating(data);
                this.checkAttachment(data);
                return data;
            } catch (error) {
                console.error("Error checking surge arrester data:", error);
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
            if(this.parent.mrid !== null && this.parent.mrid !== '' && this.parent.mrid !== undefined) {
                data.psrId = this.parent.mrid
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
                    data.attachment.id_foreign = this.properties.mrid
                }
            } 
        },

        checkTableRating(data) {
            for(let i = 0; i < data.ratings.tableRating.length; i++) {
                if(data.ratings.tableRating[i].mrid === null || data.ratings.tableRating[i].mrid === '') {
                    data.ratings.tableRating[i].mrid = uuid.newUuid();
                }
                if(data.ratings.tableRating[i].continousVoltage.mrid === null || data.ratings.tableRating[i].continousVoltage.mrid === '') {
                    data.ratings.tableRating[i].continousVoltage.mrid = uuid.newUuid();
                }
                if(data.ratings.tableRating[i].isoVoltage.mrid === null || data.ratings.tableRating[i].isoVoltage.mrid === '') {
                    data.ratings.tableRating[i].isoVoltage.mrid = uuid.newUuid();
                }
                if(data.ratings.tableRating[i].maximumVoltage.mrid === null || data.ratings.tableRating[i].maximumVoltage.mrid === '') {
                    data.ratings.tableRating[i].maximumVoltage.mrid = uuid.newUuid();
                }
                if(data.ratings.tableRating[i].polesVoltage.mrid === null || data.ratings.tableRating[i].polesVoltage.mrid === '') {
                    data.ratings.tableRating[i].polesVoltage.mrid = uuid.newUuid();
                }
                if(data.ratings.tableRating[i].ratedCircuit.mrid === null || data.ratings.tableRating[i].ratedCircuit.mrid === '') {
                    data.ratings.tableRating[i].ratedCircuit.mrid = uuid.newUuid();
                }
                if(data.ratings.tableRating[i].ratedVoltage.mrid === null || data.ratings.tableRating[i].ratedVoltage.mrid === '') {
                    data.ratings.tableRating[i].ratedVoltage.mrid = uuid.newUuid();
                }
                if(data.ratings.tableRating[i].shortCurrent.mrid === null || data.ratings.tableRating[i].shortCurrent.mrid === '') {
                    data.ratings.tableRating[i].shortCurrent.mrid = uuid.newUuid();
                }
            }
        }
    }
}