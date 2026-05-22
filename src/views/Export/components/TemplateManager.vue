<template>
  <div class="export-view">
    <el-select :value="value" placeholder="Select template" size="mini"
      style="min-width:200px;" clearable @change="$emit('change', $event)" @input="$emit('input', $event)">
      <el-option v-for="t in templateList" :key="t.name" :label="t.name" :value="t.name" />
    </el-select>
    <el-button type="primary" size="mini" @click="$emit('add-template')"><i class="fa-solid fa-plus"></i> Add Template</el-button>
    <slot name="actions"></slot>
    <el-button size="mini" @click="$emit('refresh')"><i class="fa-solid fa-rotate"></i></el-button>
  </div>
</template>

<script>
export default {
  name: 'TemplateManager',
  props: {
    templateList: { type: Array, required: true },
    value: { type: String, default: '' }
  }
}
</script>

<style scoped>
.export-view { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
</style>