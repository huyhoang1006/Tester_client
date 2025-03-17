export default {
    props: {
        testCondition : Object,
        attachment : Array
    },
    computed: {
        conditions() {
            return this.testCondition.condition
        },
        equipments() {
            return this.testCondition.equipment
        },
        comments() {
            return this.testCondition.comment
        },
        attachments() {
            return this.attachment
        }
    },
    
}