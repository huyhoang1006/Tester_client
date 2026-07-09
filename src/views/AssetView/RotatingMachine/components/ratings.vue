<template>
    <div id="ratings">
        <div class="header-toggle pointer" @click="openRatings = !openRatings">
            <i v-if="openRatings" class="fa-solid fa-caret-up"></i>
            <i v-else class="fa-solid fa-caret-down"></i>
            Ratings
        </div>
        <div v-if="openRatings" class="content-toggle">
            <div class="ratings-grid">
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <el-form-item label="Rated frequency">
                        <el-select v-model="ratingsData.rated_frequency.value" placeholder="Select frequency">
                            <el-option label="50 Hz" value="50 Hz" />
                            <el-option label="60 Hz" value="60 Hz" />
                            <el-option label="16.7 Hz" value="16.7 Hz" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Rated voltage L-L">
                        <el-input type="text" number="positive" v-model="ratingsData.rated_u.value">
                            <template slot="append">V</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Rated current">
                        <el-input type="text" number="positive" v-model="ratingsData.rated_current.value">
                            <template slot="append">A</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Rated speed (rpm)">
                        <el-input type="text" number="positive" v-model="ratingsData.rated_speed">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Rated power">
                        <el-input type="text" number="positive" v-model="ratingsData.rated_power.value">
                            <template slot="append">kVA</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Rated power factor">
                        <el-input type="text" number="positive" v-model="ratingsData.rated_power_factor">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Rated thermal class">
                        <el-select v-model="ratingsData.rated_thermal_class" placeholder="Select class">
                            <el-option label="Class A" value="Class A"> </el-option>
                            <el-option label="Class B" value="Class B"> </el-option>
                            <el-option label="Class F" value="Class F"> </el-option>
                            <el-option label="Class H" value="Class H"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Rated excitation current (rotor)">
                        <el-input type="text" number="positive" v-model="ratingsData.rated_ifd.value">
                            <template slot="append">A</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Rated excitation voltage (rotor)">
                        <el-input type="text" number="positive" v-model="ratingsData.rated_ufd.value">
                            <template slot="append">V</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </div>
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
        }
    },
    data() {
        return {
            openRatings: true,
            labelWidth: '180px',
        };
    },
    computed: {
        ratingsData() {
            return this.ratings;
        }
    }
}
</script>
<style lang="scss" scoped>
#ratings {
    min-width: 0;
}

.ratings-grid {
    width: min(100%, 560px);
    min-width: 0;
}

::v-deep(.el-select),
::v-deep(.el-input) {
    width: 100%;
}

::v-deep(.el-input-group__append) {
    width: 44px;
    min-width: 44px;
    padding: 0;
    text-align: center;
}

::v-deep(.el-form-item) {
    margin-bottom: 8px;
}

::v-deep(.el-input__inner),
::v-deep(.el-select .el-input__inner),
::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

@media (max-width: 767px) {
    .ratings-grid {
        width: 100%;
    }

    ::v-deep(.el-form-item) {
        display: block;
    }

    ::v-deep(.el-form-item__label) {
        width: 100%;
        text-align: left;
        margin-bottom: 4px;
    }

    ::v-deep(.el-form-item__content) {
        margin-left: 0 !important;
    }
}
</style>
