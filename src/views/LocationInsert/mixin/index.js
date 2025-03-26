import {mapState} from 'vuex'

export default {
    data() {
        return {
            properties: {
                positionPoints : {
                    x : [],
                    y : [],
                    z : []
                }
            },
            attachmentData : [],
            fileUrl : [],
            dataLoadAttachment : []
        }
    },
    computed: mapState(['user', 'selectedLocation']),
    methods: {
        async saveAttachement() {
        }
    }
}
