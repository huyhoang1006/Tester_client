// import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, ImageRun, AlignmentType  } from "docx";
// import * as fs from "fs";
// import path from 'path'
// const name = "name.png"
// const stamp = "stamp.png"
// const standard = "standard.png"
// const pathIcon = path.join(__dirname, `/../etrc-icon`)
// import * as objectData from "../objectData/objectData";
export const export3P1W = (filePath) => {
    try {
        // const table = new Table({
        //     rows: [
        //         new TableRow({
        //             children: [
        //                 new TableCell({
        //                     children: [
        //                         new Paragraph({
        //                             children : [
        //                                 new ImageRun({
        //                                     data: fs.readFileSync(`${pathIcon}/${name}`),
        //                                     transformation: {
        //                                         width: 150,
        //                                         height: 50,
        //                                     }
        //                                 })
        //                             ],
        //                             alignment : AlignmentType.CENTER
        //                         }),
        //                         new Paragraph({
        //                             children : [
        //                                 new TextRun({
        //                                     text : "Phòng thí nghiệm điện ETRC",
        //                                     bold : true,
        //                                     font : "Arial",
        //                                     size : 16,
        //                                 })
        //                             ],
        //                             alignment : AlignmentType.CENTER
        //                         }),
        //                         new Paragraph({
        //                             children : [
        //                                 new TextRun({
        //                                     text : "ETRC laboratory",
        //                                     bold : true,
        //                                     italics : true,
        //                                     font : "Arial",
        //                                     size : 16,
        //                                 })
        //                             ],
        //                             alignment : AlignmentType.CENTER
        //                         }),
        //                     ],
        //                     rowSpan: 3,
        //                     columnSpan: 2
        //                 }),
        //                 new TableCell({
        //                     children: [],
        //                     rowSpan: 3,
        //                     width: {
        //                         size: 10,
        //                         type: WidthType.PERCENTAGE,
        //                     },
        //                 }),
        //                 new TableCell({
        //                     children: [
        //                         new Paragraph({
        //                             children : [
        //                                 new TextRun({
        //                                     text : " Nơi lắp đặt/ ",
        //                                     font : "Arial",
        //                                     size : 20,
        //                                 }),
        //                                 new TextRun({
        //                                     text : "Place: ",
        //                                     italics : true,
        //                                     font : "Arial",
        //                                     size : 20,
        //                                 })
        //                             ],
        //                         }),
        //                     ],
        //                 }),
        //             ],
        //         }),
        //         new TableRow({
        //             children: [
        //                 new TableCell({
        //                     children: [
        //                         new Paragraph({
        //                             children : [
        //                                 new TextRun({
        //                                     text : " Khách hàng/ ",
        //                                     font : "Arial",
        //                                     size : 20,
        //                                 }),
        //                                 new TextRun({
        //                                     text : "Customer: ",
        //                                     italics : true,
        //                                     font : "Arial",
        //                                     size : 20,
        //                                 })
        //                             ],
        //                         }),
        //                     ],
        //                 }),
        //             ],
        //         }),
        //         new TableRow({
        //             children: [
        //                 new TableCell({
        //                     children: [
        //                         new Paragraph({
        //                             children : [
        //                                 new TextRun({
        //                                     text : " Ngày thử nghiệm/ ",
        //                                     font : "Arial",
        //                                     size : 20,
        //                                 }),
        //                                 new TextRun({
        //                                     text : "Date: ",
        //                                     italics : true,
        //                                     font : "Arial",
        //                                     size : 20,
        //                                 })
        //                             ],
        //                         }),
        //                     ],
        //                 }),
        //             ],
        //         }),
        //         new TableRow({
        //             children: [
        //                 new TableCell({
        //                     children : [
        //                         new Paragraph({
        //                             children : [
        //                                 new ImageRun({
        //                                     data: fs.readFileSync(`${pathIcon}/${standard}`),
        //                                     transformation: {
        //                                         width: 75,
        //                                         height: 45,
        //                                     }
        //                                 })
        //                             ],
        //                             alignment : AlignmentType.CENTER
        //                         }),
        //                     ],
        //                     alignment : AlignmentType.CENTER
        //                 }),
        //                 new TableCell({
        //                     children : [
        //                         new Paragraph({
        //                             children : [
        //                                 new ImageRun({
        //                                     data: fs.readFileSync(`${pathIcon}/${stamp}`),
        //                                     transformation: {
        //                                         width: 75,
        //                                         height: 45,
        //                                     }
        //                                 })
        //                             ],
        //                             alignment : AlignmentType.CENTER
        //                         }),
        //                     ],
        //                     alignment : AlignmentType.CENTER
        //                 }),
        //                 new TableCell({
        //                     children: [],
        //                 }),
        //                 new TableCell({
        //                     children: [
        //                         new Paragraph({
        //                             children : [
        //                                 new TextRun({
        //                                     text : " Loại hình thí nghiệm/ ",
        //                                     font : "Arial",
        //                                     size : 20,
        //                                 }),
        //                                 new TextRun({
        //                                     text : "Type of test: ",
        //                                     italics : true,
        //                                     font : "Arial",
        //                                     size : 20,
        //                                 })
        //                             ],
        //                         }),
        //                     ],
        //                 }),
        //             ],
        //         }),
        //         new TableRow({
        //             children: [
        //                 new TableCell({
        //                     children : [
        //                         new Paragraph({
        //                             children : [
        //                                 new TextRun({
        //                                     break : 1
        //                                 }),
        //                                 new TextRun({
        //                                     text : "BIÊN BẢN THÍ NGHIỆM/ ",
        //                                     bold : true,
        //                                     font : "Arial",
        //                                     size : 28
        //                                 }),
        //                                 new TextRun({
        //                                     text : "TEST REPORT",
        //                                     bold : true,
        //                                     italics : true,
        //                                     font : "Arial",
        //                                     size : 28
        //                                 })
        //                             ],
        //                             alignment : AlignmentType.CENTER
        //                         }),
        //                     ],
        //                     columnSpan : 4,
        //                     alignment : AlignmentType.CENTER
        //                 }),
        //             ]
        //         })
        //     ],
        //     width: {
        //         size: 100,
        //         type: WidthType.PERCENTAGE,
        //     },
        // });
        // objectData.objectData().forEach(element => {
        //     table.addChildElement(element)
        // })

        // const doc = new Document({
        //     sections: [
        //         {
        //             children: [
        //                 table,
        //             ],
        //         },
        //     ],
        // });
        // // Used to export the file into a .docx file
        // Packer.toBuffer(doc).then((buffer) => {
        //     fs.writeFileSync(filePath.toString(), buffer);
        // });
    } catch(err) {
        console.log(err)
    }
}