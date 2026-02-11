import Vue from "vue"
import { startLoading } from '@/utils/loading'

export default {
    methods: {
        async handleCircuitConfirm() {
            const { instance, timeoutValue } = startLoading(this, { 
                action: 'add',
                type: 'default' 
            });

            const originalMessage = this.$message;
            let capturedMessages = [];

            this.$message = {
                success: (msg) => { capturedMessages.push({ type: 'success', message: msg }) },
                error: (msg) => { capturedMessages.push({ type: 'error', message: msg }) },
                warning: (msg) => { capturedMessages.push({ type: 'warning', message: msg }) },
                info: (msg) => { capturedMessages.push({ type: 'info', message: msg }) }
            };

            try {
                await new Promise(resolve => setTimeout(resolve, 200));

                const dialogRef = this.$refs.circuitBreakerDialog
                const breaker = dialogRef ? dialogRef.getCircuitBreakerRef() : null
                if (breaker) {
                    const savePromise = breaker.saveAsset();

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

                    this.$message = originalMessage;
                    instance.close();

                    if (capturedMessages.length > 0) {
                        const last = capturedMessages[capturedMessages.length - 1];
                        this.$message[last.type](last.message);
                    }

                    if (success) {
                        this.$message.success('Circuit breaker saved successfully');
                        this.signCircuit = false;
                        this.resetFormAfterSave(breaker);
                        
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const assetData = data.asset || data
                            const newRow = {
                                mrid: assetData.mrid,
                                name: assetData.name || assetData.serial_number || 'Unnamed Circuit Breaker',
                                serial_number: assetData.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Circuit breaker'
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
                    }
                }
            } catch (error) {
                this.$message = originalMessage;
                instance.close();
                this.$message.error(error.message === 'Timeout' ? 'Save timed out' : 'Some error occur');
                console.error(error);
            }
        },
        handleCircuitCancel() {
            this.signCircuit = false
        },
    }
}