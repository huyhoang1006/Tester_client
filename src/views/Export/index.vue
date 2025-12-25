<template> 
<div>
  <div class="export-view" style="gap: 10px;">
    <el-select placeholder="Select" size="mini"></el-select>
    <el-button @click="addRow(index)" type="primary" size="mini" style="margin-left: 10px;margin-right: 10px;">Add Row</el-button>
    <el-button @click="removeRow(index)" v-if="this.exportType === 'xml'" type="primary" size="mini" style="margin-left: 10px;margin-right: 10px;">XML File</el-button>
    <el-button v-if="this.exportType === 'excel'" type="primary" size="mini" style="margin-left: 10px;margin-right: 10px;">Excel File</el-button>
    <el-button v-if="this.exportType === 'pdf'" type="primary" size="mini" style="margin-left: 10px;margin-right: 10px;">PDF File</el-button>
    <el-button v-if="this.exportType === 'word'" type="primary" size="mini" style="margin-left: 10px;margin-right: 10px;">Word File</el-button>
    <el-button type="danger" size="mini" style="margin-left: 10px;margin-right: 20px;">Delete</el-button>
    <el-button type="primary" size="mini" style="margin-left: 10px;margin-right: 20px;">Import</el-button>
    <el-button type="primary" size="mini" style="margin-left: 10px;margin-right: 20px;">Export</el-button>
    <el-button type="primary" size="mini" style="margin-left: 10px;margin-right: 20px;">Refresh</el-button>
  </div>
  <div>
    <table border="1" cellpadding="8" width="100%" style="border-collapse: collapse; margin-top: 10px;">
    <thead>
      <tr>
        <th>Code</th>
        <th>Category</th>
        <th>Feature</th>
        <th></th>
        <th></th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(row, index) in tableData" :key="index">
        <td><el-input v-model="row.code" placeholder="Input" size="mini"></el-input></td>
        <td>
          <el-select v-model="row.category" size="mini" placeholder="Select" style="width: 100%;">
              <el-option 
                v-for="item in selectAOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
          </el-select>
        </td>
        <td>
          <el-select v-model="row.feature" size="mini" placeholder="Select" style="width: 100%;">
            <el-option v-for="item in getBOptions(row.category)"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </td>
        <td>
          <el-button  @click="addRow(index)" type="primary" size="mini" style="width: 100%">
            <i class="fa-solid fa-plus"></i>
          </el-button>
        </td>
        <td>
          <el-button @click="removeRow(index)" type="danger" size="mini" style="width: 100%">
            <i class="fa-solid fa-trash"></i>
          </el-button>
        </td>
      </tr>
    </tbody>
    </table>
  </div>
</div>
</template> 
<script>
export default {
    name: 'ExportView',
    props: {
        exportType: {
            type: String,
            required: true
        }
    },
    data() {
        return {
          selectAOptions: [
            { label: "Organisation", value: "organisation" },
            { label: "Subtation", value: "subtation" },
            { label: "Voltage level", value: "voltage_level" },
            { label: "Bay", value: "bay" },
            { label: "Asset", value: "asset" },
            { label: "Job", value: "job" },
            { label: "Test", value: "test" }
          ],
          selectBOptions: {
            organisation: [
              { label: "Name", value: "name" },
              { label: "Street", value: "street" },
              { label: "Ward/ Commune", value: "ward_or_commune" },
              { label: "District", value: "district_or_town" },
              { label: "City", value: "city" },
              { label: "State/ Province", value: "state_or_province" },
              { label: "Country", value: "country" },
              { label: "Tax code", value: "tax_code" },
              { label: "Geo position x", value: "positionPoints" },
              { label: "Geo position y", value: "positionPoints" },
              { label: "Geo position z", value: "positionPoints" },
              { label: "Phone number", value: "phoneNumber" },
              { label: "Email", value: "email"},
              { label: "Fax", value: "fax" },
              { label: "Comment", value: "comment" }
            ],
            subtation: [
              { label: "Name", value: "name" },
              { label: "Type", value: "type" },
              { label: "Substation", value: "substation" },
              { label: "Generation", value: "generation" },
              { label: "Industry", value: "industry" },
              { label: "Location name", value: "locationName" },
              { label: "Street", value: "street" },
              { label: "Ward/ Commune", value: "ward_or_commune" },
              { label: "District/ Town", value: "district_or_town" },
              { label: "City", value: "city" },
              { label: "State/ Province", value: "state_or_province" },
              { label: "Country", value: "country" },
              { label: "Name", value: "personName" },
              { label: "Department", value: "department" },
              { label: "Position", value: "position" },
              { label: "Phone number", value: "phoneNumber" },
              { label: "Email", value: "email" },
              { label: "Fax", value: "fax" },
              { label: "Comment", value: "comment" },
              { label: "Geo position x", value: "positionPoints" },
              { label: "Geo position y", value: "positionPoints" },
              { label: "Geo position z", value: "positionPoints" },
              { label: "Comment", value: "comment" }
            ],
            voltage_level: [
              { label: "Name", value: "name" },
              { label: "High voltage limit", value: "high_voltage_limit_value" },
              { label: "Low voltage limit", value: "low_voltage_limit_value" },
              { label: "Base voltage", value: "base_voltage_value" },
              { label: "Comment", value: "comment" }
            ],
            bay: [
              { label: "Name", value: "name" },
              { label: "Breaker configuration", value: "breaker_configuration" },
              { label: "Bus Bar configuration", value: "bus_bar_configuration" },
              { label: "Comment", value: "comment" }
            ],
            asset: [
              { label: "Name", value: "name" },
              { label: "Code", value: "code" },
              { label: "Serial number", value: "serial_number" },
              { label: "Manufacturer", value: "manufacturer" },
              { label: "Model", value: "model" },
              { label: "Asset type", value: "asset_type" },
              { label: "Comment", value: "comment" }
            ],
            job: [
              { label: "Job ID", value: "job_id" },
              { label: "Job type", value: "job_type" },
              { label: "Scheduled date", value: "scheduled_date" },
              { label: "Status", value: "status" },
              { label: "Comment", value: "comment" }
            ],
            test: [
              { label: "Test ID", value: "test_id" },
              { label: "Test type", value: "test_type" },
              { label: "Date", value: "date" },
              { label: "Result", value: "result" },
              { label: "Comment", value: "comment" }
            ]

          },
          tableData: [
            { code: "", category: "", feature: "" }
          ]
        }
    },

    methods: {
        addRow(index) {
            const newRow = {
              code: "",
              category: "",
              feature: ""
            }
            this.tableData.splice(index + 1, 0, newRow);
        },
        removeRow(index) {
            this.tableData.splice(index, 1);
        },
        getBOptions(aValue) {
          return this.selectBOptions[aValue] || [];
        }
      }
  };
</script>
<style scoped>
</style>