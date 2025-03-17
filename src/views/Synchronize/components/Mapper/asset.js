export const circuitMapper = (asset) => {
    let data = {
        circuit : {
            id : asset.id,
            location_id : asset.location_id,
            properties : JSON.parse(asset.properties),
            circuitBreaker : JSON.parse(asset.circuitBreaker),
            ratings : JSON.parse(asset.ratings),
            contactSys : JSON.parse(asset.contactSys),
            others : JSON.parse(asset.others),
        },
        operating : JSON.parse(asset.operating),
        assessmentLimits : JSON.parse(asset.assessmentLimits),
        extend : JSON.parse(asset.extend)
    }
    return data
}

export const currentMapper = (asset) => {
    let data = {
        current : {
            id : asset.id,
            location_id : asset.location_id,
            properties : JSON.parse(asset.properties),
            ratings : JSON.parse(asset.ratings),
            config : JSON.parse(asset.config),
        },
        extend : JSON.parse(asset.extend)
    }
    return data
}

export const voltageMapper = (asset) => {
    let data = {
        voltage : {
            id : asset.id,
            location_id : asset.location_id,
            properties : JSON.parse(asset.properties),
            ratings : JSON.parse(asset.ratings),
            config : JSON.parse(asset.config),
        },
        extend : JSON.parse(asset.extend)
    }
    return data
}
export const disconnectorMapper = (asset) => {
    let data = {
        disconnect : {
            id : asset.id,
            location_id : asset.location_id,
            properties : JSON.parse(asset.properties),
            ratings : JSON.parse(asset.ratings),
            config : JSON.parse(asset.config),
        },
        extend : JSON.parse(asset.extend)
    }
    return data
}

export const surgeMapper = (asset) => {
    let data = {
        surge : {
            id : asset.id,
            location_id : asset.location_id,
            properties : JSON.parse(asset.properties),
            ratings : JSON.parse(asset.ratings),
            config : JSON.parse(asset.config),
        },
        extend : JSON.parse(asset.extend)
    }
    return data
}

export const powerMapper = (asset) => {
    let data = {
        power : {
            id : asset.id,
            location_id : asset.location_id,
            properties : JSON.parse(asset.properties),
            powerCable : JSON.parse(asset.powerCable),
            assessories : JSON.parse(asset.assessories),
        },
        extend : JSON.parse(asset.extend)
    }
    return data
}