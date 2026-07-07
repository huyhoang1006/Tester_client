import TestingEquipmentEntity from "@/views/Flatten/TestingEquipmentEntity";
import TestingEquipmentDto from "@/views/Dto/TestingEquipment";
import SoftwareLicense from "@/views/Flatten/SoftwareLicense";
import CalibrationRecord from "@/views/Flatten/CalibrationRecord";
import RepairRecord from "@/views/Flatten/RepairRecord";
import Asset from "@/views/Cim/Asset";
import ProductAssetModel from "@/views/Cim/ProductAssetModel";
import TestingEquipmentInfo from "@/views/Flatten/TestingEquipmentInfo";

/* eslint-disable */

// DTO (7 tab) -> Entity phẳng (khớp shape insertTestingEquipmentEntity)
export const mapDtoToEntity = (dto) => {
    const entity = new TestingEquipmentEntity();
    const p = dto.properties || {};
    const mrid = p.mrid || dto.mrid || null;

    // --- product_asset_model (manufacturer / model) ---
    entity.productAssetModel.mrid = dto.productAssetModelId || null;
    entity.productAssetModel.name = p.model || null;          // identified_object.name của model
    entity.productAssetModel.model_number = p.model || null;
    entity.productAssetModel.manufacturer = p.manufacturer || null;

    // --- lifecycle_date (năm SX / ngày mua) ---
    entity.lifecycleDate.mrid = dto.lifecycleDateId || null;
    entity.lifecycleDate.manufactured_date = p.manufacturer_year || null;
    entity.lifecycleDate.purchase_date = p.purchase_date || null;

    // --- asset (nền) + identified_object ---
    entity.asset.mrid = mrid;
    entity.asset.name = p.name || null;                       // identified_object.name
    entity.asset.description = p.comment || null;             // identified_object.description
    entity.asset.serial_number = p.serial_no || null;
    entity.asset.kind = 'WorkEquipmentAsset';                 // phân biệt: KHÔNG phải PowerSystemResource
    entity.asset.type = p.type || null;
    entity.asset.country_of_origin = p.country_of_origin || null;
    entity.asset.status = null;                               // FK -> status; map sau
    entity.asset.product_asset_model = entity.productAssetModel.mrid;
    entity.asset.lifecycle_date = entity.lifecycleDate.mrid;

    // --- testing_equipment ---
    entity.testingEquipment.mrid = mrid;
    entity.testingEquipment.work_id = dto.work_id || null;
    entity.testingEquipment.asset_tag = p.asset_tag || null;
    entity.testingEquipment.is_accessory = p.is_accessory ? 1 : 0;   // Main / Accessory theo lựa chọn ở Overview

    // --- attachment (1 record, path = JSON danh sách [{path}]) ---
    entity.attachment.id = dto.attachmentId || null;
    entity.attachment.name = null;
    entity.attachment.type = 'asset';
    entity.attachment.id_foreign = mrid;
    entity.attachment.path = JSON.stringify(dto.attachments || []);

    // --- user link (user_identified_object): thiết bị thuộc user nào ---
    entity.userIdentifiedObject.mrid = dto.userIdentifiedObjectId || null;
    entity.userIdentifiedObject.user_id = dto.userId || null;
    entity.userIdentifiedObject.identified_object_id = mrid;
    // thông tin user để upsert vào bảng user (đảm bảo FK)
    entity.user = dto.user || null;

    // --- software licenses (n-n) ---
    entity.softwareLicenses = (dto.licenses || []).map((l) => {
        const s = new SoftwareLicense();
        s.mrid = l.mrid || null;
        s.option_name = l.option_name || null;
        s.license_key = l.license_key || null;
        s.enabled = l.enabled != null ? l.enabled : null;
        s.description = l.description || null;
        s.activation_date = l.activation_date || null;
        s.expiry_date = l.expiry_date || null;
        s.seat_count = l.seat_count != null ? l.seat_count : null;
        return s;
    });

    // --- calibration (1-n) ---
    entity.calibrations = (dto.calibration || []).map((c) => {
        const r = new CalibrationRecord();
        r.mrid = c.mrid || null;
        r.testing_equipment = mrid;
        r.calibration_date = c.calibration_date || null;
        r.due_date = c.due_date || null;
        r.interval_months = c.interval_months != null ? c.interval_months : null;
        r.provider = c.provider || null;
        r.certificate_number = c.certificate_number || null;
        r.result = c.result || null;
        r.notes = c.notes || null;
        return r;
    });

    // --- repairs -> activity_record (type='Repair') ---
    entity.repairs = (dto.repairs || []).map((rp) => {
        const r = new RepairRecord();
        r.mrid = rp.mrid || null;
        r.type = 'Repair';
        r.created_date_time = rp.created_date_time || null;
        r.reason = rp.reason || null;
        // activity_record.status là FK -> status(mrid), không nhét text được.
        // Tiến độ Repair (InProgress|Completed) lưu vào cột severity (text tự do).
        r.status = null;
        r.severity = rp.status || 'InProgress';
        r.asset = mrid;
        r.provider = rp.provider || null;
        r.cost = rp.cost || null;
        return r;
    });

    // --- accessories (n-n): mỗi phụ kiện là 1 testing_equipment con ---
    // Mỗi accessory -> mini entity { asset, productAssetModel, testingEquipment }
    entity.accessories = (dto.accessories || []).map((a) => {
        const accAsset = new Asset();
        accAsset.mrid = a.mrid || null;
        accAsset.name = a.name || null;
        accAsset.description = a.description || null;
        accAsset.serial_number = a.serial_no || null;
        accAsset.kind = 'WorkEquipmentAsset';

        const accPam = new ProductAssetModel();
        accPam.mrid = a.pamId || null;
        accPam.name = a.model || null;
        accPam.model_number = a.model || null;
        accAsset.product_asset_model = a.model ? (a.pamId || null) : null;

        const accTe = new TestingEquipmentInfo();
        accTe.mrid = a.mrid || null;
        accTe.is_accessory = 1;   // đánh dấu là phụ kiện

        return {
            asset: accAsset,
            productAssetModel: accPam,
            testingEquipment: accTe,
            userIdentifiedObject: {
                mrid: a.uioId || null,
                user_id: dto.userId || null,
                identified_object_id: a.mrid || null
            },
            needs_calibration: a.needs_calibration || 0   // (chưa lưu DB - giữ để round-trip trong phiên)
        };
    });

    return entity;
};

