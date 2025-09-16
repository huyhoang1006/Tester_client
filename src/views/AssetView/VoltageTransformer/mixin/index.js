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

        loadData(data) {
            this.old_data = JSON.parse(JSON.stringify(data));
            this.voltageTransformer = data;
            if(data.attachment && data.attachment.path) {
                this.attachmentData = JSON.parse(data.attachment.path)
            } else {
                this.attachmentData = []
            }
        },

        async resetForm() {
            this.voltageTransformer = new VoltageTransformerDto();
            this.attachmentData = [];
        },

        async checkVoltageTransformerData(data) {
            try {
                this.checkProperty(data);
                this.checkLifecycleDate(data);
                data.vt_Configuration = this.normalizeVTConfig(data.vt_Configuration)
                this.checkWindings(data)
                this.checkProductAssetModel(data);
                await this.checkAssetPrs(data);
                this.checkAttachment(data);
                this.checkLocationId(data);
                this.checkVoltageTransformerTree(data);
                this.checkPsrId(data);
                this.checkAssetInfoId(data)
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

        checkDataVT(data) {
            data.vt_Configuration.dataVT.forEach(item => {
                const table = item.table;

                // nếu table có mrid thì check
                if (table.mrid === null || table.mrid === '') {
                    table.mrid = uuid.newUuid();
                }

                // check từng ValueWithUnit
                this.checkValueWithUnit(table.rated_burden);
                this.checkValueWithUnit(table.rated_power_factor);
                this.checkValueWithUnit(table.usr_formula);
                this.checkValueWithUnit(table.usr_rated_voltage);
            })
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

        convertVTConfig(vtConfig) {
            if (!vtConfig || !vtConfig.dataVT) return null;

            return {
                windings: vtConfig.windings,
                dataVT: vtConfig.dataVT.map(item => {
                    const table = item.table || {};

                    return {
                        table: {
                            rated_burden: new ValueWithUnit(null, table.rated_burden || null, null, 'VA'),
                            rated_power_factor: new ValueWithUnit(null, table.cosphi || null, null, null),
                            usr_formula: new ValueWithUnit(null, table.usrRatio || null, null, null),
                            usr_rated_voltage: new ValueWithUnit(null, table.usr || null, null, 'V'),
                        }
                    }
                })
            };
        },

        checkValueWithUnit(field) {
            if (field) {
                if (!field.mrid || field.mrid === '') {
                    field.mrid = uuid.newUuid();
                }
                if (field.value === undefined) field.value = null;
                if (field.multiplier === undefined) field.multiplier = null;
                if (field.unit === undefined) field.unit = null;
            }
        },
        normalizeVTConfig(vtConfig) {
            if (!vtConfig || !vtConfig.dataVT) return null;

            return {
                windings: vtConfig.windings,
                dataVT: vtConfig.dataVT.map(item => {
                    const table = item.table || {};

                    const rated_burden = table.rated_burden instanceof ValueWithUnit
                        ? table.rated_burden
                        : new ValueWithUnit(uuid.newUuid(), table.rated_burden || null, null, 'VA');

                    const rated_power_factor = table.rated_power_factor instanceof ValueWithUnit
                        ? table.rated_power_factor
                        : new ValueWithUnit(uuid.newUuid(), table.cosphi || null, null, null);

                    const usr_formula = table.usr_formula instanceof ValueWithUnit
                        ? table.usr_formula
                        : new ValueWithUnit(uuid.newUuid(), table.usrRatio || null, null, null);

                    const usr_rated_voltage = table.usr_rated_voltage instanceof ValueWithUnit
                        ? table.usr_rated_voltage
                        : new ValueWithUnit(uuid.newUuid(), table.usr || null, null, 'V');

                    return {
                        table: {
                            mrid: table.mrid || uuid.newUuid(),
                            rated_burden,
                            rated_power_factor,
                            usr_formula,
                            usr_rated_voltage
                        }
                    }
                })
            };
        },
        
        checkAssetInfoId(data) {
            if(data.assetInfoId === null || data.assetInfoId === '') {
                data.assetInfoId = uuid.newUuid()
            }
        }

    }
}