export const getAllNameDatabase = (db) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT name FROM sqlite_schema WHERE type='table'", (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

export const createManufacturer = (db) => {
    return new Promise((resolve, reject) => {
        db.run("CREATE TABLE manufacturer_custom(id text PRIMARY KEY NOT NULL, name text, type text)", (err, row) => {
            if (err) reject(err)
            resolve(true)
        })
    })
}


