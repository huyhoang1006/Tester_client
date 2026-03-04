
import * as parentOrganisationFunc from '@/function/cim/parentOrganization/index'
import ParentOrganization from '@/views/Cim/ParentOrganization'
export const createOrganisationRoot = async (dbsql) => {
    const parentOrganisation = new ParentOrganization()
    parentOrganisation.mrid = '00000000-0000-0000-0000-000000000000'
    parentOrganisation.name = 'Root'
    try {
        await new Promise((resolve, reject) => {
            dbsql.run('BEGIN TRANSACTION', (err) => {
                if (err) reject(err)
                else resolve()
            })
        })
        const result = await parentOrganisationFunc.insertParentOrganizationTransaction(parentOrganisation, dbsql)
        if (!result.success) {
            await new Promise((resolve) => {
                dbsql.run('ROLLBACK', () => resolve())
            })
            throw new Error(result.err && result.err.message ? result.err.message : 'Insert failed')
        }
        await new Promise((resolve, reject) => {
            dbsql.run('COMMIT', (err) => {
                if (err) reject(err)
                else resolve()
            })
        })
        return { success: true, data: result.data, message: 'Create organisation root completed' }
    } catch (err) {
        await new Promise((resolve) => {
            dbsql.run('ROLLBACK', () => resolve())
        })
        throw { success: false, err, message: 'Create organisation root transaction failed' }
    }
}
