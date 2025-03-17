import {mapState} from 'vuex'
import loader from "@/utils/preload"


export default {
    data() {
        return {
            properties: {
                id: '',
                name: '',
                work_order: '',
                creation_date: '',
                execution_date: '',
                tested_by: '',
                approved_by: '',
                approval_date: '',
                summary: '',
                ambient_condition: '',
                testing_method: '',
                standard: ''
            },
            location: {
                id: '',
                name: '',
                address: '',
                city: '',
                state_province: '',
                postal_code: '',
                country: ''
            },
            asset: {
                id: '',
                asset: '',
                asset_type: '',
                serial_number: '',
                manufacturer: ''
            },
            testList: [],
            listHeal : [],
        }
    },
    computed: {
        ...mapState(['selectedAsset', 'selectedJob']),
    },
    async beforeMount() {
        loader.loaderStart()
        await this.getLocationAssetCircuit()
        this.mode = this.$route.query.mode
        if (this.mode === this.$constant.EDIT || this.mode === this.$constant.DUP) {
            this.job_id = this.$route.query.job_id
            const rs = await window.electronAPI.getJobCircuitById(this.job_id)
            if (rs.success) {
                const data = rs.data
                const {job, testList} = data
                if (this.mode === this.$constant.DUP) {
                    job.id = ''
                    job.name = ''
                }
                this.properties = job
                for(let j in testList) {
                    let element = testList[j]
                    element.data = JSON.parse(element.data)
                    let condition = await window.electronAPI.getTestingCondition(element.id)
                    console.log(condition)
                    let attachment = await window.electronAPI.getAllAttachment(element.id, "test")
                    if(condition.data.length == 0) {
                        this.testconditionArr.push({
                            condition : { 
                                top_oil_temperature : "",
                                bottom_oil_temperature : "",
                                winding_temperature : "",
                                reference_temperature : "",
                                ambient_temperature : "",
                                humidity : "",
                                weather : ""
                            },
                            equipment : [{
                                model : "",
                                serial_no : "",
                                calibration_date : ""
                        
                            }],
                            comment : "",
                        })
                    }
                    else {
                        condition.data.forEach(async (e) => {
                            e.condition = await JSON.parse(e.condition)
                            e.equipment = await JSON.parse(e.equipment)
                            if (this.mode == this.$constant.DUP) {
                                e.id = ''
                            }
                            this.testconditionArr.push(e)
                        });
                    }
                    if(attachment.data.length == 0) {
                        this.attachmentArr.push([])
                    }
                    else {
                        attachment.data.forEach(async (e) => {
                            e.name = await JSON.parse(e.name)
                            if (this.mode == this.$constant.DUP) {
                                e.id = ''
                            }
                            this.attachmentArr.push(e.name)
                        })
                    }
                    if (this.mode == this.$constant.DUP) {
                        element.id = this.$uuid.EMPTY
                    }
                }
                this.testList = testList
            }
        }
        loader.loaderEnd()
    },
    methods: {
        async getLocationAssetCircuit() {
            const assetId = this.selectedAsset[0].id
            const rs = await window.electronAPI.getLocationAssetByIdCircuit(assetId)
            if (rs.success) {
                const data = rs.data
                const {asset, location} = data
                this.location = location
                this.asset = Object.assign(asset,(JSON.parse(asset.properties)))
                       
            } else {
                this.$message.error(rs.message)
            }
        },
        backToManage() {
            this.$confirm('Do you want to exit?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(async () => {
                    this.$router.push({name: 'manage'})
                })
                .catch(() => {
                    return
                })
        },
        async saveJob() {
            if (this.mode === this.$constant.ADD || this.mode === this.$constant.DUP) {
                await this.insertJobdata()
            } else {
                this.updateJobdata()
            }
        },
        async insertJobdata() {
            loader.loaderStart()
            console.log(this.testconditionArr)
            const rs = await window.electronAPI.insertJobdata(
                this.selectedAsset[0].id, this.properties, this.testList, this.testconditionArr, this.attachmentArr)
            loader.loaderEnd()
            if (rs.success) {
                this.$message({
                    type: 'success',
                    message: 'Insert completed'
                })
                this.$router.push({name: 'manage'})
            } else {
                this.$message.error(rs.message)
            }
        },
        async updateJobdata() {
            loader.loaderStart()
            const rs = await window.electronAPI.updateJobdata(this.properties, this.testList, this.testconditionArr, this.attachmentArr)
            if (rs.success) {
                this.$message({
                    type: 'success',
                    message: 'Update completed'
                })
                const rs = await window.electronAPI.getJobCircuitById(this.job_id)
                if (rs.success) {
                    const data = rs.data
                    const {testList} = data
                    this.testconditionArr = []
                    testList.forEach(async (element) => {
                        element.data = JSON.parse(element.data)
                        let condition = await window.electronAPI.getTestingCondition(element.id)
                        if(condition.data.length == 0) {
                            this.testconditionArr.push({
                                condition : { 
                                    top_oil_temperature : "",
                                    bottom_oil_temperature : "",
                                    winding_temperature : "",
                                    reference_temperature : "",
                                    ambient_temperature : "",
                                    humidity : "",
                                    weather : ""
                                },
                                equipment : [{
                                    model : "",
                                    serial_no : "",
                                    calibration_date : ""
                            
                                }],
                                comment : "",
                            })
                            this.attachmentArr.push([])
                        }
                        else {
                            condition.data.forEach(async (e) => {
                                e.condition = await JSON.parse(e.condition)
                                e.equipment = await JSON.parse(e.equipment)
                                this.testconditionArr.push(e)
                            });
                        }
                    })
                    this.testList = testList
                } else {
                    this.$message.error(rs.message)
                }
            } else {
                this.$message.error(rs.message)
            }
            loader.loaderEnd()
        }
    }
}
