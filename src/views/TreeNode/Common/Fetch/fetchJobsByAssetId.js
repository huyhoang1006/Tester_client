export default {
    methods: {
        async fetchJobsByAssetId(assetId) {
            const electronAPI = window.electronAPI || {}
            if (typeof electronAPI.getWorkTasksByAssetId !== 'function') {
                throw new Error('Test tree API is not loaded. Please restart the application.')
            }

            const result = await electronAPI.getWorkTasksByAssetId(assetId)
            if (!result || result.success !== true || !Array.isArray(result.data)) {
                throw new Error((result && result.message) || 'Unable to load tests for this asset.')
            }

            return {
                ...result,
                data: result.data.map(task => ({
                    ...task,
                    name: task.name || task.title || task.type || 'Unnamed test',
                    workMrid: task.work_mrid || task.work,
                    workName: task.work_name,
                    execution_date: task.testing_date || task.testingDate || task.work_execution_date,
                    tested_by: task.tested_by || task.testedBy || task.work_tested_by
                }))
            }
        },
    }
}
