import client from '@/utils/client'

export const getOwnerOrganisation = () => {
    // API cũ có số 1 cứng ở cuối, giữ nguyên logic 
    return client.get("http://103.163.118.212:30830/api/organisation/get-owner-organisation")
}

export const getChildOrganisation = (organisationId) => {
    return client.get(`http://103.163.118.212:30830/api/organisation/get-child-organisation/${organisationId}`)
}

export const getChildSubstation = (organisationId) => {
    return client.get(`http://103.163.118.212:30830/api/substation/get-by-organisation/${organisationId}`)
}

export const getChildBay = (substationId) => {
    return client.get(`http://103.163.118.212:30830/api/bay/get-by-substation/${substationId}`)
}

export const getVoltageLevelBySubstationId = (substationId) => {
    return client.get(`http://103.163.118.212:30830/api/voltage-level/get-by-substation/${substationId}`)   
}

export const getBayByVoltageLevel = (voltageLevelId) => {
    return client.get(`http://103.163.118.212:30830/api/bay/get-by-voltage-level/${voltageLevelId}`)
}