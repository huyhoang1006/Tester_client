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
                        // JOB là cấp cuối của cây. Trước đây cây server dừng ở thiết bị,
                        // nên không có cách nào chọn một job trên server để tải về —
                        // luồng job chỉ đi một chiều lên.
                        //
                        // Chỉ lấy phần tóm tắt, không kèm bài test: một thiết bị có thể
                        // có vài chục job, mà màn hình này chỉ hiện tên và ngày.
                        try {
                            const jobs = await jobAPI.getJobsByAsset(node.asset, node.mrid)
                            console.log('Fetched jobs of asset:', jobs)
                            if (jobs && jobs.length > 0) {
                                jobs.forEach((row) => {
                                    row.id = row.id || row.mrid || ''
                                    row.mrid = row.mrid || row.id || ''
                                    row.name = row.name || ''
                                    row.aliasName = row.name || row.mrid || ''
                                    row.parentId = node.mrid
                                    row.mode = 'job'
                                    // `job` giữ NHÃN LOẠI THIẾT BỊ, không phải loại job.
                                    // Tầng tải xuống dựa vào đây để chọn đúng mapper —
                                    // giống hệt cách `asset` được dùng ở cấp trên.
                                    row.job = node.asset || ''
                                    row.isLeaf = true
                                    row.parentName = node.parentName + '/' + node.name
                                    row.parentArr = [...node.parentArr]
                                    row.parentArr.push({
                                        mrid: node.mrid,
                                        id: node.id,
                                        parent: node.aliasName || node.name,
                                        mode: node.mode,
                                        asset: node.asset || null
                                    })
                                })
                                newRows.push(...jobs)
                            }
                        } catch (error) {
                            // Nuốt lỗi có chủ ý, giống các nhánh trên: server chưa bật
                            // job-service thì cây vẫn phải mở được tới thiết bị.
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
