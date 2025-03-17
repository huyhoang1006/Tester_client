import { v4 as newUuid } from 'uuid'
import { NIL as EMPTY } from 'uuid'
import db from '../datacontext/index'
import uuid from '@/utils/uuid'

export const insertTestingCondition = (id_foreign, info) => {
    let id = info.id || newUuid()
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO testing_condition(id, id_foreign, condition, equipment, comment)' +
        ' VALUES(?, ?, ?, ?, ?)',
        [
            id, id_foreign , JSON.stringify(info.condition), JSON.stringify(info.equipment), info.comment
        ], function (err) {
            if (err) reject(err)
            resolve(true)
        }) 
    });
}

export const getTestingCondition = (id_foreign) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM testing_condition where id_foreign=?", [id_foreign], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const updateTestingCondition = async (id_foreign, info) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE testing_condition' +
        ' SET condition = ?, equipment=?, comment=?' +
        ' WHERE id_foreign = ?',
        [
            JSON.stringify(info.condition), JSON.stringify(info.equipment) ,info.comment, id_foreign
        ], function (err) {
            if (err) reject(err)
            resolve(true)
        })
    })
}

export const deleteTestingCondition = (id_foreign) => {
    return new Promise((resolve, reject) => {
        db.all("DELETE FROM testing_condition WHERE id_foreign = ?", [id_foreign], (err, row) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}