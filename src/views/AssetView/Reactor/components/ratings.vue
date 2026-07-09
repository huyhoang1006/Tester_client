<template>
    <div id="ratings">
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
            <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                <el-form-item label="Rated voltage">
                    <el-input type="number" number="positive" v-model="ratingsData.rated_voltage.value">
                        <template slot="append">kV</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="Rated frequency">
                    <el-input type="number" number="positive" v-model="ratingsData.rated_frequency.value">
                        <template slot="append">Hz</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="Rated current">
                    <el-input type="number" number="positive" v-model="ratingsData.rated_current.value">
                        <template slot="append">A</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="Rated power">
                    <el-input type="number" number="positive" v-model="ratingsData.rated_power.value">
                        <template slot="append">kVAr</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="Inductance">
                    <el-input type="number" number="positive" v-model="ratingsData.inductance.value">
                        <template slot="append">H</template>
                    </el-input>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
export default {
    name: 'RatingsReactor',
    data() {
        return {
            labelWidth: '120px',
            openRatings: true,
        }
    },
    props: {
        data: {
            type: Object,
            default: () => ({})
        },
    },
    computed: {
        ratingsData() {
            return this.data
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
