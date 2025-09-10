<template>
    <div id="ratings" class="mgy-5">
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
            <el-row :gutter="20" class="content">
                <el-col :span="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Total Weight with gas">
                            <el-input v-model="othersData.totalWithgas">
                                <template slot="append">kg</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Weight of gas">
                            <el-input v-model="othersData.weightGas">
                                <template slot="append">kg</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Volume of gas">
                            <el-input v-model="othersData.VolumeGas">
                                <template slot="append">l</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated gas pressure">
                            <div style="width: 100%;">
                                <el-col style="width: 45%;">
                                    <el-input style="width: 100%;" v-model="othersData.pa">
                                        <template slot="append">Pa</template>
                                    </el-input>
                                </el-col>
                                <el-col style="width: 10%;">
                                    <div>@</div>
                                </el-col>
                                <el-col style="width: 45%;">
                                    <el-input v-model="othersData.Celsius">
                                        <template slot="append">°C</template>
                                    </el-input>
                                </el-col>
                            </div>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
export default {
    name : "others",
    props : {
        others : {
            type : Object,
            require : true,
        }
    },
    data() {
        return {
            openOthers : "true",
            labelWidth : `300px`
        }
    },
    computed: {
        othersData() {
            return this.others
        }
    }
}
</script>