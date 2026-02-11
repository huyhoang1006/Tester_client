import Vue from "vue"
import { startLoading } from '@/utils/loading'

export default {
    methods: {
        async handleCapacitorConfirm() {
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

                const dialogRef = this.$refs.capacitorDialog
                const capacitor = dialogRef ? dialogRef.getCapacitorRef() : null
                if (capacitor) {
                    const savePromise = capacitor.saveAsset();

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
                        this.$message.success('Capacitor saved successfully');
                        this.signCapacitor = false;
                        this.resetFormAfterSave(capacitor);
                        
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const assetData = data.asset || data
                            const newRow = {
                                mrid: assetData.mrid,
                                name: assetData.name || assetData.serial_number || 'Unnamed Capacitor',
                                serial_number: assetData.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Capacitor'
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
        handleCapacitorCancel() {
            this.signCapacitor = false
        },
    }
}