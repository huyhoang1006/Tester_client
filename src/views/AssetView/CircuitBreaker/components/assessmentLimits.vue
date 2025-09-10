<template>
    <div id="assessmentLimits" class="mgy-5">
        <el-row style="margin-top: 2%;">
            <el-col :span="8">
                <el-radio-group v-model="assessLimitsData.limits">
                    <el-radio label="Absolute" value="Absolute"></el-radio>
                    <el-radio label="Relative" value="Relative"></el-radio>
                </el-radio-group>
            </el-col>
        </el-row>
        <el-row style="margin-top: 2%;">
            <el-col :span="24">
                <div class="header-toggle pointer font_size_12" @click="openContacRes = !openContacRes">
                    <i v-if="openContacRes" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Contact resistance
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openContacRes">
            <el-row :gutter="20" class="content">
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>R min</th>
                                <th>R max</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Contact resistance</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.contactSys.abs.rmin">
                                        <template slot="append">&#181;&#8486;</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.contactSys.abs.rmax" >
                                        <template slot="append">&#181;&#8486;</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-else :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>R ref</th>
                                <th>R dev</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Contact resistance</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.contactSys.rel.rref">
                                        <template slot="append">&#181;&#8486;</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.contactSys.rel.rdev" >
                                        <template slot="append">&#181;&#8486;</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
            </el-row>
        </div>
        <el-row>
            <el-col :span="24">
                <div class="header-toggle pointer font_size_12" @click="openOperatingTime = !openOperatingTime">
                    <i v-if="openOperatingTime" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Operating time
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openOperatingTime">
            <el-row :gutter="20" class="content">
                <transition>
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>t min</th>
                                <th>t max</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in opening_times" :key="index">
                                <td>{{item}}</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.openTime.abs[index].tmin">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.openTime.abs[index].tmax" >
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-if="assessLimitsData.limits === 'Relative'" :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>t ref</th>
                                <th>- t dev</th>
                                <th>+ t dev</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in opening_times" :key="index">
                                <td>{{item}}</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.openTime.rel[index].rref">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.openTime.rel[index].tdevZ" >
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.openTime.rel[index].tdevN" >
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                </transition>
            </el-row>
        </div>
        <el-row>
            <el-col :span="24">
                <div class="header-toggle pointer font_size_12" @click="openContactTravel = !openContactTravel">
                    <i v-if="openContactTravel" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Contact travel
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openContactTravel">
            <el-row :gutter="20" class="content">
                <transition>
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>d min</th>
                                <th>d max</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in contact_travel" :key="index">
                                <td>{{item}}</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.contactTravel.abs[index].dmin">
                                        <template slot="append">mm</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.contactTravel.abs[index].dmax" >
                                        <template slot="append">mm</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-if="assessLimitsData.limits === 'Relative'" :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>d ref</th>
                                <th>d dev</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in contact_travel" :key="index">
                                <td>{{item}}</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.contactTravel.rel[index].dref">
                                        <template slot="append">mm</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.contactTravel.rel[index].ddev" >
                                        <template slot="append">mm</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                </transition>
            </el-row>
        </div>
        <el-row>
            <el-col :span="24">
                <div class="header-toggle pointer font_size_12" @click="openAuxContact = !openAuxContact">
                    <i v-if="openAuxContact" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Auxiliary contacts
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openAuxContact">
            <el-row :gutter="20" class="content">
                <transition>
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="12" class="col-content">
                    <div style="margin-top: 3%;" class="bolder">Trip operation</div>
                    <el-divider></el-divider>
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>t min</th>
                                <th>t max</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in Auxiliary_contact" :key="index">
                                <td>{{item}}
                                    <sub v-if="index===0">switch,a</sub>
                                    <sub v-if="index===1">a</sub>
                                    <sub v-if="index===2">switch,b</sub>
                                    <sub v-if="index===3">b</sub>
                                    <sub v-if="index===4">switch,w</sub>
                                    <sub v-if="index===5">w</sub>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.auxContact.abs.trip[index].tmin">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.auxContact.abs.trip[index].tmax" >
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-if="assessLimitsData.limits === 'Relative'" :span="12" class="col-content">
                    <div style="margin-top: 3%;" class="bolder">Trip operation</div>
                    <el-divider></el-divider>
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>t ref</th>
                                <th>t dev</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in Auxiliary_contact" :key="index">
                                <td>{{item}}
                                    <sub v-if="index===0">switch,a</sub>
                                    <sub v-if="index===1">a</sub>
                                    <sub v-if="index===2">switch,b</sub>
                                    <sub v-if="index===3">b</sub>
                                    <sub v-if="index===4">switch,w</sub>
                                    <sub v-if="index===5">w</sub>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.auxContact.rel.trip[index].tref">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.auxContact.rel.trip[index].tdef" >
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                </transition>
            </el-row>
            <el-row :gutter="20" class="content">
                <transition>
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="12" class="col-content">
                    <div style="margin-top: 3%;" class="bolder">Close operation</div>
                    <el-divider></el-divider>
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>t min</th>
                                <th>t max</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in Auxiliary_contact" :key="index">
                                <td>{{item}}
                                    <sub v-if="index===0">switch,a</sub>
                                    <sub v-if="index===1">a</sub>
                                    <sub v-if="index===2">switch,b</sub>
                                    <sub v-if="index===3">b</sub>
                                    <sub v-if="index===4">switch,w</sub>
                                    <sub v-if="index===5">w</sub>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.auxContact.abs.close[index].tmin">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.auxContact.abs.close[index].tmax" >
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-if="assessLimitsData.limits === 'Relative'" :span="12" class="col-content">
                    <div style="margin-top: 3%;" class="bolder">Close operation</div>
                    <el-divider></el-divider>
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>t ref</th>
                                <th>t dev</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in Auxiliary_contact" :key="index">
                                <td>{{item}}
                                    <sub v-if="index===0">switch,a</sub>
                                    <sub v-if="index===1">a</sub>
                                    <sub v-if="index===2">switch,b</sub>
                                    <sub v-if="index===3">b</sub>
                                    <sub v-if="index===4">switch,w</sub>
                                    <sub v-if="index===5">w</sub>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.auxContact.rel.close[index].tref">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.auxContact.rel.close[index].tdev" >
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                </transition>
            </el-row>
        </div>
        <el-row style="margin-top: 2%;">
            <el-col :span="24">
                <div class="header-toggle pointer font_size_12" @click="openMiscell = !openMiscell">
                    <i v-if="openMiscell" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Miscellaneous
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openMiscell">
            <el-row :gutter="20" class="content">
                <transition>
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Minimum</th>
                                <th>Maximum</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in miscellaneous" :key="index">
                                <td>{{item}}</td>
                                <td>
                                    <el-input v-if="index === 1" size="mini" v-model="assessLimitsData.miscell.abs[index].min">
                                    </el-input>
                                    <el-input v-else size="mini" v-model="assessLimitsData.miscell.abs[index].min">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input v-if="index === 1" size="mini" v-model="assessLimitsData.miscell.abs[index].max">
                                    </el-input>
                                    <el-input v-else size="mini" v-model="assessLimitsData.miscell.abs[index].max" >
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-if="assessLimitsData.limits === 'Relative'" :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Reference</th>
                                <th>Deviation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in miscellaneous" :key="index">
                                <td>{{item}}</td>
                                <td>
                                    <el-input v-if="index === 1" size="mini" v-model="assessLimitsData.miscell.rel[index].ref">
                                    </el-input>
                                    <el-input v-else size="mini" v-model="assessLimitsData.miscell.rel[index].ref">
                                        <template v-if="item !== 1" slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input v-if="index === 1" size="mini" v-model="assessLimitsData.miscell.rel[index].dev">
                                    </el-input>
                                    <el-input v-else size="mini" v-model="assessLimitsData.miscell.rel[index].dev" >
                                        <template v-if="item !== 1" slot="append">ms</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                </transition>
            </el-row>
        </div>
        <el-row style="margin-top: 2%;">
            <el-col :span="24">
                <div class="header-toggle pointer font_size_12" @click="openCoilChar = !openCoilChar">
                    <i v-if="openCoilChar" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Coil Characteristics
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openCoilChar">
            <el-row :gutter="20" class="content">
                <transition>
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Minimum</th>
                                <th>Maximum</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in coilCharacteristics" :key="index">
                                <td>{{item}}</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.coilCharacter.abs[index].min">
                                        <template v-if="index <= 3" slot="append">A</template>
                                        <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                        <template v-else slot="append">&#8486;</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.coilCharacter.abs[index].max" >
                                        <template v-if="index <= 3" slot="append">A</template>
                                        <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                        <template v-else slot="append">&#8486;</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-if="assessLimitsData.limits === 'Relative'" :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Reference</th>
                                <th>- Deviation</th>
                                <th>+ Deviation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in coilCharacteristics" :key="index">
                                <td>{{item}}</td>
                                    <el-input size="mini" v-model="assessLimitsData.coilCharacter.rel[index].ref">
                                        <template v-if="index <= 3" slot="append">A</template>
                                        <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                        <template v-else slot="append">&#8486;</template>
                                    </el-input>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.coilCharacter.rel[index].devZ">
                                        <template v-if="index <= 3" slot="append">A</template>
                                        <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                        <template v-else slot="append">&#8486;</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.coilCharacter.rel[index].devN">
                                        <template v-if="index <= 3" slot="append">A</template>
                                        <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                        <template v-else slot="append">&#8486;</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                </transition>
            </el-row>
        </div>
        <el-row style="margin-top: 2%;">
            <el-col :span="24">
                <div class="header-toggle pointer font_size_12" @click="openPickupVol = !openPickupVol">
                    <i v-if="openPickupVol" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Pickup voltage
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openPickupVol">
            <el-row :gutter="20" class="content">
                <transition>
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>V min</th>
                                <th>V max</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in pickupVoltage" :key="index">
                                <td>{{item}}</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.pickupVol.abs[index].vmin">
                                        <template slot="append">V</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.pickupVol.abs[index].vmax" >
                                        <template slot="append">V</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-if="assessLimitsData.limits === 'Relative'" :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>V ref</th>
                                <th>V dev</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in pickupVoltage" :key="index">
                                <td>{{item}}</td>
                                    <el-input size="mini" v-model="assessLimitsData.pickupVol.rel[index].vref">
                                        <template slot="append">V</template>
                                    </el-input>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.pickupVol.rel[index].vdev">
                                        <template slot="append">V</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                </transition>
            </el-row>
        </div>
        <el-row style="margin-top: 2%;">
            <el-col :span="24">
                <div class="header-toggle pointer font_size_12" @click="openMotorChar = !openMotorChar">
                    <i v-if="openMotorChar" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Motor Characteristics
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openMotorChar">
            <el-row :gutter="20" class="content">
                <transition>
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Minimum</th>
                                <th>Maximum</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in motorCharacteristics" :key="index">
                                <td>{{item}}</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.motorChar.abs[index].min">
                                        <template v-if="index === 1" slot="append">s</template>
                                        <template v-else-if="index === 3" slot="append">V</template>
                                        <template v-else slot="append">A</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.motorChar.abs[index].max" >
                                        <template v-if="index === 1" slot="append">s</template>
                                        <template v-else-if="index === 3" slot="append">V</template>
                                        <template v-else slot="append">A</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-if="assessLimitsData.limits === 'Relative'" :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Reference</th>
                                <th>Deviation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in motorCharacteristics" :key="index">
                                <td>{{item}}</td>
                                    <el-input size="mini" v-model="assessLimitsData.motorChar.rel[index].ref">
                                        <template v-if="index === 1" slot="append">s</template>
                                        <template v-else-if="index === 3" slot="append">V</template>
                                        <template v-else slot="append">A</template>
                                    </el-input>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.motorChar.rel[index].dev">
                                        <template v-if="index === 1" slot="append">s</template>
                                        <template v-else-if="index === 3" slot="append">V</template>
                                        <template v-else slot="append">A</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                </transition>
            </el-row>
        </div>
        <el-row style="margin-top: 2%;">
            <el-col :span="24">
                <div class="header-toggle pointer font_size_12" @click="openUnderVoltageR = !openUnderVoltageR">
                    <i v-if="openUnderVoltageR" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Under-voltage release
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openUnderVoltageR">
            <el-row :gutter="20" class="content">
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Minimum</th>
                                <th>Maximum</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>UV Coil Trip Voltage</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.underVoltageR.abs.min">
                                        <template slot="append">V</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.underVoltageR.abs.max" >
                                        <template slot="append">V</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-else :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Reference</th>
                                <th>Deviation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>UV Coil Trip Voltage</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.underVoltageR.rel.ref">
                                        <template slot="append">V</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.underVoltageR.rel.dev" >
                                        <template slot="append">V</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
            </el-row>
        </div>
        <el-row style="margin-top: 2%;">
            <el-col :span="24">
                <div class="header-toggle pointer font_size_12" @click="openOvercurrentR = !openOvercurrentR">
                    <i v-if="openOvercurrentR" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Under-voltage release
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openOvercurrentR">
            <el-row :gutter="20" class="content">
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Minimum</th>
                                <th>Maximum</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>OC Relay Trip Current</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.overcurrentR.abs.min">
                                        <template slot="append">A</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.overcurrentR.abs.max" >
                                        <template slot="append">A</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-else :span="12" class="col-content">
                    <table class="table-strip-input-data">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Reference</th>
                                <th>Deviation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>OC Relay Trip Current</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.overcurrentR.rel.ref">
                                        <template slot="append">A</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.overcurrentR.rel.dev" >
                                        <template slot="append">A</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>

