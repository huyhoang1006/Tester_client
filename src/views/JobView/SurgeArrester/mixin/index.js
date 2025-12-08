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
            await this.checkDataMeasurement(data);
            this.checkProcedureAsset(data);
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
                const row_data = data.testList.find(t => t.testTypeId === item).data.row_data;
                const newPoolId = uuid.newUuid()
                const measurementProcedureList = []
                const measurement = []
                const [dataStringMeasurementSet, dataAnalogSet, dataDiscreteSet] = await Promise.all([
                    window.electronAPI.getAllStringMeasurementByProcedure(item),
                    window.electronAPI.getAllAnalogByProcedure(item),
                    window.electronAPI.getAllDiscreteByProcedure(item)
                ]);

                if (dataStringMeasurementSet.success) {
                    if (dataStringMeasurementSet.data.length > 0) {
                        for (const stringMeasurement of dataStringMeasurementSet.data) {
                            const measurementProcedure = new MeasurementProcedure();
                            measurementProcedure.mrid = stringMeasurement.measurement_procedure_mrid
                            measurementProcedure.procedure_id = item
                            measurementProcedure.measurement_id = stringMeasurement.mrid
                            measurementProcedureList.push(measurementProcedure)
                            const measure = {
                                mrid: stringMeasurement.mrid,
                                name: stringMeasurement.name,
                                type: 'string',
                                code: stringMeasurement.alias_name
                            }
                            measurement.push(measure)
                        }
                    }
                }

                if (dataAnalogSet.success) {
                    if (dataAnalogSet.data.length > 0) {
                        for (const analogMeasurement of dataAnalogSet.data) {
                            const measurementProcedure = new MeasurementProcedure();
                            measurementProcedure.mrid = analogMeasurement.measurement_procedure_mrid
                            measurementProcedure.procedure_id = item
                            measurementProcedure.measurement_id = analogMeasurement.mrid
                            measurementProcedureList.push(measurementProcedure)
                            const measure = {
                                mrid: analogMeasurement.mrid,
                                name: analogMeasurement.name,
                                type: 'analog',
                                code: analogMeasurement.alias_name
                            }
                            measurement.push(measure)
                        }
                    }
                }

                if (dataDiscreteSet.success) {
                    if (dataDiscreteSet.data.length > 0) {
                        for (const discreteMeasurement of dataDiscreteSet.data) {
                            const measurementProcedure = new MeasurementProcedure();
                            measurementProcedure.mrid = discreteMeasurement.measurement_procedure_mrid
                            measurementProcedure.procedure_id = item
                            measurementProcedure.measurement_id = discreteMeasurement.mrid
                            measurementProcedureList.push(measurementProcedure)
                            const measure = {
                                mrid: discreteMeasurement.mrid,
                                name: discreteMeasurement.name,
                                type: 'discrete',
                                code: discreteMeasurement.alias_name
                            }
                            newPoolId = discreteMeasurement.value_alias_set
                            measurement.push(measure)
                        }
                    }
                }

                const valueToAliastSet = []
                const dataValueToAlias = await window.electronAPI.getValueToAliasBySetId(newPoolId)
                if(dataValueToAlias.success && dataValueToAlias.data.length) {
                    valueToAliastSet = dataValueToAlias.data
                }

                for(const row of row_data) {
                    let existed = measurement.find(m => m.code === row.code);
                    if (!existed) {
                        const newMeasurementId = uuid.newUuid();
                        const newProcedureId = uuid.newUuid();

                        row.mrid = newMeasurementId

                        const mp = new MeasurementProcedure();
                        mp.mrid = newProcedureId;
                        if(row.type == 'discrete') {
                            row.pool.mrid = newPoolId
                            for(const discreteData of row.pool.valueToAlias) {
                                let matched = false;
                                for(const valueToAliasSetItem of valueToAliastSet) {
                                    if(discreteData.alias_name === valueToAliasSetItem.alias_name) {
                                        discreteData.mrid = valueToAliasSetItem.mrid
                                        matched = true;
                                        break;
                                    }
                                }

                                if(!matched) {
                                    discreteData.mrid = uuid.newUuid();
                                }
                            }
                        }
                        mp.procedure_id = item;
                        mp.measurement_id = newMeasurementId;
                        measurementProcedureList.push(mp);
                    } else {
                        if(row.type == 'discrete') {
                            for(const discreteData of row.pool.valueToAlias) {
                                let matched = false;
                                for(const valueToAliasSetItem of valueToAliastSet) {
                                    if(discreteData.alias_name === valueToAliasSetItem.alias_name) {
                                        discreteData.mrid = valueToAliasSetItem.mrid
                                        matched = true;
                                        break;
                                    }
                                }
                                if(!matched) {
                                    discreteData.mrid = uuid.newUuid();
                                }
                            }
                        } else {
                            row.mrid = existed.mrid;
                        }
                    }
                }

                for(const testList of data.testList) {
                    if(testList.testTypeId === item) {
                        if (testList.mrid === '' || testList.mrid === null || testList.mrid === this.$constant.ROOT) {
                            testList.mrid = uuid.newUuid();
                        }
                        if (testList.testCondition.mrid === '' || testList.testCondition.mrid === null) {
                            testList.testCondition.mrid = uuid.newUuid();
                        }

                        if (testList.testCondition.condition) {
                            if (testList.testCondition.condition.top_oil_temperature.mrid === null || testList.testCondition.condition.top_oil_temperature.mrid === '') {
                                testList.testCondition.condition.top_oil_temperature.mrid = uuid.newUuid();
                            }
                            if (testList.testCondition.condition.bottom_oil_temperature.mrid === null || testList.testCondition.condition.bottom_oil_temperature.mrid === '') {
                                testList.testCondition.condition.bottom_oil_temperature.mrid = uuid.newUuid();
                            }
                            if (testList.testCondition.condition.winding_temperature.mrid === null || testList.testCondition.condition.winding_temperature.mrid === '') {
                                testList.testCondition.condition.winding_temperature.mrid = uuid.newUuid();
                            }
                            if (testList.testCondition.condition.reference_temperature.mrid === null || testList.testCondition.condition.reference_temperature.mrid === '') {
                                testList.testCondition.condition.reference_temperature.mrid = uuid.newUuid();
                            }
                            if (testList.testCondition.condition.ambient_temperature.mrid === null || testList.testCondition.condition.ambient_temperature.mrid === '') {
                                testList.testCondition.condition.ambient_temperature.mrid = uuid.newUuid();
                            }
                            if (testList.testCondition.condition.humidity.mrid === null || testList.testCondition.condition.humidity.mrid === '') {
                                testList.testCondition.condition.humidity.mrid = uuid.newUuid();
                            }
                        }

                        if (testList.testCondition.attachment.id === null || testList.testCondition.attachment.id === '') {
                            if (testList.testCondition.attachmentData.length > 0) {
                                testList.testCondition.attachment.id = uuid.newUuid()
                                testList.testCondition.attachment.name = null
                                testList.testCondition.attachment.path = JSON.stringify(testList.testCondition.attachmentData)
                                testList.testCondition.attachment.type = 'test'
                                testList.testCondition.attachment.id_foreign = testList.mrid
                            }
                        }
                        testList.data.row_data = row_data;
                        testList.data.measurementProcedure = measurementProcedureList
                        if (testList.data.table && testList.data.table.length > 0) {
                            for (const data of testList.data.table) {
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
                }
            }
        },
    }
}
