import { v4 as newUuid } from 'uuid'
import { NIL as EMPTY } from 'uuid'
import db from '../datacontext/index'
import fs from 'fs'
import * as upath from 'upath';


export const downloadFile = async (src, dest) => {
    return new Promise((resolve, reject) => {
        fs.readFile(src,(err, inputD) => {
            if(err) {
                reject({
                    success: false,
                    message: 'Can not read file',
                })
            }
            else {
                fs.writeFile(dest, inputD, (err, writeD) => {
                    if(err) {
                        reject({
                            success: false,
                            message: 'Can not write file',
                        })
                    }
                    else {
                        resolve({
                            success: true,
                            message: '',
                        })
                    }
                } )
            }
        })
    })
}

export const uploadF = async (src, dest, fs) => {
    return new Promise((resolve, reject) => {
        fs.readFile(src,(err, inputD) => {
            if(err) {
                reject({
                    success: false,
                    message: '',
                    path: ""
                })
            }
            else {
                fs.writeFile(dest, inputD, (err, writeD) => {
                    if(err) {
                        reject({
                            success: false,
                            message: '',
                            path: ""
                        })
                    }
                    else {
                        resolve({
                            success: true,
                            message: '',
                            path: upath.toUnix(dest)
                        })
                    }
                } )
            }
        })
    })
}

export const getAllAttachment = async (id_foreign, type) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM attachment where id_foreign=? and type=?", [id_foreign, type], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const updateAttachment = async (id, info) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE attachment' +
        ' SET name = ?' +
        ' WHERE id_foreign = ?',
        [
            JSON.stringify(info), id,
        ], function (err) {
            if (err) reject(err)
            resolve(true)
        })
    })
}

export const uploadAttachment = async (id_foreign, type, info) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO attachment(id, id_foreign, type, name)' +
        ' VALUES(?, ?, ?, ?)',
        [
            newUuid(), id_foreign , type, JSON.stringify(info)
        ], function (err) {
            if (err) reject(err)
            resolve(true)
        }) 
    });
}

export const deleteAttachment = (id_foreign) => {
    return new Promise((resolve, reject) => {
        db.all("DELETE FROM attachment WHERE id_foreign = ?", [id_foreign], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}