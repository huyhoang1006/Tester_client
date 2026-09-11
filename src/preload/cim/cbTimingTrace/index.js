'use strict'
const { ipcRenderer } = require('electron')

export const cbTimingTracePreload = () => ({
    getCbTimingTracesByWorkTaskId: workTaskId =>
        ipcRenderer.invoke('getCbTimingTracesByWorkTaskId', workTaskId),
    getCbTimingTracesByWorkTaskIds: workTaskIds =>
        ipcRenderer.invoke('getCbTimingTracesByWorkTaskIds', workTaskIds),
})

