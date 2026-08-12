/**
 * GỘP BA CHIỀU cho job/test — kiểu git, nhưng khoá theo mrid thay vì theo dòng văn bản.
 *
 * ─── VÌ SAO KHÔNG DÙNG LẠI ĐƯỢC `conflictUtils.js` ───────────────────────────
 *
 * Bộ gộp của asset chạy trên một DANH SÁCH TRƯỜNG VIẾT TAY: `properties.serial_no`,
 * `ratings.rated_current.value`… Mỗi loại thiết bị vài chục trường, biết trước lúc
 * ngồi viết code.
 *
 * Job thì không có danh sách nào để mà viết: 82 loại bài test, mỗi loại số bảng và
 * số dòng khác nhau, 137 cột đo khả dĩ, cộng cây tiêu chuẩn người dùng tự đặt. Khai
 * tay là việc không làm được.
 *
 * Đổi lại, job có một thứ asset không có: **mọi đơn vị đều mang mrid riêng** do
 * client sinh — bài test, dòng dữ liệu, từng ô đo, từng tiêu chí. Nên khoá gộp có
 * sẵn, và phép so trở thành đệ quy trên cây thay vì tra bảng.
 *
 *     Asset : khoa gop = duong dan tinh  ('properties.serial_no')  -> phai khai tay
 *     Job   : khoa gop = mrid cua chinh o do                       -> co san
 *
 * ─── BẢNG CHÂN LÝ ────────────────────────────────────────────────────────────
 *
 * Giống hệt `conflictUtils.detectConflicts`, vì đó là phần đúng và không phụ thuộc
 * hình dạng dữ liệu:
 *
 *     khong ben nao doi   -> giu nguyen
 *     chi server doi      -> lay server
 *     chi client doi      -> lay client      <- "giu nguyen thay doi tai client"
 *     ca hai doi, giong   -> lay (bang nhau)
 *     ca hai doi, khac    -> XUNG DOT, hoi nguoi dung
 *
 * ─── HAI NHÁNH ASSET KHÔNG BAO GIỜ GẶP ───────────────────────────────────────
 *
 * Danh sách trường của asset là cố định nên không có chuyện trường biến mất. Job thì
 * người dùng thêm và xoá bài test, thêm và xoá dòng đo, bỏ bớt tiêu chí:
 *
 *     base khong co, mot ben co        -> ben do THEM     -> giu
 *     base co, mot ben khong con:
 *         ben kia KHONG sua            -> ton trong XOA   -> bo
 *         ben kia CO sua               -> XUNG DOT that   -> hoi
 *     ca hai deu bo                    -> bo
 *
 * Nhánh "một bên xoá, bên kia sửa" là nhánh duy nhất bắt buộc phải hỏi. Tự quyết ở
 * đây là mất dữ liệu: bỏ theo bên xoá thì mất phần bên kia vừa nhập, giữ theo bên
 * sửa thì bài test người ta đã cố ý xoá lại sống dậy.
 */

/** Khoá bỏ qua khi so sánh. */
const IGNORED_KEYS = new Set([
    // Không thuộc dữ liệu job — do lớp lưu bản gốc gắn thêm.
    'version',
    // Client tự có trong config bundle của nó, server trả rỗng.
    'procedureAsset',
    // API tệp chưa chốt; so sánh chỉ sinh xung đột giả.
    'attachment', 'attachmentId', 'attachmentData',
    // Dấu thời gian do tầng lưu sinh ra, không phải thứ người dùng nhập.
    'created_on', 'createdOn', 'updated_at', 'updatedAt',
])

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

/** So sâu, đủ dùng cho dữ liệu JSON thuần. */
export const deepEqual = (a, b) => {
    if (a === b) return true
    if (a === null || b === null || a === undefined || b === undefined) return a === b
    if (typeof a !== typeof b) return false
    if (typeof a !== 'object') return false

    if (Array.isArray(a) || Array.isArray(b)) {
        if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false
        return a.every((item, i) => deepEqual(item, b[i]))
    }

    const ka = Object.keys(a).filter(k => !IGNORED_KEYS.has(k))
    const kb = Object.keys(b).filter(k => !IGNORED_KEYS.has(k))
    if (ka.length !== kb.length) return false
    return ka.every(k => deepEqual(a[k], b[k]))
}

