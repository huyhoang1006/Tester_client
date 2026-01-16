/* eslint-disable */
import uuid from "@/utils/uuid";
import * as surgeArresterJobMapping from "@/views/Mapping/SurgerArresterJob/index"
import SurgeArresterJobDto from "@/views/Dto/Job/SurgeArrester/index";
import mixins from '../components/SelectTest/mixin'

export default {
    mixins: [mixins],
    data() {
        return {
            surgeArresterJobDto: new SurgeArresterJobDto(),
            surgeArresterJobDtoOld: new SurgeArresterJobDto()
        }
    },
    methods: {
        async saveJob() {
            try {
                if (!this.surgeArresterJobDto.properties.name || this.surgeArresterJobDto.properties.name === '') {
                    this.$message.error('Name is required');
                } else {
                    const dto = JSON.parse(JSON.stringify(this.surgeArresterJobDto));
                    const resultDto = await this.checkJob(dto);
                    const entity = surgeArresterJobMapping.jobDtoToEntity(resultDto);
                    const old_entity = surgeArresterJobMapping.jobDtoToEntity(this.surgeArresterJobDtoOld);
                    // const rs = await window.electronAPI.insertSurgeArresterJob(old_entity, entity)
                    const rs = {
                        success: false
                    }
                    if (rs.success) {
                        return {
                            success: true,
                            data: rs.data,
                            message: 'Job saved successfully'
                        }
                    } else {
                        return {
                            success: false,
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
            for (const test of data.testList) {
                if (test.data.row_data.length == 0) {
                    const initTest = await this.initTest(test.testTypeCode, this.assetData);
                    test.data.row_data = initTest.row_data;
                }
            }
            this.surgeArresterJobDto = data
            this.surgeArresterJobDtoOld = JSON.parse(JSON.stringify(data));
        },

        async checkJob(data) {
            this.checkProperties(data);
            this.checkAssetId(data);
            this.checkAttachment(data);
            this.checkTestingEquipment(data);
            await this.checkDataMeasurement(data);
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
            if (data.attachmentId === null || data.attachmentId === '') {
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
            const arr = [];
            for (const item of data.testingEquipmentData) {
                if (item.mrid === '' || item.mrid === null || item.mrid === this.$constant.ROOT) {
                    item.mrid = uuid.newUuid();
                    item.work_id = data.properties.mrid;
                }
                for (const test_type_id of item.test_type_surge_arrester_id) {
                    arr.push({
                        mrid: uuid.newUuid(),
                        testing_equipment_id: item.mrid,
                        test_type_id: test_type_id
                    });
                }
            }

            // Thêm các phần tử mới vào data.surgeArresterTestingEquipmentTestType nếu chưa có
            for (const current of arr) {
                const existed = data.surgeArresterTestingEquipmentTestType.some(
                    old =>
                        old.testing_equipment_id === current.testing_equipment_id &&
                        old.test_type_id === current.test_type_id
                );
                if (!existed) {
                    data.surgeArresterTestingEquipmentTestType.push(current);
                }
            }

            // Xóa các phần tử quá khứ không còn trong hiện tại
            data.surgeArresterTestingEquipmentTestType = data.surgeArresterTestingEquipmentTestType.filter(
                old => arr.some(
                    current =>
                        old.testing_equipment_id === current.testing_equipment_id &&
                        old.test_type_id === current.test_type_id
                )
            );
        },

        async checkDataMeasurement(data) {
            console.log('checkDataMeasurement data', data)
        },
    }
}
