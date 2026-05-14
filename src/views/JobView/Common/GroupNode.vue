<template>
  <div v-if="node" class="group-node">

    <!-- LIMIT -->
    <template v-if="mode === 'limit'">

      <!-- conditions -->
      <div v-for="(c, i) in node.conditions || []" :key="i">
        <div class="line-sep" v-if="i > 0" :class="{ 'is-or': (node.logic || 'AND').toUpperCase() === 'OR' }">
          <span class="line-logic">{{ node.logic || 'AND' }}</span>
        </div>

        <!-- ← thêm class condition-row -->
        <div class="condition-row">
          <span class="condition-label" v-html="c.label"></span>
          <span class="condition-operator">{{ c.operator }}</span>
          <el-input v-model="c.threshold" size="mini" style="width: 80px" />
        </div>
      </div>

      <!-- children -->
      <div v-for="(child, ci) in node.children || []" :key="'c' + ci">
        <div class="line-sep" :class="{ 'is-or': (node.logic || 'AND').toUpperCase() === 'OR' }"
          v-if="ci > 0 || (node.conditions && node.conditions.length > 0)">
          <span class="line-logic">{{ node.logic || 'AND' }}</span>
        </div>
        <GroupNode :node="child" mode="limit" />
      </div>

    </template>

    <!-- RESULT -->
    <template v-else>
      <div v-if="node.result">
        <span v-if="node.result === 'Pass'" class="pass">✔ Pass</span>
        <span v-else class="fail">✖ Fail</span>
      </div>
      <div v-for="(child, i) in node.children || []" :key="'r' + i">
        <GroupNode :node="child" mode="result" />
      </div>
    </template>

  </div>
</template>
<script>
export default {
  name: 'GroupNode',

  props: {
    node: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      default: 'limit'
    }
  }
}
</script>

<style scoped>
.group-node {
  margin-left: 12px;
  line-height: 28px;
}

/* ===== line separator ===== */
.line-sep {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 2px 0;
}

.line-sep::before,
.line-sep::after {
  content: '';
  flex: 1;
  height: 0.5px;
  background: #dcdfe6;
}

.line-logic {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  white-space: nowrap;
  color: #185FA5;
  /* AND → xanh */
}

/* OR thì đổi màu cam */
.line-sep.is-or .line-logic {
  color: #993C1D;
}

/* ===== condition ===== */
.condition-label {
  font-size: 13px;
  margin-right: 4px;
}

.condition-operator {
  font-size: 13px;
  margin-right: 4px;
  color: #606266;
}

/* ===== pass / fail ===== */
.pass {
  color: #67c23a;
  font-weight: 500;
}

.fail {
  color: #f56c6c;
  font-weight: 500;
}

.condition-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;   /* ← không cho xuống dòng */
  padding: 2px 0;
}

.condition-label {
  font-size: 13px;
  white-space: nowrap;  /* ← label không bị wrap */
}

.condition-operator {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}
</style>