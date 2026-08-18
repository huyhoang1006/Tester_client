'use strict'
const { ipcRenderer } = require('electron')
export const mRIDCheckPreload = () => {
    return {
        checkMridsExist: (items, userId = null) => ipcRenderer.invoke('checkMridsExist', items, userId),
        resolveMridPath: (mrid, mode) => ipcRenderer.invoke('resolveMridPath', { mrid, mode }),
        replaceLocalMrid: (oldMrid, newMrid) => ipcRenderer.invoke('replaceLocalMrid', { oldMrid, newMrid })
    }
}
