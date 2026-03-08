import * as demoAPI from '@/api/demo/index.js'
import * as PowerCableMapping from '@/views/Mapping/PowerCable/index'
import * as PowerCableServerMapper from '@/views/Mapping/ServerToDTO/PowerCable/index.js'
import { mapSubstationEntityToServer } from '@/utils/MapperClient/mapSubstationToServer.js'
import { mapVoltageLevelEntityToServer } from '@/utils/MapperClient/mapVoltageLevelToServer.js'
import { mapBayEntityToServer } from '@/utils/MapperClient/mapBayToServer.js'
import { mapTransformerEntityToServer } from '@/utils/MapperClient/mapTransformerToServer.js'

export default {
    methods: {
        async handleUploadNode() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a node to upload');
                return;
            }
            const node = this.selectedNodes[this.selectedNodes.length - 1];
            if (!node.parentId) {
                this.$message.error('Cannot upload root node. Please select a child node with parent.');
                return;
            }
            if (node.mode === 'substation') {
                this.$confirm(`Upload Substation "${node.name}" to Server?`, 'Confirm Upload', {
                    confirmButtonText: 'Upload',
                    cancelButtonText: 'Cancel',
                    type: 'info'
                }).then(async () => {
                    await this.processUploadSubstation(node);
                }).catch(() => { });
            } else if (node.mode === 'voltageLevel') {
                this.$confirm(`Upload VoltageLevel "${node.name}" to Server?`, 'Confirm Upload', {
                    confirmButtonText: 'Upload',
                    cancelButtonText: 'Cancel',
                    type: 'info'
                }).then(async () => {
                    await this.processUploadVoltageLevel(node);
                }).catch(() => { });
            } else if (node.asset === 'Power cable') {
                this.$confirm(`Upload Power Cable "${node.serial_number || node.name}" to Server?`, 'Confirm Upload', {
                    confirmButtonText: 'Upload',
                    cancelButtonText: 'Cancel',
                    type: 'info'
                }).then(async () => {
                    await this.processUploadPowerCable(node);
                }).catch(() => { });
            } else if (node.mode === 'bay') {
                this.$confirm(`Upload Bay "${node.name}" to Server?`, 'Confirm Upload', {
                    confirmButtonText: 'Upload',
                    cancelButtonText: 'Cancel',
                    type: 'info'
                }).then(async () => {
                    await this.processUploadBay(node);
                }).catch(() => { });
            } else if (node.asset === 'Transformer') {
                this.$confirm(`Upload Transformer "${node.name}" to Server?`, 'Confirm Upload', {
                    confirmButtonText: 'Upload',
                    cancelButtonText: 'Cancel',
                    type: 'info'
                }).then(async () => {
                    await this.processUploadTransformer(node);
                }).catch(() => { });
            } else {
                this.$message.warning('Currently only "Substation", "VoltageLevel" and "Power cable" upload are supported.');
            }
        },

        async validateParentOnServer(parentMrid) {
            try {
                if (!parentMrid) {
                    return false;
                }
                try {
                    const res = await demoAPI.getOrganisationById(parentMrid);
                    if (res && (res.id || res.data?.id)) {
                        return true;
                    }
                } catch (e) {
                    // Silent fail
                }

                const ownerRes = await demoAPI.getOwnerOrganisation();
                const ownerId = ownerRes?.id || ownerRes?.[0]?.id;

                if (ownerId) {
                    const childrenRes = await demoAPI.getChildOrganisation(ownerId);
                    const children = Array.isArray(childrenRes) ? childrenRes : (childrenRes?.data || []);

                    const found = children.find(org =>
                        org.mrid === parentMrid ||
                        org.id === parentMrid ||
                        String(org.id) === String(parentMrid) ||
                        org.aliasName === parentMrid
                    );

                    if (found) {
                        return true;
                    }

                    const foundDeep = await this.searchOrganisationDeep(ownerId, parentMrid);
                    if (foundDeep) {
                        return true;
                    }
                }

                const parentIdNum = parseInt(parentMrid);
                if (!isNaN(parentIdNum) && ownerId && parentIdNum !== parseInt(ownerId)) {
                    try {
                        const resByNum = await demoAPI.getOrganisationById(parentIdNum);
                        if (resByNum && (resByNum.id || resByNum.data?.id)) {
                            return true;
                        }
                    } catch (e) {
                        // Silent fail
                    }
                }

                return false;
            } catch (error) {
                console.error('[validateParentOnServer] Error:', error);
                return false;
            }
        },

        async searchOrganisationDeep(parentId, targetMrid, maxDepth = 5, currentDepth = 0) {
            if (currentDepth >= maxDepth) return null;

            try {
                const childrenRes = await demoAPI.getChildOrganisation(parentId);
                const children = Array.isArray(childrenRes) ? childrenRes : (childrenRes?.data || []);

                const found = children.find(org =>
                    org.mrid === targetMrid ||
                    org.id === targetMrid ||
                    String(org.id) === String(targetMrid)
                );

                if (found) return found;

                for (const child of children) {
                    if (child.id) {
                        const result = await this.searchOrganisationDeep(child.id, targetMrid, maxDepth, currentDepth + 1);
                        if (result) return result;
                    }
                }
            } catch (error) {
                // Silent fail
            }

            return null;
        },

        async resolveOrganisationNumericId(parentMrid) {
            try {
                try {
                    const res = await demoAPI.getOrganisationById(parentMrid);
                    if (res && (res.id || res.data?.id)) {
                        return res.id || res.data?.id;
                    }
                } catch (e) {
                    // Silent fail
                }

                const ownerRes = await demoAPI.getOwnerOrganisation();
                const ownerId = ownerRes?.id || ownerRes?.[0]?.id;

                if (ownerId) {
                    const childrenRes = await demoAPI.getChildOrganisation(ownerId);
                    const children = Array.isArray(childrenRes) ? childrenRes : (childrenRes?.data || []);

                    const found = children.find(org =>
                        org.mrid === parentMrid ||
                        org.id === parentMrid ||
                        String(org.id) === String(parentMrid)
                    );

                    if (found) {
                        return found.id;
                    }

                    const foundDeep = await this.searchOrganisationDeep(ownerId, parentMrid);
                    if (foundDeep) {
                        return foundDeep.id;
                    }
                }

                const parentIdNum = parseInt(parentMrid);
                if (!isNaN(parentIdNum) && ownerId && parentIdNum !== parseInt(ownerId)) {
                    try {
                        const resByNum = await demoAPI.getOrganisationById(parentIdNum);
                        if (resByNum && (resByNum.id || resByNum.data?.id)) {
                            return resByNum.id || resByNum.data?.id;
                        }
                    } catch (e) {
                        // Silent fail
                    }
                }

                return null;
            } catch (error) {
                console.error('[resolveOrganisationNumericId] Error:', error);
                return null;
            }
        },

        async findBayNumericIdGlobal(bayMrid) {
            try {
                const orgRes = await demoAPI.getOwnerOrganisation();
                const orgId = (Array.isArray(orgRes) && orgRes.length > 0) ? (orgRes[0].id || orgRes[0].mrid) : (orgRes?.id);
                if (!orgId) return null;

                const subListRes = await demoAPI.getChildSubstation(orgId);
                const subList = Array.isArray(subListRes) ? subListRes : (subListRes.data || []);

                for (const sub of subList) {
                    const bayListRes = await demoAPI.getChildBay(sub.id);
                    const bayList = Array.isArray(bayListRes) ? bayListRes : (bayListRes.data || []);
                    const match = bayList.find(b => b.mrid === bayMrid);
                    if (match) return match.id;
                }
            } catch (error) {
                console.error("Error scanning for Bay:", error);
            }
            return null;
        },

        async resolveServerParentId(parentMrid, parentType) {
            if (parentMrid === 'e423cbd1-470b-4b8b-b06d-74575075fe02') {
                return 6;
            }

            if (parentType === 'bay') {
                return await this.findBayNumericIdGlobal(parentMrid);
            }
            return null;
        },

        async processUploadPowerCable(node) {
            try {
                const entityRes = await window.electronAPI.getPowerCableEntityByMrid(node.mrid, node.parentId);
                if (!entityRes.success || !entityRes.data) throw new Error("Local data not found.");

                const dto = PowerCableMapping.mapEntityToDto(entityRes.data);
                if (!dto.properties.apparatus_id && !dto.properties.serial_no) {
                    dto.properties.apparatus_id = node.name || "Unnamed Asset";
                }
                const serverPayload = PowerCableServerMapper.mapDtoToServer(dto);

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                if (!parentNode) throw new Error("Parent node not found in Client Tree");

                let ownerType = 'SUBSTATION';

                if (parentNode.mode === 'bay') ownerType = 'BAY';
                else if (parentNode.mode === 'substation') ownerType = 'SUBSTATION';
                else if (parentNode.mode === 'voltageLevel') ownerType = 'VOLTAGE_LEVEL';

                if (node.parentId === 'e423cbd1-470b-4b8b-b06d-74575075fe02') {
                    console.warn("Target UUID detected. Forcing ownerType = 'BAY'");
                    ownerType = 'BAY';
                }

                const numericOwnerId = await this.resolveServerParentId(node.parentId, ownerType);

                if (!numericOwnerId) {
                    throw new Error(`Cannot find Numeric ID for parent (UUID: ${node.parentId}) on Server.`);
                }

                console.log(`Uploading to: ownerId=${numericOwnerId} & ownerType=${ownerType}`);

                const response = await demoAPI.createPowerCableCim(serverPayload, numericOwnerId, ownerType);

                if (response) {
                    this.$message.success(`Upload successfully to Bay ID: ${numericOwnerId}`);
                }

            } catch (error) {
                console.error("Upload Error:", error);
                if (error.response && error.response.data) {
                    const msg = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
                    this.$message.error(`Server Error: ${msg}`);
                } else {
                    this.$message.error(error.message || 'Error during upload');
                }
            }
        },

        async processUploadSubstation(node) {
            try {
                const userId = this.$store.state.user.user_id
                const entityRes = await window.electronAPI.getSubstationEntityByMrid(node.mrid, userId, node.parentId);
                if (!entityRes.success || !entityRes.data) {
                    throw new Error("Local substation data not found.");
                }

                const entity = entityRes.data;
                console.log('[Upload Substation] Local entity:', entity);

                if (!node.parentId) {
                    throw new Error("Cannot upload substation without parent organisation.");
                }

                let parentNode = null;
                parentNode = this.findNodeById(node.parentId, this.organisationClientList);

                console.log('[Upload Substation] Resolving parent ID:', node.parentId);
                const ownerId = node.parentId;

                console.log('[Upload Substation] Resolved ownerId:', ownerId);

                const serverPayload = mapSubstationEntityToServer(entity, parentNode);

                console.log('[Upload Substation] Server payload:', serverPayload);

                console.log('[Upload Substation] Using ownerId:', ownerId);

                const response = await demoAPI.createSubstation(serverPayload, ownerId);

                console.log('[Upload Substation] Response:', response);
                this.$message.success(`Upload Substation "${node.name}" successfully!`);

                if (this.clientSlide) {
                    await this.showLocationRoot();
                }

            } catch (error) {
                console.error("[Upload Substation] Error:", error);
                if (error.response && error.response.data) {
                    const msg = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
                    this.$message.error(`Server Error: ${msg}`);
                } else {
                    this.$message.error(error.message || 'Error during substation upload');
                }
            }
        },

        async processUploadVoltageLevel(node) {
            try {
                const entityRes = await window.electronAPI.getVoltageLevelEntityByMrid(node.mrid);
                if (!entityRes.success || !entityRes.data) {
                    throw new Error("Local voltage level data not found.");
                }

                const entity = entityRes.data;

                if (!node.parentId) {
                    throw new Error("Cannot upload voltage level without parent substation.");
                }

                const serverPayload = mapVoltageLevelEntityToServer(entity, null);

                console.log('[Upload VoltageLevel] Server payload:', serverPayload);

                let numericOwnerId = await this.resolveSubstationNumericId(node.parentId);
                
                if (!numericOwnerId && /^\d+$/.test(String(node.parentId))) {
                    numericOwnerId = parseInt(node.parentId);
                }

                if (!numericOwnerId) {
                    throw new Error(`Cannot find parent Substation on Server. Make sure Substation is uploaded first.`);
                }
                const response = await demoAPI.createVoltageLevel(serverPayload, numericOwnerId);

                console.log('[Upload VoltageLevel] Response:', response);
                this.$message.success(`Upload VoltageLevel "${node.name}" successfully!`);

                if (this.clientSlide) {
                    await this.showLocationRoot();
                }

            } catch (error) {
                console.error("[Upload VoltageLevel] Error:", error);
                if (error.response && error.response.data) {
                    const msg = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
                    this.$message.error(`Server Error: ${msg}`);
                } else {
                    this.$message.error(error.message || 'Error during voltage level upload');
                }
            }
        },

        async resolveVoltageLevelNumericId(voltageLevelMrid, substationIdFromEntity) {
            try {
                const parentNode = this.findNodeById(voltageLevelMrid, this.organisationClientList);
                const voltageLevelName = parentNode?.name;
                const substationId = substationIdFromEntity || parentNode?.substationId;

                console.log('[resolveVoltageLevelNumericId] Looking for mrid:', voltageLevelMrid, 'name:', voltageLevelName, 'substationId:', substationId);

                if (!voltageLevelMrid) return null;

                const orgRes = await demoAPI.getOwnerOrganisation();
                let orgId = (Array.isArray(orgRes) && orgRes.length > 0) ? (orgRes[0].id || orgRes[0].mrid) : (orgRes?.id);

                console.log('[resolveVoltageLevelNumericId] Owner orgId:', orgId);

                if (!orgId) return null;

                // Nếu có substationId, tìm Substation trực tiếp trước
                if (substationId) {
                    console.log('[resolveVoltageLevelNumericId] Trying to find substation by substationId:', substationId);
                    try {
                        const subRes = await demoAPI.getSubstationById(substationId);
                        console.log('[resolveVoltageLevelNumericId] getSubstationById response:', subRes);

                        const sub = subRes?.data || subRes;
                        console.log('[resolveVoltageLevelNumericId] Parsed sub:', sub);

                        if (sub && (sub.id || sub.mrid)) {
                            console.log('[resolveVoltageLevelNumericId] Found substation:', sub.name, 'id:', sub.id || sub.mrid);

                            const vlListRes = await demoAPI.getVoltageLevelBySubstationId(sub.id || sub.mrid);
                            const vlList = Array.isArray(vlListRes) ? vlListRes : (vlListRes.data || []);

                            console.log('[resolveVoltageLevelNumericId] VoltageLevels in substation:', vlList.map(v => ({ name: v.name, mrid: v.mrid, id: v.id })));

                            let match = vlList.find(vl => (vl.mrid || vl.id) === voltageLevelMrid);
                            if (match) return match.id;

                            if (voltageLevelName) {
                                match = vlList.find(vl => vl.name === voltageLevelName);
                                if (match) return match.id;
                            }

                            return null;
                        }
                    } catch (e) {
                        console.log('[resolveVoltageLevelNumericId] Error finding substation by id:', e.message);
                    }
                }

                // Lấy tất cả Substations từ owner org và các child orgs
                let subListRes = await demoAPI.getChildSubstation(orgId);
                let subList = Array.isArray(subListRes) ? subListRes : (subListRes.data || []);

                // Nếu không có substation, thử get child organisations
                if (subList.length === 0) {
                    const childOrgs = await demoAPI.getChildOrganisation(orgId);
                    const childOrgList = Array.isArray(childOrgs) ? childOrgs : (childOrgs.data || []);

                    console.log('[resolveVoltageLevelNumericId] Child orgs:', childOrgList.map(o => o.name || o.id));

                    for (const childOrg of childOrgList) {
                        subListRes = await demoAPI.getChildSubstation(childOrg.id);
                        const tempSubList = Array.isArray(subListRes) ? subListRes : (subListRes.data || []);
                        subList = [...subList, ...tempSubList];
                    }
                }

                // Nếu vẫn không có substation trong org 20, thử tìm trực tiếp Substation bằng substationId nếu có
                if (subList.length === 0 && parentNode?.substationId) {
                    try {
                        const subRes = await demoAPI.getSubstationById(parentNode.substationId);
                        if (subRes && (subRes.id || subRes.data?.id)) {
                            subList = [subRes.data || subRes];
                        }
                    } catch (e) {
                        console.log('[resolveVoltageLevelNumericId] Could not find substation by id:', parentNode.substationId);
                    }
                }

                console.log('[resolveVoltageLevelNumericId] All Substations:', subList.map(s => s.name));

                // Tìm VoltageLevel theo mrid trong tất cả Substations
                for (const sub of subList) {
                    const vlListRes = await demoAPI.getVoltageLevelBySubstationId(sub.id);
                    const vlList = Array.isArray(vlListRes) ? vlListRes : (vlListRes.data || []);

                    console.log('[resolveVoltageLevelNumericId] Sub:', sub.name, '- VoltageLevels:', vlList.map(v => ({ name: v.name, mrid: v.mrid, id: v.id })));

                    // Tìm theo mrid trước
                    let match = vlList.find(vl => (vl.mrid || vl.id) === voltageLevelMrid);
                    if (match) return match.id;

                    // Nếu không tìm thấy theo mrid, thử tìm theo name
                    if (voltageLevelName) {
                        match = vlList.find(vl => vl.name === voltageLevelName);
                        if (match) return match.id;
                    }
                }

                return null;
            } catch (error) {
                console.error("[resolveVoltageLevelNumericId] Error:", error);
                return null;
            }
        },

        async resolveSubstationNumericId(substationMrid) {
            try {
                const parentNode = this.findNodeById(substationMrid, this.organisationClientList);
                const substationName = parentNode?.name;

                if (!substationName) return null;

                const orgRes = await demoAPI.getOwnerOrganisation();
                let orgId = (Array.isArray(orgRes) && orgRes.length > 0) ? (orgRes[0].id || orgRes[0].mrid) : (orgRes?.id);

                if (!orgId) return null;

                let subListRes = await demoAPI.getChildSubstation(orgId);
                let subList = Array.isArray(subListRes) ? subListRes : (subListRes.data || []);

                if (subList.length === 0) {
                    const childOrgs = await demoAPI.getChildOrganisation(orgId);
                    const childOrgList = Array.isArray(childOrgs) ? childOrgs : (childOrgs.data || []);

                    for (const childOrg of childOrgList) {
                        subListRes = await demoAPI.getChildSubstation(childOrg.id);
                        const tempSubList = Array.isArray(subListRes) ? subListRes : (subListRes.data || []);
                        subList = [...subList, ...tempSubList];
                    }
                }

                const match = subList.find(sub =>
                    sub.mrid === substationMrid ||
                    sub.id === substationMrid ||
                    String(sub.id) === String(substationMrid)
                ); if (match) return match.id;

                return null;
            } catch (error) {
                console.error("[resolveSubstationNumericId] Error:", error);
                return null;
            }
        },

        async processUploadBay(node) {
            try {
                const entityRes = await window.electronAPI.getBayEntityByMrid(node.mrid);
                if (!entityRes.success || !entityRes.data) {
                    throw new Error("Local bay data not found.");
                }

                const entity = entityRes.data;

                if (!node.parentId) {
                    throw new Error("Cannot upload bay without parent.");
                }

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);

                // Lấy substationId từ parentNode (voltageLevel có parentId = substation mrid)
                const substationId = parentNode?.parentId;
                console.log('[Upload Bay] parentNode:', parentNode?.name, 'mode:', parentNode?.mode, 'substationId (parentId):', substationId);

                let ownerType = '';
                let numericOwnerId = null;

                if (parentNode) {
                    if (parentNode.mode === 'voltageLevel') {
                        ownerType = 'VOLTAGE_LEVEL';
                        numericOwnerId = await this.resolveVoltageLevelNumericId(node.parentId, substationId);
                    } else if (parentNode.mode === 'substation') {
                        ownerType = 'SUBSTATION';
                        numericOwnerId = await this.resolveSubstationNumericId(node.parentId);
                    }
                }

                // Fallback: nếu parentId đã là numeric ID từ server (sau khi upload parent thành công)
                if (!numericOwnerId && /^\d+$/.test(String(node.parentId))) {
                    numericOwnerId = parseInt(node.parentId);
                    if (parentNode?.mode === 'voltageLevel') {
                        ownerType = 'VOLTAGE_LEVEL';
                    } else {
                        ownerType = 'SUBSTATION';
                    }
                }

                if (!numericOwnerId || !ownerType) {
                    throw new Error(`Cannot find Numeric ID for parent (UUID: ${node.parentId}) on Server. Make sure parent is uploaded first.`);
                }

                const serverPayload = mapBayEntityToServer(entity);

                console.log('[Upload Bay] Uploading to ownerId:', numericOwnerId, 'ownerType:', ownerType);

                const response = await demoAPI.createBay(serverPayload, numericOwnerId, ownerType);

                console.log('[Upload Bay] Response:', response);
                this.$message.success(`Upload Bay "${node.name}" successfully!`);

                if (this.clientSlide) {
                    await this.showLocationRoot();
                }

            } catch (error) {
                console.error("[Upload Bay] Error:", error);
                if (error.response && error.response.data) {
                    const msg = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
                    this.$message.error(`Server Error: ${msg}`);
                } else {
                    this.$message.error(error.message || 'Error during bay upload');
                }
            }
        },

        async processUploadTransformer(node) {
            try {
                const userId = this.$store.state.user.user_id;
                const entityRes = await window.electronAPI.getTransformerEntityByMrid(node.mrid, userId, node.parentId);
                if (!entityRes.success || !entityRes.data) {
                    throw new Error("Local transformer data not found.");
                }

                const entity = entityRes.data;
                console.log('[Upload Transformer] Local entity:', entity);

                if (!node.parentId) {
                    throw new Error("Cannot upload transformer without parent.");
                }

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                console.log('[Upload Transformer] parentNode:', parentNode?.name, 'mode:', parentNode?.mode);

                let ownerType = '';
                let numericOwnerId = null;

                if (parentNode) {
                    if (parentNode.mode === 'bay') {
                        ownerType = 'BAY';
                        numericOwnerId = await this.findBayNumericIdGlobal(node.parentId);
                    } else if (parentNode.mode === 'substation') {
                        ownerType = 'SUBSTATION';
                        numericOwnerId = await this.resolveSubstationNumericId(node.parentId);
                    }
                }

                if (!numericOwnerId && /^\d+$/.test(String(node.parentId))) {
                    numericOwnerId = parseInt(node.parentId);
                    if (parentNode?.mode === 'bay') {
                        ownerType = 'BAY';
                    } else {
                        ownerType = 'SUBSTATION';
                    }
                }

                if (!numericOwnerId || !ownerType) {
                    throw new Error(`Cannot find Numeric ID for parent (UUID: ${node.parentId}) on Server. Make sure parent is uploaded first.`);
                }

                const serverPayload = mapTransformerEntityToServer(entity);

                console.log('[Upload Transformer] Server payload:', JSON.stringify(serverPayload, null, 2));
                console.log('[Upload Transformer] Uploading to ownerId:', numericOwnerId, 'ownerType:', ownerType);

                const response = await demoAPI.createTransformer(serverPayload, numericOwnerId, ownerType);

                console.log('[Upload Transformer] Response:', response);
                this.$message.success(`Upload Transformer "${node.name}" successfully!`);

                if (this.clientSlide) {
                    await this.showLocationRoot();
                }

            } catch (error) {
                console.error("[Upload Transformer] Error:", error);
                if (error.response && error.response.data) {
                    const msg = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
                    this.$message.error(`Server Error: ${msg}`);
                } else {
                    this.$message.error(error.message || 'Error during transformer upload');
                }
            }
        }
    }
}
