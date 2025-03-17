'use strict'
import Excel from 'exceljs'
import path from 'path'
import db from '../../datacontext/index'
const pathTemplate = path.join(__dirname,`/../template`)
const fs = require('fs')

export const handleDataLocation = async (path, variable) => {
    return new Promise(async (resolve, reject) => {        
        var workbook = new Excel.Workbook();
        await  workbook.xlsx.readFile(path);

        for(let data in variable) {
            variable[data]['address'] = []
        }
        
        for(let indexData in workbook.worksheets) {
            let dataCorn = {}
            dataCorn[indexData] = []
            for(let data in variable) {
                let copyData = JSON.parse(JSON.stringify(dataCorn))
                variable[data]['address'].push(copyData)
            }
        }

        for(let indexData in workbook.worksheets) {
            var worksheet = workbook.getWorksheet(workbook.worksheets[indexData].name)
            worksheet.eachRow({ includeEmpty: false }, async function(row) {
                row.eachCell({ includeEmpty: false }, (cell) => {
                    for(let data in variable) {
                        if(cell.value == `#${variable[data].name}`) {
                            variable[data]['address'][indexData][indexData].push(cell.address)
                        }
                    }
                })
            })
        }
        resolve(variable)
    })
}

export const handleDataWord = async (path, variable) => {
    return new Promise(async (resolve, reject) => {
        // await loadFile(path)
        resolve(variable)
    })
}

// async function loadFile (file) {
//     return new Promise((resolve, reject) => {
//       fs.readFile(file, 'binary', async function (err, data) {
//             if (err) {
//                 reject(err)
//             }
//             await getParagraphs(data);
//             resolve()
//         })
//         resolve()
//     })
// }

// function str2xml(str) {
//     // if (str.charCodeAt(0) === 65279) {
//     //     // BOM sequence
//     //     str = str.substr(1);
//     // }
//     return new DOMParser().parseFromString(str, "text/xml");
// }

// async function getParagraphs(content) {
//     const zip = new PizZip(content);
//     const xml = str2xml(zip.files["word/document.xml"].asText());
//     let xmlJsonData = convert.xml2json(xml, {compact: true, spaces: 4})
//     if (typeof xmlJsonData == 'string') {
//         xmlJsonData = JSON.parse(xmlJsonData)
//     }
//     for(let i in xmlJsonData['w:document']['w:body']['w:p']) {
//         let data = ''
//         if(xmlJsonData['w:document']['w:body']['w:p'][i]['w:r'] != undefined && Array.isArray(xmlJsonData['w:document']['w:body']['w:p'][i]['w:r'])) {
//             for(let j in xmlJsonData['w:document']['w:body']['w:p'][i]['w:r']) {
//                 if(xmlJsonData['w:document']['w:body']['w:p'][i]['w:r'][j]['w:t'] != undefined ) {
//                     data = data + xmlJsonData['w:document']['w:body']['w:p'][i]['w:r'][j]['w:t']['_text']
//                 }
//             }
//         }
//        else if(xmlJsonData['w:document']['w:body']['w:p'][i]['w:r'] != undefined) {
//             if(xmlJsonData['w:document']['w:body']['w:p'][i]['w:r']['w:t'] != undefined) {
//                 data = xmlJsonData['w:document']['w:body']['w:p'][i]['w:r']['w:t']['_text']
//             }
//        }
//        console.log(data)
//     } 
// }