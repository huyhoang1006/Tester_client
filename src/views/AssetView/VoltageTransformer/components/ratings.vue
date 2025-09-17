<template>
    <div id="ratings" class="mgy-5">
        <el-row style="margin-top: 20px; margin-bottom: 10px;">
            <el-col :span="24">
                <div style="font-size: 12px;" class="header-toggle pointer" @click="openRatings = !openRatings">
                    <i v-if="openRatings" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Ratings
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openRatings">
            <el-row style="width: 100%;" class="content">
                <el-col style="width: calc((100%/2) - 20px);" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Standard">
                            <el-col :span="24" class="pdr-0">
                                <el-select style="width: 100%;" v-model="ratingsData.standard.value">
                                    <el-option label="<Select standard>" value="selectStandard"></el-option>
                                    <el-option label="IEC 60044" value="IEC60044"></el-option>
                                    <el-option label="IEC 61869" value="IEC61869"></el-option>
                                    <el-option label="ANSI C93.1" value="ANSIC931"></el-option>
                                </el-select>
                            </el-col>
                        </el-form-item>
                    </el-form>
                    <el-form v-if="ratingsData.rated_frequency.value != 'Custom'" :inline-message="true"
                        :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Rated frequency">
                            <el-col :span="24" class="pdr-0">
                                <el-select style="width: 100%;" v-model="ratingsData.rated_frequency.value">
                                    <el-option label="Custom" value="Custom"></el-option>
                                    <el-option label="60Hz" value="60"></el-option>
                                    <el-option label="50Hz" value="50"></el-option>
                                    <el-option label="16.7Hz" value="16.7"></el-option>
                                </el-select>
                            </el-col>
                        </el-form-item>
                    </el-form>
                    <el-form v-else :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Rated frequency">
                            <el-col :span="11" class="pdl-0">
                                <el-select v-model="ratingsData.rated_frequency.value">
                                    <el-option label="Custom" value="Custom"></el-option>
                                    <el-option label="60Hz" value="60"></el-option>
                                    <el-option label="50Hz" value="50"></el-option>
                                    <el-option label="16.7Hz" value="16.7"></el-option>
                                </el-select>
                            </el-col>
                            <el-col :span="2" class="pdl-0">
                                <br>
                            </el-col>
                            <el-col :span="11" class="pdr-0" v-if="ratingsData.rated_frequency.value === 'Custom'">
                                <el-input v-model="ratingsData.rated_frequency_custom">
                                    <template slot="append">Hz</template>
                                </el-input>
                            </el-col>
                        </el-form-item>
                    </el-form>
                    <el-form v-if="propertiesData.asset_type == 'CVTCCTV'" :inline-message="true"
                        :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="C1">
                            <el-col :span="11" class="pdl-0">
                                <el-input v-model="ratingsData.c1.value">
                                    <template slot="append">pF</template>
                                </el-input>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="C2">
                            <el-col :span="11" class="pdl-0">
                                <el-input v-model="ratingsData.c2.value">
                                    <template slot="append">pF</template>
                                </el-input>
                            </el-col>
                        </el-form-item>
                    </el-form>
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Upr">
                            <el-col :span="11" class="pdl-0">
                                <el-select v-model="ratingsData.upr">
                                    <el-option label="1 / 1" value="1"></el-option>
                                    <el-option label="1 / 3" value="3"></el-option>
                                    <el-option label="1 / √3" value="3sqrt"></el-option>
                                </el-select>
                            </el-col>
                            <el-col :span="2" class="pdl-0">
                                <br>
                            </el-col>
                            <el-col :span="11" class="pdr-0">
                                <el-input v-model="ratingsData.rated_voltage.value">
                                    <template slot="append">kV</template>
                                </el-input>
                            </el-col>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
    </div>
</template>
<script>
export default {
    name: "ratings",
    props: {
        ratings: {
            type: Object,
            require: true,
        },
        properties: {
            type: Object,
            require: true,
        }
    },
    data() {
        return {
            openRatings: true,
            labelWidth: `200px`,
        }
    },
    computed: {
        ratingsData() {
            return this.ratings
        },
        propertiesData() {
            return this.properties
        }
    }
}
</script>