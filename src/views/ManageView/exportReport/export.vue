<template>
    <div>
        <el-dialog
        :visible.sync="showExport_"
        title="Export template"
        width="1000px"
        align-center
        :before-close="handleClose"
        class="ele"
        >
        <el-row :gutter="20">
            <el-select @change="changeName(nameTemp)" style="margin-right: 10px;" v-model="nameTemp" class="m-2" placeholder="Select" size="mini">
            <el-option
                v-for="item in listNameTemp"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>
            <el-select style="margin-right: 10px; width: 100px;" v-model="typeExport" class="m-2" placeholder="Select" size="mini">
                <el-option
                    key="PDF"
                    label="PDF"
                    value="PDF"
                />
                <el-option
                    key="EXCEL"
                    label="EXCEL"
                    value="EXCEL"
                />
            </el-select>
            <el-button size="mini" type="primary" @click="addRowTem"> <i class="fas fa-setting"></i>ADD ROW </el-button>
            <el-button size="mini" type="primary" @click="updateExcel"> <i class="fas fa-setting"></i>EXCEL FILE</el-button>
            <el-button size="mini" type="primary" @click="DeleteTemp"> <i class="fas fa-setting"></i> DELETE </el-button>
            <el-button size="mini" type="primary" @click="importData"> IMPORT </el-button>
            <el-button size="mini" type="primary" @click="exportData"> EXPORT </el-button>
            <el-button size="mini" type="primary" @click="refresh"> REFRESH </el-button>
            <br>
            <br>
        </el-row>
        <el-row :gutter="20">
            <el-col :span="12">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <el-form-item label="Location">
                        <el-select @change="changeLocation(location)" style="margin-right: 10px;" v-model="location" class="m-2" placeholder="Select" size="mini">
                            <el-option
                                v-for="(item, index) in listLocation"
                                    :key="index"
                                    :label="item"
                                    :value="item"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Type">
                        <el-select @change="changeNameType(nameType)" style="margin-right: 10px;" v-model="nameType" class="m-2" placeholder="Select" size="mini">
                            <el-option
                                v-for="item in listName"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Asset">
                        <el-select @change="changeNameAsset(nameAsset)" style="margin-right: 10px;" v-model="nameAsset" class="m-2" placeholder="Select" size="mini">
                            <el-option
                                v-for="(item, index) in listAsset"
                                    :key="index"
                                    :label="item"
                                    :value="item"
                            />
                        </el-select>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="12">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <el-form-item label="Job">
                        <el-select @change="changeNameJob(nameJob)" style="margin-right: 10px;" v-model="nameJob" class="m-2" placeholder="Select" size="mini">
                            <el-option
                                v-for="(item, index) in listJob"
                                    :key="index"
                                    :label="item"
                                    :value="item"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Test">
                        <el-select @change="changeNameTest(nameTest)" style="margin-right: 10px;" 
                        v-model="nameTest" class="m-2" placeholder="Select" size="mini"
                        multiple>
                            <el-option
                                v-for="(item, index) in listTest"
                                    :key="index"
                                    :label="item"
                                    :value="item"
                            />
                        </el-select>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <el-row style="margin-top: 20px;">
            <table class="table-strip-input-data" style="width: 100%; margin:auto">
                <thead>
                    <tr>
                        <th style="width: 25%;">Name</th>
                        <th style="width: 25%">Categories</th>
                        <th style="width: 30%;">Feature</th>
                        <th style="width: 10%;"></th>
                        <th style="width: 10%;"></th>
                    </tr>
                </thead>
                <tbody v-for="(item, index) in this.varible" :key="index">
                    <tr>
                        <td><el-input size="mini" v-model="item.name"></el-input></td>
                        <td>
                            <el-select filterable @change="changeCategories(item.categories, index)" style="width: 100%;" size="mini" v-model="item.categories" class="m-2" placeholder="Select">
                                <el-option
                                    v-for="value in list_categories"  
                                    :key="value.value"
                                    :label="value.label"
                                    :value="value.value">
                                </el-option>
                            </el-select>
                        </td>
                        <td>
                            <el-select @change="changeFeature(index)" filterable style="width: 100%;" size="mini" v-model="item.feature" class="m-2" placeholder="Select">
                                <el-option
                                    v-for="value in listFeature[index]"  
                                    :key="value.value"
                                    :label="value.label"
                                    :value="value.value">
                                </el-option>
                            </el-select>
                        </td>
                        <td>
                            <el-button size="mini" type="danger" class="w-100" @click="deleteListTem(varible, index)">
                                <i class="fas fa-trash"></i>
                            </el-button>
                        </td>
                        <td>
                            <el-button size="mini" type="primary" class="w-100" @click="addRowTable(varible, index)">
                                <i class="fa-solid fa-plus"></i>
                            </el-button>
                        </td>
                    </tr>
                    <template v-if='item.categories.includes("Transformer") || item.categories.includes("bushings") || item.categories.includes("tap_changers")'>
                        <tr v-if="item.feature != '' && Object.keys(listColumn[index]).includes(item.feature)">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeColumnAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.columnAddr" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listColumn[index][item.feature].columnAddr"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                        <tr v-if="item.columnAddr !== '' && !Object.keys(list_rowData).includes(item.columnAddr) && item.columnAddr !== 'comment'">
                            <td></td>
                            <td></td>
                            <td>
                                <el-input @change="changeRowAddr(index)" size="mini" v-model="item.rowAddr" >
                                </el-input>
                            </td>
                        </tr>
                        <tr v-if="item.columnAddr !== '' && Object.keys(list_rowData).includes(item.columnAddr) && item.columnAddr !== 'comment'">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeRowAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.rowAddr" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in list_rowData[item.columnAddr].columnAddr"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                    </template>
                    <template v-else-if='item.categories.includes("Circuit")'>
                        <tr v-if="item.feature != '' && Object.keys(listColumn[index]).includes(item.feature) && !['sf6MoiturePurity','sf6GasAnalysis'].includes(item.feature)">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeColumnAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.columnAddr" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listColumn[index][item.feature].columnAddr"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                        <template v-if="item.categories.includes('breaker test')">
                            <template v-if="!['sf6MoiturePurity','sf6GasAnalysis'].includes(item.feature)">
                                <tr v-if="item.columnAddr !== '' && !Object.keys(list_rowData).includes(item.columnAddr) && item.columnAddr !== 'comment'">
                                    <td></td>
                                    <td></td>
                                    <td>
                                        <el-input @change="changeRowAddr(index)" size="mini" v-model="item.rowAddr" >
                                        </el-input>
                                    </td>
                                </tr>
                                <tr v-if="item.columnAddr !== '' && Object.keys(list_rowData).includes(item.columnAddr) && item.columnAddr !== 'comment'">
                                    <td></td>
                                    <td></td>
                                    <td>
                                        <el-select @change="changeRowAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.rowAddr" class="m-2" placeholder="Select">
                                            <el-option
                                                v-for="value in list_rowData[item.columnAddr].columnAddr"  
                                                :key="value.value"
                                                :label="value.label"
                                                :value="value.value">
                                            </el-option>
                                        </el-select>
                                    </td>
                                </tr>
                            </template>
                            <template v-else>
                                <tr v-if="item.feature != ''">
                                    <td></td>
                                    <td></td>
                                    <td>
                                        <el-select @change="changeColumnAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.columnAddr" class="m-2" placeholder="Select">
                                            <el-option
                                                v-for="value in listColumn[index][item.feature].tableName"  
                                                :key="value.value"
                                                :label="value.label"
                                                :value="value.value">
                                            </el-option>
                                        </el-select>
                                    </td>
                                </tr>
                                <tr v-if="item.columnAddr !== ''">
                                    <td></td>
                                    <td></td>
                                    <td>
                                        <el-select @change="changeRowAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.rowAddr" class="m-2" placeholder="Select">
                                            <el-option
                                                v-for="value in listColumn[index][item.feature][item.columnAddr].columnAddr"  
                                                :key="value.value"
                                                :label="value.label"
                                                :value="value.value">
                                            </el-option>
                                        </el-select>
                                    </td>
                                </tr>
                                <tr v-if="item.rowAddr !== '' && !Object.keys(list_rowData).includes(item.rowAddr) && item.rowAddr !== 'comment'">
                                    <td></td>
                                    <td></td>
                                    <td>
                                        <el-input size="mini" v-model="item.attribute" >
                                        </el-input>
                                    </td>
                                </tr>
                                <tr v-if="item.rowAddr !== '' && Object.keys(list_rowData).includes(item.rowAddr) && item.rowAddr !== 'comment'">
                                    <td></td>
                                    <td></td>
                                    <td>
                                        <el-select filterable style="width: 100%;" size="mini" v-model="item.attribute" class="m-2" placeholder="Select">
                                            <el-option
                                                v-for="value in list_rowData[item.rowAddr].columnAddr"  
                                                :key="value.value"
                                                :label="value.label"
                                                :value="value.value">
                                            </el-option>
                                        </el-select>
                                    </td>
                                </tr>
                            </template>
                        </template>
                        <template v-if = 'item.categories.includes("assessment limits")'>
                            <tr v-if="item.columnAddr !== '' && Object.keys(assessmentLimitsTable).includes(item.feature) && !Object.keys(assessmentValue).includes(item.feature)">
                                <td></td>
                                <td></td>
                                <td>
                                    <el-select @change="changeRowAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.rowAddr" class="m-2" placeholder="Select">
                                        <el-option
                                            v-for="value in assessmentLimitsTable[item.feature][item.columnAddr].dataName"  
                                            :key="value.value"
                                            :label="value.label"
                                            :value="value.value">
                                        </el-option>
                                    </el-select>
                                </td>
                            </tr>
                            <tr v-if="item.rowAddr !== '' && Object.keys(assessmentLimitsTable).includes(item.feature) && !Object.keys(assessmentValue).includes(item.feature)">
                                <td></td>
                                <td></td>
                                <td>
                                    <el-select filterable style="width: 100%;" size="mini" v-model="item.attribute" class="m-2" placeholder="Select">
                                        <el-option
                                            v-for="value in assessmentLimitsTable[item.feature][item.columnAddr].attribute"  
                                            :key="value.value"
                                            :label="value.label"
                                            :value="value.value">
                                        </el-option>
                                    </el-select>
                                </td>
                            </tr>
                            <tr v-if="item.columnAddr !== '' && Object.keys(assessmentLimitsTable).includes(item.feature) 
                                                            && Object.keys(assessmentValue).includes(item.feature) && item.feature == 'auxContact'">
                                <td></td>
                                <td></td>
                                <td>
                                    <el-select @change="changeRowAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.rowAddr" class="m-2" placeholder="Select">
                                        <el-option
                                            v-for="value in assessmentValue[item.feature].tableName"  
                                            :key="value.value"
                                            :label="value.label"
                                            :value="value.value">
                                        </el-option>
                                    </el-select>
                                </td>
                            </tr>
                            <tr v-if="item.rowAddr !== '' && Object.keys(assessmentLimitsTable).includes(item.feature) 
                                                            && Object.keys(assessmentValue).includes(item.feature) && item.feature == 'auxContact'">
                                <td></td>
                                <td></td>
                                <td>
                                    <el-select @change="changeAttribute(index)" filterable style="width: 100%;" size="mini" v-model="item.attribute" class="m-2" placeholder="Select">
                                        <el-option
                                            v-for="value in assessmentValue[item.feature][item.columnAddr][item.rowAddr]"  
                                            :key="value.value"
                                            :label="value.label"
                                            :value="value.value">
                                        </el-option>
                                    </el-select>
                                </td>
                            </tr>
                            <tr v-if="item.attribute !== '' && Object.keys(assessmentLimitsTable).includes(item.feature) 
                                                            && Object.keys(assessmentValue).includes(item.feature) && item.feature == 'auxContact'">
                                <td></td>
                                <td></td>
                                <td>
                                    <el-select filterable style="width: 100%;" size="mini" v-model="item.coverData" class="m-2" placeholder="Select">
                                        <el-option
                                            v-for="value in assessmentValue[item.feature][item.columnAddr].columnAddr"  
                                            :key="value.value"
                                            :label="value.label"
                                            :value="value.value">
                                        </el-option>
                                    </el-select>
                                </td>
                            </tr>                        
                            <tr v-if="item.columnAddr != '' && Object.keys(assessmentLimitsTable).includes(item.feature) 
                                                            && Object.keys(assessmentValue).includes(item.feature) && item.feature != 'auxContact'">
                                <td></td>
                                <td></td>
                                <td>
                                    <el-select filterable style="width: 100%;" size="mini" v-model="item.rowAddr" class="m-2" placeholder="Select">
                                        <el-option
                                            v-for="value in assessmentValue[item.feature][item.columnAddr]"  
                                            :key="value.value"
                                            :label="value.label"
                                            :value="value.value">
                                        </el-option>
                                    </el-select>
                                </td>
                            </tr>
                        </template>
                    </template>
                    <template v-else-if='item.categories.includes("Current")'>
                        <tr v-if="item.feature != '' && Object.keys(listColumn[index]).includes(item.feature)  ">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeColumnAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.columnAddr" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listColumn[index][item.feature].columnAddr"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                        <tr v-if="item.columnAddr != '' && Object.keys(listRow[index]).includes(item.columnAddr)">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeRowAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.rowAddr" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listRow[index][item.columnAddr].columnAddr"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                        <tr v-if="item.rowAddr != '' && Object.keys(listAttribute[index]).includes(item.rowAddr)">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeAttribute(index)" filterable style="width: 100%;" size="mini" v-model="item.attribute" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listAttribute[index][item.rowAddr].columnAddr"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                        <tr v-if="item.attribute != '' && Object.keys(listAttribute[index]).includes(item.rowAddr)">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select filterable style="width: 100%;" size="mini" v-model="item.coverData" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listAttribute[index][item.rowAddr][item.attribute]"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                    </template>
                    <template v-else-if='item.categories.includes("Voltage")'>
                        <tr v-if="item.feature != '' && Object.keys(listColumn[index]).includes(item.feature)  ">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeColumnAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.columnAddr" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listColumn[index][item.feature].columnAddr"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                        <tr v-if="item.columnAddr != '' && Object.keys(listRow[index]).includes(item.columnAddr)">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeRowAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.rowAddr" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listRow[index][item.columnAddr].columnAddr"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                        <tr v-if="item.rowAddr != '' && Object.keys(listAttribute[index]).includes(item.rowAddr)">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeAttribute(index)" filterable style="width: 100%;" size="mini" v-model="item.attribute" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listAttribute[index][item.rowAddr].columnAddr"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                        <tr v-if="item.attribute != '' && Object.keys(listAttribute[index]).includes(item.rowAddr)">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select filterable style="width: 100%;" size="mini" v-model="item.coverData" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listAttribute[index][item.rowAddr][item.attribute]"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                    </template>
                    <template v-else-if='item.categories.includes("Disconnector")'>
                        <tr v-if="item.feature != '' && Object.keys(listColumn[index]).includes(item.feature)  ">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeColumnAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.columnAddr" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listColumn[index][item.feature].columnAddr"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                        <tr v-if="item.columnAddr != '' && Object.keys(listRow[index]).includes(item.columnAddr)">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeRowAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.rowAddr" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listRow[index][item.columnAddr].columnAddr"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                        <tr v-if="item.rowAddr != '' && Object.keys(listAttribute[index]).includes(item.rowAddr)">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeAttribute(index)" filterable style="width: 100%;" size="mini" v-model="item.attribute" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listAttribute[index][item.rowAddr].columnAddr"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                        <tr v-if="item.attribute != '' && Object.keys(listAttribute[index]).includes(item.rowAddr)">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select filterable style="width: 100%;" size="mini" v-model="item.coverData" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listAttribute[index][item.rowAddr][item.attribute]"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                    </template>
                    <template v-else-if='item.categories.includes("Power cable")'>
                        <tr v-if="item.feature != '' && Object.keys(listColumn[index]).includes(item.feature)  ">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeColumnAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.columnAddr" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listColumn[index][item.feature].columnAddr"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                        <tr v-if="item.columnAddr != '' && Object.keys(listRow[index]).includes(item.feature)">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeRowAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.rowAddr" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listRow[index][item.feature][item.columnAddr].columnAddr"
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                        <tr v-if="item.rowAddr != '' && item.columnAddr != 'layerConstruction' && Object.keys(listAttribute[index]).includes(item.rowAddr)">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeAttribute(index)" filterable style="width: 100%;" size="mini" v-model="item.attribute" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listAttribute[index][item.rowAddr].columnAddr"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                        <tr v-if="item.rowAddr != '' && Object.keys(list_rowData).includes(item.rowAddr)">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeAttribute(index)" filterable style="width: 100%;" size="mini" v-model="item.attribute" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in list_rowData[item.rowAddr].columnAddr"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                    </template>
                    <template v-else-if='item.categories.includes("Surge")'>
                        <tr v-if="item.feature != '' && Object.keys(listColumn[index]).includes(item.feature) ">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeColumnAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.columnAddr" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listColumn[index][item.feature].columnAddr"  
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                        <tr v-if="item.columnAddr != '' && Object.keys(listRow[index]).includes(item.columnAddr)">
                            <td></td>
                            <td></td>
                            <td>
                                <el-select @change="changeRowAddr(index)" filterable style="width: 100%;" size="mini" v-model="item.rowAddr" class="m-2" placeholder="Select">
                                    <el-option
                                        v-for="value in listRow[index][item.columnAddr].columnAddr"
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value">
                                    </el-option>
                                </el-select>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </el-row>
        <template #footer>
            <span class="dialog-footer footer">
                <el-button @click="handleClose()">Cancel</el-button>
                <el-button type="primary" @click="confirmData()">
                Confirm
                </el-button>
            </span>
        </template>
        </el-dialog>
    </div>
