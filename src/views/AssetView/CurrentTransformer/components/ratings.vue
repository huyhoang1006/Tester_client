<template>
    <div id="ratings" class="mgy-5">
        <el-row>
            <el-col :span="24">
                <div class="header-toggle pointer font_size_12" @click="openRatings = !openRatings">
                    <i v-if="openRatings" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Ratings
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openRatings">
            <el-row style="width: 100%;" class="content">
                <el-col :span="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Standard">
                            <el-col :span="24" class="pdr-0">
                                <el-select style="width: 100%;" v-model="ratingsData.standard">
                                    <el-option label="<Select standard>" value="selectStandard"></el-option>
                                    <el-option label="IEC 60044" value="IEC60044"></el-option>
                                    <el-option label="IEC 61869" value="IEC61869"></el-option>
                                    <el-option label="IEEE C57.13" value="IEEEC5713"></el-option>
                                </el-select>
                            </el-col>
                        </el-form-item>
                    </el-form>
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Rated frequency">
                            <el-col :span="11" class="pdl-0">
                                <el-select v-model="ratingsData.rated_frequency">
                                    <el-option label="Custom" value="Custom"></el-option>
                                    <el-option label="60Hz" value="60"></el-option>
                                    <el-option label="50Hz" value="50"></el-option>
                                    <el-option label="16.7Hz" value="16.7"></el-option>
                                </el-select>
                            </el-col>
                            <el-col :span="2" class="pdl-0">
                                <br>
                            </el-col>
                            <el-col :span="11" class="pdr-0" v-if="ratingsData.rated_frequency === 'Custom'">
                                <el-input v-model="ratingsData.rated_frequency_custom">
                                    <template slot="append">Hz</template>
                                </el-input>
                            </el-col>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row v-if="ratingsData.standard != 'selectStandard'">
                <br/>
                <div class="pointer" @click="openShow = !openShow">
                    <div v-if="!openShow">
                        <i class="fa-solid fa-angles-right"></i>
                        Show more
                    </div>
                    <div v-else>
                        <i class="fa-solid fa-angles-down"></i>
                        Show less
                    </div>                    
                </div>
                <br/>
            </el-row>
            <el-row v-if="openShow && ratingsData.standard != 'IEEEC5713'" style="width: 100%; background-color: #F5F5F5; border: 1px solid black;" class="content">
                <el-row class="rating_content">
                    <el-col :span="8" class="col-content">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Primary windings">
                                <el-col :span="24" class="pdr-0">
                                    <el-select style="width: 100%;" v-model="ratingsData.show.primary">
                                        <el-option label="1" value="1"></el-option>
                                        <el-option label="2" value="2"></el-option>
                                        <el-option label="4" value="4"></el-option>
                                    </el-select>
                                </el-col>
                            </el-form-item>
                        </el-form>
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Um (r.m.s)">
                                <el-input v-model="ratingsData.show.um">
                                    <template slot="append">V</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="U withstand (r.m.s) ">
                                <el-input v-model="ratingsData.show.uWithStand">
                                    <template slot="append">V</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="U lightning (peak)">
                                <el-input v-model="ratingsData.show.uLightning">
                                    <template slot="append">V</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Icth">
                                <el-input v-model="ratingsData.show.icth">
                                    <template slot="append">A</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Idyn (peak)">
                                <el-input v-model="ratingsData.show.idyn">
                                    <template slot="append">A</template>
                                </el-input>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
                <el-row class="ith_content">
                    <el-col :span="8" class="col-content">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Ith (r.m.s)">
                                <el-input v-model="ratingsData.show.ith">
                                    <template slot="append">A</template>
                                </el-input>
                            </el-form-item>
                        </el-form>
                    </el-col>
                    <el-col :span="2">
                        <br/>
                    </el-col>
                    <el-col :span="6" class="col-content">
                        <el-form :inline-message="true" label-width="100px" size="mini" label-position="left">
                            <el-form-item label="Duration">
                                <el-input v-model="ratingsData.show.duration">
                                    <template slot="append">s</template>
                                </el-input>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
            </el-row>
            <el-row v-if="openShow && ratingsData.standard == 'IEEEC5713'" style="width: 100%; background-color: #F5F5F5; border: 1px solid black;" class="content">
                <el-row class="rating_content">
                    <el-col :span="8" class="col-content">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Primary windings">
                                <el-col :span="24" class="pdr-0">
                                    <el-select style="width: 25%;" v-model="ratingsData.show.primary">
                                        <el-option label="1" value="1"></el-option>
                                        <el-option label="2" value="2"></el-option>
                                        <el-option label="4" value="4"></el-option>
                                    </el-select>
                                </el-col>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
                <el-row class="ith_content">
                    <el-col :span="6" class="col-content">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="System voltage">
                                <el-input v-model="ratingsData.show.sysVoltage">
                                    <template slot="append">V</template>
                                </el-input>
                            </el-form-item>
                        </el-form>
                    </el-col>
                    <el-col :span="6" class="col-content">
                        <el-form :inline-message="true" label-width="100px" size="mini" label-position="left">
                            <el-form-item label="">
                                <el-select v-model="ratingsData.show.sysVoltageOption">
                                        <el-option label="nom." value="nom"></el-option>
                                        <el-option label="max." value="max"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
                <el-row class="ith_content">
                    <el-col :span="6" class="col-content">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Rated insulation level (BIL)">
                                <el-input v-model="ratingsData.show.rated_insulation">
                                    <template slot="append">V</template>
                                </el-input>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
            </el-row>
            <el-row v-if="ratingsData.standard == 'IEEEC5713'" style="margin-bottom: 20px; margin-top: 20px;">
                <el-col :span="4">
                    <div>Rating factor (RF)</div>
                </el-col>
                <el-col :span="8">
                    <el-row>
                        <el-col :span="8">
                            <el-select size="mini" v-model="ratingsData.ratedFactorArr">
                                <el-option v-for="item in ratedFactorArr" :label="item" :value="item" :key="item"></el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="2" style="margin-left: 10px;">
                            <div>at</div>
                        </el-col>
                        <el-col :span="8">
                            <el-input size="mini" v-model="ratingsData.ratedFactorArrData">
                                <template slot="append">°C</template>
                            </el-input>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
export default {
    name : "currentTransRating",
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
            openShow : "false",
            ratedFactorArr : [1, 1.33, 1.5, 2, 3, 4]
        }
    },
    watch : {
        'ratingsData.standard' : {
            handler : function() {
                this.openShow = false
            }
        }
    },
    computed: {
        ratingsData() {
            return this.ratings
        }
    }
}
</script>
<style scoped>
.rating_content {
    margin-left: 5px;
    margin-top: 5px;
}
.ith_content {
    margin-left: 5px;
}

.font_size_12 {
    font-size: 12px;
}
</style>
