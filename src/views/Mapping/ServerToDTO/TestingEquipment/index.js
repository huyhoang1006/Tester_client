import TestingEquipmentDto from "@/views/Dto/TestingEquipment";

/* eslint-disable */

// Chuyển 1 bản ghi testing equipment từ SERVER -> TestingEquipmentDto (client).
// Server chưa có API testing-equipment nên shape dưới đây là PHÒNG THỦ:
// đọc nhiều tên field khả dĩ (camelCase / snake_case / lồng object). Khi biết
// shape thật của server, rút gọn lại cho đúng.
export const mapServerToDto = (s) => {
    const dto = new TestingEquipmentDto();
    s = s || {};
    const pam = s.productAssetModel || s.product_asset_model || {};
    const lc = s.lifecycleDate || s.lifecycle_date || {};

    const mrid = s.mrid || s.mRID || s.id || '';
    dto.mrid = mrid;
    dto.organisationId = s.organisationId || s.organisation_id || s.organisation || '';
    dto.productAssetModelId = pam.mrid || pam.mRID || s.productAssetModelId || '';
    dto.lifecycleDateId = lc.mrid || lc.mRID || s.lifecycleDateId || '';

    const p = dto.properties;
    p.mrid = mrid;
    p.name = s.name || s.assetName || '';
    p.serial_no = s.serialNumber || s.serial_number || s.serial || '';
    p.manufacturer = pam.manufacturer || s.manufacturer || '';
    p.model = pam.modelNumber || pam.model_number || s.model || '';
    p.manufacturer_year = lc.manufacturedDate || lc.manufactured_date || s.manufacturerYear || '';
    p.purchase_date = lc.purchaseDate || lc.purchase_date || s.purchaseDate || '';
    p.asset_tag = s.assetTag || s.asset_tag || '';
    p.status = s.status || '';
    p.country_of_origin = s.countryOfOrigin || s.country_of_origin || '';
    p.type = s.type || '';
    p.comment = s.description || s.comment || '';

    // Các tab con — map nếu server trả về (TODO: khớp tên field khi có API thật)
    dto.licenses = (s.softwareLicenses || s.licenses || []).map((l) => ({
        mrid: l.mrid || l.id || '',
        option_name: l.optionName || l.option_name || '',
        license_key: l.licenseKey || l.license_key || '',
        enabled: l.enabled != null ? l.enabled : 1,
        description: l.description || '',
        activation_date: l.activationDate || l.activation_date || '',
        expiry_date: l.expiryDate || l.expiry_date || ''
    }));

    dto.calibration = (s.calibrations || s.calibration || []).map((c) => ({
        mrid: c.mrid || c.id || '',
        calibration_date: c.calibrationDate || c.calibration_date || '',
        due_date: c.dueDate || c.due_date || '',
        interval_months: c.intervalMonths != null ? c.intervalMonths : (c.interval_months != null ? c.interval_months : null),
        provider: c.provider || '',
        certificate_number: c.certificateNumber || c.certificate_number || '',
        result: c.result || '',
        notes: c.notes || ''
    }));

    dto.repairs = (s.repairs || []).map((r) => ({
        mrid: r.mrid || r.id || '',
        type: 'Repair',
        created_date_time: r.createdDateTime || r.created_date_time || '',
        reason: r.reason || '',
        status: r.status || r.severity || 'InProgress',
        provider: r.provider || '',
        cost: r.cost || ''
    }));

    // accessories junction — server trả list mrid phụ kiện (nếu có)
    dto.accessories = (s.accessories || []).map((a) => ({
        mrid: a.accessory || a.mrid || a.id || ''
    }));

    return dto;
};

export default { mapServerToDto };
