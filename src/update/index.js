import * as rootOrganisationFunc from './organisationRoot/index'
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

export const active = async () => {
    await createRootOrganisation()
}