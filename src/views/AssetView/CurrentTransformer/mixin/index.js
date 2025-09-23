import CurrentTransformerDto from "@/views/Dto/CurrentTransformer";

export default {
    data() {
        return {
            currentTransformer: new CurrentTransformerDto(),
            old_data: new CurrentTransformerDto(),
            attachmentData: [],
        }
    },

    methods: {
        async saveAsset() {
            const data = JSON.parse(JSON.stringify(this.currentTransformer));
            console.log("data: ",data)

        }
    }

}