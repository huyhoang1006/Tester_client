<template>
    <div id="asset">
        <div style="min-height: 500px; display: flex; flex-direction: column;">
            <div style="flex: 1; display: flex; flex-direction: column;">
                <capacitorProperty 
                    :data="capacitor.properties"
                    @update-attachment="updateAttachment"
                    :attachment.sync="this.attachmentData">
                </capacitorProperty>  
                <configs 
                    :configs="capacitor.configsData"
                    :ratings="capacitor.ratings"
                    :others="capacitor.othersData"
                    :capacitance="capacitor.capacitance"
                    :dissipationFactor="capacitor.dissipationFactor"
                    @update-configs="updateConfigs"
                    @update-ratings="updateRatings"
                    @update-others="updateOthers"
                    @update-capacitance="updateCapacitance"
                    @update-dissipation-factor="updateDissipationFactor">
                </configs>
            </div>
        </div>
    </div>
</template>

<script>
import mixin from './mixin'
import capacitorProperty from './components/properties.vue'
import configs from './components/configs.vue'


export default {
    name: 'capacitor',
    components: {
        capacitorProperty,
        configs
    },
    data() {
        return {
            title : 'capacitor',
            parentData : JSON.parse(JSON.stringify(this.parent)),
        }
    },
    mixins : [mixin],
    props: {
        parent : {
            type: Object,
            default: () => ({})
        },
        organisationId: {
            type: String,
            default: ''
        },

        locationId: {
            type: String,
            default: ''
        },
    },
    methods: {
        updateAttachment(attachment) {
            this.attachmentData = attachment
        },
        updateConfigs(configs) {
            console.log('========== updateConfigs called ==========');
            console.log('configs parameter:', JSON.stringify(configs, null, 2));
            console.log('phase_name in configs:', configs.phase_name);
            console.log('Current capacitor.configsData:', JSON.stringify(this.capacitor.configsData, null, 2));
            
            // Backup toàn bộ state trước khi phase thay đổi
            const oldPhase = this.capacitor.configsData ? this.capacitor.configsData.phase : null;
            const newPhase = configs ? configs.phase : null;
            
            // Nếu quay lại phase cũ VÀ phase thực sự thay đổi, restore dữ liệu từ backup
            if (this.capacitorOld && this.capacitorOld.configsData && oldPhase !== newPhase && this.capacitorOld.configsData.phase === newPhase) {
                console.log('Restoring from backup...');
                console.log('Backup phase_name:', this.capacitorOld.configsData.phase_name);
                // Restore toàn bộ configsData, capacitance, dissipationFactor
                this.capacitor.configsData = JSON.parse(JSON.stringify(this.capacitorOld.configsData));
                console.log('Restored phase_name:', this.capacitor.configsData.phase_name);
                this.capacitor.capacitance = JSON.parse(JSON.stringify(this.capacitorOld.capacitance));
                this.capacitor.dissipationFactor = JSON.parse(JSON.stringify(this.capacitorOld.dissipationFactor));
                this.capacitor.ratings = JSON.parse(JSON.stringify(this.capacitorOld.ratings));
                this.capacitor.othersData = JSON.parse(JSON.stringify(this.capacitorOld.othersData));
                return; // Dừng lại, không cần update nữa
            } else if (oldPhase && newPhase && oldPhase !== newPhase) {
                console.log('Phase change - backing up...');
                // Backup toàn bộ capacitor để preserve cả capacitance và dissipationFactor
                this.capacitorOld = JSON.parse(JSON.stringify(this.capacitor));
                // Update phase sau khi backup
                this.capacitor.configsData = configs;
            } else {
                // Không phải phase change, chỉ update configs
                console.log('Direct update - configsData with phase_name:', configs.phase_name);
                // Đảm bảo merge phase_name vào configsData hiện tại
                this.capacitor.configsData = JSON.parse(JSON.stringify(configs));
            }
            console.log('After updateConfigs, capacitor.configsData.phase_name:', this.capacitor.configsData.phase_name);
        },
        updateRatings(ratings) {
            this.capacitor.ratings = ratings;
        },
        updateOthers(others) {
            this.capacitor.othersData = others;
        },
        updateCapacitance(capacitance) {
            this.capacitor.capacitance = capacitance;
        },
        updateDissipationFactor(dissipationFactor) {
            this.capacitor.dissipationFactor = dissipationFactor;
            // Force Vue reactivity by creating new reference
            this.capacitor.dissipationFactor = Object.assign({}, dissipationFactor);
        },
        loadMapForView() {
        },
    }
}
</script>

<style lang="scss" scoped>
#asset {
    width: 100%;
    height: 100%;
}

table,
td,
th {
    border: 1px solid;
}

table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
}

th,
td {
    padding: 0px 10px;
    height: 30px;
}

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

::v-deep .el-input__inner,
::v-deep .el-select .el-input__inner {
  font-size: 12px !important;
}
</style>