// Entity phẳng -> DTO (7 tab)
export const mapEntityToDto = (entity) => {
    const dto = new TestingEquipmentDto();
    const a = entity.asset || {};
    const te = entity.testingEquipment || {};
    const pam = entity.productAssetModel || {};
    const lc = entity.lifecycleDate || {};
    const mrid = te.mrid || a.mrid || '';

    dto.mrid = mrid;
    dto.productAssetModelId = pam.mrid || '';
    dto.lifecycleDateId = lc.mrid || '';
    const uio = entity.userIdentifiedObject || {};
    dto.userId = uio.user_id || '';
    dto.userIdentifiedObjectId = uio.mrid || '';

    // attachment: path là JSON [{path}]
    const att = entity.attachment || {};
    dto.attachmentId = att.id || '';
    try { dto.attachments = att.path ? JSON.parse(att.path) : []; }
    catch (e) { dto.attachments = []; }
    dto.properties.mrid = mrid;
    dto.properties.name = a.name || '';
    dto.properties.comment = a.description || '';
    dto.properties.serial_no = a.serial_number || '';
    dto.properties.type = a.type || '';
    dto.properties.country_of_origin = a.country_of_origin || '';
    dto.properties.status = a.status || '';
    dto.properties.asset_tag = te.asset_tag || '';
    dto.properties.is_accessory = te.is_accessory != null ? te.is_accessory : 0;
    dto.work_id = te.work_id || '';
    // Overview từ product_asset_model / lifecycle_date
    dto.properties.manufacturer = pam.manufacturer || '';
    dto.properties.model = pam.model_number || '';
    dto.properties.manufacturer_year = lc.manufactured_date || '';
    dto.properties.purchase_date = lc.purchase_date || '';

    dto.licenses = (entity.softwareLicenses || []).map((l) => ({
        mrid: l.mrid || '',
        option_name: l.option_name || '',
        license_key: l.license_key || '',
        enabled: l.enabled != null ? l.enabled : 1,
        description: l.description || '',
        activation_date: l.activation_date || '',
        expiry_date: l.expiry_date || ''
    }));

    dto.calibration = (entity.calibrations || []).map((c) => ({
        mrid: c.mrid || '',
        calibration_date: c.calibration_date || '',
        due_date: c.due_date || '',
        interval_months: c.interval_months != null ? c.interval_months : null,
        provider: c.provider || '',
        certificate_number: c.certificate_number || '',
        result: c.result || '',
        notes: c.notes || ''
    }));

    dto.repairs = (entity.repairs || []).map((r) => ({
        mrid: r.mrid || '',
        type: r.type || 'Repair',
        created_date_time: r.created_date_time || '',
        reason: r.reason || '',
        status: r.severity || 'InProgress',   // tiến độ đọc lại từ cột severity
        provider: r.provider || '',
        cost: r.cost || ''
    }));

    // accessories: từ DB là dòng chi tiết {mrid,name,model,serial_no,description};
    // từ mapDtoToEntity là mini-entity {asset,productAssetModel,...}
    dto.accessories = (entity.accessories || []).map((x) => {
        if (x.asset) {
            return {
                mrid: x.asset.mrid || '',
                pamId: (x.productAssetModel && x.productAssetModel.mrid) || '',
                name: x.asset.name || '',
                model: (x.productAssetModel && x.productAssetModel.model_number) || '',
                serial_no: x.asset.serial_number || '',
                needs_calibration: x.needs_calibration || 0,
                description: x.asset.description || ''
            };
        }
        return {
            mrid: x.mrid || '',
            pamId: x.product_asset_model || '',
            name: x.name || '',
            model: x.model || '',
            serial_no: x.serial_no || '',
            needs_calibration: x.needs_calibration || 0,
            description: x.description || ''
        };
    });

    return dto;
};

export default { mapDtoToEntity, mapEntityToDto };
