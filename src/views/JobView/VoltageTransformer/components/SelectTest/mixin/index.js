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
                case 'VTRatio':
                    data = await this.initVTRatio()
                    break
                case 'DcWindingRes':
                    data = await this.initDcWindingRes()
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
            let winding = JSON.parse(this.selectedAsset[0].config).windings
            for(let i=1; i<=parseInt(winding); i++) {
                table.push({
                    measurement : "(" + i +"a" + i + "n" + ")" + " - GND",
                    test_voltage : '',
                    r60s : '',
                    assessment : '',
                    condition_indicator : ''
                })
            }
            return {
                table
            }
        },
        async initVTRatio() {
            function uprData(uprRatio, upr) {
                if(uprRatio == ' / √3') {
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
                if(uprRatio == '3sqrt') {
                    return ' / √3'
                } else if(uprRatio == '3') {
                    return ' / 3'
                } else {
                    return ''
                }
            }
            function usrRatioData(usrRatio) {
                if(usrRatio == '3sqrt') {
                    return ' / √3'
                } else if(usrRatio == '3') {
                    return ' / 3'
                } else {
                    return ''
                }
            }
            function usrData(usrRatio, usr) {
                if(usrRatio == ' / √3') {
                    let data = parseFloat(usr) / (Math.sqrt(parseFloat(3)))
                    return data
                } else if (usrRatio == ' / 3') {
                    let data = parseFloat(usr) / parseFloat(3)
                    return data
                } else {
                    return parseFloat(usr)
                }
            }

            let table = []
            let winding = JSON.parse(this.selectedAsset[0].config).windings
            let dataVT = JSON.parse(this.selectedAsset[0].config).dataVT
            let ratings = JSON.parse(this.selectedAsset[0].ratings)

            let uprRatio = uprRatioData(ratings.uprRatio)
            let upr = ratings.upr + ' ' + uprRatio
            let uprValue = uprData(uprRatio, upr)

            for(let i=1; i<=parseInt(winding); i++) {
                let usrRatio = usrRatioData(dataVT[i-1].table.usrRatio)
                let usr = dataVT[i-1].table.usr + usrRatio
                let usrValue = usrData(usrRatio, dataVT[i-1].table.usr)
                table.push({
                    name : "(" + i +"a" + i + "n" + ")" + " - GND",
                    upr : upr,
                    usr : usr,
                    ratio_meas : '',
                    ratio_dev : '',
                    polarity : '',
                    assessment : '',
                    condition_indicator : '',
                    uprValue : uprValue,
                    usrValue : usrValue
                })
            }
            return {
                table
            }
        },
        
        async initDcWindingRes() {
            let table = []
            let winding = JSON.parse(this.selectedAsset[0].config).windings
            for(let i=1; i<=parseInt(winding); i++) {
                table.push({
                    name : i +"a" + i + "n",
                    rmeas : '',
                    rref : '',
                    rcorr : '',
                    rdev : '',
                    assessment : '',
                    condition_indicator : ''
                })
            }
            return {
                table
            }
        },
        async initVTDfcap() {
            return {
                table : []
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
