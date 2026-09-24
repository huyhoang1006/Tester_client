import fs from 'fs'
import PizZip from 'pizzip'
import { parseXml, childrenNamed, child, textOf, unitOf } from './xmlLite'
import {
    readPtmChannelConfiguration,
    resolvePtmMeasurementChannel,
} from './measurementChannelResolver'

/**
 * ĐỌC FILE .ptm CỦA OMICRON.
 *
 * `.ptm` là một file ZIP chứa XML, không mã hoá:
 *
 *     Relationship.xml      ban ke khai: moi file la loai gi
 *     Jobs/*.xml            job: ten, ngay, nguoi thu, dieu kien, danh sach TestId
 *     Assets/*.xml          thiet bi (tCurrentTransformer, tCircuitBreaker...)
 *     Substations/*.xml     vi tri
 *     Tests/*.xml           moi bai test mot file
 *     Blobs/*.blob          du lieu song nhi phan — chi doc khi da xac minh dinh dang
 *     CustomFields, Attachments, metadata.xml, settings.xml
 *
 * ─── VÌ SAO ĐI TỪ Relationship.xml, KHÔNG DUYỆT THƯ MỤC ─────────────────────
 *
 * Bản kê khai nói thẳng mỗi file là loại gì:
 *
 *     <Relationship Type="CurrentTransformer" Target="/Assets/3ee61d72....xml" />
 *     <Relationship Type="CTExcitationTest"   Target="/Tests/7439e769....xml" />
 *
 * Duyệt thư mục thì phải suy loại từ tên thẻ gốc (`tCTExcitationTest` → bỏ chữ `t`, bỏ
 * chữ `Test`…) — đoán mò, và sai lặng lẽ khi OMICRON đổi tên thẻ. `Type` là thứ chính họ
 * khai, dùng nó.
 *
 * ─── XỬ LÝ `NaN` TẠI ĐÂY, MỘT CHỖ ───────────────────────────────────────────
 *
 * OMICRON ghi `NaN` cho ô số chưa có giá trị — hơn 30 chỗ trong một file. Để nguyên thì
 * ô trên màn hình hiện chữ "NaN". Chuẩn hoá ngay ở tầng đọc, để mọi tầng trên không phải
 * nhớ nữa; quên một chỗ là lộ ra giao diện.
 */

/** `NaN`, rỗng, hoặc khoảng trắng → `''`. Còn lại giữ nguyên chuỗi gốc. */
const cleanValue = (raw) => {
    const text = String(raw == null ? '' : raw).trim()
    if (text === '' || text === 'NaN') return ''
    return text
}

/** Đọc một thẻ số kèm đơn vị: `<KneeVoltage unit="V">49.13</KneeVoltage>`. */
const measure = (node, name) => ({
    value: cleanValue(textOf(node, name)),
    unit: unitOf(node, name),
})

/** Bảng kê khai: đường dẫn trong zip → loại. */
const readManifest = (zip) => {
    const file = zip.file('Relationship.xml')
    if (!file) return []
    const root = parseXml(file.asText())
    return childrenNamed(root, 'Relationship').map(rel => ({
        id: rel.attrs.Id || '',
        type: rel.attrs.Type || '',
        // Target dạng '/Assets/xxx.xml' — pizzip đánh chỉ mục không có dấu `/` đầu.
        target: String(rel.attrs.Target || '').replace(/^\/+/, ''),
    }))
}

const parseEntry = (zip, target) => {
    const file = zip.file(target)
    if (!file) return null
    return parseXml(file.asText())
}

const readBlobBuffer = (zip, blobId) => {
    if (!zip || !blobId) return null
    const file = zip.file(`Blobs/${blobId}.blob`)
    return file ? Buffer.from(file.asUint8Array()) : null
}

/**
 * CIBANO Motor Current stores one waveform as three parallel blobs:
 * time (Int64 nanoseconds), current (Float32 A), voltage (Float32 V).
 * The order is declared by BlobDataIds in the test XML and was verified against
 * the exported CIBANO table. Time is made relative to the first sample.
 */
const readMotorCurrentWaveform = (zip, blobIds) => {
    const ids = Array.isArray(blobIds) ? blobIds.filter(Boolean) : []
    if (ids.length < 3) return []

    const timeBlob = readBlobBuffer(zip, ids[0])
    const currentBlob = readBlobBuffer(zip, ids[1])
    const voltageBlob = readBlobBuffer(zip, ids[2])
    if (!timeBlob || !currentBlob || !voltageBlob) return []

    const count = Math.min(
        Math.floor(timeBlob.length / 8),
        Math.floor(currentBlob.length / 4),
        Math.floor(voltageBlob.length / 4)
    )
    if (count === 0) return []

    const firstTime = timeBlob.readBigInt64LE(0)
    const points = new Array(count)
    for (let index = 0; index < count; index += 1) {
        const elapsedNanoseconds = timeBlob.readBigInt64LE(index * 8) - firstTime
        points[index] = {
            time: String(Number(elapsedNanoseconds) / 1000000000),
            current: String(currentBlob.readFloatLE(index * 4)),
            voltage: String(voltageBlob.readFloatLE(index * 4)),
        }
    }
    return points
}

const BLOB_VALUE_READERS = {
    int32: { size: 4, read: (buffer, offset) => buffer.readInt32LE(offset) },
    uint32: { size: 4, read: (buffer, offset) => buffer.readUInt32LE(offset) },
    float32: { size: 4, read: (buffer, offset) => buffer.readFloatLE(offset) },
    float64: { size: 8, read: (buffer, offset) => buffer.readDoubleLE(offset) },
    int64: { size: 8, read: (buffer, offset) => buffer.readBigInt64LE(offset) },
}

const timingUnit = measurementType => ({
    Current: 'A',
    Voltage: 'V',
    Digital: '',
    Counter: 's',
}[measurementType] || '')

const timingTraceName = (column, resolved) => {
    const measurementType = cleanValue(textOf(column, 'MeasurementType'))
    const sourceType = cleanValue(column.attrs.ColumnType)
    const group = cleanValue(textOf(column, 'Group'))
    const groupIndex = cleanValue(textOf(column, 'GroupIndex'))
    const amp = cleanValue(textOf(column, 'Amp'))
    const channelIndex = cleanValue(textOf(column, 'ChannelIndex'))

    if (resolved.moduleName) return `${resolved.moduleName} ${measurementType}`.trim()
    if (sourceType === 'AmplifierChannel') return `${amp || 'Amplifier'} ${measurementType}`.trim()
    if (sourceType === 'MainDeviceChannel') {
        return `Group ${group || '-'}${groupIndex ? `-${groupIndex}` : ''} ${measurementType}`.trim()
    }
    return `${sourceType || 'Channel'}${channelIndex ? ` ${channelIndex}` : ''} ${measurementType}`.trim()
}

/**
 * Timing recordings declare their binary channels in a metadata XML blob. The
 * first column is an Int64 nanosecond counter; every following blob is one
 * channel sampled on that same time axis.
 */
const readTimingTraces = (zip, measurementNode, configuration, measurementIndex) => {
    const metadataId = cleanValue(textOf(measurementNode, 'MetaDataBlobId'))
    const metadataBlob = readBlobBuffer(zip, metadataId)
    if (!metadataBlob) return []

    let metadata
    try {
        metadata = parseXml(metadataBlob.toString('utf8'))
    } catch (error) {
        return []
    }

    const definition = child(metadata, 'ColumnDefinition')
    const columns = childrenNamed(definition || { children: [] }, 'Column')
    const blobIdsNode = child(measurementNode, 'BlobDataIds')
    const blobIds = childrenNamed(blobIdsNode || { children: [] }, 'BlobDataIds')
        .map(blobNode => cleanValue(blobNode.text))
    const counterColumn = columns.find(column => column.attrs.ColumnType === 'Counter')
    if (!counterColumn) return []

    const counterIndex = Number(counterColumn.attrs.ColumnIndex)
    const counterBlob = readBlobBuffer(zip, blobIds[counterIndex])
    const counterReader = BLOB_VALUE_READERS[String(counterColumn.attrs.DataType || '').toLowerCase()]
    if (!counterBlob || !counterReader || counterReader.size !== 8) return []

    const counterCount = Math.floor(counterBlob.length / counterReader.size)
    if (counterCount === 0) return []
    const firstCounter = counterReader.read(counterBlob, 0)

    return columns.filter(column => column !== counterColumn).map((column, sequenceNumber) => {
        const columnIndex = Number(column.attrs.ColumnIndex)
        const dataType = String(column.attrs.DataType || '').toLowerCase()
        const reader = BLOB_VALUE_READERS[dataType]
        const valueBlob = readBlobBuffer(zip, blobIds[columnIndex])
        if (!reader || !valueBlob) return null

        const count = Math.min(counterCount, Math.floor(valueBlob.length / reader.size))
        const serialNumber = cleanValue(textOf(column, 'Serialnumber'))
        const channelIndex = cleanValue(textOf(column, 'ChannelIndex'))
        const measurementType = cleanValue(textOf(column, 'MeasurementType'))
        const resolved = resolvePtmMeasurementChannel(configuration, {
            serialNumber,
            channelName: '',
            name: '',
            phaseIndex: '',
        })
        const points = new Array(count)
        for (let index = 0; index < count; index += 1) {
            const counter = counterReader.read(counterBlob, index * counterReader.size)
            const elapsed = Number(counter - firstCounter) / 1000000000
            const rawValue = reader.read(valueBlob, index * reader.size)
            points[index] = {
                time: String(elapsed),
                value: String(rawValue),
            }
        }

        return {
            measurementIndex,
            sequenceNumber,
            columnIndex,
            name: timingTraceName(column, resolved),
            signalType: measurementType,
            phase: resolved.phase,
            interrupter: channelIndex,
            sourceType: cleanValue(column.attrs.ColumnType),
            sourceSerial: serialNumber,
            sourceChannelIndex: channelIndex,
            channelGroup: cleanValue(textOf(column, 'Group')) || cleanValue(textOf(column, 'Amp')),
            channelGroupIndex: cleanValue(textOf(column, 'GroupIndex')),
            dataType,
            unit: timingUnit(measurementType),
            points,
        }
    }).filter(Boolean)
}

