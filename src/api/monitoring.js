import client from '@/utils/client'

const API_PREFIX = 'api/v1'
const RESOURCE = 'monitoring'

export const creatMonitoring = (monitoring) => {
    return client.post(`${API_PREFIX}/${RESOURCE}`, monitoring)
}

export const getMornitoring = (id) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/${id}`)
}

export const updateMonitoring = (monitoring) => {
    const data = {
        ageing_insulation : monitoring.ageing_insulation,
        moisture_insulation : monitoring.moisture_insulation,
        bushings_online : monitoring.bushings_online,
        patital_discharge : monitoring.patital_discharge,

        bushing_df_worst : monitoring.bushing_df_worst,
        bushing_df_average : monitoring.bushing_df_average,
        bushing_c_worst  : monitoring.bushing_c_worst,
        bushing_c_average  : monitoring.bushing_c_average,
        condition_mois   : monitoring.condition_mois,
        health_index     : monitoring.health_index,
        weight_bushing_df  : monitoring.weight_bushing_df,
        weight_bushing_c : monitoring.weight_bushing_c,
        weight_mois      : monitoring.weight_mois
    }
    return client.put(`${API_PREFIX}/${RESOURCE}/${monitoring.id}`, data)
}

export const getMornitoringByAssetId = (id) => {
    return client.get(`${API_PREFIX}/${RESOURCE}?assetId=${id}`)
}

export const getAllMornitoringByAssetId = (id) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/getAll/${id}`)
}

export const getLastMornitoringByAssetId = (id) => {
    return client.get(`${API_PREFIX}/${RESOURCE}/getLast/${id}`)
}