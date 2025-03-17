<template>
    <div>
        <el-dialog
            :visible.sync="dialogVisible_show"
            title="Option"
            width="30%"
            :before-close="handleClose"
        >
            <div>
                <el-input type="text" v-model="name_" placeholder="Please input">
                    <template #prepend>Template name</template>
                </el-input>
            </div>
            <br>
            <el-button @click="upload()" type="primary" plain><i class="fa fa-folder"></i> Upload (Excel)  </el-button>
            <el-button @click="createVar()" type="primary" plain><i class="fa fa-calculator" aria-hidden="true"></i> Initialize variable</el-button>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleClose">Cancel</el-button>
                    <el-button type="primary" @click="confirm()">
                    Confirm
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>
<script>


export default {
    data() {
        return {
            name_ : "",
            path_ : "",
        }
    },
    props : {
        dialogVisible : Boolean,
        showVar : Boolean,
        var_ : Array
    },
    computed : {
        dialogVisible_show() {
            return this.dialogVisible
        },
        getVar() {
            return this.var_
        }
    },
    methods: {
        handleClose() {
            this.$emit('dialogVisible-show', false)
        },
        async upload() {
            if(this.name_ == '') {
                this.$message.error("Name cannot be empty")
            } else {
                const rs = await window.electronAPI.uploadCustom(this.name_)
                if (rs.success) {
                    this.$message({
                        type: 'success',
                        message: 'upload completed'
                    })
                    this.path_ = rs.path
                } else {
                    this.$message.error("Upload interruption")
                }
            }
        },
        async createVar() {
            this.$emit('variable-show', true)
        },

        /* eslint-disable */
        async confirm() {
            if(this.name_ !== '') {
                if(this.path_ !== '') {
                    var data = {
                        name : this.name_,
                        path : this.path_,
                        var : this.var_
                    }
                    const ra = await window.electronAPI.checkNameTemplateExist(this.name_)
                    if(ra.data == true) {
                        this.$confirm('Do you want to update?', 'Warning', {
                            confirmButtonText: 'OK',
                            cancelButtonText: 'Cancel',
                            type: 'warning'
                        }).then(async () => {
                                const rs = await window.electronAPI.updateTempByName(data)
                                if(rs.success == true) {
                                    this.$message({
                                        type: 'success',
                                        message: 'Save template completed'
                                    })
                                    this.handleClose()
                                } else {
                                    this.$message.error("Update incomplete")
                                }
                            })
                            .catch(() => {
                                return
                            })
                    } else {
                        const rt = await window.electronAPI.saveTemplate(data)
                        if(rt.success) {
                            this.$message({
                                type: 'success',
                                message: 'Save template completed'
                            })
                            this.handleClose()
                        }
                        else {
                            this.$message.error("Save template incompleted")
                        }
                    }
                } else {
                    this.$message.error("Template cannot be null")
                }
            } else {
                this.$message.error("Template name cannot be null")
            }         
        }
    }
}
</script>

<style scoped>
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>