// ─── Job ─────────────────────────────────────────────────────────────────────

const readJob = (node) => ({
    exportId: node.attrs.ExportId || '',
    name: cleanValue(textOf(node, 'Name')),
    status: cleanValue(textOf(node, 'Status')),
    creationDate: cleanValue(textOf(node, 'CreationDate')),
    executionDate: cleanValue(textOf(node, 'ExecutionDate')),
    approvalDate: cleanValue(textOf(node, 'ApprovalDate')),
    tester: cleanValue(textOf(node, 'Tester')),
    approvedBy: cleanValue(textOf(node, 'ApprovedBy')),
    workOrder: cleanValue(textOf(node, 'WorkOrder')),
    comment: cleanValue(textOf(node, 'Summary')),
    // Hai id trỏ tới hai bản ghi thiết bị KHÁC NHAU của cùng một thiết bị:
    //   assetId    — hồ sơ trong kho (IsGlobalAsset = true)
    //   jobAssetId — bản sao riêng của job, tức thông số ĐÚNG LÚC THỬ
    // Tầng trên lấy bản job làm gốc rồi lấp field rỗng bằng bản kho.
    assetId: cleanValue(textOf(node, 'AssetId')),
    jobAssetId: cleanValue(textOf(node, 'JobAssetId')),
    locationId: cleanValue(textOf(node, 'JobLocationId')),
    testIds: childrenNamed(child(node, 'Tests') || { children: [] }, 'TestId')
        .map(t => cleanValue(t.text)),
    conditions: readConditions(child(node, 'Conditions')),
})

const firstTextOf = (node, names) => {
    for (const name of names) {
        const value = cleanValue(textOf(node, name))
        if (value) return value
    }
    return ''
}

const readSubstation = node => ({
    exportId: node.attrs.ExportId || '',
    globalId: cleanValue(textOf(node, 'GlobalLocationId')),
    name: cleanValue(textOf(node, 'Name')),
    region: cleanValue(textOf(node, 'Region')),
    plant: cleanValue(textOf(node, 'Plant')),
    street: cleanValue(textOf(node, 'Street')),
    city: cleanValue(textOf(node, 'City')),
    stateOrProvince: firstTextOf(node, ['StateOrProvince', 'State']),
    postalCode: cleanValue(textOf(node, 'PostalCode')),
    country: cleanValue(textOf(node, 'Country')),
    contactPerson: cleanValue(textOf(node, 'ContactPerson')),
    phoneNumber: firstTextOf(node, ['PhoneNumber1', 'PhoneNumber']),
    email: cleanValue(textOf(node, 'Email')),
    comment: cleanValue(textOf(node, 'Comment')),
    latitude: cleanValue(textOf(child(node, 'GeoCoordinates'), 'Latitude')),
    longitude: cleanValue(textOf(child(node, 'GeoCoordinates'), 'Longitude')),
    isRealWorldLocation: cleanValue(textOf(node, 'IsRealWorldLocation')) === 'true',
})

// PTM versions do not all use the same container tags for these two levels.
// Keep the normalized fields intentionally small; they are enough to recreate
// the hierarchy and do not make the parser depend on one PTM release.
const readVoltageLevel = node => ({
    exportId: node.attrs.ExportId || '',
    name: cleanValue(textOf(node, 'Name')),
    comment: cleanValue(textOf(node, 'Comment')),
    substationId: firstTextOf(node, ['SubstationId', 'LocationId', 'ParentLocationId']),
    baseVoltage: measure(node, 'BaseVoltage'),
    highVoltageLimit: measure(node, 'HighVoltageLimit'),
    lowVoltageLimit: measure(node, 'LowVoltageLimit'),
})

const readBay = node => ({
    exportId: node.attrs.ExportId || '',
    name: cleanValue(textOf(node, 'Name')),
    aliasName: cleanValue(textOf(node, 'AliasName')),
    substationId: firstTextOf(node, ['SubstationId', 'LocationId', 'ParentLocationId']),
    voltageLevelId: firstTextOf(node, ['VoltageLevelId', 'EquipmentContainerId']),
    breakerConfiguration: cleanValue(textOf(node, 'BreakerConfiguration')),
    busBarConfiguration: cleanValue(textOf(node, 'BusBarConfiguration')),
})

const readConditions = (node) => {
    if (!node) return {}
    return {
        reason: cleanValue(textOf(node, 'Reason')),
        weather: cleanValue(textOf(node, 'Weather')),
        unitLocation: cleanValue(textOf(node, 'UnitLocation')),
        humidity: measure(node, 'Humidity'),
        ambientTemperature: measure(node, 'AmbientTemperature'),
        topOilTemperature: measure(node, 'TopOilTemperature'),
        bottomOilTemperature: measure(node, 'BottomOilTemperature'),
        averageOilTemperature: measure(node, 'AverageOilTemperature'),
        windingTemperature: measure(node, 'WindingTemperature'),
        assetTemperature: measure(node, 'AssetTemperature'),
    }
}

// ─── Asset ───────────────────────────────────────────────────────────────────

/**
 * Thiết bị.
 *
 * Giữ CẢ `raw` — toàn bộ thẻ con dạng phẳng — bên cạnh các field đã đặt tên. Mỗi loại
 * thiết bị có vài chục thẻ riêng (tCircuitBreaker 59 thẻ, tCurrentTransformer 55), liệt
 * kê hết ở đây là chép lại cấu trúc của OMICRON vào code mình. Tầng mapper tra `raw`
 * theo bảng ánh xạ trong config.
 */
const readAsset = (node, type) => {
    const raw = {}
    for (const c of node.children) {
        if (c.children.length > 0) continue      // bỏ khối lồng, mapper tự lấy khi cần
        raw[c.name] = { value: cleanValue(c.text), unit: c.attrs.unit || '' }
    }
    const componentsNode = child(node, 'Components')
    const components = type === 'OperatingMechanism'
        ? childrenNamed(componentsNode || { children: [] }, 'Component').map((component) => ({
            exportId: cleanValue(textOf(component, 'ExportId')),
            componentType: cleanValue(textOf(component, 'ComponentType')),
            ratedVoltage: measure(component, 'RatedVoltage'),
            ratedCurrent: measure(component, 'RatedCurrent'),
            ratedFrequency: measure(component, 'RatedFrequency'),
            ac: cleanValue(textOf(component, 'AC')) === 'true',
        }))
        : []

    const asset = {
        exportId: node.attrs.ExportId || '',
        type,
        tag: node.name,
        serialNumber: cleanValue(textOf(node, 'SerialNumber')),
        manufacturer: cleanValue(textOf(node, 'Manufacturer')),
        manufacturerType: cleanValue(textOf(node, 'ManufacturerType')),
        manufacturingYear: cleanValue(textOf(node, 'ManufacturingYear')),
        apparatusId: cleanValue(textOf(node, 'ApparatusId')),
        assetSystemCode: cleanValue(textOf(node, 'AssetSystemCode')),
        phase: cleanValue(textOf(node, 'Phase')),
        comment: cleanValue(textOf(node, 'Comment')),
        locationId: cleanValue(textOf(node, 'LocationId')),
        isGlobalAsset: cleanValue(textOf(node, 'IsGlobalAsset')) === 'true',
        raw,
        components,
    }

    if (type === 'Transformer') asset.transformerProfile = readTransformerProfile(node)
    if (type === 'TapChanger') asset.tapChangerProfile = readTapChangerProfile(node)
    return asset
}

const normalizeTransformerWinding = value => ({
    Primary: 'Prim',
    Secondary: 'Sec',
    Tertiary: 'Tert',
}[cleanValue(value)] || cleanValue(value))

const normalizePhase = value => cleanValue(value).replace(/^Phase/, '')

