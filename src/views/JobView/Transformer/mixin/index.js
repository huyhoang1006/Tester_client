// import { mapState } from 'vuex'
import TransformerJobDto from '@/views/Dto/Job/CurrentTransformer/index'
import mixins from '../components/SelectTest/mixin'
import * as transformerJobMapping from "@/views/Mapping/TransformerJob/index"
import MeasurementProcedure from "@/views/Cim/MeasurementProcedure";
import uuid from "@/utils/uuid";
export default {
    mixins: [mixins],
    data() {
        return {
            transformerJobDto: new TransformerJobDto(),
            transformerJobDtoOld: new TransformerJobDto(),
            asset: {},
            location: {},
            tapChangers: {},
            bushing: {}
        }
    },
    // computed: {
    //     ...mapState(['selectedAsset', 'selectedJob']),
    // },
    // async beforeMount() {
    //     // Try to get location and asset data
    //     // getLocationAsset will handle validation internally
    //     await this.getLocationAsset()
    //     this.mode = this.$route.query.mode
    //     if (this.mode === this.$constant.EDIT || this.mode === this.$constant.DUP) {
    //         this.job_id = this.$route.query.job_id
    //         const rs = await window.electronAPI.getJobById(this.job_id)
    //         if (rs.success) {
    //             const data = rs.data
    //             const { job, testList } = data
    //             if (this.mode === this.$constant.DUP) {
    //                 job.id = ''
    //                 job.name = ''
    //             }
    //             this.transformerJobDto.properties = job
    //             for (let element in testList) {
    //                 element = testList[element]
    //                 element.data = JSON.parse(element.data)
    //                 let condition = await window.electronAPI.getTestingCondition(element.id)
    //                 let attachment = await window.electronAPI.getAllAttachment(element.id, "test")
    //                 if (condition.data.length === 0) {
    //                     this.testconditionArr.push({
    //                         condition: {
    //                             top_oil_temperature: "",
    //                             bottom_oil_temperature: "",
    //                             winding_temperature: "",
    //                             reference_temperature: "",
    //                             ambient_temperature: "",
    //                             humidity: "",
    //                             weather: ""
    //                         },
    //                         equipment: [{
    //                             model: "",
    //                             serial_no: "",
    //                             calibration_date: ""

    //                         }],
    //                         comment: "",
    //                     })
    //                 }
    //                 else {
    //                     condition.data.forEach(async (e) => {
    //                         e.condition = await JSON.parse(e.condition)
    //                         e.equipment = await JSON.parse(e.equipment)
    //                         if (this.mode == this.$constant.DUP) {
    //                             e.id = this.$uuid.EMPTY
    //                         }
    //                         this.testconditionArr.push(e)
    //                     });
    //                 }
    //                 if (attachment.data.length === 0) {
    //                     this.attachmentArr.push([])
    //                 }
    //                 else {
    //                     attachment.data.forEach(async (e) => {
    //                         e.name = await JSON.parse(e.name)
    //                         if (this.mode == this.$constant.DUP) {
    //                             e.id = this.$uuid.EMPTY
    //                         }
    //                         this.attachmentArr.push(e.name)
    //                     })
    //                 }
    //                 if (this.mode == this.$constant.DUP) {
    //                     element.id = this.$uuid.EMPTY
    //                 }
    //             }
    //             this.transformerJobDto.testList = testList
    //             let list_length = testList.length
    //             const testList_temp = JSON.parse(JSON.stringify(testList));
    //             const testList_var = JSON.parse(JSON.stringify(testList));
    //             let list_temp = []
    //             for (let i = 0; i < list_length; i++) {
    //                 if (['BushingPrimC1', 'BushingPrimC2', 'WindingDfCap'].includes(testList[i].testTypeCode)) {
    //                     let name = testList[i].name
    //                     testList_var[i].name = name + " (C)"
    //                     testList_temp[i].name = name + " (DF)"
    //                     list_temp.push(testList_var[i])
    //                     list_temp.push(testList_temp[i])
    //                 }
    //                 else {
    //                     list_temp.push(testList[i])
    //                 }
    //             }
    //             this.listHeal = list_temp
    //         } else {
    //             this.$message.error(rs.message)
    //         }
    //     }

    // },
    methods: {
        async saveJob() {
            try {
                if (!this.transformerJobDto.properties.name || this.transformerJobDto.properties.name === '') {
                    this.$message.error('Name is required');
                } else {
                    const dto = JSON.parse(JSON.stringify(this.transformerJobDto));
                    const resultDto = await this.checkJob(dto);
                    const entity = transformerJobMapping.jobDtoToEntity(resultDto);
                    console.log('Entity to save:', entity);
                    const old_entity = transformerJobMapping.jobDtoToEntity(this.transformerJobDtoOld);
                    const rs = await window.electronAPI.insertTransformerJob(old_entity, entity)
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
                const dto = transformerJobMapping.JobEntityToDto(result.data);
                this.loadData(dto);
                this.$message.success(result.message);
            } else {
                this.$message.error(result.message);
            }
        },

        async resetForm() {
            this.transformerJobDto = new TransformerJobDto();
        },

        async loadData(data) {
            for (const test of data.testList) {
                if (test.data.row_data.length == 0) {
                    const initTest = await this.initTest(test.testTypeCode, this.assetData);
                    test.data.row_data = initTest.row_data;
                }
            }
            this.transformerJobDto = data
            this.transformerJobDtoOld = JSON.parse(JSON.stringify(data));
        },

        async checkJob(data) {
            this.checkProperties(data);
            this.checkAssetId(data);
            this.checkAttachment(data);
            this.checkTestingEquipment(data);
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
                for (const test_type_id of item.test_type_current_transformer_id) {
                    arr.push({
                        mrid: uuid.newUuid(),
                        testing_equipment_id: item.mrid,
                        test_type_id: test_type_id
                    });
                }
            }

            // Thêm các phần tử mới vào data.surgeArresterTestingEquipmentTestType nếu chưa có
            for (const current of arr) {
                const existed = data.currentTransformerTestingEquipmentTestType.some(
                    old =>
                        old.testing_equipment_id === current.testing_equipment_id &&
                        old.test_type_id === current.test_type_id
                );
                if (!existed) {
                    data.surgeArresterTestingEquipmentTestType.push(current);
                }
            }

            // Xóa các phần tử quá khứ không còn trong hiện tại
            data.currentTransformerTestingEquipmentTestType = data.currentTransformerTestingEquipmentTestType.filter(
                old => arr.some(
                    current =>
                        old.testing_equipment_id === current.testing_equipment_id &&
                        old.test_type_id === current.test_type_id
                )
            );
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

                        for (const [value] of Object.entries(data)) {
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
