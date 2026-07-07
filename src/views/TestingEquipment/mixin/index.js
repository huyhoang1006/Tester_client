import TestingEquipmentDto from "@/views/Dto/TestingEquipment"
import LicenseDto from "@/views/Dto/TestingEquipment/License"
import RepairDto from "@/views/Dto/TestingEquipment/Repair"
import * as Mapping from "@/views/Mapping/TestingEquipment"
import uuid from "@/utils/uuid"
/* eslint-disable */
export default {
    data() {
        return {
            testingEquipmentDto: new TestingEquipmentDto(),
            oldTestingEquipmentDto: new TestingEquipmentDto(),
        }
    },
    methods: {
        // Sinh uuid cho các mrid còn trống (asset/testing_equipment + các bản ghi con)
        fillMrids(dto) {
            if (!dto.properties.mrid) dto.properties.mrid = uuid.newUuid()
            dto.mrid = dto.properties.mrid
            if (!dto.productAssetModelId) dto.productAssetModelId = uuid.newUuid()
            if (!dto.lifecycleDateId) dto.lifecycleDateId = uuid.newUuid()
            if (!dto.attachmentId) dto.attachmentId = uuid.newUuid()
            if (!dto.userIdentifiedObjectId) dto.userIdentifiedObjectId = uuid.newUuid()
            for (const l of (dto.licenses || [])) if (!l.mrid) l.mrid = uuid.newUuid()
            for (const c of (dto.calibration || [])) if (!c.mrid) c.mrid = uuid.newUuid()
            for (const r of (dto.repairs || [])) if (!r.mrid) r.mrid = uuid.newUuid()
            for (const a of (dto.accessories || [])) {
                if (!a.mrid) a.mrid = uuid.newUuid()        // phụ kiện = testing_equipment con
                if (!a.pamId) a.pamId = uuid.newUuid()      // product_asset_model cho model
                if (!a.uioId) a.uioId = uuid.newUuid()      // link user cho phụ kiện
            }
        },

        // Đọc 1 testing equipment đầy đủ từ DB theo mrid -> bind vào UI
        async loadFromDb(mrid) {
            try {
                const rs = await window.electronAPI.getTestingEquipmentEntityByMrid(mrid)
                if (rs && rs.success && rs.data) {
                    const dto = Mapping.mapEntityToDto(rs.data)
                    this.testingEquipmentDto = dto
                    this.oldTestingEquipmentDto = JSON.parse(JSON.stringify(dto))
                    return { success: true }
                }
                this.loadData(null)
                return { success: false }
            } catch (error) {
                console.error('loadFromDb error:', error)
                this.loadData(null)
                return { success: false, error }
            }
        },

        // Verify các trường datetime & số trước khi lưu. Trả về mảng thông báo lỗi.
        validateBeforeSave(dto) {
            const errors = []
            const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v))
            const isYear = (v) => /^\d{4}$/.test(v) && +v >= 1900 && +v <= 2100
            const isIntNonNeg = (v) => Number.isInteger(Number(v)) && Number(v) >= 0
            const p = dto.properties || {}
            const empty = (v) => v == null || String(v).trim() === ''

            // ---- Bắt buộc ----
            if (empty(p.name)) errors.push('Name (tên thiết bị) là bắt buộc')
            if (empty(p.serial_no)) errors.push('Serial no. là bắt buộc')
            if (empty(p.manufacturer)) errors.push('Manufacturer là bắt buộc')
            ;(dto.licenses || []).forEach((l, i) => {
                if (empty(l.option_name)) errors.push(`License #${i + 1}: thiếu tên option`)
            })
            ;(dto.repairs || []).forEach((r, i) => {
                if (empty(r.reason)) errors.push(`Repair #${i + 1}: thiếu mô tả lỗi`)
            })
            ;(dto.calibration || []).forEach((c, i) => {
                if (empty(c.calibration_date)) errors.push(`Calibration #${i + 1}: thiếu ngày hiệu chuẩn`)
            })
            ;(dto.accessories || []).forEach((a, i) => {
                if (empty(a.name)) errors.push(`Accessory #${i + 1}: thiếu tên phụ kiện`)
            })

            // Overview (định dạng)
            if (p.manufacturer_year && !isYear(String(p.manufacturer_year).trim()))
                errors.push('Manufacturing year phải là năm hợp lệ (1900–2100)')
            if (p.purchase_date && !isDate(p.purchase_date))
                errors.push('Purchase date không hợp lệ (YYYY-MM-DD)')

            // Calibration
            ;(dto.calibration || []).forEach((c, i) => {
                const n = `Calibration #${i + 1}`
                if (c.calibration_date && !isDate(c.calibration_date)) errors.push(`${n}: Calibration date không hợp lệ`)
                if (c.due_date && !isDate(c.due_date)) errors.push(`${n}: Due date không hợp lệ`)
                if (c.interval_months !== '' && c.interval_months != null && !isIntNonNeg(c.interval_months))
                    errors.push(`${n}: Interval (months) phải là số nguyên ≥ 0`)
                if (isDate(c.calibration_date) && isDate(c.due_date) && Date.parse(c.due_date) < Date.parse(c.calibration_date))
                    errors.push(`${n}: Due date phải sau Calibration date`)
            })

            // Software license
            ;(dto.licenses || []).forEach((l, i) => {
                const n = `License #${i + 1}`
                if (l.activation_date && !isDate(l.activation_date)) errors.push(`${n}: Activation date không hợp lệ`)
                if (l.expiry_date && !isDate(l.expiry_date)) errors.push(`${n}: Expiry date không hợp lệ`)
                if (isDate(l.activation_date) && isDate(l.expiry_date) && Date.parse(l.expiry_date) < Date.parse(l.activation_date))
                    errors.push(`${n}: Expiry phải sau Activation`)
            })

            // Repair
            ;(dto.repairs || []).forEach((r, i) => {
                if (r.created_date_time && !isDate(r.created_date_time))
                    errors.push(`Repair #${i + 1}: ngày sửa không hợp lệ`)
            })

            return errors
        },

        // Lưu toàn bộ testing equipment: DTO -> entity phẳng -> insert (upsert) qua IPC
        async saveTestingEquipment() {
            try {
                const errors = this.validateBeforeSave(this.testingEquipmentDto)
                if (errors.length) {
                    const msg = errors.length === 1 ? errors[0] : `${errors.length} lỗi cần sửa — ${errors[0]}`
                    if (this.$message) this.$message.error(msg)
                    return { success: false, errors }
                }

                // gán user hiện tại cho thiết bị (dùng khi tạo link user_identified_object)
                const user = this.$store && this.$store.getters.getUser
                this.testingEquipmentDto.userId = (user && user.user_id) || ''
                // giữ thông tin user để upsert vào bảng user (FK cho user_identified_object)
                this.testingEquipmentDto.user = user ? {
                    user_id: user.user_id || '',
                    username: user.username != null ? user.username : null,
                    role: user.role != null ? user.role : null,
                    permission: user.permission != null ? user.permission : null,
                    token: user.token != null ? user.token : null,
                    group_user: user.group_user != null ? user.group_user : null
                } : null

                this.fillMrids(this.testingEquipmentDto)
                const entity = Mapping.mapDtoToEntity(JSON.parse(JSON.stringify(this.testingEquipmentDto)))
                const oldEntity = Mapping.mapDtoToEntity(JSON.parse(JSON.stringify(this.oldTestingEquipmentDto)))

                const rs = await window.electronAPI.insertTestingEquipmentEntity(oldEntity, entity)
                if (rs && rs.success) {
                    // Đồng bộ bản gốc để lần lưu sau tính diff xóa chính xác
                    this.oldTestingEquipmentDto = JSON.parse(JSON.stringify(this.testingEquipmentDto))
                    if (this.$message) this.$message.success('Testing equipment saved')
                    return { success: true, data: rs.data }
                } else {
                    if (this.$message) this.$message.error('Save failed: ' + ((rs && rs.message) || 'unknown'))
                    return { success: false }
                }
            } catch (error) {
                console.error('saveTestingEquipment error:', error)
                if (this.$message) this.$message.error('Save error: ' + (error.message || error))
                return { success: false, error }
            }
        },

        // Map an equipment record (from the list / Excel) into the DTO and bind it to the UI
        loadData(equipment) {
            const dto = new TestingEquipmentDto()

            if (equipment) {
                const e = equipment
                const yearMatch = String(e.made || '').match(/\d{4}/)
                const isDate = /^\d{4}-\d{2}-\d{2}$/.test(e.made || '')
                const hasRepair = !!(e.repair && e.repair.trim())

                dto.mrid = e.mrid || ''

                // Overview / identification
                const p = dto.properties
                p.name = e.name || ''
                p.serial_no = e.serial || ''
                p.manufacturer = e.manufacturer || ''
                p.model = e.model || ''
                p.manufacturer_year = yearMatch ? yearMatch[0] : ''
                p.asset_tag = e.id != null ? 'TE-' + String(e.id).padStart(3, '0') : ''
                p.status = hasRepair ? 'UnderRepair' : 'Available'
                p.country_of_origin = e.manufacturer === 'OMICRON' ? 'Austria'
                    : (e.manufacturer === 'HVI' ? 'USA' : '')
                p.purchase_date = isDate ? e.made : ''
                p.comment = [
                    e.customer && ('Customer: ' + e.customer),
                    e.enduser && ('End user: ' + e.enduser),
                    e.inservice && ('In-service date: ' + e.inservice)
                ].filter(Boolean).join('\n')

                // Software package -> license list
                dto.licenses = this.buildLicenses(e.software)

                // Repair history text -> one repair record
                if (hasRepair) {
                    const r = new RepairDto()
                    r.reason = e.repair
                    dto.repairs = [r]
                }
            }

            this.oldTestingEquipmentDto = JSON.parse(JSON.stringify(dto))
            this.testingEquipmentDto = dto
        },

        // Software package -> license list (split by '+' or newline)
        buildLicenses(software) {
            if (!software) return []
            return software.split(/\s*\+\s*|\n/)
                .map(s => s.replace(/^[-•\s]+/, '').trim())
                .filter(Boolean)
                .map(name => {
                    const l = new LicenseDto()
                    l.option_name = name
                    return l
                })
        },

        resetForm() {
            this.testingEquipmentDto = new TestingEquipmentDto()
            this.oldTestingEquipmentDto = new TestingEquipmentDto()
        },
    }
}