const readTransformerProfile = node => {
    const windingsNode = child(node, 'Windings')
    const powerRatingsNode = child(node, 'PowerRatings')
    const shortCircuitNode = child(node, 'ShortCircuitImpedances')
    const zeroSequenceNode = child(node, 'ZeroSequenceImpedances')

    return {
        numberOfPhases: cleanValue(textOf(node, 'NumberOfPhases')),
        frequencyRated: measure(node, 'RatedFrequency'),
        impedanceBaseVoltage: measure(node, 'ImpedancesBaseVoltage'),
        impedanceBasePower: measure(node, 'ImpedancesBasePower'),
        impedanceReferenceTemperature: measure(node, 'ImpedancesReferenceTemperature'),
        category: cleanValue(textOf(node, 'Category')),
        status: cleanValue(textOf(node, 'Status')).replace(/^SelectStatus$/, ''),
        insulationMedium: cleanValue(textOf(node, 'FluidType')),
        tankType: cleanValue(textOf(node, 'TankType')),
        fluidWeight: measure(node, 'FluidWeight'),
        fluidVolume: measure(node, 'FluidVolume'),
        totalWeight: measure(node, 'TotalWeight'),
        oltcId: cleanValue(textOf(node, 'OLTCId')),
        detcId: cleanValue(textOf(node, 'DETCId')),
        windings: childrenNamed(windingsNode || { children: [] }, 'Winding').map(winding => ({
            winding: normalizeTransformerWinding(textOf(winding, 'Winding')),
            voltageRated: measure(winding, 'VoltageLL'),
            voltageLn: measure(winding, 'VoltageLN'),
            insulationLevel: measure(winding, 'InsulationLevelLL'),
            configuration: cleanValue(textOf(winding, 'VectorType')),
            phaseShift: cleanValue(textOf(winding, 'PhaseShift')).replace(/^_/, '').replace(/^NotSelected$/, ''),
            accessibility: cleanValue(textOf(winding, 'WindingAccessibility')).replace(/^NotSelected$/, ''),
            conductorMaterial: cleanValue(textOf(winding, 'ConductorMaterial')),
        })),
        powerRatings: childrenNamed(powerRatingsNode || { children: [] }, 'PowerRating').map(rating => ({
            powerRated: measure(rating, 'RatedPower'),
            coolingClass: cleanValue(textOf(rating, 'CoolingClass')).replace(/^BlankEntry$/, ''),
            temperatureRiseWinding: measure(rating, 'TemperatureRiseWinding'),
            currentRatedPrimary: measure(rating, 'RatedCurrentPrimary'),
            currentRatedSecondary: measure(rating, 'RatedCurrentSecondary'),
            currentRatedTertiary: measure(rating, 'RatedCurrentTertiary'),
        })),
        shortCircuitImpedances: childrenNamed(shortCircuitNode || { children: [] }, 'ShortCircuitImpedance').map(item => ({
            position: cleanValue(textOf(item, 'Position')),
            uk: measure(item, 'ShortCircuitImpedanceZk'),
            loadLosses: measure(item, 'LoadLossesPk'),
            basePower: measure(item, 'BasePower'),
            baseVoltage: measure(item, 'BaseVoltage'),
            oltcPosition: cleanValue(textOf(item, 'OltcPosition')).replace(/^-1$/, ''),
            detcPosition: cleanValue(textOf(item, 'DetcPosition')).replace(/^-1$/, ''),
        })),
        zeroSequenceImpedances: childrenNamed(zeroSequenceNode || { children: [] }, 'ZeroSequenceImpedance').map(item => ({
            winding: normalizeTransformerWinding(textOf(item, 'Winding')),
            value: measure(item, 'ZeroSequenceImpedanceZ0'),
        })),
    }
}

const readTapChangerProfile = node => {
    const information = child(node, 'Information')
    const entries = child(information, 'Entries')
    return {
        enabled: cleanValue(textOf(node, 'IsTapChangerEnabled')) === 'true',
        winding: normalizeTransformerWinding(textOf(information, 'Winding')),
        type: cleanValue(textOf(information, 'TapChangerType')),
        numberOfTaps: cleanValue(textOf(information, 'NumberOfTaps')),
        taps: childrenNamed(entries || { children: [] }, 'TapChangerEntry').map((entry, index) => ({
            listIndex: index,
            name: cleanValue(textOf(entry, 'TapName')),
            voltageRated: measure(entry, 'Voltage'),
        })),
    }
}

// ─── Test ────────────────────────────────────────────────────────────────────

const readTestCommon = (node, type) => ({
    exportId: node.attrs.ExportId || '',
    type,
    tag: node.name,
    name: cleanValue(textOf(node, 'Name')),
    assetId: cleanValue(textOf(node, 'AssetId')),
    parentTestId: cleanValue(textOf(node, 'ParentTestId')),
    executionDate: cleanValue(textOf(node, 'ExecutionDate')),
    assessment: cleanValue(textOf(node, 'Assessment')),
    resultState: cleanValue(textOf(node, 'ResultState')),
    testIndex: cleanValue(textOf(node, 'TestIndex')),
})

const readFraTest = (node, type) => {
    const base = readTestCommon(node, type)
    const measurementsNode = child(node, 'Measurements')
    const outputVoltage = measure(node, 'OutputLevel')
    base.measurements = childrenNamed(measurementsNode || { children: [] }, 'FRAMeasurement')
        .filter(measurement => cleanValue(textOf(measurement, 'MeasurementType')) === 'Trace')
        .map(measurement => {
            const sweepPoints = child(measurement, 'SweepPoints')
            const measurementName = cleanValue(textOf(measurement, 'Name'))
            const terminalTokens = measurementName
                .replace(/^\d+\s*:\s*/, '')
                .split(/\s+/)
                .filter(Boolean)
            const referenceChannel = cleanValue(textOf(measurement, 'Channel1'))
            const responseChannel = cleanValue(textOf(measurement, 'Channel2'))
            return {
                name: measurementName,
                groupName: base.name,
                sourceStandard: 'PTM',
                sourceFile: '',
                referenceTerminal: terminalTokens[0] || referenceChannel,
                responseTerminal: terminalTokens[1] || responseChannel,
                shortedTerminals: cleanValue(textOf(measurement, 'ShortedTerminals')).replace(/^None$/, ''),
                groundedTerminals: cleanValue(textOf(measurement, 'GroundedTerminals')).replace(/^None$/, ''),
                tapPosition: cleanValue(textOf(measurement, 'TapPositionName')) || cleanValue(textOf(measurement, 'TapPosition')),
                measuredDate: cleanValue(textOf(measurement, 'MeasuredDate')),
                outputVoltage: outputVoltage.value,
                color: cleanValue(textOf(measurement, 'TraceColor')),
                enabled: cleanValue(textOf(measurement, 'IsEnabled')) !== 'false',
                points: childrenNamed(sweepPoints || { children: [] }, 'FRASweepPoint').map(point => ({
                    frequency: cleanValue(textOf(point, 'Frequency')),
                    magnitude: cleanValue(textOf(point, 'Magnitude')),
                    phase: cleanValue(textOf(point, 'Phase')),
                })),
            }
        })
        .filter(measurement => measurement.points.length > 0)
    return base
}

/**
 * Bài CT Excitation.
 *
 * Mỗi `<CTExcitationMeasurement>` là MỘT DÒNG của bảng test — một lõi / một tổ hợp tap.
 * File mẫu có 12 dòng: 4 lõi × 3 tổ hợp. Bốn trong số đó `IsMain=false`, 0 điểm đo, knee
 * rỗng — đó là tổ hợp tap CHƯA ĐO, không phải rác. Giữ nguyên cả 12 dòng, để trống ô
 * knee; bỏ đi thì người đọc sau không phân biệt được "chưa đo" với "không tồn tại".
 */
const readCtExcitationTest = (node, type) => {
    const base = readTestCommon(node, type)
    const measurementsNode = child(node, 'Measurements')
    const measurements = childrenNamed(measurementsNode || { children: [] }, 'CTExcitationMeasurement')

    base.cores = cleanValue(textOf(node, 'Cores'))
    base.testFrequency = measure(node, 'TestFrequency')
    base.measurements = measurements.map((m) => {
        const kneePointsNode = child(m, 'KneePoints')
        const pointsNode = child(m, 'MeasurementPoints')
        return {
            coreNumber: cleanValue(textOf(m, 'CoreNumber')),
            winding: cleanValue(textOf(m, 'Winding')),
            firstTapName: cleanValue(textOf(m, 'FirstTapName')),
            secondTapName: cleanValue(textOf(m, 'SecondTapName')),
            isMain: cleanValue(textOf(m, 'IsMain')) === 'true',
            isFull: cleanValue(textOf(m, 'IsFull')) === 'true',
            nominalPrimaryCurrent: measure(m, 'NominalPrimaryCurrent'),
            nominalSecondaryCurrent: measure(m, 'NominalSecondaryCurrent'),
            assessment: cleanValue(textOf(m, 'Assessment')),
            // Tiêu chuẩn đang được chọn. `KneeVoltage`/`KneeCurrent` ở cấp này là bản sao
            // của tiêu chuẩn đó — nhưng `kneePoints` giữ CẢ BA (IEC, ANSI45, ANSI30) để
            // import xong không mất hai cái còn lại.
            kneePointCalculation: cleanValue(textOf(m, 'KneePointCalculation')),
            kneeCurrent: measure(m, 'KneeCurrent'),
            kneeVoltage: measure(m, 'KneeVoltage'),
            kneePoints: childrenNamed(kneePointsNode || { children: [] }, 'CTExcitationKneePoint').map(k => ({
                method: cleanValue(textOf(k, 'KneePointMethod')),
                voltage: measure(k, 'KneePointVoltage'),
                current: measure(k, 'KneePointCurrent'),
            })),
            // Đường cong từ hoá. THỨ TỰ trong mảng chính là thứ tự đo — tầng lưu dùng
            // đúng vị trí này làm `sequence_number`, không sắp lại.
            points: childrenNamed(pointsNode || { children: [] }, 'CTExcitationMeasurementPoint').map(p => ({
                current: cleanValue(textOf(p, 'Current')),
                voltage: cleanValue(textOf(p, 'Voltage')),
            })),
        }
    })
    return base
}

