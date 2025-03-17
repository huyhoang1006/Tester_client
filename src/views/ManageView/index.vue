<template>
    <div id="manage">
        <el-row id="top-bar">
            <el-col :span="24">
                <router-link :to="{name: 'home'}">
                    <el-button style="box-sizing: border-box; border-right: 1px solid #aeb6bf">
                        <i class="fa-solid fa-circle-arrow-left display-block fa-2x"></i>
                        <div class="mgt-10">Home</div>
                    </el-button>
                </router-link>
                <el-button @click="synchronize()">
                    <i class="fa-solid fa-rotate display-block fa-2x"></i>
                    <div class="mgt-10">Synchronize</div>
                </el-button>
                
                <!-- <router-link :to="{name: 'synchronize'}">
                    <el-button>
                        <i class="fa-solid fa-rotate display-block fa-2x"></i>
                        <div class="mgt-10">Synchronize</div>
                    </el-button>
                </router-link> -->
                <el-button style="float: right; text-align: right; width: fit-content; cursor: default">
                    <img src="@/assets/images/logo.png" style="max-height: 40px" />
                </el-button>
            </el-col>
        </el-row>
        <el-row id="main-content">
            <el-col class="h-100 customize-main size-hover loc_">  
                <location-component @cancelReload="cancelReload" :reload="this.reloadUploadData"></location-component>
            </el-col>
            <el-col class="h-100 customize resizer size-slide loc_as"> 
            </el-col>
            <el-col class="h-100 customize-main size-hover as_">
                <asset-component></asset-component>
            </el-col>
            <el-col class="h-100 customize resizer size-slide as_job"> 
            </el-col>
            <el-col class="h-100 customize-main size-hover job_">
                <job-component></job-component>
            </el-col>
            <div v-if="this.showOption" class="rectangle">
                <el-button @click="handleUpload" style="width: 100%;">
                    Upload template
                </el-button>
                <el-button @click="handleShow" style="width: 100%; margin-left: 0px;">
                    Show template
                </el-button>
                <el-button @click="handleUploadReport" style="width: 100%; margin-left: 0px;">
                    Upload report
                </el-button>
                <el-button @click="handleExportShow" style="width: 100%; margin-left: 0px;">
                    Export report
                </el-button>
            </div>
        </el-row>
        <div :style="{left : left_}" @click="showOptionHandle" class="triangle-right"></div>
        <upload-vue :var_="this.var_" :dialogVisible="this.dialogVisible" @dialogVisible-show="handleCloseUpload" @variable-show="handleCloseVar"></upload-vue>
        <variable-vue :showVar="this.showVar" @variable-show="handleCloseVar" @variable-data="getVar"></variable-vue>
        <showtemp-vue :showTemp="this.showTemp" @showtemp-show = "handleCloseShowTemp"></showtemp-vue>
        <upload-report-vue :uploadReport_show="this.uploadReport_show" @reload="reloadUpload" @upload-report="handleCloseUploadReport"></upload-report-vue>
        <export-report :showExport="this.showExport" @showExport-show = "handleCloseShowExport"></export-report>
    </div>
</template>

<script>
/* eslint-disable */
// @ is an alias to /src
import LocationComponent from './components/Location'
import AssetComponent from './components/Asset'
import JobComponent from './components/Job'
import uploadVue from './upload/upload.vue'
import variableVue from './upload/variable.vue'
import showtempVue from './showTemplate/showtemp.vue'
import uploadReportVue from './uploadReport/uploadReport.vue'
import exportReport from './exportReport/export.vue'

