<template>
    <div id="location">
        <el-row id="top-bar">
            <el-col :span="24">
                <el-button @click="backToManage" style="box-sizing: border-box; border-right: 1px solid #aeb6bf">
                    <i class="fa-solid fa-circle-arrow-left display-block fa-2x"></i>
                    <div class="mgt-10">Manage</div>
                </el-button>
                <el-button :disabled="disable" @click="saveLocationData">
                    <i class="fa-solid fa-floppy-disk display-block fa-2x"></i>
                    <div class="mgt-10">Save Location</div>
                </el-button>
                <el-button style="float: right; text-align: right; width: fit-content; cursor: default">
                    <img src="@/assets/images/logo.png" style="max-height: 40px" />
                </el-button>
            </el-col>
        </el-row>
        <el-row style="height: fit-content;" :gutter="20" id="main-content">
            <div class="bolder" style="margin-left: 10px; margin-right: 10px; margin-top: 10px;"> {{ titleOwner }} </div>
            <hr style="background-color: black; height:1px; margin-left: 10px; margin-right: 10px; margin-top: 10px;">
            <el-col :span="8" class="col-content">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Company</span>
                    <el-divider></el-divider>
                    <el-form-item label="Name" prop="name">
                        <el-input v-model="owner.name"></el-input>
                    </el-form-item>
                    <el-form-item label="Address">
                        <el-input v-model="owner.address"></el-input>
                    </el-form-item>
                    <el-form-item label="City">
                        <el-input v-model="owner.city"></el-input>
                    </el-form-item>
                    <el-form-item label="State/ Province">
                        <el-input v-model="owner.state"></el-input>
                    </el-form-item>
                    <el-form-item label="Country">
                        <el-input v-model="owner.country"></el-input>
                    </el-form-item>
                    <el-form-item label="Phone no.">
                        <el-input v-model="owner.phone_no"></el-input>
                    </el-form-item>
                    <el-form-item label="Fax no.">
                        <el-input v-model="owner.fax"></el-input>
                    </el-form-item>
                    <el-form-item label="Email">
                        <el-input v-model="owner.email"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="8" class="col-content">
                <span class="bolder">Contact person</span>
                <el-divider></el-divider>
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <el-form-item label="Name">
                        <el-input v-model="owner.name_person"></el-input>
                    </el-form-item>
                </el-form>
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <el-form-item label="Phone no. 1">
                        <el-input v-model="owner.phone1"></el-input>
                    </el-form-item>
                </el-form>
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <el-form-item label="Phone no. 2">
                        <el-input v-model="owner.phone2"></el-input>
                    </el-form-item>
                </el-form>
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <el-form-item label="Fax no.">
                        <el-input v-model="owner.fax_contact"></el-input>
                    </el-form-item>
                </el-form>
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <el-form-item label="Email">
                        <el-input v-model="owner.email_contact"></el-input>
                    </el-form-item>
                </el-form>
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <el-form-item label="Department">
                        <el-input v-model="owner.department"></el-input>
                    </el-form-item>
                </el-form>
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <el-form-item label="Position">
                        <el-input v-model="owner.position"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="8" class="col-content">
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Comment </span>
                    <el-divider></el-divider>
                    <el-input type="textarea" rows="5" v-model="owner.comment"></el-input>
                    <Attachment v-if="$route.query.modeSave == 'editSave'" :attachment_="this.Attachment" title="owner" height="120px" @data-attachment = "getDataAttachment"></Attachment>
                </el-form>
            </el-col>
        </el-row>
        <div v-if="!['editInsert', 'editSave'].includes($route.query.modeSave)" style="float: right; margin: 50px;">
            <el-button @click="previousOwner()" type="danger">Previous</el-button>
            <el-button v-if="type !='owner1'" @click="nextOwner()" type="primary">Next</el-button>
            <el-button v-if="type =='owner1'" @click="saveLocationData" type="primary">Confirm</el-button>
        </div>
    </div>
</template>