export default {
    name : "AssessmentLimit",
    props : {
        assessLimits : {
            type : Object,
            require : true,
        }
    },
    data() {
        return {
            openContacRes : "true",
            openOperatingTime : "true",
            openContactTravel : "true",
            openAuxContact : "true",
            openMiscell : "true",
            openCoilChar : "true",
            openPickupVol : "true",
            openMotorChar : "true",
            openUnderVoltageR : "true",
            openOvercurrentR : "true",
            labelWidth : `300px`,
            opening_times : [
                "Opening time",
                "Opening sync. (contacts within a phase)",
                "Opening sync. (between breaker phases)",
                "Closing time",
                "Closing sync. (contacts within a phase)",
                "Closing sync. (between breaker phases)",
                "Reclosing time",
                "Open-Close time",
                "Close-Open time",
            ],
            contact_travel : [
                "Total travel, TT",
                "Over travel (Trip), OT",
                "Over travel (Close), OT",
                "Rebound (Trip), RB",
                "Rebound (Close), RB",
                "Contact wipe (Trip), CW",
                "Contact wipe (Close), CW",
                "Damping distance"
            ],
            Auxiliary_contact : [
                "Switching time (a-type),t",
                "diff. to main (a-type),Δt",
                "Switching time (b-type),t",
                "diff. to main (b-type),Δt",
                "Switching time (wiper),t",
                "Duration (wiper),Δt "
            ],
            miscellaneous : [
                "Bounce time",
                "Bounce count",
                "PIR close time",
                "Reaction time"
            ],
            coilCharacteristics : [
                "Peak close coil current",
                "Peak trip coil current",
                "Average close coil current",
                "Average trip coil current",
                "Average close coil voltage",
                "Average trip coil voltage",
                "Close coil resistance",
                "Trip coil resistance",
            ],
            pickupVoltage : [
                "Minimum pickup voltage (close)",
                "Minimum pickup voltage (trip)"
            ],
            motorCharacteristics : [
                "Inrush current",
                "Charging time",
                "Charging current",
                "Minimum voltage"
            ]
        }
    },
    computed: {
        assessLimitsData() {
            return this.assessLimits
        }
    }
}
</script>
<style scoped>
.el-input-group__append {
    width: 10px !important;
}

.font_size_12 {
    font-size: 12px !important;
}

::v-deep(.el-radio__label) {
    font-size: 12px !important;
}

table, th, td {
    white-space: nowrap;
    width: auto !important;
}
table, th {
    margin-bottom: 2%;
    margin-top: 2%;
    border-collapse: collapse;
    border: 1px solid !important;
    border-color: #808080 !important;
    font-size: 12px !important;
}
</style>