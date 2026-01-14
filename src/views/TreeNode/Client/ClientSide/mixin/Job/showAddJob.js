import * as BreakerMapping from '@/views/Mapping/Breaker/index'
import * as TransformerMapping from '@/views/Mapping/Transformer/index'

export default {
    data() {
        return {
            signJob: false,
            checkJobType: '',
            assetData: {},
            locationData: {},
            productAssetModelData: {},
            testTypeListData: [],
            jobProperties: {
                name: '',
                work_order: '',
                creation_date: '',
                execution_date: '',
                tested_by: '',
                approved_by: '',
                ambient_condition: '',
                standard: ''
            },
        }
    },
    methods: {
        async showAddJob(node) {
            try {
                const dataAsset = await window.electronAPI.getAssetByMrid(node.mrid)
                if (dataAsset.success) {
                    this.assetData = dataAsset.data
                    const [dataLocation, dataProductAssetModel] = await Promise.all([
                        window.electronAPI.getLocationDetailByMrid(dataAsset.data.location),
                        window.electronAPI.getProductAssetModelByMrid(dataAsset.data.product_asset_model)
                    ])
                    if (dataLocation.success) {
                        this.locationData = dataLocation.data
                    } else {
                        this.locationData = {}
                    }

                    if (dataProductAssetModel.success) {
                        this.productAssetModelData = dataProductAssetModel.data
                    } else {
                        this.productAssetModelData = {}
                    }
                } else {
                    this.$message.error('Asset not found')
                }

                this.parentOrganization = node

                if (node.asset == 'Surge arrester') {
                    const dataTestType = await window.electronAPI.getAllTestTypeSurgeArrester()
                    const dataSurgeArrester = await window.electronAPI.getSurgeArresterByMrid(node.mrid)
                    if (dataSurgeArrester.success) {
                        this.assetData = dataSurgeArrester.data
                    } else {
                        this.assetData = {}
                    }
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobSurgeArrester'
                    this.signJob = true
                } else if (node.asset == 'Power cable') {
                    // const dataTestType = await window.electronAPI.getAllTestTypePowerCable()
                    // if (dataTestType.success) {
                    //     this.testTypeListData = dataTestType.data
                    // } else {
                    //     this.testTypeListData = []
                    // }
                    this.checkJobType = 'JobPowerCable'
                    this.signJob = true
                } else if (node.asset == 'Disconnector') {
                    // const dataTestType = await window.electronAPI.getAllTestTypeDisconnector()
                    // if (dataTestType.success) {
                    //     this.testTypeListData = dataTestType.data
                    // } else {
                    //     this.testTypeListData = []
                    // }
                    this.checkJobType = 'JobDisconnector'
                    this.signJob = true
                } else if (node.asset == 'Current transformer') {
                    // const dataTestType = await window.electronAPI.getAllTestTypeCT()
                    // if (dataTestType.success) {
                    //     this.testTypeListData = dataTestType.data
                    // } else {
                    //     this.testTypeListData = []
                    // }
                    this.checkJobType = 'JobCurrentTransformer'
                    this.signJob = true
                } else if (node.asset == 'Voltage transformer') {
                    // const dataTestType = await window.electronAPI.getAllTestTypeVT()
                    // if (dataTestType.success) {
                    //     this.testTypeListData = dataTestType.data
                    // } else {
                    //     this.testTypeListData = []
                    // }
                    this.checkJobType = 'JobVoltageTransformer'
                    this.signJob = true
                } else if (node.asset == 'Circuit breaker') {
                    // const dataTestType = await window.electronAPI.getAllTestTypeCircuitBreaker()
                    const dataBreakerEntity = await window.electronAPI.getBreakerEntityByMrid(node.mrid)
                    const dto = BreakerMapping.mapEntityToDto(dataBreakerEntity.data)
                    if (dataBreakerEntity.success) {
                        this.assetData = dto
                    } else {
                        this.assetData = {}
                    }
                    // if (dataTestType.success) {
                    //     this.testTypeListData = dataTestType.data
                    // } else {
                    //     this.testTypeListData = []
                    // }
                    this.checkJobType = 'JobCircuitBreaker'
                    this.signJob = true
                } else if (node.asset == 'Transformer') {
                    // const dataTestType = await window.electronAPI.getAllTestTypeTransformers()
                    const dataTransformerEntity = await window.electronAPI.getTransformerEntityByMrid(node.mrid)
                    const dto = TransformerMapping.transformerEntityToDto(dataTransformerEntity.data)
                    if (dataTransformerEntity.success) {
                        this.assetData = dto
                    } else {
                        this.assetData = {}
                    }
                    // if (dataTestType.success) {
                    //     this.testTypeListData = dataTestType.data
                    // } else {
                    //     this.testTypeListData = []
                    // }
                    this.checkJobType = 'JobTransformer'
                    this.signJob = true
                } else {
                    this.$message.error('This asset type not support for job')
                }
            } catch (error) {
                this.parentOrganization = null
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
    }
}