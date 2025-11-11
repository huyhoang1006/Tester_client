import { mapState } from 'vuex'

export default {
    data() {
        return {}
    },
    computed: mapState(['selectedAsset', 'selectedJob']),
    async beforeMount() { },
    methods: {
        async initTest(testTypeCode, assetData) {
            let data = null
            switch (testTypeCode) {
                case 'InsulationResistance':
                    data = this.initInsulationResistance()
                    break
                case 'ContactResistance':
                    data = await this.initContactResistance()
                    break
                case 'InsulationResMotor':
                    data = await this.initInsulationResMotor()
                    break
                case 'DcWindingMotor':
                    data = await this.initDcWindingMotor()
                    break
                case 'OperatingTest':
                    data = await this.initOperatingTest()
                    break
                case 'ControlCheck':
                    data = await this.initControlCheck()
                    break
                case 'GeneralInspection':
                    data = await this.initGeneralInspection()
                    break
                case 'LeakageCurrent':
                    data = await this.initLeakageCurrent(assetData || {})
                    break
                case 'PowerFrequency':
                    data = await this.initPowerFrequency(assetData || {})
                    break
            }

            return data
        },
        async initInsulationResistance() {
            let table = [
                {
                    measurement: "Phase A-(B+C+GND)",
                    test_voltage: '',
                    r60s: '',
                    assessment: '',
                    condition_indicator: ''
                },
                {
                    measurement: "Phase B-(A+C+GND)",
                    test_voltage: '',
                    r60s: '',
                    assessment: '',
                    condition_indicator: ''
                },
                {
                    measurement: "Phase C-(A+B+GND)",
                    test_voltage: '',
                    r60s: '',
                    assessment: '',
                    condition_indicator: ''
                }
            ]

            return {
                table
            }
        },
        async initContactResistance() {
            let table = [
                {
                    measurement: "Main contact",
                    itest: "",
                    contactResistance: "",
                    assessment: "",
                    condition_indicator: ""
                },
                {
                    measurement: "Earth switch",
                    itest: "",
                    contactResistance: "",
                    assessment: "",
                    condition_indicator: ""
                }
            ]
            return {
                table
            }
        },

        async initInsulationResMotor() {
            let table = []
            return {
                table
            }
        },
        async initDcWindingMotor() {
            return {
                table: []
            }
        },
        async initOperatingTest() {
            let table = [
                {
                    measurement: "Main contact",
                    workingTime: "",
                    assessment: "",
                    condition_indicator: ""
                },
                {
                    measurement: "Earth switch",
                    workingTime: "",
                    assessment: "",
                    condition_indicator: ""
                }
            ]
            return {
                table
            }
        },
        async initControlCheck() {
            return {
                table: []
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
                table
            }
        }
    }
}