/**
 * Mảng này có phải danh sách bản ghi có mrid không — điều kiện để gộp theo khoá.
 *
 * MẢNG RỖNG VẪN TÍNH LÀ CÓ KHOÁ. Trước đây hàm này đòi `length > 0`, và hậu quả rất
 * xấu: một bên xoá sạch danh sách thì bên đó thành mảng rỗng, phép kiểm trả false,
 * và cả hai danh sách bị đem so như MỘT giá trị nguyên khối. Người dùng nhận đúng
 * một câu hỏi "giữ 0 bài test của tôi hay lấy 5 bài của họ" — được ăn cả ngã về
 * không, trong khi đúng ra phải là năm câu hỏi riêng, mỗi bài một quyết định, và
 * những bài người kia không đụng tới thì tôn trọng lệnh xoá mà không cần hỏi.
 *
 * `[].every(...)` trả về true nên mảng rỗng tự khắc lọt qua. Mảng chứa giá trị
 * thường (chuỗi, số) vẫn bị loại, vì `every` xét từng phần tử.
 */
const isKeyedList = (arr) =>
    Array.isArray(arr) && arr.every(x => isObject(x) && x.mrid)

/**
 * Ô đo — đơn vị NGUYÊN KHỐI, không được chẻ nhỏ hơn.
 *
 * Một ô là `{ mrid, value, unit, type }`. Về mặt kỹ thuật vẫn đi sâu vào được, và
 * đó chính là cái bẫy: đi sâu thì xung đột được báo ở khoá `value`, nên hộp thoại
 * hiện tên trường là "value" — vô nghĩa với người dùng — và mất luôn đơn vị đi kèm.
 * Với dữ liệu thí nghiệm điện, "0.18" và "0.18 %" là hai chuyện khác nhau.
 *
 * Dừng ở mức ô thì xung đột mang tên cột thật (`ratio_dev`) và giá trị đem ra so
 * là cả ô, nên `describeValue` hiện được "0.18 %".
 */
const isCell = (v) =>
    isObject(v) && 'value' in v && typeof v.type === 'string'

const MISSING = Symbol('missing')

/**
 * Gộp một nhánh.
 *
 * @param {*} base   giá trị ở bản gốc; MISSING nếu nhánh chưa tồn tại lúc đồng bộ
 * @param {*} client giá trị ở bản đang sửa tại máy
 * @param {*} server giá trị ở bản vừa tải về
 * @param {Array} crumbs đường đi đọc được, để dựng nhãn cho hộp thoại
 * @param {Array} conflicts nơi gom các chỗ phải hỏi người dùng
 * @returns {*} giá trị đã gộp, hoặc MISSING nếu nhánh bị xoá
 */
