import * as coreUtils from './core-utils.js'

export async function executeDownload(node, ctx) {
    // Gọi action 'start' để bật loading và kích hoạt Failsafe Timer
    ctx.$store.dispatch('loading/start', { 
        action: 'download', 
        type: 'heavy' // dùng heavy để có timeout 30s
    });

    try {
        const chain = await coreUtils.buildOrgAncestors(node)
        const fullInfoChain = await coreUtils.fetchFullInfoForChain(chain)
        await coreUtils.downloadChainInfo(fullInfoChain, ctx)
        ctx.$message.success(`${node.aliasName || 'Data'} downloaded successfully!`)

    } catch (error) {
        if (error.message !== 'CANCELED') {
            console.error('[Download Framework Error]:', error)
            ctx.$message.error('error in download: ' + error.message)
        }
    } finally {
        // Tắt loading và xóa timer
        ctx.$store.dispatch('loading/stop');
    }
}