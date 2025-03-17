/* eslint-disable */
import { v4 as newUuid } from 'uuid'
import db from '../datacontext/index'
import uuid from '@/utils/uuid'
import { NIL as EMPTY } from 'uuid'

export const getJobSurgeArrester = (assetId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM JobsSurge where asset_id=?", [assetId], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const getJobIds = (assetId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT id as id FROM JobsSurge where asset_id=?", [assetId], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}
export const getTestIds = (jobId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT test_id as id FROM job_test where job_id=?", [jobId], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const getTestByType = (test_id, type_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT data FROM testsSurge where id=? and type_id=?", [test_id, type_id], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const getTestbyAssetId = async (assetId, typeId) => {
    const jobId = await getJobIds(assetId)
    const jobLastId = jobId.slice(-1)
    const arr = []
    const testId = await getTestIds(jobLastId[0].id)
    for (const index in testId) {
        const data = await getTestByType(testId[index].id, typeId)
        arr.push(data)
    }
    return arr.filter((item) => item.length !== 0).slice(-1)
}

export const checkJobExist = (properties) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM JobsSurge where name = ? and id != ? and asset_id = ? ',
            [properties.name, properties.id, properties.asset_id], (err, row) => {
                if (err) reject(err)
                resolve(row !== undefined)
            })
    })
}

export const insertJob = (assetId, properties) => {
    let id = newUuid()
    if(properties.id != EMPTY && properties.id != '' && properties.id != undefined) {
        id = properties.id
    }
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO JobsSurge(id, asset_id, name, work_order, creation_date, execution_date, tested_by, approved_by, approval_date, summary, ambient_condition, testing_method, standard, average_health_index, worst_health_index)' +
                ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                assetId,
                properties.name,
                properties.work_order,
                properties.creation_date,
                properties.execution_date,
                properties.tested_by,
                properties.approved_by,
                properties.approval_date,
                properties.summary,
                properties.ambient_condition,
                properties.testing_method,
                properties.standard,
                properties.average_health_index,
                properties.worst_health_index
            ],
            function (err) {
                if (err) reject(err)
                resolve(id)
            }
        )
    })
}

export const insertTest = (jobId, test) => {
    let id = ""
    if(test.id == undefined || test.id == uuid.EMPTY) {
        id = newUuid()
    } else {
        id = test.id
    }
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO testsSurge(id, type_id, job_id, name, data, average_score, worst_score, total_average_score, total_worst_score, weighting_factor, worst_score_df, worst_score_c, average_score_df, average_score_c, created_on, weighting_factor_df, weighting_factor_c)' +
                ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                test.testTypeId,
                jobId,
                test.name,
                JSON.stringify(test.data),
                test.average_score,
                test.worst_score,
                test.total_average_score,
                test.total_worst_score,
                test.weighting_factor,
                test.worst_score_df,
                test.worst_score_c,
                test.average_score_df,
                test.average_score_c,
                test.created_on,
                test.weighting_factor_df,
                test.weighting_factor_c
            ],
            function (err) {
                if (err) reject(err)
                resolve(id)
            }
        )
    })
}

export const insertJobTest = (jobId, testId) => {
    const id = newUuid()
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO job_test(id, job_id, test_id)' +
            ' VALUES(?, ?, ?)',
            [id ,jobId, testId], function (err) {
                if (err) reject(err)
                resolve(id)
            })
    })
}

export const deleteJob = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM JobsSurge WHERE id = ?", [id], (err) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}

export const deleteSurgeArresterTest = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM testsSurge WHERE id = ?", [id], (err) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}

export const getJobById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM JobsSurge where id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const getTestByJobId = (jobId) => {
    return new Promise((resolve, reject) => {
        db.all(
            'select testsSurge.id, testsSurge.name, testsSurge.data, testsSurge.average_score, testsSurge.worst_score, testsSurge.worst_score_df, testsSurge.worst_score_c, testsSurge.average_score_df, testsSurge.average_score_c , testsSurge.total_average_score, testsSurge.total_worst_score, testsSurge.weighting_factor, testsSurge.weighting_factor_df, testsSurge.weighting_factor_c, testSurge_type.id as testTypeId, testSurge_type.code as testTypeCode, testSurge_type.name as testTypeName, testsSurge.created_on from testsSurge, testSurge_type WHERE testsSurge.job_id = ? and testsSurge.type_id = testSurge_type.id order by testsSurge.created_on asc',
            [jobId],
            (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            }
        )
    })
}

export const getAllTestByJobId = (jobId) => {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM testsSurge WHERE job_id = ?',
            [jobId],
            (err, rows) => {
                if (err) reject(err)
                resolve(rows)
            }
        )
    })
}


export const getJobByAssetId = (assetId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM JobsSurge where asset_id = ?", [assetId], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const getTestIdByJobId = (jobId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT id FROM testsSurge where job_id = ?", [jobId], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const updateJobSurgeArrester = (job) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE JobsSurge' +
            ' SET name=?, work_order=?, creation_date=?, execution_date=?, tested_by=?, approved_by=?, approval_date=?, summary=?, ambient_condition=?, testing_method=?, standard=?' +
            ' WHERE id=?',
            [job.name, job.work_order, job.creation_date, job.execution_date, job.tested_by, job.approved_by, job.approval_date, job.summary, job.ambient_condition, job.testing_method, job.standard,
            job.id
            ], (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const updateTest = (test) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE testsSurge' +
            ' SET name=?, data=?' +
            ' WHERE id=?',
            [test.name, JSON.stringify(test.data), test.id], (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const importJob = (assetId, job) => {
    const id = newUuid()
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO jobs(id, asset_id, name, work_order, creation_date, execution_date, tested_by, approved_by, approval_date, summary, ambient_condition, testing_method, standard, average_health_index, worst_health_index)' +
                ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                assetId,
                job.name,
                job.work_order,
                job.creation_date,
                job.execution_date,
                job.tested_by,
                job.approved_by,
                job.approval_date,
                job.summary,
                job.ambient_condition,
                job.testing_method,
                job.standard,
                job.average_health_index,
                job.worst_health_index
            ],
            function (err) {
                if (err) reject(err)
                resolve(id)
            }
        )
    })
}

export const importTest = (jobId, test) => {
    const id = newUuid()
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO tests(id, type_id, job_id, name, data, average_score, worst_score, total_average_score, total_worst_score, weighting_factor, worst_score_df, worst_score_c, average_score_df, average_score_c, created_on)' +
                ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                test.testTypeId,
                jobId,
                test.name,
                test.data,
                test.average_score,
                test.worst_score,
                test.total_average_score,
                test.total_worst_score,
                test.weighting_factor,
                test.worst_score_df,
                test.worst_score_c,
                test.average_score_df,
                test.average_score_c,
                test.created_on
            ],
            function (err) {
                if (err) reject(err)
                resolve(id)
            }
        )
    })
}

export const checkJobExistByName = (id, name) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM JobsSurge where name = ? and asset_id = ?',
            [name, id], (err, row) => {
                if (err) {
                    reject(err)
                } else {
                    if(row !== undefined) {
                        resolve(
                            {
                                exist : row !== undefined,
                                id : row.id
                            }
                        )
                    } else {
                        resolve(
                            {
                                exist : row !== undefined,
                            }
                        )
                    }
                }
            })
    })
}

export const getTestTypeByCode = (code) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM testSurge_type where code = ?", [code], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const getTestTypeById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM testSurge_type where id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}