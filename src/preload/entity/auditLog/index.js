'use strict'
const { ipcRenderer } = require('electron')

export const auditLogPreload = () => {
    return {
        writeAuditLogEntry: (options) => ipcRenderer.invoke('writeAuditLogEntry', options)
    }
}
