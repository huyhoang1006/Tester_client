/* eslint-disable */
import BushingAssetDto from "@/views/Dto/BushingAsset/index.js";
export default {
    data() {
        return {
            attachmentData : [],
            bushing_data: new BushingAssetDto(),
        }
    },
    methods: {
        async saveAsset() {
            console.log("Saving Bushing Asset:", this.bushing_data);
            console.log("With attachments:", this.attachmentData);
        },
        resetForm() {
            this.bushing_data = new BushingAssetDto();
            this.attachmentData = [];
        }
    }
}