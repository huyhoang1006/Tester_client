import Vue from "vue"
import { startLoading } from '@/utils/loading'

export default {
    methods: {
        async handleOrgConfirm() {
            if (this.isSaving) return;
            this.isSaving = true;

            const licenseCheck = await window.electronAPI.checkLicense('Organisation');
            if (licenseCheck.success && !licenseCheck.allowed) {
                this.$message.error(licenseCheck.message);
                this.isSaving = false;
                return; 
            }
            const { close, timeoutValue } = startLoading(this, {
                action: 'add',
                type: 'default'
            });

            const originalMessage = this.$message;
            let capturedMessages = [];
            let saveSuccess = false;
            let orgRef = null;

            this.$message = {
                success: (msg) => { capturedMessages.push({ type: 'success', message: msg }) },
                error: (msg) => { capturedMessages.push({ type: 'error', message: msg }) },
                warning: (msg) => { capturedMessages.push({ type: 'warning', message: msg }) },
                info: (msg) => { capturedMessages.push({ type: 'info', message: msg }) }
            };

            try {
                // isSaving already set to true above
                await new Promise(resolve => setTimeout(resolve, 200));

                const dialogRef = this.$refs.organisationDialog
                const org = dialogRef ? dialogRef.getOrganisationRef() : null
                if (org) {
                    orgRef = org;
                    const savePromise = org.saveOrganisation();

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
                            const newRow = {
                                mrid: data.organisation.mrid,
                                name: data.organisation.name || 'Unnamed Organisation',
                                parentId: this.parentOrganization ? this.parentOrganization.mrid : null,
                                parentName: this.parentOrganization ? this.parentOrganization.name : null,
                                parentArr: this.parentOrganization ? (this.parentOrganization.parentArr || []) : [],
                                mode: 'organisation'
                            }
                            newRows.push(newRow)
                            if (this.parentOrganization) {
                                const node = this.findNodeById(this.parentOrganization.mrid, this.organisationClientList)
                                if (node) {
                                    const children = Array.isArray(node.children) ? node.children : []
                                    Vue.set(node, 'children', [...children, ...newRows])
                                }
                            } else {
                                this.organisationClientList.push(newRow)
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
                this.isSaving = false;
                this.$message = originalMessage;
            }

            await close();

            if (capturedMessages.length > 0) {
                const last = capturedMessages[capturedMessages.length - 1];
                this.$message[last.type](last.message);
            }

            if (saveSuccess) {
                this.$message.success('Organisation saved successfully')
                this.signOrg = false
                if (orgRef) {
                    this.resetFormAfterSave(orgRef);
                }
            }
        },
        async handleOrgCancel() {
            this.signOrg = false
        },
    }
}