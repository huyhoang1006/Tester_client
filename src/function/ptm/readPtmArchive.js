import fs from 'fs'
import PizZip from 'pizzip'
import { parseXml, childrenNamed, child, textOf, unitOf } from './xmlLite'

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
 *     Blobs/*.blob          du lieu song nhi phan — KHONG doc
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
    return {
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

const TEST_READERS = {
    CTExcitationTest: readCtExcitationTest,
}

// ─── Điểm vào ────────────────────────────────────────────────────────────────

/**
 * Đọc một file .ptm thành cấu trúc đã chuẩn hoá.
 *
 * @param {string} filePath
 * @returns {{ meta, job, assets, substations, tests, unsupportedTests }}
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
            if (node) {
                substations.push({
                    exportId: node.attrs.ExportId || '',
                    name: cleanValue(textOf(node, 'Name')),
                    address: cleanValue(textOf(node, 'Address')),
                    city: cleanValue(textOf(node, 'City')),
                    stateOrProvince: cleanValue(textOf(node, 'StateOrProvince')),
                    postalCode: cleanValue(textOf(node, 'PostalCode')),
                    country: cleanValue(textOf(node, 'Country')),
                })
            }
            continue
        }
        if (entry.target.indexOf('Assets/') === 0) {
            const node = parseEntry(zip, entry.target)
            if (node) assets.push(readAsset(node, entry.type))
            continue
        }
        if (entry.target.indexOf('Tests/') === 0) {
            const reader = TEST_READERS[entry.type]
            const node = parseEntry(zip, entry.target)
            if (!node) continue
            if (!reader) {
                // Bài test chưa hỗ trợ thì GHI LẠI, không bỏ im lặng — tầng trên còn báo
                // được cho người dùng biết bài nào không nhập và vì sao.
                unsupportedTests.push({ type: entry.type, name: cleanValue(textOf(node, 'Name')) })
                continue
            }
            tests.push(reader(node, entry.type))
        }
    }

    if (!job) throw new Error('Not a valid PTM file: no Job found')

    return { meta, job, assets, substations, tests, unsupportedTests }
}

export default { readPtmArchive }