/**
 * Static contact resistance test.
 *
 * CIBANO files can write PhaseIndex=0 on every measurement. The reliable phase
 * is the CBMC2 module matched by measuring-device serial/channel, so all phase
 * resolution goes through the shared channel resolver.
 */
const readContactResistanceTest = (node, type) => {
    const base = readTestCommon(node, type)
    const measurementsNode = child(node, 'Measurements')
    const configuration = readPtmChannelConfiguration(node)

    base.settings = {
        testCurrent: measure(node, 'TestCurrent'),
        testDuration: measure(node, 'TestDuration'),
        groundingType: cleanValue(textOf(node, 'GroundingType')),
        compensateGroundLoopResistance: cleanValue(textOf(node, 'CompensateGroundLoopResistance')) === 'true',
        currentRampEnabled: cleanValue(textOf(node, 'IsCurrentRampEnabled')) === 'true',
        stepSize: measure(node, 'StepSize'),
        testWithMainDevice: cleanValue(textOf(node, 'TestWithMainDevice')) === 'true',
    }
    base.automaticAssessment = {
        active: cleanValue(textOf(child(node, 'AutomaticAssessment'), 'IsActive')) === 'true',
        minimum: measure(child(node, 'AutomaticAssessment'), 'MinimumLimit'),
        maximum: measure(child(node, 'AutomaticAssessment'), 'MaximumLimit'),
        nominal: measure(child(node, 'AutomaticAssessment'), 'NominalLimit'),
        resistanceDeviance: measure(child(node, 'AutomaticAssessment'), 'ResistanceDevianceLimit'),
        relative: cleanValue(textOf(child(node, 'AutomaticAssessment'), 'UseRelativeLimits')) === 'true',
    }
    base.measurements = childrenNamed(measurementsNode || { children: [] }, 'Measurement').map((measurementNode) => {
        const rawChannel = {
            name: cleanValue(textOf(measurementNode, 'Name')),
            channelName: cleanValue(textOf(measurementNode, 'ChannelName')),
            serialNumber: cleanValue(textOf(measurementNode, 'SerialNumber')),
            measuringDevice: cleanValue(textOf(measurementNode, 'MeasuringDevice')),
            mainContact: cleanValue(textOf(measurementNode, 'MainContact')),
            phaseIndex: cleanValue(textOf(measurementNode, 'PhaseIndex')),
        }
        const channel = resolvePtmMeasurementChannel(configuration, rawChannel)
        const interrupterIndex = cleanValue(textOf(measurementNode, 'InterrupterIndex'))
        const parsedInterrupterIndex = Number(interrupterIndex)

        return {
            name: rawChannel.name,
            phase: channel.phase,
            phaseIndex: channel.phaseIndex,
            phaseResolutionSource: channel.source,
            channelName: rawChannel.channelName,
            measuringDevice: rawChannel.measuringDevice,
            moduleName: channel.moduleName,
            moduleSerialNumber: channel.moduleSerialNumber,
            interrupter: interrupterIndex !== '' && Number.isInteger(parsedInterrupterIndex)
                ? parsedInterrupterIndex + 1
                : '',
            assessment: cleanValue(textOf(measurementNode, 'Assessment')),
            measuredDate: cleanValue(textOf(measurementNode, 'MeasuredDate')),
            measuredCurrentDc: measure(measurementNode, 'MeasuredCurrentDc'),
            voltageDc: measure(measurementNode, 'VoltageDc'),
            measuredResistance: measure(measurementNode, 'MeasuredResistance'),
            resistanceDeviance: measure(measurementNode, 'ResistanceDeviance'),
            measurementType: cleanValue(textOf(measurementNode, 'MeasurementType')),
            mainContact: rawChannel.mainContact,
        }
    })

    return base
}

/**
 * Motor current test.
 *
 * `MotorCharacteristics` contains the four summary values displayed in the
 * existing table. `Measurements` contains the waveform blob ids. They are
 * paired by position because CIBANO exports both lists in measurement order.
 */
const readMotorCurrentTest = (node, type, zip) => {
    const base = readTestCommon(node, type)
    const characteristicsNode = child(node, 'MotorCharacteristics')
    const measurementsNode = child(node, 'Measurements')
    const characteristics = childrenNamed(
        characteristicsNode || { children: [] }, 'MotorCharacteristic'
    )
    const measurements = childrenNamed(measurementsNode || { children: [] }, 'Measurement')

    base.settings = {
        testCurrent: measure(node, 'TestCurrent'),
        internalMotorSupply: cleanValue(textOf(node, 'IsInternalMotorSupply')) === 'true',
        motorSupplyIsAc: cleanValue(textOf(node, 'MotorSupplyIsAC')) === 'true',
        motorSupplyVoltage: measure(node, 'MotorSupplyVoltage'),
        motorSupplyFrequency: measure(node, 'MotorSupplyFrequency'),
        maximumMotorSupplyDuration: measure(node, 'MaximumMotorSupplyDuration'),
        triggerThreshold: measure(node, 'TriggerThreshold'),
        sampleRate: measure(node, 'SampleRate'),
        chargeCurrentBegin: measure(node, 'ChargeCurrentBegin'),
        chargeCurrentEnd: measure(node, 'ChargeCurrentEnd'),
    }

    const automaticAssessment = child(node, 'AutomaticAssessment')
    const readAssessmentLimit = (name) => {
        const limitNode = child(automaticAssessment, name)
        return {
            minimum: measure(limitNode, 'MinimumLimit'),
            maximum: measure(limitNode, 'MaximumLimit'),
            nominal: measure(limitNode, 'NominalLimit'),
            deviance: measure(limitNode, 'DevianceLimit'),
        }
    }
    base.automaticAssessment = {
        active: cleanValue(textOf(automaticAssessment, 'IsActive')) === 'true',
        relative: cleanValue(textOf(automaticAssessment, 'UseRelativeLimits')) === 'true',
        inrushCurrent: readAssessmentLimit('AutomaticAssessmentInrushCurrent'),
        chargingTime: readAssessmentLimit('AutomaticAssessmentChargingTime'),
        chargingCurrent: readAssessmentLimit('AutomaticAssessmentChargingCurrent'),
        minimumVoltage: readAssessmentLimit('AutomaticAssessmentMinimumVoltage'),
    }

    const measurementCount = Math.max(characteristics.length, measurements.length)
    base.measurements = Array.from({ length: measurementCount }, (unused, index) => {
        const characteristic = characteristics[index]
        const measurement = measurements[index]
        const blobIdsNode = child(measurement, 'BlobDataIds')
        const blobIds = childrenNamed(blobIdsNode || { children: [] }, 'BlobDataIds')
            .map(blobNode => cleanValue(blobNode.text))

        return {
            channelName: cleanValue(textOf(characteristic, 'ChannelName')),
            chargingTime: measure(characteristic, 'ChargingTime'),
            inrushCurrent: measure(characteristic, 'InrushCurrent'),
            chargingCurrent: measure(characteristic, 'ChargingCurrent'),
            minimumVoltage: measure(characteristic, 'MinimumVoltage'),
            isAcMotor: cleanValue(textOf(characteristic, 'IsACMotor')) === 'true',
            assessment: cleanValue(textOf(characteristic, 'Assessment')),
            measuredDate: cleanValue(textOf(measurement, 'MeasuredDate')),
            blobIds,
            points: readMotorCurrentWaveform(zip, blobIds),
        }
    })

    return base
}

/**
 * Minimum pickup test.
 *
 * CIBANO stores the Trip and Close results as ordinary measurements. There is
 * no waveform/blob for this test, so the two rows can be mapped directly to
 * the client's existing Minimum pickup table. Keep the test settings and
 * automatic limits in the normalized PTM object as well; they describe the
 * test setup, not additional measurement rows.
 */
