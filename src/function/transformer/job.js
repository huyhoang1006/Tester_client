import { v4 as newUuid } from 'uuid'
import { NIL as EMPTY } from 'uuid'
import db from '../datacontext/index'
import uuid from '@/utils/uuid'

export const getJobs = (assetId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM jobs where asset_id=?", [assetId], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const getJobIds = (assetId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT id as id FROM jobs where asset_id=?", [assetId], (err, rows) => {
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
        db.all("SELECT data FROM tests where id=? and type_id=?", [test_id, type_id], (err, rows) => {
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
        db.get('SELECT * FROM jobs where name = ? and id != ? and asset_id = ? ',
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
            'INSERT INTO jobs(id, asset_id, name, work_order, creation_date, execution_date, tested_by, approved_by, approval_date, summary, ambient_condition, testing_method, standard, average_health_index, worst_health_index)' +
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
            'INSERT INTO tests(id, type_id, job_id, name, data, average_score, worst_score, total_average_score, total_worst_score, weighting_factor, worst_score_df, worst_score_c, average_score_df, average_score_c, created_on, weighting_factor_df, weighting_factor_c)' +
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
        db.run("DELETE FROM jobs WHERE id = ?", [id], (err) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}

export const deleteTest = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM tests WHERE id = ?", [id], (err) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}

export const getJobById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM jobs where id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const getTestByJobId = (jobId) => {
    return new Promise((resolve, reject) => {
        db.all(
            'select tests.id, tests.name, tests.data, tests.average_score, tests.worst_score, tests.worst_score_df, tests.worst_score_c, tests.average_score_df, tests.average_score_c , tests.total_average_score, tests.total_worst_score, tests.weighting_factor, tests.weighting_factor_df, tests.weighting_factor_c, test_types.id as testTypeId, test_types.code as testTypeCode, test_types.name as testTypeName, tests.created_on from tests, test_types WHERE tests.job_id = ? and tests.type_id = test_types.id order by tests.created_on asc',
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
            'SELECT * FROM tests WHERE job_id = ?',
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
        db.all("SELECT * FROM jobs where asset_id = ?", [assetId], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const getTestIdByJobId = (jobId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT id FROM tests where job_id = ?", [jobId], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const updateJob = (job) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE jobs' +
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
        db.run('UPDATE tests' +
            ' SET name=?, data=?' +
            ' WHERE id=?',
            [test.name, JSON.stringify(test.data), test.id], (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const updateTestDownload = (test) => {
    let id = ""
    if(test.id == undefined || test.id == uuid.EMPTY) {
        id = newUuid()
    } else {
        id = test.id
    }
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE tests' +
             'SET name=?, data=?, average_score=?, worst_score=?, total_average_score=?, total_worst_score=?, weighting_factor=?, worst_score_df=?, worst_score_c=?, average_score_df=?, average_score_c=?, created_on=?, weighting_factor_df=?, weighting_factor_c=?' +
             ' WHERE id=?',
            [
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
                test.weighting_factor_c,
                test.id
            ],
            function (err) {
                if (err) reject(err)
                resolve(id)
            }
        )
    })
}


export const updateJobRelated = async (assetId, tapChangers) => {
    const jobs = await getJobByAssetId(assetId)
    jobs.forEach(async (job) => {
        const jobId = job.id
        // const testList = await getTestsByJobId(jobId)

        testList.forEach(async (test) => {
            const testTypeCode = test.testTypeCode
            if (testTypeCode == 'RatioPrimSec'
                || testTypeCode == 'ExcitingCurrent'
                || testTypeCode == 'DcWindingPrim'
                || testTypeCode == 'DcWindingSec'
            ) {
                const data = JSON.parse(test.data)
                const table = data.table
                let newTable = []
                let newData = {}
                let newTest = {}

                if (testTypeCode == 'RatioPrimSec') {
                    if (!tapChangers.mode || !tapChangers.winding || !tapChangers.tap_scheme || !tapChangers.no_of_taps) {
                        // 
                    }
                    else {
                        const voltage_table = tapChangers.voltage_table
                        const phases = ['A', 'B', 'C']
                        voltage_table.forEach(element => {
                            const tap = element.tap
                            const voltage = element.voltage
                            const voltage_table_id = element.id
                            phases.forEach((phase) => {
                                let newRatioPrimSec = {
                                    voltage_table_id,
                                    tap,
                                    _voltage: voltage,
                                    phase,
                                    _phase: phase,
                                    hv1: '',
                                    lv: '',
                                    nominal_ratio: '',
                                    v_ratio: '',
                                    ratio_dev: '',
                                    assessment: '',
                                    condition_indicator: ''
                                }

                                table.forEach(oldRatioPrimSec => {
                                    if (oldRatioPrimSec.voltage_table_id == voltage_table_id && oldRatioPrimSec._phase == phase) {
                                        newRatioPrimSec = {
                                            ...oldRatioPrimSec,
                                            voltage_table_id,
                                            tap,
                                            phase,
                                            _voltage: voltage,
                                            _phase: phase
                                        }
                                    }
                                })
                                newTable.push(newRatioPrimSec)
                            })
                        })
                    }
                }
                else if (testTypeCode == 'ExcitingCurrent') {
                    if (!tapChangers.mode || !tapChangers.winding || !tapChangers.tap_scheme || !tapChangers.no_of_taps) {
                        // 
                    }
                    else {
                        const voltage_table = tapChangers.voltage_table
                        const phases = ['A', 'B', 'C']
                        voltage_table.forEach(element => {
                            const tap = element.tap
                            const voltage = element.voltage
                            const voltage_table_id = element.id
                            phases.forEach((phase) => {
                                let newExcitingCurrent = {
                                    voltage_table_id,
                                    tap,
                                    _voltage: voltage,
                                    phase,
                                    _phase: phase,
                                    i_out: '',
                                    watt_losses: '',
                                    assessment: '',
                                    i_ref: '',
                                    dev_per: '',
                                    condition_indicator: ''
                                }

                                table.forEach(oldExcitingCurrent => {
                                    if (oldExcitingCurrent.voltage_table_id == voltage_table_id && oldExcitingCurrent._phase == phase) {
                                        newExcitingCurrent = {
                                            ...oldExcitingCurrent,
                                            voltage_table_id,
                                            tap,
                                            phase,
                                            _phase: phase,
                                            _voltage: voltage
                                        }
                                    }
                                })
                                newTable.push(newExcitingCurrent)
                            })
                        })
                    }
                }
                else if (testTypeCode == 'DcWindingPrim') {
                    if (!tapChangers.mode || !tapChangers.winding || !tapChangers.tap_scheme || !tapChangers.no_of_taps) {
                        //    
                    }
                    else {
                        const { winding, _winding, mode, _mode } = tapChangers
                        // Nếu đổi kiểu winding hoặc mode thì reset
                        if (winding !== _winding || mode !== _mode) {
                            if (winding === 'Prim') {
                                const voltage_table = tapChangers.voltage_table
                                const phases = ['A', 'B', 'C']
                                voltage_table.forEach((element) => {
                                    const voltage_table_id = element.id
                                    const voltage = element.voltage
                                    const tap = element.tap
                                    phases.forEach((phase) => {
                                        newTable.push({
                                            voltage_table_id,
                                            tap,
                                            _voltage: voltage,
                                            phase,
                                            _phase: phase,
                                            r_meas: '',
                                            r_ref: '',
                                            r_corr: '',
                                            error_between_phase: '',
                                            error_r_ref: '',
                                            mean_value: '',
                                            assessment: '',
                                            condition_indicator: ''
                                        })
                                    })
                                })
                            } else {
                                const phases = ['A', 'B', 'C']
                                phases.forEach((phase) => {
                                    newTable.push({
                                        tap: '',
                                        phase,
                                        _phase: phase,
                                        r_meas: '',
                                        r_ref: '',
                                        r_corr: '',
                                        error_between_phase: '',
                                        error_r_ref: '',
                                        mean_value: '',
                                        assessment: '',
                                        condition_indicator: ''
                                    })
                                })
                            }
                        } else {
                            if (winding === 'Prim') {
                                const voltage_table = tapChangers.voltage_table
                                const phases = ['A', 'B', 'C']
                                voltage_table.forEach(element => {
                                    const voltage_table_id = element.id
                                    const voltage = element.voltage
                                    const tap = element.tap
                                    phases.forEach((phase) => {
                                        let newDcWindingPrim = {
                                            voltage_table_id,
                                            tap,
                                            _voltage: voltage,
                                            phase,
                                            _phase: phase,
                                            r_meas: '',
                                            r_corr: '',
                                            error_between_phase: '',
                                            mean_value: '',
                                            assessment: ''
                                        }
                                        table.forEach(oldDcWindingPrim => {
                                            if (oldDcWindingPrim.voltage_table_id == voltage_table_id && oldDcWindingPrim._phase == phase) {
                                                newDcWindingPrim = {
                                                    ...oldDcWindingPrim,
                                                    voltage_table_id,
                                                    tap,
                                                    phase,
                                                    _phase: phase,
                                                    _voltage: voltage
                                                }
                                            }
                                        })
                                        newTable.push(newDcWindingPrim)
                                    })
                                })
                            }
                            else {
                                newTable = table
                            }
                        }
                    }
                }
                else if (testTypeCode == 'DcWindingSec') {
                    if (!tapChangers.mode || !tapChangers.winding || !tapChangers.tap_scheme || !tapChangers.no_of_taps) {
                        //    
                    }
                    else {
                        const {winding, _winding, mode, _mode} = tapChangers
                        // Nếu đổi kiểu winding hoặc mode thì reset
                        if (winding !== _winding || mode !== _mode) {
                            if (winding === 'Sec') {
                                const voltage_table = tapChangers.voltage_table
                                const phases = ['A', 'B', 'C']
                                voltage_table.forEach((element) => {
                                    const voltage_table_id = element.id
                                    const voltage = element.voltage
                                    const tap = element.tap
                                    phases.forEach((phase) => {
                                        newTable.push({
                                            voltage_table_id,
                                            tap,
                                            _voltage: voltage,
                                            phase,
                                            _phase: phase,
                                            r_meas: '',
                                            r_ref: '',
                                            r_corr: '',
                                            error_between_phase: '',
                                            error_r_ref: '',
                                            mean_value: '',
                                            assessment: '',
                                            condition_indicator: ''
                                        })
                                    })
                                })
                            } else {
                                const phases = ['A', 'B', 'C']
                                phases.forEach((phase) => {
                                    newTable.push({
                                        tap: '',
                                        phase,
                                        _phase: phase,
                                        r_meas: '',
                                        r_ref: '',
                                        r_corr: '',
                                        error_between_phase: '',
                                        error_r_ref: '',
                                        mean_value: '',
                                        assessment: '',
                                        condition_indicator: ''
                                    })
                                })
                            }
                        } else {
                            if (winding === 'Sec') {
                                const voltage_table = tapChangers.voltage_table
                                const phases = ['A', 'B', 'C']
                                voltage_table.forEach((element) => {
                                    const voltage_table_id = element.id
                                    const voltage = element.voltage
                                    const tap = element.tap
                                    phases.forEach((phase) => {
                                        let newDcWindingSec = {
                                            voltage_table_id,
                                            tap,
                                            _voltage: voltage,
                                            phase,
                                            _phase: phase,
                                            r_meas: '',
                                            r_corr: '',
                                            error_between_phase: '',
                                            mean_value: '',
                                            assessment: ''
                                        }
                                        table.forEach((oldDcWindingSec) => {
                                            if (oldDcWindingSec.voltage_table_id == voltage_table_id && oldDcWindingSec._phase == phase) {
                                                newDcWindingSec = {
                                                    ...oldDcWindingSec,
                                                    voltage_table_id,
                                                    tap,
                                                    phase,
                                                    _phase: phase,
                                                    _voltage: voltage
                                                }
                                            }
                                        })
                                        newTable.push(newDcWindingSec)
                                    })
                                })
                            }
                            else {
                                newTable = table
                            }
                        }
                    }
                }


                newData = {
                    ...data,
                    table: newTable
                }
                newTest = { ...test, data: newData }
                await updateTest(newTest)
            }
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

export const checkJobExistByName = (name, id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM jobs where name = ? and asset_id = ?',
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

export const updateJobData = (job) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE jobs' +
            ' SET work_order=?, creation_date=?, execution_date=?, tested_by=?, approved_by=?, approval_date=?, summary=?, ambient_condition=?, testing_method=?, standard=?' +
            ' WHERE name=?',
            [job.work_order, job.creation_date, job.execution_date, job.tested_by, job.approved_by, job.approval_date, job.summary, job.ambient_condition, job.testing_method, job.standard,
            job.name
            ], (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const insertJobData = (job) => {
    const id = job.id || newUuid()
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO jobs(id, asset_id, name, work_order, creation_date, execution_date, tested_by, approved_by, approval_date, summary, ambient_condition, testing_method, standard, average_health_index, worst_health_index)' +
                ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                job.asset_id,
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

export const getTestTypeByCode = (code) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM test_types where code = ?", [code], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const getTestByName = (name) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM tests where name = ?", [name], (err, row) => {
            if (err) reject(err)
            else {
                if(row != undefined) {
                    resolve({
                        exist : row != undefined,
                        data : row
                    })
                } else {
                    resolve({
                        exist : row != undefined
                    })
                }
            }
            resolve(row)
        })
    })
}

