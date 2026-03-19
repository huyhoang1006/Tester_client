/* eslint-disable */
// File: src/services/download-services/organisation.js
import * as OrganisationServerMapper from '@/views/Mapping/ServerToDTO/Organisation/index.js'
import * as OrganisationMapper from '@/views/Mapping/Organisation/index.js'
import { buildOrgAncestors, fetchWithRetry } from './core-utils'

// Hàm gọi khi user click thẳng vào 1 Org
export async function processOrganisationDownload(node, ctx) {
    const chain = await buildOrgAncestors(node)
    ctx.$store.commit('loading/SET_CUSTOM_TEXT', 'Downloading organisation...');
    await downloadOrganisationChain(chain, ctx)
}

// Hàm gọi ẩn (bởi Substation) để lót đường
export async function downloadOrganisationChainForParent(parentNode, ctx) {
    const chain = await buildOrgAncestors(parentNode)
    if (chain.length === 0) return; // Không có org cha thì bỏ qua

    await downloadOrganisationChain(chain, ctx)
    
    // Cập nhật lên UI Client Tree
    const rootOrg = ctx.organisationClientList?.find(org => org.mrid === '00000000-0000-0000-0000-000000000000')
    if (rootOrg) {
        if (!rootOrg.children) rootOrg.children =[]
        for (const org of chain) {
            const orgNode = {
                mrid: org.mrid, name: org.name, aliasName: org.aliasName || org.name,
                parentId: '00000000-0000-0000-0000-000000000000', mode: 'organisation'
            }
            const existingIndex = rootOrg.children.findIndex(c => c.mrid === org.mrid)
            if (existingIndex >= 0) Object.assign(rootOrg.children[existingIndex], orgNode)
            else rootOrg.children.push(orgNode)
        }
        ctx.$set(rootOrg, 'expanded', true)
    }
}

// Logic Insert SQLite
async function downloadOrganisationChain(chain, ctx) {
    const CLIENT_ROOT = '00000000-0000-0000-0000-000000000000'
    for (const org of chain) {
        const rawPositionPoints = org._serverData?.positionPoints ||[]
        const hasValidPositionData = rawPositionPoints.some(p => p.xposition !== null || p.yposition !== null || p.zposition !== null)
        
        const serverData = {
            name: org._serverData?.name || org.name,
            aliasName: org._serverData?.shortName || org._serverData?.aliasName || org.name,
            mRID: org.mrid, parentOrganisation: org.parentId,
            organisation: {
                mRID: org.mrid, parentOrganisation: org.parentId,
                taxCode: org._serverData?.organisation?.taxCode || '',
                electronicAddress: org._serverData?.organisation?.electronicAddress || {},
                phone: org._serverData?.organisation?.phone || {}
            },
            positionPoints: hasValidPositionData ? rawPositionPoints :[]
        }
        
        const dto = OrganisationServerMapper.mapServerToDto(serverData)
        dto.parentId = org.parentId
        dto.organisationId = org.mrid
        const entity = OrganisationMapper.OrgDtoToOrgEntity(dto)
        
        try {
            const insertResult = await fetchWithRetry(() => window.electronAPI.insertParentOrganizationEntity(entity))
            
            if (!insertResult.success) {
                console.error(`[Org DB Error] ${org.name}:`, insertResult.message)
            }
        } catch (e) {
            console.error(`[Org DB Exception] ${org.name}:`, e.message)
        }
    }
}