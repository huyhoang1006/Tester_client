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
        <el-form style = "width: 50%;" v-show="openRatings" :label-width="labelWidth" size="mini" label-position="left" >
            <el-form-item label="Rated frequency">
                <el-select v-model="ratingsData.rated_frequency.value" style="width: 100%;"  placeholder="Select frequency">
                    <el-option label="50 Hz" value="50 Hz" />
                    <el-option label="60 Hz" value="60 Hz" />
                    <el-option label="16.7 Hz" value="16.7 Hz" />
                </el-select>
            </el-form-item>
            <el-form-item label="Rated voltage L-L">
                <el-input v-model="ratingsData.rated_u.value" style="width: 100%;">
                    <template slot="append">V</template>
                </el-input>
            </el-form-item>
            <el-form-item label="Rated current">
                <el-input v-model="ratingsData.rated_current.value" style="width: 100%;">
                    <template slot="append">A</template>
                </el-input>
            </el-form-item>
            <el-form-item label="Rated speed (rpm)">
                <el-input v-model="ratingsData.rated_speed" style="width: 100%;">
                </el-input>
            </el-form-item>
            <el-form-item label="Rated power">
                <el-input v-model="ratingsData.rated_power.value" style="width: 100%;">
                    <template slot="append">kVA</template>
                </el-input>
            </el-form-item>
            <el-form-item label="Rated power factor">
                <el-input v-model="ratingsData.rated_power_factor" style="width: 100%;">
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
                <el-input v-model="ratingsData.rated_ifd.value" style="width: 100%;">
                    <template slot="append">A</template>
                </el-input>
            </el-form-item>
            <el-form-item label="Rated excitation voltage (rotor)">
                <el-input v-model="ratingsData.rated_ufd.value" style="width: 100%;">
                    <template slot="append">V</template>
                </el-input>
            </el-form-item>
        </el-form>
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
            labelWidth: '200px',
        };
    },
    computed: {
        ratingsData() {
            return this.ratings;
        }
    }
}
</script>
<style scoped>
.bolder {
    font-size: 12px;
}

</style>