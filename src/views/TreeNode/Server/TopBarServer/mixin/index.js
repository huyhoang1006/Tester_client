import Vue from "vue"

export default {
    methods: {
        async resetAllServer() {
            this.selectedNodes = []
            this.assetPropertySign = false
            this.jobPropertySign = false
            this.pathMapServer = []
            this.properties = {
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
            this.assetProperties = {
                asset: '',
                asset_type: '',
                serial_no: '',
                manufacturer: '',
                manufacturer_type: '',
                manufacturing_year: '',
                apparatus_id: '',
                country: ''
            }
            this.jobProperties = {
                name: '',
                work_order: '',
                creation_date: '',
                execution_date: '',
                tested_by: '',
                approved_by: '',
                ambient_condition: '',
                standard: ''
            }
            this.pageLocationSync = {
                first: 1,
                second: 2,
                third: 3,
                dot: '...',
                end: 10
            }
            this.displayPageLocationSync = {
                second: true,
                third: true,
                dot: true,
                end: true
            }
            this.pageLocationSyncInstance = {
                first: '',
                second: '',
                third: '',
                dot: '',
                end: ''
            }
            this.currentLocationSync = {
                nextP: '',
                previousP: '',
                current: 1
            }
            this.optionLocationSync = {
                mode: ''
            }
            this.ownerServerList = []
            this.count = ''
        },

        async resetPathServer(index) {
            if (index == 0) {
                let currentNode = this.ownerServerList.find((node) => node.id === this.pathMapServer[0].id)
                if (!currentNode) {
                    return // Không tìm thấy node đầu tiên
                }
                await this.clearSelection()
                await this.showPropertiesData(currentNode)
                Vue.set(currentNode, 'expanded', !currentNode.expanded)
            } else {
                let currentNode = this.ownerServerList.find((node) => node.id === this.pathMapServer[0].id)
                if (!currentNode) {
                    return // Không tìm thấy node đầu tiên
                }
                for (let i = 1; i <= index; i++) {
                    if (!currentNode.children) return // Nếu không có children thì dừng lại
                    currentNode = currentNode.children.find((child) => child.id === this.pathMapServer[i].id)
                    if (!currentNode) {
                        return // Không tìm thấy thì dừng lại
                    }
                }
                await this.clearSelection()
                await this.showPropertiesData(currentNode)
                Vue.set(currentNode, 'expanded', !currentNode.expanded)
            }
        },
    }
}