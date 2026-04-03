import Vue from "vue"
import { startLoading } from '@/utils/loading'
import * as TransformerMapping from '@/views/Mapping/Transformer/index'

export default {
    methods: {
        async handleTransformerConfirm() {
            if (this.isSaving) return;
            this.isSaving = true;

            const licenseCheck = await window.electronAPI.checkLicense('Transformer');
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
            let transformerRef = null;

            this.$message = {
                success: (msg) => { capturedMessages.push({ type: 'success', message: msg }) },
                error: (msg) => { capturedMessages.push({ type: 'error', message: msg }) },
                warning: (msg) => { capturedMessages.push({ type: 'warning', message: msg }) },
                info: (msg) => { capturedMessages.push({ type: 'info', message: msg }) }
            };

            try {
                // isSaving already set to true above
                await new Promise(resolve => setTimeout(resolve, 200));

                const dialogRef = this.$refs.transformerDialog
                const transformer = dialogRef ? dialogRef.getTransformerRef() : null
                if (transformer) {
                    transformerRef = transformer;
                    const savePromise = transformer.saveAsset();

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
                        if (this.isEditMode) {
                            // 1. Cập nhật node trong cây
                            this.handleUpdateNodeData({
                                mrid: data.asset.mrid,
                                data: data.asset,
                                mode: 'asset',
                                assetType: 'Transformer'
                            });
                            // 2. Fetch entity mới từ DB và reload form (giống Tree Edit)
                            try {
                                const entityRes = await window.electronAPI.getTransformerEntityByMrid(
                                    data.asset.mrid,
                                    data.assetPsr?.mrid
                                );
                                if (entityRes.success && entityRes.data) {
                                    const dto = TransformerMapping.transformerEntityToDto(entityRes.data);
                                    const dialogRef = this.$refs.transformerDialog;
                                    const component = dialogRef ? dialogRef.getComponentRef() : null;
                                    if (component && component.loadData) {
                                        component.loadData(dto);
                                    }
                                }
                            } catch (err) {
                                console.error('Error reloading form after save:', err);
                            }
                        } else {
                            // Thêm node mới vào cây (logic cũ)
                            let newRows = []
                            if (this.organisationClientList && this.organisationClientList.length > 0) {
                                const apparatusId = data.asset.name || data.asset.apparatus_id
                                const newRow = {
                                    mrid: data.asset.mrid,
                                    apparatus_id: apparatusId,
                                    name: apparatusId || data.asset.serial_number || 'Unnamed Transformer',
                                    serial_number: data.asset.serial_number,
                                    parentId: this.parentOrganization.mrid,
                                    parentName: this.parentOrganization.name,
                                    parentArr: this.parentOrganization.parentArr || [],
                                    mode: 'asset',
                                    asset: 'Transformer',
                                    type: data.asset.type
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
                this.$message.success('Transformer saved successfully');
                this.signTransformer = false;
                this.isEditMode = false;
                if (transformerRef) {
                    this.resetFormAfterSave(transformerRef);
                }
            }
            setTimeout(() => {
                this.isSaving = false;
            }, 300);
        },

        handleTransformerCancel() {
            this.signTransformer = false
            const dialogRef = this.$refs.transformerDialog
            const transformer = dialogRef ? dialogRef.getTransformerRef() : null
            if (transformer) {
                this.resetFormAfterSave(transformer)
            }
            this.isEditMode = false
        },
    }
}