<script>
import mixin from './mixin'
import Attachment from '../Common/Attachment.vue'
export default {
    components: { Attachment },
    name: 'OwnerView',
    mixins: [mixin],
    watch : {
        type : {
            handler(newVal) {
                if(newVal == 'owner3') {
                    this.titleOwner = "SUBSIDIARY (Level 3)"
                } else if(newVal == 'owner2') {
                    this.titleOwner = "SUBSIDIARY (Level 2)"
                } else if(newVal == 'owner1') {
                    this.titleOwner = "PARENT COMPANY (Level 1)"
                }
            },
        }
    },
    data() {
        return {
            labelWidth: `${200}px`,
            disable : true,
            owner : {
                name : '',
                streetAddress : '',
                postalAddress : '',
                electronicAddress : '',
                aliasName : '',
                phone1 : '',
                phone2 : '',
                fax : '',
                email : ''
            },
            dataLocation : {},
            copyOwner : [],
            type : "owner3",
            titleOwner : "SUBSIDIARY (Level 3)",
            Attachment : []
        }
    },
    methods: {
        getDataAttachment(rowData) {
            this.Attachment = rowData
        },
        backToManage() {
            this.$confirm('Do you want to exit?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(async () => {
                    this.$router.push({name: 'manage'})
                })
                .catch(() => {
                    return
                })
        },
        previousOwner() {
            if(this.type == 'owner3') {
                this.$router.push({name: 'locationInsert', query: {disable:true, dataLocation : this.dataLocation, copyOwner : this.copyOwner, type : 'locationAdd'}})
            } else if(this.type == 'owner2') {
                this.copyOwner[1] = JSON.parse(JSON.stringify(this.owner))
                this.owner = this.copyOwner[0]
                this.type = 'owner3'
            } else if(this.type == 'owner1') {
                this.copyOwner[2] = JSON.parse(JSON.stringify(this.owner))
                this.owner = this.copyOwner[1]
                this.type = 'owner2'
                this.disable = true
            }
        },
        nextOwner() {
            if(this.type == 'owner3') {
                this.copyOwner[0] = JSON.parse(JSON.stringify(this.owner))
                this.type = 'owner2'
                if(this.copyOwner.length < 2) {
                    for(let i in Object.keys(this.owner)) {
                        this.owner[Object.keys(this.owner)[i]] = ''
                    }
                } else {
                    this.owner = this.copyOwner[1]
                }
            } else if(this.type == 'owner2') {
                this.type = 'owner1'
                this.disable = false
                this.copyOwner[1] = JSON.parse(JSON.stringify(this.owner))
                if(this.copyOwner.length < 3) {
                    for(let i in Object.keys(this.owner)) {
                        this.owner[Object.keys(this.owner)[i]] = ''
                    }
                } else {
                    this.owner = this.copyOwner[2]  
                }
            }
        }
    },
    async mounted() {
        if(this.$route.query.dataLocation != undefined) {
            this.dataLocation = JSON.parse(JSON.stringify(this.$route.query.dataLocation))
        }
        if(this.$route.query.copyOwner != undefined) {
            this.copyOwner = JSON.parse(JSON.stringify(this.$route.query.copyOwner))
            this.owner = this.copyOwner[0]
        }
        if(this.$route.query.signCheck != undefined) {
            if(this.$route.query.signCheck == 1) {
                this.type = 'owner1'
            } else if(this.$route.query.signCheck == 2) {
                this.type = 'owner2'
            } else if(this.$route.query.signCheck == 3) {
                this.type = 'owner3'
            }
        }
        if(this.$route.query.modeSave != undefined) {
            if(this.$route.query.modeSave == 'editInsert') {
                if(this.$route.query.ownerData.signCheck == 1) {
                    this.type = 'owner2'
                } else if(this.$route.query.ownerData.signCheck == 2) {
                    this.type = 'owner3'
                }
            }
        }
    }, 
    async beforeMount() {
        if(this.$route.query.modeSave != undefined) {
            if(this.$route.query.modeSave == 'editSave') {
                const rs = await window.electronAPI.getOwnerById(this.$route.query.owner_id)
                const rt = await window.electronAPI.getAllAttachment(this.$route.query.owner_id, "owner") 

                if(rt.success) {
                    if(rt.data.length !== 0) {
                        this.Attachment = JSON.parse(rt.data[0].name)
                    }
                }

                if(rs.success) {
                    this.owner = rs.data[0]
                    this.disable = false
                }
            } else if(this.$route.query.modeSave == 'editInsert') {
                if(this.$route.query.ownerData.mode == 'owner1') {
                    this.owner.type = 'owner2'
                    this.owner.mode = 'owner2'
                } else if(this.$route.query.ownerData.mode == 'owner2') {
                    this.owner.type = 'owner3'
                    this.owner.mode = 'owner3'
                }
                this.disable = false
            }
        } 
    }
}
</script>
