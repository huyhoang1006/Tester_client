import db from '../datacontext/index'
import { v4 as newUuid } from 'uuid'

export const getOwnerByName = (name) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM owner where name=?", [name], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const getOwnerByPhone = (phone) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM owner where phone1=? or phone2=?", [phone, phone], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const getOwnerById = (id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM owner where id=?", [id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const getOwnerByUserId = (user_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM owner where user_id=?", [user_id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const getOwnerByRefId = (ref_id) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM owner where ref_id=?", [ref_id], (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const insertOwner = (data) => {
    let id = data.id || newUuid()
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO owner(id, name, user_id, address, city, state, country, phone_no, fax, email, name_person, phone1, phone2, fax_contact, email_contact, department, position, comment, ref_id, mode)' +
        ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
            id, data.name, data.user_id, data.address, data.city, data.state, data.country, data.phone_no, data.fax, data.email, data.name_person, data.phone1, data.phone2, data.fax_contact, data.email_contact, data.department, data.position, data.comment, data.ref_id, data.mode
        ], function (err) {
            if (err) reject(err)
            resolve({
                id : id,
                success : true
            })
        }) 
    });
}

export const updateOwnerById = (id, data) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE owner' +
        ' SET name=?, address=?, city=?, state=?, country=?, phone_no=?, fax=?, email=?, name_person=?, phone1=?, phone2=?, fax_contact=?, email_contact=?, department=?, position=?, comment=?, ref_id=?, mode=?' +
        ' WHERE id = ?',
        [data.name, data.address, data.city, data.state, data.country, data.phone_no, data.fax, data.email, data.name_person, data.phone1, data.phone2, data.fax_contact, data.email_contact, data.department, data.position, data.comment, data.ref_id, data.mode, id], function (err) {
            if (err) reject(err)
            resolve({
                success : true
            })
        })
    })
}


export const deleteOwnerById = (id) => {
    return new Promise((resolve, reject) => {
        db.all("DELETE FROM owner WHERE id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve({
                success : true
            })
        })
    })
}