export default function mapAssetProperties(data = {}) {
    return {
        asset: data.asset || '',
        asset_type: data.asset_type || '',
        serial_no: data.serial_no || '',
        manufacturer: data.manufacturer || '',
        manufacturer_type: data.manufacturer_type || '',
        manufacturing_year: data.manufacturing_year || '',
        country: data.country || '',
        apparatus_id: data.apparatus_id || ''
    };
}