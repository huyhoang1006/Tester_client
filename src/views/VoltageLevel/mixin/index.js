/* eslint-disable */
import { UnitMultiplier } from "@/views/Enum/UnitMultiplier"
import { UnitSymbol } from "@/views/Enum/UnitSymbol"
import VoltageLevelDto from "@/views/Dto/VoltageLevel/index.js"
import * as voltageMapper from "@/views/Mapping/VoltageLevel/index.js"
import uuid from "@/utils/uuid"

export default {
    data() {
        return {
            properties: new VoltageLevelDto(),
            labelWidth: `150px`,
            voltageList : ['500', '220', '110', '35', '26', '22', '21', '15.75', '13.8', '10', '6.6', '0.4'],
            voltageUnitArr : [UnitSymbol.V],
            voltageMultiplierArr : [UnitMultiplier.k, UnitMultiplier.m, '']
        }
    },
    methods: {
        async saveCtrS() {
            const data = await this.saveVoltageLevel()
            if(data.success) {
                this.$message.success("Voltage Level saved successfully")
            } else {
                this.$message.error("Failed to save Voltage Level")
            }
        },

        resetForm() {
            this.properties = new VoltageLevelDto()
        },

        loadData(data) {
            this.properties = data
        },

        loadMapForView () {
        },

        async saveVoltageLevel() {
            try {
                if(isNaN(this.properties.low_voltage_limit_value) || isNaN(this.properties.high_voltage_limit_value) || isNaN(this.properties.base_voltage_value)) {
                    this.$message.error("Voltage values must be numeric.");
                }
                else {
                    let data = JSON.parse(JSON.stringify(this.properties));
                    const result = this.checkVoltageLevel(data);
                    const resultEntity = voltageMapper.volDtoToVolEntity(result);
                    const resultData = await window.electronAPI.insertVoltageLevelEntity(resultEntity)
                    if(resultData.success) {
                        return {
                            success: true,
                            data: resultData.data
                        }
                    } else {
                        this.$message.error("Failed to save voltage level.");
                        return {
                            success: false
                        }
                    }
                }
            } catch (error) {
                this.$message.error("An error occurred while saving the voltage level: " + error.message);
            }
        },

        checkBaseVoltage(data) {
            if(data.baseVoltageId === null || data.baseVoltageId === '') {
                if(data.base_voltage_value) {
                    data.baseVoltageId = uuid.newUuid();
                }
            }
        },

        checkNominalVoltage(data) {
            if(data.nominalVoltageId === null || data.nominalVoltageId === '') {
                if(data.base_voltage_value) {
                    data.nominalVoltageId = uuid.newUuid();
                }
            }
        },

        checkVoltageLevel(data) {
            if(data.voltageLevelId === null || data.voltageLevelId === '') {
                data.voltageLevelId = uuid.newUuid();
            }
            if(data.substationId === null || data.substationId === '') {
                data.substationId = this.parent ? this.parent.mrid : null
            }
            if(data.locationId === null || data.locationId === '') {
                data.locationId = this.locationId ? this.locationId : null
            }
            
            this.checkBaseVoltage(data);
            this.checkNominalVoltage(data);
            this.checkHighVoltageLimit(data);
            this.checkLowVoltageLimit(data);
            return data;
        },

        checkHighVoltageLimit(data) {
            if(data.highVoltageLimitId === null || data.highVoltageLimitId === '') {
                if(data.high_voltage_limit_value) {
                    data.highVoltageLimitId = uuid.newUuid();
                }
            }
        },

        checkLowVoltageLimit(data) {
            if(data.lowVoltageLimitId === null || data.lowVoltageLimitId === '') {
                if(data.low_voltage_limit_value) {
                    data.lowVoltageLimitId = uuid.newUuid();
                }
            }
        },

        handleBaseVoltageChange(value) {
            if(this.properties.name == '') {
                this.properties.name = `${value} ${this.properties.base_voltage_multiplier}${this.properties.base_voltage_unit}`
            }
        }
    },
}