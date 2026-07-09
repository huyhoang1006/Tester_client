/* eslint-disable */
/**
 * templateExport.js — Export Testing equipment ra Excel/Word theo template.
 * TÁCH BIỆT với Export/services/exportService.js của cây org→job — không dùng chung.
 *
 * Flow: entity (DB) → mapEntityToDto → flatMap/arrayMap → extractFromMaps
 *       → {code: [vals]} → exportTemplateWithData / exportWordWithData
 * Nhiều thiết bị: giá trị mỗi code được nối mảng (mỗi occurrence = 1 thiết bị).
 */
import { FEATURE_TREE } from '@/views/Common/constants'
import { mapEntityToDto } from '@/views/Mapping/TestingEquipment'
import { TE_CAT_KEY } from './templateImport'

const s = (v) => (v !== undefined && v !== null) ? String(v) : ''
const bulletList = (items) => {
    const values = (items || []).map(s).map(v => v.trim()).filter(Boolean)
    return values.map(v => `- ${v.replace(/\r?\n/g, '\n  ')}`).join('\n')
}

export const templateExport = {

    getLeafValue(featureLevels, category) {
        if (!featureLevels || !featureLevels.length) return null
        let node = FEATURE_TREE[category]
        if (!node) return null
        for (const level of featureLevels) {
            if (!level.key) break
            node = node.children && node.children[level.key]
            if (!node) return null
        }
        return (node && node.value !== undefined) ? node.value : null
    },

    // 1 thiết bị → { flatMap, arrayMap } (key = leaf value trong FEATURE_TREE.TestingEquipmentDto)
    async buildMaps(mrid) {
        const rs = await window.electronAPI.getTestingEquipmentEntityByMrid(mrid)
        if (!rs || !rs.success || !rs.data) return null
        const dto = mapEntityToDto(rs.data)
        const p = dto.properties || {}
        const flatMap = {
            name: s(p.name), type: s(p.type), serial_no: s(p.serial_no),
            manufacturer: s(p.manufacturer), model: s(p.model),
            manufacturer_year: s(p.manufacturer_year), asset_tag: s(p.asset_tag),
            status: s(p.status), country_of_origin: s(p.country_of_origin),
            in_use_date: s(p.in_use_date), comment: s(p.comment),
            is_accessory: s(p.is_accessory != null ? p.is_accessory : 0)
        }
        const cal = dto.calibration || []
        const lic = dto.licenses || []
        const rep = dto.repairs || []
        // Usage: SUY RA từ job/test (không lưu bảng riêng) → query qua IPC
        let use = []
        try {
            const usageRs = await window.electronAPI.getTestingEquipmentUsage(mrid)
            use = (usageRs && usageRs.success && Array.isArray(usageRs.data)) ? usageRs.data : []
        } catch (e) { console.error('get usage history failed:', e) }
        const arrayMap = {
            cal_calibration_date:   bulletList(cal.map(x => x.calibration_date)),
            cal_due_date:           bulletList(cal.map(x => x.due_date)),
            cal_interval_months:    bulletList(cal.map(x => x.interval_months)),
            cal_provider:           bulletList(cal.map(x => x.provider)),
            cal_certificate_number: bulletList(cal.map(x => x.certificate_number)),
            cal_result:             bulletList(cal.map(x => x.result)),
            cal_notes:              bulletList(cal.map(x => x.notes)),
            lic_option_name:        bulletList(lic.map(x => x.option_name)),
            lic_license_key:        bulletList(lic.map(x => x.license_key)),
            lic_enabled:            bulletList(lic.map(x => x.enabled != null ? x.enabled : 1)),
            lic_description:        bulletList(lic.map(x => x.description)),
            lic_activation_date:    bulletList(lic.map(x => x.activation_date)),
            lic_expiry_date:        bulletList(lic.map(x => x.expiry_date)),
            rep_created_date_time:  bulletList(rep.map(x => x.created_date_time)),
            rep_reason:             bulletList(rep.map(x => x.reason)),
            rep_provider:           bulletList(rep.map(x => x.provider)),
            rep_cost:               bulletList(rep.map(x => x.cost)),
            rep_status:             bulletList(rep.map(x => x.status)),
            use_date:               bulletList(use.map(x => x.date)),
            use_job_name:           bulletList(use.map(x => x.job_name)),
            use_asset_name:         bulletList(use.map(x => x.asset_name)),
            use_test_type:          bulletList(use.map(x => x.test_type)),
            use_tested_by:          bulletList(use.map(x => x.tested_by))
        }
        return { flatMap, arrayMap }
    },

    // {flatMap, arrayMap} + template rows → {code: [vals]}
    extractFromMaps(flatMap, arrayMap, tableData) {
        const result = {}
        if (!flatMap) flatMap = {}
        for (const row of tableData) {
            if (!row.code || row.category !== TE_CAT_KEY) continue
            const leaf = this.getLeafValue(row.featureLevels, row.category)
            if (!leaf) continue
            if (arrayMap && leaf in arrayMap) {
                result[row.code] = [s(arrayMap[leaf])]
            } else if (leaf in flatMap) {
                result[row.code] = [s(flatMap[leaf])]
            }
        }
        return result
    },

    // Nhiều thiết bị → gộp: mỗi code là mảng giá trị nối tiếp (mỗi thiết bị 1 occurrence)
    async buildCodeMap(mrids, tableData) {
        const codeMap = {}
        for (const mrid of mrids) {
            const maps = await this.buildMaps(mrid)
            if (!maps) continue
            const partial = this.extractFromMaps(maps.flatMap, maps.arrayMap, tableData)
            for (const code in partial) {
                if (!codeMap[code]) codeMap[code] = []
                codeMap[code].push.apply(codeMap[code], partial[code])
            }
        }
        return codeMap
    }
}

export default templateExport
