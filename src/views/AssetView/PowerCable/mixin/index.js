import PowerCableDto from "@/views/Dto/PowerCable"
export default {
    data() {
        return {
            powerCable: new PowerCableDto(),
            attachmentData: [],
            assessories: {
                terminal: {},
                joint: {},
                sheath_limits: {}
            }
        }
    },
    methods: {
    }
}