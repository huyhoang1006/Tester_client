/**
 * CÁC TRƯỜNG ĐƯỢC TÌM KIẾM, THEO TỪNG LOẠI NODE.
 *
 * ─── VÌ SAO LÀ MỘT BẢNG KHAI BÁO CHỨ KHÔNG PHẢI SQL VIẾT TAY ────────────────
 *
 * Yêu cầu là tìm theo "các ô trên giao diện", mà các ô đó nằm rải ở 12 bảng khác nhau:
 * tên thì ở `identified_object`, địa chỉ ở `street_detail`/`town_detail`, số điện thoại ở
 * `telephone_number`, hãng sản xuất ở `product_asset_model`… Viết thẳng thành SQL thì
 * không ai soi được là đã đủ hay còn thiếu ô nào.
 *
 * Ở dạng bảng thì đối chiếu được từng dòng với từng ô trên màn hình, và thêm ô mới chỉ là
 * thêm một dòng.
 *
 * ─── `label` LÀ TÊN NGƯỜI DÙNG NHÌN THẤY ────────────────────────────────────
 *
 * Kết quả tìm kiếm phải nói được "khớp ở đâu". Hiện `street_detail.address_general` thì
 * không ai hiểu; hiện "Address" thì hiểu ngay. Nên mỗi trường mang theo nhãn tiếng Anh
 * đúng như nhãn trên giao diện.
 *
 * ─── ĐƯỜNG JOIN GHI RÕ, KHÔNG ĐỂ SQL TỰ ĐOÁN ────────────────────────────────
 *
 * `joins` là danh sách LEFT JOIN nguyên văn. LEFT chứ không INNER: thiếu địa chỉ là
 * chuyện bình thường, mà INNER JOIN thì node thiếu địa chỉ sẽ biến mất khỏi kết quả kể cả
 * khi tên khớp — đúng kiểu hỏng mà không ai báo.
 */

/** Bảng gốc chung: mọi node đều có một dòng identified_object cùng mrid. */
const IDENTIFIED_OBJECT_FIELDS = [
    { expr: 'io.name', label: 'Name' },
    { expr: 'io.alias_name', label: 'Display name' },
    { expr: 'io.description', label: 'Comment' },
]

