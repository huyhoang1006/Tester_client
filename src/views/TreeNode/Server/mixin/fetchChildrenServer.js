import Vue from 'vue'
import * as demoAPI from '@/api/demo'
import * as jobAPI from '@/api/demo/Job.js'

const expectRows = (rows, endpoint) => {
    if (!Array.isArray(rows)) {
        throw new Error(`${endpoint} returned an invalid response: expected a list of nodes.`)
    }
    return rows
}

export default {
    methods: {
        async fetchChildrenServer(node) {
            if (!node.children || node.childrenLoadError) {
                try {
                    let newRows = []
                    let failed = false
                    const reportFailure = error => {
                        if (error.response && error.response.status === 403) return
                        failed = true
                        console.error('Failed to load server tree children:', error)
                        if (!error.apiFailureNotified && !error.apiFailureKind) {
                            this.$message.error(error.message || 'Invalid response from server')
                        }
                    }
                    if (node.mode == 'organisation') {
                        // Mỗi lệnh gọi một try/catch riêng, giống các nhánh bên dưới. Trước đây hai lệnh
                        // dùng chung khối try ngoài cùng: thiếu quyền xem trạm (403) là văng ra ngoài, bỏ
                        // luôn danh sách tổ chức con vừa lấy được, node không mở ra được nữa.
                        try {
                            const newRowsOwner = expectRows(await demoAPI.getChildOrganisation(node.id), 'Child organisations')
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
                            reportFailure(error)
                        }
                        // Thiếu quyền SUBSTATION_LIST thì máy chủ trả 403: coi như không có trạm.
                        try {
                            const newRowsSubstation = expectRows(await demoAPI.getChildSubstation(node.id), 'Child substations')
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
                            reportFailure(error)
                        }
                    } else if (node.mode == 'substation') {
                        try {
                            const newRowsBay = expectRows(await demoAPI.getChildBay(node.id), 'Child bays')
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
                            reportFailure(error)
                        }
                        try {
                            const newRowsVoltageLevel = expectRows(await demoAPI.getVoltageLevelBySubstationId(node.id), 'Child voltage levels')
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
                            reportFailure(error)
                        }

                        try {
                            const newRowsAsset = expectRows(await demoAPI.getAssetByOwner(node.mrid, 'Substation'), 'Substation assets')
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
                            reportFailure(error)
                        }
                    } else if (node.mode == 'voltageLevel') {
                        try {
                            const newRowsBay = expectRows(await demoAPI.getBayByVoltageLevel(node.id), 'Voltage-level bays')
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
                            reportFailure(error)
                        }
                    } else if (node.mode == 'bay') {
                        try {
                            const newRowsAsset = expectRows(await demoAPI.getAssetByOwner(node.mrid, 'Bay'), 'Bay assets')
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
                            reportFailure(error)
                        }
                    } else if (node.mode == 'asset') {
                        // Tests are direct asset children; hidden work containers are not tree nodes.
                        try {
                            const tests = expectRows(await jobAPI.getTestsByAsset(node.asset, node.mrid || node.id), 'Asset tests')
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
                            reportFailure(error)
                        }
                    }

                    Vue.set(node, 'childrenLoadError', failed)
                    Vue.set(node, 'children', newRows)
                } catch (error) {
                    console.error('Lỗi khi lấy dữ liệu:', error)
                    Vue.set(node, 'childrenLoadError', true)
                    if (!error.apiFailureNotified && !error.apiFailureKind) {
                        this.$message.error(error.message || 'Failed to load server tree')
                    }
                }
            }
        },
    }
}
