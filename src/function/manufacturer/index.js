import db from '../datacontext/index'
import { v4 as newUuid } from 'uuid'

export const getManufacturerByType = (type) => {
    var typeAll = "%" + type + "%"
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM manufacturer_custom where type like ?", [typeAll], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const getManufacturerByName = (name) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM manufacturer_custom where name=?", [name], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const getManufacturerByTypeAndName = (type, name) => {
    var typeAll = "%" + type + "%"
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM manufacturer_custom where type like ? and name=?", [typeAll, name], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const insertManufacturer = (name, type) => {
    let id = newUuid()
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO manufacturer_custom(id, name, type)' +
        ' VALUES(?, ?, ?)',
        [
            id, name , type
        ], function (err) {
            if (err) reject(err)
            resolve({
                id : id,
                success : true
            })
        }) 
    });
}

export const updateManufacturerByName = (name, data) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE manufacturer_custom' +
        ' SET type=?' +
        ' WHERE name = ?',
        [data.type, name], function (err) {
            if (err) reject(err)
            resolve({
                success : true
            })
        })
    })
}

export const updateManufacturerById = (id, data) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE manufacturer_custom' +
        ' SET type=?, name=?' +
        ' WHERE id = ?',
        [data.type, data.name, id], function (err) {
            if (err) reject(err)
            resolve({
                success : true,
                name : data.name
            })
        })
    })
}

export const deleteManufacturerByName = (name) => {
    return new Promise((resolve, reject) => {
        db.all("DELETE FROM manufacturer_custom WHERE name = ?", [name], (err, row) => {
            if (err) reject(err)
            resolve({
                success : true
            })
        })
    })
}

export const deleteManufacturerById = (id) => {
    return new Promise((resolve, reject) => {
        db.all("DELETE FROM manufacturer_custom WHERE id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve({
                success : true
            })
        })
    })
}