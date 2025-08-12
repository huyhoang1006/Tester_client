<template>
    <div style="margin-top: 20px;">
        <div style="margin-bottom: 20px;" v-for="(item, index) in surgeArrester.prim" :key="'prim-' + index">
            <div style="margin-bottom: 20px;">
                <el-checkbox @change="(val) => onCheckboxClick(val, 'prim', index)" :key="index" v-model="surgeArrester.prim[index].sign" :label="'Surge arrester - ' + item.ratings.pos" size="small" />
                <el-divider></el-divider>
            </div>
            <div v-if="surgeArrester.prim[index].sign">
                <property :properties="item.properties"></property>
                <rating :ratings="item.ratings"></rating>
            </div>
        </div>
        <div style="margin-bottom: 20px;" v-for="(item, index) in surgeArrester.sec" :key="'sec-' + index">
            <div style="margin-bottom: 20px;">
                <el-checkbox @click="onCheckboxClick(surgeArrester.sec[index].sign, 'sec', index)" :key="index" v-model="surgeArrester.sec[index].sign" :label="'Surge arrester - ' + item.ratings.pos" size="small" />
                <el-divider></el-divider>
            </div>
            <div v-if="surgeArrester.sec[index].sign">
                <property :properties="item.properties"></property>
                <rating :ratings="item.ratings"></rating>
            </div>
        </div>
        <div style="margin-bottom: 20px;" v-for="(item, index) in surgeArrester.tert" :key="'tert-' + index">
            <div style="margin-bottom: 20px;">
                <el-checkbox @click="onCheckboxClick(surgeArrester.tert[index].sign, 'tert', index)" :key="index" v-model="surgeArrester.tert[index].sign" :label="'Surge arrester - ' + item.ratings.pos" size="small" />
                <el-divider></el-divider>
            </div>
            <div v-if="surgeArrester.tert[index].sign">
                <property :properties="item.properties"></property>
                <rating :ratings="item.ratings"></rating>
            </div>
        </div>
    </div>
</template>

<script>
import property from './Components/Property/index.vue'
import rating from './Components/Rating/index.vue'

export default {
    name: 'SurgeArrester',
    components: {
        property,
        rating
    },
    props: {
        data: {
            type: Object,
            default: () => ({
                prim: [],
                sec: [],
                tert: []
            })
        },
        properties: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
        }
    },
    computed: {
        surgeArrester() {
            return this.data;
        }
    },
    methods: {
        onCheckboxClick(sign, type, index) {
            if (sign == false) {
                this.$confirm('This will delete surge arrester permanently. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    this.surgeArrester[type][index].properties = {
                        serial_no : '',
                        manufacturer : '',
                        manufacturer_year : '',
                        asset_system_code : '',
                    };
                    this.surgeArrester[type][index].ratings.unit = ''
                    this.surgeArrester[type][index].ratings.table = []
                    this.surgeArrester[type][index].sign = false;
                }).catch(() => {
                    this.surgeArrester[type][index].sign = true;
                });
            } else {
                this.surgeArrester[type][index].sign = true;
            }
        }
    },
    
}
</script>

<style scoped>
::v-deep(.el-checkbox__label) {
    font-size: 12px !important;
    font-weight: bold !important;
}
</style>