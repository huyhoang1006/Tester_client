import client from '@/utils/client'


export const getOwnerOrganisation = () => {
    return client.get("http://222.252.22.158:8087/api/organisation/get-owner-organisation/1")
}

export const getChildOrganisation = (organisationId) => {
    return client.get(`http://222.252.22.158:8087/api/organisation/get-child-organisation/${organisationId}`)
}

export const getChildSubstation = (organisationId) => {
    return client.get(`http://222.252.22.158:8087/api/substation/get-by-organisation/${organisationId}`)
}

export const getChildBay = (substationId) => {
    return client.get(`http://222.252.22.158:8087/api/bay/get-by-substation/${substationId}`)
}

export const getVoltageLevelBySubstationId = (substationId) => {
    return client.get(`http://222.252.22.158:8087/api/voltage-level/get-by-substation/${substationId}`)  
    
}

export const getBayByVoltageLevel = (voltageLevelId) => {
    return client.get(`http://222.252.22.158:8087/api/bay/get-by-voltage-level/${voltageLevelId}`)
}
