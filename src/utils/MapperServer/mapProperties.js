export default function mapProperties(data = {}) {
    return {
        name: data.name || '',
        region: data.region || '',
        plant: data.plant || '',
        address: data.address || '',
        city: data.city || '',
        state_province: data.state_province || '',
        postal_code: data.postal_code || '',
        country: data.country || '',
        phone_no: data.phone_no || '',
        email: data.email || ''
    };
}