function mergeNode(base, client, server, crumbs, conflicts) {
    const clientMissing = client === MISSING || client === undefined
    const serverMissing = server === MISSING || server === undefined
    const baseMissing   = base === MISSING || base === undefined

    // ── Xoá và thêm ──────────────────────────────────────────────────────────
    if (clientMissing && serverMissing) return MISSING

    if (clientMissing) {
        if (baseMissing) return server                      // server them
        if (deepEqual(base, server)) return MISSING         // client xoa, server yen
        conflicts.push(makeConflict(crumbs, base, MISSING, server))
        return MISSING                                      // mặc định theo bên xoá
    }

    if (serverMissing) {
        if (baseMissing) return client                      // client them
        if (deepEqual(base, client)) return MISSING         // server xoa, client yen
        conflicts.push(makeConflict(crumbs, base, client, MISSING))
        return client
    }

    // ── Bốn nhánh của bảng chân lý ───────────────────────────────────────────
    if (deepEqual(client, server)) return client            // giong nhau, khoi xet
    if (!baseMissing && deepEqual(base, client)) return server   // chi server doi
    if (!baseMissing && deepEqual(base, server)) return client   // chi client doi

    // ── Cả hai cùng đổi và khác nhau → đi sâu thêm nếu còn đi được ───────────
    if (isCell(client) || isCell(server)) {
        conflicts.push(makeConflict(crumbs, baseMissing ? MISSING : base, client, server))
        return client
    }

    if (isObject(client) && isObject(server)) {
        const merged = {}
        const keys = new Set([...Object.keys(client), ...Object.keys(server)])
        if (isObject(base)) Object.keys(base).forEach(k => keys.add(k))

        for (const key of keys) {
            if (IGNORED_KEYS.has(key)) {
                // Giữ theo client để không mất dữ liệu cục bộ ở những khoá không so.
                if (client[key] !== undefined) merged[key] = client[key]
                else if (server[key] !== undefined) merged[key] = server[key]
                continue
            }
            const value = mergeNode(
                isObject(base) ? pick(base, key) : MISSING,
                pick(client, key),
                pick(server, key),
                [...crumbs, crumbFor(key, client[key], server[key])],
                conflicts
            )
            if (value !== MISSING) merged[key] = value
        }
        return merged
    }

    if (isKeyedList(client) && isKeyedList(server)) {
        return mergeKeyedList(base, client, server, crumbs, conflicts)
    }

    // Lá: không đi sâu được nữa, và hai bên khác nhau.
    conflicts.push(makeConflict(crumbs, baseMissing ? MISSING : base, client, server))
    return client
}

const pick = (obj, key) =>
    (isObject(obj) && Object.prototype.hasOwnProperty.call(obj, key)) ? obj[key] : MISSING

/**
 * Gộp hai danh sách bản ghi theo mrid.
 *
 * Thứ tự lấy theo bản client, rồi nối những bản ghi server thêm vào ở cuối. Giữ
 * theo client là cố ý: người dùng đang nhìn thứ tự đó trên màn hình, đảo lại theo
 * server sẽ khiến bảng nhảy chỗ sau mỗi lần tải về.
 */
function mergeKeyedList(base, client, server, crumbs, conflicts) {
    const byMrid = (list) => {
        const map = new Map()
        if (Array.isArray(list)) list.forEach(x => { if (isObject(x) && x.mrid) map.set(x.mrid, x) })
        return map
    }

    const baseMap   = byMrid(base)
    const clientMap = byMrid(client)
    const serverMap = byMrid(server)

    const order = []
    client.forEach(x => order.push(x.mrid))
    server.forEach(x => { if (!clientMap.has(x.mrid)) order.push(x.mrid) })

    const out = []
    for (const mrid of order) {
        const c = clientMap.has(mrid) ? clientMap.get(mrid) : MISSING
        const s = serverMap.has(mrid) ? serverMap.get(mrid) : MISSING
        const b = baseMap.has(mrid) ? baseMap.get(mrid) : MISSING

        const value = mergeNode(
            b, c, s,
            [...crumbs, crumbForRecord(mrid, c, s, out.length)],
            conflicts
        )
        if (value !== MISSING) out.push(value)
    }
    return out
}

// ─── Nhãn đọc được ───────────────────────────────────────────────────────────
//
// Hộp thoại phải nói "Bài Ratio › Bảng 1 › Dòng 3 › Ratio dev", không phải
// "testList[2].data.table.table1[0].ratio_dev". Nhãn được dựng NGAY LÚC ĐỆ QUY, vì
// chỉ ở đó mới nhìn thấy tên bài test và tên cột; dựng lại từ đường dẫn sau đó thì
// phải đi tra ngược cả cây.

function crumbFor(key, clientValue, serverValue) {
    const named = clientValue || serverValue
    if (key === 'testList') return { kind: 'section', text: 'Tests' }
    if (key === 'table') return { kind: 'skip', text: '' }
    if (key === 'data') return { kind: 'skip', text: '' }
    if (key === 'properties') return { kind: 'section', text: 'Job header' }
    if (key === 'testCondition') return { kind: 'section', text: 'Test conditions' }
    if (key === 'condition') return { kind: 'skip', text: '' }
    if (key === 'testAssessment') return { kind: 'section', text: 'Assessment criteria' }
    if (isObject(named) && named.mrid && named.name) return { kind: 'node', text: named.name }
    return { kind: 'field', text: key }
}

