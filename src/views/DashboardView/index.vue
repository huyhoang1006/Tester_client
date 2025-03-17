<template>
    <div id="dashboard">
        <el-row id="top-bar">
            <el-col :span="24">
                <router-link :to="{name: 'home'}">
                    <el-button style="box-sizing: border-box; border-right: 1px solid #aeb6bf">
                        <i class="fa-solid fa-circle-arrow-left display-block fa-2x"></i>
                        <div class="mgt-10">Home</div>
                    </el-button>
                </router-link>
                <el-button style="float: right; text-align: right; width: fit-content; cursor: default">
                    <img src="@/assets/images/logo.png" style="max-height: 40px" />
                </el-button>
            </el-col>
        </el-row>
        <el-row :gutter="5" id="main-content">
            <el-input
                @input="search"
                style="width: 500px"
                v-model="inputData"
                class="mgt-10"
                size="small"
                placeholder="Search for names.."
                title="Type in a name">
                <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
            <table class="mgt-10 table-strip-input-data" style="width: 3000px">
                <thead>
                    <tr>
                        <th>Serial no.</th>
                        <th>S (kVA)</th>
                        <th>Q (kVAr)</th>
                        <th>Voltage regulation</th>
                        <th>Vector group</th>
                        <th>Date of warehouse receipt</th>
                        <th>Transformer type</th>
                        <th>Standard</th>
                        <th>Oil type</th>
                        <th>HV bushing</th>
                        <th>Customer</th>
                        <th>Province/ City</th>
                        <th>Date of delivery</th>
                        <th>Date of Production order note</th>
                        <th>Type of winding</th>
                        <th>Thermal meter</th>
                        <th>Note</th>
                        <th>Po</th>
                        <th>Io</th>
                        <th>Pk</th>
                        <th>Uk</th>
                        <th>Inappropriate content</th>
                        <th>Result</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in information_data" :key="index">
                        <td>{{ item.serial_no }}</td>
                        <td>{{ item.s_k }}</td>
                        <td>{{ item.q_k }}</td>
                        <td>{{ item.voltage_regulation }}</td>
                        <td>{{ item.vector_group }}</td>
                        <td>{{ item.dateWarehouseReceipt }}</td>
                        <td>{{ item.trans_type }}</td>
                        <td>{{ item.standard }}</td>
                        <td>{{ item.oil_type }}</td>
                        <td>{{ item.hv_bushing }}</td>
                        <td>{{ item.customer }}</td>
                        <td>{{ item.province_city }}</td>
                        <td>{{ item.dateDelivery }}</td>
                        <td>{{ item.DateProductionOrder }}</td>
                        <td>{{ item.type_winding }}</td>
                        <td>{{ item.thermal_meter }}</td>
                        <td>{{ item.note }}</td>
                        <td>{{ item.po }}</td>
                        <td>{{ item.io }}</td>
                        <td>{{ item.pk }}</td>
                        <td>{{ item.uk }}</td>
                        <td>{{ item.inappropriate_content }}</td>
                        <td>{{ item.result }}</td>
                    </tr>
                </tbody>
            </table>
        </el-row>
    </div>
</template>

