import Vue from "vue"
import { startLoading } from '@/utils/loading'

export default {
    methods: {
        async handleSurgeConfirm() {
            const licenseCheck = await window.electronAPI.checkLicense('Surge Arrester');
            if (licenseCheck.success && !licenseCheck.allowed) {
                this.$message.error(licenseCheck.message);
                return;
            }
            const { close, timeoutValue } = startLoading(this, {
                action: 'add',
                type: 'default'
            });

            const originalMessage = this.$message;
            let capturedMessages = [];
            let saveSuccess = false;
            let surgeRef = null;

            this.$message = {
                success: (msg) => { capturedMessages.push({ type: 'success', message: msg }) },
                error: (msg) => { capturedMessages.push({ type: 'error', message: msg }) },
                warning: (msg) => { capturedMessages.push({ type: 'warning', message: msg }) },
                info: (msg) => { capturedMessages.push({ type: 'info', message: msg }) }
            };

            try {
                await new Promise(resolve => setTimeout(resolve, 200));

                const dialogRef = this.$refs.surgeArresterDialog
                const surgeArrester = dialogRef ? dialogRef.getSurgeArresterRef() : null
                if (surgeArrester) {
                    surgeRef = surgeArrester;
                    const savePromise = surgeArrester.saveAsset();

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

                    if (success) {
                        saveSuccess = true;
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const assetData = data.asset || data.surgeArrester || data
                            const newRow = {
                                mrid: assetData.mrid,
                                name: assetData.name || assetData.serial_number || 'Unnamed Surge Arrester',
                                serial_number: assetData.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Surge arrester'
                            }
                            newRows.push(newRow)
                            const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList)
                            if (node) {
                                const children = Array.isArray(node.children) ? node.children : []
                                Vue.set(node, 'children', [...children, ...newRows])
                            }
                        }
                    }
                }
            } catch (error) {
                this.$message = originalMessage;
                await close();
                this.$message.error(error.message === 'Timeout' ? 'Save timed out' : 'Some error occur');
                console.error(error);
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
                this.$message.success('Surge Arrester saved successfully');
                this.signSurge = false;
                if (surgeRef) {
                    this.resetFormAfterSave(surgeRef);
                }
            }
        },
        handleSurgeCancel() {
            this.signSurge = false
        },
    }
}