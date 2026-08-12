<template>
  <el-dialog
    title="Merge job changes"
    :visible.sync="visible"
    width="900px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    custom-class="job-conflict-dialog"
  >
    <!--
      Phần tóm tắt đứng TRƯỚC danh sách xung đột, cố ý.

      Thực tế hai người hiếm khi chạm cùng một ô, nên đa số lần mở hộp thoại này là
      "38 thay đổi đã gộp xong, 1 chỗ cần quyết". Mở ra mà chỉ thấy danh sách xung
      đột thì người dùng tưởng 38 thay đổi kia biến mất và bắt đầu đi tìm.
    -->
    <div class="summary">
      <i class="el-icon-warning-outline"></i>
      <span>
        Someone else edited this job while you had it open.
        <b>{{ conflicts.length }}</b>
        {{ conflicts.length === 1 ? 'change needs' : 'changes need' }} your decision —
        everything else was merged automatically.
      </span>
    </div>

    <div class="bulk">
      <span class="bulk-label">Apply to all:</span>
      <el-button size="mini" @click="chooseAll('client')">Keep mine</el-button>
      <el-button size="mini" @click="chooseAll('server')">Take theirs</el-button>
    </div>

    <div class="groups">
      <div v-for="(group, gi) in groups" :key="gi" class="group">
        <div class="group-title">{{ group.title }}</div>

        <!--
          `name` PHẢI có, và phải khác nhau giữa các dòng.

          Trình duyệt gom radio thành nhóm THEO `name`. Thiếu nó thì mỗi ô là một
          nhóm riêng, và bấm ô thứ hai không hề bỏ chọn ô thứ nhất — nhìn ra hai lựa
          chọn cùng sáng, người dùng không biết mình đang chọn cái nào.
        -->
        <div v-for="(item, ii) in group.items" :key="item.key" class="row">
          <div class="field">{{ item.field }}</div>

          <div class="options">
            <label
              class="option"
              :class="{ picked: item.choice === 'client', removed: item.clientRemoved }"
            >
              <input type="radio" value="client" :name="'conflict-' + gi + '-' + ii"
                     v-model="item.choice" />
              <span class="tag">Mine</span>
              <span class="val">{{ show(item.client) }}</span>
            </label>

            <label
              class="option"
              :class="{ picked: item.choice === 'server', removed: item.serverRemoved }"
            >
              <input type="radio" value="server" :name="'conflict-' + gi + '-' + ii"
                     v-model="item.choice" />
              <span class="tag">Theirs</span>
              <span class="val">{{ show(item.server) }}</span>
            </label>
          </div>

          <div class="base" title="Value at last sync">
            was {{ show(item.base) }}
          </div>
        </div>
      </div>
    </div>

    <span slot="footer">
      <!--
        Cancel = huỷ cả lượt tải, KHÔNG phải "giữ nguyên bản của tôi". Nói rõ ở nhãn,
        vì hiểu nhầm chỗ này làm mất dữ liệu: người dùng bấm Cancel tưởng là giữ bản
        mình, rồi lưu lên và ăn 409 lần nữa mà không hiểu vì sao.
      -->
      <el-button @click="onCancel">Cancel download</el-button>
      <el-button type="primary" @click="onConfirm">Apply merge</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { describeValue } from '@/utils/jobConflict'

export default {
    name: 'JobConflictDialog',
    props: {
        conflicts: { type: Array, required: true },
        jobName: { type: String, default: '' },
    },
    data() {
        return { visible: true }
    },
    computed: {
        /**
         * Gom xung đột theo đường dẫn cha.
         *
         * Một job có thể có hàng trăm ô; danh sách phẳng thì không đọc được ô nào
         * thuộc bài test nào. Nhóm theo breadcrumb cho ra đúng cấu trúc người dùng
         * đang nhìn trên màn hình: bài test → bảng → dòng.
         */
        groups() {
            const map = new Map()
            for (const item of this.conflicts) {
                const title = item.breadcrumb.length ? item.breadcrumb.join(' › ') : 'Job'
                if (!map.has(title)) map.set(title, { title, items: [] })
                map.get(title).items.push(item)
            }
            return Array.from(map.values())
        },
    },
    methods: {
        show(v) {
            return describeValue(v)
        },
        chooseAll(choice) {
            this.conflicts.forEach(c => { c.choice = choice })
        },
        onConfirm() {
            this.visible = false
            this.$emit('resolve', this.conflicts)
        },
        onCancel() {
            this.visible = false
            this.$emit('cancel')
        },
    },
}
</script>

<style scoped>
.summary {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    margin-bottom: 12px;
    background: #fdf6ec;
    border: 1px solid #f5dab1;
    border-radius: 4px;
    color: #7d5b23;
    line-height: 1.5;
}
.summary i { margin-top: 3px; font-size: 16px; }

.bulk { margin-bottom: 10px; }
.bulk-label { margin-right: 8px; color: #606266; font-size: 13px; }

.groups { max-height: 52vh; overflow-y: auto; }

.group { margin-bottom: 14px; }
.group-title {
    font-weight: 600;
    font-size: 13px;
    color: #303133;
    padding: 6px 8px;
    background: #f5f7fa;
    border-radius: 3px;
}

.row {
    display: grid;
    grid-template-columns: 180px 1fr 150px;
    align-items: center;
    gap: 10px;
    padding: 8px;
    border-bottom: 1px solid #ebeef5;
}
.field { font-size: 13px; color: #303133; word-break: break-word; }

.options { display: flex; gap: 8px; }
.option {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    padding: 6px 8px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    min-width: 0;
    /* Bấm vào nhãn để chọn thì trình duyệt bôi đen chữ bên trong — trông như lỗi
       hiển thị. Cả ô này là nút bấm, không phải chỗ để copy chữ. */
    user-select: none;
}
.option.picked { border-color: #409eff; background: #ecf5ff; }
.option.removed .val { color: #c0392b; font-style: italic; }
.tag { font-size: 11px; color: #909399; flex: none; }
.val { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.base { font-size: 12px; color: #909399; text-align: right; }
</style>
