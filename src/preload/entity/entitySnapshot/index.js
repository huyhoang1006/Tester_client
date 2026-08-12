'use strict'
const {ipcRenderer} = require('electron')
export const entitySnapshotPreload = () => {
    return {
        getEntitySnapshotByMrid : (mrid, type) => ipcRenderer.invoke('getEntitySnapshotByMrid', mrid, type),
        insertEntitySnapshot : (data) => ipcRenderer.invoke('insertEntitySnapshot', data),
        // `type` là bắt buộc, không phải tuỳ chọn: khoá chính của entity_snapshot là
        // (mrid, type), và handler bên main nhận đủ hai tham số. Trước đây chỗ này chỉ
        // truyền mrid, nên type sang tới nơi là undefined, câu DELETE không khớp dòng
        // nào và lặng lẽ không xoá gì.
        deleteEntitySnapshotByMrid : (mrid, type) => ipcRenderer.invoke('deleteEntitySnapshotByMrid', mrid, type),
    }
}