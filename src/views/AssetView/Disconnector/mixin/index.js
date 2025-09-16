import DisconnectorDTO from "@/views/Dto/Disconnector"

export default {
    data() {
        return {
            disconnector : new DisconnectorDTO,
            attachmentData : []
        }
    },
    methods : {
        saveAsset() {
            if(this.$route.query.mode === "add" || this.$route.query.mode === "dup") {
                this.insertDisconnector()
            }
            else if(this.$route.query.mode === "edit") {
                this.updateDisconnector()
            }
        },
    }
}