import Vue from "vue"
import { startLoading } from '@/utils/loading'

export default {
    methods: {
        async handleBayConfirm() {
            const licenseCheck = await window.electronAPI.checkLicense('Bay');
            if (licenseCheck.success && !licenseCheck.allowed) {
                this.$message.error(licenseCheck.message);
                return;
            }
            const { close, timeoutValue } = startLoading(this, {
                action: 'add',
                type: 'default'
            });

            // Intercept messages để hiển thị sau khi loading đóng
            const originalMessage = this.$message;
            let capturedMessages = [];

            this.$message = {
                success: (msg) => { capturedMessages.push({ type: 'success', message: msg }) },
                error: (msg) => { capturedMessages.push({ type: 'error', message: msg }) },
                warning: (msg) => { capturedMessages.push({ type: 'warning', message: msg }) },
                info: (msg) => { capturedMessages.push({ type: 'info', message: msg }) }
            };

            try {
                // Delay 0.2s để loading hiển thị trước khi bắt đầu save
                await new Promise(resolve => setTimeout(resolve, 200));

                const dialogRef = this.$refs.bayDialog
                const bay = dialogRef ? dialogRef.getBayRef() : null
                if (bay) {
                    const savePromise = bay.saveBay();

                    // Xử lý timeout nếu có
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

                    // Restore message
                    this.$message = originalMessage;

                    // Hiển thị messages sau khi loading đã đóng
                    if (capturedMessages.length > 0) {
                        const last = capturedMessages[capturedMessages.length - 1];
                        this.$message[last.type](last.message);
                    }

                    if (success) {
                        this.$message.success('Bay saved successfully');
                        this.signBay = false;

                        // Reset form after successful save
                        this.resetFormAfterSave(bay);

                        let newRows = []
                        if (this.organisationClientList && this.organisationClientList.length > 0) {
                            const newRow = {
                                mrid: data.mrid,
                                name: data.name || 'Unnamed Bay',
                                parentId: this.parentOrganization.mrid,
                                parentName: this.parentOrganization.name,
                                parentArr: this.parentOrganization.parentArr || [],
                                mode: 'bay'
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
        async handleBayCancel() {
            this.signBay = false
        },

    }
}