<template>
    <div>
        <el-dialog
            :visible.sync="uploadReportShow"
            title="Upload report"
            width="40%"
            :before-close="handleClose"
        >
        <div style="margin-left: 10%;">
        <el-select style="margin-right: 10px;" v-model="name" class="m-2" placeholder="Select" size="mini">
            <el-option
                v-for="item in listName"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
            />
        </el-select>
        <el-button size="mini" type="primary"  @click="getName()"> <i class="fas fa-setting"></i> REFRESH </el-button>
        <el-button size="mini" type="primary"  @click="uploadReport()"> <i class="fas fa-setting"></i> UPLOAD </el-button>
        </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleClose">Cancel</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>
<script>


export default {
    data() {
        return {
            name: '',
            listName : []
        }
    },
    props: {
        uploadReport_show : Boolean
    },
    computed : {
        uploadReportShow() {
            return this.uploadReport_show
        }
    },
    methods: {
        handleClose() {
            this.$emit('upload-report', false)
        },
        async uploadReport() {
            if(this.name !== '') {
                const rs = await window.electronAPI.uploadReport(this.name, this.$store.state.selectedAsset[0], this.$store.state.selectedLocation[0], this.$store.state.selectedJob[0], this.$store.state.user.user_id)
                console.log(rs)
                if(rs.success) {
                    this.$message({
                        type: 'success',
                        message: 'upload report completed'
                    })
                    this.handleClose()
                    this.$emit('reload', true)
                }
                else {
                    this.$message.error("Update interruption")
                }
            } else {
                this.$message.error("Template cannot be null")
            }
        },
        async getName() {
            const rs = await window.electronAPI.getNameTemplate()
            const getListName = rs.data.nameTemp.map(obj => obj.name)
            this.listName = []
            for(let i= 0; i < getListName.length; i++) {
                let data_ = {
                    value : getListName[i],
                    label : getListName[i]
                }
                this.listName.push(data_)
            }
        }
    },
    async beforeMount() {
        const rs = await window.electronAPI.getNameTemplate()
        if(rs.success) {
            const getListName = rs.data.nameTemp.map(obj => obj.name)
            for(let i= 0; i < getListName.length; i++) {
                let data_ = {
                    value : getListName[i],
                    label : getListName[i]
                }
                this.listName.push(data_)
            }
        }
    }
}
</script>