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
        formatToday() {
            const now = new Date()
            const month = String(now.getMonth() + 1).padStart(2, '0')
            const day = String(now.getDate()).padStart(2, '0')
            return `${month}/${day}/${now.getFullYear()}`
        },
        prepareNewTestForm() {
            const jobData = this.$refs.jobDialog && this.$refs.jobDialog.getJobDataRef()
            if (!jobData) return

            jobData.loadParameter(this.testTypeListData, this.assetData, this.productAssetModelData, this.locationData)
            const dtoKey = Object.keys(jobData.$data || {}).find(key => /JobDto$/.test(key) && !/Old$/.test(key))
            const dto = dtoKey ? jobData[dtoKey] : null
            if (dto && dto.properties) {
                const year = new Date().getFullYear()
                dto.properties.name = `Job ${year}`
                dto.properties.execution_date = this.formatToday()
                dto.properties.creation_date = dto.properties.creation_date || this.formatToday()
            }
            jobData.mainActiveName = 'test-settings'
        },
        async showAddJob(node) {
            try {
                const currentYear = new Date().getFullYear()
                const worksResponse = await window.electronAPI.getOldWorkByAssetId(node.mrid)
                const works = worksResponse && Array.isArray(worksResponse.data) ? worksResponse.data : []
                const canonicalWorkName = `Job ${currentYear}`
                const currentYearWork = works.find(work =>
                    String(work.name || '').trim().toLowerCase() === canonicalWorkName.toLowerCase()
                )

                if (currentYearWork) {
                    await this.showDataClient({
                        mrid: currentYearWork.mrid,
                        workMrid: currentYearWork.mrid,
                        name: `Add test - ${currentYear}`,
                        parentId: node.mrid,
                        parentName: node.parentName,
                        parentArr: node.parentArr || [],
                        mode: 'test',
                        job: node.asset,
                        execution_date: currentYearWork.execution_date,
                        _openTestSettings: true
                    })
                    return
                }

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
                    const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Surge arrester")
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
                    this.$nextTick(() => {
                        this.prepareNewTestForm()
                    })
                } else if (node.asset == 'Power cable') {
                    const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Power cable")
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobPowerCable'
                    this.signJob = true
                    this.$nextTick(() => {
                        this.prepareNewTestForm()
                    })
                } else if (node.asset == 'Disconnector') {
                    const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Disconnector")
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobDisconnector'
                    this.signJob = true
                    this.$nextTick(() => {
                        this.prepareNewTestForm()
                    })
                } else if (node.asset == 'Current transformer') {
                    const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Current transformer")
                    const dataCurrentTransformer = await window.electronAPI.getCurrentTransformerEntityByMrid(node.mrid)
                    if (dataCurrentTransformer.success) {
                        this.assetData = dataCurrentTransformer.data
                    } else {
                        this.assetData = {}
                    }
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobCurrentTransformer'
                    this.signJob = true
                    this.$nextTick(() => {
                        this.prepareNewTestForm()
                    })
                } else if (node.asset == 'Voltage transformer') {
                    const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Voltage transformer")
                    const dataVoltageTransformer = await window.electronAPI.getVoltageTransformerEntityByMrid(node.mrid)
                    if (dataVoltageTransformer.success) {
                        this.assetData = dataVoltageTransformer.data
                        this.assetData.kind = this.assetData.asset.kind
                        this.assetData.type = this.assetData.asset.type
                        this.assetData.serial_number = this.assetData.asset.serial_number
                    } else {
                        this.assetData = {}
                    }
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobVoltageTransformer'
                    this.signJob = true
                    this.$nextTick(() => {
                        this.prepareNewTestForm()
                    })
                } else if (node.asset == 'Circuit breaker') {
                    const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Circuit breaker")
                    const dataBreakerEntity = await window.electronAPI.getBreakerEntityByMrid(node.mrid)
                    const dto = BreakerMapping.mapEntityToDto(dataBreakerEntity.data)
                    if (dataBreakerEntity.success) {
                        this.assetData = dto
                    } else {
                        this.assetData = {}
                    }
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobCircuitBreaker'
                    this.signJob = true
                    this.$nextTick(() => {
                        this.prepareNewTestForm()
                    })
                } else if (node.asset == 'Transformer') {
                    const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Transformer")
                    const dataTransformerEntity = await window.electronAPI.getTransformerEntityByMrid(node.mrid)
                    const dto = TransformerMapping.transformerEntityToDto(dataTransformerEntity.data)
                    if (dataTransformerEntity.success) {
                        this.assetData = dto
                    } else {
                        this.assetData = {}
                    }
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobTransformer'
                    this.signJob = true
                    this.$nextTick(() => {
                        this.prepareNewTestForm()
                    })
                } else if (node.asset == 'Bushing') {
                    const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Bushing")
                    const dataBushingEntity = await window.electronAPI.getBushingEntityByMrid(node.mrid)
                    if (dataBushingEntity.success) {
                        this.assetData = dataBushingEntity.data
                    } else {
                        this.assetData = {}
                    }
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobBushing'
                    this.signJob = true
                    this.$nextTick(() => {
                        this.prepareNewTestForm()
                    })
                } else if (node.asset == 'Capacitor') {
                    const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Capacitor")
                    const dataCapacitorEntity = await window.electronAPI.getCapacitorEntityByMrid(node.mrid)
                    if (dataCapacitorEntity.success) {
                        this.assetData = dataCapacitorEntity.data
                    } else {
                        this.assetData = {}
                    }
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobCapacitor'
                    this.signJob = true
                    this.$nextTick(() => {
                        this.prepareNewTestForm()
                    })
                } else if (node.asset == 'Reactor') {
                    const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Reactor")
                    const dataReactorEntity = await window.electronAPI.getReactorEntityByMrid(node.mrid)
                    if (dataReactorEntity.success) {
                        this.assetData = dataReactorEntity.data
                    } else {
                        this.assetData = {}
                    }
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobReactor'
                    this.signJob = true
                    this.$nextTick(() => {
                        this.prepareNewTestForm()
                    })
                } else if (node.asset == 'Rotating machine') {
                    const dataTestType = await window.electronAPI.getProcedureByGenericAssetModel("Rotating machine")
                    const dataRotatingMachineEntity = await window.electronAPI.getRotatingMachineEntityByMrid(node.mrid)
                    if (dataRotatingMachineEntity.success) {
                        this.assetData = dataRotatingMachineEntity.data
                    } else {
                        this.assetData = {}
                    }
                    if (dataTestType.success) {
                        this.testTypeListData = dataTestType.data
                    } else {
                        this.testTypeListData = []
                    }
                    this.checkJobType = 'JobRotatingMachine'
                    this.signJob = true
                    this.$nextTick(() => {
                        this.prepareNewTestForm()
                    })
                } else {
                    this.$message.error('This asset type does not support tests')
                }
            } catch (error) {
                this.parentOrganization = null
                this.$message.error('Some error occur')
                console.error(error)
            }
        },
    }
}
