<template>
    <div style="font-size: 12px;" class="col-content">
        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
            <span class="bolder">Ratings</span>
            <el-divider></el-divider>
            <el-form-item label="Rated voltage">
                <el-input v-model="ratingsData.ratedVoltage.value">
                    <template slot="append">kV</template>
                </el-input>
            </el-form-item>
            <el-form-item label="Rated frequency">
                <el-input v-model="ratingsData.ratedFrequency.value">
                    <template slot="append">Hz</template>
                </el-input>
            </el-form-item>
            <el-form-item label="Rated current">
                <el-input v-model="ratingsData.ratedCurrent.value">
                    <template slot="append">A</template>
                </el-input>
            </el-form-item>
            <el-form-item label="Rated power">
                <el-input v-model="ratingsData.ratedPower.value">
                    <template slot="append">kVAr</template>
                </el-input>
            </el-form-item>      
            <el-form-item label="Inductance">
                <el-input v-model="ratingsData.inductance.value">
                    <template slot="append">H</template>
                </el-input>
            </el-form-item>      
        </el-form>
    </div>
</template>
<script>
export default {
    name: 'RatingsReactor',
    data() {
        return {
            labelWidth: '200px',
        }
    },
    props: {
        ratings: {
            type: Object,
            default: () => ({})
        },
    },
    computed: {
        ratingsData() {
            return this.ratings
        }
    }
}
</script>
<style scoped>
::v-deep .el-input__inner,
::v-deep .el-select .el-input__inner {
    font-size: 12px !important;
}
::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}
</style>