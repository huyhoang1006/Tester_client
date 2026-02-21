export default {
    methods: {
        async showProperties() {
            this.propertiesSign = true
            const content = this.$refs.content
            content.style.width = `calc(75% - 5px)`
        },

        async showPropertiesClient() {
            this.propertiesSignClient = true
            const content = this.getContentClientRef ? this.getContentClientRef() : this.$refs.contentClient;
            if (content) {
                content.style.width = `calc(75% - 5px)`
            }
        },
    }
}