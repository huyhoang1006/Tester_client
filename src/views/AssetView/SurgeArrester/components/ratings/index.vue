<template>
    <div id="ratings" class="mgy-5">
        <div class="content-toggle" v-if="openRatings">
            <el-row :gutter="20" style="width: 100%; margin-top: 20px; margin-bottom: 10px;" class="content">
                <el-col :span="8" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <span style="font-size: 12px;" class="bolder">Ratings</span>
                        <el-divider></el-divider>
                        <el-form-item label="Units in stack">
                            <el-select @change="changeUnit(ratingsData.unitStack)" style="width: 100%;" v-model="ratingsData.unitStack">
                                <el-option v-for="(item, index) in 8" :value="item" :label="item" :key="index"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row :gutter="20" style=" width: 100%; margin-top: 20px; margin-bottom: 10px; margin-left: 5px;" class="content my-element">
                <table class="table-strip-input-data" style=" background-color: white; width: 1210px; table-layout: fixed;">
                    <thead >
                        <th class="thvol" style="width: 70px;">Position</th>
                        <th class="thvol" style="width: 120px;">Serial no.</th>
                        <th class="thvol" style="width: 120px;">Rated voltage U<sub>r</sub></th>
                        <th class="thvol" style="width: 100px;">Maximun system voltage<sub>s</sub></th>
                        <th class="thvol" style="width: 120px;">Continous operating voltage U<sub>c</sub></th>
                        <th class="thvol" style="width: 120px;">Short time withstand current</th>
                        <th class="thvol" style="width: 140px;">Rated duration of short circuit</th>
                        <th class="thvol" style="width: 210px;">Power frequency withstand voltage (to earth and between poles)</th>
                        <th class="thvol" style="width: 210px;">Power frequency withstand voltage (across the isolating distance)</th>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in ratingsData.tableRating" :key="index">
                            <td>{{ index + 1 }}</td>
                            <td>
                                <el-input size="mini" v-model="item.serial">
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.ratedVoltage.value">
                                    <template #append>
                                        <span>{{ unitMultiplier.k + unitSymbol.V }}</span>
                                    </template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.maximumVoltage.value">
                                    <template #append>
                                        <span>{{ unitMultiplier.k + unitSymbol.V }}</span>
                                    </template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.continousVoltage.value">
                                    <template #append>
                                        <span>{{ unitMultiplier.k + unitSymbol.V }}</span>
                                    </template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.shortCurrent.value">
                                    <template #append>
                                        <span>{{ unitMultiplier.k + unitSymbol.A }}</span>
                                    </template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.ratedCircuit.value">
                                    <template #append>
                                        <span>{{ unitSymbol.s }}</span>
                                    </template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.polesVoltage.value">
                                    <template #append>
                                        <span>{{ unitMultiplier.k + unitSymbol.V }}</span>
                                    </template>
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.isoVoltage.value">
                                    <template #append>
                                        <span>{{ unitMultiplier.k + unitSymbol.V }}</span>
                                    </template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </el-row>
        </div>
    </div>
</template>
<script>
import { UnitMultiplier } from '@/views/Enum/UnitMultiplier';
import { UnitSymbol } from '@/views/Enum/UnitSymbol';
export default {
    name : "ratings",
    props : {
        data : {
            type : Object,
            require : true,
            default : () => ({
                tableRating: [],
                unitStack: 1
            })
        }
    },
    data() {
        return {
            openRatings : "true",
            labelWidth : `150px`,
            unitMultiplier : UnitMultiplier,
            unitSymbol : UnitSymbol,
        }
    },
    watch : {
    },
    computed: {
        ratingsData() {
            return this.data;
        }
    },
    methods: {
        changeUnit(data) {
            let lengthData = this.ratingsData.tableRating.length
            if(lengthData < data) {
                for(let i=0; i < data-lengthData; i++) {
                    this.ratingsData.tableRating.push({
                        mrid: '',
                        position : i + 1 + lengthData,
                        serial : '',
                        ratedVoltage : {
                            mrid : '',
                            value: '',
                            unit: this.unitMultiplier.k + '|' + this.unitSymbol.V
                        },
                        maximumVoltage : {
                            mrid : '',
                            value: '',
                            unit: this.unitMultiplier.k + '|' + this.unitSymbol.V
                        },
                        continousVoltage : {
                            mrid : '',
                            value: '',
                            unit: this.unitMultiplier.k + '|' + this.unitSymbol.V
                        },
                        shortCurrent : {
                            mrid : '',
                            value: '',
                            unit: this.unitMultiplier.k + '|' + this.unitSymbol.A
                        },
                        ratedCircuit : {
                            mrid : '',
                            value: '',
                            unit: this.unitSymbol.s
                        },
                        polesVoltage : {
                            mrid : '',
                            value: '',
                            unit: this.unitMultiplier.k + '|' + this.unitSymbol.V
                        },
                        isoVoltage : {
                            mrid : '',
                            value: '',
                            unit: this.unitMultiplier.k + '|' + this.unitSymbol.V
                        }
                    })
                }
            } else if(lengthData > data) {
                this.ratingsData.tableRating.splice(data, parseInt(lengthData-data))
            }
        }
    }
}
</script>
<style scoped>
th, td, table {
    border-collapse: collapse;
    border: 1px solid !important;
    border-color: #808080 !important;
    text-align: center;
    font-size: 12px;
}
.thvol {
    text-align: center;
    padding-top: 10px;
    padding-bottom: 10px;
    font-size: 12px;
}

::v-deep .el-form-item__label {
    font-size: 12px;
}

.my-element {
  /* Bắt buộc phải set overflow để scrollbar xuất hiện */
  overflow: auto;

  /* Firefox */
  scrollbar-width: thin; /* thin = mảnh hơn bình thường */
  scrollbar-color: #888 #f1f1f1; /* thumb (đầu cuộn) và track (nền) */
}

/* Chrome, Safari, Edge */
.my-element::-webkit-scrollbar {
  width: 5px !important;  /* độ dày thanh cuộn dọc */
  height: 5px; /* độ dày thanh cuộn ngang */
}

.my-element::-webkit-scrollbar-track {
  background: #f1f1f1; /* nền của scrollbar */
}

.my-element::-webkit-scrollbar-thumb {
  background: #888;       /* màu của thanh kéo */
  border-radius: 6px;     /* bo góc thanh kéo */
}

.my-element::-webkit-scrollbar-thumb:hover {
  background: #555; /* khi hover thì tối hơn */
}
</style>