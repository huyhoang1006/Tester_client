export default {
    methods: {
        async fetchJobsByAssetId(assetId) {
            try {
                const result = await window.electronAPI.getOldWorkByAssetId(assetId)
                return result
            } catch (error) {
                console.error('Error fetching jobs by asset ID:', error)
                return {
                    success: false,
                    data: [],
                    message: 'Error fetching jobs by asset ID'
                }
            }
        },
    }
}