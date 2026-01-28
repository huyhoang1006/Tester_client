import Vue from "vue"
export default {
    methods: {
        async handleJobConfirm() {
            try {
                const dialogRef = this.$refs.jobDialog
                const jobData = dialogRef ? dialogRef.getJobDataRef() : null
                if (jobData) {
                    const { success, data } = await jobData.saveJob()
                    if (success) {
                        this.$message.success('Job saved successfully')
                        this.signJob = false
                        
                        // Reset form after successful save
                        this.resetFormAfterSave(jobData)
                        
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            let jobType = ''
                            // Xác định loại job dựa vào checkJobType
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
                            } else {
                                jobType = 'Job'
                            }
                            
                            // Handle different data structures - check for oldWork or job
                            const jobData = data.oldWork || data.job || data
                            const newRow = {
                                mrid: jobData.mrid,
                                name: jobData.name || `Unnamed ${jobType} Job`,
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
                        this.$message.error('Failed to save job')
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