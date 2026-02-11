import Vue from "vue"
import { startLoading } from '@/utils/loading'

export default {
    methods: {
        async handleTransformerConfirm() {
            const { close, timeoutValue } = startLoading(this, { 
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

                const dialogRef = this.$refs.transformerDialog
                const transformer = dialogRef ? dialogRef.getTransformerRef() : null
                if (transformer) {
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

                    this.$message = originalMessage;

                    if (capturedMessages.length > 0) {
                        const last = capturedMessages[capturedMessages.length - 1];
                        this.$message[last.type](last.message);
                    }

                    if (success) {
                        this.$message.success('Transformer saved successfully');
                        this.signTransformer = false;
                        this.resetFormAfterSave(transformer);
                        
                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.asset.mrid,
                                name: data.asset.name || data.asset.serial_number || 'Unnamed Transformer',
                                serial_number: data.asset.serial_number,
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'asset',
                                asset: 'Transformer'
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
                this.$message.error(error.message === 'Timeout' ? 'Save timed out' : 'Some error occur');
                console.error(error);
            } finally {
                // Đảm bảo loading luôn được đóng
                close();
            }
        },

        handleTransformerCancel() {
            this.signTransformer = false
        },
    }
}