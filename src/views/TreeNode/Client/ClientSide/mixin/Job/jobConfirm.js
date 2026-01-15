import Vue from "vue"
export default {
    methods: {
        async handleJobConfirm() {
            try {
                const job = this.$refs.jobData
                if (job) {
                    const { success, data } = await job.saveJob()
                    if (success) {
                        this.$message.success('Job saved successfully')
                        this.signJob = false
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            let jobType = ''
                            // Xác định loại job, ví dụ dựa vào checkJobType hoặc assetData
                            if (this.checkJobType === 'JobSurgeArrester') {
                                jobType = 'Surge arrester'
                            } else if (this.checkJobType === 'JobPowerCable') {
                                jobType = 'Power cable'
                            } else if (this.checkJobType === 'JobDisconnector') {
                                jobType = 'Disconnector'
                            } else if (this.checkJobType === 'JobCurrentTransformer') {
                                jobType = 'Current transformer'
                            } else if (this.checkJobType === 'JobVoltageTransformer') {
                                jobType = 'Voltage transformer'
                            } else if (this.checkJobType === 'JobCircuitBreaker') {
                                jobType = 'Circuit breaker'
                            } else if (this.checkJobType === 'JobTransformer') {
                                jobType = 'Transformer'
                            }
                            const newRow = {
                                mrid: data.oldWork.mrid,
                                name: data.oldWork.name,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'job',
                                job: jobType
                            }
                            newRows.push(newRow)
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList)
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : []
                                Vue.set(node, 'children', [...children, ...newRows])
                            } else {
                                this.$message.error('Parent node not found in tree')
                            }
                        }
                    } else {
                        this.$message.error('Failed to save Job')
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
        handleJobCancel() {
            this.signJob = false
        },
    }
}