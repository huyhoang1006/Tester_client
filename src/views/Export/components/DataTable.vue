<template>
  <div style="border:1px solid #EBEEF5;border-radius:4px;overflow:hidden;margin-top:10px;">
    <table cellpadding="8" width="100%" style="border-collapse:collapse;table-layout:fixed;">
      <thead><tr>
        <th style="width:130px;">Code</th>
        <th style="width:140px;">Category</th>
        <th>Feature</th>
        <th style="width:190px;">Coordinates</th>
        <th style="width:50px;"><el-button @click="$emit('add-row')" size="mini" type="primary"><i class="fa-solid fa-plus"></i></el-button></th>
        <th style="width:50px;"><el-button @click="$emit('clear-all')" size="mini" type="danger"><i class="fa-solid fa-trash"></i></el-button></th>
      </tr></thead>
      <tbody>
        <tr v-for="(row, index) in tableData" :key="index"
          :style="{ background: index % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #EBEEF5' }">
          <td><el-input v-model="row.code" placeholder="e.g. A1" size="mini" /></td>
          <td>
            <el-select v-model="row.category" size="mini" style="width:100%" @change="$emit('category-change', row)">
              <el-option v-for="c in categoryOptions" :key="c.value" :label="c.label" :value="c.value" />
            </el-select>
          </td>
          <td>
            <div v-for="(level, li) in row.featureLevels" :key="index + '-' + li" style="margin-bottom:4px;">
              <el-select v-model="level.key" size="mini" style="width:100%" placeholder="Select feature"
                @change="$emit('feature-change', {row, levelIndex: li})">
                <el-option v-for="opt in getOptions(row, li)" :key="opt.key" :label="opt.label" :value="opt.key" />
              </el-select>
            </div>
          </td>
          <td>
            <template v-if="row.coordinates && row.coordinates.length">
              <el-tag v-for="coord in row.coordinates" :key="coord" size="mini" type="info" style="margin:2px;font-size:11px;">{{ coord }}</el-tag>
            </template>
            <span v-else style="color:#C0C4CC;font-size:11px;">not found</span>
          </td>
          <td><el-button @click="$emit('add-row', index)" type="primary" size="mini" style="width:100%"><i class="fa-solid fa-plus"></i></el-button></td>
          <td><el-button @click="$emit('remove-row', index)" type="danger" size="mini" style="width:100%"><i class="fa-solid fa-trash"></i></el-button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'DataTable',
  props: {
    tableData: { type: Array, required: true },
    categoryOptions: { type: Array, required: true },
    getOptions: { type: Function, required: true }
  }
}
</script>

<style scoped>
th {
  background: #f5f7fa;
  font-weight: 600;
  border-bottom: 2px solid #EBEEF5;
  padding: 8px;
  white-space: nowrap;
}
td, th { vertical-align: middle; }
td { border-bottom: 1px solid #EBEEF5; }
tr:last-child td { border-bottom: none; }
</style>