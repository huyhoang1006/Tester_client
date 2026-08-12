<template>
    <span v-if="!result" class="ar-none">—</span>
    <span v-else :class="['ar', tone]">{{ icon }} {{ result }}</span>
</template>
<script>
/* eslint-disable */
/**
 * Nhãn kết luận của một nhánh tiêu chí trong bảng Assessment settings.
 *
 * KHÔNG hard-code Pass/Fail. Đa số bài test dùng thang hai mức, nhưng
 * "Tan delta measurement with VLF source" theo IEEE 400.2 dùng thang BA mức:
 * Acceptable / Further study advised / Action Required. Trước đây component
 * chỉ so đúng chuỗi 'Pass' và 'Fail' nên ba giá trị kia rơi hết vào nhánh
 * mặc định và hiện ra dấu gạch ngang — bảng tiêu chí thành vô nghĩa vì người
 * dùng không biết thoả điều kiện thì được kết luận gì.
 *
 * Giá trị lạ vẫn hiện nguyên văn với màu trung tính, thay vì biến mất.
 */
const GOOD = ['pass', 'acceptable']
const WARN = ['further study advised']
const BAD  = ['fail', 'action required']

export default {
    name: 'AssessmentResultLabel',
    props: {
        result: {
            type: String,
            default: ''
        }
    },
    computed: {
        key() {
            return String(this.result || '').trim().toLowerCase()
        },
        tone() {
            if (GOOD.includes(this.key)) return 'ar-good'
            if (WARN.includes(this.key)) return 'ar-warn'
            if (BAD.includes(this.key)) return 'ar-bad'
            return 'ar-other'
        },
        icon() {
            if (GOOD.includes(this.key)) return '✔'
            if (WARN.includes(this.key)) return '⚠'
            if (BAD.includes(this.key)) return '✖'
            return '•'
        }
    }
}
</script>
<style scoped>
.ar {
    font-weight: 500;
    /* Cho phép xuống dòng: nhãn dài nhất là "Further study advised" (21 ký tự).
       Cột đã nới lên 168px nên bình thường vẫn nằm một dòng, nhưng nếu sau này
       có nhãn dài hơn thì nó tự xuống dòng chứ không bị cắt cụt. */
    white-space: normal;
    display: inline-block;
    line-height: 1.35;
    text-align: center;
}
.ar-good  { color: #67c23a; }
.ar-warn  { color: #e6a23c; }
.ar-bad   { color: #f56c6c; }
.ar-other { color: #606266; }
.ar-none  { color: #c0c4cc; }
</style>
