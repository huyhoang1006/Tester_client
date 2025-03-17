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
                case 'CTRatio':
                    data = await this.initCTRatio()
                    break
                case 'CTExcitation':
                    data = await this.initCTExcitation()
                    break
                case 'CTWindingRes':
                    data = await this.initCTWindingRes()
                    break
                case 'CTDfcap':
                    data = await this.initCTDfcap()
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
                    measurement : "Prim - (Sec + GND)",
                    test_voltage : '',
                    r60s : '',
                    assessment : '',
                    condition_indicator : ''
                }
            ]
            let data = JSON.parse(this.selectedAsset[0].config)
            for(let element of data.dataCT) {
                table.push({
                    measurement : "(" +element.fullTap.table.name + ") - GND",
                    test_voltage : '',
                    r60s : '',
                    assessment : '',
                    condition_indicator : ''
                })
                for(let index of element.mainTap.data) {
                    table.push({
                        measurement : "(" +index.table.name + ") - GND",
                        test_voltage : '',
                        r60s : '',
                        assessment : '',
                        condition_indicator : ''
                    })
                }
                for(let index of element.interTap.data) {
                    table.push({
                        measurement : "(" +index.table.name + ") - GND",
                        test_voltage : '',
                        r60s : '',
                        assessment : '',
                        condition_indicator : ''
                    })
                }
            }
            return {
                table
            }
        },
        async initCTRatio() {
            let table = []
            let data = JSON.parse(this.selectedAsset[0].config)
            for(let element of data.dataCT) {
                console.log(element)
                table.push({
                    name : element.fullTap.table.name,
                    ipr : element.fullTap.table.ipn,
                    isr : element.fullTap.table.isn,
                    ratio_meas : '',
                    ratio_dev : '',
                    polarity : '',
                    assessment : '',
                    condition_indicator : ''
                })
                for(let index of element.mainTap.data) {
                    table.push({
                        name : index.table.name,
                        ipr : index.table.ipn,
                        isr : index.table.isn,
                        ratio_meas : '',
                        ratio_dev : '',
                        polarity : '',
                        assessment : '',
                        condition_indicator : ''
                    })
                }
                for(let index of element.interTap.data) {
                    table.push({
                        name : index.table.name,
                        ipr : index.table.ipn,
                        isr : index.table.isn,
                        ratio_meas : '',
                        ratio_dev : '',
                        polarity : '',
                        assessment : '',
                        condition_indicator : ''
                    })
                }
            }
            return {
                table
            }
        },
        async initCTExcitation() {
            let table = []
            let data = JSON.parse(this.selectedAsset[0].config)
            for(let element of data.dataCT) {
                console.log(element)
                table.push({
                    name : element.fullTap.table.name,
                    iknee : '',
                    vknee : '',
                    assessment : '',
                    condition_indicator : ''
                })
                for(let index of element.mainTap.data) {
                    table.push({
                        name : index.table.name,
                        iknee : '',
                        vknee : '',
                        assessment : '',
                        condition_indicator : ''
                    })
                }
                for(let index of element.interTap.data) {
                    table.push({
                        name : index.table.name,
                        iknee : '',
                        vknee : '',
                        assessment : '',
                        condition_indicator : ''
                    })
                }
            }
            return {
                table
            }
        },
        async initCTWindingRes() {
            let table = []
            let data = JSON.parse(this.selectedAsset[0].config)
            for(let element of data.dataCT) {
                console.log(element)
                table.push({
                    name : element.fullTap.table.name,
                    rmeas : '',
                    rref : '',
                    rcorr : '',
                    rdev : '',
                    assessment : '',
                    condition_indicator : ''
                })
                for(let index of element.mainTap.data) {
                    table.push({
                        name : index.table.name,
                        rmeas : '',
                        rref : '',
                        rcorr : '',
                        rdev : '',
                        assessment : '',
                        condition_indicator : ''
                    })
                }
                for(let index of element.interTap.data) {
                    table.push({
                        name : index.table.name,
                        rmeas : '',
                        rref : '',
                        rcorr : '',
                        rdev : '',
                        assessment : '',
                        condition_indicator : ''
                    })
                }
            }
            return {
                table
            }
        },
        async initCTDfcap() {
            let table = [
                {
                    measurement : "C H-G",
                    testMode : 'GST',
                    test_voltage : '',
                    dfref : '',
                    cref : '',
                    dfmeas : '',
                    cmeas : '',
                    ccal : '',
                    assessment : '',
                    condition_indicator : ''
                }
            ]
            return {
                table
            }
        },
        async initGeneralInspection() {
            let table = []
            const data = ['Nameplate', 'Installation check', 'Insulation surface', 'Ground frame', 'Terminal box', 'Marking of terminals', 'Oil check']
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
