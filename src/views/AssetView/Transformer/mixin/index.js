/* eslint-disable */
import TransformerDto from "@/views/Dto/Transformer"
import TapChangersDto from "@/views/Dto/TapChanger"
import uuid from "@/utils/uuid"
import * as transformerMapping from "@/views/Mapping/Transformer"
import OldPowerTransformerInfo from "@/views/Cim/OldPowerTransformerInfo"
import OldTransformerEndInfo from "@/views/Cim/OldTransformerEndInfo"
export default {
    data() {
        return {
            transformerDto: {
                properties: new TransformerDto().properties,
                winding_configuration: new TransformerDto().winding_configuration,
                ratings: new TransformerDto().ratings,
                impedances: new TransformerDto().impedances,
                others: new TransformerDto().others,
                tap_changers: new TapChangersDto(),
                productAssetModelId: '',
                lifecycleDateId: '',
                assetPsrId: '',
                psrId: '',
                oldPowerTransformerInfoId: '',
                oldTransformerEndInfo: [],
                shortCircuitTestTransformerEndInfo: [],
            },
            bushings_config: {
                id: null,
                asset_type: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    NameOfPos : {
                        prim : {},
                        sec : {},
                        tert : {}
                    },
                    DataShow : {
                        prim : {
                            fi : true,
                            se : true,
                            th : false,
                            fo : false
                        },
                        sec : {
                            fi : true,
                            se : false,
                            th : false,
                            fo : false
                        },
                        tert : {
                            fi : false,
                            se : false,
                            th : false,
                            fo : false
                        }
                    }
                },
                serial_no: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                manufacturer: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                manufacturer_type: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                manufacturer_year: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                insull_level: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                voltage_gr: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                max_sys_voltage: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        o: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                rate_current: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                df_c1: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                cap_c1: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                df_c2: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                cap_c2: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                insulation_type: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                }
            },
            config: '',
            disabled : false
        }
    },
    async beforeMount() {
    },
    methods: {
        getAssetType(data) {
            if(data.NameOfPos == undefined || data.DataShow == undefined ) {
                if(data.NameOfPos == undefined) {
                    let temp = {
                        NameOfPos : {
                            prim : {},
                            sec : {},
                            tert : {}
                        }
                    }
                    data = Object.assign(data, temp)
                }
                if(data.DataShow == undefined) {
                    let dataShow = {
                        DataShow : {
                            prim : {
                                fi : true,
                                se : true,
                                th : false,
                                fo : false
                            },
                            sec : {
                                fi : true,
                                se : false,
                                th : false,
                                fo : false
                            },
                            tert : {
                                fi : false,
                                se : false,
                                th : false,
                                fo : false
                            }
                        }
                    }
                    data = Object.assign(data, dataShow)
                }
                return data
            } else {
                return data
            }
        },

        onChangeAssetType(value) {
            this.transformerDto.winding_configuration = new TransformerDto().winding_configuration
            for (let [index, item] of this.transformerDto.ratings.voltage_ratings.entries()) {
                if(item.winding === this.$constant.TERT) {
                    if(value !== this.$constant.THREE_WINDING) {
                        this.transformerDto.ratings.voltage_ratings.splice(index, 1)
                    }
                }
            }
            for (let [index, item] of this.transformerDto.ratings.current_ratings.entries()) {
                if(value !== this.$constant.THREE_WINDING) {
                    console.log("check")
                    if(item.tert !== undefined) {
                        this.transformerDto.ratings.current_ratings[index].tert.mrid = ''
                        this.transformerDto.ratings.current_ratings[index].tert.value = ''
                        this.transformerDto.ratings.current_ratings[index].tert.unit = 'A'
                    }
                }
            }

            if(value === this.$constant.TWO_WINDING || value === this.$constant.WITHOUT_TERT) {
                this.transformerDto.impedances.prim_tert = []
                this.transformerDto.impedances.sec_tert = []
            }

            if(value === this.$constant.THREE_WINDING || value === this.$constant.TWO_WINDING) {
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.prim.mrid = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.prim.value = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.prim.unit = '%'
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.sec.mrid = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.sec.value = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.sec.unit = '%'
            } else {
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.zero.mrid = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.zero.value = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.zero.unit = '%'
            }

            if(value === this.$constant.TWO_WINDING || value === this.$constant.WITHOUT_TERT) {
                this.transformerDto.others.winding.tert = ''
            }
        },

        async saveAsset() {
            try {
                if(this.transformerDto.properties.type && this.transformerDto.properties.kind) {
                    console.log(this.transformerDto)
                    const data = JSON.parse(JSON.stringify(this.checkTransformerDto(this.transformerDto)));
                    const entity = transformerMapping.transformerDtoToEntity(data);
                    console.log(entity)
                    return true;
                    
                } else {
                    this.$message({
                        type: 'warning',
                        message: "Please select the type and kind of Asset before saving."
                    });
                    return false;
                }
            } catch (error) {
                console.error("Error saving asset:", error);
                this.$message({
                    type: 'error',
                    message: "An error occurred while saving the asset."
                });
            }
        },

        checkTransformerDto(data) {
            this.checkPsrId()
            this.checkOldTransformerEndInfo(data)
            this.checkAsset(data)
            this.checkLifecycleDate(data)
            this.checkAssetInfo(data)
            this.checkProductAssetModel(data)
            this.checkVoltageRating(data)
            this.checkPowerRating(data)
            this.checkCurrentRating(data)
            this.checkShortCircuitRatings(data)
            this.checkRatedFrequency(data)
            this.checkRefTemperature(data)
            this.checkShortCircuitTest(data)
            this.checkZeroImpedance(data)
            this.checkOther(data)
            return data;
        },
        checkPsrId() {
            if(this.parent.mrid !== null && this.parent.mrid !== '') {
                this.transformerDto.psrId = this.parent.mrid
            }
        },

        checkOldTransformerEndInfo(data) {
            if(data.oldTransformerEndInfo.length === 0) {
                if(data.properties.type === this.$constant.THREE_WINDING || data.properties.type === this.$constant.WITH_TERT) {
                    for (let i = 1; i <= 3; i++) {
                        const transformerEndInfo = new OldTransformerEndInfo();
                        transformerEndInfo.mrid = uuid.newUuid();
                        transformerEndInfo.end_number = i
                        data.oldTransformerEndInfo.push(transformerEndInfo);
                    }
                } else {
                    for (let i = 1; i < 2; i++) {
                        const transformerEndInfo = new OldTransformerEndInfo();
                        transformerEndInfo.mrid = uuid.newUuid();
                        transformerEndInfo.end_number = i
                        data.oldTransformerEndInfo.push(transformerEndInfo);
                    }
                }
            } else {
                if(data.properties.type === this.$constant.THREE_WINDING || data.properties.type !== this.$constant.WITH_TERT) {
                    if(data.oldTransformerEndInfo.length < 3) {
                        const transformerEndInfo = new OldTransformerEndInfo();
                        transformerEndInfo.mrid = uuid.newUuid();
                        transformerEndInfo.end_number = 3
                        data.oldTransformerEndInfo.push(transformerEndInfo);
                    }
                } else {
                    if(data.oldTransformerEndInfo.length > 2) {
                        for(let i = 1; i<= data.oldTransformerEndInfo.length; i++) {
                            if(data.oldTransformerEndInfo[i-1].end_number === 3) {
                                data.oldTransformerEndInfo.splice(i-1, 1);
                                break;
                            }
                        }
                    }
                }
            }
        },

        checkAsset(data) {
            if(data.properties.mrid === null || data.properties.mrid === '') {
                data.properties.mrid = uuid.newUuid()
            }
        },

        checkLifecycleDate(data) {
            if(data.lifecycleDateId === null || data.lifecycleDateId === '') {
                data.lifecycleDateId = uuid.newUuid()
            }
        },

        checkAssetInfo(data) {
            if(data.oldPowerTransformerInfoId === null || data.oldPowerTransformerInfoId === '') {
                data.oldPowerTransformerInfoId = uuid.newUuid()
            }
        },

        checkProductAssetModel(data) {
            if(data.productAssetModelId === null || data.productAssetModelId === '') {
                data.productAssetModelId = uuid.newUuid()
            }
        },

        checkVoltageRating(data) {
            for(let item of data.ratings.voltage_ratings) {
                if(item.mrid === null || item.mrid === '') {
                    item.mrid = uuid.newUuid()
                }
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        if(typeof item[key] === 'object' && item[key] !== null) {
                            if(item[key].mrid === null || item[key].mrid === '') {
                                item[key].mrid = uuid.newUuid()
                            }
                        }
                    }
                }
            }
        },

        checkPowerRating(data) {
            for(let item of data.ratings.power_ratings) {
                if(item.mrid === null || item.mrid === '') {
                    item.mrid = uuid.newUuid()
                }
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        if(typeof item[key] === 'object' && item[key] !== null) {
                            if(item[key].mrid === null || item[key].mrid === '') {
                                item[key].mrid = uuid.newUuid()
                            }
                        }
                    }
                }
            }
        },

        checkCurrentRating(data) {
            for(let item of data.ratings.current_ratings) {
                if(data.properties.type === this.$constant.WITHOUT_TERT || data.properties.type === this.$constant.TWO_WINDING) {
                    if(item.mrid === null || item.mrid === '') {
                        item.mrid = uuid.newUuid()
                    }
                    for (const key in item) {
                        if (item.hasOwnProperty(key) && key !== 'tert') {
                            if(typeof item[key] === 'object' && item[key] !== null) {
                                if(item[key].mrid === null || item[key].mrid === '') {
                                    item[key].mrid = uuid.newUuid()
                                }
                                if(item[key].data.mrid === null || item[key].data.mrid === '') {
                                    item[key].data.mrid = uuid.newUuid()
                                }
                            }
                        }
                    }
                } else {
                    if(item.mrid === null || item.mrid === '') {
                        item.mrid = uuid.newUuid()
                    }
                    for (const key in item) {
                        if (item.hasOwnProperty(key)) {
                            if(typeof item[key] === 'object' && item[key] !== null) {
                                if(item[key].mrid === null || item[key].mrid === '') {
                                    item[key].mrid = uuid.newUuid()
                                }
                                if(item[key].data.mrid === null || item[key].data.mrid === '') {
                                    item[key].data.mrid = uuid.newUuid()
                                }
                            }
                        }
                    }
                }
            }
        },

        checkShortCircuitRatings(data) {
            if(data.ratings.short_circuit.mrid === null || data.ratings.short_circuit.mrid === '') {
                data.ratings.short_circuit.mrid = uuid.newUuid()
                if(data.ratings.short_circuit.ka.mrid === null || data.ratings.short_circuit.ka.mrid === '') {
                    data.ratings.short_circuit.ka.mrid = uuid.newUuid()
                }
                if(data.ratings.short_circuit.s.mrid === null || data.ratings.short_circuit.s.mrid === '') {
                    data.ratings.short_circuit.s.mrid = uuid.newUuid()
                }
            }
        },

        checkRatedFrequency(data) {
            if(data.ratings.rated_frequency.mrid === null || data.ratings.rated_frequency.mrid === '') {
                data.ratings.rated_frequency.mrid = uuid.newUuid()
            }
        },

        checkRefTemperature(data) {
            if(data.impedances.ref_temp.mrid === null || data.impedances.ref_temp.mrid === '') {
                data.impedances.ref_temp.mrid = uuid.newUuid()
            }
        },

        checkShortCircuitTest(data) {
            for(let item of data.impedances.prim_sec) {
                if(item.mrid === null || item.mrid === '') {
                    item.mrid = uuid.newUuid()
                }
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        if(typeof item[key] === 'object' && item[key] !== null) {
                            if(item[key].mrid === null || item[key].mrid === '') {
                                item[key].mrid = uuid.newUuid()
                                if(item[key].data && (item[key].data.mrid === null || item[key].data.mrid === '')) {
                                    item[key].data.mrid = uuid.newUuid()
                                }
                            }
                        }
                    }
                }
            }

            for(let item of data.impedances.prim_tert) {
                if(item.mrid === null || item.mrid === '') {
                    item.mrid = uuid.newUuid()
                }
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        if(typeof item[key] === 'object' && item[key] !== null) {
                            if(item[key].mrid === null || item[key].mrid === '') {
                                item[key].mrid = uuid.newUuid()
                                if(item[key].data && (item[key].data.mrid === null || item[key].data.mrid === '')) {
                                    item[key].data.mrid = uuid.newUuid()
                                }
                            }
                        }
                    }
                }
            }

            for(let item of data.impedances.sec_tert) {
                if(item.mrid === null || item.mrid === '') {
                    item.mrid = uuid.newUuid()
                }
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        if(typeof item[key] === 'object' && item[key] !== null) {
                            if(item[key].mrid === null || item[key].mrid === '') {
                                item[key].mrid = uuid.newUuid()
                                if(item[key].data && (item[key].data.mrid === null || item[key].data.mrid === '')) {
                                    item[key].data.mrid = uuid.newUuid()
                                }
                            }
                        }
                    }
                }
            }
        },

        checkZeroImpedance(data) {
            if(data.impedances.zero_sequence_impedance.mrid === null || data.impedances.zero_sequence_impedance.mrid === '') {
                data.impedances.zero_sequence_impedance.mrid = uuid.newUuid()
                if(data.impedances.zero_sequence_impedance.base_power.mrid === null || data.impedances.zero_sequence_impedance.base_power.mrid === '') {
                    data.impedances.zero_sequence_impedance.base_power.mrid = uuid.newUuid()
                    if(data.impedances.zero_sequence_impedance.base_power.data.mrid === null || data.impedances.zero_sequence_impedance.base_power.data.mrid === '') {
                        data.impedances.zero_sequence_impedance.base_power.data.mrid = uuid.newUuid()
                    }
                }
                if(data.impedances.zero_sequence_impedance.base_voltage.mrid === null || data.impedances.zero_sequence_impedance.base_voltage.mrid === '') {
                    data.impedances.zero_sequence_impedance.base_voltage.mrid = uuid.newUuid()
                    if(data.impedances.zero_sequence_impedance.base_voltage.data.mrid === null || data.impedances.zero_sequence_impedance.base_voltage.data.mrid === '') {
                        data.impedances.zero_sequence_impedance.base_voltage.data.mrid = uuid.newUuid()
                    }
                }
                if(data.impedances.zero_sequence_impedance.zero_percent.prim.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.prim.mrid === '') {
                    data.impedances.zero_sequence_impedance.zero_percent.prim.mrid = uuid.newUuid()
                    if(data.impedances.zero_sequence_impedance.zero_percent.prim.data.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.prim.data.mrid === '') {
                        data.impedances.zero_sequence_impedance.zero_percent.prim.data.mrid = uuid.newUuid()
                    }
                }
                if(data.impedances.zero_sequence_impedance.zero_percent.sec.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.sec.mrid === '') {
                    data.impedances.zero_sequence_impedance.zero_percent.sec.mrid = uuid.newUuid()
                    if(data.impedances.zero_sequence_impedance.zero_percent.sec.data.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.sec.data.mrid === '') {
                        data.impedances.zero_sequence_impedance.zero_percent.sec.data.mrid = uuid.newUuid()
                    }
                }
                if(data.impedances.zero_sequence_impedance.zero_percent.zero.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.zero.mrid === '') {
                    data.impedances.zero_sequence_impedance.zero_percent.zero.mrid = uuid.newUuid()
                    if(data.impedances.zero_sequence_impedance.zero_percent.zero.data.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.zero.data.mrid === '') {
                        data.impedances.zero_sequence_impedance.zero_percent.zero.data.mrid = uuid.newUuid()
                    }
                }
            }
        },

        checkOther(data) {
            if(data.others.mrid === null || data.others.mrid === '') {
                data.others.mrid = uuid.newUuid()
            }
            if(data.others.insulation.weight.mrid === null || data.others.insulation.weight.mrid === '') {
                data.others.insulation.weight.mrid = uuid.newUuid()
            }
            if(data.others.insulation.volume.mrid === null || data.others.insulation.volume.mrid === '') {
                data.others.insulation.volume.mrid = uuid.newUuid()
            }
            if(data.others.total_weight.mrid === null || data.others.total_weight.mrid === '') {
                data.others.total_weight.mrid = uuid.newUuid()
            }
        },

    }
}