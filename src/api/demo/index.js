/* eslint-disable */
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

export const getAssetByOwner = (ownerId, mode) => {
    // 1. Lấy chuỗi JSON từ Local Storage
    const userString = localStorage.getItem('user');

    // 2. Phân tích cú pháp chuỗi thành đối tượng JavaScript
    // Cần kiểm tra userString có tồn tại không để tránh lỗi
    if (!userString) {
        console.error("Không tìm thấy dữ liệu 'user' trong Local Storage.");
        return Promise.reject(new Error("Missing user data"));
    }

    try {
        const user = JSON.parse(userString);

        // 3. Truy cập thuộc tính user_id

        // 4. Gọi API
        return client.get(`http://103.163.118.212:30830/api/asset/get-by-owner/${ownerId}/${mode}`);

    } catch (e) {
        console.error("Lỗi phân tích cú pháp JSON cho dữ liệu 'user':", e);
        return Promise.reject(new Error("Invalid user data format"));
    }
}