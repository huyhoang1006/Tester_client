import {v4 as newUuid} from 'uuid'
import {NIL as EMPTY} from 'uuid'
import db from '../datacontext/index'

export const getLocations = (userId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM locations where user_id=?", [userId], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const getLocationsData = (userId, valueData) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM locations where user_id=? and mode=?", [userId, valueData], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const getLocationByRefId = (userId, valueData, refId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM locations where user_id=? and mode=? and refId=?", [userId, valueData, refId], (err, rows) => {
            if (err) reject(err)
            resolve(rows)
        })
    })
}

export const getLocationById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM locations where id = ?", [id], (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const getLocationByAssetId = async (asset_id) => {
    const asset = await getAssetById(asset_id)
    const locationId = asset.location_id
    const location = await getLocationById(locationId)
    return location
}

export const deleteLocation = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM locations WHERE id = ?", [id], (err) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}

export const checkLocationExist = (location) => {
    return new Promise((resolve, reject) => {
        if(location.properties.mode == 'location') {
            db.get('SELECT * FROM locations where name = ? and id != ? and mode =? ',
                [location.properties.name, location.properties.id, location.properties.mode], async (err, row) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(row !== undefined)
                    }
                })
        } else if( location.properties.mode == 'voltage') {
            db.get('SELECT * FROM locations where (name = ? and id != ? and mode =? and refId = ?) or (name = ? and mode = "location")  ',
                [location.properties.name, location.properties.id, location.properties.mode, location.properties.refId, 
                location.properties.name ], async (err, row) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(row !== undefined)
                    }
                })
        } else if( location.properties.mode == 'feeder') {
            db.get('SELECT * FROM locations where mode = "location" and name = ?',
            [location.properties.name], async (err, rowLocation) => {
                if (err) {
                    reject(err)
                } else {
                    if(rowLocation != undefined) {
                        resolve(true)
                    } else {
                        db.get('SELECT * FROM locations where mode = "voltage" and id = ?',
                        [location.properties.refId], async (err, row) => {
                            if (err) {
                                reject(err)
                            } else {
                                if(row == undefined) {
                                    resolve(false)
                                } else {
                                    if(row.name == location.properties.name) {
                                        resolve(true)
                                    } else {
                                        db.all('SELECT * FROM locations where mode = "voltage" and refId = ?',
                                        [row.refId], async (err, rowdata) => {
                                            if (err) {
                                                reject(err)
                                            }
                                            else {
                                                for(let i in rowdata) {
                                                    if(rowdata[i].name == location.properties.name) {
                                                        resolve(true)
                                                    }
                                                }
                                                db.get('SELECT * FROM locations where name = ? and refId = ? and id != ?',
                                                [location.properties.name, location.properties.refId, location.properties.id], async (err, dataFeeder) => {
                                                    if (err) {
                                                        reject(err)
                                                    } else {
                                                        resolve(dataFeeder != undefined)
                                                    }
                                                })
                                            }
                                        })
                                    }
                                }
                            }
                        })
                    }
                }
            })
        }
    })
}

export const checkLocationNameExist = (name) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM locations where name = ?',
            [name], (err, row) => {
                if (err) reject(err)
                else {
                    if(row !== undefined)
                        resolve(
                            {
                                exist : row !== undefined,
                                id : row.id
                            }
                        )
                    else {
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


export const insertLocation = (userId, location) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO locations(id, user_id, name, type, region, division, area, plant, address, city, state_province, postal_code, country, geo_coordinates, location_system_code, person_name, person_phone_no1, person_phone_no2, person_fax_no, person_email, comment, company_company, company_department, company_address, company_city, company_state_province, company_postal_code, company_country, company_phone_no, company_fax_no, company_email, mode, refId, owner_id, department, position, ref_id_old)' +
            ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [location.properties.id || newUuid(), userId,
                location.properties.name, location.properties.type, location.properties.region, location.properties.division, location.properties.area, location.properties.plant, location.properties.address, location.properties.city, location.properties.state_province, location.properties.postal_code, location.properties.country, location.properties.geo_coordinates, location.properties.location_system_code,
                location.contact_person.name, location.contact_person.phone_no1, location.contact_person.phone_no2, location.contact_person.fax_no, location.contact_person.email,
                location.properties.comment,
                location.company.company, location.company.department, location.company.address, location.company.city, location.company.state_province, location.company.postal_code, location.company.country, location.company.phone_no, location.company.fax_no, location.company.email,
                location.properties.mode, location.properties.refId, location.properties.owner_id, location.contact_person.department, location.contact_person.position, location.properties.ref_id_old], (err) => {
                    if (err) reject(err)
                    resolve(true)
                })
    })
}

