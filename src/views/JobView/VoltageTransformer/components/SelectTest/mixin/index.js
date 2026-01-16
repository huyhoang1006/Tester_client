import { mapState } from 'vuex'

export default {
    data() {
        return {}
    },
    computed: mapState(['selectedAsset', 'selectedJob']),
    async beforeMount() { },
    methods: {
        async initTest(testTypeCode, assetData) {
            // Use assetData prop if provided and valid, otherwise fallback to selectedAsset from Vuex
            let asset = null
            if (assetData && Object.keys(assetData).length > 0) {
                asset = assetData
            } else if (this.selectedAsset && this.selectedAsset.length > 0) {
                asset = this.selectedAsset[0]
            }

            if (!asset) {
                console.error('No asset data available for initTest')
                return null
            }

            let data = null
            switch (testTypeCode) {
                case 'InsulationResistance':
                    data = this.initInsulationResistance(asset)
                    break
                case 'VTRatio':
                    data = await this.initVTRatio(asset)
                    break
                case 'DcWindingRes':
                    data = await this.initDcWindingRes(asset)
                    break
                case 'VTDfcap':
                    data = await this.initVTDfcap()
                    break
                case 'GeneralInspection':
                    data = await this.initGeneralInspection()
                    break
            }

            return data
        },
        async initInsulationResistance(asset) {
            const row_data = [
                {
                    mrid: '',
                    name: 'Measurement',
                    code: 'measurement',
                    unit: '',
                    type: 'string',

                },
                {
                    mrid: '',
                    name: 'V test',
                    code: 'v_test',
                    unit: 'V',
                    type: 'analog',
                }
                ,
                {
                    mrid: '',
                    name: 'R60s',
                    code: 'r60s',
                    unit: 'M|Ω',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }

                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'Prim - (Sec + GND)',
                        unit: '',
                        type: 'string'
                    },
                    v_test: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },
                    r60s: {
                        mrid: '',
                        value: '',
                        unit: 'M|Ω',
                        type: 'analog'
                    },
                    assessment: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    condition_indicator: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    }
                },
            ]
            // Try to get config from various possible locations
            let config = null
            if (asset) {
                if (asset.config) {
                    try {
                        config = typeof asset.config === 'string' ? JSON.parse(asset.config) : asset.config
                    } catch (e) {
                        console.warn('Failed to parse asset.config:', e)
                    }
                }
                if (!config && asset.properties && asset.properties.config) {
                    try {
                        config = typeof asset.properties.config === 'string' ? JSON.parse(asset.properties.config) : asset.properties.config
                    } catch (e) {
                        console.warn('Failed to parse asset.properties.config:', e)
                    }
                }
                if (!config && asset.asset_info && asset.asset_info.config) {
                    try {
                        config = typeof asset.asset_info.config === 'string' ? JSON.parse(asset.asset_info.config) : asset.asset_info.config
                    } catch (e) {
                        console.warn('Failed to parse asset.asset_info.config:', e)
                    }
                }
            }

            if (!config || !config.windings) {
                // Only log warning in development or if config was expected
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Asset config or windings is missing, using default value of 2')
                }
                config = config || {}
                config.windings = config.windings || 2
            }

            let winding = parseInt(config.windings) || 2
            for (let i = 1; i <= parseInt(winding); i++) {
                table.push({
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: "(" + i + "a" + i + "n" + ")" + " - GND",
                        unit: '',
                        type: 'string'
                    },
                    v_test: {
                        mrid: '',
                        value: '',
                        unit: 'V',
                        type: 'analog'
                    },
                    r60s: {
                        mrid: '',
                        value: '',
                        unit: 'M|Ω',
                        type: 'analog'
                    },
                    assessment: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    condition_indicator: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    }
                })
            }
            let measurementProcedure = []
            return {
                table,
                row_data,
                measurementProcedure
            }
        },
        async initVTRatio(asset) {
            function uprData(uprRatio, upr) {
                if (uprRatio == ' / √3') {
                    let data = parseFloat(upr) / (Math.sqrt(parseFloat(3)))
                    return data
                } else if (uprRatio == ' / 3') {
                    let data = parseFloat(upr) / parseFloat(3)
                    return data
                } else {
                    return parseFloat(upr)
                }
            }
            function uprRatioData(uprRatio) {
                if (uprRatio == '3sqrt') {
                    return ' / √3'
                } else if (uprRatio == '3') {
                    return ' / 3'
                } else {
                    return ''
                }
            }
            function usrRatioData(usrRatio) {
                if (usrRatio == '3sqrt') {
                    return ' / √3'
                } else if (usrRatio == '3') {
                    return ' / 3'
                } else {
                    return ''
                }
            }
            function usrData(usrRatio, usr) {
                if (usrRatio == ' / √3') {
                    let data = parseFloat(usr) / (Math.sqrt(parseFloat(3)))
                    return data
                } else if (usrRatio == ' / 3') {
                    let data = parseFloat(usr) / parseFloat(3)
                    return data
                } else {
                    return parseFloat(usr)
                }
            }

            // Try to get config and ratings from various possible locations
            let config = null
            let ratings = {}

            if (asset) {
                if (asset.config) {
                    try {
                        config = typeof asset.config === 'string' ? JSON.parse(asset.config) : asset.config
                    } catch (e) {
                        console.warn('Failed to parse asset.config:', e)
                    }
                }
                if (!config && asset.properties && asset.properties.config) {
                    try {
                        config = typeof asset.properties.config === 'string' ? JSON.parse(asset.properties.config) : asset.properties.config
                    } catch (e) {
                        console.warn('Failed to parse asset.properties.config:', e)
                    }
                }
                if (!config && asset.asset_info && asset.asset_info.config) {
                    try {
                        config = typeof asset.asset_info.config === 'string' ? JSON.parse(asset.asset_info.config) : asset.asset_info.config
                    } catch (e) {
                        console.warn('Failed to parse asset.asset_info.config:', e)
                    }
                }

                if (asset.ratings) {
                    try {
                        ratings = typeof asset.ratings === 'string' ? JSON.parse(asset.ratings) : asset.ratings
                    } catch (e) {
                        console.warn('Failed to parse asset.ratings:', e)
                    }
                } else if (asset.properties && asset.properties.ratings) {
                    try {
                        ratings = typeof asset.properties.ratings === 'string' ? JSON.parse(asset.properties.ratings) : asset.properties.ratings
                    } catch (e) {
                        console.warn('Failed to parse asset.properties.ratings:', e)
                    }
                }
            }

            if (!config) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Asset config is missing for VTRatio, using default values')
                }
                return { table: [], row_data: [], measurementProcedure: [] }
            }
            const row_data = [
                {
                    mrid: '',
                    name: 'Name',
                    code: 'name',
                    unit: '',
                    type: 'string',

                },
                {
                    mrid: '',
                    name: 'UpR',
                    code: 'upr',
                    unit: 'A',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'UsR',
                    code: 'usr',
                    unit: 'A',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Ratio meas',
                    code: 'ratio_meas',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Ratio dev',
                    code: 'ratio_dev',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Polarity',
                    code: 'polarity',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }

                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = []
            let winding = parseInt(config.windings) || 2
            let dataVT = config.dataVT || []

            let uprRatio = uprRatioData(ratings.uprRatio || '')
            let upr = (ratings.upr || '') + ' ' + uprRatio
            let uprValue = uprData(uprRatio, upr)

            for (let i = 1; i <= parseInt(winding); i++) {
                let usrRatio = ''
                let usr = ''
                let usrValue = 0

                if (dataVT && dataVT[i - 1] && dataVT[i - 1].table) {
                    usrRatio = usrRatioData(dataVT[i - 1].table.usrRatio || '')
                    usr = (dataVT[i - 1].table.usr || '') + usrRatio
                    usrValue = usrData(usrRatio, dataVT[i - 1].table.usr || '0')
                }
                table.push({
                    mrid: '',
                    name: {
                        mrid: '',
                        value: "(" + i + "a" + i + "n" + ")" + " - GND",
                        unit: '',
                        type: 'string'
                    },
                    upr: {
                        mrid: '',
                        value: upr,
                        unit: 'A',
                        type: 'analog'
                    },
                    usr: {
                        mrid: '',
                        value: usr,
                        unit: 'A',
                        type: 'analog'
                    },
                    ratio_meas: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'string'
                    },
                    ratio_dev: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'string'
                    },
                    polarity: '',
                    assessment: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    condition_indicator: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    uprValue: {
                        mrid: '',
                        value: uprValue,
                        unit: 'A',
                        type: 'analog'
                    },
                    usrValue: {
                        mrid: '',
                        value: usrValue,
                        unit: 'A',
                        type: 'analog'
                    }
                })
            }
            let measurementProcedure = []
            return {
                table,
                row_data,
                measurementProcedure
            }
        },
        async initDcWindingRes(asset) {
            // Try to get config from various possible locations
            let config = null
            if (asset) {
                if (asset.config) {
                    try {
                        config = typeof asset.config === 'string' ? JSON.parse(asset.config) : asset.config
                    } catch (e) {
                        console.warn('Failed to parse asset.config:', e)
                    }
                }
                if (!config && asset.properties && asset.properties.config) {
                    try {
                        config = typeof asset.properties.config === 'string' ? JSON.parse(asset.properties.config) : asset.properties.config
                    } catch (e) {
                        console.warn('Failed to parse asset.properties.config:', e)
                    }
                }
                if (!config && asset.asset_info && asset.asset_info.config) {
                    try {
                        config = typeof asset.asset_info.config === 'string' ? JSON.parse(asset.asset_info.config) : asset.asset_info.config
                    } catch (e) {
                        console.warn('Failed to parse asset.asset_info.config:', e)
                    }
                }
            }

            if (!config || !config.windings) {
                // Only log warning in development or if config was expected
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Asset config or windings is missing, using default value of 2')
                }
                config = config || {}
                config.windings = config.windings || 2
            }
            const row_data = [
                {
                    mrid: '',
                    name: 'Name',
                    code: 'name',
                    unit: '',
                    type: 'string',

                },
                {
                    mrid: '',
                    name: 'R meas',
                    code: 'r_meas',
                    unit: 'Ω',
                    type: 'analog',
                }
                ,
                {
                    mrid: '',
                    name: 'R ref',
                    code: 'r_ref',
                    unit: 'Ω',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'R corr',
                    code: 'r_corr',
                    unit: 'Ω',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'R dev',
                    code: 'r_dev',
                    unit: '%',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }

                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = []
            let winding = parseInt(config.windings) || 2
            for (let i = 1; i <= parseInt(winding); i++) {
                table.push({
                    mrid: '',
                    name: {
                        mrid: '',
                        value: i + "a" + i + "n",
                        unit: '',
                        type: 'string'
                    },
                    rmeas: {
                        mrid: '',
                        value: '',
                        unit: 'Ω',
                        type: 'analog'
                    },
                    rref: {
                        mrid: '',
                        value: '',
                        unit: 'Ω',
                        type: 'analog'
                    },
                    rcorr: {
                        mrid: '',
                        value: '',
                        unit: 'Ω',
                        type: 'analog'
                    },
                    rdev: {
                        mrid: '',
                        value: '',
                        unit: '%',
                        type: 'analog'
                    },
                    assessment: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    condition_indicator: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    }
                })
            }
            let measurementProcedure = []
            return {
                row_data,
                table,
                measurementProcedure
            }
        },
        async initVTDfcap() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Measurement',
                    code: 'measurement',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Test mode',
                    code: 'testMode',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Test voltage',
                    code: 'test_voltage',
                    unit: 'k|V',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'DF ref',
                    code: 'dfref',
                    unit: '%',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'C ref',
                    code: 'cref',
                    unit: 'p|F',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'DF meas',
                    code: 'dfmeas',
                    unit: '%',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'C meas',
                    code: 'cmeas',
                    unit: 'p|F',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: '△C cal',
                    code: 'ccal',
                    unit: '%',
                    type: 'analog',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = [
                {
                    mrid: '',
                    measurement: {
                        mrid: '',
                        value: 'C H-G',
                        unit: '',
                        type: 'string'
                    },

                    testMode: {
                        mrid: '',
                        value: 'GST',
                        unit: '',
                        type: 'string'
                    },
                    test_voltage: {
                        mrid: '',
                        value: '',
                        unit: 'k|V',
                        type: 'analog'
                    },
                    dfref: {
                        mrid: '',
                        value: '',
                        unit: '%',
                        type: 'analog'
                    },
                    cref: {
                        mrid: '',
                        value: '',
                        unit: 'p|F',
                        type: 'analog'
                    },
                    dfmeas: {
                        mrid: '',
                        value: '',
                        unit: '%',
                        type: 'analog'
                    },
                    cmeas: {
                        mrid: '',
                        value: '',
                        unit: 'p|F',
                        type: 'analog'
                    },
                    ccal: {
                        mrid: '',
                        value: '',
                        unit: '%',
                        type: 'analog'
                    },
                    assessment: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    condition_indicator: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    }
                }
            ]
            let measurementProcedure = []
            return {
                row_data,
                table,
                measurementProcedure
            }
        },
        async initGeneralInspection() {
            const row_data = [
                {
                    mrid: '',
                    name: 'Items',
                    code: 'items',
                    unit: '',
                    type: 'string',
                },
                {
                    mrid: '',
                    name: 'Assessment',
                    code: 'assessment',
                    unit: '',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Fail' }, { mrid: '', value: 1, alias_name: 'Pass' }]
                    }
                },
                {
                    mrid: '',
                    name: 'Condition indicator',
                    code: 'condition_indicator',
                    unit: '',
                    type: 'discrete',
                    pool: {
                        mrid: '',
                        valueToAlias: [{ mrid: '', value: 0, alias_name: 'Bad' }, { mrid: '', value: 1, alias_name: 'Poor' },
                        { mrid: '', value: 2, alias_name: 'Fair' }, { mrid: '', value: 3, alias_name: 'Good' }]
                    }
                }
            ]
            let table = []
            const data = ['Nameplate', 'Installation check', 'Insulation surface', 'Ground frame', 'Terminal box', 'Marking of terminals', 'Oil check']
            data.forEach(element => {
                table.push({
                    items: {
                        mrid: '',
                        value: element,
                        unit: '',
                        type: 'string'
                    },
                    assessment: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    },
                    condition_indicator: {
                        mrid: '',
                        value: '',
                        unit: '',
                        type: 'discrete'
                    }
                })
            })
            let measurementProcedure = []
            return {
                row_data,
                table,
                measurementProcedure
            }
        }
    }
}
