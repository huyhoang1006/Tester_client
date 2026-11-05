/* eslint-disable */
// DGA - OLTC: dùng chung giao diện DGA - Main tank, chỉ đổi chế độ hiển thị.
// Tên component = mã bài test → rowTemplate lấy đúng cột của DgaOltc.
import Dga from '../Dga/index.vue'

export default {
    name: 'DgaOltc',
    extends: Dga,
    computed: {
        isOltc() { return true }
    }
}
