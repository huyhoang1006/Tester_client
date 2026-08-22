import Vue from "vue"
import { startLoading } from '@/utils/loading'
import * as organisationAPI from '@/api/demo/Organisation'
import { mapDtoToServer } from '@/views/Mapping/ServerToDTO/Organisation'
import { downloadAssetMediaToAttachmentData, uploadAssetMediaFromAttachmentData } from '@/utils/assetMedia'

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
                    const savePromise = this.clientSlide
                        ? org.saveOrganisation()
                        : this.saveOrganisationToServer(org);

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
                        if (this.clientSlide) {
                            await this.markSavedExistingResultDirtyIfChanged(result)
                        }
                        saveSuccess = true;

                        if (!this.clientSlide) {
                            await this.refreshServerParentAfterCreate({
                                id: data.organisation.mrid,
                                mrid: data.organisation.mrid,
                                name: data.organisation.name,
                                parentId: data.organisation.parentId,
                                mode: 'organisation'
                            })
                        } else if (this.organisationClientList && this.organisationClientList.length > 0) {
                            let newRows = []
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
                this.$message.error(error.message === 'Timeout' ? 'Save timed out' : (error.message || 'Some error occur'));
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
                this.$message.success(this.clientSlide
                    ? 'Organisation saved successfully'
                    : 'Organisation created successfully')
                this.signOrg = false
                if (orgRef) {
                    this.resetFormAfterSave(orgRef);
                }
            }
            setTimeout(() => {
                this.isSaving = false;
            }, 300);
        },
        async saveOrganisationToServer(org, serverTab = null) {
            const properties = org && org.properties ? org.properties : {}
            const name = String(properties.name || '').trim()
            if (!name) {
                throw new Error('Name is required')
            }

            const parent = this.parentOrganization || {}
            const parentId = parent.id || parent.mrid || serverTab?.parentId || properties.parentId
            if (!parentId) {
                throw new Error('Cannot resolve parent organisation on server')
            }

            const serverId = serverTab?.id || serverTab?.mrid || properties.organisationId || null

            const dto = JSON.parse(JSON.stringify(properties))
            dto.name = name
            const payload = mapDtoToServer(dto, parentId, serverId)
            const response = await organisationAPI.createOrganisation(payload, parentId)
            const savedServerId = this.extractUploadedServerId(response) || serverId
            if (!savedServerId) {
                throw new Error('Server did not return the new organisation ID')
            }

            const currentAttachments = Array.isArray(org.attachmentData) ? org.attachmentData : []
            let previousAttachments = []
            try {
                previousAttachments = properties.attachment?.path
                    ? JSON.parse(properties.attachment.path)
                    : []
            } catch (error) {
                previousAttachments = []
            }
            await uploadAssetMediaFromAttachmentData(
                'Organisation',
                savedServerId,
                currentAttachments,
                previousAttachments
            )
            const refreshedAttachments = await downloadAssetMediaToAttachmentData('Organisation', savedServerId)
            org.attachmentData = refreshedAttachments
            if (properties.attachment) {
                properties.attachment.path = JSON.stringify(refreshedAttachments)
            }

            return {
                success: true,
                data: {
                    organisation: {
                        mrid: String(savedServerId),
                        name,
                        parentId
                    },
                    raw: response
                }
            }
        },
        async handleOrgCancel() {
            this.signOrg = false
            const dialogRef = this.$refs.organisationDialog
            const org = dialogRef ? dialogRef.getOrganisationRef() : null
            if (org) {
                this.resetFormAfterSave(org)
            }
        },
    }
}
