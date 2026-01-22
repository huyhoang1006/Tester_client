import Vue from 'vue'
import * as demoAPI from '@/api/demo'
export default {
    methods: {
        async fetchChildrenServer(node) {
            if (!node.children) {
                try {
                    let newRows = []
                    if (node.mode == 'organisation') {
                        const newRowsOwner = await demoAPI.getChildOrganisation(node.id)
                        console.log('newRowsOwner', newRowsOwner)
                        if (newRowsOwner && newRowsOwner.length > 0) {
                            newRowsOwner.forEach((row) => {
                                row.id = row.mrid || row.id || ''
                                row.name = row.name || ''
                                row.aliasName = row.shortName || row.name || ''
                                row.parentId = node.mrid
                                row.mode = 'organisation'
                                row.parentName = node.parentName + '/' + node.name
                                row.parentArr = [...node.parentArr]
                                row.parentArr.push({
                                    id: node.id,
                                    parent: node.name
                                })
                            })
                            newRows.push(...newRowsOwner)
                        }
                        const newRowsSubstation = await demoAPI.getChildSubstation(node.id)
                        console.log('newRowsSubstation', newRowsSubstation)
                        if (newRowsSubstation && newRowsSubstation.length > 0) {
                            newRowsSubstation.forEach((row) => {
                                row.id = row.mrid || row.id || ''
                                row.name = row.name || ''
                                row.aliasName = row.shortName || row.name || ''
                                row.parentId = node.mrid
                                row.mode = 'substation'
                                row.parentName = node.parentName + '/' + node.name
                                row.parentArr = [...node.parentArr]
                                row.parentArr.push({
                                    id: node.id,
                                    parent: node.name
                                })
                            })
                            newRows.push(...newRowsSubstation)
                        }
                    } else if (node.mode == 'substation') {
                        try {
                            const newRowsBay = await demoAPI.getChildBay(node.id)
                            console.log('newRowsBay', newRowsBay)
                            if (newRowsBay && newRowsBay.length > 0) {
                                newRowsBay.forEach((row) => {
                                    row.id = row.mrid || row.id || ''
                                    row.name = row.name || ''
                                    row.aliasName = row.shortName || row.name || ''
                                    row.parentId = node.mrid
                                    row.mode = 'bay'
                                    row.parentName = node.parentName + '/' + node.name
                                    row.parentArr = [...node.parentArr]
                                    row.parentArr.push({
                                        id: node.id,
                                        parent: node.name
                                    })
                                })
                                newRows.push(...newRowsBay)
                            }
                        } catch (error) {
                            console.log(error)
                        }
                        try {
                            const newRowsVoltageLevel = await demoAPI.getVoltageLevelBySubstationId(node.id)
                            if (newRowsVoltageLevel && newRowsVoltageLevel.length > 0) {
                                newRowsVoltageLevel.forEach((row) => {
                                    row.id = row.mrid || row.id || ''
                                    row.name = row.name || ''
                                    row.aliasName = row.shortName || row.name || ''
                                    row.parentId = node.mrid
                                    row.mode = 'voltageLevel'
                                    row.parentName = node.parentName + '/' + node.name
                                    row.parentArr = [...node.parentArr]
                                    row.parentArr.push({
                                        id: node.id,
                                        parent: node.name
                                    })
                                })
                                newRows.push(...newRowsVoltageLevel)
                            }
                        } catch (error) {
                            console.log(error)
                        }

                        try {
                            const newRowsVoltageLevel = await demoAPI.getAssetByOwner(node.mrid, 'Substation')
                            if (newRowsVoltageLevel && newRowsVoltageLevel.length > 0) {
                                newRowsVoltageLevel.forEach((row) => {
                                    row.id = row.mrid || row.id || ''
                                    row.name = row.name || ''
                                    row.aliasName = row.shortName || row.name || ''
                                    row.parentId = node.mrid
                                    row.mode = 'asset'
                                    row.parentName = node.parentName + '/' + node.name
                                    row.parentArr = [...node.parentArr]
                                    row.parentArr.push({
                                        id: node.id,
                                        parent: node.name
                                    })
                                })
                                newRows.push(...newRowsVoltageLevel)
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    } else if (node.mode == 'voltageLevel') {
                        try {
                            const newRowsBay = await demoAPI.getBayByVoltageLevel(node.id)
                            if (newRowsBay && newRowsBay.length > 0) {
                                newRowsBay.forEach((row) => {
                                    row.id = row.mrid || row.id || ''
                                    row.name = row.name || ''
                                    row.aliasName = row.shortName || row.name || ''
                                    row.parentId = node.mrid
                                    row.mode = 'bay'
                                    row.parentName = node.parentName + '/' + node.name
                                    row.parentArr = [...node.parentArr]
                                    row.parentArr.push({
                                        id: node.id,
                                        parent: node.name
                                    })
                                })
                                newRows.push(...newRowsBay)
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    } else if (node.mode == 'bay') {
                        try {
                            const newRowsVoltageLevel = await demoAPI.getAssetByOwner(node.mrid, 'Bay')
                            if (newRowsVoltageLevel && newRowsVoltageLevel.length > 0) {
                                newRowsVoltageLevel.forEach((row) => {
                                    row.id = row.mrid || row.id || ''
                                    row.name = row.name || ''
                                    row.aliasName = row.shortName || row.name || ''
                                    row.parentId = node.mrid
                                    row.mode = 'asset'
                                    row.serial_number = row.serialNumber
                                    row.parentName = node.parentName + '/' + node.name
                                    row.parentArr = [...node.parentArr]
                                    row.parentArr.push({
                                        id: node.id,
                                        parent: node.name
                                    })
                                })
                                newRows.push(...newRowsVoltageLevel)
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