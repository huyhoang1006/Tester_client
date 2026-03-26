import Vue from "vue"
import { startLoading } from '@/utils/loading'
import * as BreakerMapping from '@/views/Mapping/Breaker/index'
export default {
    methods: {
        async handleCircuitConfirm() {
            if (this.isSaving) return;
            this.isSaving = true;

            const licenseCheck = await window.electronAPI.checkLicense('Circuit breaker');
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
            let breakerRef = null;

            this.$message = {
                success: (msg) => { capturedMessages.push({ type: 'success', message: msg }) },
                error: (msg) => { capturedMessages.push({ type: 'error', message: msg }) },
                warning: (msg) => { capturedMessages.push({ type: 'warning', message: msg }) },
                info: (msg) => { capturedMessages.push({ type: 'info', message: msg }) }
            };

            try {
                // isSaving already set to true above
                await new Promise(resolve => setTimeout(resolve, 200));

                const dialogRef = this.$refs.circuitBreakerDialog
                const breaker = dialogRef ? dialogRef.getCircuitBreakerRef() : null
                if (breaker) {
                    breakerRef = breaker;
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
                    if (success) {
                        saveSuccess = true;
                        const assetData = data.asset || data
                        if (this.isEditMode) {
                            this.handleUpdateNodeData({
                                mrid: assetData.mrid,
                                data: assetData,
                                mode: 'asset',
                                assetType: 'Circuit breaker'
                            });
                            try {
                                const entityRes = await window.electronAPI.getBreakerEntityByMrid(
                                    assetData.mrid,
                                    data.assetPsr?.mrid
                                );
                                if (entityRes.success && entityRes.data) {
                                    const dto = BreakerMapping.breakerEntityToDto(entityRes.data);
                                    const dialogRef = this.$refs.circuitBreakerDialog;
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
                                const apparatusId = assetData.name || assetData.apparatus_id
                                const newRow = {
                                    mrid: assetData.mrid,
                                    apparatus_id: apparatusId,
                                    name: apparatusId || assetData.serial_number || 'Unnamed Circuit Breaker',
                                    serial_number: assetData.serial_number,
                                    parentId: this.parentOrganization.mrid,
                                    parentName: this.parentOrganization.name,
                                    parentArr: this.parentOrganization.parentArr || [],
                                    mode: 'asset',
                                    asset: 'Circuit breaker',
                                    type: assetData.type
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
                this.$message.success('Circuit breaker saved successfully');
                this.signCircuit = false;
                this.isEditMode = false;
                if (breakerRef) {
                    this.resetFormAfterSave(breakerRef);
                }
            }
        },
        handleCircuitCancel() {
            this.signCircuit = false
            this.isEditMode = false
        },
    }
}