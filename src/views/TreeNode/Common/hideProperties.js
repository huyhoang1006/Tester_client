export default {
    methods:{
        async hideProperties() {
            this.propertiesSign = false
            const content = this.$refs.content
            content.style.width = '100%'
        },

        async hidePropertiesClient() {
            this.propertiesSignClient = false
            const content = this.$refs.contentClient
            content.style.width = '100%'
        },
    }
}