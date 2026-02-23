export default function mapClientProperties(data = {}) {
    // Format geo coordinates as "x, y" if both exist
    let geoCoordinates = ''
    
    // Case 1: Flat fields (Organisation from fetchChildren)
    if (data.geo_x && data.geo_y) {
        geoCoordinates = `${data.geo_x}, ${data.geo_y}`
    } else if (data.geo_x) {
        geoCoordinates = data.geo_x
    } else if (data.geo_y) {
        geoCoordinates = data.geo_y
    }
    // Case 2: Nested positionPoints structure (Substation from Entity)
    else if (data.positionPoints && data.positionPoints.x && data.positionPoints.x.length > 0) {
        const firstX = data.positionPoints.x[0]?.coor
        const firstY = data.positionPoints.y[0]?.coor
        if (firstX && firstY) {
            geoCoordinates = `${firstX}, ${firstY}`
        } else if (firstX) {
            geoCoordinates = firstX
        } else if (firstY) {
            geoCoordinates = firstY
        }
    }
    
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
        email: data.email || '',
        geo_coordinates: geoCoordinates
    }
}
