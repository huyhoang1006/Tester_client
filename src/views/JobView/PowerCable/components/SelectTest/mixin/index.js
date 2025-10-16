import { mapState } from 'vuex'

export default {
    data() {
        return {}
    },
    computed: {
        ...mapState(['selectedAsset', 'selectedJob'])
    },
    async beforeMount() { },
    methods: {
        async initTest(testTypeCode) {
            let data = null
            switch (testTypeCode) {
                case 'InsulationResistance':
                    data = this.initInsulationResistance()
                    break
                case 'DcVoltageOverSheath':
                    data = await this.initDcVoltageOverSheath()
                    break
                case 'AcVoltageInsulation':
                    data = await this.initAcVoltageInsulation()
                    break
                case 'DcVoltageInsulation':
                    data = await this.initDcVoltageInsulation()
                    break
                case 'VlfTest':
                    data = await this.initVlfTest()
                    break
                case 'TandeltaVlfSource':
                    data = await this.initTandeltaVlfSource()
                    break
                case 'TandeltaPowerAcSource':
                    data = await this.initTandeltaPowerAcSource()
                    break
                case 'ParticalDischarge':
                    data = await this.initParticalDischarge()
                    break
                case 'GeneralInspection':
                    data = await this.initGeneralInspection()
                    break
            }

            return data
        },
        async initInsulationResistance() {
            let table = [
                {
                    measurement: "Phase A-(B+C+GND)",
                    test_voltage: '',
                    beforeHv: "",
                    afterHv: "",
                    assessment: '',
                    condition_indicator: ''
                },
                {
                    measurement: "Phase B-(A+C+GND)",
                    test_voltage: '',
                    beforeHv: "",
                    afterHv: "",
                    assessment: '',
                    condition_indicator: ''
                },
                {
                    measurement: "Phase C-(A+B+GND)",
                    test_voltage: '',
                    beforeHv: "",
                    afterHv: "",
                    assessment: '',
                    condition_indicator: ''
                }
            ]
            return {
                row_data: [],
                measurementProcedure: [],
                table
            }
        },
        async initDcVoltageOverSheath() {
            let table = [
                {
                    measurement: "Phase A-(B+C+GND)",
                    test_voltage: '',
                    duration: '',
                    assessment: '',
                    condition_indicator: ''
                },
                {
                    measurement: "Phase B-(A+C+GND)",
                    test_voltage: '',
                    duration: '',
                    assessment: '',
                    condition_indicator: ''
                },
                {
                    measurement: "Phase C-(A+B+GND)",
                    test_voltage: '',
                    duration: '',
                    assessment: '',
                    condition_indicator: ''
                }
            ]
            return {
                row_data: [],
                measurementProcedure: [],
                table
            }
        },
        async initAcVoltageInsulation() {
            let table = [
                {
                    measurement: "Phase A-(B+C+GND)",
                    test_voltage: '',
                    frequency: '',
                    duration: '',
                    assessment: '',
                    condition_indicator: ''
                },
                {
                    measurement: "Phase B-(A+C+GND)",
                    test_voltage: '',
                    frequency: '',
                    duration: '',
                    assessment: '',
                    condition_indicator: ''
                },
                {
                    measurement: "Phase C-(A+B+GND)",
                    test_voltage: '',
                    frequency: '',
                    duration: '',
                    assessment: '',
                    condition_indicator: ''
                }
            ]
            return {
                row_data: [],
                measurementProcedure: [],
                table
            }
        },
        async initDcVoltageInsulation() {
            let table = [
                {
                    measurement: "Phase A-(B+C+GND)",
                    test_voltage: '',
                    leakage: '',
                    duration: '',
                    assessment: '',
                    condition_indicator: ''
                },
                {
                    measurement: "Phase B-(A+C+GND)",
                    test_voltage: '',
                    leakage: '',
                    duration: '',
                    assessment: '',
                    condition_indicator: ''
                },
                {
                    measurement: "Phase C-(A+B+GND)",
                    test_voltage: '',
                    leakage: '',
                    duration: '',
                    assessment: '',
                    condition_indicator: ''
                }
            ]
            return {
                row_data: [],
                measurementProcedure: [],
                table
            }
        },
        async initVlfTest() {
            let table = [
                {
                    measurement: "Phase A-(B+C+GND)",
                    test_voltage: '',
                    leakage: '',
                    assessment: '',
                    condition_indicator: ''
                },
                {
                    measurement: "Phase B-(A+C+GND)",
                    test_voltage: '',
                    leakage: '',
                    assessment: '',
                    condition_indicator: ''
                },
                {
                    measurement: "Phase C-(A+B+GND)",
                    test_voltage: '',
                    leakage: '',
                    assessment: '',
                    condition_indicator: ''
                }
            ]
            return {
                row_data: [],
                measurementProcedure: [],
                vlfSetting: {},
                table
            }
        },
        async initTandeltaVlfSource() {
            let table = []
            for (let i = 0; i < 9; i++) {
                let data = {
                    measurement: "Phase A-(B+C+GND)",
                    test_voltage_label: "0.5",
                    test_voltage: '',
                    capacitance: '',
                    mtd: '',
                    dtd_eachstep: '',
                    dtdu: '',
                    tdts: '',
                    assessment: '',
                    condition_indicator: ''
                }
                if (i % 3 == 0) {
                    data.test_voltage_label = '0.5'
                } else if (i % 3 == 1) {
                    data.test_voltage_label = '1.0'
                } else {
                    data.test_voltage_label = '1.5'
                }
                if (i / 3 == 1) {
                    data.measurement = "Phase B-(A+C+GND)"
                }
                else if (i / 3 == 2) {
                    data.measurement = "Phase C-(A+B+GND)"
                }
                table.push(data)
            }
            return {
                row_data: [],
                measurementProcedure: [],
                vlfSetting: {},
                table
            }
        },
        async initTandeltaPowerAcSource() {
            let table = [
                {
                    measurement: "Phase A-(B+C+GND)",
                    test_voltage: '',
                    frequency: '',
                    duration: '',
                    tandelta: '',
                    assessment: '',
                    condition_indicator: ''
                },
                {
                    measurement: "Phase B-(A+C+GND)",
                    test_voltage: '',
                    frequency: '',
                    duration: '',
                    tandelta: '',
                    assessment: '',
                    condition_indicator: ''
                },
                {
                    measurement: "Phase C-(A+B+GND)",
                    test_voltage: '',
                    frequency: '',
                    duration: '',
                    tandelta: '',
                    assessment: '',
                    condition_indicator: ''
                }
            ]
            return {
                row_data: [],
                measurementProcedure: [],
                table
            }
        },
        async initParticalDischarge() {
            let table = []
            return {
                row_data: [],
                measurementProcedure: [],
                table
            }
        },
        async initGeneralInspection() {
            let table = []
            const data = ['Nameplate', 'Installation check', 'Insulation surface', 'Ground frame', 'Terminal box', 'Marking of terminals', 'Oil check']
            data.forEach(element => {
                table.push({
                    items: element,
                    assessment: '',
                    condition_indicator: ''
                })
            })
            return {
                row_data: [],
                measurementProcedure: [],
                table
            }
        }
    }
}