import * as coreUtils from './core-utils.js'

/**
 * Tải một danh sách node đã dựng sẵn (đã đúng thứ tự cha trước con).
 * Khác executeDownload ở chỗ: lỗi ở 1 node KHÔNG dừng cả lượt, mỗi node
 * được ghi lại trạng thái để hiển thị bảng kết quả.
 *
 * @param chain mảng node dạng { id, mrid, name, aliasName, parentId, _type, asset }
 * @returns {Promise<Array>} [{ key, name, typeLabel, status, message }]
 */
export async function executeDownloadChainWithResults(chain, ctx) {
    const results = []

    for (const ref of chain) {
        const row = {
            key: `${ref._type || ''}:${ref.asset || ''}:${ref.mrid || ref.id || ''}`,
            mrid: ref.mrid || ref.id || null,
            name: ref.aliasName || ref.name || ref.mrid || ref.id || 'Unnamed',
            typeLabel: ref._type === 'asset' ? (ref.asset || 'Asset')
                : (ref._type === 'voltageLevel' ? 'Voltage level' : (ref._type || '')),
            status: 'success',
            message: ''
        }

        try {
            const fullInfoChain = await coreUtils.fetchFullInfoForChain([ref])
            if (!fullInfoChain.length) {
                row.status = 'skipped'
                row.message = 'No download strategy for this node type'
            } else {
                await coreUtils.downloadChainInfo(fullInfoChain, ctx)
            }
        } catch (error) {
            row.status = 'failed'
            row.message = (error && error.message) || 'Download failed'
            console.error('[Download] node failed:', ref, error)
        }

        results.push(row)
    }

    if (ctx.applySyncStatesToTree) {
        try {
            await ctx.applySyncStatesToTree(ctx.organisationClientList || [])
        } catch (error) {
            console.error('[Download] applySyncStatesToTree failed:', error)
        }
    }

    return results
}

export async function executeDownload(node, ctx, options = {}) {
    const { includePath = true } = options

    // Gọi action 'start' để bật loading và kích hoạt Failsafe Timer
    ctx.$store.dispatch('loading/start', { 
        action: 'download', 
        type: 'heavy' // dùng heavy để có timeout 30s
    });

    try {
        const chain = includePath
            ? await coreUtils.buildOrgAncestors(node)
            : await coreUtils.buildSingleNodeChain(node)
        const fullInfoChain = await coreUtils.fetchFullInfoForChain(chain)
        await coreUtils.downloadChainInfo(fullInfoChain, ctx)
        if (ctx.applySyncStatesToTree) {
            await ctx.applySyncStatesToTree(ctx.organisationClientList || [])
        }
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
