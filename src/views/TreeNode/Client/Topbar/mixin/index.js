import Vue from 'vue'
import mapClientAssetProperties from '@/utils/MapperClient/mapClientAssetProperties'
import mapClientJobProperties from '@/utils/MapperClient/mapClientJobProperties'
import mapClientProperties from '@/utils/MapperClient/mapClientProperties'
import treeNodeFind from '@/views/TreeNode/Common/treeNodeFindMixin'

export default {
    data() {
        return {
        }
    },
    mixins: [treeNodeFind],
    methods: {
        async resetAllClient() {
            this.selectedNodes = []
            this.assetPropertySignClient = false
            this.jobPropertySignClient = false
            this.pathMapClientData = []
            this.collapseAllClient()
            this.propertiesClient = {
                region: '',
                name: '',
                plant: '',
                address: '',
                city: '',
                state_province: '',
                postal_code: '',
                country: '',
                phone_no: '',
                email: ''
            }
            this.assetPropertiesClient = {
                asset: '',
                asset_type: '',
                serial_no: '',
                manufacturer: '',
                manufacturer_type: '',
                manufacturing_year: '',
                apparatus_id: '',
                country: ''
            }
            this.jobPropertiesClient = {
                name: '',
                work_order: '',
                creation_date: '',
                execution_date: '',
                tested_by: '',
                approved_by: '',
                ambient_condition: '',
                standard: ''
            }
            this.clientList = []
            this.count = ''
        },
        async resetPathClient(index) {
            // Tìm node tương ứng với index trong path
            // Ưu tiên dùng mrid nếu có, sau đó mới dùng id
            const targetId = this.pathMapClientData[0].mrid || this.pathMapClientData[0].id
            let currentNode = this.findNodeByIdOrMrid(targetId, this.organisationClientList)
            if (!currentNode) {
                return // Không tìm thấy node đầu tiên
            }
            // Tìm node theo path từ node đầu tiên đến index
            const target = this.pathMapClientData[index]
            currentNode = this.findNodeByIdOrMrid(
                target.mrid || target.id,
                this.organisationClientList
            )
            if (!currentNode) return
            // Cập nhật pathMapClient để chỉ giữ lại path từ đầu đến node hiện tại
            this.pathMapClientData = this.pathMapClientData.slice(0, index + 1)
            // 1️ reset toàn bộ tree
            this.collapseAllClient()
            // 2️ Chỉ OPEN ancestor (KHÔNG mở node được click)
            for (let i = 0; i < index; i++) {
                const pathNode = this.pathMapClientData[i]
                const node = this.findNodeByIdOrMrid(
                    pathNode.mrid || pathNode.id,
                    this.organisationClientList
                )
                if (node) {
                    Vue.set(node, 'expanded', true)
                }
            }
            // 3 ĐẢM BẢO node được click là CLOSE
            const clicked = this.pathMapClientData[index]
            const clickedNode = this.findNodeByIdOrMrid(
                clicked.mrid || clicked.id,
                this.organisationClientList
            )
            if (clickedNode) {
                Vue.set(clickedNode, 'expanded', false)
                // đóng toàn bộ con của nó (phòng trường hợp UI cache)
                this.collapseChildren(clickedNode)
            }
            // Force Vue update để đảm bảo UI được render lại đúng
            await this.$nextTick()
            // Load properties cho node hiện tại nhưng không load lại path
            this.$emit('clear-selection')
            // Gọi mapping properties nhưng không gọi loadPathMapClient và push lại
            this.assetPropertySignClient = false
            this.jobPropertySignClient = false
            if (currentNode.asset != undefined) {
                this.assetPropertySignClient = true
                this.assetPropertiesClient = mapClientAssetProperties(currentNode)
                // Tìm parent thực sự từ cây dữ liệu thay vì dùng currentNode.parent
                const parentNode = currentNode.parentId ? this.findNodeById(currentNode.parentId, this.organisationClientList) : null
                if (parentNode) {
                    this.propertiesClient = mapClientProperties(parentNode)

                }
            } else if (currentNode.type == 'test') {
                this.assetPropertySignClient = true
                this.jobPropertySignClient = true
                // Tìm parent thực sự từ cây dữ liệu
                // Test -> Job (parent)
                // Test -> Asset (parent.parent)
                // Test -> Location (parent.parent.parent)
                const jobNode = currentNode.parentId ? this.findNodeById(currentNode.parentId, this.organisationClientList) : null
                const assetNode = jobNode ? (jobNode.parentId ? this.findNodeById(jobNode.parentId, this.organisationClientList) : null) : null
                const locationNode = assetNode ? (assetNode.parentId ? this.findNodeById(assetNode.parentId, this.organisationClientList) : null) : null
                if (locationNode) {
                    this.propertiesClient = mapClientProperties(locationNode)
                }
                if (assetNode) {
                    this.assetPropertiesClient = mapClientAssetProperties(assetNode)
                }
                if (jobNode) {
                    this.jobPropertiesClient = mapClientJobProperties(jobNode)
                }
            } else if (currentNode.type == 'job') {
                this.assetPropertySignClient = true
                this.jobPropertySignClient = true
                // Tìm parent thực sự từ cây dữ liệu
                // Job -> Asset (parent)
                // Job -> Location (parent.parent)
                const assetNode = currentNode.parentId ? this.findNodeById(currentNode.parentId, this.organisationClientList) : null
                const locationNode = assetNode ? (assetNode.parentId ? this.findNodeById(assetNode.parentId, this.organisationClientList) : null) : null
                if (locationNode) {
                    this.propertiesClient = mapClientProperties(locationNode)
                }
                if (assetNode) {
                    this.assetPropertiesClient = mapClientAssetProperties(assetNode)
                }
                this.jobPropertiesClient = mapClientJobProperties(currentNode)
            } else {
                this.propertiesClient = mapClientProperties(currentNode)
            }
        },
        collapseChildren(node) {
            if (!node || !Array.isArray(node.children)) return
            node.children.forEach(child => {
                Vue.set(child, 'expanded', false)
                this.collapseChildren(child)
            })
        },
        collapseAllClient() {
            if (!Array.isArray(this.organisationClientList)) return
            this.organisationClientList.forEach(node => {
                Vue.set(node, 'expanded', false)
                this.collapseChildren(node)
            })
        },
    }
}