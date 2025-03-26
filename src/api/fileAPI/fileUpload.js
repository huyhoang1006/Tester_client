import client from '@/utils/client'
const FormData = require('form-data');
const API_PREFIX = 'api/v1'
const RESOURCE = 'file'

/* eslint-disable */
export const upload = async (file_Path, name, uuid) => {
    const form = new FormData()
    form.append('file', new Blob([fileRead], {type: "text/plain"}), file_Path.split("/").pop());
    return client.post(`${API_PREFIX}/${RESOURCE}/upload/` + name + '/' + uuid, form)
}

export const download = async (data, name, uuid) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/download/` + data +"/" + name + "/" + uuid)
}

export const updateFile = async (deleteList, addingList, name, uuid) => {
    const form = new FormData()
    for(let i in addingList) {
        form.append('file', addingList[i], addingList[i].name);
    }
    for(let j in deleteList) {
        form.append('deleteFile', deleteList[j])
    }
    return client.post(`${API_PREFIX}/${RESOURCE}/update/` + name + "/" + uuid, form)
}

export const downloadFile = async (data) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/downloadFile/` + data)
}