</template>

<script>
/* eslint-disable */
import list_categories from "@/views/ManageView/upload/constant/listcategories"
import location from "../upload/constant/location"
import transformer from "../upload/constant/transformer"
import circuitBreaker from "../upload/constant/circuitBreaker/circuitBreaker"
import operatingMechanism from "../upload/constant/circuitBreaker/operatingMechanism"
import operatingMechanismTable from "../upload/constant/circuitBreaker/operatingMechanismTable"
import assessmentLimits from "../upload/constant/circuitBreaker/AssessmentLimits"
import transformerTable from "../upload/constant/transformer/table"
import transformerJob from "../upload/constant/transformer/transformerJob"
import transformerTest from "../upload/constant/transformer/transformerTest"
import conditionData from "../upload/constant/condition/conditon"
import tableTest from "../upload/constant/transformer/tableTest"
import bushingData from "../upload/constant/transformer/bushing"
import bushingTable from "../upload/constant/transformer/bushingTable"
import tapChangerData from "../upload/constant/transformer/tapChanger"
import tapChangerTable from "../upload/constant/transformer/tapchangerTable"
import circuitBreakerData from "../upload/constant/circuitBreaker/circuitBreakers"
import assessmentLimitsTable from "../upload/constant/circuitBreaker/AssessmentTable"
import assessmentValue from "../upload/constant/circuitBreaker/AssessmentValue"
import circuitJob from "../upload/constant/circuitBreaker/circuitJob"
import circuitTest from "../upload/constant/circuitBreaker/circuitBreakerTest"
import circuitTableTest from "../upload/constant/circuitBreaker/circuitTableTest"
import * as currentTrans from "../upload/constant/currentTrans/index"
import * as voltageTrans from "../upload/constant/voltageTrans/index"
import * as disconnector from "../upload/constant/disconnector/index"
import * as powerCable from '../upload/constant/powerCable/index'
import * as surgeArrester from "../upload/constant/surgeArrester/index"
import {mapState} from 'vuex'
export default {
    name : 'exportReport',
    props : {
        showExport : Boolean
    },
    data() {
        return {
            listName : [
                {
                    label : 'Transformer',
                    value : 'transformer'
                },
                {
                    label : 'Circuit breaker',
                    value : 'circuit'
                },
                {
                    label : 'Current transformer',
                    value : 'current'
                },
                {
                    label : 'Voltage transformer',
                    value : 'voltage'
                },
                {
                    label : 'Disconnector',
                    value : 'disconnector'
                },
                {
                    label : 'Power cable',
                    value : 'power'
                },
                {
                    label : 'Surge Arrester',
                    value : 'surge'
                }
            ],
            listNameFull : [],
            listAssetFull : [],
            listJobFull : [],
            listTestFull : [],
            chosenLocation : '',
            chosenAsset : '',
            chosenJob : '',
            chosenTest : '',
            listAsset : [],
            listJob : [],
            listTest : [], 
            listLocation : [],
            nameType : '',
            nameAsset : '',
            nameJob : '',
            nameTest : [],
            location : '',
            labelWidth : '100px',
            listNameTemp : [],
            nameTemp : '',
            listFeature : [],
            listColumn : [],
            listRow : [],
            listAttribute : [],
            listCoverData : [],
            transformerTable : transformerTable,
            path : '',
            varible : [],
            list_categories : list_categories,
            list_rowData : conditionData,
            assessmentLimitsTable : assessmentLimitsTable,
            assessmentValue : assessmentValue,
            typeExport : '',
            chosenBushing : "",
            chosenTapChanger : "",
        }
    },
    /* eslint-disable */
    methods: {
        handleClose() {
            this.$emit('showExport-show', false)
        },
        changeLocation(location) {
            this.nameType = ''
            this.nameAsset = ''
            this.nameJob = ''
            this.nameTest = []
            this.chosenLocation = this.listNameFull.filter(x => x.name == location)[0]
        },
        async changeNameType(nameType) {
            this.nameAsset = ''
            this.nameJob = ''
            this.nameTest = []
            this.listAsset = []
            if(nameType == 'transformer') {
                let rs = await window.electronAPI.getAssets(this.chosenLocation.id)
                this.listAssetFull = rs.data
                for(let i in this.listAssetFull) {
                    this.listAsset.push(rs.data[i].serial_no)
                }
            } else if(nameType == 'circuit') {
                let rs = await window.electronAPI.getCircuitByLocationId(this.chosenLocation.id)
                this.listAssetFull = rs.data
                for(let i in this.listAssetFull) {
                    this.listAsset.push(JSON.parse(rs.data[i].properties).serial_no)
                }
            } else if(nameType == 'current') {
                let rs = await window.electronAPI.getCurrentVoltageByLocationId(this.chosenLocation.id)
                this.listAssetFull = rs.data
                for(let i in this.listAssetFull) {
                    this.listAsset.push(JSON.parse(rs.data[i].properties).serial_no)
                }
            } else if(nameType == 'voltage') {
                let rs = await window.electronAPI.getVoltageTransByLocationId(this.chosenLocation.id)
                this.listAssetFull = rs.data
                for(let i in this.listAssetFull) {
                    this.listAsset.push(JSON.parse(rs.data[i].properties).serial_no)
                }
            } else if(nameType == 'disconnector') {
                let rs = await window.electronAPI.getDisconnectorByLocationId(this.chosenLocation.id)
                this.listAssetFull = rs.data
                for(let i in this.listAssetFull) {
                    this.listAsset.push(JSON.parse(rs.data[i].properties).serial_no)
                }
            } else if(nameType == 'powerCable') {
                let rs = await window.electronAPI.getPowerCableByLocationId(this.chosenLocation.id)
                this.listAssetFull = rs.data
                for(let i in this.listAssetFull) {
                    this.listAsset.push(JSON.parse(rs.data[i].properties).serial_no)
                }
            } else if(nameType == 'surge') {
                let rs = await window.electronAPI.getSurgeArresterByLocationId(this.chosenLocation.id)
                this.listAssetFull = rs.data
                for(let i in this.listAssetFull) {
                    this.listAsset.push(JSON.parse(rs.data[i].properties).serial_no)
                }
            }
        },
        async changeNameAsset(nameAsset) {
            this.listJob = []
            this.nameJob = ''
            this.nameTest = []
            if(this.nameType == 'transformer') {
                this.chosenAsset = this.listAssetFull.filter(x => x.serial_no == nameAsset)[0]
                this.chosenBushing = (await window.electronAPI.getBushingsByAssetId(this.chosenAsset.id)).data
                this.chosenTapChanger = (await window.electronAPI.getTapChangerByAssetId(this.chosenAsset.id)).data
            } else {
                this.chosenAsset = this.listAssetFull.filter(x => JSON.parse(x.properties).serial_no == nameAsset)[0]
            }

            if(this.nameType == 'transformer') {
                let rs = await window.electronAPI.getJobs(this.chosenAsset.id)
                this.listJobFull = rs.data
                for(let i in this.listJobFull) {
                    this.listJob.push(rs.data[i].name)
                }
            } else if(this.nameType == 'circuit') {
                let rs = await window.electronAPI.getJobCircuit(this.chosenAsset.id)
                this.listJobFull = rs.data
                for(let i in this.listJobFull) {
                    this.listJob.push(rs.data[i].name)
                }
            } else if(this.nameType == 'current') {
                let rs = await window.electronAPI.getJobCurrentVoltage(this.chosenAsset.id)
                this.listJobFull = rs.data
                for(let i in this.listJobFull) {
                    this.listJob.push(rs.data[i].name)
                }
            } else if(this.nameType == 'voltage') {
                let rs = await window.electronAPI.getJobVoltageTrans(this.chosenAsset.id)
                this.listJobFull = rs.data
                for(let i in this.listJobFull) {
                    this.listJob.push(rs.data[i].name)
                }
            } else if(this.nameType == 'disconnector') {
                let rs = await window.electronAPI.getJobDisconnector(this.chosenAsset.id)
                this.listJobFull = rs.data
                for(let i in this.listJobFull) {
                    this.listJob.push(rs.data[i].name)
                }
            } else if(this.nameType == 'powerCable') {
                let rs = await window.electronAPI.getJobPowerCable(this.chosenAsset.id)
                this.listJobFull = rs.data
                for(let i in this.listJobFull) {
                    this.listJob.push(rs.data[i].name)
                }
            } else if(this.nameType == 'surge') {
                let rs = await window.electronAPI.getJobSurgeArrester(this.chosenAsset.id)
                this.listJobFull = rs.data
                for(let i in this.listJobFull) {
                    this.listJob.push(rs.data[i].name)
                }
            }
        },
        async changeNameJob(nameJob) {
            this.chosenJob = this.listJobFull.filter(x => x.name == nameJob)[0]
            this.listTestFull = []
            this.listTest = []
            if(this.nameType == 'transformer') {
                let rs = await window.electronAPI.getJobById(this.chosenJob.id)
                this.listTestFull = rs.data.testList
                for(let i in this.listTestFull) {
                    this.listTest.push(this.listTestFull[i].name)
                }
            } else if(this.nameType == 'circuit') {
                let rs = await window.electronAPI.getJobCircuitById(this.chosenJob.id)
                this.listTestFull = rs.data.testList
                for(let i in this.listTestFull) {
                    this.listTest.push(this.listTestFull[i].name)
                }
            } else if(this.nameType == 'current') {
                let rs = await window.electronAPI.getJobCurrentVoltageById(this.chosenJob.id)
                this.listTestFull = rs.data.testList
                for(let i in this.listTestFull) {
                    this.listTest.push(this.listTestFull[i].name)
                }
            } else if(this.nameType == 'voltage') {
                let rs = await window.electronAPI.getJobVoltageTransById(this.chosenJob.id)
                this.listTestFull = rs.data.testList
                for(let i in this.listTestFull) {
                    this.listTest.push(this.listTestFull[i].name)
                }
            } else if(this.nameType == 'disconnector') {
                let rs = await window.electronAPI.getJobDisconnectorById(this.chosenJob.id)
                this.listTestFull = rs.data.testList
                for(let i in this.listTestFull) {
                    this.listTest.push(this.listTestFull[i].name)
                }
            } else if(this.nameType == 'powerCable') {
                let rs = await window.electronAPI.getJobPowerCableById(this.chosenJob.id)
                this.listTestFull = rs.data.testList
                for(let i in this.listTestFull) {
                    this.listTest.push(this.listTestFull[i].name)
                }
            } else if(this.nameType == 'surge') {
                let rs = await window.electronAPI.getJobSurgeArresterById(this.chosenJob.id)
                this.listTestFull = rs.data.testList
                for(let i in this.listTestFull) {
                    this.listTest.push(this.listTestFull[i].name)
                }
            }
        },
        changeNameTest(nameTest) {
            this.chosenTest = this.listTestFull.filter(x => nameTest.includes(x.name))
        },
        async confirmData() {
            if(this.typeExport == '') {
                this.$message.error("Type of export can not be empty")
            } else {
                let file = {
                    var : this.varible,
                    path : this.path,
                    typeExport : this.typeExport
                }

                if(file.var.length == 0 || this.path == '') {
                    this.$message.error("Path or Template of export can not be null")
                } else {
                    let rs = ''
                    if(this.nameType == 'transformer') {
                        rs = await window.electronAPI.exportReport(file, this.chosenLocation, this.nameType, this.chosenAsset,
                        this.chosenJob, this.chosenTest, this.user.user_id, this.chosenBushing, this.chosenTapChanger)
                    } else {
                        rs = await window.electronAPI.exportReport(file, this.chosenLocation, this.nameType, this.chosenAsset,
                        this.chosenJob, this.chosenTest, this.user.user_id, null, null)
                    }
                    if(rs.success) {
                        this.$message.success("Successful")
                    }
                }
                this.$emit('showExport-show', false)
            }
        },
        async changeName(nameTemp) {
            const ra = await window.electronAPI.getTemplateByName(nameTemp)
            if(ra.success) {
                this.varible = JSON.parse(ra.data.temp.variable)
                this.path = ra.data.temp.path
                this.listFeature = []
                this.listColumn = []
                this.listRow = []
                for(let i in this.varible) {
                    this.reverseData(this.listFeature, this.listColumn, this.varible[i], this.listRow, this.listAttribute, this.listCoverData)
                }
            }
        },
        async refresh() {
            this.listNameTemp = []
            const rs = await window.electronAPI.getNameTemplate()
            if(rs.success) {
                const getListName = rs.data.nameTemp.map(obj => obj.name)
                for(let i= 0; i < getListName.length; i++) {
                    let data_ = {
                        value : getListName[i],
                        label : getListName[i]
                    }
                    this.listNameTemp.push(data_)
                }
            }
        },
        addRowTable(data, index) {
            const row = {
                name: '',
                categories: '',
                feature: '',
                columnAddr: '',
                rowAddr: '',
                attribute : '',
                coverData : '',
                address : []
            }
            data.splice(index+1, 0, row)
            this.listFeature.splice(index+1, 0, [])
            this.listColumn.splice(index+1, 0, [])
            this.listRow.splice(index+1, 0, [])
            this.listAttribute.splice(index+1, 0, [])
            this.listCoverData.splice(index+1, 0, [])
        },
        deleteListTem( data ,index) {
            data.splice(index, 1)
        },
        clearAll() {
            this.varible = []
        },
        addRowTem() {
            const row = {
                name: '',
                categories: '',
                feature: '',
                columnAddr: '',
                rowAddr: '',
                attribute : '',
                coverData : '',
                address : []
            }
            this.varible.push(row)
            this.listFeature.push([])
            this.listColumn.push([])
            this.listRow.push([])
            this.listAttribute.push([])
            this.listCoverData.push([])
        },
        changeFeature(index) {
            this.varible[index].columnAddr = ''
            this.varible[index].rowAddr = ''
            this.varible[index].attribute = ''
            this.varible[index].coverData = ''
        },
        changeColumnAddr(index) {
            this.varible[index].rowAddr = ''
            this.varible[index].attribute = ''
            this.varible[index].coverData = ''
        },
        changeRowAddr(index) {
            this.varible[index].attribute = ''
            this.varible[index].coverData = ''
        },
        changeAttribute(index) {
            this.varible[index].coverData = ''
        },
        changeCategories(data, index) {
            if(data === 'locations') {
                this.listFeature[index] = location
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
           }
           else if(data === 'Transformer') {
                this.listFeature[index] = transformer
                this.listColumn[index] = transformerTable
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
           }
           else if(data === 'Transformer job') {
                this.listFeature[index] = transformerJob
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
           }
           else if(data === 'Transformer test') {
                this.listFeature[index] = transformerTest
                this.listColumn[index] = tableTest
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
           }
           else if(data === 'Circuit breaker') {
                this.listFeature[index] = circuitBreaker
                this.listColumn[index] = circuitBreakerData
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
           }
           else if(data === 'Circuit breaker job') {
                this.listFeature[index] = circuitJob
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
           }
           else if(data === 'Circuit breaker test') {
                this.listFeature[index] = circuitTest
                this.listColumn[index] = circuitTableTest
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
           }
           else if(data === 'Circuit breaker operating mechanism') {
                this.listFeature[index] = operatingMechanism
                this.listColumn[index] = operatingMechanismTable
           }
           else if(data === 'Circuit breaker assessment limits') {
                this.listFeature[index] = assessmentLimits
                this.listColumn[index] = assessmentLimitsTable
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
           }
           else if(data === 'tap_changers') {
                this.listFeature[index] = tapChangerData
                this.listColumn[index] = tapChangerTable
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            }
            else if(data === 'bushings') {
                this.listFeature[index] = bushingData
                this.listColumn[index] = bushingTable
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            } else if(data == 'Current') {
                this.listFeature[index] = currentTrans.currentTransFeature.default
                this.listColumn[index] = currentTrans.currentTransdata.default
                this.listRow[index] = currentTrans.currentTransColumn.default
                this.listAttribute[index] = currentTrans.currentTransRow.default
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            } else if(data == 'Current job') {
                this.listFeature[index] = currentTrans.currentJob.default
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            } else if(data == 'Current test') {
                this.listFeature[index] = currentTrans.currentTest.default
                this.listColumn[index] = currentTrans.currentTableTest.default
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            } else if(data == 'Voltage') {
                this.listFeature[index] = voltageTrans.voltageFeature.default
                this.listColumn[index] = voltageTrans.voltageTrans.default
                this.listRow[index] = voltageTrans.voltageColumn.default
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            } else if(data == 'Voltage job') {
                this.listFeature[index] = voltageTrans.voltageJob.default
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            } else if(data == 'Voltage test') {
                this.listFeature[index] = voltageTrans.voltageTest.default
                this.listColumn[index] = voltageTrans.voltageTableTest.default
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            } else if(data == 'Disconnector') {
                this.listFeature[index] = disconnector.disconnectorFeature.default
                this.listColumn[index] = disconnector.disconnector.default
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            } else if(data == 'Disconnector job') {
                this.listFeature[index] = disconnector.disconnectorJob.default
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            } else if(data == 'Disconnector test') {
                this.listFeature[index] = disconnector.disconnectorTest.default
                this.listColumn[index] = disconnector.disconnectorTableTest.default
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            } else if(data == 'Power cable') {
                this.listFeature[index] = powerCable.powerCableFeature.default
                this.listColumn[index] = powerCable.powerCable.default
                this.listRow[index] = powerCable.powerCableColumn.default
                this.listAttribute[index] = powerCable.powerCableRow.default
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            } else if(data == 'Power cable job') {
                this.listFeature[index] = powerCable.powerCableJob.default
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            } else if(data == 'Power cable test') {
                this.listFeature[index] = powerCable.powerCableTest.default
                this.listColumn[index] = powerCable.powerCableTableTest.default
                this.listRow[index] = powerCable.powerCableRowTest.default
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            } else if(data == 'Surge') {
                this.listFeature[index] = surgeArrester.surgeArrester.default
                this.listColumn[index] = surgeArrester.surgeArresterFeature.default
                this.listRow[index] = surgeArrester.surgeFeature.default
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            } else if(data == 'Surge job') {
                this.listFeature[index] = surgeArrester.surgeJob.default
                this.listColumn[index] = ''
                this.listRow[index] = ''
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            } else if(data == 'Surge test') {
                this.listFeature[index] = surgeArrester.surgeArresterTest.default
                this.listColumn[index] = surgeArrester.surgeArresterTableTest.default
                this.listRow[index] = this.list_rowData
                this.varible[index].feature = ''
                this.varible[index].columnAddr = ''
                this.varible[index].rowAddr = ''
                this.varible[index].attribute = ''
                this.varible[index].coverData = ''
            }
        },
        async updateExcel() {
            if(this.nameTemp !== '') {
                const rs = await window.electronAPI.uploadCustom(this.nameTemp)
                if (rs.success) {
                    this.$message({
                        type: 'success',
                        message: 'upload completed'
                    })    
                } else {
                    this.$message.error("Upload interruption")
                }
            }
        },
        async DeleteTemp() {
            if(this.nameTemp !== '') {
                await window.electronAPI.deleteTempByName(this.nameTemp)
                this.nameTemp = ''
                this.listNameTemp = []
                this.varible = []
                const rs = await window.electronAPI.getNameTemplate()
                if(rs.success) {
                    const getListName = rs.data.nameTemp.map(obj => obj.name)
                    for(let i= 0; i < getListName.length; i++) {
                        let data_ = {
                            value : getListName[i],
                            label : getListName[i]
                        }
                        this.listNameTemp.push(data_)
                    }
                }
            }
        },
        async reverseData(listFeature, listColumn, data, listRow, listAttribute, listCoverData) {
            let row = []
            let feature = []
            let column = []
            let attribute = []
            let coverData = []

            if(data.categories === 'locations') {
                feature = location
            }
            else if(data.categories === 'Transformer') {
                feature = transformer
                column = transformerTable
            }
            else if(data.categories === 'Transformer job') {
                feature = transformerJob
            }
            else if(data.categories === 'Transformer test') {
                feature = transformerTest
                column = tableTest
            }
            else if(data.categories === 'Circuit breaker') {
                feature = circuitBreaker
                column = circuitBreakerData
            }
            else if(data.categories === 'Circuit breaker test') {
                feature = circuitTest
                column = circuitTableTest
            }
            else if(data.categories === 'Circuit breaker job') {
                feature = circuitJob
            }
            else if(data.categories === 'Circuit breaker operating mechanism') {
                feature = operatingMechanism
                column = operatingMechanismTable
            }
            else if(data.categories === 'Circuit breaker assessment limits') {
                feature = assessmentLimits
                column = assessmentLimitsTable
            }
            else if(data.categories == 'Current') {
                feature = currentTrans.currentTransFeature.default
                column = currentTrans.currentTransdata.default
                row = currentTrans.currentTransColumn.default
                attribute = currentTrans.currentTransRow.default
            }
            else if(data.categories == 'Current job') {
                feature = currentTrans.currentJob.default
            }
            else if(data.categories == 'Current test') {
                feature = currentTrans.currentTest.default
                column = currentTrans.currentTableTest.default
            }
            else if(data.categories === 'tap_changers') {
                feature = tapChangerData
                column = tapChangerTable
            }
            else if(data.categories === 'bushings') {
                feature = bushingData
                column = bushingTable
            }
            else if(data.categories == 'Voltage') {
                feature = voltageTrans.voltageFeature.default
                column = voltageTrans.voltageTrans.default
                row = voltageTrans.voltageColumn.default
            }
            else if(data.categories == 'Voltage job') {
                feature = voltageTrans.voltageJob.default
            }
            else if(data.categories == 'Voltage test') {
                feature = voltageTrans.voltageTest.default
                column = voltageTrans.voltageTableTest.default
            } 
            else if(data.categories == 'Disconnector') {
                feature = disconnector.disconnectorFeature.default
                column = disconnector.disconnector.default
            }
            else if(data.categories == 'Disconnector job') {
                feature = disconnector.disconnectorJob.default
            }
            else if(data.categories == 'Disconnector test') {
                feature = disconnector.disconnectorTest.default
                column = disconnector.disconnectorTableTest.default
            }
            else if(data.categories == 'Power cable') {
                feature = powerCable.powerCableFeature.default
                column = powerCable.powerCable.default
                row = powerCable.powerCableColumn.default
                attribute = powerCable.powerCableRow.default
            }
            else if(data.categories == 'Power cable job') {
                feature = powerCable.powerCableJob.default
            }
            else if(data.categories == 'Power cable test') {
                feature = powerCable.powerCableTest.default
                column = powerCable.powerCableTableTest.default
                row = powerCable.powerCableRowTest.default
            } else if(data.categories == 'Surge') {
                feature = surgeArrester.surgeArrester.default
                column = surgeArrester.surgeArresterFeature.default
                row = surgeArrester.surgeFeature.default
            } else if(data.categories == 'Surge job') {
                feature = surgeArrester.surgeJob.default
            } else if(data.categories == 'Surge test') {
                feature = surgeArrester.surgeArresterTest.default
                column = surgeArrester.surgeArresterTableTest.default
                row = this.list_rowData
            }

            listFeature.push(feature)
            listColumn.push(column)
            listRow.push(row)
            listAttribute.push(attribute)
            listCoverData.push(coverData)
        },
        async importData() {
            let varData = await window.electronAPI.getVariableFromJson()
            if(varData.success) {
                this.varible= varData.data
                this.listFeature = []
                this.listColumn = []
                this.listRow = []
                for(let i in this.varible) {
                    this.reverseData(this.listFeature, this.listColumn, this.varible[i], this.listRow, this.listAttribute, this.listCoverData)
                }
                this.$message({
                    type: 'success',
                    message: 'Import completed'
                })
            } else {
                this.$message.error("Import interruption")
            }
        },
        async exportData() {
            let varData = await window.electronAPI.exportVariableToJon(this.varible)
            if(varData.success) {
                this.$message({
                    type: 'success',
                    message: 'Export completed'
                })
            } else {
                this.$message.error("Export interruption")
            }
        }
    },
    async beforeMount() {
        const rs = await window.electronAPI.getLocations(this.user.user_id)
        this.listNameFull = rs.data
        for(let i in this.listNameFull) {
            this.listLocation.push(rs.data[i].name)
        }

        const rt = await window.electronAPI.getNameTemplate()
        if(rt.success) {
            const getListName = rt.data.nameTemp.map(obj => obj.name)
            for(let i= 0; i < getListName.length; i++) {
                let data_ = {
                    value : getListName[i],
                    label : getListName[i]
                }
                this.listNameTemp.push(data_)
            }
        }
    },
    computed : {
        ...mapState(['user']),
        showExport_() {
            return this.showExport
        }
    },
}
</script>

<style scoped>
.ele .el-dialog {
    height: auto;
    min-height: 50%;
}
.footer {
    position: absolute;
    right: 10px;
    bottom: 10px;
}
</style>