const readMinimumPickupTest = (node, type) => {
    const base = readTestCommon(node, type)
    const measurementsNode = child(node, 'Measurements')
    const activeCoil = child(node, 'ActiveCoilSetting')
    const automaticAssessment = child(node, 'AutomaticAssessment')

    const readVoltageLimits = (name) => {
        const limits = child(automaticAssessment, name)
        return {
            operation: cleanValue(textOf(limits, 'OperationType')),
            minimum: measure(limits, 'MinimumVoltage'),
            maximum: measure(limits, 'MaximumVoltage'),
        }
    }

    base.settings = {
        measurementWiringMode: cleanValue(textOf(node, 'MeasurementWiringMode')),
        testCurrent: measure(node, 'TestCurrent'),
        voltageRange: cleanValue(textOf(node, 'VDCRange')),
        currentRange: cleanValue(textOf(node, 'CurrentRange')),
        internalMotorSupply: cleanValue(textOf(node, 'IsInternalMotorSupply')) === 'true',
        motorSupplyIsAc: cleanValue(textOf(node, 'MotorSupplyIsAC')) === 'true',
        motorSupplyVoltage: measure(node, 'MotorSupplyVoltage'),
        motorSupplyFrequency: measure(node, 'MotorSupplyFrequency'),
        internalCoilSupply: cleanValue(textOf(node, 'IsInternalCoilSupply')) === 'true',
        coilSupplyIsAc: cleanValue(textOf(node, 'IsAC')) === 'true',
        coilSupplyVoltage: measure(node, 'CoilSupplyVoltageInput'),
        testFrequency: measure(node, 'TestFrequency'),
        activeCoilType: cleanValue(textOf(activeCoil, 'ComponentType')),
        activeCoilIndex: cleanValue(textOf(activeCoil, 'Index')),
        minimumCoilSupplyVoltage: measure(node, 'MinimumCoilSupplyVoltage'),
        maximumCoilSupplyVoltage: measure(node, 'MaximumCoilSupplyVoltage'),
        coilSupplyVoltageStep: measure(node, 'CoilSupplyVoltageStep'),
        commandImpulseDuration: measure(node, 'CommandImpulseDuration'),
        commandBreakDuration: measure(node, 'CommandBreakDuration'),
        continuousSupplyDurationBeforeTest: measure(node, 'ContinuousSupplyDurationBeforeTest'),
    }
    base.automaticAssessment = {
        active: cleanValue(textOf(automaticAssessment, 'IsActive')) === 'true',
        relative: cleanValue(textOf(automaticAssessment, 'UseRelativeLimits')) === 'true',
        close: readVoltageLimits('CloseLimits'),
        trip: readVoltageLimits('TripLimits'),
    }
    base.measurements = childrenNamed(measurementsNode || { children: [] }, 'Measurement')
        .map(measurementNode => {
            const operation = cleanValue(textOf(measurementNode, 'OperationType'))
            return {
                operation,
                // The sample does not identify a different coil per result. The
                // selected Trip/Close operation therefore targets coil no. 1.
                tripCoilNo: operation === 'Trip' ? '1' : '',
                closeCoilNo: operation === 'Close' ? '1' : '',
                pickupVoltage: measure(measurementNode, 'PickupVoltage'),
                currentThreshold: measure(measurementNode, 'CurrentThreshold'),
                voltageDeviation: measure(measurementNode, 'VoltageDeviation'),
                circuitBreakerSwitched: cleanValue(textOf(measurementNode, 'CircuitBreakerSwitched')) === 'true',
                measuredDate: cleanValue(textOf(measurementNode, 'MeasuredDate')),
                number: cleanValue(textOf(measurementNode, 'Number')),
                assessment: cleanValue(textOf(measurementNode, 'Assessment')),
            }
        })

    return base
}

const scaledPtmValue = (raw, factor) => {
    const value = cleanValue(raw)
    if (value === '') return ''
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return ''
    const scaled = numeric * (factor == null ? 1 : factor)
    return String(Number(scaled.toPrecision(15)))
}

const setNestedValue = (target, path, value) => {
    if (value === '' || value === null || value === undefined) return
    let current = target
    for (let index = 0; index < path.length - 1; index += 1) {
        const key = path[index]
        if (!current[key]) current[key] = {}
        current = current[key]
    }
    current[path[path.length - 1]] = value
}

const largestDeviation = (negative, positive, factor) => {
    const values = [negative, positive]
        .map(value => scaledPtmValue(value, factor))
        .filter(value => value !== '')
        .map(value => Math.abs(Number(value)))
        .filter(Number.isFinite)
    return values.length > 0 ? String(Math.max(...values)) : ''
}

const readPtmLimitAttributes = (node, factor) => ({
    min: scaledPtmValue(node && node.attrs.Min, factor),
    max: scaledPtmValue(node && node.attrs.Max, factor),
    ref: scaledPtmValue(node && node.attrs.Ref, factor),
    minus: scaledPtmValue(node && node.attrs.DevNegative, factor),
    plus: scaledPtmValue(node && node.attrs.DevPositive, factor),
    dev: largestDeviation(
        node && node.attrs.DevNegative,
        node && node.attrs.DevPositive,
        factor
    ),
})

const readPtmLimitChildren = (node, factor) => ({
    min: scaledPtmValue(textOf(node, 'Min'), factor),
    max: scaledPtmValue(textOf(node, 'Max'), factor),
    ref: scaledPtmValue(textOf(node, 'Ref'), factor),
    minus: scaledPtmValue(textOf(node, 'MinusDev'), factor),
    plus: scaledPtmValue(textOf(node, 'PlusDev'), factor),
})

const readPtmXmlBlob = (zip, blobId) => {
    const buffer = readBlobBuffer(zip, cleanValue(blobId))
    if (!buffer) return null
    try {
        return parseXml(buffer.toString('utf8'))
    } catch (error) {
        return null
    }
}

