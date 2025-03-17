<template>
    <div class="mgy-5">
        <el-row>
            <el-col :span="24">
                <div class="header-toggle pointer" @click="openConfig = !openConfig">
                    <i v-if="openConfig" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    CT Configuration
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openConfig">
            <br/>
            <el-row style="width: 100%;" class="content">
                <el-col :span="8" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Cores">
                            <el-col :span="24" class="pdr-0">
                                <el-select @change="changeCoreData(configsData.cores)" style="width: 25%;" v-model="configsData.cores">
                                    <el-option v-for="item in 9" :key="item" :label="item" :value="item"> </el-option>
                                </el-select>
                            </el-col>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <br/>
            <el-row>
                <div id="cores">
                    <el-tabs v-if="!isNaN(parseInt(configsData.cores))" type="card" class="w-100 h-100">
                        <el-tab-pane v-for="(item,index) in this.configsData.dataCT" :key="index" :label="(index+1).toString()">
                            <el-row style="margin-top: 20px; background-color: #F5F5F5; width: 50%;">
                                <el-col :span="8" class="col-content margin-data">
                                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                                        <el-form-item label="Taps">
                                            <el-select @change="changeTap(item.taps, index), changedTap(item.taps, index)" v-model="item.taps">
                                                <el-option label="2" value="2"></el-option>
                                                <el-option label="3" value="3"></el-option>
                                                <el-option label="4" value="4"></el-option>
                                                <el-option label="5" value="5"></el-option>
                                                <el-option label="6" value="6"></el-option>
                                            </el-select>
                                        </el-form-item>
                                    </el-form>
                                </el-col>
                                <el-col :span="2" class="margin-data">
                                    <br/>
                                </el-col>
                                <el-col :span="8" class="col-content margin-data">
                                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                                        <el-form-item label="Common tap">
                                            <el-select @change="changeCommonTap(item.taps, index), chooseCommonTap(item.taps, item.commonTap, index), chosenCommonTap(item.taps, item.commonTap, index)" v-model="item.commonTap">
                                                <el-option label="1" value="1"></el-option>
                                                <el-option :label="item.taps" :value="item.taps"></el-option>
                                            </el-select>
                                        </el-form-item>
                                    </el-form>
                                </el-col>
                            </el-row>
                            <el-row style="margin-top: 30px; width: fit-content;">
                                <el-col :span="24">
                                    <div class="bolder">Full tap</div>
                                    <el-divider></el-divider>
                                    <br/>
                                    <div class="fulltap-data">
                                        <table style=" width: 100%; background-color: white;">
                                            <thead >
                                                <th class="last-left"></th>
                                                <th>Name</th>
                                                <th>Ipn</th>
                                                <th></th>
                                                <th>Isn</th>
                                                <th class="last-right">In use</th>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td class="last-left" style="width : 30px; cursor: pointer; border-left: none;" @click="item.fullTap.table.isShow = !item.fullTap.table.isShow">
                                                        <i v-if="!item.fullTap.table.isShow" class="fa-solid fa-caret-right"></i>
                                                        <i v-else class="fa-solid fa-caret-right fa-rotate-90"></i>
                                                    </td>
                                                    <td style="width : 60px;">{{ item.fullTap.table.name }}</td>
                                                    <td style="width : 250px;">
                                                        <el-input size="mini" v-model="item.fullTap.table.ipn">
                                                            <template slot="append">A</template>
                                                        </el-input>
                                                    </td>
                                                    <td style="width : 10px;">:</td>
                                                    <td style="width : 250px;">
                                                        <el-input size="mini" v-model="item.fullTap.table.isn">
                                                            <template slot="append">A</template>
                                                        </el-input>
                                                    </td>
                                                    <td style="width : 30px;" class="last-right"><el-checkbox @change="changeInuse(item.fullTap.table.inUse, index, '', 'fulltap')" v-model="item.fullTap.table.inUse" size="large" /></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div  v-if="item.fullTap.table.isShow" style="width: 80%; margin: auto; margin-top: 20px; margin-bottom;: 20px">
                                            <div class="bolder">Class ratings</div>
                                            <el-divider></el-divider>
                                            <el-row style="width: 100%;">
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="Application">
                                                            <el-select class="width-half" @change="appDataChange(index)" v-model="item.fullTap.classRating.app">
                                                                <el-option label="Choose application" value="chooseApp"></el-option>
                                                                <el-option label="Metering" value="metering"></el-option>
                                                                <el-option label="Protection" value="protection"></el-option>
                                                            </el-select>
                                                        </el-form-item>
                                                        <el-form-item v-if="ratingsData.standard != 'IEEEC5713'" label="Class">
                                                            <el-select class="width-half" v-if="item.fullTap.classRating.app === 'metering'" v-model="item.fullTap.classRating.class">
                                                                <el-option v-for="item in metering" :key="item" :label="item" :value="item"> </el-option>
                                                            </el-select>
                                                            <el-select class="width-half" v-else-if="item.fullTap.classRating.app === 'protection'" v-model="item.fullTap.classRating.class">
                                                                <el-option v-for="item in protection" :key="item" :label="item" :value="item"> </el-option>
                                                            </el-select>
                                                            <el-select class="width-half" @change="changeRatingClass(index, item.fullTap.classRating.class)" v-else v-model="item.fullTap.classRating.class">
                                                                <el-option v-for="item in multiple" :key="item" :label="item" :value="item"> </el-option>
                                                            </el-select>
                                                        </el-form-item>
                                                        <el-form-item v-else label="Class">
                                                            <el-select class="width-half" v-if="item.fullTap.classRating.app === 'metering'" v-model="item.fullTap.classRating.class">
                                                                <el-option v-for="item in multipleC57.metering" :key="item" :label="item" :value="item"> </el-option>
                                                            </el-select>
                                                            <el-select class="width-half" v-else-if="item.fullTap.classRating.app === 'protection'" v-model="item.fullTap.classRating.class">
                                                                <el-option v-for="item in multipleC57.protection" :key="item" :label="item" :value="item"> </el-option>
                                                            </el-select>
                                                            <el-select class="width-half" @change="changeRatingClassC57(index, item.fullTap.classRating.class)" v-else v-model="item.fullTap.classRating.class">
                                                                <el-option v-for="item in multipleC57.all" :key="item" :label="item" :value="item"> </el-option>
                                                            </el-select>
                                                        </el-form-item>
                                                        <el-form-item v-if="['PX', 'TPS', 'TPX', 'TPY', 'TPZ', 'X'].includes(item.fullTap.classRating.class) || protectionData.PR.includes(item.fullTap.classRating.class)" label="Winding resistance">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.wr">
                                                                <template slot="append">Ω</template>
                                                            </el-input>
                                                        </el-form-item>
                                                        <el-form-item v-if="item.fullTap.classRating.class == 'PX'" label="Kx">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.kx">
                                                            </el-input>
                                                        </el-form-item>
                                                        <el-form-item v-if="['X'].includes(item.fullTap.classRating.class)" label="RE(20*lsn)">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.re20lsn">
                                                                <template slot="append">%</template>
                                                            </el-input>
                                                        </el-form-item>
                                                        <el-form-item v-if="item.fullTap.classRating.class == 'TPS'" label="K">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.k"></el-input>
                                                        </el-form-item>
                                                        <el-form-item v-if="item.fullTap.classRating.app == 'metering'" label="FS">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.fs"></el-input>
                                                        </el-form-item>
                                                        <el-form-item v-if="['TPS', 'TPX', 'TPY', 'TPZ'].includes(item.fullTap.classRating.class)" label="KSSC">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.kssc"></el-input>
                                                        </el-form-item>
                                                        <el-form-item v-if="['TPX', 'TPY', 'TPZ'].includes(item.fullTap.classRating.class)" label="Ktd">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.ktd"></el-input>
                                                        </el-form-item>
                                                        <el-form-item v-if="['TPX', 'TPY'].includes(item.fullTap.classRating.class)" label="Duty">
                                                            <el-select class="width-half" v-model="item.fullTap.classRating.duty">
                                                                <el-option label="C-O" value="C-O"> </el-option>
                                                                <el-option label="C-O-C-O" value="C-O-C-O"> </el-option>
                                                            </el-select>
                                                        </el-form-item>
                                                        <el-form-item v-if="['C', 'K', 'T'].includes(item.fullTap.classRating.class)" label="Vb">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.vb">
                                                                <template slot="append">V</template>
                                                            </el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                            </el-row>
                                            <el-row v-if="item.fullTap.classRating.app == 'protection' && (protectionData.P.includes(item.fullTap.classRating.class) || protectionData.PR.includes(item.fullTap.classRating.class))" style="width: 100%;">
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="ALF">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.alf"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                                <el-col v-if="protectionData.PR.includes(item.fullTap.classRating.class)" :span="2">
                                                    <br/>
                                                </el-col>
                                                <el-col v-if="protectionData.PR.includes(item.fullTap.classRating.class)" :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="Ts">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.ts"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                            </el-row>
                                            <el-row v-if="item.fullTap.classRating.class == 'PX'" style="width: 100%;">
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="Ek">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.ek"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                                <el-col :span="2">
                                                    <br/>
                                                </el-col>
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="le">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.le"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                            </el-row>
                                            <el-row v-if="['PX', 'TPS'].includes(item.fullTap.classRating.class)" style="width: 100%;">
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="E1">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.e1"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                                <el-col :span="2">
                                                    <br/>
                                                </el-col>
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="le1">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.le1"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                            </el-row>
                                            <el-row v-if="item.fullTap.classRating.class == 'TPS'" style="width: 100%;">
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="Val">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.val"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                                <el-col :span="2">
                                                    <br/>
                                                </el-col>
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="lal">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.lal"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                            </el-row>
                                            <el-row v-if="['TPX', 'TPY'].includes(item.fullTap.classRating.class)" style="width: 100%;">
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="t1">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.t1"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                                <el-col :span="2">
                                                    <br/>
                                                </el-col>
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="tal1">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.tal1"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                            </el-row>
                                            <el-row v-if="['TPS', 'TPX', 'TPY', 'TPZ'].includes(item.fullTap.classRating.class)" style="width: 100%;">
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="Tp">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.tp"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                                <el-col v-if="['TPY', 'TPZ'].includes(item.fullTap.classRating.class)" :span="2">
                                                    <br/>
                                                </el-col>
                                                <el-col v-if="['TPY', 'TPZ'].includes(item.fullTap.classRating.class)" :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="Ts">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.tpts"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                            </el-row>
                                            <el-row v-if="['T', 'X'].includes(item.fullTap.classRating.class)" style="width: 100%">
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="Vk">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.vk"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                                <el-col :span="2">
                                                    <br/>
                                                </el-col>
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="lk">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.lk"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                            </el-row>
                                            <el-row v-if="['T', 'X'].includes(item.fullTap.classRating.class)" style="width: 100%; margin-bottom: 20px;">
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="Vk1">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.vk1"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                                <el-col :span="2">
                                                    <br/>
                                                </el-col>
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="lk1">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.lk1"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                            </el-row>
                                            <el-divider></el-divider>
                                            <el-row style="width: 100%; margin-top: 20px;">
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="Rated burden">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.rated_burden">
                                                                <template slot="append">VA</template>
                                                            </el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                                <el-col :span="2">
                                                    <br/>
                                                </el-col>
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="">
                                                            <el-checkbox v-model="item.fullTap.classRating.extended_burden" label="Extended burden" size="large" />
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                            </el-row>
                                            <el-row style="width: 100%;">
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="Burden">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.burden">
                                                                <template slot="append">VA</template>
                                                            </el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                                <el-col :span="2">
                                                    <br/>
                                                </el-col>
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="cos φ">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.burdenCos"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                            </el-row>
                                            <el-row style="width: 100%;">
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="Operating burden">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.operatingBurden">
                                                                <template slot="append">VA</template>
                                                            </el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                                <el-col :span="2">
                                                    <br/>
                                                </el-col>
                                                <el-col :span="11">
                                                    <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                        <el-form-item label="cos φ">
                                                            <el-input class="width-half" size="mini" v-model="item.fullTap.classRating.operatingBurdenCos"></el-input>
                                                        </el-form-item>
                                                    </el-form>
                                                </el-col>
                                            </el-row>
                                        </div>
                                    </div>
                                </el-col>
                            </el-row>

                            <el-row v-if="item.taps > 2 && item.commonTap != ''" style="margin-top: 50px; width: fit-content;">
                                <el-col style="width: 100%;">
                                    <div class="bolder">Main tap</div>
                                    <el-divider></el-divider>
                                    <br/>
                                    <div style="width: fit-content;" class="fulltap-data">
                                        <div v-for="element in (parseInt(item.taps) - 2)" :key='element'>
                                            <table style=" background-color: white;">
                                                <thead :class="nameColor(element, 'maintap')">
                                                    <th ></th>
                                                    <th >Name</th>
                                                    <th >Ipn</th>
                                                    <th ></th>
                                                    <th >Isn</th>
                                                    <th >In use</th>
                                                </thead>
                                                <tbody >
                                                    <tr>
                                                        <td class="last-left" style="width : 30px; cursor: pointer; border-left: none;" @click="item.mainTap.data[element-1].table.isShow = !item.mainTap.data[element-1].table.isShow">
                                                            <i v-if="!item.mainTap.data[element-1].table.isShow" class="fa-solid fa-caret-right"></i>
                                                            <i v-else class="fa-solid fa-caret-right fa-rotate-90"></i>
                                                        </td>
                                                        <td style="width : 60px;">{{ item.mainTap.data[element-1].table.name }}</td>
                                                        <td style="width : 250px;">
                                                            <el-input size="mini" v-model="item.mainTap.data[element-1].table.ipn">
                                                                <template slot="append">A</template>
                                                            </el-input>
                                                        </td>
                                                        <td style="width : 10px;">:</td>
                                                        <td style="width : 250px;">
                                                            <el-input size="mini" v-model="item.mainTap.data[element-1].table.isn">
                                                                <template slot="append">A</template>
                                                            </el-input>
                                                        </td>
                                                        <td style="width: 30px;" ><el-checkbox @change="changeInuse(item.mainTap.data[element-1].table.inUse, index, element-1, 'maintap')" v-model="item.mainTap.data[element-1].table.inUse" /></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <div  v-if="item.mainTap.data[element-1].table.isShow" style="width: 80%; margin: auto; margin-top: 20px; margin-bottom: 20px">
                                                <el-row style="width: 100%; margin-top: 20px;">
                                                    <el-col :span="11">
                                                        <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                            <el-form-item label="Rated burden">
                                                                <el-input class="width-half" size="mini" v-model="item.mainTap.data[element-1].classRating.rated_burden">
                                                                    <template slot="append">VA</template>
                                                                </el-input>
                                                            </el-form-item>
                                                        </el-form>
                                                    </el-col>
                                                    <el-col :span="2">
                                                        <br/>
                                                    </el-col>
                                                    <el-col :span="11">
                                                        <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                            <el-form-item label="">
                                                                <el-checkbox v-model="item.mainTap.data[element-1].classRating.extended_burden" label="Extended burden" size="large" />
                                                            </el-form-item>
                                                        </el-form>
                                                    </el-col>
                                                </el-row>
                                                <el-row style="width: 100%;">
                                                    <el-col :span="11">
                                                        <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                            <el-form-item label="Burden">
                                                                <el-input class="width-half" size="mini" v-model="item.mainTap.data[element-1].classRating.burden">
                                                                    <template slot="append">VA</template>
                                                                </el-input>
                                                            </el-form-item>
                                                        </el-form>
                                                    </el-col>
                                                    <el-col :span="2">
                                                        <br/>
                                                    </el-col>
                                                    <el-col :span="11">
                                                        <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                            <el-form-item label="cos φ">
                                                                <el-input class="width-half" size="mini" v-model="item.mainTap.data[element-1].classRating.burdenCos"></el-input>
                                                            </el-form-item>
                                                        </el-form>
                                                    </el-col>
                                                </el-row>
                                                <el-row style="width: 100%;">
                                                    <el-col :span="11">
                                                        <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                            <el-form-item label="Operating burden">
                                                                <el-input class="width-half" size="mini" v-model="item.mainTap.data[element-1].classRating.operatingBurden">
                                                                    <template slot="append">VA</template>
                                                                </el-input>
                                                            </el-form-item>
                                                        </el-form>
                                                    </el-col>
                                                    <el-col :span="2">
                                                        <br/>
                                                    </el-col>
                                                    <el-col :span="11">
                                                        <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                            <el-form-item label="cos φ">
                                                                <el-input class="width-half" size="mini" v-model="item.mainTap.data[element-1].classRating.operatingBurdenCos"></el-input>
                                                            </el-form-item>
                                                        </el-form>
                                                    </el-col>
                                                </el-row>
                                            </div>
                                        </div>
                                    </div>
                                </el-col>
                            </el-row>
                            <el-row v-if="item.taps > 2 && item.commonTap != ''" style="margin-top: 50px; width: fit-content;">
                                <el-col :span="24">
                                    <div class="bolder">Inter taps</div>
                                    <el-divider></el-divider>
                                    <br/>
                                    <div style="width: fit-content;" class="fulltap-data">
                                        <div v-for="(e, i) in item.interTap.data" :key="i">
                                            <table style=" width: 100%; background-color: white;">
                                                <thead :class="nameColor(i, 'intertap')">
                                                    <th></th>
                                                    <th>Name</th>
                                                    <th>Ipn</th>
                                                    <th></th>
                                                    <th>Isn</th>
                                                    <th>In use</th>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td   class="last-left" style="width : 30px; cursor: pointer; border-left: none;" @click="item.interTap.data[i].table.isShow = !item.interTap.data[i].table.isShow">
                                                            <i v-if="!item.interTap.data[i].table.isShow" class="fa-solid fa-caret-right"></i>
                                                            <i v-else class="fa-solid fa-caret-right fa-rotate-90"></i>
                                                        </td>
                                                        <td style="width : 60px;">{{ item.interTap.data[i].table.name }}</td>
                                                        <td style="width : 250px;">
                                                            <el-input size="mini" v-model="item.interTap.data[i].table.ipn">
                                                                <template slot="append">A</template>
                                                            </el-input>
                                                        </td>
                                                        <td style="width : 10px;">:</td>
                                                        <td style="width : 250px;">
                                                            <el-input size="mini" v-model="item.interTap.data[i].table.isn">
                                                                <template slot="append">A</template>
                                                            </el-input>
                                                        </td>
                                                        <td style="width : 30px;"><el-checkbox @change="changeInuse(item.interTap.data[i].table.inUse, index, i, 'intertap')" v-model="item.interTap.data[i].table.inUse" size="large" /></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <div  v-if="item.interTap.data[i].table.isShow" style="width: 80%; margin: auto; margin-top: 20px; margin-bottom: 20px">
                                                <el-row style="width: 100%; margin-top: 20px;">
                                                    <el-col :span="11">
                                                        <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                            <el-form-item label="Rated burden">
                                                                <el-input class="width-half" size="mini" v-model="item.interTap.data[i].classRating.rated_burden">
                                                                    <template slot="append">VA</template>
                                                                </el-input>
                                                            </el-form-item>
                                                        </el-form>
                                                    </el-col>
                                                    <el-col :span="2">
                                                        <br/>
                                                    </el-col>
                                                    <el-col :span="11">
                                                        <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                            <el-form-item label="">
                                                                <el-checkbox v-model="item.interTap.data[i].classRating.extended_burden" label="Extended burden" size="large" />
                                                            </el-form-item>
                                                        </el-form>
                                                    </el-col>
                                                </el-row>
                                                <el-row style="width: 100%;">
                                                    <el-col :span="11">
                                                        <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                            <el-form-item label="Burden">
                                                                <el-input class="width-half" size="mini" v-model="item.interTap.data[i].classRating.burden">
                                                                    <template slot="append">VA</template>
                                                                </el-input>
                                                            </el-form-item>
                                                        </el-form>
                                                    </el-col>
                                                    <el-col :span="2">
                                                        <br/>
                                                    </el-col>
                                                    <el-col :span="11">
                                                        <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                            <el-form-item label="cos φ">
                                                                <el-input class="width-half" size="mini" v-model="item.interTap.data[i].classRating.burdenCos"></el-input>
                                                            </el-form-item>
                                                        </el-form>
                                                    </el-col>
                                                </el-row>
                                                <el-row style="width: 100%;">
                                                    <el-col :span="11">
                                                        <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                            <el-form-item label="Operating burden">
                                                                <el-input class="width-half" size="mini" v-model="item.interTap.data[i].classRating.operatingBurden">
                                                                    <template slot="append">VA</template>
                                                                </el-input>
                                                            </el-form-item>
                                                        </el-form>
                                                    </el-col>
                                                    <el-col :span="2">
                                                        <br/>
                                                    </el-col>
                                                    <el-col :span="11">
                                                        <el-form :inline-message="true" label-width="150px" size="mini" label-position="left" style="width: 100%;">
                                                            <el-form-item label="cos φ">
                                                                <el-input class="width-half" size="mini" v-model="item.interTap.data[i].classRating.operatingBurdenCos"></el-input>
                                                            </el-form-item>
                                                        </el-form>
                                                    </el-col>
                                                </el-row>
                                            </div>
                                        </div>
                                    </div>
                                </el-col>
                            </el-row>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </el-row>
        </div>
    </div>
