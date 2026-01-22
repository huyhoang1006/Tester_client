export default {
    methods :{
        handleFmecaCancel() {
            this.signFmeca = false
        },

        handleFmecaConfirm() {
            this.signFmeca = false
            this.$message.success('Save successfully')
        },

        handleClickFmeca() {
            this.signFmeca = true
        },
    }
}