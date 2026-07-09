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
            if (!dto.inUseDateId) dto.inUseDateId = uuid.newUuid()
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
                    // Usage history: SUY RA từ job/test (không lưu record riêng)
                    try {
                        const usageRs = await window.electronAPI.getTestingEquipmentUsage(mrid)
                        dto.usage = (usageRs && usageRs.success && Array.isArray(usageRs.data)) ? usageRs.data : []
                    } catch (e) {
                        console.error('load usage history failed:', e)
                        dto.usage = []
                    }
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
            const normalizeDate = (v) => {
                if (v == null || String(v).trim() === '') return ''
                if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString().slice(0, 10)
                const text = String(v).trim()
                const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/)
                if (iso) {
                    const value = `${iso[1]}-${iso[2]}-${iso[3]}`
                    return !isNaN(Date.parse(value)) ? value : ''
                }
                const slash = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/)
                if (slash) {
                    const yyyy = slash[3].length === 2 ? `20${slash[3]}` : slash[3]
                    const mm = slash[1].padStart(2, '0')
                    const dd = slash[2].padStart(2, '0')
                    const value = `${yyyy}-${mm}-${dd}`
                    return !isNaN(Date.parse(value)) ? value : ''
                }
                const named = text.match(/^(\d{1,2})[-\s]([A-Za-z]{3,9})[-\s](\d{2}|\d{4})$/)
                if (named) {
                    const months = {
                        jan: '01', january: '01',
                        feb: '02', february: '02',
                        mar: '03', march: '03',
                        apr: '04', april: '04',
                        may: '05',
                        jun: '06', june: '06',
                        jul: '07', july: '07',
                        aug: '08', august: '08',
                        sep: '09', sept: '09', september: '09',
                        oct: '10', october: '10',
                        nov: '11', november: '11',
                        dec: '12', december: '12'
                    }
                    const mm = months[named[2].toLowerCase()]
                    if (!mm) return ''
                    const yyyy = named[3].length === 2 ? `20${named[3]}` : named[3]
                    const dd = named[1].padStart(2, '0')
                    const value = `${yyyy}-${mm}-${dd}`
                    return !isNaN(Date.parse(value)) ? value : ''
                }
                return ''
            }
            const normalizeDateField = (obj, key) => {
                if (!obj || !obj[key]) return true
                const value = normalizeDate(obj[key])
                if (!value) return false
                obj[key] = value
                return true
            }
            const isDate = (v) => !!normalizeDate(v)
            const isIntNonNeg = (v) => Number.isInteger(Number(v)) && Number(v) >= 0
            const p = dto.properties || {}
            const empty = (v) => v == null || String(v).trim() === ''

            // ---- Bắt buộc ----
            if (empty(p.serial_no)) errors.push('Serial no. là bắt buộc')
            if (empty(p.manufacturer)) errors.push('Manufacturer là bắt buộc')

            // Overview (định dạng)
            if (p.manufacturer_year && !normalizeDateField(p, 'manufacturer_year'))
                errors.push('Manufacturing date is invalid (YYYY-MM-DD)')
            if (p.in_use_date && !normalizeDateField(p, 'in_use_date'))
                errors.push('In use date không hợp lệ (YYYY-MM-DD)')

            // Calibration
            ;(dto.calibration || []).forEach((c, i) => {
                const n = `Calibration #${i + 1}`
                if (c.calibration_date && !normalizeDateField(c, 'calibration_date')) errors.push(`${n}: Calibration date không hợp lệ`)
                if (c.due_date && !normalizeDateField(c, 'due_date')) errors.push(`${n}: Due date không hợp lệ`)
                if (c.interval_months !== '' && c.interval_months != null && !isIntNonNeg(c.interval_months))
                    errors.push(`${n}: Interval (months) phải là số nguyên ≥ 0`)
                if (isDate(c.calibration_date) && isDate(c.due_date) && Date.parse(c.due_date) < Date.parse(c.calibration_date))
                    errors.push(`${n}: Due date phải sau Calibration date`)
            })

            // Software license
            ;(dto.licenses || []).forEach((l, i) => {
                const n = `License #${i + 1}`
                if (l.activation_date && !normalizeDateField(l, 'activation_date')) errors.push(`${n}: Activation date không hợp lệ`)
                if (l.expiry_date && !normalizeDateField(l, 'expiry_date')) errors.push(`${n}: Expiry date không hợp lệ`)
                if (isDate(l.activation_date) && isDate(l.expiry_date) && Date.parse(l.expiry_date) < Date.parse(l.activation_date))
                    errors.push(`${n}: Expiry phải sau Activation`)
            })

            // Repair
            ;(dto.repairs || []).forEach((r, i) => {
                if (r.created_date_time && !normalizeDateField(r, 'created_date_time'))
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
                const isDate = /^\d{4}-\d{2}-\d{2}$/.test(e.made || '')
                const isInServiceDate = /^\d{4}-\d{2}-\d{2}$/.test(e.inservice || '')
                const hasRepair = !!(e.repair && e.repair.trim())

                dto.mrid = e.mrid || ''

                // Overview / identification
                const p = dto.properties
                p.name = e.name || ''
                p.serial_no = e.serial || ''
                p.manufacturer = e.manufacturer || ''
                p.model = e.model || ''
                p.manufacturer_year = isDate ? e.made : ''
                p.asset_tag = e.id != null ? 'TE-' + String(e.id).padStart(3, '0') : ''
                // repair import mặc định là Completed -> chỉ UnderRepair khi có bản ghi InProgress
                // (nguồn legacy chỉ có text lý do, không có trạng thái => coi là Completed / Available)
                p.status = 'Available'
                p.country_of_origin = e.manufacturer === 'OMICRON' ? 'Austria'
                    : (e.manufacturer === 'HVI' ? 'USA' : '')
                p.in_use_date = isInServiceDate ? e.inservice : (isDate ? e.made : '')
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
