<template>
    <div id="ratings">
        <el-row class="mgt-10">
            <el-col :span="24">
                <div style="font-size: 12px;" class="header-toggle pointer" @click="openRatings = !openRatings">
                    <i v-if="openRatings" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Ratings
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openRatings">
            <el-row :gutter="20" class="content">
                <el-col :xs="24" :md="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Standard">
                            <el-select style="width: 100%;" v-model="ratingsData.standard">
                                <el-option label="<Select standard>" value="selectStandard"></el-option>
                                <el-option label="IEC 60044" value="IEC60044"></el-option>
                                <el-option label="IEC 61869" value="IEC61869"></el-option>
                                <el-option label="ANSI C93.1" value="ANSIC931"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Rated frequency" class="inline-content">
                            <div class="form-inline">
                                <el-select class="rf-control" v-model="ratingsData.rated_frequency.value">
                                    <el-option label="Custom" value="Custom"></el-option>
                                    <el-option label="60Hz" value="60"></el-option>
                                    <el-option label="50Hz" value="50"></el-option>
                                    <el-option label="16.7Hz" value="16.7"></el-option>
                                </el-select>
                                <el-input :disabled="ratingsData.rated_frequency.value !== 'Custom'"
                                    v-model="ratingsData.rated_frequency_custom" class="rf-control">
                                    <template #append>Hz</template>
                                </el-input>
                            </div>
                        </el-form-item>
                        <template v-if="propertiesData.asset_type === 'CVTCCTV'">
                            <el-form-item label="C1">
                                <el-input v-model="ratingsData.c1.value">
                                    <template #append>pF</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="C2">
                                <el-input v-model="ratingsData.c2.value">
                                    <template #append>pF</template>
                                </el-input>
                            </el-form-item>
                        </template>
                        <el-form-item label="Upr">
                            <div class="form-inline">
                                <el-select class="form-control" v-model="ratingsData.upr">
                                    <el-option label="1 / 1" value="1"></el-option>
                                    <el-option label="1 / 3" value="3"></el-option>
                                    <el-option label="1 / √3" value="3sqrt"></el-option>
                                </el-select>
                                <el-input class="form-control" v-model="ratingsData.rated_voltage.value">
                                    <template #append>kV</template>
                                </el-input>
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
    name: "ratings",
    props: {
        ratings: {
            type: Object,
            required: true,
        },
        properties: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            openRatings: true,
            labelWidth: `120px`,
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

<style lang="scss" scoped>
.col-content {
    font-size: 12px;
}

::v-deep(.el-form-item__label) {
    font-size: 12px;
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
</style>