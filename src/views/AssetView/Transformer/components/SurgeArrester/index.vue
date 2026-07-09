<template>
    <div class="surge-arrester-tab">
        <div class="surge-card" v-for="(item, index) in surgeArrester.prim" :key="'prim-' + index">
            <div class="surge-header">
                <el-checkbox @change="(val) => onCheckboxClick(val, 'prim', index)" v-model="surgeArrester.prim[index].sign" :label="'Surge arrester - ' + item.ratings.pos" size="small" />
            </div>
            <div class="surge-body" v-if="surgeArrester.prim[index].sign">
                <property :properties="item.properties"></property>
                <rating :ratings="item.ratings"></rating>
            </div>
        </div>
        <div class="surge-card" v-for="(item, index) in surgeArrester.sec" :key="'sec-' + index">
            <div class="surge-header">
                <el-checkbox @change="(val) => onCheckboxClick(val, 'sec', index)" v-model="surgeArrester.sec[index].sign" :label="'Surge arrester - ' + item.ratings.pos" size="small" />
            </div>
            <div class="surge-body" v-if="surgeArrester.sec[index].sign">
                <property :properties="item.properties"></property>
                <rating :ratings="item.ratings"></rating>
            </div>
        </div>
        <div class="surge-card" v-for="(item, index) in surgeArrester.tert" :key="'tert-' + index">
            <div class="surge-header">
                <el-checkbox @change="(val) => onCheckboxClick(val, 'tert', index)" v-model="surgeArrester.tert[index].sign" :label="'Surge arrester - ' + item.ratings.pos" size="small" />
            </div>
            <div class="surge-body" v-if="surgeArrester.tert[index].sign">
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
            surgeArrester : JSON.parse(JSON.stringify(this.data))
        }
    },
    watch: {
        surgeArrester: {
            deep: true,
            immediate : true,
            handler: function (newVal) {
                this.$emit('update', newVal)
            }
        }
    },

    methods: {
        onCheckboxClick(sign, type, index) {
            if (sign === false) {
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
            this.$emit('update', this.surgeArrester)
        }
    },
    
}
</script>

<style scoped>
.surge-arrester-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 6px;
}

.surge-card {
    overflow: hidden;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
}

.surge-header {
    display: flex;
    align-items: center;
    min-height: 40px;
    padding: 10px 14px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
}

.surge-body {
    padding: 14px;
}

::v-deep(.el-checkbox__label) {
    font-size: 12px !important;
    color: #606266;
    font-weight: 600 !important;
}

@media (max-width: 768px) {
    .surge-body {
        padding: 12px;
    }
}
</style>
