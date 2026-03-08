import CurrentTransformerTestMap from '@/config/test-definitions/CurrentTransformer'
import CurrentTransformerConditionMap from '@/config/testing-condition/CurrentTransformer'
import * as common from '../../../../Common/index.js'

export default {
    methods: {
        // eslint-disable-next-line no-unused-vars
        async initTest(testTypeCode, assetData) {
            let data = null
            switch (testTypeCode) {
                case 'InsulationResistance':
                    data = await this.initInsulationResistance(testTypeCode, assetData)
                    break
                case 'CTRatio':
                    data = await this.initCTRatio(testTypeCode, assetData)
                    break
                case 'CTExcitation':
                    data = await this.initCTExcitation(testTypeCode, assetData)
                    break
                case 'CTWindingRes':
                    data = await this.initCTWindingRes(testTypeCode, assetData)
                    break
                case 'CTDfcap':
                    data = await this.initCTDfcap(testTypeCode)
                    break
                case 'GeneralInspection':
                    data = await this.initGeneralInspection(testTypeCode)
                    break
            }

            return data
        },
        async initInsulationResistance(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(CurrentTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(CurrentTransformerConditionMap[testTypeCode].columns)
            
            let table1 = []
            
            // Hàng đầu tiên luôn là "Prim - (Sec + GND)"
            const row1 = JSON.parse(JSON.stringify(rowDataExample))
            row1.measurement.value = 'Prim - (Sec + GND)'
            table1.push(row1)
            
            // Xử lý Entity (có CtTapInfo)
            if (assetData && assetData.CtTapInfo) {
                // Lấy tất cả các tap
                assetData.CtTapInfo.forEach(tap => {
                    const row = JSON.parse(JSON.stringify(rowDataExample))
                    row.measurement.value = `${tap.tap_name || 'Unnamed'} - GND`
                    table1.push(row)
                })
            }
            // Xử lý DTO (có ctConfiguration.dataCT)
            else if (assetData && assetData.ctConfiguration && assetData.ctConfiguration.dataCT) {
                assetData.ctConfiguration.dataCT.forEach((core, coreIndex) => {
                    // Load Full tap
                    if (core.fullTap && core.fullTap.table) {
                        const row = JSON.parse(JSON.stringify(rowDataExample))
                        row.measurement.value = `${core.fullTap.table.name || `Core ${coreIndex + 1} - Full`} - GND`
                        table1.push(row)
                    }
                    
                    // Load Main taps
                    if (core.mainTap && core.mainTap.data) {
                        core.mainTap.data.forEach((tap, tapIndex) => {
                            if (tap.table) {
                                const row = JSON.parse(JSON.stringify(rowDataExample))
                                row.measurement.value = `${tap.table.name || `Core ${coreIndex + 1} - Main ${tapIndex + 1}`} - GND`
                                table1.push(row)
                            }
                        })
                    }
                    
                    // Load Inter taps
                    if (core.interTap && core.interTap.data) {
                        core.interTap.data.forEach((tap, tapIndex) => {
                            if (tap.table) {
                                const row = JSON.parse(JSON.stringify(rowDataExample))
                                row.measurement.value = `${tap.table.name || `Core ${coreIndex + 1} - Inter ${tapIndex + 1}`} - GND`
                                table1.push(row)
                            }
                        })
                    }
                })
            }
            
            // Nếu không có tap nào được load (chỉ có hàng đầu tiên), thêm 3 hàng mặc định nữa
            if (table1.length === 1) {
                const row2 = JSON.parse(JSON.stringify(rowDataExample))
                row2.measurement.value = 'Phase B - GND'
                const row3 = JSON.parse(JSON.stringify(rowDataExample))
                row3.measurement.value = 'Phase C - GND'
                const row4 = JSON.parse(JSON.stringify(rowDataExample))
                row4.measurement.value = 'Phase - GND'
                table1.push(row2, row3, row4)
            }
            
            let table = {
                'table1': table1
            }
            
            return {
                rowDataExampleCondition,
                table,
            }
        },
        async initCTRatio(testTypeCode, assetData) {
    let table1 = []
    const rowDataExample = common.buildEmptyTestRow(CurrentTransformerTestMap[testTypeCode].columns)
    const rowDataExampleCondition = common.buildEmptyTestCondition(CurrentTransformerConditionMap[testTypeCode].columns)
    
    // Helper function để tìm value từ mrid trong mảng currentFlow
    const findCurrentValue = (mrid, currentFlowArray) => {
        if (!mrid || !currentFlowArray) return ''
        const item = currentFlowArray.find(cf => cf && cf.mrid === mrid)
        return item ? (item.value || '') : ''
    }
    
    // Xử lý Entity (có CtTapInfo và currentFlow)
    if (assetData && assetData.CtTapInfo && assetData.currentFlow) {
        // Lấy tất cả các tap
        assetData.CtTapInfo.forEach(tap => {
            const row = JSON.parse(JSON.stringify(rowDataExample))
            row.name.value = tap.tap_name || 'Unnamed'
            row.ipr.value = findCurrentValue(tap.ipn, assetData.currentFlow)
            row.isr.value = findCurrentValue(tap.isn, assetData.currentFlow)
            table1.push(row)
        })
    }
    // Xử lý DTO (có ctConfiguration.dataCT)
    else if (assetData && assetData.ctConfiguration && assetData.ctConfiguration.dataCT) {
        assetData.ctConfiguration.dataCT.forEach((core, coreIndex) => {
            // Load Full tap
            if (core.fullTap && core.fullTap.table) {
                const row = JSON.parse(JSON.stringify(rowDataExample))
                row.name.value = core.fullTap.table.name || `Core ${coreIndex + 1} - Full`
                row.ipr.value = core.fullTap.table.ipn.value || ''
                row.isr.value = core.fullTap.table.isn.value || ''
                table1.push(row)
            }
            
            // Load Main taps
            if (core.mainTap && core.mainTap.data) {
                core.mainTap.data.forEach((tap, tapIndex) => {
                    if (tap.table) {
                        const row = JSON.parse(JSON.stringify(rowDataExample))
                        row.name.value = tap.table.name || `Core ${coreIndex + 1} - Main ${tapIndex + 1}`
                        row.ipr.value = tap.table.ipn.value || ''
                        row.isr.value = tap.table.isn.value || ''
                        table1.push(row)
                    }
                })
            }
            
            // Load Inter taps
            if (core.interTap && core.interTap.data) {
                core.interTap.data.forEach((tap, tapIndex) => {
                    if (tap.table) {
                        const row = JSON.parse(JSON.stringify(rowDataExample))
                        row.name.value = tap.table.name || `Core ${coreIndex + 1} - Inter ${tapIndex + 1}`
                        row.ipr.value = tap.table.ipn.value || ''
                        row.isr.value = tap.table.isn.value || ''
                        table1.push(row)
                    }
                })
            }
        })
    }
    
    // Nếu không có configuration, tạo 1 row mặc định
    if (table1.length === 0) {
        const row = JSON.parse(JSON.stringify(rowDataExample))
        row.name.value = 'Primary'
        table1.push(row)
    }
    
    let table = {
        'table1': table1
    }
    
    return {
        rowDataExampleCondition,
        table
    }
},

        async initCTExcitation(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(CurrentTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(CurrentTransformerConditionMap[testTypeCode].columns)
            
            let table1 = []
            
            // Xử lý Entity (có CtTapInfo)
            if (assetData && assetData.CtTapInfo) {
                // Lấy tất cả các tap
                assetData.CtTapInfo.forEach(tap => {
                    const row = JSON.parse(JSON.stringify(rowDataExample))
                    row.name.value = tap.tap_name || 'Unnamed'
                    table1.push(row)
                })
            }
            // Xử lý DTO (có ctConfiguration.dataCT)
            else if (assetData && assetData.ctConfiguration && assetData.ctConfiguration.dataCT) {
                assetData.ctConfiguration.dataCT.forEach((core, coreIndex) => {
                    // Load Full tap
                    if (core.fullTap && core.fullTap.table) {
                        const row = JSON.parse(JSON.stringify(rowDataExample))
                        row.name.value = core.fullTap.table.name || `Core ${coreIndex + 1} - Full`
                        table1.push(row)
                    }
                    
                    // Load Main taps
                    if (core.mainTap && core.mainTap.data) {
                        core.mainTap.data.forEach((tap, tapIndex) => {
                            if (tap.table) {
                                const row = JSON.parse(JSON.stringify(rowDataExample))
                                row.name.value = tap.table.name || `Core ${coreIndex + 1} - Main ${tapIndex + 1}`
                                table1.push(row)
                            }
                        })
                    }
                    
                    // Load Inter taps
                    if (core.interTap && core.interTap.data) {
                        core.interTap.data.forEach((tap, tapIndex) => {
                            if (tap.table) {
                                const row = JSON.parse(JSON.stringify(rowDataExample))
                                row.name.value = tap.table.name || `Core ${coreIndex + 1} - Inter ${tapIndex + 1}`
                                table1.push(row)
                            }
                        })
                    }
                })
            }
            
            // Nếu không có configuration, tạo 1 row mặc định
            if (table1.length === 0) {
                const row = JSON.parse(JSON.stringify(rowDataExample))
                row.name.value = 'Primary'
                table1.push(row)
            }
            
            let table = {
                'table1': table1
            }
            
            return {
                rowDataExampleCondition,
                table
            }
        },
        async initCTWindingRes(testTypeCode, assetData) {
            const rowDataExample = common.buildEmptyTestRow(CurrentTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(CurrentTransformerConditionMap[testTypeCode].columns)
            
            let table1 = []
            
            // Xử lý Entity (có CtTapInfo)
            if (assetData && assetData.CtTapInfo) {
                // Lấy tất cả các tap
                assetData.CtTapInfo.forEach(tap => {
                    const row = JSON.parse(JSON.stringify(rowDataExample))
                    row.name.value = tap.tap_name || 'Unnamed'
                    table1.push(row)
                })
            }
            // Xử lý DTO (có ctConfiguration.dataCT)
            else if (assetData && assetData.ctConfiguration && assetData.ctConfiguration.dataCT) {
                assetData.ctConfiguration.dataCT.forEach((core, coreIndex) => {
                    // Load Full tap
                    if (core.fullTap && core.fullTap.table) {
                        const row = JSON.parse(JSON.stringify(rowDataExample))
                        row.name.value = core.fullTap.table.name || `Core ${coreIndex + 1} - Full`
                        table1.push(row)
                    }
                    
                    // Load Main taps
                    if (core.mainTap && core.mainTap.data) {
                        core.mainTap.data.forEach((tap, tapIndex) => {
                            if (tap.table) {
                                const row = JSON.parse(JSON.stringify(rowDataExample))
                                row.name.value = tap.table.name || `Core ${coreIndex + 1} - Main ${tapIndex + 1}`
                                table1.push(row)
                            }
                        })
                    }
                    
                    // Load Inter taps
                    if (core.interTap && core.interTap.data) {
                        core.interTap.data.forEach((tap, tapIndex) => {
                            if (tap.table) {
                                const row = JSON.parse(JSON.stringify(rowDataExample))
                                row.name.value = tap.table.name || `Core ${coreIndex + 1} - Inter ${tapIndex + 1}`
                                table1.push(row)
                            }
                        })
                    }
                })
            }
            
            // Nếu không có configuration, tạo 1 row mặc định
            if (table1.length === 0) {
                const row = JSON.parse(JSON.stringify(rowDataExample))
                row.name.value = 'Primary'
                table1.push(row)
            }
            
            let table = {
                'table1': table1
            }
            
            return {
                rowDataExampleCondition,
                table
            }
        },
        async initCTDfcap(testTypeCode) {
            const rowDataExample = common.buildEmptyTestRow(CurrentTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(CurrentTransformerConditionMap[testTypeCode].columns)
            
            let table1 = []

            // 2. Clone dòng đầu tiên từ template
            const row = JSON.parse(JSON.stringify(rowDataExample))

            // 3. Gán giá trị mặc định cho cột Measurement (hoặc Name tuỳ vào file map)
            if (row.measurement) {
                row.measurement.value = 'C H-G'
            } else if (row.name) {
                row.name.value = 'C H-G'
            }

            // Gán giá trị mặc định cho cột Test Mode (theo config là test_mode)
            if (row.test_mode) {
                row.test_mode.value = 'GST'
            }

            // Đẩy dòng dữ liệu vào table
            table1.push(row)

            let table = {
                'table1': table1
            }

            // 4. Trả về đúng format chuẩn hệ thống
            return {
                rowDataExampleCondition,
                table
            }
        },
        async initGeneralInspection(testTypeCode) {
            let table1 = []
            const rowDataExample = common.buildEmptyTestRow(CurrentTransformerTestMap[testTypeCode].columns)
            const rowDataExampleCondition = common.buildEmptyTestCondition(CurrentTransformerConditionMap[testTypeCode].columns)
            
            // Sử dụng defaultRows từ JSON definition nếu có, nếu không thì dùng hardcode
            const testDefinition = CurrentTransformerTestMap[testTypeCode]
            const defaultItems = testDefinition.defaultRows 
                ? testDefinition.defaultRows.map(row => row.items)
                : ['Nameplate', 'Installation check', 'Grounding check', 'Discharge counter check']
            
            defaultItems.forEach(element => {
                const rowData = JSON.parse(JSON.stringify(rowDataExample))
                rowData.item.value = element
                table1.push(rowData)
            })
            
            let table = {
                'table1': table1
            }
            
            return {
                rowDataExampleCondition,
                table
            }
        }
    }
}
