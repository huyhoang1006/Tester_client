import { mapState } from 'vuex'

export default {
    data() {
        return {}
    },
    computed: mapState(['selectedAsset', 'selectedJob']),
    async beforeMount() {},
    methods: {
        async initTest(testTypeCode) {
            let data = null
            switch (testTypeCode) {
                case 'InsulationResistance':
                    data = this.initInsulationResistance()
                    break
                case 'GeneralInspection':
                    data = await this.initGeneralInspection()
                    break
                case 'LeakageCurrent':
                    data = await this.initLeakageCurrent()
                    break
                case 'PowerFrequency':
                    data = await this.initPowerFrequency()
                    break
            }

            return data
        },
        async initInsulationResistance() {
            let table = [
                {
                    measurement : "Phase A - GND",
                    vTest : '',
                    r60s : "",
                    assessment : '',
                    condition_indicator : ''
                },
                {
                    measurement : "Phase B - GND",
                    vTest : '',
                    r60s : "",
                    assessment : '',
                    condition_indicator : ''
                },
                {
                    measurement : "Phase C - GND)",
                    vTest : '',
                    r60s : "",
                    assessment : '',
                    condition_indicator : ''
                },
                {
                    measurement : "Base - GND)",
                    vTest : '',
                    r60s : "",
                    assessment : '',
                    condition_indicator : ''
                }
            ]
            return {
                table
            }
        },
        async initLeakageCurrent() {
            let units = parseInt(JSON.parse(this.selectedAsset[0].ratings).unitStack)
            let phase = ["A", "B", "C"]
            let table = []
            for(let i in phase) {
                for(let j = 1; j <= units; j ++) {
                    let data = {
                        phase : phase[i],
                        unit_no : j
                    }
                    table.push(data)
                }
            }
            return {
                table
            }
        },
        async initPowerFrequency() {
            let units = parseInt(JSON.parse(this.selectedAsset[0].ratings).unitStack)
            let phase = ["A", "B", "C"]
            let table = []
            for(let i in phase) {
                for(let j = 1; j <= units; j ++) {
                    let data = {
                        phase : phase[i],
                        unit_no : j
                    }
                    table.push(data)
                }
            }
            return {
                table
            }
        },
        async initGeneralInspection() {
            let table = []
            const data = ['Nameplate', 'Installation check', 'Grounding check', 'Discharge counter check']
            data.forEach(element => {
                table.push({
                    items : element,
                    assessment : '',
                    condition_indicator : ''
                })
            })
            return {
                table
            }
        }
    }
}
