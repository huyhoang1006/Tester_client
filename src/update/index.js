import * as rootOrganisationFunc from './organisationRoot/index'
import * as procedureFunc from './procedure/index'
import db from '@/function/datacontext/index'

export const createRootOrganisation = async () => {
    try {
        var check = await rootOrganisationFunc.createOrganisationRoot(db)
        if (check.success) {
            console.log('Create root organisation completed')
        } else {
            console.log('Create root organisation failed')
        }
    } catch (err) {
        console.error('Error creating root organisation:', err)
    }
}

export const updateProcedure = async () => {
    try {
        await procedureFunc.updateProcedure(db)
    } catch (err) {
        console.error('Error during update procedure:', err)
        throw err
    }
}

export const active = async () => {
    await createRootOrganisation()
}