import Vue from "vue"
import { startLoading } from '@/utils/loading'
import * as BushingMapping from '@/views/Mapping/Bushing/index'

export default {
    methods: {
        async handleBushingConfirm() {
            if (this.isSaving) return;
            this.isSaving = true;

            const licenseCheck = await window.electronAPI.checkLicense('Bushing');
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
            let bushingRef = null;

            this.$message = {
                success: (msg) => { capturedMessages.push({ type: 'success', message: msg }) },
                error: (msg) => { capturedMessages.push({ type: 'error', message: msg }) },
                warning: (msg) => { capturedMessages.push({ type: 'warning', message: msg }) },
                info: (msg) => { capturedMessages.push({ type: 'info', message: msg }) }
            };

            try {
                // isSaving already set to true above
                await new Promise(resolve => setTimeout(resolve, 200));

                const dialogRef = this.$refs.bushingDialog
                const bushing = dialogRef ? dialogRef.getBushingRef() : null
                if (bushing) {
                    bushingRef = bushing;
                    const savePromise = bushing.saveAsset();

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
                        const bushingData = data.bushing
                        if (this.isEditMode) {
                            this.handleUpdateNodeData({
                                mrid: bushingData.mrid,
                                data: bushingData,
                                mode: 'asset',
                                assetType: 'Bushing'
                            });
                            try {
                                const entityRes = await window.electronAPI.getBushingEntityByMrid(
                                    bushingData.mrid,
                                    data.assetPsr?.mrid
                                );
                                if (entityRes.success && entityRes.data) {
                                    const dto = BushingMapping.bushingEntityToDto(entityRes.data);
                                    const dialogRef = this.$refs.bushingDialog;
                                    const component = dialogRef ? dialogRef.getComponentRef() : null;
                                    if (component && component.loadData) {
                                        component.loadData(dto);
                                    }
                                }
                            } catch (err) {
                                console.error('Error reloading form after save:', err);
                            }
                        } else {
                            let newRows = []
                            if (this.organisationClientList && this.organisationClientList.length > 0) {
                                const apparatusId = bushingData.name || bushingData.apparatus_id
                                const newRow = {
                                    mrid: bushingData.mrid,
                                    apparatus_id: apparatusId,
                                    name: apparatusId || bushingData.serial_number || 'Unnamed Bushing',
                                    serial_number: bushingData.serial_number,
                                    parentId: this.parentOrganization.mrid,
                                    parentName: this.parentOrganization.name,
                                    parentArr: this.parentOrganization.parentArr || [],
                                    mode: 'asset',
                                    asset: 'Bushing'
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
                this.$message.success('Bushing saved successfully');
                this.signBushing = false;
                this.isEditMode = false;
                if (bushingRef) {
                    this.resetFormAfterSave(bushingRef);
                }
            }
        },
        handleBushingCancel() {
            this.signBushing = false
            this.isEditMode = false
        },

    }
}
