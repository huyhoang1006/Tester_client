export default {
    methods: {
        async loadPathMap(node) {
            this.pathMapServer = []
            if (node != undefined) {
                if (node.parentArr != undefined) {
                    this.pathMapServer = [...node.parentArr]
                }
            }
        },

        async loadPathMapClient(node) {
            this.pathMapClient = []
            if (node != undefined) {
                if (node.parentArr != undefined) {
                    this.pathMapClient = [...node.parentArr]
                }
            }
        },
    }
}