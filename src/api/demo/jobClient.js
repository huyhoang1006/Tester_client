import client from '@/utils/client'
import { JOB_SERVICE_DOMAIN } from '@/config/server'

const jobClient = {
    get(url, config = {}) {
        return client.get(url, { ...config, baseURL: JOB_SERVICE_DOMAIN, serviceName: 'Job service' })
    },
    post(url, data, config = {}) {
        return client.post(url, data, { ...config, baseURL: JOB_SERVICE_DOMAIN, serviceName: 'Job service' })
    }
}

export default jobClient
