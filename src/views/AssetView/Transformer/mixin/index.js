/* eslint-disable */
export default {
    data() {
        return {
            properties: {
                id: '',
                asset: "",
                asset_type: '',
                serial_no: '',
                manufacturer: '',
                manufacturer_type: '',
                manufacturing_year: '',
                asset_system_code: '',
                apparatus_id: '',
                feeder: '',
                date_of_warehouse_receipt: '',
                date_of_delivery: '',
                date_of_production_order: '',
                date_of_warehouse_delivery: '',
                progress: '',
                standard: '',
                thermal_meter: '',
                comment: '',
                type_disable : ''
            },
            winding_configuration: {
                phases: '1',
                vector_group: {
                    prim: '',
                    sec: {
                        I: '',
                        Value: ''
                    },
                    tert: {
                        I: '',
                        Value: '',
                        accessibility: ''
                    }
                },
                vector_group_custom: '',
                unsupported_vector_group: ''
            },
            ratings: {
                rated_frequency: '50',
                rated_frequency_custom: '50',
                voltage_ratings: [],
                voltage_regulation: [],
                power_ratings: [],
                current_ratings: [],
                short_circuit: {
                    ka: {
                        value: '',
                        unit: 'kA'
                    },
                    s: ''
                }
            },
            impedances: {
                ref_temp: 75,
                prim_sec: [],
                prim_tert: [],
                sec_tert: [],
                zero_sequence_impedance: {
                    base_power: {
                        value: '',
                        unit: 'MVA'
                    },
                    base_voltage: {
                        value: '',
                        unit: 'kV'
                    },
                    zero_percent: ''
                }
            },
            others: {
                category: '',
                status: '',
                tank_type: '',
                insulation_medium: '',
                oil_type: '',
                insulation: {
                    key: 'Weight',
                    weight: '',
                    volume: ''
                },
                total_weight: '',
                winding: {
                    prim: 'Copper',
                    sec: 'Copper',
                    tert: 'Copper'
                }
            },
            tapChangers: {
                id: '',
                mode: '',
                serial_no: '',
                manufacturer: '',
                manufacturer_type: '',
                winding: '',
                tap_scheme: '',
                no_of_taps: '0',
                voltage_table: []
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
        if(this.sideData != 'server') {
            this.mode = this.$route.query.mode
            if (this.mode === this.$constant.EDIT || this.mode === this.$constant.DUP) {
                this.asset_id = this.$route.query.asset_id

                const rs = await window.electronAPI.getAssetById(this.asset_id)
                if (rs.success) {
                    const data = rs.data
                    const dataAsset = data.asset
                    if (this.mode === this.$constant.DUP) {
                        dataAsset.id = ''
                        dataAsset.serial_no = ''
                    }

                    this.properties = {
                        id: dataAsset.id,
                        asset: dataAsset.asset,
                        asset_type: dataAsset.asset_type,
                        serial_no: dataAsset.serial_no,
                        manufacturer: dataAsset.manufacturer,
                        manufacturer_type: dataAsset.manufacturer_type,
                        manufacturing_year: dataAsset.manufacturing_year,
                        asset_system_code: dataAsset.asset_system_code,
                        apparatus_id: dataAsset.apparatus_id,
                        feeder: dataAsset.feeder,
                        date_of_warehouse_receipt: dataAsset.date_of_warehouse_receipt,
                        date_of_delivery: dataAsset.date_of_delivery,
                        date_of_production_order: dataAsset.date_of_production_order,
                        date_of_warehouse_delivery: dataAsset.date_of_warehouse_delivery,
                        progress: dataAsset.progress,
                        standard: dataAsset.standard,
                        thermal_meter: dataAsset.thermal_meter,
                        comment: dataAsset.comment,
                        type_disable : dataAsset.type_disable
                    }

                    this.disabled = true

                    this.winding_configuration = {
                        phases: dataAsset.phases,
                        vector_group: JSON.parse(dataAsset.vector_group),
                        vector_group_custom: dataAsset.vector_group_custom,
                        unsupported_vector_group: dataAsset.unsupported_vector_group
                    }

                    this.ratings = {
                        rated_frequency: ['16.7', '50', '60'].includes(dataAsset.rated_frequency) ? dataAsset.rated_frequency : 'Custom',
                        rated_frequency_custom: ['16.7', '50', '60'].includes(dataAsset.rated_frequency) ? null : dataAsset.rated_frequency,
                        voltage_ratings: JSON.parse(dataAsset.voltage_ratings),
                        voltage_regulation: JSON.parse(dataAsset.voltage_regulation),
                        power_ratings: JSON.parse(dataAsset.power_ratings),
                        current_ratings: JSON.parse(dataAsset.current_ratings),
                        short_circuit: {
                            ka: JSON.parse(dataAsset.max_short_circuit_current_ka),
                            s: dataAsset.max_short_circuit_current_s
                        }
                    }

                    this.impedances = {
                        ref_temp: dataAsset.ref_temp,
                        prim_sec: JSON.parse(dataAsset.prim_sec),
                        prim_tert: JSON.parse(dataAsset.prim_tert),
                        sec_tert: JSON.parse(dataAsset.sec_tert),
                        zero_sequence_impedance: {
                            base_power: JSON.parse(dataAsset.base_power),
                            base_voltage: JSON.parse(dataAsset.base_voltage),
                            zero_percent: dataAsset.zero_percent
                        }
                    }

                    this.others = {
                        category: dataAsset.category,
                        status: dataAsset.status,
                        tank_type: dataAsset.tank_type,
                        insulation_medium: dataAsset.insulation_medium,
                        oil_type: dataAsset.oil_type,
                        insulation: {
                            key: dataAsset.insulation_weight != null ? 'Weight' : 'Volume',
                            weight: dataAsset.insulation_weight,
                            volume: dataAsset.insulation_volume
                        },
                        total_weight: dataAsset.total_weight,
                        winding: JSON.parse(dataAsset.winding)
                    }

                    const dataTapChanger = data.tap_changer
                    if (this.mode === this.$constant.DUP) {
                        dataTapChanger.id = ''
                    }
                    this.tapChangers = {
                        id: dataTapChanger.id,
                        mode: dataTapChanger.mode,
                        _mode: dataTapChanger._mode,
                        serial_no: dataTapChanger.serial_no,
                        manufacturer: dataTapChanger.manufacturer,
                        manufacturer_type: dataTapChanger.manufacturer_type,
                        winding: dataTapChanger.winding,
                        _winding: dataTapChanger._winding,
                        tap_scheme: dataTapChanger.tap_scheme,
                        no_of_taps: dataTapChanger.no_of_taps,
                        voltage_table: JSON.parse(dataTapChanger.voltage_table)
                    }
                    const dataBushings = data.bushings
                    if (this.mode === this.$constant.DUP) {
                        dataBushings.id = ''
                    }
                    this.bushings_config = {
                        id: dataBushings.id,
                        asset_type: this.getAssetType(JSON.parse(dataBushings.asset_type)),
                        serial_no: JSON.parse(dataBushings.serial_no),
                        manufacturer: JSON.parse(dataBushings.manufacturer),
                        manufacturer_type: JSON.parse(dataBushings.manufacturer_type),
                        manufacturer_year: JSON.parse(dataBushings.manufacturer_year),
                        insull_level: JSON.parse(dataBushings.insull_level),
                        voltage_gr: JSON.parse(dataBushings.voltage_gr),
                        max_sys_voltage: JSON.parse(dataBushings.max_sys_voltage),
                        rate_current: JSON.parse(dataBushings.rate_current),
                        df_c1: JSON.parse(dataBushings.df_c1),
                        cap_c1: JSON.parse(dataBushings.cap_c1),
                        df_c2: JSON.parse(dataBushings.df_c2),
                        cap_c2: JSON.parse(dataBushings.cap_c2),
                        insulation_type: JSON.parse(dataBushings.insulation_type)
                    }
                } else {
                    this.$message.error(rs.message)
                }
            } else {
                this.mappingProperty()
            }
        } else {

        }
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
        mappingProperty() {
            this.properties.asset =  this.$route.query.dataProperty.asset
            this.properties.asset_type =  this.$route.query.dataProperty.asset_id
            this.properties.serial_no = this.$route.query.dataProperty.serial_no
            this.properties.manufacturer =  this.$route.query.dataProperty.manufacturer
            this.properties.manufacturer_type =  this.$route.query.dataProperty.manufacturer_type
            this.properties.manufacturing_year =  this.$route.query.dataProperty.manufacturer_year
            this.properties.asset_system_code =  this.$route.query.dataProperty.asset_system_code
            this.properties.apparatus_id =  this.$route.query.dataProperty.apparatus_id
            this.properties.feeder = this.$route.query.dataProperty.feeder
        },
        async saveAsset() {
            if (this.mode === this.$constant.ADD || this.mode === this.$constant.DUP) {
                await this.insertAsset()
            } else {
                await this.updateAsset()
            }
        },
        async insertAsset() {
            const properties = this.properties
            const winding_configuration = this.winding_configuration
            const ratings = this.ratings
            const impedances = this.impedances
            const others = this.others
            const asset = {
                properties,
                winding_configuration,
                ratings,
                impedances,
                others
            }
            const locationId = this.selectedLocation[0].id
            const rs = await window.electronAPI.insertAsset(locationId, asset, this.tapChangers, this.bushings_config)
            if (rs.success) {
                this.$message({
                    type: 'success',
                    message: 'Insert completed'
                })
                this.$router.push({name: 'manage'})
            } else {
                this.$message.error(rs.message)
            }
        },
        async updateAsset() {
            const properties = this.properties
            const winding_configuration = this.winding_configuration
            const ratings = this.ratings
            const impedances = this.impedances
            const others = this.others
            const asset = {
                properties,
                winding_configuration,
                ratings,
                impedances,
                others
            }
            const rs = await window.electronAPI.updateAsset(asset, this.tapChangers, this.bushings_config)
            if (rs.success) {
                this.$message({
                    type: 'success',
                    message: 'Update completed'
                })
            } else {
                this.$message.error(rs.message)
            }
        },
    }
}