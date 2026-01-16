import * as rootOrganisationFunc from './organisationRoot/index'
import * as procedureFunc from './procedure/index'
import db from '@/function/datacontext/index'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

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
    const currentVersionTest = 1
    const nameProcedure = 'procedure.json'
    const userDataPath = app.getPath('userData')
    const procedurePath = path.join(userDataPath, nameProcedure)
    if (!fs.existsSync(procedurePath)) {
        try {
            await procedureFunc.createProcedure(db)
            const defaultData = {
                createdAt: new Date().toISOString(),
                version: currentVersionTest
            }
            fs.writeFileSync(
                procedurePath,
                JSON.stringify(defaultData, null, 2),
                'utf-8'
            )
        } catch (err) {
            app.quit()
            console.error('Error creating procedure file:', err)
        }
    } else {
        const fileData = fs.readFileSync(procedurePath, 'utf-8')
        const procedureData = JSON.parse(fileData)
        if (procedureData.version === currentVersionTest) {
            try {
                await procedureFunc.createProcedure(db)
            } catch (err) {
                app.quit()
                console.error('Error updating procedure:', err)
            }
        }
    }
}

export const active = async () => {
    await createRootOrganisation()
    await updateProcedure()
}