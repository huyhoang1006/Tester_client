<template>
    
    <div>
        <el-dialog
            :visible.sync="sign"
            title="Add Manufacturer"
            width="35%"
            align-center
            :before-close="handleClose"
            draggable
        >
            <el-form label-width="100px" label-position="left" size="small">
                <el-form-item label="NAME">
                    <el-input v-model="name"></el-input>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button type="danger" @click="handleClose()" size="small">Cancel</el-button>
                <el-button type="primary" @click="handleConfirm()" size="small">Confirm</el-button>
            </span>

        </el-dialog>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name : "manufacturerAdd",
    props: {
        showAdd: {
            type : Boolean,
        },
        title: {
            type : String,
            require : true
        },
        modeManu : {
            require : true 
        },
        dataProperties: {
            require : true
        }
    },
    data() {
        return {
            sign : false,
            name : ''
        }
    },
    watch: {
        showAdd(newVal) {
            if(newVal == true) {
                this.sign = true
            }
        },
        modeManu(newVal) {
            if(newVal == 'edit') {
                this.name = JSON.parse(JSON.stringify(this.dataProperties.name))
            }
        }
    },
    
    methods:{
        handleClose() {
            this.sign = false
            this.$emit('backSign', false)
        },
        async handleConfirm() {
            if(this.modeManu == 'insert') {
                if(this.name == '') {
                    this.$message.error("Name can not be empty")
                } else {
                    const rs = await window.electronAPI.getManufacturerByName(this.name)
                    if(rs.success && rs.data.length !=0) {
                        var data = rs.data[0]

                        if(data.type == undefined || data.type == '' || data.type == null || data.type == 'null') {
                            data.type = this.title
                        } else {
                            if(!data.type.includes(this.title)) {
                                data.type = data.type + ',' + this.title
                            }
                        }
                        data.name = this.name
                        const rt = await window.electronAPI.updateManufacturerById(data.id, data)
                        if(rt.success) {
                            this.$message.success("Update success")
                        } else {
                            this.$message.error("Update error")
                        }
                    } else {
                        const rt = await window.electronAPI.insertManufacturer(this.name, this.title)
                        if(rt.success) {
                            this.$message.success("Insert success")
                        } else {
                            this.$message.error("Insert error")
                        }
                    }
                    this.sign = false
                    this.$emit('backSign', false)
                }
            } else if(this.modeManu == 'edit') {
                var data = {
                    id : this.dataProperties.id,
                    name : this.name,
                    type : this.dataProperties.type
                }
                if(data.name == '') {
                    this.$message.error("Name cannot be null")
                } else {
                    var rs = await window.electronAPI.updateManufacturerById(data.id, data)
                    if(rs.success) {
                        this.$message.success("Success")
                    } else {
                        this.$message.error("Error")
                    }
                }
                this.sign = false
                this.$emit('backSignUpdate', this.name)
            }
        },
    }
}
</script>

<style lang="scss" scoped>
</style>
