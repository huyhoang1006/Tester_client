const cleanKey = (value) => String(value || '').trim()

const getAssetTypeFieldName = (properties) => {
    if (Object.prototype.hasOwnProperty.call(properties, 'asset_type')) return 'asset_type'
    return 'type'
}

export const getAssetDuplicateKeys = (dto) => {
    const properties = dto && dto.properties ? dto.properties : {}
    const assetTypeField = getAssetTypeFieldName(properties)

    return {
        serialNumber: cleanKey(properties.serial_no),
        manufacturer: cleanKey(properties.manufacturer),
        assetType: cleanKey(properties[assetTypeField]),
        assetTypeField,
        excludeMrid: cleanKey(properties.mrid || dto?.mrid)
    }
}

const applyDuplicateKeys = (dto, keys) => {
    const properties = dto && dto.properties ? dto.properties : {}
    properties.serial_no = cleanKey(keys.serialNumber)
    properties.manufacturer = cleanKey(keys.manufacturer)

    properties[keys.assetTypeField || getAssetTypeFieldName(properties)] = cleanKey(keys.assetType)
}

const duplicateKeyField = (h, label, value, onInput) => h('div', {
    style: {
        display: 'grid',
        gridTemplateColumns: '130px minmax(0, 1fr)',
        alignItems: 'center',
        gap: '10px',
        marginTop: '10px'
    }
}, [
    h('span', {
        style: {
            color: '#606266',
            fontSize: '13px'
        }
    }, label),
    h('el-input', {
        props: {
            value,
            size: 'small',
            clearable: true
        },
        on: {
            input: onInput
        }
    })
])

const requestDuplicateKeyUpdate = async (vm, keys) => {
    const h = vm.$createElement
    const draft = {
        serialNumber: keys.serialNumber,
        manufacturer: keys.manufacturer,
        assetType: keys.assetType
    }

    try {
        await vm.$msgbox({
            title: 'Duplicate asset',
            message: h('div', { style: { width: '420px', maxWidth: '100%' } }, [
                h('p', {
                    style: {
                        margin: '0 0 8px',
                        color: '#303133',
                        lineHeight: '20px'
                    }
                }, 'An asset with the same Serial number, Manufacturer, and Asset type already exists. Please update at least one value before saving.'),
                duplicateKeyField(h, 'Serial number', draft.serialNumber, (value) => { draft.serialNumber = value }),
                duplicateKeyField(h, 'Manufacturer', draft.manufacturer, (value) => { draft.manufacturer = value }),
                duplicateKeyField(h, 'Asset type', draft.assetType, (value) => { draft.assetType = value })
            ]),
            showCancelButton: true,
            confirmButtonText: 'Save with new values',
            cancelButtonText: 'Cancel',
            closeOnClickModal: false,
            closeOnPressEscape: false,
            beforeClose: (action, instance, done) => {
                if (action !== 'confirm') {
                    done()
                    return
                }

                if (!cleanKey(draft.serialNumber) || !cleanKey(draft.manufacturer) || !cleanKey(draft.assetType)) {
                    vm.$message.error('Serial number, Manufacturer, and Asset type are required.')
                    return
                }

                done()
            }
        })

        return {
            serialNumber: cleanKey(draft.serialNumber),
            manufacturer: cleanKey(draft.manufacturer),
            assetType: cleanKey(draft.assetType),
            assetTypeField: keys.assetTypeField,
            excludeMrid: keys.excludeMrid
        }
    } catch (error) {
        return null
    }
}

export const ensureUniqueAssetBeforeSave = async (vm, dto) => {
    let keys = getAssetDuplicateKeys(dto)

    while (keys.serialNumber && keys.manufacturer && keys.assetType) {
        const result = await window.electronAPI.checkAssetDuplicateByKeys(keys)
        if (result && result.success === false) {
            throw new Error(result.message || 'Cannot check asset duplicate')
        }

        if (!result || !result.exists) {
            applyDuplicateKeys(dto, keys)
            return true
        }

        const updatedKeys = await requestDuplicateKeyUpdate(vm, keys)
        if (!updatedKeys) {
            return false
        }

        keys = updatedKeys
    }

    return true
}
