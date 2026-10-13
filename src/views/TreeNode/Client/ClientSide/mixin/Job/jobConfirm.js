import Vue from "vue"
import { startLoading } from '@/utils/loading'

export default {
    methods: {
        async handleJobConfirm() {
            if (this.isSaving) return;
            this.isSaving = true;

            const { close, timeoutValue } = startLoading(this, { 
                action: 'add',
                type: 'default'
            });

            const originalMessage = this.$message;
            let capturedMessages = [];
            let saveSuccess = false;
            let jobDataRef = null;

            this.$message = {
                success: (msg) => { capturedMessages.push({ type: 'success', message: msg }) },
                error: (msg) => { capturedMessages.push({ type: 'error', message: msg }) },
                warning: (msg) => { capturedMessages.push({ type: 'warning', message: msg }) },
                info: (msg) => { capturedMessages.push({ type: 'info', message: msg }) }
            };

            try {
                // isSaving already set to true above
                await new Promise(resolve => setTimeout(resolve, 200));

                const dialogRef = this.$refs.jobDialog
                const jobData = dialogRef ? dialogRef.getJobDataRef() : null
                if (jobData) {
                    jobDataRef = jobData;
                    const dtoKey = Object.keys(jobData.$data || {}).find(key => /JobDto$/.test(key) && !/Old$/.test(key))
                    const dto = dtoKey ? jobData[dtoKey] : null
                    if (!dto || !Array.isArray(dto.testList) || dto.testList.length === 0) {
                        throw new Error('Select at least one test')
                    }
                    const savePromise = jobData.saveJob();

                    let result;
                    if (timeoutValue > 0) {
                        const timeoutPromise = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error('Timeout')), timeoutValue)
                        );
                        result = await Promise.race([savePromise, timeoutPromise]);
                    } else {
                        result = await savePromise;
                    }

                    const { success, data } = result;
                    console.log('Save result:', result);

                    if (success) {
                        await this.markSavedExistingResultDirtyIfChanged(result)
                        saveSuccess = true;

                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            let jobType = ''
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
                            } else if (this.checkJobType === 'JobBushing') {
                                jobType = 'Bushing'
                            } else if (this.checkJobType === 'JobCapacitor') {
                                jobType = 'Capacitor'
                            } else if (this.checkJobType === 'JobReactor') {
                                jobType = 'Reactor'
                            } else if(this.checkJobType === 'JobRotatingMachine') {
                                jobType = 'Rotating machine'
                            } else {
                                jobType = 'Job'
                            }

                            const savedWork = data.oldWork || data.job || data
                            const tasksResponse = await window.electronAPI.getWorkTasksByWorkId(savedWork.mrid)
                            const tasks = tasksResponse && Array.isArray(tasksResponse.data) ? tasksResponse.data : []
                            newRows = tasks.map(task => ({
                                ...savedWork,
                                ...task,
                                mrid: task.mrid,
                                workMrid: savedWork.mrid,
                                workName: savedWork.name,
                                name: task.name || task.title || task.type || 'Unnamed test',
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                execution_date: task.testing_date || task.testingDate || savedWork.execution_date,
                                tested_by: task.tested_by || task.testedBy || savedWork.tested_by,
                                mode: 'test',
                                job: jobType
                            }))
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList)
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : []
                                const newIds = new Set(newRows.map(row => row.mrid))
                                Vue.set(node, 'children', [...children.filter(child => !newIds.has(child.mrid)), ...newRows])
                            }
                        }
                    }
                }
            } catch (error) {
                this.$message = originalMessage;
                await close();
                this.$message.error(error.message === 'Timeout' ? 'Save timed out' : 'Some error occur');
                console.error(error);
                this.isSaving = false;
                return;
            } finally {
                this.$message = originalMessage;
            }

            await close();

            if (capturedMessages.length > 0) {
                const last = capturedMessages[capturedMessages.length - 1];
                this.$message[last.type](last.message);
            }

            if (saveSuccess) {
                this.$message.success('Test saved successfully');
                this.signJob = false;
                if (jobDataRef) {
                    this.resetFormAfterSave(jobDataRef);
                }
            }
            setTimeout(() => {
                this.isSaving = false;
            }, 300);
        },
        handleJobCancel() {
            this.signJob = false
            const dialogRef = this.$refs.jobDialog
            const jobData = dialogRef ? dialogRef.getJobDataRef() : null
            if (jobData) {
                this.resetFormAfterSave(jobData)
            }
        },
    }
}
