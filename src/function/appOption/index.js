import { dialog } from 'electron'
import * as templateFunc from '../templatecontext/index'
import fs from 'fs'
import path from 'path'

export const openFileDialog = async (type) => {
    const filterMap = {
      excel: [{ name: 'Excel Files', extensions: ['xls', 'xlsx'] }],
      xml: [{ name: 'XML Files', extensions: ['xml'] }],
      word: [{ name: 'Word Files', extensions: ['doc', 'docx'] }],
      pdf: [{ name: 'PDF Files', extensions: ['pdf'] }]
    }

    const result = await dialog.showOpenDialog({
      title: 'Select file',
      properties: ['openFile'],
      filters: filterMap[type] || []
    })
    
    if(result.canceled) {
      return { canceled: true }
    } else {
      const sourcePath = result.filePaths[0]
      const destDir = templateFunc.getTemplateDir()

      const fileName = path.basename(sourcePath)
      const destPath = path.join(destDir, fileName)

      await fs.promises.copyFile(sourcePath, destPath)

      return {
        success: true,
        path: destPath,
        fileName: fileName
      }
    }
}

