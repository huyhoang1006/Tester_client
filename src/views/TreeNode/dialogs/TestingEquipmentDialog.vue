<template>
    <div>
        <!-- Step 1: equipment list -->
        <el-dialog
            title="Testing Equipment"
            :visible="visible"
            @update:visible="$emit('update:visible', $event)"
            :modal="modal"
            :show-close="showClose"
            :transition="transition"
            :custom-class="customClass"
        >
            <TestingEquipmentList ref="list" @open="openDetail" @create="openCreate" />
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" @click="handleCancel">Close</el-button>
            </span>
        </el-dialog>

        <!-- Step 2: detail of the selected equipment (stacked popup) -->
        <el-dialog
            :title="detailTitle"
            :visible.sync="detailVisible"
            append-to-body
            :custom-class="customClass"
        >
            <TestingEquipment
                v-if="detailVisible"
                ref="testingEquipment"
                :equipment="selectedExcel"
                :equipmentMrid="detailMrid"
                @saved="handleSaved" />
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" size="small" @click="detailVisible = false">Back</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import TestingEquipment from '@/views/TestingEquipment/index.vue'
import TestingEquipmentList from '@/views/TestingEquipment/components/list.vue'

export default {
    name: 'TestingEquipmentDialog',
    components: {
        TestingEquipment,
        TestingEquipmentList
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        // mrid of the equipment to load (null = create new)
        equipmentMrid: {
            type: String,
            default: null
        },
        modal: {
            type: Boolean,
            default: true
        },
        showClose: {
            type: Boolean,
            default: true
        },
        transition: {
            type: String,
            default: 'dialog-fade'
        },
        customClass: {
            type: String,
            default: 'app-dialog custom-dialog'
        }
    },
    data() {
        return {
            detailVisible: false,
            selected: null
        }
    },
    computed: {
        detailTitle() {
            if (!this.selected) return 'New testing equipment'
            const s = this.selected
            return [s.name, s.model, s.serial].filter(Boolean).join(' · ') || 'Equipment details'
        },
        // Nếu item có mrid (từ DB) -> load chi tiết theo mrid; nếu không -> coi như bản ghi Excel
        detailMrid() {
            return (this.selected && this.selected.mrid) ? this.selected.mrid : null
        },
        selectedExcel() {
            return (this.selected && !this.selected.mrid) ? this.selected : null
        }
    },
    methods: {
        // Bấm 1 dòng -> xem/sửa (load theo mrid nếu có)
        openDetail(equipment) {
            this.selected = equipment
            this.detailVisible = true
        },
        // Nút + New -> mở form trống để tạo mới
        openCreate() {
            this.selected = null
            this.detailVisible = true
        },
        handleCancel() {
            this.$emit('cancel')
        },
        handleSaved(payload) {
            // Chỉ refresh danh sách nền, GIỮ NGUYÊN dialog chi tiết đang mở để tiếp tục sửa
            if (this.$refs.list && this.$refs.list.reload) this.$refs.list.reload()
            this.$emit('saved', payload)
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep(.app-dialog) {
    box-sizing: border-box;
}

::v-deep(.app-dialog.el-dialog) {
    width: 80%;
    margin-top: 5vh !important;
    border-radius: 6px;
    max-height: 90vh;
    height: auto !important;
    display: flex;
    flex-direction: column;
}

::v-deep(.app-dialog .el-dialog__body) {
    flex: 1;
    overflow-y: auto;
    padding: 12px 20px;
}

.custom-footer {
    display: flex;
    justify-content: flex-end;
}
</style>
