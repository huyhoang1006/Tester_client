export default {
    methods: {
        async checkChildren(node) {
            // Kiểm tra nếu đã load children trong tree
            if (node.children && node.children.length > 0) {
                return { hasChildren: true } // Có children trong tree → không xóa
            }

            // Nếu chưa load, fetch từ DB để kiểm tra (KHÔNG load vào tree)
            try {
                let hasChildren = false

                if (node.mode == 'asset') {
                    if (node.asset && node.asset != 'Surge arrester') {
                        const jobsReturn = await this.fetchJobsByAssetId(node.mode, node.mrid)
                        if (jobsReturn.success && jobsReturn.data.length > 0) {
                            hasChildren = true
                        }
                    }
                } else if (node.mode == 'substation') {
                    const [voltageLevelReturn, bayReturn] = await Promise.all([
                        window.electronAPI.getVoltageLevelBySubstationId(node.mrid),
                        window.electronAPI.getBayByVoltageBySubstationId(null, node.mrid)
                    ])
                    const [
                        assetSurgeReturn,
                        assetBushingReturn,
                        assetVtReturn,
                        assetDisconnectorReturn,
                        assetPowerCableReturn,
                        assetRotatingMachineReturn,
                        assetCurrentTransformerReturn,
                        assetCapacitorReturn,
                        assetReactorReturn
                    ] = await this.fetchAssetByPsr(node.mrid)

                    // Kiểm tra bất kỳ cái nào có data >0 thì hasChildren = true
                    if (
                        (voltageLevelReturn.success && voltageLevelReturn.data.length > 0) ||
                        (bayReturn.success && bayReturn.data.length > 0) ||
                        (assetSurgeReturn.success && assetSurgeReturn.data.length > 0) ||
                        (assetBushingReturn.success && assetBushingReturn.data.length > 0) ||
                        (assetVtReturn.success && assetVtReturn.data.length > 0) ||
                        (assetDisconnectorReturn.success && assetDisconnectorReturn.data.length > 0) ||
                        (assetPowerCableReturn.success && assetPowerCableReturn.data.length > 0) ||
                        (assetRotatingMachineReturn.success && assetRotatingMachineReturn.data.length > 0) ||
                        (assetCurrentTransformerReturn.success && assetCurrentTransformerReturn.data.length > 0) ||
                        (assetCapacitorReturn.success && assetCapacitorReturn.data.length > 0) ||
                        (assetReactorReturn.success && assetReactorReturn.data.length > 0)
                    ) {
                        hasChildren = true
                    }
                } else if (node.mode == 'voltageLevel') {
                    const bayReturn = await window.electronAPI.getBayByVoltageBySubstationId(node.mrid, null)
                    if (bayReturn.success && bayReturn.data.length > 0) {
                        hasChildren = true
                    }
                } else if (node.mode == 'bay') {
                    const [
                        assetSurgeReturn,
                        assetBushingReturn,
                        assetVtReturn,
                        assetDisconnectorReturn,
                        assetPowerCableReturn,
                        assetRotatingMachineReturn,
                        assetCurrentTransformerReturn,
                        assetCapacitorReturn,
                        assetReactorReturn
                    ] = await this.fetchAssetByPsr(node.mrid)
                    if (
                        (assetSurgeReturn.success && assetSurgeReturn.data.length > 0) ||
                        (assetBushingReturn.success && assetBushingReturn.data.length > 0) ||
                        (assetVtReturn.success && assetVtReturn.data.length > 0) ||
                        (assetDisconnectorReturn.success && assetDisconnectorReturn.data.length > 0) ||
                        (assetPowerCableReturn.success && assetPowerCableReturn.data.length > 0) ||
                        (assetRotatingMachineReturn.success && assetRotatingMachineReturn.data.length > 0) ||
                        (assetCurrentTransformerReturn.success && assetCurrentTransformerReturn.data.length > 0) ||
                        (assetCapacitorReturn.success && assetCapacitorReturn.data.length > 0) ||
                        (assetReactorReturn.success && assetReactorReturn.data.length > 0)
                    ) {
                        hasChildren = true
                    }
                }

                return { hasChildren }
            } catch (error) {
                console.error('Error checking children:', error)
                return { hasChildren: true } // An toàn: giả sử có children nếu lỗi
            }
        },
    }
}