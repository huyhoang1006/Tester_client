<template>
  <div id="configs">
    <!-- Phase -->
    <div>
      <el-row :gutter="20" class="content mgt-20">
        <el-col :xs="24" :md="12" class="col-content">
          <el-form :label-width="'120px'" size="mini" label-position="left">
            <span class="bolder">Phase</span>
            <el-divider></el-divider>
            <el-form-item :label-width="'0px'" class="inline-radios">
              <el-row>
                <el-col :span="12">
                  <el-radio-group v-model="internalConfigsData.phase" @change="handlePhaseChange">
                    <el-radio label="1">1</el-radio>
                    <el-radio label="3">3</el-radio>
                  </el-radio-group>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item v-if="internalConfigsData.phase === '1'" label="Phase name">
              <el-input v-model="internalConfigsData.phase_name" size="mini" style="width: 100%"
                @blur="handlePhaseNameChange" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </div>

    <!-- Ratings -->
    <el-row :gutter="20" class="content mgt-20">
      <el-col :xs="24" :md="12" class="col-content">
        <el-form :label-width="labelWidth" size="mini" label-position="left">
          <span class="bolder">Ratings</span>
          <el-divider></el-divider>

          <el-form-item label="Rated voltage">
            <el-input v-model="ratingsData.rated_voltage.value"
              @input="updateField('ratings', 'rated_voltage', $event.target ? $event.target.value : $event)">
              <template slot="append">kV</template>
            </el-input>
          </el-form-item>

          <el-form-item label="Rated frequency">
            <el-input v-model="ratingsData.rated_frequency.value"
              @input="updateField('ratings', 'rated_frequency', $event.target ? $event.target.value : $event)">
              <template slot="append">Hz</template>
            </el-input>
          </el-form-item>

          <el-form-item label="Rated current">
            <el-input v-model="ratingsData.rated_current.value"
              @input="updateField('ratings', 'rated_current', $event.target ? $event.target.value : $event)">
              <template slot="append">A</template>
            </el-input>
          </el-form-item>

          <el-form-item label="Rated power">
            <el-input v-model="ratingsData.rated_power.value"
              @input="updateField('ratings', 'rated_power', $event.target ? $event.target.value : $event)">
              <template slot="append">kVAr</template>
            </el-input>
          </el-form-item>

          <!-- Phase 1 -->
          <template v-if="configsData.phase === '1'">
            <el-form-item label="Capacitance">
              <el-input v-model="capacitanceData.capacitance.value.value"
                @input="updateField('capacitance', 'capacitance', $event.target ? $event.target.value : $event)">
                <template slot="append">nF</template>
              </el-input>
            </el-form-item>

            <el-form-item label="Dissipation factor">
              <el-input v-model="dissipationFactorData.dissipation_factor.value.value"
                @input="updateField('dissipationFactor', 'dissipation_factor', $event.target ? $event.target.value : $event)">
                <template slot="append">%</template>
              </el-input>
            </el-form-item>
          </template>

          <!-- Phase 3 -->
          <template v-else>
            <el-form-item label="Capacitance">
              <div class="bordered-form vertical-label">
                <div v-for="ph in ['A', 'B', 'C']" :key="ph" class="phase-row">
                  <div class="phase-label">Phase {{ ph }}</div>
                  <el-input v-model="capacitanceData[`capacitance_${ph}`].value.value"
                    @input="updateField('capacitance', `capacitance_${ph}`, $event.target ? $event.target.value : $event)"
                    size="mini">
                    <template slot="append">nF</template>
                  </el-input>
                </div>
              </div>
            </el-form-item>

            <el-form-item label="Dissipation factor">
              <div class="bordered-form vertical-label">
                <div v-for="ph in ['A', 'B', 'C']" :key="ph" class="phase-row">
                  <div class="phase-label">Phase {{ ph }}</div>
                  <el-input v-model="dissipationFactorData[`dissipation_factor_${ph}`].value.value"
                    @input="updateField('dissipationFactor', `dissipation_factor_${ph}`, $event.target ? $event.target.value : $event)"
                    size="mini">
                    <template slot="append">%</template>
                  </el-input>
                </div>
              </div>
            </el-form-item>
          </template>
        </el-form>
      </el-col>

      <!-- Others -->
      <el-col :xs="24" :md="12" class="col-content">
        <el-form :label-width="labelWidth" size="mini" label-position="left">
          <span class="bolder">Others</span>
          <el-divider></el-divider>

          <el-form-item label="Insulation type">
            <el-input v-model="othersData.insulation_type"
              @input="updateField('others', 'insulation_type', $event.target ? $event.target.value : $event)" />
          </el-form-item>

          <el-form-item label="Weight">
            <el-input v-model="othersData.weight.value"
              @input="updateField('others', 'weight', $event.target ? $event.target.value : $event)">
              <template slot="append">kg</template>
            </el-input>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "configs",
  props: ["configs", "ratings", "others", "capacitance", "dissipationFactor"],
  data() {
    return {
      labelWidth: "150px",
      internalConfigsData: JSON.parse(JSON.stringify(this.configs)),
      internalCapacitanceData: JSON.parse(JSON.stringify(this.capacitance)),
      internalDissipationFactorData: JSON.parse(JSON.stringify(this.dissipationFactor))
    };
  },
  computed: {
    configsData() {
      return this.internalConfigsData;
    },
    ratingsData() {
      return this.ratings;
    },
    othersData() {
      return this.others;
    },
    capacitanceData() {
      return this.internalCapacitanceData;
    },
    dissipationFactorData() {
      return this.internalDissipationFactorData;
    },
  },
  watch: {
    configs: {
      handler(newVal) {
        console.log('Configs props changed:', JSON.stringify(newVal, null, 2));
        console.log('Current internalConfigsData.phase_name:', this.internalConfigsData.phase_name);

        // Update phase nếu thay đổi
        if (newVal.phase && newVal.phase !== this.internalConfigsData.phase) {
          console.log('Phase changed from', this.internalConfigsData.phase, 'to', newVal.phase);
          this.internalConfigsData.phase = newVal.phase;
          // Chỉ clear phase_name khi chuyển sang phase 3
          if (newVal.phase === '3') {
            this.internalConfigsData.phase_name = "";
          }
        }

        // Update phase_name khi có giá trị mới từ props (load from DB hoặc restore)
        if (newVal.phase_name !== undefined && newVal.phase === '1') {
          if (this.internalConfigsData.phase_name !== newVal.phase_name) {
            console.log('Updating phase_name from', this.internalConfigsData.phase_name, 'to', newVal.phase_name);
            this.internalConfigsData.phase_name = newVal.phase_name;
          }
        }

        console.log('After update, internalConfigsData.phase_name:', this.internalConfigsData.phase_name);
      },
      deep: true,
      immediate: true
    },
    capacitance: {
      handler(newVal) {
        if (JSON.stringify(this.internalCapacitanceData) !== JSON.stringify(newVal)) {
          this.internalCapacitanceData = JSON.parse(JSON.stringify(newVal));
        }
      },
      deep: true,
      immediate: true
    },
    dissipationFactor: {
      handler(newVal) {
        if (JSON.stringify(this.internalDissipationFactorData) !== JSON.stringify(newVal)) {
          this.internalDissipationFactorData = JSON.parse(JSON.stringify(newVal));
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handlePhaseChange(value) {
      console.log('handlePhaseChange: switching to phase', value);
      console.log('Current internalConfigsData.phase_name:', this.internalConfigsData.phase_name);

      // KHÔNG clear phase_name khi chuyển phase - để parent logic xử lý
      // Chỉ update phase
      this.internalConfigsData.phase = value;

      // Emit để trigger update ở parent
      this.$emit("update-configs", this.internalConfigsData);
    },
    handlePhaseNameChange() {
      // Emit phase_name khi blur
      console.log('handlePhaseNameChange called, phase_name:', this.internalConfigsData.phase_name);
      console.log('Emitting configs:', JSON.stringify(this.internalConfigsData, null, 2));
      console.log('Calling $emit update-configs');
      this.$emit("update-configs", this.internalConfigsData);
      console.log('$emit update-configs completed');
    },
    updateField(type, field, value) {
      let target;
      switch (type) {
        case "ratings": target = this.ratingsData; break;
        case "capacitance": target = this.internalCapacitanceData; break;
        case "dissipationFactor": target = this.internalDissipationFactorData; break;
        case "others": target = this.othersData; break;
      }

      if (field === "insulation_type") {
        target[field] = value;
      } else if (type === "capacitance" || type === "dissipationFactor") {
        if (!target[field]) {
          target[field] = { mrid: "", value: { value: "" }, phase: field.split("_").pop() };
        }
        target[field].value.value = value;
      } else {
        if (!target[field]) {
          target[field] = { mrid: "", value: "" };
        }
        target[field].value = value;
      }

      const eventName = type === 'dissipationFactor' ? 'dissipation-factor' : type;
      this.$emit(`update-${eventName}`, target);
    },
  },
};
</script>

<style scoped>
.bolder {
  font-size: 12px;
  font-weight: bold;
}

.bordered-form.vertical-label {
  border: 1px solid #2e2f31;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.phase-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.phase-label {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
}

.phase-row .el-input {
  width: 100%;
}

::v-deep(.inline-radios .el-radio-group) {
  display: flex;
  width: 100%;
  align-items: center;
  min-height: 28px;
}

::v-deep(.inline-radios .el-radio__label) {
  font-size: 12px;
}

::v-deep(.inline-radios .el-radio__content) {
  display: flex;
  align-items: center;
  line-height: normal;
}

::v-deep(.inline-radios .el-radio) {
  flex: 1;
  margin-right: 0;
  display: inline-flex;
  align-items: center;
}

@media (max-width: 991px) {
  .col-content {
    margin-bottom: 10px;
  }
}

@media (max-width: 767px) {
  .phase-row {
    grid-template-columns: 1fr;
    row-gap: 4px;
  }

  .phase-label {
    text-align: left;
  }
}
</style>
