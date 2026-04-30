/* eslint-disable */
import * as demoAPI from '@/api/demo/index.js'

/**
 * Mixin chứa các hàm resolve UUID → Numeric ID từ server
 */
export default {
    methods: {
        async validateParentOnServer(parentMrid) {
            try {
                if (!parentMrid) return false;

                try {
                    const res = await demoAPI.getOrganisationById(parentMrid);
                    if (res && (res.id || res.data?.id)) return true;
                } catch (e) { }

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
                    if (found) return true;

                    const foundDeep = await this.searchOrganisationDeep(ownerId, parentMrid);
                    if (foundDeep) return true;
                }

                const parentIdNum = parseInt(parentMrid);
                if (!isNaN(parentIdNum) && ownerId && parentIdNum !== parseInt(ownerId)) {
                    try {
                        const resByNum = await demoAPI.getOrganisationById(parentIdNum);
                        if (resByNum && (resByNum.id || resByNum.data?.id)) return true;
                    } catch (e) { }
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
            } catch (error) { }
            return null;
        },

        async resolveOrganisationNumericId(parentMrid) {
            try {
                try {
                    const res = await demoAPI.getOrganisationById(parentMrid);
                    if (res && (res.id || res.data?.id)) return res.id || res.data?.id;
                } catch (e) { }

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
                    if (found) return found.id;

                    const foundDeep = await this.searchOrganisationDeep(ownerId, parentMrid);
                    if (foundDeep) return foundDeep.id;
                }

                const parentIdNum = parseInt(parentMrid);
                if (!isNaN(parentIdNum) && ownerId && parentIdNum !== parseInt(ownerId)) {
                    try {
                        const resByNum = await demoAPI.getOrganisationById(parentIdNum);
                        if (resByNum && (resByNum.id || resByNum.data?.id)) return resByNum.id || resByNum.data?.id;
                    } catch (e) { }
                }

                return null;
            } catch (error) {
                console.error('[resolveOrganisationNumericId] Error:', error);
                return null;
            }
        },

        async resolveSubstationNumericId(substationMrid) {
            try {
                const parentNode = this.findNodeById(substationMrid, this.organisationClientList);
                const substationName = parentNode?.name;
                if (!substationName) return null;

                const orgRes = await demoAPI.getOwnerOrganisation();
                let orgId = (Array.isArray(orgRes) && orgRes.length > 0)
                    ? (orgRes[0].id || orgRes[0].mrid)
                    : orgRes?.id;
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
                );
                if (match) return match.id;

                return null;
            } catch (error) {
                console.error('[resolveSubstationNumericId] Error:', error);
                return null;
            }
        },

        async resolveVoltageLevelNumericId(voltageLevelMrid, substationIdFromEntity) {
            try {
                const parentNode = this.findNodeById(voltageLevelMrid, this.organisationClientList);
                const voltageLevelName = parentNode?.name;
                const substationId = substationIdFromEntity || parentNode?.substationId;

                if (!voltageLevelMrid) return null;

                const orgRes = await demoAPI.getOwnerOrganisation();
                let orgId = (Array.isArray(orgRes) && orgRes.length > 0)
                    ? (orgRes[0].id || orgRes[0].mrid)
                    : orgRes?.id;
                if (!orgId) return null;

                // Tìm trực tiếp qua substationId nếu có
                if (substationId) {
                    try {
                        const subRes = await demoAPI.getSubstationById(substationId);
                        const sub = subRes?.data || subRes;
                        if (sub && (sub.id || sub.mrid)) {
                            const vlListRes = await demoAPI.getVoltageLevelBySubstationId(sub.id || sub.mrid);
                            const vlList = Array.isArray(vlListRes) ? vlListRes : (vlListRes.data || []);
                            let match = vlList.find(vl => (vl.mrid || vl.id) === voltageLevelMrid);
                            if (match) return match.id;
                            if (voltageLevelName) {
                                match = vlList.find(vl => vl.name === voltageLevelName);
                                if (match) return match.id;
                            }
                            return null;
                        }
                    } catch (e) { }
                }

                // Duyệt toàn bộ substations
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

                if (subList.length === 0 && parentNode?.substationId) {
                    try {
                        const subRes = await demoAPI.getSubstationById(parentNode.substationId);
                        if (subRes && (subRes.id || subRes.data?.id)) {
                            subList = [subRes.data || subRes];
                        }
                    } catch (e) { }
                }

                for (const sub of subList) {
                    const vlListRes = await demoAPI.getVoltageLevelBySubstationId(sub.id);
                    const vlList = Array.isArray(vlListRes) ? vlListRes : (vlListRes.data || []);
                    let match = vlList.find(vl => (vl.mrid || vl.id) === voltageLevelMrid);
                    if (match) return match.id;
                    if (voltageLevelName) {
                        match = vlList.find(vl => vl.name === voltageLevelName);
                        if (match) return match.id;
                    }
                }

                return null;
            } catch (error) {
                console.error('[resolveVoltageLevelNumericId] Error:', error);
                return null;
            }
        },

        async findBayNumericIdGlobal(bayMrid) {
            try {
                const orgRes = await demoAPI.getOwnerOrganisation();
                const orgId = (Array.isArray(orgRes) && orgRes.length > 0)
                    ? (orgRes[0].id || orgRes[0].mrid)
                    : orgRes?.id;
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
                console.error('[findBayNumericIdGlobal] Error:', error);
            }
            return null;
        },

        async resolveServerParentId(parentMrid, parentType) {
            if (parentMrid === 'e423cbd1-470b-4b8b-b06d-74575075fe02') return 6;
            if (parentType === 'bay') return await this.findBayNumericIdGlobal(parentMrid);
            return null;
        },
    }
}