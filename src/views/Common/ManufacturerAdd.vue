<template>
    <div>
        <el-dialog custom-class="app-dialog" :visible.sync="sign" title="Add Manufacturer" width="35%" align-center
            :before-close="handleClose" :modal="true" append-to-body>
            <el-form label-width="100px" label-position="left" size="small">
                <el-form-item label="Name">
                    <el-input v-model="name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer custom-footer">
                <el-button class="footer-btn" type="danger" @click="handleClose()" size="small">Cancel</el-button>
                <el-button class="footer-btn" type="primary" @click="handleConfirm()" size="small">Confirm</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name: "manufacturerAdd",
    props: {
        showAdd: {
            type: Boolean,
        },
        title: {
            type: String,
            require: true
        },
        modeManu: {
            require: true
        },
        dataProperties: {
            require: true
        }
    },
    data() {
        return {
            sign: false,
            name: ''
        }
    },
    watch: {
        showAdd(newVal) {
            if (newVal == true) {
                this.sign = true
            }
        },
        modeManu(newVal) {
            if (newVal == 'edit') {
                this.name = JSON.parse(JSON.stringify(this.dataProperties.name))
            }
        }
    },

    methods: {
        handleClose() {
            this.sign = false
            this.$emit('backSign', false)
        },
        async handleConfirm() {
            if (this.modeManu == 'insert') {
                if (this.name == '') {
                    this.$message.error("Name can not be empty")
                } else {
                    const rs = await window.electronAPI.getManufacturerByName(this.name)
                    if (rs.success && rs.data.length != 0) {
                        var data = rs.data[0]

                        if (data.type == undefined || data.type == '' || data.type == null || data.type == 'null') {
                            data.type = this.title
                        } else {
                            if (!data.type.includes(this.title)) {
                                data.type = data.type + ',' + this.title
                            }
                        }
                        data.name = this.name
                        const rt = await window.electronAPI.updateManufacturerById(data.id, data)
                        if (rt.success) {
                            this.$message.success("Update success")
                        } else {
                            this.$message.error("Update error")
                        }
                    } else {
                        const rt = await window.electronAPI.insertManufacturer(this.name, this.title)
                        if (rt.success) {
                            this.$message.success("Insert success")
                        } else {
                            this.$message.error("Insert error")
                        }
                    }
                    this.sign = false
                    this.$emit('backSign', false)
                }
            } else if (this.modeManu == 'edit') {
                var data = {
                    id: this.dataProperties.id,
                    name: this.name,
                    type: this.dataProperties.type
                }
                if (data.name == '') {
                    this.$message.error("Name cannot be null")
                } else {
                    var rs = await window.electronAPI.updateManufacturerById(data.id, data)
                    if (rs.success) {
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
::v-deep(.custom-footer) {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

::v-deep(.custom-footer .footer-btn) {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100px;
}

::v-deep(.app-dialog) {
    box-sizing: border-box;
}

::v-deep(.app-dialog.el-dialog) {
    width: 35%;
    margin-top: 5vh !important;
    border-radius: 6px;
    max-height: 90vh;
    height: auto !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

::v-deep(.app-dialog .el-dialog__body) {
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

::v-deep(.app-dialog .el-dialog__body::-webkit-scrollbar) {
    width: 0px;
    height: 0px;
}

::v-deep(.app-dialog .el-dialog__footer) {
    padding: 10px 20px;
    border-top: 1px solid #ebeef5;
}

::v-deep(.el-dialog .el-form-item__label) {
    word-break: normal !important;
    overflow-wrap: break-word;
    white-space: normal;
}
</style>