const readTimingAutomaticAssessment = (zip, testNode) => {
    const automaticAssessment = child(testNode, 'AutomaticAssessment')
    if (!automaticAssessment) return null

    const result = {
        active: cleanValue(textOf(automaticAssessment, 'IsActive')) === 'true',
        limits: cleanValue(textOf(automaticAssessment, 'UseAbsoluteLimits')) === 'true'
            ? 'Absolute'
            : 'Relative',
    }

    const timingKey = calculation => {
        const designation = cleanValue(textOf(calculation, 'Designation'))
        if (cleanValue(textOf(calculation, 'OpeningTime')) === 'true') return 'opening_time'
        if (cleanValue(textOf(calculation, 'ClosingTime')) === 'true') return 'closing_time'
        if (cleanValue(textOf(calculation, 'ReclosingTime')) === 'true') return 'reclosing_time'
        if (cleanValue(textOf(calculation, 'OpenCloseTime')) === 'true') return 'open_close_time'
        if (cleanValue(textOf(calculation, 'CloseOpenTime')) === 'true') return 'close_open_time'
        if (cleanValue(textOf(calculation, 'OpeningSyncTime')) === 'true') {
            return designation === 'Phase'
                ? 'opening_sync_within_phase'
                : 'opening_sync_breaker_phase'
        }
        if (cleanValue(textOf(calculation, 'ClosingSyncTime')) === 'true') {
            return designation === 'Phase'
                ? 'closing_sync_within_phase'
                : 'closing_sync_breaker_phase'
        }
        return ''
    }

    childrenNamed(automaticAssessment, 'AutomaticAssessmentTimingCalculations')
        .forEach(calculation => {
            const key = timingKey(calculation)
            if (!key) return
            setNestedValue(result, ['operating_time', 'abs', key, 't_min'], scaledPtmValue(textOf(calculation, 'TMin'), 1000))
            setNestedValue(result, ['operating_time', 'abs', key, 't_max'], scaledPtmValue(textOf(calculation, 'TMax'), 1000))
            setNestedValue(result, ['operating_time', 'rel', key, 't_ref'], scaledPtmValue(textOf(calculation, 'TRef'), 1000))
            setNestedValue(result, ['operating_time', 'rel', key, 'minus_t_dev'], scaledPtmValue(textOf(calculation, 'MinusTDev'), 1000))
            setNestedValue(result, ['operating_time', 'rel', key, 'plus_t_dev'], scaledPtmValue(textOf(calculation, 'PlusTDev'), 1000))
        })

    const coilKeys = {
        PeakCloseCoilCurrent: 'peak_close_coil_current',
        PeakTripCoilCurrent: 'peak_trip_coil_current',
        AverageCloseCoilCurrent: 'average_close_coil_current',
        AverageTripCoilCurrent: 'average_trip_coil_current',
        AverageCloseCoilVoltage: 'average_close_coil_voltage',
        AverageTripCoilVoltage: 'average_trip_coil_voltage',
        CloseCoilResistance: 'close_coil_resistance',
        TripCoilResistance: 'trip_coil_resistance',
    }
    const coilTags = [
        'AutomaticAssessmentPeaks',
        'AutomaticAssessmentAverageCurrent',
        'AutomaticAssessmentAverageVoltage',
        'AutomaticAssessmentResistance',
    ]
    coilTags.forEach(tag => {
        childrenNamed(automaticAssessment, tag).forEach(limitNode => {
            const key = coilKeys[cleanValue(textOf(limitNode, 'CoilCharacteristics'))]
            if (!key) return
            const limit = readPtmLimitChildren(limitNode, 1)
            setNestedValue(result, ['coil_characteristics', 'abs', key, 'min'], limit.min)
            setNestedValue(result, ['coil_characteristics', 'abs', key, 'max'], limit.max)
            setNestedValue(result, ['coil_characteristics', 'rel', key, 'ref'], limit.ref)
            setNestedValue(result, ['coil_characteristics', 'rel', key, 'minus_dev'], limit.minus)
            setNestedValue(result, ['coil_characteristics', 'rel', key, 'plus_dev'], limit.plus)
        })
    })

    const contactTravelRoot = readPtmXmlBlob(
        zip,
        textOf(automaticAssessment, 'ContactTravelLimitsRawDataId')
    )
    const contactTravelTypes = {
        17: 'total_travel',
        38: 'over_travel_trip',
        40: 'over_travel_close',
        39: 'rebound_trip',
        41: 'rebound_close',
        49: 'contact_wipe_trip',
        50: 'contact_wipe_close',
        52: 'damping_distance',
    }
    const contactTravelLimits = child(child(contactTravelRoot, 'Section'), 'Limits')
    ;((contactTravelLimits && contactTravelLimits.children) || []).forEach(limitNode => {
        const key = contactTravelTypes[cleanValue(limitNode.attrs.Type)]
        if (!key || limitNode.name !== 'MotionValueAssessmentLimit') return
        const limit = readPtmLimitAttributes(limitNode, 1000)
        setNestedValue(result, ['contact_travel', 'abs', key, 'd_min'], limit.min)
        setNestedValue(result, ['contact_travel', 'abs', key, 'd_max'], limit.max)
        setNestedValue(result, ['contact_travel', 'rel', key, 'd_ref'], limit.ref)
        setNestedValue(result, ['contact_travel', 'rel', key, 'd_dev'], limit.dev)
    })

    const auxiliaryRoot = readPtmXmlBlob(
        zip,
        textOf(automaticAssessment, 'AuxiliaryContactLimitRawDataId')
    )
    const auxiliaryTypes = {
        24: ['trip_operation', 'switching_time_type_a'],
        25: ['close_operation', 'switching_time_type_a'],
        26: ['trip_operation', 'switching_time_type_b'],
        27: ['close_operation', 'switching_time_type_b'],
        28: ['trip_operation', 'diff_to_main_type_a'],
        29: ['close_operation', 'diff_to_main_type_a'],
        30: ['trip_operation', 'diff_to_main_type_b'],
        31: ['close_operation', 'diff_to_main_type_b'],
        32: ['trip_operation', 'switching_time_wiper'],
        33: ['close_operation', 'switching_time_wiper'],
        34: ['trip_operation', 'duration'],
        35: ['close_operation', 'duration'],
    }
    const auxiliaryLimits = child(child(auxiliaryRoot, 'Section'), 'Limits')
    ;((auxiliaryLimits && auxiliaryLimits.children) || []).forEach(limitNode => {
        const mapping = auxiliaryTypes[cleanValue(limitNode.attrs.Type)]
        if (!mapping || limitNode.name !== 'AuxiliaryContactLimit') return
        const operation = mapping[0]
        const key = mapping[1]
        const limit = readPtmLimitAttributes(limitNode, 1000)
        setNestedValue(result, ['auxiliary_contacts', operation, 'abs', key, 't_min'], limit.min)
        setNestedValue(result, ['auxiliary_contacts', operation, 'abs', key, 't_max'], limit.max)
        setNestedValue(result, ['auxiliary_contacts', operation, 'rel', key, 't_ref'], limit.ref)
        setNestedValue(result, ['auxiliary_contacts', operation, 'rel', key, 't_dev'], limit.dev)
    })

    const miscellaneousRoot = readPtmXmlBlob(
        zip,
        textOf(automaticAssessment, 'MiscellaneousLimitRawDataId')
    )
    const miscellaneousTypes = {
        BounceTimeLimit: ['bounce_time', 1000],
        BounceAmountLimit: ['bounce_count', 1],
        PirCloseTimeAssessmentLimit: ['pir_close_time', 1000],
        ReactionTimeAssessmentLimit: ['reaction_time', 1000],
    }
    const miscellaneousLimits = child(child(miscellaneousRoot, 'Section'), 'Limits')
    ;((miscellaneousLimits && miscellaneousLimits.children) || []).forEach(limitNode => {
        const mapping = miscellaneousTypes[limitNode.name]
        if (!mapping) return
        const key = mapping[0]
        const limit = readPtmLimitAttributes(limitNode, mapping[1])
        setNestedValue(result, ['miscellaneous', 'abs', key, 'min'], limit.min)
        setNestedValue(result, ['miscellaneous', 'abs', key, 'max'], limit.max)
        setNestedValue(result, ['miscellaneous', 'rel', key, 'ref'], limit.ref)
        setNestedValue(result, ['miscellaneous', 'rel', key, 'dev'], limit.dev)
    })

    return result
}

const readTimingTest = (node, type, zip) => {
    const base = readTestCommon(node, type)
    const configuration = readPtmChannelConfiguration(node)
    const calculationsNode = child(node, 'TimingCalculations')
    const calculations = childrenNamed(calculationsNode || { children: [] }, 'TimingCalculation')
    const activeCoil = child(node, 'ActiveCoilSetting')
    const activeCoilIndex = Number(cleanValue(textOf(activeCoil, 'Index')))
    const tripCoilNo = Number.isInteger(activeCoilIndex) ? activeCoilIndex + 1 : 1
    const contactCounts = {}

    base.settings = {
        testCurrent: measure(node, 'TestCurrent'),
        coilSupplyVoltage: measure(node, 'CoilSupplyVoltageInput'),
        testFrequency: measure(node, 'TestFrequency'),
        internalCoilSupply: cleanValue(textOf(node, 'IsInternalCoilSupply')) === 'true',
        internalMotorSupply: cleanValue(textOf(node, 'IsInternalMotorSupply')) === 'true',
    }

    base.measurements = calculations
        .filter(calculation => cleanValue(textOf(calculation, 'Designation')) === 'Contact')
        .map(calculation => {
            const phaseIndex = Number(cleanValue(textOf(calculation, 'PhaseIndex')))
            const phase = Number.isInteger(phaseIndex) && phaseIndex >= 0 && phaseIndex <= 2
                ? ['A', 'B', 'C'][phaseIndex]
                : ''
            contactCounts[phase] = (contactCounts[phase] || 0) + 1
            return {
                name: cleanValue(textOf(calculation, 'ChannelName')),
                phase,
                tripCoilNo,
                interrupter: contactCounts[phase],
                openingTime: measure(calculation, 'OpeningTime'),
                openingSyncTime: measure(calculation, 'OpeningSyncTime'),
                assessment: cleanValue(textOf(calculation, 'Assessment')),
            }
        })

    const measurementsNode = child(node, 'Measurements')
    base.timingTraces = childrenNamed(measurementsNode || { children: [] }, 'Measurement')
        .reduce((traces, measurementNode, measurementIndex) => {
            return traces.concat(readTimingTraces(zip, measurementNode, configuration, measurementIndex))
        }, [])
    base.automaticAssessment = readTimingAutomaticAssessment(zip, node)

    return base
}

const GENERAL_TEST_GROUP_NAMES = [
    'general inspection',
    'general test',
    'general testing',
]

const isGeneralTestGroup = node => GENERAL_TEST_GROUP_NAMES.includes(
    cleanValue(textOf(node, 'Name')).trim().toLowerCase()
)

const readGeneralTestGroup = node => {
    const base = readTestCommon(node, 'GeneralInspectionTest')
    base.name = 'General inspection'
    base.measurements = []
    return base
}

/**
 * CIBANO dynamic contact resistance uses the same recording container as a
 * timing test. Keep the raw current/voltage traces as the source of truth;
 * resistance is derived from U/I by the UI and is therefore never duplicated
 * as another persisted measurement series.
 */
const readDynamicContactResistanceTest = (node, type, zip) => {
    const base = readTestCommon(node, type)
    const configuration = readPtmChannelConfiguration(node)
    const calculationsNode = child(node, 'TimingCalculations')
    const calculations = childrenNamed(calculationsNode || { children: [] }, 'TimingCalculation')
    const contactCounts = {}

    base.operation = /^\s*C\b/i.test(base.name || '') ? 'C' : 'O'
    base.settings = {
        testCurrent: measure(node, 'TestCurrent'),
        voltageRange: cleanValue(textOf(node, 'VDCRange')),
        currentRange: cleanValue(textOf(node, 'CurrentRange')),
        sampleRate: measure(node, 'SampleRate'),
        currentThresholdFactor: measure(node, 'CurrentThresholdFactor'),
        groundingType: cleanValue(textOf(node, 'GroundingType')),
        measurePir: cleanValue(textOf(node, 'MeasurePir')) === 'true',
    }

    base.measurements = calculations
        .filter(calculation => cleanValue(textOf(calculation, 'Designation')) === 'Contact')
        .map(calculation => {
            const phaseIndex = Number(cleanValue(textOf(calculation, 'PhaseIndex')))
            const phase = Number.isInteger(phaseIndex) && phaseIndex >= 0 && phaseIndex <= 2
                ? ['A', 'B', 'C'][phaseIndex]
                : ''
            contactCounts[phase] = (contactCounts[phase] || 0) + 1
            return {
                name: cleanValue(textOf(calculation, 'ChannelName')),
                phase,
                interrupter: contactCounts[phase],
                testCurrent: base.settings.testCurrent,
                openingTime: measure(calculation, 'OpeningTime'),
                closingTime: measure(calculation, 'ClosingTime'),
                assessment: cleanValue(textOf(calculation, 'Assessment')),
            }
        })

    const measurementsNode = child(node, 'Measurements')
    base.timingTraces = childrenNamed(measurementsNode || { children: [] }, 'Measurement')
        .reduce((traces, measurementNode, measurementIndex) => {
            return traces.concat(readTimingTraces(zip, measurementNode, configuration, measurementIndex))
        }, [])

    return base
}