</template>

<script>
export default {
    name : "currentCTConfig",
    props : {
        configs : {
            type : Object,
            require : true,
        },
        ratings : {
            type : Object,
            require : true,
        }
    },
    data() {
        return {
            metering : ['Choose class', '0.1', '0.2', '0.2S', '0.5', '0.5S', '1', '3', '5'],
            protection : ['Choose class', '2P', '3P', '4P', '5P', '6P', '10P', '2PR', '3PR',
             '4PR', '5PR', '6PR', '10PR', 'PX', 'TPS', 'TPX', 'TPY', 'TPZ'],
            multiple : ['Choose class', '2P', '3P', '4P', '5P', '6P', '10P', '2PR', '3PR',
             '4PR', '5PR', '6PR', '10PR', 'PX', 'TPS', 'TPX', 'TPY', 'TPZ', 
             '0.1', '0.2', '0.2S', '0.5', '0.5S', '1', '3', '5'],
             protectionData : {
                P : ['2P', '3P', '4P', '5P', '6P', '10P'],
                PR : ['2PR', '3PR','4PR', '5PR', '6PR', '10PR'] 
            },
            multipleC57 : {
                all : ['Choose class', '0.15', '0.15N', '0.15S', '0.3', '0.3S', '0.6', '1.2', 'C', 'K', 'T', 'X'],
                metering : ['Choose class', '0.15', '0.15N', '0.15S', '0.3', '0.3S', '0.6', '1.2'],
                protection : ['Choose class', 'C', 'K', 'T', 'X']
            },
            ratedBurden : ['Choose burden', 'Custom', '2.5 VA', '5.0 VA', '10 VA', '15 VA', '30 VA'],
            openConfig : "true",
            labelWidth : `100px`,
            openMain : [],
            mainTapNumber : '2'

        }
    },
    beforeMount() {
        
    },
    watch : {
    },
    computed: {
        configsData() {
            return this.configs
        },
        ratingsData() {
            return this.ratings
        }
    },
    methods : {
        nameColor(element, label) {
            if(element != 1 && label == 'maintap') {
                return 'displayItem'
            }
            if(element != 0 && label == 'intertap') {
                return 'displayItem'
            }
        },
        changeCoreData(data) {
            console.log(this.configsData)
            if(this.configsData.dataCT.length === 0) {
                for(let i=0; i<this.configsData.cores; i++) {
                    if(i==0 && this.configsData.cores == 1) {
                        this.configsData.dataCT.push({
                            fullTap: {
                                table : {
                                    isShow : false,
                                    name : "S1 - S2"
                                },
                                classRating : {class : ''}
                            },
                            mainTap : {
                                data : [
                                ]
                            },
                            interTap : {
                                data : [
                                ]
                            }
                        })
                    }
                    else {
                        this.configsData.dataCT.push({
                            fullTap: {
                                table : {
                                    isShow : false,
                                    name : `${i+1}`+"S1 - " + `${i+1}` +"S"+2
                                },
                                classRating : {class : ''}
                            },
                            mainTap : {
                                data : [
                                ]
                            },
                            interTap : {
                                data : [
                                ]
                            }
                        })
                    }
                }
            } else {
                const length = this.configsData.dataCT.length
                if(data > length) {
                    for(let i=0; i<(data-length); i++) {
                        this.configsData.dataCT.push({
                            taps : 2,
                            commonTap : 1,
                            fullTap: {
                                table : {
                                    isShow : false,
                                    name : `${i+1+length}`+"S1 - " + `${i+1+length}` +"S2"
                                },
                                classRating : {
                                    class : ''
                                }
                            },
                            mainTap : {
                                data : [
                                ]
                            },
                            interTap : {
                            data : [
                            ]
                        }
                        })
                    }
                } else {
                    this.configsData.dataCT.splice(data, length-data)
                }
            }
            this.changeTap(this.configsData.dataCT[0].taps, 0)
        },
        changeCommonTap(data, index) {
            if(index == 0 && this.configsData.cores == 1) {
                this.configsData.dataCT[index].fullTap.table.name = "S1 - S" + data
            } else {
                this.configsData.dataCT[index].fullTap.table.name = `${index+1}`+"S1 - " + `${index+1}` +"S"+data
            }
        },
        chooseCommonTap(taps, commonTap, index) {
            if(index == 0 && this.configsData.cores == 1) {
                if(taps > commonTap) {
                    this.configsData.dataCT[index].mainTap.data.forEach((element, i) => {
                        element.table.name = "S1 - S" + `${i + 2}`
                    });
                } else {
                    this.configsData.dataCT[index].mainTap.data.forEach((element, i) => {
                        element.table.name = "S" + `${i+2}` + " - " + "S" + `${commonTap}`
                    });
                }
            } else {
                if(taps > commonTap) {
                    this.configsData.dataCT[index].mainTap.data.forEach((element, i) => {
                        element.table.name = `${index+1}`+"S1 - " + `${index+1}` +"S" + `${i + 2}`
                    });
                } else {
                    this.configsData.dataCT[index].mainTap.data.forEach((element, i) => {
                        element.table.name = `${index+1}`+"S" + `${i + 2}` + " - " + `${index+1}` +"S" + `${commonTap}`
                    });
                }
            }
        },

        async chosenCommonTap(taps, commonTap, index) {
            if(index == 0 && this.configsData.cores == 1) {
                if(taps > commonTap) {
                    this.configsData.dataCT[index].interTap.data.forEach((element, eIndex) => {
                        let count = 0
                        for(let i=2; i<= parseInt(taps); i++) {
                            for(let j=i+1; j<=taps; j++) {
                                if(count == eIndex) {
                                    element.table.name = "S" + `${i}` + " - " + "S" + `${j}`
                                }
                                count = count + 1
                            }
                        }
                    });
                } else {
                    this.configsData.dataCT[index].interTap.data.forEach((element, eIndex) => {
                        let count = 0
                        for(let i=parseInt(taps)-1; i> 1; i--) {
                            for(let j=i-1; j>=1; j--) {
                                if(count == eIndex) {
                                    element.table.name = "S" + `${j}` + " - " + "S" + `${i}`
                                }
                                count = count + 1
                            }
                        }
                    });
                }
            }
            else {
                if(taps > commonTap) {
                    this.configsData.dataCT[index].interTap.data.forEach((element, eIndex) => {
                        let count = 0
                        for(let i=2; i<= parseInt(taps); i++) {
                            for(let j=i+1; j<=taps; j++) {
                                if(count == eIndex) {
                                    element.table.name = `${index+1}`+"S" + `${i}` + " - " + `${index+1}` +"S" + `${j}`
                                }
                                count = count + 1
                            }
                        }
                    });
                } else {
                    this.configsData.dataCT[index].interTap.data.forEach((element, eIndex) => {
                        let count = 0
                        for(let i=parseInt(taps)-1; i> 1; i--) {
                            for(let j=i-1; j>=1; j--) {
                                if(count == eIndex) {
                                    element.table.name = `${index+1}`+"S" + `${j}` + " - " + `${index+1}` +"S" + `${i}`
                                }
                                count = count + 1
                            }
                        }
                    });
                }
            }
        },
        changeTap(data, index) {
            this.configsData.dataCT[index].commonTap = 1
            const lengthData = this.configsData.dataCT[index].mainTap.data.length
            if((parseInt(data) - 2) > lengthData) {
                for(let i=0; i < (parseInt(data) - lengthData - 2); i++) {
                    this.configsData.dataCT[index].mainTap.data.push({
                        table : {
                            isShow : false,
                            name : "test",
                            inUse : false
                        },
                        classRating : {}
                    })
                }
            } else if( (parseInt(data) - 2) < lengthData) {
                this.configsData.dataCT[index].mainTap.data.splice(1, lengthData - (parseInt(data)-2))
            }
            this.changeCommonTap(data, index)
            this.chooseCommonTap(data, this.configsData.dataCT[index].commonTap,  index)
            this.chosenCommonTap(data, this.configsData.dataCT[index].commonTap,  index)
        },
        async changedTap(data, index) {
            let dataArr = []
            for(let i=2; i<= parseInt(data); i++) {
                for(let j=i+1; j<=data; j++) {
                    dataArr.push({
                        table : {
                            isShow : false,
                            name : "test",
                            inUse : false
                        },
                        classRating : {}
                    })
                }
            }
            this.configsData.dataCT[index].interTap.data = dataArr
            await this.chosenCommonTap(data, this.configsData.dataCT[index].commonTap,  index)
        },
        appDataChange(index) {
            this.configsData.dataCT[index].fullTap.classRating.class = ''
        },
        changeRatingClass(index, data) {
            if(data == 'Choose class') {
                this.configsData.dataCT[index].fullTap.classRating.app = 'chooseApp'
            }
            else if(this.metering.includes(data)) {
                this.configsData.dataCT[index].fullTap.classRating.app = 'metering'
            } else {
                this.configsData.dataCT[index].fullTap.classRating.app = 'protection'
            }
        
        },
        changeRatingClassC57(index, data) {
            if(data == 'Choose class') {
                this.configsData.dataCT[index].fullTap.classRating.app = 'chooseApp'
            }
            else if(this.multipleC57.metering.includes(data)) {
                this.configsData.dataCT[index].fullTap.classRating.app = 'metering'
            } else {
                this.configsData.dataCT[index].fullTap.classRating.app = 'protection'
            }
        },
        changeInuse(data, index, elementIndex , label) {
            if(label == "fulltap" && data == true) {
                for(let i in this.configsData.dataCT[index].mainTap.data) {
                    this.configsData.dataCT[index].mainTap.data[i].table.inUse = false
                }
                for(let i in this.configsData.dataCT[index].interTap.data) {
                    this.configsData.dataCT[index].interTap.data[i].table.inUse = false
                }
            } else if(label == 'maintap' && data == true) {
                this.configsData.dataCT[index].fullTap.table.inUse = false
                for(let i in this.configsData.dataCT[index].mainTap.data) {
                    this.configsData.dataCT[index].mainTap.data[i].table.inUse = false
                }
                for(let i in this.configsData.dataCT[index].interTap.data) {
                    this.configsData.dataCT[index].interTap.data[i].table.inUse = false
                }
                this.configsData.dataCT[index].mainTap.data[elementIndex].table.inUse = true
            } else if(label == 'intertap' && data == true) {
                this.configsData.dataCT[index].fullTap.table.inUse = false
                for(let i in this.configsData.dataCT[index].mainTap.data) {
                    this.configsData.dataCT[index].mainTap.data[i].table.inUse = false
                }
                for(let i in this.configsData.dataCT[index].interTap.data) {
                    this.configsData.dataCT[index].interTap.data[i].table.inUse = false
                }
                this.configsData.dataCT[index].interTap.data[elementIndex].table.inUse = true
            }
        }
    }
}
</script>
<style scoped>
#cores > div.el-tabs__item.is-top.is-active {
    background-color: #012596;
    color: #fff;
}
table, thead, th, td {
    text-align: center;
    white-space: nowrap;
}
.width-half {
    width: 100%;
}
.margin-data {
    margin-left: 5px;
    margin-top: 5px;
}
.fulltap-data {
    background-color: #f5f5f5;
    border: 1px solid black;
}
.fulltap-data td, th {
    border: 1px solid #7f7f7f;
}
.fulltap-data table {
    border-collapse: collapse;
}
.fulltap-data th {
    border-top: none;
}

.displayItem {
    display: none;
}
</style>
