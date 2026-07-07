export default {
    methods: {
        async processDuplicateAsset(node, apiGetEntity, mappingFunction, mixinObject, dataPropName, overrideParent = null) {
            try {
                // Helper nội bộ: lấy label hiển thị trên Tree cho một node
                const getDisplayLabel = (n) => {
                    if (!n) return ''
                    if (n.mode === 'asset') {
                        return (n.apparatus_id || n.serial_number || n.serial_no || n.name || '').toString()
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

                // 1. Find parent node (prefer overrideParent when duplicating recursively into a new parent)
                let parentNode = overrideParent || this.findNodeById(node.parentId, this.organisationClientList)

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

                // JOB: remap nhất quán TẤT CẢ id nội bộ. Sinh id mới cho mọi 'mrid' trong dto,
                // rồi thay MỌI chuỗi tham chiếu tới id cũ (work_task_id, testing_equipment_id, work_id...)
                // bằng id mới. Ref NGOÀI (asset_id, procedure_id, test_type_id...) không nằm trong map -> giữ nguyên.
                // -> copy độc lập hoàn toàn, không re-point/ghi đè dữ liệu test của job GỐC, và không lệch FK nội bộ.
                if (node.mode === 'job') {
                    const idMap = {}
                    const collect = (obj, depth = 0) => {
                        if (!obj || typeof obj !== 'object' || depth > 20) return
                        if (Array.isArray(obj)) { obj.forEach((o) => collect(o, depth + 1)); return }
                        if (typeof obj.mrid === 'string' && obj.mrid && !idMap[obj.mrid]) {
                            idMap[obj.mrid] = this.generateUuid()
                        }
                        Object.values(obj).forEach((v) => { if (v && typeof v === 'object') collect(v, depth + 1) })
                    }
                    collect(dto)
                    const remap = (obj, depth = 0) => {
                        if (!obj || typeof obj !== 'object' || depth > 20) return
                        if (Array.isArray(obj)) { obj.forEach((o) => remap(o, depth + 1)); return }
                        Object.keys(obj).forEach((k) => {
                            const v = obj[k]
                            if (typeof v === 'string' && idMap[v]) obj[k] = idMap[v]
                            else if (v && typeof v === 'object') remap(v, depth + 1)
                        })
                    }
                    remap(dto)
                }

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

                // Entity primary mrid: assets use dto.properties.mrid; locations use their own id.
                let primaryMrid = dto.properties ? dto.properties.mrid : null
                if (!dto.properties) {
                    // Location duplicate: clear ALL *Id references (except the parent link and userId)
                    // so checkX creates brand-new copies. Otherwise saving would UPSERT the shared
                    // rows (user link, org_psr, location, person...) and re-point them from the
                    // original to the copy -> the original loses its links and disappears.
                    const parentField = node.mode === 'substation' ? 'organisationId'
                        : node.mode === 'voltageLevel' ? 'substationId'
                            : node.mode === 'organisation' ? 'parentId' : null
                    Object.keys(dto).forEach((k) => {
                        if (/Id$/.test(k) && k !== parentField && k !== 'userId') dto[k] = ''
                    })
                    // Regenerate the OWN id
                    primaryMrid = this.generateUuid()
                    if (node.mode === 'substation') dto.subsId = primaryMrid
                    else if (node.mode === 'voltageLevel') dto.voltageLevelId = primaryMrid
                    else if (node.mode === 'organisation') dto.organisationId = primaryMrid
                    else if (node.mode === 'bay') dto.bayId = primaryMrid
                    else dto.mrid = primaryMrid
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
                dto.attachment.id_foreign = primaryMrid || dto.properties?.mrid || null
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

                // -----------------------------------------------------------
                // SURGE ARRESTER SPECIFIC LOGIC (Fix Duplicate Error)
                // -----------------------------------------------------------
                if (dto.ratings && dto.ratings.tableRating && Array.isArray(dto.ratings.tableRating)) {
                    dto.ratings.tableRating.forEach(item => {
                        // Tạo ID mới cho dòng rating (Asset Unit)
                        if (!item.mrid) item.mrid = this.generateUuid();

                        // QUAN TRỌNG: Tạo ID mới cho Info (Asset Info Unit) để không trùng với bản gốc
                        item.assetInfoId = this.generateUuid();

                        // Tạo ID mới cho các object con bên trong (Voltage, Current, etc.)
                        const nestedFields = [
                            'ratedVoltage', 'maximumVoltage', 'continousVoltage',
                            'shortCurrent', 'ratedCircuit', 'polesVoltage', 'isoVoltage'
                        ];

                        nestedFields.forEach(field => {
                            if (item[field]) {
                                item[field].mrid = this.generateUuid();
                            }
                        });
                    });
                }


                // -----------------------------------------------------------
                // TRANSFORMER SPECIFIC LOGIC
                // -----------------------------------------------------------
                if (dto.impedances && dto.shortCircuitTestTransformerEndInfo) {
                    const impedanceArrays = ['prim_sec', 'prim_tert', 'sec_tert'];
                    impedanceArrays.forEach(key => {
                        if (Array.isArray(dto.impedances[key])) {
                            dto.impedances[key].forEach(item => {
                                const oldMrid = item.mrid;
                                const newMrid = this.generateUuid();
                                item.mrid = newMrid;

                                // Cập nhật khóa ngoại trong bảng liên kết
                                dto.shortCircuitTestTransformerEndInfo.forEach(info => {
                                    if (info.short_circuit_test_id === oldMrid) {
                                        info.short_circuit_test_id = newMrid;
                                    }
                                });

                                // Tạo mới ID cho các object con trong impedance
                                if (item.base_power) {
                                    item.base_power.mrid = this.generateUuid();
                                    if (item.base_power.data) item.base_power.data.mrid = this.generateUuid();
                                }
                                if (item.base_voltage) {
                                    item.base_voltage.mrid = this.generateUuid();
                                    if (item.base_voltage.data) item.base_voltage.data.mrid = this.generateUuid();
                                }
                                if (item.short_circuit_impedances_uk) item.short_circuit_impedances_uk.mrid = this.generateUuid();
                                if (item.load_losses_pk) item.load_losses_pk.mrid = this.generateUuid();
                            });
                        }
                    });

                    // Tạo mới ID cho zero sequence impedance
                    if (dto.impedances.zero_sequence_impedance) {
                        const zsi = dto.impedances.zero_sequence_impedance;
                        zsi.mrid = this.generateUuid();
                        if (zsi.base_power) {
                            zsi.base_power.mrid = this.generateUuid();
                            if (zsi.base_power.data) zsi.base_power.data.mrid = this.generateUuid();
                        }
                        if (zsi.base_voltage) {
                            zsi.base_voltage.mrid = this.generateUuid();
                            if (zsi.base_voltage.data) zsi.base_voltage.data.mrid = this.generateUuid();
                        }
                        if (zsi.zero_percent) {
                            Object.values(zsi.zero_percent).forEach(zp => {
                                if (zp) {
                                    zp.mrid = this.generateUuid();
                                    if (zp.data) zp.data.mrid = this.generateUuid();
                                }
                            });
                        }
                    }
                    if (dto.impedances.ref_temp) dto.impedances.ref_temp.mrid = this.generateUuid();
                }

                // Sau khi đã update link, giờ mới cấp ID mới cho chính các row trong bảng liên kết
                if (dto.shortCircuitTestTransformerEndInfo) {
                    dto.shortCircuitTestTransformerEndInfo.forEach(info => info.mrid = this.generateUuid());
                }

                if (dto.others) generateMridForNestedObject(dto.others)

                // Xử lý Tap Changer: Cấp ID cho voltage_table (field .id)
                if (dto.tap_changers) {
                    generateMridForNestedObject(dto.tap_changers);
                    if (dto.tap_changers.voltage_table && Array.isArray(dto.tap_changers.voltage_table)) {
                        dto.tap_changers.voltage_table.forEach(row => {
                            // Cấp ID mới cho dòng (Mapper dùng .id để gán vào TapChangerTablePoint.mrid)
                            row.id = this.generateUuid();
                            // Cấp ID mới cho object voltage bên trong
                            if (row.voltage) {
                                row.voltage.mrid = this.generateUuid();
                            }
                        });
                    }
                }

                if (dto.bushing_data) generateMridForNestedObject(dto.bushing_data)
                if (dto.surge_arrester) generateMridForNestedObject(dto.surge_arrester)
                if (dto.oldTransformerEndInfo) generateMridForNestedObject(dto.oldTransformerEndInfo)
                if (dto.winding_configuration) generateMridForNestedObject(dto.winding_configuration)
                // -----------------------------------------------------------

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
                    // Asset: dùng apparatus_id làm label chính trên cây, giữ serial_no nguyên
                    if (!dto.properties) dto.properties = {}
                    dto.properties.apparatus_id = nextLabel
                    // serial_no giữ nguyên từ bản gốc, không thay đổi
                } else if (node.mode === 'job') {
                    // Job: tên nằm ở properties.name
                    if (!dto.properties) dto.properties = {}
                    dto.properties.name = nextLabel
                } else {
                    // Location: dùng name
                    dto.name = nextLabel
                }

                // Point the copy's parent field to its parent (works for both top-level duplicate
                // and recursive duplicate, since parentNode = overrideParent || the real parent).
                if (parentNode && parentNode.mrid) {
                    const pMrid = parentNode.mrid
                    if (node.mode === 'organisation') {
                        if (parentNode.mode === 'organisation') dto.parentId = pMrid
                    } else if (node.mode === 'substation') {
                        dto.organisationId = pMrid
                    } else if (node.mode === 'voltageLevel') {
                        dto.substationId = pMrid
                    } else if (node.mode === 'bay') {
                        // NOTE: dùng null (không phải '') cho field còn lại, nếu không FK bay.substation/voltage_level sẽ fail
                        if (parentNode.mode === 'voltageLevel') { dto.voltage_level = pMrid; dto.substation = null }
                        else { dto.substation = pMrid; dto.voltage_level = null }
                    } else if (node.mode === 'asset') {
                        dto.psrId = pMrid
                        if (overrideParent) dto.locationId = null // re-derived from the new parent in Location logic below
                    } else if (node.mode === 'job') {
                        // job's parent is the asset; link via properties.asset_id
                        if (dto.properties) dto.properties.asset_id = pMrid
                    }
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
                    parent: parentNode, // BayMixin.checkBay() uses this.parent
                    // Job mixins (checkAssetId/checkDataMeasurement) read this.assetData.properties.mrid.
                    // For a job, parentNode is the asset -> expose its mrid.
                    assetData: { properties: { mrid: (parentNode && parentNode.mrid) || null } },
                    locationId: targetLocationId,
                    // organisationId: substation's checkOrganisation() does dto.organisationId = this.organisationId,
                    // so the parent org must be exposed on the context (parentNode = the org for a substation).
                    organisationId: (node.mode === 'substation') ? parentNode.mrid : this.organisationId,
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
                } else if (typeof context.saveJob === 'function') {
                    saveResult = await context.saveJob()
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
                        name: node.mode === 'asset' ? (dto.properties?.apparatus_id || nextLabel) : (dto.name || nextLabel),
                        apparatus_id: node.mode === 'asset' ? dto.properties?.apparatus_id : undefined,
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
                        type: dto.properties?.type || null,
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
                            // Ưu tiên apparatus_id cho asset nodes - luôn dùng từ DTO đã set
                            if (node.mode === 'asset') {
                                newNodeData.name = dto.properties?.apparatus_id || mainObj.apparatus_id || mainObj.name || nextLabel
                                newNodeData.apparatus_id = dto.properties?.apparatus_id || mainObj.apparatus_id
                            } else {
                                if (mainObj.name && mainObj.name !== mainObj.mrid) newNodeData.name = mainObj.name
                            }
                        } else if (resData.mrid) {
                            newNodeData.mrid = resData.mrid
                            newNodeData.id = resData.mrid
                            // Ưu tiên apparatus_id cho asset nodes - luôn dùng từ DTO đã set
                            if (node.mode === 'asset') {
                                newNodeData.name = dto.properties?.apparatus_id || resData.apparatus_id || resData.name || nextLabel
                                newNodeData.apparatus_id = dto.properties?.apparatus_id || resData.apparatus_id
                            } else {
                                if (resData.name) newNodeData.name = resData.name
                            }
                        }
                    }

                    // Job: mrid nằm ở properties.mrid; đảm bảo node cây có mrid + tên để click mở được
                    if (node.mode === 'job') {
                        if (!newNodeData.mrid && dto.properties && dto.properties.mrid) {
                            newNodeData.mrid = dto.properties.mrid
                            newNodeData.id = dto.properties.mrid
                        }
                        newNodeData.name = (dto.properties && dto.properties.name) || nextLabel
                        newNodeData.mode = 'job'
                        newNodeData.job = node.job
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