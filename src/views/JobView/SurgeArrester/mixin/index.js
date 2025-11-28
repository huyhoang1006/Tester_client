/* eslint-disable */
import uuid from "@/utils/uuid";
import * as surgeArresterJobMapping from "@/views/Mapping/SurgerArresterJob/index"
import SurgeArresterJobDto from "@/views/Dto/Job/SurgeArrester/index";
import mixins from '../components/SelectTest/mixin'
import MeasurementProcedure from "@/views/Cim/MeasurementProcedure";

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
                    console.log('DTO to save:', resultDto);
                    console.log('Entity to save:', entity);
                    const old_entity = surgeArresterJobMapping.jobDtoToEntity(this.surgeArresterJobDtoOld);
                    // const rs = await window.electronAPI.insertSurgeArresterJob(old_entity, entity)
                    const rs = {
                        success: false,
                        data: entity,
                        message: 'Job saved fail'
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
            this.checkTestTypeList(data);
            this.checkDataMeasurement(data);
            this.checkProcedureAsset(data);
            await this.checkTestList(data);
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

        checkTestTypeList(data) {
            const ids = data.testTypeList.map(item => item.mrid)
            for(const item of this.testTypeListData) {
                if(!ids.includes(item.mrid)) {
                    data.testTypeList.push(item);
                }
            }
        },

        checkProcedureAsset(data) {
            const testTypeListIds = data.testTypeList.map(item => item.mrid);
            const procedureAssetIds = data.procedureAsset.map(item => item.procedure_id);

            // 1. Những ID cần thêm
            const missingInProcedureAsset = testTypeListIds.filter(id => !procedureAssetIds.includes(id));

            // 2. Những ID cần xóa
            const missingInTestTypeList = procedureAssetIds.filter(id => !testTypeListIds.includes(id));

            // 3. THÊM các item còn thiếu
            const newItems = missingInProcedureAsset.map(id => ({
                mrid: uuid.newUuid(),
                procedure_id: id,
                asset_id: this.assetData.mrid
            }));

            // 4. LOẠI BỎ các item dư
            const filtered = data.procedureAsset.filter(
                item => !missingInTestTypeList.includes(item.procedure_id)
            );

            // 5. Gộp lại (cũ hợp lệ + mới)
            data.procedureAsset = [...filtered, ...newItems];
        },

        async checkDataMeasurement(data) {
            const testTypeListIds = [...new Set(data.testList.map(item => item.testTypeId))];
            for(const item of testTypeListIds) {
                const dataStringMeasurementSet = await window.electronAPI.getAllStringMeasurementByProcedure(item)
                if (dataStringMeasurementSet.success) {
                    console.log(dataStringMeasurementSet.data)
                }
            }
        },

        async checkTestList(data) {
            for (const item of data.testList) {
                if (item.mrid === '' || item.mrid === null || item.mrid === this.$constant.ROOT) {
                    item.mrid = uuid.newUuid();
                }
                if (item.testCondition.mrid === '' || item.testCondition.mrid === null) {
                    item.testCondition.mrid = uuid.newUuid();
                }

                if (item.testCondition.condition) {
                    if (item.testCondition.condition.top_oil_temperature.mrid === null || item.testCondition.condition.top_oil_temperature.mrid === '') {
                        item.testCondition.condition.top_oil_temperature.mrid = uuid.newUuid();
                    }
                    if (item.testCondition.condition.bottom_oil_temperature.mrid === null || item.testCondition.condition.bottom_oil_temperature.mrid === '') {
                        item.testCondition.condition.bottom_oil_temperature.mrid = uuid.newUuid();
                    }
                    if (item.testCondition.condition.winding_temperature.mrid === null || item.testCondition.condition.winding_temperature.mrid === '') {
                        item.testCondition.condition.winding_temperature.mrid = uuid.newUuid();
                    }
                    if (item.testCondition.condition.reference_temperature.mrid === null || item.testCondition.condition.reference_temperature.mrid === '') {
                        item.testCondition.condition.reference_temperature.mrid = uuid.newUuid();
                    }
                    if (item.testCondition.condition.ambient_temperature.mrid === null || item.testCondition.condition.ambient_temperature.mrid === '') {
                        item.testCondition.condition.ambient_temperature.mrid = uuid.newUuid();
                    }
                    if (item.testCondition.condition.humidity.mrid === null || item.testCondition.condition.humidity.mrid === '') {
                        item.testCondition.condition.humidity.mrid = uuid.newUuid();
                    }
                }

                if (item.testCondition.attachment.id === null || item.testCondition.attachment.id === '') {
                    if (item.testCondition.attachmentData.length > 0) {
                        item.testCondition.attachment.id = uuid.newUuid()
                        item.testCondition.attachment.name = null
                        item.testCondition.attachment.path = JSON.stringify(item.testCondition.attachmentData)
                        item.testCondition.attachment.type = 'test'
                        item.testCondition.attachment.id_foreign = item.mrid
                    }
                }

                const dataStringMeasurement = item.data.row_data.filter(i => i.type === 'string')
                const dataStringMeasurementSet = await window.electronAPI.getAllStringMeasurementByProcedure(item.testTypeId)
                if (dataStringMeasurementSet.success) {
                    for (const stringMeasurement of dataStringMeasurement) {
                        let matched = false;
                        for (const data of dataStringMeasurementSet.data) {
                            if (stringMeasurement.code === data.alias_name) {
                                stringMeasurement.mrid = data.mrid;
                                matched = true;
                                break;
                            }
                        }
                        if (!matched) {
                            stringMeasurement.mrid = uuid.newUuid();
                            const measurementProcedure = new MeasurementProcedure();
                            measurementProcedure.mrid = uuid.newUuid();
                            measurementProcedure.procedure_id = item.testTypeId;
                            measurementProcedure.measurement_id = stringMeasurement.mrid;
                            item.data.measurementProcedure.push(measurementProcedure);
                        }
                    }
                } else {
                    if (dataStringMeasurementSet.data && dataStringMeasurementSet.data.length == 0) {
                        for (const stringMeasurement of dataStringMeasurement) {
                            stringMeasurement.mrid = uuid.newUuid();
                            const measurementProcedure = new MeasurementProcedure();
                            measurementProcedure.mrid = uuid.newUuid();
                            measurementProcedure.procedure_id = item.testTypeId;
                            measurementProcedure.measurement_id = stringMeasurement.mrid;
                            item.data.measurementProcedure.push(measurementProcedure);
                        }
                    }
                }

                const dataAnalog = item.data.row_data.filter(i => i.type === 'analog')
                const dataAnalogSet = await window.electronAPI.getAllAnalogByProcedure(item.testTypeId);
                if (dataAnalogSet.success) {
                    for (const analog of dataAnalog) {
                        let matched = false;
                        for (const data of dataAnalogSet.data) {
                            if (analog.code === data.alias_name) {
                                analog.mrid = data.mrid;
                                matched = true;
                                break;
                            }
                        }
                        if (!matched) {
                            analog.mrid = uuid.newUuid();
                            const measurementProcedure = new MeasurementProcedure();
                            measurementProcedure.mrid = uuid.newUuid();
                            measurementProcedure.procedure_id = item.testTypeId;
                            measurementProcedure.measurement_id = analog.mrid;
                            item.data.measurementProcedure.push(measurementProcedure);
                        }
                    }
                } else {
                    if (dataAnalogSet.data && dataAnalogSet.data.length == 0) {
                        for (const analog of dataAnalog) {
                            analog.mrid = uuid.newUuid();
                            const measurementProcedure = new MeasurementProcedure();
                            measurementProcedure.mrid = uuid.newUuid();
                            measurementProcedure.procedure_id = item.testTypeId;
                            measurementProcedure.measurement_id = analog.mrid;
                            item.data.measurementProcedure.push(measurementProcedure);
                        }
                    }
                }

                const dataDiscrete = item.data.row_data.filter(i => i.type === 'discrete');
                //lấy tất cả discrete của procedure
                const dataDiscreteSet = await window.electronAPI.getAllDiscreteByProcedure(item.testTypeId);
                //nếu thành công
                if (dataDiscreteSet.success) {
                    //vòng lặp for để duyệt từng discrete trong dataDiscrete
                    // để kiểm tra xem dataDiscreteSet và dataDiscrete có trùng nhau không
                    for (const discrete of dataDiscrete) {
                        let matched = false;
                        for (const data of dataDiscreteSet.data) {
                            //những discrete có code trùng với alias_name trong dataDiscreteSet
                            if (discrete.code === data.alias_name) {
                                discrete.mrid = data.mrid;
                                matched = true;
                                //nếu trùng thì lấy kiểm tra xem value_alias_set đã tồn tại hay chưa
                                if (data.value_alias_set === null || data.value_alias_set === '') {
                                    discrete.pool.mrid = uuid.newUuid();
                                    for (const item of discrete.pool.valueToAlias) {
                                        item.mrid = uuid.newUuid();
                                    }
                                } else {
                                    discrete.pool.mrid = data.value_alias_set
                                    const dataDiscreteSetAndAlias = await window.electronAPI.getValueAliasSetAndValueToAliasByMrid(discrete.pool.mrid);
                                    if (dataDiscreteSetAndAlias.success) {
                                        for (const item of discrete.pool.valueToAlias) {
                                            let matchedAlias = false;
                                            for (const old of dataDiscreteSetAndAlias.data.value_to_aliases) {
                                                if (item.alias_name === old.alias_name) {
                                                    item.mrid = old.mrid;
                                                    matchedAlias = true;
                                                    break;
                                                }
                                            }
                                            if (!matchedAlias) {
                                                item.mrid = uuid.newUuid();
                                            }
                                        }
                                    } else {
                                        for (const item of discrete.pool.valueToAlias) {
                                            item.mrid = uuid.newUuid();
                                        }
                                    }

                                }
                                break;
                            }
                        }
                        if (!matched) {
                            discrete.mrid = uuid.newUuid();
                            const measurementProcedure = new MeasurementProcedure();
                            measurementProcedure.mrid = uuid.newUuid();
                            measurementProcedure.procedure_id = item.testTypeId;
                            measurementProcedure.measurement_id = discrete.mrid;
                            item.data.measurementProcedure.push(measurementProcedure);
                            discrete.pool.mrid = uuid.newUuid();
                            for (const item of discrete.pool.valueToAlias) {
                                item.mrid = uuid.newUuid();
                            }
                        }
                    }
                } else {
                    if (dataDiscreteSet.data && dataDiscreteSet.data.length == 0) {
                        for (const discrete of dataDiscrete) {
                            discrete.mrid = uuid.newUuid();
                            const measurementProcedure = new MeasurementProcedure();
                            measurementProcedure.mrid = uuid.newUuid();
                            measurementProcedure.procedure_id = item.testTypeId;
                            measurementProcedure.measurement_id = discrete.mrid;
                            item.data.measurementProcedure.push(measurementProcedure);
                            discrete.pool.mrid = uuid.newUuid();
                            for (const item of discrete.pool.valueToAlias) {
                                item.mrid = uuid.newUuid();
                            }
                        }
                    }
                }
                if (item.data.table && item.data.table.length > 0) {
                    for (const data of item.data.table) {
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
