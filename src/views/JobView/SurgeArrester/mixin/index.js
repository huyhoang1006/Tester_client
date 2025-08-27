/* eslint-disable */
import uuid from "@/utils/uuid";
import * as surgeArresterJobMapping from "@/views/Mapping/SurgerArresterJob/index"
import SurgeArresterJobDto from "@/views/Dto/Job/SurgeArrester/index";
export default {
    data() {
        return {
            surgeArresterJobDto: new SurgeArresterJobDto(),
            surgeArresterJobDtoOld: new SurgeArresterJobDto()
        }
    },
    methods: {
        async saveJob() {
            try {
                if(!this.surgeArresterJobDto.properties.name || this.surgeArresterJobDto.properties.name === '') {
                    this.$message.error('Name is required');
                } else {
                    const dto = JSON.parse(JSON.stringify(this.surgeArresterJobDto));
                    const resultDto = this.checkJob(dto);
                    const entity = surgeArresterJobMapping.jobDtoToEntity(resultDto);
                    const old_entity = surgeArresterJobMapping.jobDtoToEntity(this.surgeArresterJobDtoOld);
                    const rs = await window.electronAPI.insertSurgeArresterJob(old_entity, entity)
                    if (rs.success) {
                        return {
                            success: true,
                            data: rs.data,
                            message: 'Job saved successfully'
                        }
                    } else {
                        return {
                            success: false,
                            data: rs.data,
                            message: 'Failed to save job'
                        }
                    }
                }
            } catch (error) {
                console.error('Error saving job:', error);
                return {
                    success: false,
                    data: null,
                    message: 'Failed to save job'
                }
            }
        },

        async saveCtrS() {
            const result = await this.saveJob()
            if (result.success) {
                const dto = surgeArresterJobMapping.JobEntityToDto(result.data);
                this.loadData(dto);
                this.$message.success(result.message);
            } else {
                this.$message.error(result.message);
            }
        },

        async resetForm() {
            this.surgeArresterJobDto = new SurgeArresterJobDto();
        },

        async loadData(data) {
            //properties
            this.surgeArresterJobDto = data
            this.surgeArresterJobDtoOld = JSON.parse(JSON.stringify(data));
        },

        checkJob(data) {
            this.checkProperties(data);
            this.checkAssetId(data);
            this.checkAttachment(data);
            this.checkTestingEquipment(data);
            this.checkTestList(data);
            return data;
        },
        checkProperties(data) {
            if (data.properties.mrid === '' || data.properties.mrid === null) {
                data.properties.mrid = uuid.newUuid();
            }
        },

        checkAssetId(data) {
            if (data.properties.asset_id === '' || data.properties.asset_id === null) {
                data.properties.asset_id = this.assetData.mrid;
            }
        },

        checkAttachment(data) {
            if(data.attachmentId === null || data.attachmentId === '') {
                if (data.attachmentData.length > 0) {
                    data.attachmentId = uuid.newUuid()
                    data.attachment.id = data.attachmentId
                    data.attachment.name = null
                    data.attachment.path = JSON.stringify(data.attachmentData)
                    data.attachment.type = 'job'
                    data.attachment.id_foreign = data.properties.mrid
                }
            } 
        },

        checkTestingEquipment(data) {
            for(const item of data.testingEquipmentData) {
                if (item.mrid === '' || item.mrid === null) {
                    item.mrid = uuid.newUuid();
                }
                if (item.work_id === '' || item.work_id === null) {
                    item.work_id = data.properties.mrid;
                }
            }
        },

        checkTestList(data) {
            for(const item of data.testList) {
                if (item.mrid === '' || item.mrid === null || item.mrid === this.$constant.ROOT) {
                    item.mrid = uuid.newUuid();
                }
                if (item.testCondition.mrid === '' || item.testCondition.mrid === null) {
                    item.testCondition.mrid = uuid.newUuid();
                }

                if(item.testCondition.observationId === '' || item.testCondition.observationId === null) {
                    item.testCondition.observationId = uuid.newUuid();
                }

                if(item.testCondition.condition) {
                    if(item.testCondition.condition.top_oil_temperature.mrid === null || item.testCondition.condition.top_oil_temperature.mrid === '') {
                        item.testCondition.condition.top_oil_temperature.mrid = uuid.newUuid();
                    }
                    if(item.testCondition.condition.bottom_oil_temperature.mrid === null || item.testCondition.condition.bottom_oil_temperature.mrid === '') {
                        item.testCondition.condition.bottom_oil_temperature.mrid = uuid.newUuid();
                    }
                    if(item.testCondition.condition.winding_temperature.mrid === null || item.testCondition.condition.winding_temperature.mrid === '') {
                        item.testCondition.condition.winding_temperature.mrid = uuid.newUuid();
                    }
                    if(item.testCondition.condition.reference_temperature.mrid === null || item.testCondition.condition.reference_temperature.mrid === '') {
                        item.testCondition.condition.reference_temperature.mrid = uuid.newUuid();
                    }
                    if(item.testCondition.condition.ambient_temperature.mrid === null || item.testCondition.condition.ambient_temperature.mrid === '') {
                        item.testCondition.condition.ambient_temperature.mrid = uuid.newUuid();
                    }
                    if(item.testCondition.condition.humidity.mrid === null || item.testCondition.condition.humidity.mrid === '') {
                        item.testCondition.condition.humidity.mrid = uuid.newUuid();
                    }
                }

                if(item.testCondition.attachment.id === null || item.testCondition.attachment.id === '') {
                    if (item.testCondition.attachmentData.length > 0) {
                        item.testCondition.attachment.id = uuid.newUuid()
                        item.testCondition.attachment.name = null
                        item.testCondition.attachment.path = JSON.stringify(item.testCondition.attachmentData)
                        item.testCondition.attachment.type = 'test'
                        item.testCondition.attachment.id_foreign = item.mrid
                    }
                }
                
                if(item.data.table && item.data.table.length > 0) {
                    for(const data of item.data.table) {
                        if (data.mrid === '' || data.mrid === null || data.mrid === this.$constant.ROOT) {
                            data.mrid = uuid.newUuid();
                        }

                        for (const [key, value] of Object.entries(data)) {
                            if (value && typeof value === 'object') {
                                if (value.mrid === '' || value.mrid === null) {
                                    value.mrid = uuid.newUuid();
                                }
                            }
                        }
                    }
                }
                        
            }
        },
    }
}
