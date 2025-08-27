import { BreakerConfiguration } from "@/views/Enum/BreakerConfiguration"
import {BusBarConfiguration} from "@/views/Enum/BusBarConfiguration"
import Bay from "@/views/Cim/Bay/index.js"
import uuid from "@/utils/uuid"

export default {
    data() {
        return {
            properties: new Bay(),
            labelWidth: `150px`,
            breakerConfigList: Object.values(BreakerConfiguration),
            busBarConfigList: Object.values(BusBarConfiguration),
        }
    },
    methods: {
        resetForm() {
            this.properties = new Bay();
        },

        async saveCtrS() {
            const data = await this.saveBay()
            if(data.success) {
                this.$message.success("Bay saved successfully")
            } else {
                this.$message.error("Failed to save Bay")
            }
        },

        loadData(data) {
            this.properties = data;
        },

        loadMapForView() {
        },

        async saveBay() {
            if(this.properties.name === null || this.properties.name === '') {
                this.$message.error("Bay name cannot be empty");
                return;
            } else {
                const data = JSON.parse(JSON.stringify(this.properties));
                const dataResult = this.checkBay(data);
                const result = await window.electronAPI.insertBayEntity(dataResult);
                if (result.success) {
                    return result
                } else {
                    console.error("Failed to save bay:", result);
                    return {
                        success: false,
                    }
                }
            }
        },

        checkBay(data) {
            console.log("Checking bay data:", this.parent);
            if(data.mrid === null || data.mrid === '') {
                data.mrid = uuid.newUuid();
                if(this.parent) {
                    if(this.parent.mode === 'substation') {
                        data.substation = this.parent.mrid;
                    } else if(this.parent.mode === 'voltageLevel') {
                        data.voltage_level = this.parent.mrid;
                    }
                }
                if(data.location === null || data.location === '') {
                    data.location = this.locationId ? this.locationId : null;
                }
            }
            return data;
        },

    },
}