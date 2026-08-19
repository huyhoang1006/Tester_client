'use strict'
const { ipcRenderer } = require('electron')

/**
 * Đường cong từ hoá CT — chỉ có đường ĐỌC.
 *
 * Ghi điểm đo nằm trong cùng transaction với bài test, không mở riêng cho renderer:
 * hai đường ghi độc lập thì bảng và đường cong có thể lệch nhau mà không ai chặn.
 */
export const ctExcitationPointPreload = () => {
    return {
        getCtExcitationPointsByDatasetId: (datasetId) =>
            ipcRenderer.invoke('getCtExcitationPointsByDatasetId', datasetId),
        getCtExcitationPointsByDatasetIds: (datasetIds) =>
            ipcRenderer.invoke('getCtExcitationPointsByDatasetIds', datasetIds),
        getCtExcitationKneePointsByDatasetIds: (datasetIds) =>
            ipcRenderer.invoke('getCtExcitationKneePointsByDatasetIds', datasetIds),
    }
}
