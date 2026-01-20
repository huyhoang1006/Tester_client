<template>
    <div id="ratings" class="mgt-10">
        <el-row>
            <el-col :span="24">
                <div class="header-toggle pointer" style="font-size: 12px;" @click="openRatings = !openRatings">
                    <i v-if="openRatings" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Ratings
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openRatings">
            <el-row :gutter="20" class="content">
                <el-col :xs="24" :md="16" :lg="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-row :gutter="8">
                            <el-col :span="24">
                                <el-form-item label="Standard">
                                    <el-select style="width: 100%;" v-model="ratingsData.standard.value">
                                        <el-option label="IEC 60044" value="IEC60044"></el-option>
                                        <el-option label="IEC 61869" value="IEC61869"></el-option>
                                        <el-option label="IEEE C57.13" value="IEEEC5713"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="8">
                            <el-col :span="24">
                                <el-form-item label="Rated frequency">
                                    <div class="form-inline">
                                        <el-select class="form-control" v-model="ratingsData.rated_frequency.value">
                                            <el-option label="Custom" value="Custom"></el-option>
                                            <el-option label="60Hz" value="60"></el-option>
                                            <el-option label="50Hz" value="50"></el-option>
                                            <el-option label="16.7Hz" value="16.7"></el-option>
                                        </el-select>
                                        <el-input class="form-control" v-model="ratingsData.rated_frequency_custom"
                                            :disabled="ratingsData.rated_frequency.value !== 'Custom'">
                                            <template slot="append">Hz</template>
                                        </el-input>
                                    </div>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </el-col>
            </el-row>
            <el-row style="margin: 10px;"
                v-if="!ratingsData.standard.value || ratingsData.standard.value !== 'selectStandard'">
                <div class="pointer" @click="openShow = !openShow">
                    <div style="font-size: 12px; font-weight: bold;" v-if="!openShow">
                        <i class="fa-solid fa-angles-down"></i>
                        Show more
                    </div>
                    <div style="font-size: 12px; font-weight: bold;" v-else>
                        <i class="fa-solid fa-angles-up"></i>
                        Show less
                    </div>
                </div>
            </el-row>
            <el-row v-if="openShow && ratingsData.standard.value !== 'IEEEC5713'" class="content rating-wrapper">
                <el-col :xs="24" :lg="18" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-row>
                            <el-col :xs="24" :md="12" :lg="10" class="custom-col-spacing">
                                <el-form-item label="Primary windings">
                                    <el-select style="width: 100%;" v-model="ratingsData.primary_winding_count">
                                        <el-option label="1" value="1"></el-option>
                                        <el-option label="2" value="2"></el-option>
                                        <el-option label="4" value="4"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="Um (r.m.s)">
                                    <el-input v-model="ratingsData.um_rms.value">
                                        <template slot="append">V</template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="U withstand (r.m.s) ">
                                    <el-input v-model="ratingsData.u_withstand_rms.value">
                                        <template slot="append">V</template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="U lightning (peak)">
                                    <el-input v-model="ratingsData.u_lightning_peak.value">
                                        <template slot="append">V</template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="Icth">
                                    <el-input v-model="ratingsData.icth.value">
                                        <template slot="append">A</template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="Idyn (peak)">
                                    <el-input v-model="ratingsData.idyn_peak.value">
                                        <template slot="append">A</template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :xs="24" :md="12" :lg="10">
                                <el-form-item label="Ith (r.m.s)">
                                    <el-input v-model="ratingsData.ith_rms.value">
                                        <template slot="append">A</template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :xs="24" :md="12" :lg="10">
                                <el-form-item label="Duration" class="custom-form-item">
                                    <el-input v-model="ratingsData.ith_duration.value">
                                        <template slot="append">s</template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </el-col>
            </el-row>
            <el-row v-if="openShow && ratingsData.standard.value === 'IEEEC5713'" class="content rating-wrapper">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <el-col :span="24">
                        <el-row>
                            <el-col :xs="24" :md="12" :lg="8" class="custom-col-spacing">
                                <el-form-item label="Primary windings">
                                    <el-select style="width: 100%;" v-model="ratingsData.primary_winding_count">
                                        <el-option label="1" value="1"></el-option>
                                        <el-option label="2" value="2"></el-option>
                                        <el-option label="4" value="4"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-col>
                    <el-col :span="24">
                        <el-row>
                            <el-col :xs="24" :sm="16" :md="12" :lg="8">
                                <el-form-item label="System voltage">
                                    <el-input style="width: 100%" v-model="ratingsData.system_voltage.value">
                                        <template slot="append">V</template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :xs="24" :sm="8" :md="6" :lg="4">
                                <el-form-item class="nom-max-sel">
                                    <el-select style="width: 100%" v-model="ratingsData.system_voltage_type.value">
                                        <el-option label="nom." value="nom"></el-option>
                                        <el-option label="max." value="max"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-col>
                    <el-col :span="24">
                        <el-row>
                            <el-col :xs="24" :md="12" :lg="8">
                                <el-form-item label="Rated insulation level (BIL)">
                                    <el-input style="width: 100%" v-model="ratingsData.bil.value">
                                        <template slot="append">V</template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-form>
            </el-row>
            <el-row v-if="ratingsData.standard.value === 'IEEEC5713'" style="margin: 10px 0;">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <el-form-item label="Rating factor (RF)">
                        <el-row type="flex" align="middle" :gutter="8">
                            <el-col :xs="10" :sm="10" :md="6" :lg="4">
                                <el-select style="width: 100%" size="mini" v-model="ratingsData.rating_factor">
                                    <el-option v-for="item in ratedFactorArr" :label="item" :value="item"
                                        :key="item"></el-option>
                                </el-select>
                            </el-col>
                            <el-col :xs="1" :sm="1" :md="1" :lg="1"
                                style="text-align: center; font-size: 12px; white-space: nowrap;">at</el-col>
                            <el-col :xs="13" :sm="12" :md="7" :lg="5">
                                <el-input style="width: 100%" size="mini"
                                    v-model="ratingsData.rating_factor_temp.value">
                                    <template slot="append">°C</template>
                                </el-input>
                            </el-col>
                        </el-row>
                    </el-form-item>
                </el-form>
            </el-row>
        </div>
    </div>