const readTransformerTestConditions = node => ({
    windingTemperature: measure(node, 'WindingTemperature'),
    referenceTemperature: measure(node, 'ReferenceTemperature').value
        ? measure(node, 'ReferenceTemperature')
        : measure(node, 'CorrectionTemperature'),
    topOilTemperature: measure(node, 'TopOilTemperature'),
    bottomOilTemperature: measure(node, 'BottomOilTemperature'),
    ambientTemperature: measure(node, 'AmbientTemperature'),
    humidity: measure(node, 'Humidity'),
    weather: cleanValue(textOf(node, 'Weather')),
})

const sweepMeasurementName = (measurement, point) => {
    const name = cleanValue(textOf(measurement, 'Name'))
    const measurementType = cleanValue(textOf(measurement, 'MeasurementType'))
    if (measurementType === 'MeasurementVoltageSweep') {
        const voltage = Number(cleanValue(textOf(point, 'TestVoltage')))
        return Number.isFinite(voltage) ? `${name} @ ${voltage / 1000} kV` : name
    }
    if (measurementType === 'MeasurementFrequencySweep') {
        const frequency = cleanValue(textOf(point, 'Frequency'))
        return frequency ? `${name} @ ${frequency} Hz` : name
    }
    return name
}

const readTanDeltaTest = (node, type) => {
    const base = readTestCommon(node, type)
    const measurementsNode = child(node, 'Measurements')
    base.conditions = readTransformerTestConditions(node)
    base.measurements = childrenNamed(measurementsNode || { children: [] }, 'Measurement')
        .reduce((rows, measurement) => {
            const pointsNode = child(measurement, 'MeasurementPoints')
            const points = childrenNamed(pointsNode || { children: [] }, 'MeasurementPoint')
            const measurementType = cleanValue(textOf(measurement, 'MeasurementType'))
            const baseMeasurement = cleanValue(textOf(measurement, 'Name'))
            return rows.concat(points.map(point => ({
                measurement: sweepMeasurementName(measurement, point),
                baseMeasurement,
                sweepType: measurementType === 'MeasurementFrequencySweep'
                    ? 'frequency'
                    : measurementType === 'MeasurementVoltageSweep' ? 'voltage' : '',
                frequency: measure(point, 'Frequency'),
                testMode: cleanValue(textOf(measurement, 'Mode')),
                testVoltage: measure(point, 'TestVoltage'),
                capacitanceMeasured: measure(point, 'CapacitanceMeasured'),
                capacitanceReference: measure(point, 'CapacitanceReference'),
                powerFactorMeasured: measure(point, 'PowerFactorMeasured'),
                powerFactorReference: measure(point, 'PowerFactorReference'),
                assessment: cleanValue(textOf(point, 'Assessment')),
                measuredDate: cleanValue(textOf(measurement, 'MeasuredDate')),
            })))
        }, [])
    return base
}

const readTtrTest = (node) => {
    const base = readTestCommon(node, 'TransformerRatioTest')
    const measurementsNode = child(node, 'Measurements')
    base.conditions = readTransformerTestConditions(node)
    base.measurements = childrenNamed(measurementsNode || { children: [] }, 'TTRMeasurement')
        .reduce((rows, measurement) => {
            return rows.concat(['A', 'B', 'C'].map(phase => {
                const result = child(measurement, `Phase${phase}Result`)
                if (!result) return null
                return {
                    tap: measure(measurement, 'TapName'),
                    phase,
                    voltagePrimary: measure(result, 'VPrim'),
                    voltageSecondary: measure(result, 'VSec'),
                    nominalRatio: measure(measurement, 'NominalRatioTTR'),
                    measuredRatio: measure(result, 'TTR'),
                    ratioDeviation: measure(result, 'RatioDeviation'),
                    assessment: cleanValue(textOf(measurement, 'Assessment')),
                    measuredDate: cleanValue(textOf(measurement, 'MeasuredDate')),
                }
            }).filter(Boolean))
        }, [])
    return base
}

const readExcitingCurrentTest = (node, type) => {
    const base = readTestCommon(node, type)
    const measurementsNode = child(node, 'Measurements')
    base.conditions = readTransformerTestConditions(node)
    base.measurements = childrenNamed(measurementsNode || { children: [] }, 'ExcitingCurrentMeasurement')
        .reduce((rows, measurement) => {
            return rows.concat(['A', 'B', 'C'].map(phase => {
                const result = child(measurement, `Phase${phase}Result`)
                if (!result) return null
                return {
                    tap: measure(measurement, 'TapName'),
                    phase,
                    currentOut: measure(result, 'IOut'),
                    wattLosses: measure(result, 'WattLoss'),
                    assessment: cleanValue(textOf(measurement, 'Assessment')),
                    measuredDate: cleanValue(textOf(measurement, 'MeasuredDate')),
                }
            }).filter(Boolean))
        }, [])
    return base
}

const leakageFrequencyResults = phaseResult => {
    const frequencyNode = child(phaseResult, 'FrequencyResults')
    return childrenNamed(frequencyNode || { children: [] }, 'FrequencyResult')
}

const nearestFrequencyResult = (phaseResult, targetFrequency) => {
    const results = leakageFrequencyResults(phaseResult)
    if (results.length === 0) return null
    return results.reduce((nearest, result) => {
        const frequency = Number(cleanValue(textOf(result, 'Frequency')))
        const nearestFrequency = nearest ? Number(cleanValue(textOf(nearest, 'Frequency'))) : NaN
        if (!Number.isFinite(frequency)) return nearest
        if (!nearest || Math.abs(frequency - targetFrequency) < Math.abs(nearestFrequency - targetFrequency)) return result
        return nearest
    }, null)
}

const averageMeasurements = (measurements, field, divisor = 1) => {
    const values = measurements
        .map(item => item[field] && item[field].value)
        .filter(value => value !== '' && value !== null && value !== undefined)
        .map(Number)
        .filter(Number.isFinite)
    return {
        value: values.length ? String(values.reduce((sum, value) => sum + value, 0) / values.length / divisor) : '',
        unit: 'Ohm',
    }
}

const withLeakageCalculations = (row, basePower, baseVoltage, ukReference) => {
    const numberOrNaN = value => value === '' || value === null || value === undefined
        ? NaN
        : Number(value)
    const resistance = numberOrNaN(row.resistance && row.resistance.value)
    const reactance = numberOrNaN(row.reactance && row.reactance.value)
    const measuredImpedance = numberOrNaN(row.impedance && row.impedance.value)
    const impedance = Number.isFinite(measuredImpedance)
        ? measuredImpedance
        : Number.isFinite(resistance) && Number.isFinite(reactance)
            ? Math.sqrt(resistance * resistance + reactance * reactance)
            : NaN
    const toPercent = value => Number.isFinite(value) && Number.isFinite(basePower) &&
        Number.isFinite(baseVoltage) && baseVoltage !== 0
        ? value * basePower / Math.pow(baseVoltage, 2) * 100
        : NaN
    const xkPercent = toPercent(reactance)
    const zkPercent = toPercent(impedance)
    const ukCalculated = Number.isFinite(impedance) && Number.isFinite(basePower) &&
        Number.isFinite(baseVoltage) && baseVoltage !== 0
        ? impedance * basePower / Math.pow(baseVoltage, 2) * 100
        : NaN
    const ukDeviation = Number.isFinite(ukCalculated) && Number.isFinite(ukReference) && ukReference !== 0
        ? Math.abs((ukCalculated - ukReference) / ukReference) * 100
        : NaN
    return {
        ...row,
        impedance: { value: Number.isFinite(impedance) ? String(impedance) : '', unit: 'Ohm' },
        xkPercent: { value: Number.isFinite(xkPercent) ? String(xkPercent) : '', unit: '%' },
        zkPercent: { value: Number.isFinite(zkPercent) ? String(zkPercent) : '', unit: '%' },
        ukCalculated: { value: Number.isFinite(ukCalculated) ? String(ukCalculated) : '', unit: '%' },
        ukReference: { value: Number.isFinite(ukReference) ? String(ukReference) : '', unit: '%' },
        ukDeviation: { value: Number.isFinite(ukDeviation) ? String(ukDeviation) : '', unit: '%' },
    }
}

const leakageReactanceTestType = node => {
    const pair = cleanValue(textOf(node, 'TestType')).replace(/[^a-z]/gi, '').toUpperCase()
    return {
        PRIMSEC: 'LeakageReactancePrimTest',
        PRIMARYSECONDARY: 'LeakageReactancePrimTest',
        SECTERT: 'LeakageReactanceSecTest',
        SECONDARYTERTIARY: 'LeakageReactanceSecTest',
        PRIMTERT: 'LeakageReactanceTertTest',
        PRIMARYTERTIARY: 'LeakageReactanceTertTest',
    }[pair] || 'LeakageReactancePrimTest'
}

