export default {
    methods: {
        hasAnyRows(response) {
            return !!(response && response.success && Array.isArray(response.data) && response.data.length > 0)
        },

        hasAnyAssetRows(assetResponses) {
            return Array.isArray(assetResponses) && assetResponses.some((response) => this.hasAnyRows(response))
        },

        async checkChildren(node) {
            // Kiểm tra nếu đã load children trong tree
            if (node.children && node.children.length > 0) {
                return { hasChildren: true } // Có children trong tree → không xóa
            }

            // Nếu chưa load, fetch từ DB để kiểm tra (KHÔNG load vào tree)
            try {
                let hasChildren = false

                if (node.mode == 'asset') {
                    // fetchJobsByAssetId chỉ nhận assetId. Trước đây truyền nhầm (node.mode, node.mrid)
                    // nên luôn query bằng chuỗi 'asset' và không bao giờ tìm thấy job.
                    // Surge arrester cũng có job (xem fetchChildren) nên không loại trừ nữa.
                    if (node.asset) {
                        const jobsReturn = await this.fetchJobsByAssetId(node.mrid)
                        if (jobsReturn.success && jobsReturn.data.length > 0) {
                            hasChildren = true
                        }
                    }
                } else if (node.mode == 'organisation') {
                    const [organisationReturn, substationReturn] = await Promise.all([
                        window.electronAPI.getParentOrganizationByParentMrid(node.mrid),
                        window.electronAPI.getSubstationsInOrganisationForUser(node.mrid, this.$store.state.user.user_id)
                    ])

                    hasChildren = this.hasAnyRows(organisationReturn) || this.hasAnyRows(substationReturn)
                } else if (node.mode == 'substation') {
                    const [voltageLevelReturn, bayReturn] = await Promise.all([
                        window.electronAPI.getVoltageLevelBySubstationId(node.mrid),
                        window.electronAPI.getBayByVoltageBySubstationId(null, node.mrid)
                    ])
                    const assetReturns = await this.fetchAssetByPsr(node.mrid)

                    // Kiểm tra bất kỳ cái nào có data >0 thì hasChildren = true
                    if (this.hasAnyRows(voltageLevelReturn) || this.hasAnyRows(bayReturn) || this.hasAnyAssetRows(assetReturns)) {
                        hasChildren = true
                    }
                } else if (node.mode == 'voltageLevel') {
                    const [bayReturn, assetReturns] = await Promise.all([
                        window.electronAPI.getBayByVoltageBySubstationId(node.mrid, null),
                        this.fetchAssetByPsr(node.mrid)
                    ])
                    if (this.hasAnyRows(bayReturn) || this.hasAnyAssetRows(assetReturns)) {
                        hasChildren = true
                    }
                } else if (node.mode == 'bay') {
                    const assetReturns = await this.fetchAssetByPsr(node.mrid)
                    if (this.hasAnyAssetRows(assetReturns)) {
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
