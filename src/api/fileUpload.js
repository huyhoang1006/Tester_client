import client from '@/utils/client'
const FormData = require('form-data');
const API_PREFIX = 'api/v1'
const RESOURCE = 'file'

/* eslint-disable */
export const upload = async (file_Path) => {
    const fileRead = await window.electronAPI.readFileData(file_Path)
    const form = new FormData()
    form.append('file', new Blob([fileRead], {type: "text/plain"}), file_Path.split("/").pop());
    return client.post(`${API_PREFIX}/${RESOURCE}/upload`, form)
}

export const download = async (data) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/download/` + data)
}