export const updateLocation = (location) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE locations' +
            ' SET type=?, name=?, region=?, division=?, area=?, plant=?, address=?, city=?, state_province=?, postal_code=?, country=?, geo_coordinates=?, location_system_code=?, person_name=?, person_phone_no1=?, person_phone_no2=?, person_fax_no=?, person_email=?, comment=?, company_company=?, company_department=?, company_address=?, company_city=?, company_state_province=?, company_postal_code=?, company_country=?, company_phone_no=?, company_fax_no=?, company_email=?, department=?, position=?, ' +
            'mode=?, refId=?, ref_id_old=?' +
            ' WHERE id=?',
            [location.properties.type ,location.properties.name, location.properties.region, location.properties.division, location.properties.area, location.properties.plant, location.properties.address, location.properties.city, location.properties.state_province, location.properties.postal_code, location.properties.country, location.properties.geo_coordinates, location.properties.location_system_code,
            location.contact_person.name, location.contact_person.phone_no1, location.contact_person.phone_no2, location.contact_person.fax_no, location.contact_person.email, location.contact_person.department, location.contact_person.position,
            location.properties.comment,
            location.company.company, location.company.department, location.company.address, location.company.city, location.company.state_province, location.company.postal_code, location.company.country, location.company.phone_no, location.company.fax_no, location.company.email,
            location.properties.mode, location.properties.refId, location.properties.ref_id_old,
            location.properties.id], (err) => {
                if (err) reject(err)
                resolve(true)
            })
    })
}

export const importLocation = (userId, location) => {
    let id = newUuid()
    if(location.id != undefined && location.id != EMPTY && location.id != '') {
        id = location.id
    }
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO locations(id, user_id, name, region, division, area, plant, address, city, state_province, postal_code, country, geo_coordinates, location_system_code, person_name, person_phone_no1, person_phone_no2, person_fax_no, person_email, comment, company_company, company_department, company_address, company_city, company_state_province, company_postal_code, company_country, company_phone_no, company_fax_no, company_email, mode, refId, owner_id, ref_id_old)' +
                ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                userId,
                location.name,
                location.region,
                location.division,
                location.area,
                location.plant,
                location.address,
                location.city,
                location.state_province,
                location.postal_code,
                location.country,
                location.geo_coordinates,
                location.location_system_code,
                location.person_name,
                location.person_phone_no1,
                location.person_phone_no2,
                location.person_fax_no,
                location.person_email,
                location.comment,
                location.company_company,
                location.company_department,
                location.company_address,
                location.company_city,
                location.company_state_province,
                location.company_postal_code,
                location.company_country,
                location.company_phone_no,
                location.company_fax_no,
                location.company_email,
                location.mode,
                location.refId,
                location.owner_id,
                location.ref_id_old
            ],
            (err) => {
                if (err) reject(err)
                resolve(true)
            }
        )
    })
}

export const importLocationData = (location) => {
    let id = ''
    if(location.id == '') {
        id = newUuid()
    } else {
        id = location.id
    }
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO locations(id, user_id, name, region, division, area, plant, address, city, state_province, postal_code, country, geo_coordinates, location_system_code, person_name, person_phone_no1, person_phone_no2, person_fax_no, person_email, comment, company_company, company_department, company_address, company_city, company_state_province, company_postal_code, company_country, company_phone_no, company_fax_no, company_email, mode, refId, owner_id, ref_id_old)' +
                ' VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                location.user_id,
                location.name,
                location.region,
                location.division,
                location.area,
                location.plant,
                location.address,
                location.city,
                location.state_province,
                location.postal_code,
                location.country,
                location.geo_coordinates,
                location.location_system_code,
                location.person_name,
                location.person_phone_no1,
                location.person_phone_no2,
                location.person_fax_no,
                location.person_email,
                location.comment,
                location.company_company,
                location.company_department,
                location.company_address,
                location.company_city,
                location.company_state_province,
                location.company_postal_code,
                location.company_country,
                location.company_phone_no,
                location.company_fax_no,
                location.company_email,
                location.mode,
                location.refId,
                location.owner_id,
                location.ref_id_old
            ],
            (err) => {
                if (err) reject(err)
                resolve(id)
            }
        )
    })
}

export const updateLocationData = (location) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE locations' +
            ' SET name=?, region=?, division=?, area=?, plant=?, address=?, city=?, state_province=?, postal_code=?, country=?, geo_coordinates=?, location_system_code=?, person_name=?, person_phone_no1=?, person_phone_no2=?, person_fax_no=?, person_email=?, comment=?, company_company=?, company_department=?, company_address=?, company_city=?, company_state_province=?, company_postal_code=?, company_country=?, company_phone_no=?, company_fax_no=?, company_email=?, mode=?' +
            ' WHERE id=?',
            [location.name, location.region, location.division, location.area, location.plant, location.address, location.city, location.state_province, location.postal_code, location.country, location.geo_coordinates, location.location_system_code,
            location.person_name, location.person_phone_no1, location.person_phone_no2, location.person_fax_no, location.person_email,
            location.comment,
            location.company_company, location.company_department, location.company_address, location.company_city, location.company_state_province, location.company_postal_code, location.company_country, location.company_phone_no, location.company_fax_no, location.company_email, location.mode,
            location.id
            ], (err) => {
                if (err) reject(err)
                resolve(location.id)
            })
    })
}