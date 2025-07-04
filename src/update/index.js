import * as updateManu from './updateDatabase/updateManu'
import * as updatOwner from './updateDatabase/updateOwner'
import * as updateLocation from './updateDatabase/updateLocationRef'
import * as updateTestType from './updateDatabase/updateTestType'
import * as rootOrganisationFunc from './organisationRoot/index'
import {insertOwner, getOwnerByName} from '@/function/organisation/index'
import { NIL as EMPTY } from 'uuid'
import db from '@/function/datacontext/index'

export const updateManufacturer = async () => {
    var row = await updateManu.getAllNameDatabase(db)
    var sign = false
    for(let i in row) {
        if(row[i].name == 'manufacturer_custom') {
            sign = true
            break
        }
    }

    if(sign == false) {
        var check = await updateManu.createManufacturer(db)
        console.log(check)
    }
}

export const updateOwnerTable = async () => {
    var row = await updateManu.getAllNameDatabase(db)
    var sign = false
    for(let i in row) {
        if(row[i].name == 'owner') {
            sign = true
            break
        }
    }

    if(sign == false) {
        var check = await updatOwner.createOwner(db)
        if(check == true) {
            var dataOwner = {
                name : 'root',
                user_id : EMPTY
            }
            var is = await insertOwner(dataOwner)
            if(is.success) {
                return 'owner success'
            }
            
        }
    } else {
        var rt = await getOwnerByName("root")
        if(rt.success) {
            if(rt.data.length == 0) {
                var dataOwner = {
                    name : 'root',
                    user_id : EMPTY
                }
                var is = await insertOwner(dataOwner)
                if(is.success) {
                    return 'owner success'
                }
            }
        }
    }
}

export const insertTestType = async () => {
    var data = await updateTestType.checkValueInTable(db, 'test_types', 'code', '"GasChromatography"')
    if(data.success) {
        if(data.data.length <= 0) {
            updateTestType.insertValueToColumn(db, 'test_types', ['id', 'code', 'name'], ['"f27e1f3c-cc10-47a4-9a56-eca62df00672"', "'GasChromatography'", "'Gas Chromatography'"])
        }
    }
} 

export const updateLocationTable = async () => {
    var rows = await updateLocation.getNameOfColumn(db, 'locations')
    var sign = false
    var rt = {}
    if(rows.success) {
        var key = rows.data.map(e => e.name)
        if(key.includes("owner_id")) {
            sign = false
        } else {
            rt = await updateLocation.insertColumn(db, 'owner_id', 'locations')
        }

        if(key.includes("type")) {
            sign = false
        } else {
            rt = await updateLocation.insertColumnNotForeign(db, 'type', 'locations')
        }

        if(key.includes("department")) {
            sign = false
        } else {
            rt = await updateLocation.insertColumnNotForeign(db, 'department', 'locations')
        }

        if(key.includes("position")) {
            sign = false
        } else {
            rt = await updateLocation.insertColumnNotForeign(db, 'position', 'locations')
        }

        if(key.includes("ref_id_old")) {
            sign = false
        } else {
            rt = await updateLocation.insertColumnNotForeign(db, 'ref_id_old', 'locations')
        }

    }
    if(rt.success) {
        console.log(rt.success)
    }
}

export const createRootOrganisation = async () => {
    try {
        var check = await rootOrganisationFunc.createOrganisationRoot(db)
        if(check.success) {
            console.log('Create root organisation completed')
        } else {
            console.log('Create root organisation failed')
        }
    } catch (err) {
        console.error('Error creating root organisation:', err)
    }
}

export const active = async () => {
    await createRootOrganisation()
}

export {updateManu}