import Vue from 'vue'
import * as demoAPI from '@/api/demo'
import * as jobAPI from '@/api/demo/Job.js'
export default {
    methods: {
        async fetchChildrenServer(node) {
            if (!node.children) {
                try {
                    let newRows = []
                    if (node.mode == 'organisation') {
                        // Mỗi lệnh gọi một try/catch riêng, giống các nhánh bên dưới. Trước đây hai lệnh
                        // dùng chung khối try ngoài cùng: thiếu quyền xem trạm (403) là văng ra ngoài, bỏ
                        // luôn danh sách tổ chức con vừa lấy được, node không mở ra được nữa.
                        try {
                            const newRowsOwner = await demoAPI.getChildOrganisation(node.id)
                            console.log('Fetched child organisations:', newRowsOwner)
                            if (newRowsOwner && newRowsOwner.length > 0) {
                                newRowsOwner.forEach((row) => {
                                    row.id = row.id || row.mrid || ''
                                    row.mrid = row.mrid || row.id || ''
                                    row.name = row.name || ''
                                    row.aliasName = row.shortName || row.name || ''
                                    row.parentId = node.mrid
                                    row.mode = 'organisation'
                                    row.parentName = node.parentName + '/' + node.name
                                    row.parentArr = [...node.parentArr]
                                    row.parentArr.push({
                                        mrid: node.mrid,
                                        id: node.id,
                                        parent: node.aliasName || node.name,
                                        mode: node.mode
                                    })
                                })
                                newRows.push(...newRowsOwner)
                            }
                        } catch (error) {
                            console.log(error)
                        }
                        // Thiếu quyền SUBSTATION_LIST thì máy chủ trả 403: coi như không có trạm.
                        try {
                            const newRowsSubstation = await demoAPI.getChildSubstation(node.id)
                            console.log('Fetched child substations:', newRowsSubstation)
                            if (newRowsSubstation && newRowsSubstation.length > 0) {
                                newRowsSubstation.forEach((row) => {
                                    row.id = row.id || row.mrid || ''
                                    row.mrid = row.mrid || row.id || ''
                                    row.name = row.name || ''
                                    row.aliasName = row.shortName || row.name || ''
                                    row.parentId = node.mrid
                                    row.mode = 'substation'
                                    row.parentName = node.parentName + '/' + node.name
                                    row.parentArr = [...node.parentArr]
                                    row.parentArr.push({
                                        mrid: node.mrid,
                                        id: node.id,
                                        parent: node.aliasName || node.name,
                                        mode: node.mode
                                    })
                                })
                                newRows.push(...newRowsSubstation)
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    } else if (node.mode == 'substation') {
                        try {
                            const newRowsBay = await demoAPI.getChildBay(node.id)
                            console.log('Fetched child bays:', newRowsBay)
                            if (newRowsBay && newRowsBay.length > 0) {
                                newRowsBay.forEach((row) => {
                                    row.id = row.id || row.mrid || ''
                                    row.mrid = row.mrid || row.id || ''
                                    row.name = row.name || ''
                                    row.aliasName = row.shortName || row.name || ''
                                    row.parentId = node.mrid
                                    row.mode = 'bay'
                                    row.parentName = node.parentName + '/' + node.name
                                    row.parentArr = [...node.parentArr]
                                    row.parentArr.push({
                                        mrid: node.mrid,
                                        id: node.id,
                                        parent: node.aliasName || node.name,
                                        mode: node.mode
                                    })
                                })
                                newRows.push(...newRowsBay)
                            }
                        } catch (error) {
                            console.log(error)
                        }
                        try {
                            const newRowsVoltageLevel = await demoAPI.getVoltageLevelBySubstationId(node.id)
                            console.log('Fetched child voltage levels:', newRowsVoltageLevel)
                            if (newRowsVoltageLevel && newRowsVoltageLevel.length > 0) {
                                newRowsVoltageLevel.forEach((row) => {
                                    row.id = row.id || row.mrid || ''
                                    row.mrid = row.mrid || row.id || ''
                                    row.name = row.name || ''
                                    row.aliasName = row.shortName || row.name || ''
                                    row.parentId = node.mrid
                                    row.mode = 'voltageLevel'
                                    row.parentName = node.parentName + '/' + node.name
                                    row.parentArr = [...node.parentArr]
                                    row.parentArr.push({
                                        mrid: node.mrid,
                                        id: node.id,
                                        parent: node.aliasName || node.name,
                                        mode: node.mode
                                    })
                                })
                                newRows.push(...newRowsVoltageLevel)
                            }
                        } catch (error) {
                            console.log(error)
                        }

                        try {
                            const newRowsAsset = await demoAPI.getAssetByOwner(node.mrid, 'Substation')
                            console.log('Fetched child assets of substation:', newRowsAsset)
                            if (newRowsAsset && newRowsAsset.length > 0) {
                                newRowsAsset.forEach((row) => {
                                    row.id = row.id || row.mrid || ''
                                    row.mrid = row.mrid || row.id || ''
                                    row.apparatus_id = row.apparatus_id || row.apparatusId || ''
                                    row.serial_number = row.serial_number || row.serialNumber || ''
                                    row.name = row.name || ''
                                    row.aliasName = row.shortName || row.name || ''
                                    row.parentId = node.mrid
                                    row.mode = 'asset'
                                    row.asset = row.asset || row.assetType || row.assetKind || ''
                                    row.parentName = node.parentName + '/' + node.name
                                    row.parentArr = [...node.parentArr]
                                    row.parentArr.push({
                                        mrid: node.mrid,
                                        id: node.id,
                                        parent: node.aliasName || node.name,
                                        mode: node.mode
                                    })
                                })
                                newRows.push(...newRowsAsset)
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    } else if (node.mode == 'voltageLevel') {
                        try {
                            const newRowsBay = await demoAPI.getBayByVoltageLevel(node.id)
                            console.log('Fetched child bays of voltage level:', newRowsBay)
                            if (newRowsBay && newRowsBay.length > 0) {
                                newRowsBay.forEach((row) => {
                                    row.id = row.id || row.mrid || ''
                                    row.mrid = row.mrid || row.id || ''
                                    row.name = row.name || ''
                                    row.aliasName = row.shortName || row.name || ''
                                    row.parentId = node.mrid
                                    row.mode = 'bay'
                                    row.parentName = node.parentName + '/' + node.name
                                    row.parentArr = [...node.parentArr]
                                    row.parentArr.push({
                                        mrid: node.mrid,
                                        id: node.id,
                                        parent: node.aliasName || node.name,
                                        mode: node.mode
                                    })
                                })
                                newRows.push(...newRowsBay)
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    } else if (node.mode == 'bay') {
                        try {
                            const newRowsAsset = await demoAPI.getAssetByOwner(node.mrid, 'Bay')
                            console.log('Fetched child assets of bay:', newRowsAsset)
                            if (newRowsAsset && newRowsAsset.length > 0) {
                                newRowsAsset.forEach((row) => {
                                    row.id = row.id || row.mrid || ''
                                    row.mrid = row.mrid || row.id || ''
                                    row.apparatus_id = row.apparatus_id || row.apparatusId || ''
                                    row.serial_number = row.serial_number || row.serialNumber || ''
                                    row.name = row.name || ''
                                    row.aliasName = row.shortName || row.name || ''
                                    row.parentId = node.mrid
                                    row.mode = 'asset'
                                    row.asset = row.asset || row.assetType || row.assetKind || ''
                                    row.parentName = node.parentName + '/' + node.name
                                    row.parentArr = [...node.parentArr]
                                    row.parentArr.push({
                                        mrid: node.mrid,
                                        id: node.id,
                                        parent: node.aliasName || node.name,
                                        mode: node.mode
                                    })
                                })
                                newRows.push(...newRowsAsset)
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    } else if (node.mode == 'asset') {
                        // Tests are direct asset children; hidden work containers are not tree nodes.
                        try {
                            const tests = await jobAPI.getTestsByAsset(node.asset, node.mrid || node.id)
                            if (tests && tests.length > 0) {
                                tests.forEach((row) => {
                                    row.id = row.mrid || row.id || ''
                                    row.mrid = row.mrid || row.id || ''
                                    row.name = row.name || row.testTypeCode || 'Unnamed test'
                                    row.aliasName = row.name || row.mrid || ''
                                    row.parentId = node.mrid || node.id
                                    row.mode = 'test'
                                    row.job = node.asset || ''
                                    row.testing_date = row.testingDate || ''
                                    row.execution_date = row.testing_date
                                    row.isLeaf = true
                                    row.parentName = node.parentName + '/' + node.name
                                    row.parentArr = [...(node.parentArr || [])]
                                    row.parentArr.push({
                                        mrid: node.mrid,
                                        id: node.id,
                                        parent: node.aliasName || node.name,
                                        mode: node.mode,
                                        asset: node.asset || null
                                    })
                                })
                                newRows.push(...tests)
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    }

                    Vue.set(node, 'children', newRows)
                } catch (error) {
                    console.error('Lỗi khi lấy dữ liệu:', error)
                }
            }
        },
    }
}