</template>

<script>
export default {
    name: "currentTransRating",
    props: {
        ratings: {
            type: Object,
            require: true,
        }
    },
    data() {
        return {
            openRatings: true,
            labelWidth: `120px`,
            openShow: false,
            ratedFactorArr: [1, 1.33, 1.5, 2, 3, 4]
        }
    },
    watch: {
        'ratingsData.standard.value'() {
            this.openShow = false
        }
    },
    computed: {
        ratingsData() {
            return this.ratings
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep(.rating_content) {
    margin-left: 5px;
    margin-top: 5px;
}

::v-deep(.ith_content) {
    margin-left: 5px;
}

::v-deep(.rating-wrapper) {
    background-color: #f5f5f5;
    border: 1px solid #000;
    padding: 10px;
}

::v-deep(.form-inline) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
}

::v-deep(.form-control) {
    flex: 1;
}

::v-deep(.custom-form-item .el-form-item__label) {
    text-align: center;
}

::v-deep(.el-form-item__label) {
    white-space: normal;
    word-break: break-word;
    line-height: 1.2;
}

::v-deep(.nom-max-sel .el-form-item__label) {
    display: none;
}

::v-deep(.nom-max-sel .el-form-item__content) {
    margin-left: 8px !important;
}

@media (max-width: 991px) {
    ::v-deep(.custom-form-item .el-form-item__label) {
        text-align: left;
    }
}

@media (max-width: 767px) {
    ::v-deep(.nom-max-sel .el-form-item__content) {
        margin-left: 120px !important;
    }
}
</style>