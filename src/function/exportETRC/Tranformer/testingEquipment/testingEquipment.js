// import { Paragraph, TextRun, TableCell, TableRow, AlignmentType  } from "docx";
export const objectData = () => {
    try { 
        const data = [
            // new TableRow({
            //     children: [
            //         new TableCell({
            //             children : [
            //                 new Paragraph({
            //                     children : [
            //                         new TextRun({
            //                             text : "Đối tượng thí nghiệm/ ",
            //                             bold : true,
            //                             font : "Arial",
            //                             size : 20
            //                         }),
            //                     ],
            //                     alignment : AlignmentType.CENTER
            //                 }),
            //             ],
            //         }),
            //         new TableCell({
            //             children : [
            //                 new Paragraph({
            //                     children : [
            //                         new TextRun({
            //                             text : "MÁY BIẾN ÁP LỰC/ ",
            //                             bold : true,
            //                             font : "Arial",
            //                             size : 20
            //                         }),
            //                         new TextRun({
            //                             text : "POWER TRANSFORMER",
            //                             bold : true,
            //                             font : "Arial",
            //                             size : 20
            //                         }),
            //                     ],
            //                     alignment : AlignmentType.CENTER
            //                 }),
            //             ],
            //             columnSpan : 3
            //         }),
            //     ],
            // }),
            // new TableRow({
            //     children : [
            //         new TableCell({
            //             children : [
            //                 new Paragraph({
            //                     children : [
            //                         new TextRun({
            //                             text : "Object",
            //                             bold : true,
            //                             font : "Arial",
            //                             size : 20
            //                         })
            //                     ]
            //                 })
            //             ]
            //         }),
            //         new TableCell({
            //             children : [
            //                 new Paragraph({
            //                     children : [
            //                         new TextRun({
            //                             text : "Kiểu/ ",
            //                             font : "Arial",
            //                             size : 20
            //                         }),
            //                         new TextRun({
            //                             text : "Type: ",
            //                             italics : true,
            //                             font : "Arial",
            //                             size : 20
            //                         })
            //                     ]
            //                 })
            //             ],
            //             columnSpan : 2
            //         }),
            //         new TableCell({
            //             children : [
            //                 new Paragraph({
            //                     children : [
            //                         new TextRun({
            //                             text : "Số chế tạo/ ",
            //                             font : "Arial",
            //                             size : 20
            //                         }),
            //                         new TextRun({
            //                             text : "Series No: ",
            //                             italics : true,
            //                             font : "Arial",
            //                             size : 20
            //                         })
            //                     ]
            //                 })
            //             ]
            //         })
            //     ]
            // }),
        ]
        return data 
    }
    catch(err) {
        console.log(err)
    }
}