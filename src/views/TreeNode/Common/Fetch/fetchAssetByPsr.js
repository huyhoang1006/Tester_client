export default {
    methods: {
        async fetchAssetByPsr(psrId) {
            try {
                const [
                    responseTransformer,
                    responseSurge,
                    responseBushing,
                    responseVT,
                    responseDisconnector,
                    responsePowerCale,
                    responseRotatingMachine,
                    responseCurrentTransformer,
                    responseCapacitor,
                    responseBreaker,
                    responseReactor
                ] = await Promise.all([
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Transformer'),
                    window.electronAPI.getSurgeArresterByPsrId(psrId),
                    window.electronAPI.getBushingByPsrId(psrId),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Voltage transformer'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Disconnector'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Power cable'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Rotating machine'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Current transformer'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Capacitor'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Circuit breaker'),
                    window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Reactor')
                ])
                return [
                    responseTransformer,
                    responseSurge,
                    responseBushing,
                    responseVT,
                    responseDisconnector,
                    responsePowerCale,
                    responseRotatingMachine,
                    responseCurrentTransformer,
                    responseCapacitor,
                    responseBreaker,
                    responseReactor
                ]
            } catch (error) {
                console.error('Error fetching asset by substation:', error)
                return {
                    success: false,
                    data: [],
                    message: 'Error fetching asset by substation'
                }
            }
        },
    }
}