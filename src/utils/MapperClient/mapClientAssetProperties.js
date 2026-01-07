export default function mapClientAssetProperties(data = {}) {
    return {
        asset_type: data.type || data.asset_type || '',
        serial_no: data.serial_number || data.serial_no || '',
        manufacturer: data.manufacturer || '',
        manufacturer_type: data.manufacturer_type || '',
        manufacturing_year: data.manufacturing_year || data.manufacturer_year || '',
        country: data.country || data.country_of_origin || '',
        apparatus_id: data.apparatus_id || ''
    }
}