const readLeakageReactanceTest = (node, type) => {
    const base = readTestCommon(node, leakageReactanceTestType(node) || type)
    const measurementsNode = child(node, 'Measurements')
    const basePower = Number(cleanValue(textOf(node, 'NameplateBasePower')))
    const baseVoltage = Number(cleanValue(textOf(node, 'NameplateBaseVoltage')))
    const ukReference = Number(cleanValue(textOf(node, 'NameplateZPUPercent')))
    const tap = measure(node, 'SelectedOLTCIndex')
    base.conditions = readTransformerTestConditions(node)
    base.measurements = childrenNamed(measurementsNode || { children: [] }, 'LeakageReactanceMeasurement')
        .reduce((rows, measurement) => {
            const measurementType = cleanValue(textOf(measurement, 'MeasurementType'))
            const phaseResultsNode = child(measurement, 'PhaseResults')
            const phases = childrenNamed(phaseResultsNode || { children: [] }, 'PhaseResult')
                .map(phaseResult => {
                    const result = nearestFrequencyResult(phaseResult, 50)
                    if (!result) return null
                    return {
                        phase: normalizePhase(textOf(phaseResult, 'Phase')),
                        resistance: measure(result, 'RkCorrected'),
                        reactance: measure(result, 'Xk'),
                        impedance: measure(result, 'Zk'),
                        inductance: measure(result, 'Lk'),
                        frequencyResults: leakageFrequencyResults(phaseResult),
                        assessment: cleanValue(textOf(phaseResult, 'Assessment')),
                    }
                })
                .filter(Boolean)

            const sweepTable = measurementType === 'ThreePhaseEquivalent'
                ? 'table3'
                : measurementType === 'PerPhase' ? 'table4' : ''
            const sweepRows = sweepTable
                ? phases.reduce((result, phaseResult) => {
                    return result.concat(phaseResult.frequencyResults.map(frequencyResult => withLeakageCalculations({
                        tableKey: sweepTable,
                        tap,
                        phase: phaseResult.phase,
                        frequency: measure(frequencyResult, 'Frequency'),
                        resistance: measure(frequencyResult, 'RkCorrected'),
                        reactance: measure(frequencyResult, 'Xk'),
                        impedance: measure(frequencyResult, 'Zk'),
                        inductance: measure(frequencyResult, 'Lk'),
                        assessment: phaseResult.assessment,
                    }, basePower, baseVoltage, ukReference)))
                }, [])
                : []

            if (measurementType === 'ThreePhaseEquivalent') {
                const fixedRow = withLeakageCalculations({
                    tableKey: 'table1',
                    tap,
                    phase: 'Three phase',
                    // CPC reports line-to-line impedance for this mode. The client
                    // formula works with per-phase R/X, hence the factor 1/2.
                    resistance: averageMeasurements(phases, 'resistance', 2),
                    reactance: averageMeasurements(phases, 'reactance', 2),
                    assessment: cleanValue(textOf(measurement, 'Assessment')),
                }, basePower, baseVoltage, ukReference)
                return rows.concat([fixedRow], sweepRows)
            }
            if (measurementType === 'PerPhase') {
                const fixedRows = phases.map(result => withLeakageCalculations({
                    tableKey: 'table2',
                    tap,
                    phase: result.phase,
                    resistance: result.resistance,
                    reactance: result.reactance,
                    impedance: result.impedance,
                    inductance: result.inductance,
                    assessment: result.assessment,
                }, basePower, baseVoltage, ukReference))
                return rows.concat(fixedRows, sweepRows)
            }
            return rows
        }, [])
    return base
}

const transformerWindingTestType = node => {
    const name = cleanValue(textOf(node, 'Name')).toLowerCase()
    if (name.indexOf('dyn.') >= 0 || name.indexOf('drm') >= 0) return 'TransformerDynamicResistanceTest'
    const winding = cleanValue(textOf(node, 'Winding'))
    const index = { Primary: 1, Secondary: 2, Tertiary: 3 }[winding]
    return index ? `TransformerWindingResistance${index}Test` : 'TransformerWindingResistanceTest'
}

const readTransformerWindingResistanceTest = node => {
    const base = readTestCommon(node, transformerWindingTestType(node))
    const measurementsNode = child(node, 'Measurements')
    base.conditions = readTransformerTestConditions(node)
    base.measurements = childrenNamed(measurementsNode || { children: [] }, 'TransformerWindingResistanceMeasurement')
        .reduce((rows, measurement) => {
            return rows.concat(['A', 'B', 'C'].map(phase => {
                const result = child(measurement, `Phase${phase}Result`)
                if (!result) return null
                return {
                    tap: measure(measurement, 'TapName'),
                    phase,
                    resistanceMeasured: measure(result, 'ResistanceMeasured'),
                    resistanceCorrected: measure(result, 'ResistanceCorrected'),
                    assessment: cleanValue(textOf(measurement, 'Assessment')),
                    measuredDate: cleanValue(textOf(measurement, 'MeasuredDate')),
                }
            }).filter(Boolean))
        }, [])
    return base
}

const TEST_READERS = {
    CTExcitationTest: readCtExcitationTest,
    ContactResistanceTest: readContactResistanceTest,
    MotorCurrentTest: readMotorCurrentTest,
    MinimumPickupTest: readMinimumPickupTest,
    TimingTest: readTimingTest,
    DynamicContactResistanceTest: readDynamicContactResistanceTest,
    TanDeltaTest: readTanDeltaTest,
    TTRTest: readTtrTest,
    ExcitingCurrentTest: readExcitingCurrentTest,
    LeakageReactanceTest: readLeakageReactanceTest,
    TransformerWindingResistanceTest: readTransformerWindingResistanceTest,
    FRATest: readFraTest,
}

// ─── Điểm vào ────────────────────────────────────────────────────────────────

/**
 * Đọc một file .ptm thành cấu trúc đã chuẩn hoá.
 *
 * @param {string} filePath
 * @returns {{ meta, job, assets, substations, voltageLevels, bays, tests, unsupportedTests }}
 */
export const readPtmArchive = (filePath) => {
    const buffer = fs.readFileSync(filePath)
    const zip = new PizZip(buffer)

    const manifest = readManifest(zip)
    if (manifest.length === 0) {
        throw new Error('Not a valid PTM file: Relationship.xml is missing or empty')
    }

    const meta = {}
    const metaFile = zip.file('metadata.xml')
    if (metaFile) {
        for (const m of childrenNamed(parseXml(metaFile.asText()), 'Metadata')) {
            meta[m.attrs.Key] = m.attrs.Value
        }
    }

    const assets = []
    const substations = []
    const voltageLevels = []
    const bays = []
    const tests = []
    const unsupportedTests = []
    let job = null

    for (const entry of manifest) {
        if (entry.type === 'Job') {
            const node = parseEntry(zip, entry.target)
            if (node) job = readJob(node)
            continue
        }
        if (entry.type === 'Substation') {
            const node = parseEntry(zip, entry.target)
            if (node) substations.push(readSubstation(node))
            continue
        }
        if (entry.type === 'VoltageLevel') {
            const node = parseEntry(zip, entry.target)
            if (node) voltageLevels.push(readVoltageLevel(node))
            continue
        }
        if (entry.type === 'Bay') {
            const node = parseEntry(zip, entry.target)
            if (node) bays.push(readBay(node))
            continue
        }
        if (entry.target.indexOf('Assets/') === 0) {
            const node = parseEntry(zip, entry.target)
            if (node) assets.push(readAsset(node, entry.type))
            continue
        }
        if (entry.target.indexOf('Tests/') === 0) {
            const node = parseEntry(zip, entry.target)
            if (!node) continue
            if (entry.type === 'CibanoTestGroup') {
                // A CIBANO test group normally only groups child tests. It is not
                // itself a measurement. Only a deliberately named general test
                // is represented by the client's General inspection procedure.
                if (isGeneralTestGroup(node)) tests.push(readGeneralTestGroup(node))
                continue
            }
            const reader = TEST_READERS[entry.type]
            if (!reader) {
                // Bài test chưa hỗ trợ thì GHI LẠI, không bỏ im lặng — tầng trên còn báo
                // được cho người dùng biết bài nào không nhập và vì sao.
                unsupportedTests.push({ type: entry.type, name: cleanValue(textOf(node, 'Name')) })
                continue
            }
            tests.push(reader(node, entry.type, zip))
        }
    }

    const tapChangersById = assets
        .filter(asset => asset.type === 'TapChanger')
        .reduce((map, asset) => {
            map[asset.exportId] = asset.tapChangerProfile
            return map
        }, {})
    assets.filter(asset => asset.type === 'Transformer').forEach(asset => {
        const profile = asset.transformerProfile || {}
        const candidates = [tapChangersById[profile.oltcId], tapChangersById[profile.detcId]]
            .filter(Boolean)
            .sort((left, right) => Number(right.enabled) - Number(left.enabled))
        candidates.forEach(tapChanger => {
            const winding = (profile.windings || []).find(item => item.winding === tapChanger.winding)
            if (winding && !winding.tapChanger && (tapChanger.enabled || tapChanger.taps.length > 0)) {
                winding.tapChanger = tapChanger
            }
        })
    })

    if (!job) throw new Error('Not a valid PTM file: no Job found')

    return { meta, job, assets, substations, voltageLevels, bays, tests, unsupportedTests }
}

export default { readPtmArchive }
