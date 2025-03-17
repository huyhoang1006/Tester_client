import { v4 as newUuid } from 'uuid'
import { NIL as EMPTY } from 'uuid'
import db from '../datacontext/index'

export const insertJobasset = (assetId, jobId) => {
    const id = newUuid()
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO job_asset(id, asset_id, job_id)' +
            ' VALUES(?, ?, ?)',
            [id ,assetId, jobId], function (err) {
                if (err) reject(err)
                resolve(id)
            })
    })
}

export const deleteCircuit = (assetId) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM job_asset WHERE asset_id = ?", [assetId], (err) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}

export const deleteCircuitByJobId = (jobId) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM job_asset WHERE job_id = ?", [jobId], (err) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}