<script>
export default {
    name: 'DashboardView',
    data() {
        return {
            inputData: '',
            information: [],
            information_data: [],
            rowInfor: {
                serial_no: '',
                s_k: '',
                q_k: '',
                voltage_regulation: '',
                vector_group: '',
                dateWarehouseReceipt: '',
                trans_type: '',
                standard: '',
                oil_type: '',
                hv_bushing: '',
                customer: '',
                province_city: '',
                dateDelivery: '',
                DateProductionOrder: '',
                type_winding: '',
                thermal_meter: '',
                note: '',
                po: '',
                io: '',
                pk: '',
                uk: '',
                inappropriate_content: '',
                result: ''
            }
        }
    },
    async beforeMount() {
        const data = await window.electronAPI.getAllInforAsset()
        const bushing = []
        const location = []
        const test_MeasurementOfNoLoad = []
        const test_MeasurementOfShortCircuit = []
        if (data.length !== 0) {
            for (const index in data) {
                const a = await window.electronAPI.getBushingsByAssetId(data[index].id)
                const l = await window.electronAPI.getLocationByAssetId(data[index].id)
                const test_NoLoad = await window.electronAPI.getTestbyAssetId(data[index].id, 6)
                const test_Circuit = await window.electronAPI.getTestbyAssetId(data[index].id, 7)
                bushing.push(a)
                location.push(l)
                test_MeasurementOfNoLoad.push(test_NoLoad)
                test_MeasurementOfShortCircuit.push(test_Circuit)
            }
        }

        data.forEach((item, index) => {
            const row = {
                serial_no: '',
                s_k: '',
                q_k: '',
                voltage_regulation: '',
                vector_group: '',
                dateWarehouseReceipt: '',
                trans_type: '',
                standard: '',
                oil_type: '',
                hv_bushing: '',
                customer: '',
                province_city: '',
                dateDelivery: '',
                DateProductionOrder: '',
                type_winding: '',
                thermal_meter: '',
                note: '',
                po: '',
                io: '',
                pk: '',
                uk: '',
                inappropriate_content: '',
                result: ''
            }
            row.serial_no = item.serial_no
            if (item.power_ratings.toString() === '[]') {
                row.s_k = ''
            } else {
                if (JSON.parse(item.power_ratings).length !== 0) {
                    if (JSON.parse(item.power_ratings)[0].rated_power.unit === 'kVA') {
                        row.s_k = JSON.parse(item.power_ratings)[0].rated_power.value
                    } else {
                        row.s_k = JSON.parse(item.power_ratings)[0].rated_power.value + '(' + JSON.parse(item.power_ratings)[0].rated_power.unit === 'kVA' + ')'
                    }
                }
            }
            const voltage_ratings = JSON.parse(item.voltage_ratings)
            if (voltage_ratings.toString === '[]') {
                row.q_k = ''
            } else if (voltage_ratings.length !== 0) {
                let arr = []
                let voltage_ratings_prim = voltage_ratings.filter((item) => item.winding === 'Prim')
                if (voltage_ratings_prim.length !== 0) {
                    for (const index in voltage_ratings_prim) {
                        if (voltage_ratings_prim[index].voltage_ll.unit === 'kV') {
                            arr.push(voltage_ratings_prim[index].voltage_ll.value)
                        } else {
                            arr.push(voltage_ratings_prim[index].voltage_ll.value + '(V)')
                        }
                    }
                }
                let voltage_ratings_sec = voltage_ratings.filter((item) => item.winding === 'Sec')
                if (voltage_ratings_sec.length !== 0) {
                    for (const index in voltage_ratings_sec) {
                        if (voltage_ratings_sec[index].voltage_ll.unit === 'kV') {
                            arr.push(voltage_ratings_sec[index].voltage_ll.value)
                        } else {
                            arr.push(voltage_ratings_sec[index].voltage_ll.value + '(V)')
                        }
                    }
                }

                row.q_k = arr.join('/')
            }
            row.vector_group = item.vector_group_custom
            const voltage_regulation = JSON.parse(item.voltage_regulation)
            if (voltage_regulation.length !== 0) {
                let arr = []
                let voltage_regulation_prim = voltage_regulation.filter((item) => item.winding === 'Prim')
                if (voltage_regulation_prim.length !== 0) {
                    for (const index in voltage_regulation_prim) {
                        arr.push(voltage_regulation_prim[index].voltage_regulation)
                    }
                }
                let voltage_ratings_sec = voltage_regulation.filter((item) => item.winding === 'Sec')
                if (voltage_ratings_sec.length !== 0) {
                    for (const index in voltage_ratings_sec) {
                        arr.push(voltage_ratings_sec[index].voltage_regulation)
                    }
                }
                row.voltage_regulation = arr.filter((item) => item !== '').join('/')
            }
            row.dateWarehouseReceipt = item.date_of_warehouse_receipt
            row.trans_type = item.asset_type
            row.standard = item.standard
            row.oil_type = item.oil_type
            const hv_bushing_data = JSON.parse(bushing[index].data.manufacturer_type).prim
            const hv_bushing = Object.values(hv_bushing_data)
                .filter((item) => item !== '')
                .join('/')
            row.hv_bushing = hv_bushing
            row.customer = location[index].data.company_company
            row.province_city = location[index].data.company_state_province
            row.dateDelivery = item.date_of_delivery
            row.DateProductionOrder = item.date_of_production_order
            row.type_winding = item.phases
            row.thermal_meter = item.Thermal_meter
            row.note = item.comment

            //po
            if (test_MeasurementOfNoLoad[index].success === false) {
                row.po = ''
            } else if (test_MeasurementOfNoLoad[index].data.length === 0) {
                row.po = ''
            } else {
                row.po = JSON.parse(test_MeasurementOfNoLoad[index].data[0][0].data).no_load_loss.result
            }

            //io
            if (test_MeasurementOfNoLoad[index].success === false) {
                row.io = ''
            } else if (test_MeasurementOfNoLoad[index].data.length === 0) {
                row.io = ''
            } else {
                row.io = JSON.parse(test_MeasurementOfNoLoad[index].data[0][0].data).no_load_current.result
            }

            //pk
            if (test_MeasurementOfShortCircuit[index].success === false) {
                row.pk = ''
            } else if (test_MeasurementOfShortCircuit[index].data.length === 0) {
                row.pk = ''
            } else {
                row.pk = JSON.parse(test_MeasurementOfShortCircuit[index].data[0][0].data).load_loss.result
            }

            //uk
            if (test_MeasurementOfShortCircuit[index].success === false) {
                row.uk = ''
            } else if (test_MeasurementOfShortCircuit[index].data.length === 0) {
                row.uk = ''
            } else {
                row.uk = JSON.parse(test_MeasurementOfShortCircuit[index].data[0][0].data).short_circuit_impedance.result
            }
            row.inappropriate_content = ''
            row.result = ''
            this.information.push(row)
        })
    },
    mounted() {
        this.information_data = this.information
    },
    destroyed() {},
    methods: {
        search() {
            if (this.inputData === '') {
                this.information_data = this.information
            } else {
                const filter = this.information.filter(
                    (item) =>
                        item.serial_no?.includes(this.inputData) ||
                        item.s_k?.includes(this.inputData) ||
                        item.q_k?.includes(this.inputData) ||
                        item.voltage_regulation?.includes(this.inputData) ||
                        item.vector_group?.includes(this.inputData) ||
                        item.hv_bushing?.includes(this.inputData) ||
                        item.type_winding?.includes(this.inputData) ||
                        item.pk?.includes(this.inputData) ||
                        item.dateWarehouseReceipt?.includes(this.inputData) ||
                        item.customer?.includes(this.inputData) ||
                        item.thermal_meter?.includes(this.inputData) ||
                        item.uk?.includes(this.inputData) ||
                        item.trans_type?.includes(this.inputData) ||
                        item.province_city?.includes(this.inputData) ||
                        item.note?.includes(this.inputData) ||
                        item.inappropriate_content?.includes(this.inputData) ||
                        item.standard?.includes(this.inputData) ||
                        item.dateDelivery?.includes(this.inputData) ||
                        item.po?.includes(this.inputData) ||
                        item.result?.includes(this.inputData) ||
                        item.oil_type?.includes(this.inputData) ||
                        item.DateProductionOrder?.includes(this.inputData) ||
                        item.io?.includes(this.inputData)
                )
                this.information_data = filter
            }
        }
    },
    computed: {}
}
</script>

<style lang="scss" scoped>
#dashboard {
    width: 100%;
    height: 100%;
}
</style>
