export default function mapClientProperties(data = {}) {
    return {
        name: data.name || '',
        region: data.region || data.generation || '',
        plant: data.plant || data.industry || '',
        address: data.street || data.address || '',
        city: data.city || '',
        state_province: data.state_or_province || data.state_province || '',
        postal_code: data.postal_code || '',
        country: data.country || '',
        phone_no: data.phoneNumber || data.phone_no || '',
        email: data.email || ''
    }
}

