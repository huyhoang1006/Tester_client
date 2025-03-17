<template>
    <div id="ratings" class="mgy-5">
        <div class="content-toggle" v-if="openRatings">
            <el-row :gutter="20" style="width: 100%; margin-top: 20px; margin-bottom: 10px;" class="content">
                <el-col :span="8" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <span class="bolder">Ratings</span>
                        <el-divider></el-divider>
                        <el-form-item label="Units in stack">
                            <el-select @change="changeUnit(ratingsData.unitStack)" style="width: 100%;" v-model="ratingsData.unitStack">
                                <el-option v-for="(item, index) in 8" :value="item" :label="item" :key="index"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row :gutter="20" style=" width: 100%; margin-top: 20px; margin-bottom: 10px; margin-left: 5px;" class="content">
                <table class="table-strip-input-data" style=" background-color: white;">
                    <thead >
                        <th class="thvol" style="width: 100px;">Position</th>
                        <th class="thvol" style="width: 100px;">Serial no.</th>
                        <th class="thvol" style="width: 100px;">Rated voltage U<sub>r</sub>(kV)</th>
                        <th class="thvol" style="width: 100px;">Maximun system voltage<sub>s</sub>(kA)</th>
                        <th class="thvol" style="width: 200px;">Continous operating voltage U<sub>c</sub>(kV)</th>
                        <th class="thvol" style="width: 150px;">Short time witdstand current (kA)</th>
                        <th class="thvol" style="width: 150px;">Rated duration of short circuit (s)</th>
                        <th class="thvol" style="width: 280px;">Power frequency witdstand voltage(kV) (to eartd and between poles)</th>
                        <th class="thvol" style="width: 300px;">Power frequency witdsatand voltage(kV) (across tde isolating distance)</th>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in ratingsData.tableRating" :key="index">
                            <td>{{ item.position }}</td>
                            <td>
                                <el-input size="mini" v-model="item.serial">
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.ratedVoltage">
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.maximumVoltage">
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.continousVoltage">
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.shortCurrent">
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.ratedCircuit">
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.polesVotage">
                                </el-input>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.isoVoltage">
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
export default {
    name : "ratings",
    props : {
        ratings : {
            type : Object,
            require : true,
        }
    },
    data() {
        return {
            openRatings : "true",
            labelWidth : `200px`,
        }
    },
    watch : {
    },
    computed: {
        ratingsData() {
            return this.ratings
        }
    },
    methods: {
        changeUnit(data) {
            let lengthData = this.ratingsData.tableRating.length
            if(lengthData < data) {
                for(let i=0; i < data-lengthData; i++) {
                    this.ratingsData.tableRating.push({
                        position : i + 1 + lengthData
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
}
.thvol {
    text-align: center;
    padding-top: 10px;
    padding-bottom: 10px;
}
</style>