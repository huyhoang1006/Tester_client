const puppeteer = require('puppeteer');

async function excelToHTML(workbook) {
    // const worksheet = workbook.getWorksheet(0); // Lấy sheet đầu tiên
    var name = workbook.worksheets.map(x=>x.name)
    let worksheet = workbook.getWorksheet(name[0])
    var columns = worksheet.columns
    // Bắt đầu HTML table
    let htmlTable = '<table style="border-collapse: collapse;">';

    // Duyệt qua từng dòng và cột để tạo HTML table
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if(row.height == undefined) {
            row.height = '20px'
        } else {
            row.height = (row.height/0.75).toString() + 'px'
        }
        htmlTable += '<tr style="height: ' + row.height + '">';
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            let columnWidth = '64px'
            if(columns[colNumber-1].width == undefined || columns[colNumber-1].width == 'NaNpx') {
                columnWidth = '64px'
            } else {
                columnWidth = (columns[colNumber-1].width * 8).toString() + 'px'
            }
            let style = cell.style || {}; // Lấy style của cell
            let styleString = `style="padding:4px;width:${columnWidth};text-align:${style.alignment && style.alignment.horizontal ? style.alignment.horizontal : 'left'};${style.fill && style.fill.fgColor ? `background-color:${style.fill.fgColor.argb};` : ''}${style.font && style.font.color ? `color:${style.font.color.argb};` : ''}`;
            if(style.font != undefined) {
                styleString = styleString + `font-size:${style.font.size/0.75}px;`
                styleString = styleString + `font-family:${style.font.name};`
            }
            if(style.border != undefined) {
                if(style.border.left != undefined) {
                    styleString = styleString + `border-left: 1px solid black;`
                }
                if(style.border.right != undefined) {
                    styleString = styleString + `border-right: 1px solid black;`
                }
                if(style.border.top != undefined) {
                    styleString = styleString + `border-top: 1px solid black;`
                }
                if(style.border.bottom != undefined) {
                    styleString = styleString + `border-bottom: 1px solid black;`
                }
            }
            styleString = styleString + '"'
            htmlTable += `<td ${styleString}>${cell.value || ''}</td>`;
        });
        htmlTable += '</tr>';
    });

    // Đóng HTML table
    htmlTable += '</table>';    

    // Ghi bảng HTML vào file
    return htmlTable
}

async function createPDF(htmlContent, outputPath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(htmlContent);
    await page.waitForTimeout(1000);
    await page.pdf({ 
        path: outputPath,
        margin: {
            top: 50,
            left: 50,
            right: 50,
            bottom: 50,
        }, 
        format: 'A4' });

    await browser.close();
}

export const toPDF = async(workbook, pdfOutputPath) => {
    var sign = "error"
    var html = await excelToHTML(workbook)
    await createPDF(html, pdfOutputPath)
    return sign
}