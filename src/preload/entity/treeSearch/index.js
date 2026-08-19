'use strict'
const { ipcRenderer } = require('electron')

/** Tìm kiếm trên cây — chỉ một hàm, chỉ đọc. */
export const treeSearchPreload = () => {
    return {
        searchTree: (userId, keyword, options) =>
            ipcRenderer.invoke('searchTree', userId, keyword, options),
        getNodePath: (mrid, mode) => ipcRenderer.invoke('getNodePath', mrid, mode),
    }
}
