<template>
    <div id="assessmentLimits" class="mgt-20">
        <el-row class="mgy-20">
            <el-col>
                <el-radio-group class="inline-radios" v-model="assessLimitsData.limits">
                    <el-radio style="margin-right: 8px;" label="Absolute" value="Absolute"></el-radio>
                    <el-radio label="Relative" value="Relative"></el-radio>
                </el-radio-group>
            </el-col>
        </el-row>
        <el-row class="mgy-5">
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
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
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
                                    <el-input size="mini" v-model="assessLimitsData.contact_resistance.abs.r_min.value">
                                        <template slot="append">&#181;&#8486;</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.contact_resistance.abs.r_max.value">
                                        <template slot="append">&#181;&#8486;</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-else :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
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
                                    <el-input size="mini" v-model="assessLimitsData.contact_resistance.rel.r_ref.value">
                                        <template slot="append">&#181;&#8486;</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.contact_resistance.rel.r_dev.value">
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
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
                        <thead>
                            <tr>
                                <th></th>
                                <th>t min</th>
                                <th>t max</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in opening_times" :key="index">
                                <td>{{item.label}}</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.operating_time.abs[item.value].t_min.value">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.operating_time.abs[item.value].t_max.value">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-if="assessLimitsData.limits === 'Relative'" :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
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
                                <td>{{item.label}}</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.operating_time.rel[item.value].t_ref.value">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.operating_time.rel[item.value].minus_t_dev.value">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.operating_time.rel[item.value].plus_t_dev.value">
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
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
                        <thead>
                            <tr>
                                <th></th>
                                <th>d min</th>
                                <th>d max</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in contact_travel" :key="index">
                                <td>{{item.label}}</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.contact_travel.abs[item.value].d_min.value">
                                        <template slot="append">mm</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.contact_travel.abs[item.value].d_max.value">
                                        <template slot="append">mm</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-if="assessLimitsData.limits === 'Relative'" :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
                        <thead>
                            <tr>
                                <th></th>
                                <th>d ref</th>
                                <th>d dev</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in contact_travel" :key="index">
                                <td>{{item.label}}</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.contact_travel.rel[item.value].d_ref.value">
                                        <template slot="append">mm</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.contact_travel.rel[item.value].d_dev.value">
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
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="18" class="col-content">
                    <div style="margin-top: 3%;" class="bolder">Trip operation</div>
                    <el-divider></el-divider>
                    <table class="table-strip-input-data" style="width: 100% !important;">
                        <thead>
                            <tr>
                                <th></th>
                                <th>t min</th>
                                <th>t max</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in Auxiliary_contact" :key="index">
                                <td>{{item.label}}
                                    <sub v-if="index===0">switch,a</sub>
                                    <sub v-if="index===1">a</sub>
                                    <sub v-if="index===2">switch,b</sub>
                                    <sub v-if="index===3">b</sub>
                                    <sub v-if="index===4">switch,w</sub>
                                    <sub v-if="index===5">w</sub>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.auxiliary_contacts.trip_operation.abs[item.value].t_min.value">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.auxiliary_contacts.trip_operation.abs[item.value].t_max.value">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-if="assessLimitsData.limits === 'Relative'" :span="18" class="col-content">
                    <div style="margin-top: 3%;" class="bolder">Trip operation</div>
                    <el-divider></el-divider>
                    <table class="table-strip-input-data" style="width: 100% !important;">
                        <thead>
                            <tr>
                                <th></th>
                                <th>t ref</th>
                                <th>t dev</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in Auxiliary_contact" :key="index">
                                <td>{{item.label}}
                                    <sub v-if="index===0">switch,a</sub>
                                    <sub v-if="index===1">a</sub>
                                    <sub v-if="index===2">switch,b</sub>
                                    <sub v-if="index===3">b</sub>
                                    <sub v-if="index===4">switch,w</sub>
                                    <sub v-if="index===5">w</sub>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.auxiliary_contacts.trip_operation.rel[item.value].t_ref.value">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.auxiliary_contacts.trip_operation.rel[item.value].t_dev.value">
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
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="18" class="col-content">
                    <div style="margin-top: 3%;" class="bolder">Close operation</div>
                    <el-divider></el-divider>
                    <table class="table-strip-input-data" style="width: 100% !important;">
                        <thead>
                            <tr>
                                <th></th>
                                <th>t min</th>
                                <th>t max</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in Auxiliary_contact" :key="index">
                                <td>{{item.label}}
                                    <sub v-if="index===0">switch,a</sub>
                                    <sub v-if="index===1">a</sub>
                                    <sub v-if="index===2">switch,b</sub>
                                    <sub v-if="index===3">b</sub>
                                    <sub v-if="index===4">switch,w</sub>
                                    <sub v-if="index===5">w</sub>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.auxiliary_contacts.close_operation.abs[item.value].t_min.value">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.auxiliary_contacts.close_operation.abs[item.value].t_max.value">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-if="assessLimitsData.limits === 'Relative'" :span="18" class="col-content">
                    <div style="margin-top: 3%;" class="bolder">Close operation</div>
                    <el-divider></el-divider>
                    <table class="table-strip-input-data" style="width: 100% !important;">
                        <thead>
                            <tr>
                                <th></th>
                                <th>t ref</th>
                                <th>t dev</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in Auxiliary_contact" :key="index">
                                <td>{{item.label}}
                                    <sub v-if="index===0">switch,a</sub>
                                    <sub v-if="index===1">a</sub>
                                    <sub v-if="index===2">switch,b</sub>
                                    <sub v-if="index===3">b</sub>
                                    <sub v-if="index===4">switch,w</sub>
                                    <sub v-if="index===5">w</sub>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.auxiliary_contacts.close_operation.rel[item.value].t_ref.value">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.auxiliary_contacts.close_operation.rel[item.value].t_dev.value">
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
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Minimum</th>
                                <th>Maximum</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in miscellaneous" :key="index">
                                <td>{{item.label}}</td>
                                <td>
                                    <el-input v-if="index === 1" size="mini" v-model="assessLimitsData.miscellaneous.abs[item.value].min.value">
                                    </el-input>
                                    <el-input v-else size="mini" v-model="assessLimitsData.miscellaneous.abs[item.value].min.value">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input v-if="index === 1" size="mini" v-model="assessLimitsData.miscellaneous.abs[item.value].max.value">
                                    </el-input>
                                    <el-input v-else size="mini" v-model="assessLimitsData.miscellaneous.abs[item.value].max.value">
                                        <template slot="append">ms</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-if="assessLimitsData.limits === 'Relative'" :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Reference</th>
                                <th>Deviation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in miscellaneous" :key="index">
                                <td>{{item.label}}</td>
                                <td>
                                    <el-input v-if="index === 1" size="mini" v-model="assessLimitsData.miscellaneous.rel[item.value].ref.value">
                                    </el-input>
                                    <el-input v-else size="mini" v-model="assessLimitsData.miscellaneous.rel[item.value].ref.value">
                                        <template v-if="item !== 1" slot="append">ms</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input v-if="index === 1" size="mini" v-model="assessLimitsData.miscellaneous.rel[item.value].dev.value">
                                    </el-input>
                                    <el-input v-else size="mini" v-model="assessLimitsData.miscellaneous.rel[item.value].dev.value">
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
        <el-row>
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
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Minimum</th>
                                <th>Maximum</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in coilCharacteristics" :key="index">
                                <td>{{item.label}}</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.coil_characteristics.abs[item.value].min.value">
                                        <template v-if="index <= 3" slot="append">A</template>
                                        <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                        <template v-else slot="append">&#8486;</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.coil_characteristics.abs[item.value].max.value">
                                        <template v-if="index <= 3" slot="append">A</template>
                                        <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                        <template v-else slot="append">&#8486;</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-if="assessLimitsData.limits === 'Relative'" :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
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
                                <td>{{item.label}}</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.coil_characteristics.rel[item.value].ref.value">
                                        <template v-if="index <= 3" slot="append">A</template>
                                        <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                        <template v-else slot="append">&#8486;</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.coil_characteristics.rel[item.value].minus_dev.value">
                                        <template v-if="index <= 3" slot="append">A</template>
                                        <template v-else-if="3 < index && index <= 5" slot="append">V</template>
                                        <template v-else slot="append">&#8486;</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.coil_characteristics.rel[item.value].plus_dev.value">
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
        <el-row>
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
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
                        <thead>
                            <tr>
                                <th></th>
                                <th>V min</th>
                                <th>V max</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in pickupVoltage" :key="index">
                                <td>{{item.label}}</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.pickup_voltage.abs[item.value].v_min.value">
                                        <template slot="append">V</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.pickup_voltage.abs[item.value].v_max.value">
                                        <template slot="append">V</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-if="assessLimitsData.limits === 'Relative'" :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
                        <thead>
                            <tr>
                                <th></th>
                                <th>V ref</th>
                                <th>V dev</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in pickupVoltage" :key="index">
                                <td>{{item.label}}</td>
                                <td>
                                <el-input size="mini" v-model="assessLimitsData.pickup_voltage.rel[item.value].v_ref.value">
                                    <template slot="append">V</template>
                                </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.pickup_voltage.rel[item.value].v_dev.value">
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
        <el-row>
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
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Minimum</th>
                                <th>Maximum</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in motorCharacteristics" :key="index">
                                <td>{{item.label}}</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.motor_characteristics.abs[item.value].min.value">
                                        <template v-if="index === 1" slot="append">s</template>
                                        <template v-else-if="index === 3" slot="append">V</template>
                                        <template v-else slot="append">A</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.motor_characteristics.abs[item.value].max.value">
                                        <template v-if="index === 1" slot="append">s</template>
                                        <template v-else-if="index === 3" slot="append">V</template>
                                        <template v-else slot="append">A</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-if="assessLimitsData.limits === 'Relative'" :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Reference</th>
                                <th>Deviation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in motorCharacteristics" :key="index">
                                <td>{{item.label}}</td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.motor_characteristics.rel[item.value].ref.value">
                                        <template v-if="index === 1" slot="append">s</template>
                                        <template v-else-if="index === 3" slot="append">V</template>
                                        <template v-else slot="append">A</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.motor_characteristics.rel[item.value].dev.value">
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
        <el-row>
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
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
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
                                    <el-input size="mini" v-model="assessLimitsData.under_voltage_release.abs.uv_coil_trip_voltage.min.value">
                                        <template slot="append">V</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.under_voltage_release.abs.uv_coil_trip_voltage.max.value">
                                        <template slot="append">V</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-else :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
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
                                    <el-input size="mini" v-model="assessLimitsData.under_voltage_release.rel.uv_coil_trip_voltage.ref.value">
                                        <template slot="append">V</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.under_voltage_release.rel.uv_coil_trip_voltage.dev.value">
                                        <template slot="append">V</template>
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
                <div class="header-toggle pointer font_size_12" @click="openOvercurrentR = !openOvercurrentR">
                    <i v-if="openOvercurrentR" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Overcurrent release
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openOvercurrentR">
            <el-row :gutter="20" class="content">
                <el-col v-if="assessLimitsData.limits === 'Absolute'" :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
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
                                    <el-input size="mini" v-model="assessLimitsData.overcurrent_release.abs.oc_replay_trip_current.min.value">
                                        <template slot="append">A</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.overcurrent_release.abs.oc_replay_trip_current.max.value">
                                        <template slot="append">A</template>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
                <el-col v-else :span="18" class="col-content">
                    <table class="table-strip-input-data" style="width: 100% !important;">
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
                                    <el-input size="mini" v-model="assessLimitsData.overcurrent_release.rel.oc_replay_trip_current.ref.value">
                                        <template slot="append">A</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="assessLimitsData.overcurrent_release.rel.oc_replay_trip_current.dev.value" >
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
                {
                    label : "Opening time",
                    value : "opening_time"
                },
                {
                    label : "Opening sync. (contacts within a phase)",
                    value : "opening_sync_within_phase"
                },
                {
                    label : "Opening sync. (between breaker phases)",
                    value : "opening_sync_breaker_phase"
                },
                {
                    label : "Closing time",
                    value : "closing_time"
                },
                {
                    label : "Closing sync. (contacts within a phase)",
                    value : "closing_sync_within_phase"
                },
                {
                    label : "Closing sync. (between breaker phases)",
                    value : "closing_sync_breaker_phase"
                },
                {
                    label : "Reclosing time",
                    value : "reclosing_time"
                },
                {
                    label : "Close-Open time",
                    value : "close_open_time"
                },
                {
                    label : "Open-Close time",
                    value : "open_close_time"
                },
            ],
            contact_travel : [
                {
                    label : "Total travel, TT",
                    value : "total_travel"
                },
                {
                    label : "Over travel (Trip), OT",
                    value : "over_travel_trip"
                },
                {
                    label : "Over travel (Close), OT",
                    value : "over_travel_close"
                },
                {
                    label : "Rebound (Trip), RB",
                    value : "rebound_trip"
                },
                {
                    label : "Rebound (Close), RB",
                    value : "rebound_close"
                },
                {
                    label : "Contact wipe (Trip), CW",
                    value : "contact_wipe_trip"
                },
                {
                    label : "Contact wipe (Close), CW",
                    value : "contact_wipe_close"
                },
                {
                    label : "Damping distance",
                    value : "damping_distance"
                },
            ],
            Auxiliary_contact : [
                {
                    label : "Switching time (a-type),t",
                    value : "switching_time_type_a"
                },
                {
                    label : "diff. to main (a-type),Δt",
                    value : "diff_to_main_type_a"
                },
                {
                    label : "Switching time (b-type),t",
                    value : "switching_time_type_b"
                },
                {
                    label : "diff. to main (b-type),Δt",
                    value : "diff_to_main_type_b"
                },
                {
                    label : "Switching time (wiper),t",
                    value : "switching_time_wiper"
                },
                {
                    label : "Duration (wiper),Δt ",
                    value : "duration"
                },
            ],
            miscellaneous : [
                {
                    label : "Bounce time",
                    value : "bounce_time"
                },
                {
                    label : "Bounce count",
                    value : "bounce_count"
                },
                {
                    label : "PIR close time",
                    value : "pir_close_time"
                },
                {
                    label : "Reaction time",
                    value : "reaction_time"
                },
            ],
            coilCharacteristics : [
                {
                    label : "Peak close coil current",
                    value : "peak_close_coil_current"
                },
                {
                    label : "Peak trip coil current",
                    value : "peak_trip_coil_current"
                },
                {
                    label : "Average close coil current",
                    value : "average_close_coil_current"
                },
                {
                    label : "Average trip coil current",
                    value : "average_trip_coil_current"
                },
                {
                    label : "Average close coil voltage",
                    value : "average_close_coil_voltage"
                },
                {
                    label : "Average trip coil voltage",
                    value : "average_trip_coil_voltage"
                },
                {
                    label : "Close coil resistance",
                    value : "close_coil_resistance"
                },
                {
                    label : "Trip coil resistance",
                    value : "trip_coil_resistance"
                },               
            ],
            pickupVoltage : [
                {
                    label : "Minimum pickup voltage (close)",
                    value : "min_pickup_voltage_close"
                },
                {
                    label : "Minimum pickup voltage (trip)",
                    value : "min_pickup_voltage_trip"
                }
            ],
            motorCharacteristics : [
                {
                    label : "Inrush current",
                    value : "inrush_current"
                },
                {
                    label : "Charging time",
                    value : "charging_time"
                },
                {
                    label : "Charging current",
                    value : "charging_current"
                },
                {
                    label : "Minimum voltage",
                    value : "minimum_voltage"
                }
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

::v-deep(.inline-radios .el-radio-group) {
    display: flex;
    width: 100%;
    align-items: center;
    min-height: 28px;
}

::v-deep(.inline-radios .el-radio__label) {
    font-size: 12px;
}

::v-deep(.inline-radios .el-radio__content) {
    display: flex;
    align-items: center;
    line-height: normal;
}

::v-deep(.inline-radios .el-radio) {
    flex: 1;
    margin-right: 0;
    display: inline-flex;
    align-items: center;
}
</style>