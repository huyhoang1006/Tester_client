export const insertValueToColumn = (db, tableName, columns, values) => {
    let sqlQuery = "INSERT INTO " + tableName + " ("
    for(let i in columns) {
        sqlQuery = sqlQuery + columns[i] + ","
    }
    sqlQuery = sqlQuery.slice(0, -1)
    sqlQuery = sqlQuery + ") VALUES ("
    for(let j in values) {
        sqlQuery = sqlQuery + values[j] + ','
    }
    sqlQuery = sqlQuery.slice(0, -1)
    sqlQuery = sqlQuery + ")"
    console.log(sqlQuery)

    return new Promise((resolve, reject) => {
        db.all(sqlQuery, (err, row) => {
            if (err) reject(err)
            resolve({
                success : true,
            })
        })
    })
}

export const checkValueInTable = (db, tableName, column, value) => {
    let sqlQuery = "Select * from " + tableName + " where " + column + " = " + value 
    return new Promise((resolve, reject) => {
        db.all(sqlQuery, (err, row) => {
            if (err) reject(err)
            resolve({
                data : row,
                success : true,
            })
        })
    })
}

