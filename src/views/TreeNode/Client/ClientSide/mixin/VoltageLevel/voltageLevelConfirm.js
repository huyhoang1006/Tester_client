import Vue from "vue"
import { startLoading } from '@/utils/loading'

export default {
    methods: {
        async handleVoltageLevelConfirm() {
            if (this.isSaving) return;
            this.isSaving = true;

            const licenseCheck = await window.electronAPI.checkLicense('Voltage Level');
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
            let voltageLevelRef = null;

            this.$message = {
                success: (msg) => { capturedMessages.push({ type: 'success', message: msg }) },
                error: (msg) => { capturedMessages.push({ type: 'error', message: msg }) },
                warning: (msg) => { capturedMessages.push({ type: 'warning', message: msg }) },
                info: (msg) => { capturedMessages.push({ type: 'info', message: msg }) }
            };

            try {
                // isSaving already set to true above
                await new Promise(resolve => setTimeout(resolve, 200));

                const dialogRef = this.$refs.voltageLevelDialog
                const voltageLevel = dialogRef ? dialogRef.getVoltageLevelRef() : null
                if (voltageLevel) {
                    voltageLevelRef = voltageLevel;
                    const savePromise = voltageLevel.saveVoltageLevel();

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

                    console.log('VoltageLevel save response:', data);
                    if (success) {
                        saveSuccess = true;
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const mrid = data.mrid || data.voltageLevel?.mrid || data.data?.voltageLevel?.mrid
                            const name = data.name || data.voltageLevel?.name || data.data?.voltageLevel?.name || 'Unnamed Voltage Level'

                            console.log('Extracted mrid:', mrid, 'name:', name);

                            const newRow = {
                                mrid: mrid,
                                name: name,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'voltageLevel'
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
                this.$message.success('Voltage Level saved successfully');
                this.signVoltageLevel = false;
                if (voltageLevelRef) {
                    this.resetFormAfterSave(voltageLevelRef);
                }
            }
            setTimeout(() => {
                this.isSaving = false;
            }, 300);
        },
        async handleVoltageLevelCancel() {
            this.signVoltageLevel = false
            const dialogRef = this.$refs.voltageLevelDialog
            const voltageLevel = dialogRef ? dialogRef.getVoltageLevelRef() : null
            if (voltageLevel) {
                this.resetFormAfterSave(voltageLevel)
            }
        },
    }
}
