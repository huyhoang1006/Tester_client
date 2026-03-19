// File: src/services/download-services/index.js
import { processOrganisationDownload } from './organisation'
import { processSubstationDownload } from './substation'
import { processVoltageLevelDownload } from './voltageLevel'
import { processBayDownload } from './bay'
import { processAssetDownload } from './asset'

export async function executeDownload(node, ctx) {
    // Gọi action 'start' để bật loading và kích hoạt Failsafe Timer
    ctx.$store.dispatch('loading/start', { 
        action: 'download', 
        type: 'heavy' // dùng heavy để có timeout 30s
    });

    try {
        const strategies = {
            'organisation': processOrganisationDownload,
            'substation': processSubstationDownload,
            'voltageLevel': processVoltageLevelDownload,
            'bay': processBayDownload
        }

        const handler = strategies[node.mode]
        if (handler) {
            await handler(node, ctx)
        } else {
            await processAssetDownload(node, ctx)
        }

        await ctx.showLocationRoot()
        ctx.$message.success(`${node.aliasName || 'Dữ liệu'} downloaded successfully!`)

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