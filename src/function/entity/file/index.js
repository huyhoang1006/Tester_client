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

export const uploadF = async (src, dest) => {
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