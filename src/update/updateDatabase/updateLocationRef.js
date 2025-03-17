export const getNameOfColumn = (db, name) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT name FROM pragma_table_info('" + name + "')", (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

export const insertColumn = (db, name, tableName) => {
    return new Promise((resolve, reject) => {
        db.all("ALTER TABLE " + tableName + " ADD " + name + " text REFERENCES owner(id) ON DELETE CASCADE", (err, row) => {
            if (err) reject(err)
            resolve({
                success : true,
            })
        })
    })
}

export const insertColumnNotForeign = (db, name, tableName) => {
    return new Promise((resolve, reject) => {
        db.all("ALTER TABLE " + tableName + " ADD " + name + " text", (err, row) => {
            if (err) reject(err)
            resolve({
                success : true,
            })
        })
    })
}

export const listForeignRef = (db, tableName ) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM pragma_foreign_key_list('" + tableName + "')", (err, rows) => {
            if (err) reject(err)
            resolve({
                success : true,
                data : rows
            })
        })
    })
}