export const SEARCH_TARGETS = {
    organisation: {
        mode: 'organisation',
        typeLabel: 'Organisation',
        base: 'organisation o',
        joins: [
            'LEFT JOIN identified_object io ON io.mrid = o.mrid',
            'LEFT JOIN street_address sa ON sa.mrid = o.street_address',
            'LEFT JOIN street_detail sd ON sd.mrid = sa.street_detail',
            'LEFT JOIN town_detail td ON td.mrid = sa.town_detail',
            'LEFT JOIN electronic_address ea ON ea.mrid = o.electronic_address',
            'LEFT JOIN telephone_number tn ON tn.mrid = o.phone',
        ],
        idColumn: 'o.mrid',
        fields: [
            ...IDENTIFIED_OBJECT_FIELDS,
            { expr: 'o.tax_code', label: 'Tax code' },
            { expr: 'sd.address_general', label: 'Address' },
            { expr: 'td.ward_or_commune', label: 'Ward/Commune' },
            { expr: 'td.district_or_town', label: 'District/Town' },
            { expr: 'td.city', label: 'City' },
            { expr: 'td.state_or_province', label: 'State/Province' },
            { expr: 'td.country', label: 'Country' },
            { expr: 'sa.postal_code', label: 'Postal code' },
            { expr: 'ea.email', label: 'Email' },
            { expr: 'ea.fax', label: 'Fax' },
            { expr: 'tn.itu_phone', label: 'Phone' },
        ],
    },

    substation: {
        mode: 'substation',
        typeLabel: 'Substation',
        base: 'substation s',
        joins: [
            'LEFT JOIN identified_object io ON io.mrid = s.mrid',
            // psr_type chỉ có mrid; TÊN loại trạm nằm ở identified_object của chính nó.
            'LEFT JOIN power_system_resource psr ON psr.mrid = s.mrid',
            'LEFT JOIN identified_object pio ON pio.mrid = psr.psr_type_id',
            'LEFT JOIN location loc ON loc.mrid = psr.location',
            'LEFT JOIN identified_object lio ON lio.mrid = loc.mrid',
            'LEFT JOIN street_address sa ON sa.mrid = loc.main_address',
            'LEFT JOIN street_detail sd ON sd.mrid = sa.street_detail',
            'LEFT JOIN town_detail td ON td.mrid = sa.town_detail',
            'LEFT JOIN electronic_address ea ON ea.mrid = loc.electronic_address',
            'LEFT JOIN telephone_number tn ON tn.mrid = loc.phone',
        ],
        idColumn: 's.mrid',
        fields: [
            ...IDENTIFIED_OBJECT_FIELDS,
            { expr: 'pio.name', label: 'Type' },
            { expr: 's.generation', label: 'Generation' },
            { expr: 's.industry', label: 'Industry' },
            { expr: 'lio.name', label: 'Location name' },
            { expr: 'sd.address_general', label: 'Address' },
            { expr: 'td.ward_or_commune', label: 'Ward/Commune' },
            { expr: 'td.district_or_town', label: 'District/Town' },
            { expr: 'td.city', label: 'City' },
            { expr: 'td.state_or_province', label: 'State/Province' },
            { expr: 'td.country', label: 'Country' },
            { expr: 'sa.postal_code', label: 'Postal code' },
            { expr: 'ea.email', label: 'Email' },
            { expr: 'ea.fax', label: 'Fax' },
            { expr: 'tn.itu_phone', label: 'Phone' },
        ],
    },

    voltageLevel: {
        mode: 'voltageLevel',
        typeLabel: 'Voltage level',
        base: 'voltage_level vl',
        joins: [
            'LEFT JOIN identified_object io ON io.mrid = vl.mrid',
            'LEFT JOIN base_voltage bv ON bv.mrid = vl.base_voltage',
            'LEFT JOIN voltage nv ON nv.mrid = bv.nominal_voltage',
            'LEFT JOIN voltage hv ON hv.mrid = vl.high_voltage_limit',
            'LEFT JOIN voltage lv ON lv.mrid = vl.low_voltage_limit',
        ],
        idColumn: 'vl.mrid',
        fields: [
            ...IDENTIFIED_OBJECT_FIELDS,
            // Trị điện áp là REAL; ép về TEXT để LIKE dùng được. Gõ "500" ra được cấp
            // 500 kV, đúng cách người dùng gọi tên nó.
            { expr: 'CAST(nv.value AS TEXT)', label: 'Base voltage' },
            { expr: 'CAST(hv.value AS TEXT)', label: 'High voltage limit' },
            { expr: 'CAST(lv.value AS TEXT)', label: 'Low voltage limit' },
        ],
    },

    bay: {
        mode: 'bay',
        typeLabel: 'Bay',
        base: 'bay b',
        joins: ['LEFT JOIN identified_object io ON io.mrid = b.mrid'],
        idColumn: 'b.mrid',
        fields: [
            ...IDENTIFIED_OBJECT_FIELDS,
            { expr: 'b.breaker_configuration', label: 'Breaker configuration' },
            { expr: 'b.bus_bar_configuration', label: 'Busbar configuration' },
        ],
    },

    asset: {
        mode: 'asset',
        typeLabel: 'Asset',
        base: 'asset a',
        joins: [
            // `io.name` của asset CHÍNH LÀ ô "Apparatus ID" trên giao diện
            // (mapper: entity.asset.name = dto.properties.apparatus_id).
            'LEFT JOIN identified_object io ON io.mrid = a.mrid',
            'LEFT JOIN asset_info ai ON ai.mrid = a.asset_info',
            'LEFT JOIN product_asset_model pam ON pam.mrid = a.product_asset_model',
            'LEFT JOIN lifecycle_date ld ON ld.mrid = a.lifecycle_date',
        ],
        idColumn: 'a.mrid',
        fields: [
            { expr: 'io.name', label: 'Apparatus ID' },
            { expr: 'io.alias_name', label: 'Display name' },
            { expr: 'io.description', label: 'Comment' },
            { expr: 'a.serial_number', label: 'Serial number' },
            { expr: 'a.kind', label: 'Kind' },
            { expr: 'a.type', label: 'Type' },
            { expr: 'a.country_of_origin', label: 'Country of origin' },
            { expr: 'a.lot_number', label: 'Lot number' },
            { expr: 'a.utc_number', label: 'UTC number' },
            { expr: 'pam.manufacturer', label: 'Manufacturer' },
            { expr: 'ai.manufacturer_type', label: 'Manufacturer type' },
            { expr: 'pam.model_number', label: 'Model number' },
            { expr: 'pam.catalogue_number', label: 'Catalogue number' },
            { expr: 'ld.manufactured_date', label: 'Manufacturing year' },
        ],
    },

    job: {
        mode: 'job',
        typeLabel: 'Job',
        base: 'old_work ow',
        joins: [
            'LEFT JOIN identified_object io ON io.mrid = ow.mrid',
            'LEFT JOIN document doc ON doc.mrid = ow.mrid',
            'LEFT JOIN work w ON w.mrid = ow.mrid',
        ],
        idColumn: 'ow.mrid',
        fields: [
            { expr: 'io.name', label: 'Name' },
            { expr: 'io.description', label: 'Summary' },
            { expr: 'doc.type', label: 'Type' },
            { expr: 'doc.approver', label: 'Approved by' },
            { expr: 'doc.created_date_time', label: 'Creation date' },
            { expr: 'ow.tested_by', label: 'Tested by' },
            { expr: 'ow.execution_date', label: 'Execution date' },
            { expr: 'ow.approval_date', label: 'Approval date' },
            { expr: 'ow.test_method', label: 'Test method' },
            { expr: 'ow.ref_standard', label: 'Reference standard' },
            { expr: 'w.work_order_number', label: 'Work order number' },
        ],
    },
}

export const SEARCH_MODES = Object.keys(SEARCH_TARGETS)

export default { SEARCH_TARGETS, SEARCH_MODES }
