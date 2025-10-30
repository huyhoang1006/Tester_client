<template>
    <div id="ratings" class="mgy-5">
        <el-row>
            <el-col :span="24">
                <div class="header-toggle pointer" @click="openContact = !openContact">
                    <i v-if="openContact" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Contact system
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openContact">
            <el-row :gutter="20" class="content">
                <el-col :span="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Nominal total travel">
                            <el-input v-model="contactSysData.nominal_total_travel.value">
                                <template slot="append">mm</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Damping time">
                            <el-input v-model="contactSysData.damping_time.value">
                                <template slot="append">ms</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Nozzle length">
                            <el-input v-model="contactSysData.nozzle_length.value">
                                <template slot="append">mm</template>
                            </el-input>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
export default {
    name : "contactSystem",
    props : {
        contactSys : {
            type : Object,
            require : true,
        }
    },
    data() {
        return {
            openContact : "true",
            labelWidth : `250px`
        }
    },
    computed: {
        contactSysData() {
            return this.contactSys
        }
    }
}
</script>