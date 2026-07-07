/* eslint-disable */
import client from '@/utils/client'

// Lấy TOÀN BỘ danh sách testing equipment trên server để đồng bộ về client.
// NOTE: endpoint dưới đây là PLACEHOLDER — server chưa có API này trong api-docs.json.
// Khi server expose API, chỉnh lại đúng path (và trả về mảng testing equipment).
export const getAllTestingEquipment = () => {
    return client.get('/api/testing-equipment/get-all')
}

// (tuỳ chọn) Lấy chi tiết đầy đủ 1 thiết bị theo mrid — dùng khi cần tải sâu từng cái
export const getTestingEquipmentById = (id) => {
    return client.get(`/api/testing-equipment/${id}`)
}

// Đẩy (create/update) 1 thiết bị lên server.
// NOTE: endpoint + payload là PLACEHOLDER — server chưa có API này; chỉnh khi server sẵn sàng.
export const pushTestingEquipment = (data) => {
    return client.post('/api/testing-equipment/upsert', data)
}
