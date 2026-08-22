/* eslint-disable */
import client from '@/utils/client'
import { toServerId } from '@/utils/serverId'

export const createOrganisation = (data, ownerId) => {
    return client.post('/api/organisation/cim/create', data, {
        params: {
            ownerId: toServerId(ownerId)
        }
    })
}
