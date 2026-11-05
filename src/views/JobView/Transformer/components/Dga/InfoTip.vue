<template>
    <el-tooltip :placement="placement" :open-delay="150" popper-class="dga-info-tip-popper">
        <div slot="content" class="dga-info-tip-content">
            <div v-if="text">{{ text }}</div>
            <ul v-if="notes && notes.length" class="dga-info-tip-notes">
                <li v-for="(note, index) in notes" :key="index">{{ note }}</li>
            </ul>
        </div>
        <i :class="[icon, 'dga-info-tip']" @click.stop></i>
    </el-tooltip>
</template>

<script>
// Icon ⓘ + tooltip dùng chung cho mọi chỗ cần giải thích trong giao diện DGA
export default {
    name: 'DgaInfoTip',
    props: {
        text: { type: String, default: '' },
        notes: { type: Array, default: () => [] },
        placement: { type: String, default: 'top' },
        icon: { type: String, default: 'fa-regular fa-circle-question' }
    }
}
</script>

<style scoped>
.dga-info-tip {
    margin-left: 4px;
    color: #909399;
    font-size: 11px;
    cursor: help;
    vertical-align: 1px;
}

.dga-info-tip:hover {
    color: #409eff;
}

.dga-info-tip-content {
    max-width: 420px;
    white-space: pre-line;
    line-height: 1.5;
}

.dga-info-tip-notes {
    margin: 6px 0 0;
    padding-left: 16px;
}
</style>
