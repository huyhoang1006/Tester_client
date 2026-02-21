import {ipcMain} from 'electron'
import * as appOptionFunc from '../../function/appOption/index'
export const openFileDialog = () => {
    ipcMain.handle('openFileDialog', async function (event, type) {
        if (type === 'excel') {
            return await appOptionFunc.openFileDialog(type)
        }
        if (type === 'xml') {
            return await appOptionFunc.openFileDialog(type)
        }
        if (type === 'word') {
            return await appOptionFunc.openFileDialog(type)
        }
        if (type === 'pdf') {
            return await appOptionFunc.openFileDialog(type)
        }
         return { canceled: true }
    })
}

export const active = () => {
    openFileDialog()
}