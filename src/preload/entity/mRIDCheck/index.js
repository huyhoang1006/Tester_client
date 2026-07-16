'use strict'
const { ipcRenderer } = require('electron')
export const mRIDCheckPreload = () => {
    return {
        checkMridsExist: (items) => ipcRenderer.invoke('checkMridsExist', items),
        resolveMridPath: (mrid, mode) => ipcRenderer.invoke('resolveMridPath', { mrid, mode }),
        replaceLocalMrid: (oldMrid, newMrid) => ipcRenderer.invoke('replaceLocalMrid', { oldMrid, newMrid })
    }
}
