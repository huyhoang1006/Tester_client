

export default {
    methods: {
        async processDuplicateAsset(node, apiGetEntity, mappingFunction, mixinObject, dataPropName) {
            try {
                // Helper nội bộ: lấy label hiển thị trên Tree cho một node
                const getDisplayLabel = (n) => {
                    if (!n) return ''
                    if (n.mode === 'asset') {
                        return (n.serial_number || n.serial_no || n.name || '').toString()
                    }
                    return (n.name || '').toString()
                }

                const getBaseLabel = (label) => {
                    if (!label) return ''
                    const str = label.toString().trim()
                    const m = str.match(/^(.*?)(?:\s*-\s*Copy(?:\s*\(\d+\))?)$/)
                    if (m && m[1] !== undefined) {
                        return m[1].trim()
                    }
                    return str
                }

                // Helper: sinh tên duplicate tiếp theo trong cùng parent
                const getNextDuplicateLabel = (currentNode, parent) => {
                    const currentLabel = getDisplayLabel(currentNode).trim()
                    const base = getBaseLabel(currentLabel) || 'Unknown'
                    const siblings = parent && Array.isArray(parent.children) ? parent.children : []

                    if (base !== currentLabel) {
                        const prefix = `${currentLabel} - Copy`
                        let maxIndex = 0
                        let hasPlainCopy = false

                        siblings.forEach((child) => {
                            const label = getDisplayLabel(child).trim()
                            if (!label) return

                            if (label === prefix) {
                                hasPlainCopy = true
                                if (maxIndex < 1) maxIndex = 1
                            } else if (label.startsWith(prefix + ' (') && label.endsWith(')')) {
                                const inside = label.substring(prefix.length + 2, label.length - 1)
                                const num = parseInt(inside, 10)
                                if (!isNaN(num) && num > maxIndex) {
                                    maxIndex = num
                                }
                            }
                        })

                        if (!hasPlainCopy && maxIndex === 0) {
                            return prefix // "X - Copy"
                        }
                        return `${prefix} (${maxIndex + 1})` // "X - Copy (2)", "X - Copy (3)", ...
                    }

                    const prefix = `${base} - Copy`

                    let maxIndex = 0
                    let hasPlainCopy = false

                    siblings.forEach((child) => {
                        const label = getDisplayLabel(child).trim()
                        if (!label) return

                        if (label === prefix) {
                            hasPlainCopy = true
                            if (maxIndex < 1) maxIndex = 1
                        } else if (label.startsWith(prefix + ' (') && label.endsWith(')')) {
                            const inside = label.substring(prefix.length + 2, label.length - 1)
                            const num = parseInt(inside, 10)
                            if (!isNaN(num) && num > maxIndex) {
                                maxIndex = num
                            }
                        }
                    })

                    if (!hasPlainCopy && maxIndex === 0) {
                        return prefix // "X - Copy"
                    }
                    return `${prefix} (${maxIndex + 1})` // "X - Copy (2)", "X - Copy (3)", ...
                }

                // 1. Tìm Node cha
                let parentNode = this.findNodeById(node.parentId, this.organisationClientList)

                if (!parentNode) {
                    const isRoot = node.parentId === this.$constant.ROOT || !node.parentId
                    if (isRoot)
                        parentNode = {
                            mrid: this.$constant.ROOT,
                            name: 'Root',
                            mode: 'root'
                        }
                    else {
                        this.$message.error(`Cannot find parent node.`)
                        return {
                            success: false
                        }
                    }
                }

                // 2. Lấy dữ liệu gốc từ API
                const entityRes = await apiGetEntity(node.mrid, this.$store.state.user.user_id, node.parentId)
                if (!entityRes.success || !entityRes.data) {
                    this.$message.error('Failed to fetch original data.')
                    return {
                        success: false
                    }
                }

                // 3. Map sang DTO & Clean dữ liệu (Xóa ID cũ)
                const dto = mappingFunction(entityRes.data)
                this.cleanDtoForDuplicate(dto)

                // --- Generate UUID mới cho các nested objects ---
                if (Array.isArray(dto.voltage)) {
                    dto.voltage.forEach((item) => {
                        if (item && !item.mrid) item.mrid = this.generateUuid()
                    })
                }
                if (Array.isArray(dto.frequency)) {
                    dto.frequency.forEach((item) => {
                        if (item && !item.mrid) item.mrid = this.generateUuid()
                    })
                }
                if (Array.isArray(dto.seconds)) {
                    dto.seconds.forEach((item) => {
                        if (item && !item.mrid) item.mrid = this.generateUuid()
                    })
                }
                if (Array.isArray(dto.currentFlow)) {
                    dto.currentFlow.forEach((item) => {
                        if (item && !item.mrid) item.mrid = this.generateUuid()
                    })
                }
                // Bushing specific: capacitance, percent
                if (Array.isArray(dto.capacitance)) {
                    dto.capacitance.forEach((item) => {
                        if (item && !item.mrid) item.mrid = this.generateUuid()
                    })
                }
                if (Array.isArray(dto.percent)) {
                    dto.percent.forEach((item) => {
                        if (item && !item.mrid) item.mrid = this.generateUuid()
                    })
                }
                // Power Cable specific
                if (Array.isArray(dto.temperature)) {
                    dto.temperature.forEach((item) => {
                        if (item && !item.mrid) item.mrid = this.generateUuid()
                    })
                }
                if (Array.isArray(dto.area)) {
                    dto.area.forEach((item) => {
                        if (item && !item.mrid) item.mrid = this.generateUuid()
                    })
                }
                if (Array.isArray(dto.length)) {
                    dto.length.forEach((item) => {
                        if (item && !item.mrid) item.mrid = this.generateUuid()
                    })
                }
                // Reactor specific
                if (Array.isArray(dto.inductance)) {
                    dto.inductance.forEach((item) => {
                        if (item && !item.mrid) item.mrid = this.generateUuid()
                    })
                }
                if (Array.isArray(dto.reactivePower)) {
                    dto.reactivePower.forEach((item) => {
                        if (item && !item.mrid) item.mrid = this.generateUuid()
                    })
                }
                if (Array.isArray(dto.mass)) {
                    dto.mass.forEach((item) => {
                        if (item && !item.mrid) item.mrid = this.generateUuid()
                    })
                }

                // Generate mrid cho objects chính
                if (dto.properties && !dto.properties.mrid) {
                    dto.properties.mrid = this.generateUuid()
                }
                if (!dto.lifecycleDateId) {
                    dto.lifecycleDateId = this.generateUuid()
                }
                if (!dto.productAssetModelId) {
                    dto.productAssetModelId = this.generateUuid()
                }
                if (!dto.assetPsrId) {
                    dto.assetPsrId = this.generateUuid()
                }
                if (!dto.assetInfoId) {
                    dto.assetInfoId = this.generateUuid()
                }
                if (!dto.psrId && parentNode && parentNode.mrid) {
                    dto.psrId = parentNode.mrid
                }

                // Setup attachment
                if (!dto.attachment) {
                    dto.attachment = {}
                }
                if (!dto.attachment.path || dto.attachment.path === '') {
                    dto.attachment.path = '[]'
                } else if (typeof dto.attachment.path !== 'string') {
                    try {
                        dto.attachment.path = JSON.stringify(dto.attachment.path)
                    } catch (e) {
                        dto.attachment.path = '[]'
                    }
                } else {
                    try {
                        JSON.parse(dto.attachment.path)
                    } catch (e) {
                        dto.attachment.path = '[]'
                    }
                }
                if (!dto.attachmentId) {
                    dto.attachmentId = this.generateUuid()
                }
                dto.attachment.id = dto.attachmentId
                dto.attachment.id_foreign = dto.properties?.mrid || null
                dto.attachment.type = dto.attachment.type || 'asset'
                dto.attachment.name = dto.attachment.name || null

                // Generate mrid cho ratings
                if (dto.ratings) {
                    const ratingFields = [
                        'rated_voltage',
                        'rated_frequency',
                        'rated_current',
                        'short_time_withstand_current',
                        'rated_duration_of_short_circuit',
                        'power_freq_withstand_voltage_earth_poles',
                        'power_freq_withstand_voltage_isolating_distance'
                    ]
                    ratingFields.forEach((field) => {
                        if (dto.ratings[field] && !dto.ratings[field].mrid) {
                            dto.ratings[field].mrid = this.generateUuid()
                        }
                    })
                }

                // Reactor specific nested objects
                if (dto.reactorRating) {
                    const reactorRatingFields = ['rated_voltage', 'rated_frequency', 'rated_current', 'rated_power', 'inductance']
                    reactorRatingFields.forEach((field) => {
                        if (dto.reactorRating[field] && !dto.reactorRating[field].mrid) {
                            dto.reactorRating[field].mrid = this.generateUuid()
                        }
                    })
                }
                if (dto.reactorOther) {
                    if (dto.reactorOther.weight && !dto.reactorOther.weight.mrid) {
                        dto.reactorOther.weight.mrid = this.generateUuid()
                    }
                }

                // Helper recursive generation
                const generateMridForNestedObject = (obj) => {
                    if (!obj || typeof obj !== 'object') return
                    if (Array.isArray(obj)) {
                        obj.forEach((item) => generateMridForNestedObject(item))
                    } else {
                        if (obj.mrid === null || obj.mrid === '') {
                            obj.mrid = this.generateUuid()
                        }
                        Object.values(obj).forEach((val) => {
                            if (val && typeof val === 'object' && val !== null) {
                                generateMridForNestedObject(val)
                            }
                        })
                    }
                }

                if (dto.ratings) generateMridForNestedObject(dto.ratings)

                if (dto.ratingsData) generateMridForNestedObject(dto.ratingsData)
                if (dto.othersData) generateMridForNestedObject(dto.othersData)
                if (dto.datasData) generateMridForNestedObject(dto.datasData)
                if (dto.configsData) generateMridForNestedObject(dto.configsData)

                if (dto.ctConfiguration) generateMridForNestedObject(dto.ctConfiguration)

                if (dto.vt_Configuration) generateMridForNestedObject(dto.vt_Configuration)

                if (dto.capacitance) generateMridForNestedObject(dto.capacitance)
                if (dto.dissipationFactor) generateMridForNestedObject(dto.dissipationFactor)

                if (dto.reactorRating) generateMridForNestedObject(dto.reactorRating)
                if (dto.reactorOther) generateMridForNestedObject(dto.reactorOther)
                if (dto.bushing) generateMridForNestedObject(dto.bushing)
                // Xóa children để tránh duplicate con đệ quy (nếu không cần thiết)
                if (dto.children) dto.children = []
                if (dto.voltageLevels) dto.voltageLevels = []
                if (dto.bays) dto.bays = []
                if (dto.assets) dto.assets = []

                // Đổi tên hiển thị theo quy tắc:
                //   "X" -> "X - Copy" -> "X - Copy (2)" -> "X - Copy (3)" ...
                const isAssetNode = node.mode === 'asset'
                const nextLabel = getNextDuplicateLabel(node, parentNode)

                if (isAssetNode) {
                    // Asset: dùng serial_no làm label chính trên cây
                    if (!dto.properties) dto.properties = {}
                    dto.properties.serial_no = nextLabel
                } else {
                    // Location / Job / Test: dùng name
                    dto.name = nextLabel
                }

                // Location logic
                let targetLocationId = dto.locationId
                if (!targetLocationId && ['substation', 'organisation', 'root'].includes(parentNode.mode)) {
                    try {
                        const locRes = await window.electronAPI.getLocationByPowerSystemResourceMrid(parentNode.mrid)
                        if (locRes.success) targetLocationId = locRes.data.mrid
                    } catch (e) {
                        console.warn('Failed to fetch location from parent node:', e)
                    }
                }
                if (!dto.locationId && targetLocationId) {
                    dto.locationId = targetLocationId
                }

                // --- BẮT ĐẦU PHẦN SỬA LỖI QUAN TRỌNG ---

                // Lấy dữ liệu mặc định từ Mixin (để đảm bảo biến Old là RỖNG/MỚI)
                let defaultMixinData = {}
                if (typeof mixinObject.data === 'function') {
                    defaultMixinData = mixinObject.data()
                }

                // Tạo context từ mixin
                const context = {
                    // Dữ liệu mới (đã clone và đổi ID)
                    [dataPropName]: dto,

                    // FIX: Dùng dữ liệu mặc định cho biến Old.
                    // KHÔNG copy từ dto sang Old, vì backend sẽ tưởng là update và insert vào bảng lịch sử gây lỗi.
                    [dataPropName + 'Old']: defaultMixinData[dataPropName + 'Old'],

                    parentData: parentNode,
                    locationId: targetLocationId,
                    attachmentData: [],
                    ...mixinObject.methods,
                    $message: this.$message,
                    $store: this.$store,
                    $constant: this.$constant,
                    $config: this.$config,
                    $common: this.$common,
                    $helper: this.$helper,
                    $uuid: this.$uuid
                }

                // Bind methods để 'this' trong mixin trỏ đúng vào context
                const vuePrototypeProps = ['$message', '$store', '$constant', '$config', '$common', '$helper', '$uuid', '$nextTick', '$set', '$delete']
                Object.keys(context).forEach((key) => {
                    if (typeof context[key] === 'function' && !vuePrototypeProps.includes(key) && !key.startsWith('$')) {
                        context[key] = context[key].bind(context)
                    }
                })

                // Copy các data khác từ mixin (nếu có)
                Object.keys(defaultMixinData).forEach((k) => {
                    if (k !== dataPropName && k !== dataPropName + 'Old') {
                        context[k] = defaultMixinData[k]
                    }
                })

                // --- KẾT THÚC PHẦN SỬA LỖI ---

                // Gọi hàm save tương ứng
                let saveResult
                if (typeof context.saveAsset === 'function') {
                    saveResult = await context.saveAsset()
                } else if (typeof context.saveSubstation === 'function') {
                    saveResult = await context.saveSubstation()
                } else if (typeof context.saveOrganisation === 'function') {
                    saveResult = await context.saveOrganisation()
                } else if (typeof context.saveBay === 'function') {
                    saveResult = await context.saveBay()
                } else if (typeof context.saveVoltageLevel === 'function') {
                    saveResult = await context.saveVoltageLevel()
                } else {
                    return {
                        success: false,
                        message: 'Save method not found in mixin'
                    }
                }

                // Xử lý kết quả trả về
                if (saveResult && saveResult.success) {
                    let newNodeData = {
                        mrid: '',
                        name: dto.name || (dto.properties ? dto.properties.apparatus_id : `${node.name} - Copy`),
                        serial_number: dto.properties ? dto.properties.serial_no : '',
                        parentId: parentNode.mrid,
                        parentName: parentNode.name,
                        parentArr: [
                            ...(parentNode.parentArr || []),
                            {
                                mrid: parentNode.mrid,
                                parent: parentNode.name
                            }
                        ],
                        mode: node.mode,
                        asset: node.asset,
                        job: node.job,
                        children: [],
                        expanded: false,
                        isLeaf: true
                    }

                    const resData = saveResult.data
                    if (resData) {
                        const keys = [
                            'substation',
                            'organisation',
                            'voltageLevel',
                            'bay',
                            'asset',
                            'surgeArrester',
                            'transformer',
                            'circuitBreaker',
                            'breaker',
                            'disconnector',
                            'powerCable',
                            'voltageTransformer',
                            'currentTransformer',
                            'rotatingMachine',
                            'capacitor',
                            'reactor',
                            'bushing'
                        ]
                        let mainObj = null
                        for (const k of keys) {
                            if (resData[k]) {
                                mainObj = resData[k]
                                break
                            }
                        }

                        if (mainObj) {
                            newNodeData.mrid = mainObj.mrid
                            newNodeData.id = mainObj.mrid
                            if (mainObj.name && mainObj.name !== mainObj.mrid) newNodeData.name = mainObj.name
                        } else if (resData.mrid) {
                            newNodeData.mrid = resData.mrid
                            newNodeData.id = resData.mrid
                            if (resData.name) newNodeData.name = resData.name
                        }
                    }
                    return {
                        success: true,
                        data: newNodeData
                    }
                } else {
                    return {
                        success: false,
                        message: saveResult ? saveResult.error : 'Save failed'
                    }
                }
            } catch (error) {
                console.error('Duplicate Error:', error)
                return {
                    success: false,
                    message: error.message
                }
            }
        },
    }
}