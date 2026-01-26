export default {
    methods:{
        async hideProperties() {
            this.propertiesSign = false
            const content = this.$refs.content
            content.style.width = '100%'
        },

        async hidePropertiesClient() {
            this.propertiesSignClient = false
            const content = this.getContentClientRef ? this.getContentClientRef() : this.$refs.contentClient;
            if (content) {
                content.style.width = '100%'
            }
        },
    }
}