export default {
    components: {
        LocationComponent,
        AssetComponent,
        JobComponent,
        uploadVue,
        variableVue,
        showtempVue,
        uploadReportVue,
        exportReport
    },
    data() {
        return {
            reloadUploadData : false,
            showOption : false,
            left_ : "0px",
            dialogVisible : false,
            showVar : false,
            var_ : [],
            showTemp : false,
            uploadReport_show : false,
            showExport : false,
            element_main : Object,
            element_loc_as : Object,
            element_as_job : Object,
            element_loc : Object,
            element_as : Object,
            element_job : Object,
            loc_width : '',
            as_width : '',
            job_width : ''

        }
    },
    mounted:function() {

        this.element_loc = document.querySelector(".loc_")
        this.element_as = document.querySelector(".as_")
        this.element_job = document.querySelector(".job_")

        this.element_loc_as = document.querySelector(".loc_as")
        this.element_as_job = document.querySelector(".as_job")
        this.element_main = document.querySelector("#main-content")

        this.element_loc_as.addEventListener("mousedown", this.mouseDown_)
        this.element_as_job.addEventListener("mousedown", this.mouseDown)
        this.element_loc_as.addEventListener("mouseup", this.mouseUp)
        this.element_as_job.addEventListener("mouseup", this.mouseUp)

        this.loc_width = this.element_loc.offsetWidth
        this.as_width = this.element_as.offsetWidth
        this.job_width = this.element_job.offsetWidth
    },
    beforeMount() {
    },
    destroyed() {},
    methods: {
        showOptionHandle() {
           this.showOption = !this.showOption
           if(this.showOption === true) {
                this.left_ = "150px"
           } else {
                this.left_ = "0px"
           }
        },
        handleUpload() {
            this.dialogVisible = true
        },
        handleCloseUpload(data) {
            this.dialogVisible = data
        },
        handleCloseVar(data) {
            this.showVar = data
        },
        getVar(data) {
            this.var_ = data
        },
        handleShow() {
            this.showTemp = true
        },
        handleExportShow() {
            this.showExport = true
        },
        handleCloseShowTemp() {
            this.showTemp = false
        },
        handleCloseShowExport() {
            this.showExport = false
        },
        handleUploadReport() {
            this.uploadReport_show = true
        },
        handleCloseUploadReport() {
            this.uploadReport_show = false
        },
        reloadUpload(data) {
            this.reloadUploadData = data
        },
        cancelReload(data) {
            this.reloadUploadData = data
        },
        mouseDown() {
            this.element_main.addEventListener("mousemove", this.mouseMove)
        },
        mouseDown_() {
            this.element_main.addEventListener("mousemove", this.mouseMove_)
        },
        mouseMove(e) {
            this.element_main.addEventListener("mouseup", this.mouseUp)
            this.changeSize(e.clientX)
        },
        mouseMove_(e) {
            this.element_main.addEventListener("mouseup", this.mouseUp)
            this.changeSize_(e.clientX)
        },
        mouseUp() {
            this.element_main.removeEventListener("mousemove", this.mouseMove)
            this.element_main.removeEventListener("mousemove", this.mouseMove_)
            this.element_main.removeEventListener("mouseup", this.mouseUp)
        },
        changeSize_(client) {
            if(this.element_job.offsetWidth >= Math.round(3*this.job_width/2)) {
                if(client >= Math.round(this.loc_width/2) && client <= Math.round(this.loc_width)) {
                    let width_loc = this.element_loc.offsetWidth
                    this.element_loc.style.width = `${client-this.element_loc.offsetLeft}px`
                    this.element_as.style.width = `${this.element_as.offsetWidth + width_loc - this.element_loc.offsetWidth}px`
                }
            } else {
                if(client >= Math.round(this.loc_width/2) && client <= Math.round(this.loc_width/2)+this.as_width) {
                    let width_loc = this.element_loc.offsetWidth
                    this.element_loc.style.width = `${client-this.element_loc.offsetLeft}px`
                    this.element_as.style.width = `${this.element_as.offsetWidth + width_loc - this.element_loc.offsetWidth}px`
                }
            }
        },
        changeSize(client) {
            if(this.element_loc.offsetWidth >= Math.round(3*this.loc_width/2)) {
                if(client >= Math.round(this.loc_width + this.as_width) && client <= Math.round(this.loc_width +this.as_width +this.job_width/2)) {
                    let width = this.element_as.offsetWidth
                    this.element_as.style.width = `${client-this.element_as.offsetLeft}px`
                    this.element_job.style.width = `${this.element_job.offsetWidth + width - this.element_as.offsetWidth}px`
                }
            }
            else {
                if(client >= Math.round(this.loc_width/2 + this.as_width) && client <= Math.round(this.loc_width +this.as_width +this.job_width/2)) {
                    let width = this.element_as.offsetWidth
                    this.element_as.style.width = `${client-this.element_as.offsetLeft}px`
                    this.element_job.style.width = `${this.element_job.offsetWidth + width - this.element_as.offsetWidth}px`
                }
            }
        },
        synchronize() {
            if (navigator.onLine) {
                this.$router.push({name: 'synchronize'})
            } else {
                this.$message.error('No internet connection');
            }
        }
    }
}
</script>

<style lang="scss" scoped>
#manage {
    align-content: center;
    width: 100%;
    height: 100%;
    -webkit-user-select: none;
    user-select: none;
}
.triangle-right {
    position: absolute;
	height: 100px;
	border-top: 40px solid transparent;
	border-left: 10px solid #C0C0C0;
	border-bottom: 40px solid transparent;
    top: 50vh - 2.6vh;
    cursor: pointer;
}

.rectangle {
    height: calc(100% - 75px);
    width: 150px;
    background-color: #C0C0C0;
    position: absolute;
    top: 60px;
}

.resizer:hover {
    cursor: e-resize;
}
.resizer:active {
    cursor: e-resize;
}
.customize {
    width: 0.5%;
}
.customize-main {
    width: calc((100% - 1.5%)/3);
}
</style>