
import * as parentOrganisationFunc from '@/function/cim/parentOrganization/index'
import ParentOrganization from '@/views/Cim/ParentOrganization'
export const createOrganisationRoot = (dbsql) => {
    return new Promise((resolve, reject) => {
        const parentOrganisation = new ParentOrganization()
        parentOrganisation.mrid = '00000000-0000-0000-0000-000000000000'
        parentOrganisation.name = 'Root'
        dbsql.serialize(() => {
            dbsql.run('BEGIN TRANSACTION')
            parentOrganisationFunc.insertParentOrganizationTransaction(parentOrganisation, dbsql)
                .then(result => {
                    if (!result.success) {
                        dbsql.run('ROLLBACK')
                        return reject({ success: false, message: 'Create organisation root failed', err: result.err })
                    }
                    dbsql.run('COMMIT')
                    return resolve({ success: true, data: result.data, message: 'Create organisation root completed' })
                })
                .catch(err => {
                    dbsql.run('ROLLBACK')
                    return reject({ success: false, err, message: 'Create organisation root transaction failed' })
                })
        })
    })
}
