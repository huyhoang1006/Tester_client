export default {
    methods: {
        async showPropertiesData(node) {
            this.assetPropertySign = false
            this.jobPropertySign = false
            if (node.asset != undefined) {
                this.assetPropertySign = true
                await this.mappingAssetProperties(node)
                await this.mappingProperties(node.parent)
                await this.loadPathMap(node)
                this.pathMapServer.push({
                    id: node.id,
                    parent: node.serial_no
                })
            } else if (node.type == 'test') {
                this.assetPropertySign = true
                this.jobPropertySign = true
                await this.mappingProperties(node.parent.parent.parent)
                await this.mappingAssetProperties(node.parent.parent)
                await this.mappingJobProperties(node.parent)
                await this.loadPathMap(node)
                this.pathMapServer.push({
                    id: node.id,
                    parent: node.name
                })
            } else if (node.type == 'job') {
                this.assetPropertySign = true
                this.jobPropertySign = true
                await this.mappingProperties(node.parent.parent)
                await this.mappingAssetProperties(node.parent)
                await this.mappingJobProperties(node)
                await this.loadPathMap(node)
                this.pathMapServer.push({
                    id: node.id,
                    parent: node.name
                })
            } else {
                await this.mappingProperties(node)
                await this.loadPathMap(node)
                this.pathMapServer.push({
                    id: node.id,
                    parent: node.name
                })
            }
        },
    }
}