function crumbForRecord(mrid, client, server, index) {
    const rec = isObject(client) ? client : (isObject(server) ? server : null)
    const name = rec && (rec.name || rec.testTypeName)
    if (name) return { kind: 'node', text: name }
    return { kind: 'row', text: `Row ${index + 1}`, mrid }
}

function makeConflict(crumbs, base, client, server) {
    const parts = crumbs.filter(c => c.kind !== 'skip' && c.text)
    return {
        // Khoá ổn định để hộp thoại theo dõi lựa chọn của người dùng.
        key: parts.map(p => p.text).join(' > ') || 'value',
        breadcrumb: parts.slice(0, -1).map(p => p.text),
        field: parts.length ? parts[parts.length - 1].text : 'value',
        base:   base === MISSING ? undefined : base,
        client: client === MISSING ? undefined : client,
        server: server === MISSING ? undefined : server,
        clientRemoved: client === MISSING,
        serverRemoved: server === MISSING,
        // Mặc định theo client — giữ nguyên công người dùng vừa nhập nếu họ bấm
        // đóng mà không chọn. Hộp thoại sẽ ghi đè giá trị này.
        choice: 'client',
    }
}

/**
 * Gộp ba bản của một job.
 *
 * @param {object|null} baseDto   bản gốc đã cất ở lần đồng bộ trước; null nếu chưa từng
 * @param {object} clientDto      bản đang có ở máy
 * @param {object} serverDto      bản vừa tải về
 * @returns {{merged: object, conflicts: Array}} bản đã gộp và các chỗ cần hỏi
 */
export const mergeJob = (baseDto, clientDto, serverDto) => {
    const conflicts = []
    const merged = mergeNode(
        baseDto === null || baseDto === undefined ? MISSING : baseDto,
        clientDto,
        serverDto,
        [],
        conflicts
    )
    return { merged: merged === MISSING ? serverDto : merged, conflicts }
}

/**
 * Áp lựa chọn của người dùng lên bản đã gộp.
 *
 * Gộp lại LẦN HAI thay vì vá tại chỗ: sau khi người dùng chọn, mỗi chỗ xung đột trở
 * thành "chỉ một bên đổi", nên chạy lại đúng thuật toán cũ là ra kết quả đúng, không
 * phải viết một đường đi riêng dễ lệch với đường chính.
 *
 * @param {object|null} baseDto
 * @param {object} clientDto
 * @param {object} serverDto
 * @param {Array} conflicts danh sách đã được người dùng đặt `choice`
 * @returns {object} bản gộp cuối cùng
 */
export const applyJobResolution = (baseDto, clientDto, serverDto, conflicts) => {
    const decisions = new Map(conflicts.map(c => [c.key, c.choice]))
    const taken = []
    const merged = mergeNodeWithDecisions(
        baseDto === null || baseDto === undefined ? MISSING : baseDto,
        clientDto, serverDto, [], decisions, taken
    )
    return merged === MISSING ? serverDto : merged
}

/**
 * Bản sao của `mergeNode` có tra bảng quyết định.
 *
 * Cố ý viết thành hàm riêng thay vì thêm cờ vào `mergeNode`: đường chạy lúc chưa
 * hỏi và đường chạy sau khi hỏi phải giống nhau ở MỌI nhánh trừ nhánh xung đột, và
 * tách ra thì chỗ khác nhau đó nhìn thấy ngay.
 */
