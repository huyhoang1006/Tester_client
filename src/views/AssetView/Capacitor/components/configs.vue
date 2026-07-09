<template>
  <div id="configs">
    <!-- Configuration -->
    <div class="mgt-10">
      <el-row>
        <el-col :span="24">
          <div class="header-toggle pointer" @click="openConfiguration = !openConfiguration">
            <i v-if="openConfiguration" class="fa-solid fa-caret-up"></i>
            <i v-else class="fa-solid fa-caret-down"></i>
            Configuration
          </div>
        </el-col>
      </el-row>
      <div class="content-toggle" v-if="openConfiguration">
        <el-row :gutter="20" class="content">
          <el-col :xs="24" :md="16" :lg="12" class="col-content">
            <el-form :label-width="'120px'" size="mini" label-position="left">
              <el-form-item label="Number of phase" class="inline-radios">
                  <el-radio-group v-model="internalConfigsData.number_of_phase" @change="handlePhaseChange">
                    <el-radio label="1">1</el-radio>
                    <el-radio label="3">3</el-radio>
                  </el-radio-group>
              </el-form-item>
              <el-form-item v-if="internalConfigsData.number_of_phase === '1'" label="Phase">
                <el-select class="phase-select" v-model="internalConfigsData.phase" size="mini"
                  @change="handlePhaseNameChange" placeholder="Select phase">
                  <el-option label="A" value="A"></el-option>
                  <el-option label="B" value="B"></el-option>
                  <el-option label="C" value="C"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- Ratings + Others: 2 card ngắn cạnh nhau trên màn rộng -->
    <el-row :gutter="16" class="short-cards">
      <el-col :xs="24" :md="12" class="short-card-col">
        <div class="short-card-wrap">
          <el-row>
            <el-col :span="24">
              <div class="header-toggle pointer" @click="openRatings = !openRatings">
                <i v-if="openRatings" class="fa-solid fa-caret-up"></i>
                <i v-else class="fa-solid fa-caret-down"></i>
                Ratings
              </div>
            </el-col>
          </el-row>
          <div class="content-toggle" v-if="openRatings">
        <el-form :label-width="labelWidth" size="mini" label-position="left">
          <el-form-item label="Rated voltage">
            <el-input type="number" number="positive" v-model="ratingsData.rated_voltage.value"
              @input="updateField('ratings', 'rated_voltage', $event.target ? $event.target.value : $event)">
              <template slot="append">kV</template>
            </el-input>
          </el-form-item>

          <el-form-item label="Rated frequency">
            <el-input type="number" number="positive" v-model="ratingsData.rated_frequency.value"
              @input="updateField('ratings', 'rated_frequency', $event.target ? $event.target.value : $event)">
              <template slot="append">Hz</template>
            </el-input>
          </el-form-item>

          <el-form-item label="Rated current">
            <el-input type="number" number="positive" v-model="ratingsData.rated_current.value"
              @input="updateField('ratings', 'rated_current', $event.target ? $event.target.value : $event)">
              <template slot="append">A</template>
            </el-input>
          </el-form-item>

          <el-form-item label="Rated power">
            <el-input type="number" number="positive" v-model="ratingsData.rated_power.value"
              @input="updateField('ratings', 'rated_power', $event.target ? $event.target.value : $event)">
              <template slot="append">kVAr</template>
            </el-input>
          </el-form-item>

          <!-- Phase 1 -->
          <template v-if="configsData.number_of_phase === '1' || configsData.number_of_phase === '' || configsData.number_of_phase === null">
            <el-form-item label="Capacitance">
              <el-input type="number" number="positive" v-model="capacitanceData.capacitance.value.value"
                @input="updateField('capacitance', 'capacitance', $event.target ? $event.target.value : $event)">
                <template slot="append">nF</template>
              </el-input>
            </el-form-item>

            <el-form-item label="Dissipation factor">
              <el-input type="number" number="positive" v-model="dissipationFactorData.dissipation_factor.value.value"
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
                  <el-input type="number" number="positive" v-model="capacitanceData[`capacitance_${ph}`].value.value"
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
                  <el-input type="number" number="positive" v-model="dissipationFactorData[`dissipation_factor_${ph}`].value.value"
                    @input="updateField('dissipationFactor', `dissipation_factor_${ph}`, $event.target ? $event.target.value : $event)"
                    size="mini">
                    <template slot="append">%</template>
                  </el-input>
                </div>
              </div>
            </el-form-item>
          </template>
        </el-form>
          </div>
        </div>
      </el-col>

      <!-- Others -->
      <el-col :xs="24" :md="12" class="short-card-col">
        <div class="short-card-wrap">
          <el-row>
            <el-col :span="24">
              <div class="header-toggle pointer" @click="openOthers = !openOthers">
                <i v-if="openOthers" class="fa-solid fa-caret-up"></i>
                <i v-else class="fa-solid fa-caret-down"></i>
                Others
              </div>
            </el-col>
          </el-row>
          <div class="content-toggle" v-if="openOthers">
        <el-form :label-width="labelWidth" size="mini" label-position="left">
          <el-form-item label="Insulation type">
            <el-input v-model="othersData.insulation_type"
              @input="updateField('others', 'insulation_type', $event.target ? $event.target.value : $event)" />
          </el-form-item>

          <el-form-item label="Weight">
            <el-input type="number" number="positive" v-model="othersData.weight.value"
              @input="updateField('others', 'weight', $event.target ? $event.target.value : $event)">
              <template slot="append">kg</template>
            </el-input>
          </el-form-item>
        </el-form>
          </div>
        </div>
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
      openConfiguration: true,
      openRatings: true,
      openOthers: true,
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
        // Update phase nếu thay đổi
        if (newVal.number_of_phase && newVal.number_of_phase !== this.internalConfigsData.number_of_phase) {
          this.internalConfigsData.number_of_phase = newVal.number_of_phase;
          // Chỉ clear phase_name khi chuyển sang phase 3
          if (newVal.number_of_phase === '3') {
            this.internalConfigsData.phase = "";
          }
        }

        // Update phase_name khi có giá trị mới từ props (load from DB hoặc restore)
        if (newVal.number_of_phase !== undefined && newVal.number_of_phase === '1') {
          if (this.internalConfigsData.phase !== newVal.phase) {
            this.internalConfigsData.phase = newVal.phase;
          }
        }
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
      // KHÔNG clear phase_name khi chuyển phase - để parent logic xử lý
      // Chỉ update phase
      this.internalConfigsData.number_of_phase = value;

      // Emit để trigger update ở parent
      this.$emit("update-configs", this.internalConfigsData);
    },
    handlePhaseNameChange() {
      // Emit phase_name khi thay đổi
      this.$emit("update-configs", this.internalConfigsData);
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

/* Ratings + Others cạnh nhau, đều chiều cao */
.short-cards {
  display: flex;
  flex-wrap: wrap;
}

.short-cards .short-card-col {
  display: flex;
  flex-direction: column;
}

.short-card-wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.short-card-wrap .content-toggle {
  flex: 1;
}

.bordered-form.vertical-label {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #f9fafc;
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

::v-deep(.phase-select.el-select) {
  width: 120px !important;
  max-width: 100%;
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

  ::v-deep(.phase-select.el-select) {
    width: 100% !important;
  }
}
</style>