function mergeNodeWithDecisions(base, client, server, crumbs, decisions, taken) {
    const clientMissing = client === MISSING || client === undefined
    const serverMissing = server === MISSING || server === undefined
    const baseMissing   = base === MISSING || base === undefined

    if (clientMissing && serverMissing) return MISSING

    if (clientMissing) {
        if (baseMissing) return server
        if (deepEqual(base, server)) return MISSING
        return decide(crumbs, decisions, taken, MISSING, server, MISSING)
    }
    if (serverMissing) {
        if (baseMissing) return client
        if (deepEqual(base, client)) return MISSING
        return decide(crumbs, decisions, taken, client, MISSING, client)
    }

    if (deepEqual(client, server)) return client
    if (!baseMissing && deepEqual(base, client)) return server
    if (!baseMissing && deepEqual(base, server)) return client

    if (isCell(client) || isCell(server)) {
        return decide(crumbs, decisions, taken, client, server, client)
    }

    if (isObject(client) && isObject(server)) {
        const merged = {}
        const keys = new Set([...Object.keys(client), ...Object.keys(server)])
        if (isObject(base)) Object.keys(base).forEach(k => keys.add(k))

        for (const key of keys) {
            if (IGNORED_KEYS.has(key)) {
                if (client[key] !== undefined) merged[key] = client[key]
                else if (server[key] !== undefined) merged[key] = server[key]
                continue
            }
            const value = mergeNodeWithDecisions(
                isObject(base) ? pick(base, key) : MISSING,
                pick(client, key), pick(server, key),
                [...crumbs, crumbFor(key, client[key], server[key])],
                decisions, taken
            )
            if (value !== MISSING) merged[key] = value
        }
        return merged
    }

    if (isKeyedList(client) && isKeyedList(server)) {
        return mergeKeyedListWithDecisions(base, client, server, crumbs, decisions, taken)
    }

    return decide(crumbs, decisions, taken, client, server, client)
}

function decide(crumbs, decisions, taken, clientValue, serverValue, fallback) {
    const parts = crumbs.filter(c => c.kind !== 'skip' && c.text)
    const key = parts.map(p => p.text).join(' > ') || 'value'
    taken.push(key)
    const choice = decisions.get(key)
    if (choice === 'server') return serverValue
    if (choice === 'client') return clientValue
    return fallback
}

function mergeKeyedListWithDecisions(base, client, server, crumbs, decisions, taken) {
    const byMrid = (list) => {
        const map = new Map()
        if (Array.isArray(list)) list.forEach(x => { if (isObject(x) && x.mrid) map.set(x.mrid, x) })
        return map
    }
    const baseMap = byMrid(base)
    const clientMap = byMrid(client)
    const serverMap = byMrid(server)

    const order = []
    client.forEach(x => order.push(x.mrid))
    server.forEach(x => { if (!clientMap.has(x.mrid)) order.push(x.mrid) })

    const out = []
    for (const mrid of order) {
        const c = clientMap.has(mrid) ? clientMap.get(mrid) : MISSING
        const s = serverMap.has(mrid) ? serverMap.get(mrid) : MISSING
        const b = baseMap.has(mrid) ? baseMap.get(mrid) : MISSING
        const value = mergeNodeWithDecisions(
            b, c, s,
            [...crumbs, crumbForRecord(mrid, c, s, out.length)],
            decisions, taken
        )
        if (value !== MISSING) out.push(value)
    }
    return out
}

/**
 * Hiển thị một giá trị cho người đọc.
 *
 * Ô đo là object `{mrid, value, unit, type}`; đưa nguyên JSON ra màn hình thì không
 * ai đọc nổi, mà chỉ lấy `value` thì mất đơn vị — và với dữ liệu thí nghiệm điện,
 * "0.18" với "0.18 %" là hai chuyện khác nhau.
 *
 * @param {*} v giá trị bất kỳ trong DTO
 * @returns {string} chuỗi ngắn để hiện trong hộp thoại
 */
export const describeValue = (v) => {
    if (v === undefined) return '(removed)'
    if (v === null || v === '') return '(empty)'
    if (isObject(v)) {
        if ('value' in v) {
            // DTO lưu đơn vị dạng "tiền tố|ký hiệu" ('M|Ω', 'k|V') để hai phần tách
            // rời được khi tính toán. Bỏ dấu gạch đi khi hiện ra, không thì người đọc
            // thấy "4367 M|Ω" và tưởng là dữ liệu hỏng.
            const unit = v.unit ? ` ${String(v.unit).replace('|', '')}` : ''
            const val = (v.value === null || v.value === '') ? '(empty)' : String(v.value)
            return `${val}${unit}`
        }
        if (v.name) return String(v.name)
        return `(${Object.keys(v).length} fields)`
    }
    if (Array.isArray(v)) return `(${v.length} items)`
    return String(v)
}
