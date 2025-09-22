<template>
    <div id="properties">
        <el-row style="margin-top: 50px;" :gutter="20" class="content">
            <el-col :span="8" class="col-content">
                <div style="min-height: 200px;">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <span class="bolder">Phase</span>
                        <el-divider></el-divider>
                        <el-radio-group style="margin-top: 20px;" v-model="configsData.phases.value">
                            <el-radio style="margin-right: 100px;" label="1"></el-radio>
                            <el-radio label="3"></el-radio>
                        </el-radio-group>
                    </el-form>
                    <el-form style="margin-top: 50px;" :inline-message="true" :label-width="labelWidth" size="mini"
                        label-position="left">
                        <span class="bolder">Cores</span>
                        <el-divider></el-divider>
                        <el-radio-group style="margin-top: 20px;" @change="onChangePhase()"
                            v-model="configsData.cores.value">
                            <el-radio style="margin-right: 100px;" label="Single"></el-radio>
                            <el-radio label="Multiple"></el-radio>
                        </el-radio-group>
                    </el-form>
                </div>
                <div>
                    <el-form style="margin-top: 50px;" :inline-message="true" :label-width="labelWidth" size="mini"
                        label-position="left">
                        <span class="bolder">Ratings</span>
                        <el-divider></el-divider>
                        <el-form-item label="Rated voltage (rms)">
                            <el-input v-model="ratingsData.rated_voltage.value">
                                <template slot="append">kV</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Maximum voltage (rms)">
                            <el-input v-model="ratingsData.max_voltage.value">
                                <template slot="append">kV</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated frequency">
                            <el-input v-model="ratingsData.rated_frequency.value">
                                <template slot="append">Hz</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Short circuit current">
                            <el-input v-model="ratingsData.shortcircuit.value">
                                <template slot="append">kA</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated duration of short circuit">
                            <el-input v-model="ratingsData.rated_duration.value">
                                <template slot="append">s</template>
                            </el-input>
                        </el-form-item>
                    </el-form>
                </div>
            </el-col>
            <el-col :span="8" class="col-content">
                <div style="min-height: 200px;">
                    <el-form :label-width="labelWidth" size="mini">
                        <span class="bolder">Layer construction</span>
                        <el-divider></el-divider>
                        <el-row style="margin-top: 20px; width: 100%;">
                            <el-col :span="12">
                                <el-checkbox style="width: 100%; margin-top: 10px;" v-model="layersData.conductor"
                                    label="Conductor" />
                                <el-checkbox style="width: 100%; margin-top: 10px;"
                                    v-model="layersData.conductor_shield" label="Conductor shield"></el-checkbox>
                                <el-checkbox style="width: 100%; margin-top: 10px;" v-model="layersData.insulation"
                                    label="Insulation"></el-checkbox>
                                <el-checkbox style="width: 100%; margin-top: 10px;"
                                    v-model="layersData.insulation_screen" label="Insulation screen"></el-checkbox>
                                <el-checkbox style="width: 100%; margin-top: 10px;" v-model="layersData.sheath"
                                    label="Sheath"></el-checkbox>
                            </el-col>
                            <el-col :span="12">
                                <el-checkbox style="width: 100%; margin-top: 10px;"
                                    v-model="layersData.sheath_reinforcing"
                                    label="Sheath reinforcing tap"></el-checkbox>
                                <el-checkbox style="width: 100%; margin-top: 10px;"
                                    v-model="layersData.concentric_neutral" label="Concentric neutral"></el-checkbox>
                                <el-checkbox style="width: 100%; margin-top: 10px;" v-model="layersData.armour_bedding"
                                    label="Amour bedding"></el-checkbox>
                                <el-checkbox style="width: 100%; margin-top: 10px;" v-model="layersData.armour"
                                    label="Amour"></el-checkbox>
                                <el-checkbox style="width: 100%; margin-top: 10px;" v-model="layersData.oversheath"
                                    label="Oversheath/Jacket/Serving"></el-checkbox>
                            </el-col>
                        </el-row>
                    </el-form>
                </div>
                <el-form style="margin-top: 50px;" :inline-message="true" :label-width="labelWidth" size="mini"
                    label-position="left">
                    <span class="bolder">Others</span>
                    <el-divider></el-divider>
                    <el-form-item label="Installation method">
                        <el-select style="width: 100%" v-model="othersData.insulation_method.value"
                            placeholder="Select">
                            <el-option label="In air" value="In air"> </el-option>
                            <el-option label="Direct buried" value="Direct buried"> </el-option>
                            <el-option label="In ducts" value="In ducts"> </el-option>
                            <el-option label="In trough" value="In trough"> </el-option>
                            <el-option label="Ventilated tunnel" value="Ventilated tunnel"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Bonding type">
                        <el-select style="width: 100%" v-model="othersData.bonding_type.value" placeholder="Select">
                            <el-option label="Solid with regular transposition" value="solidWithRegular"> </el-option>
                            <el-option label="Solid without regular transposition" value="solidWithoutRegular">
                            </el-option>
                            <el-option label="Single point bonding" value="singlePointBonding"> </el-option>
                            <el-option label="Both-ends bonding" value="bothEndsBonding"> </el-option>
                            <el-option label="Cross bonding" value="crossBonding"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Install location">
                        <el-input v-model="othersData.install_location.value">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Cable length">
                        <el-input v-model="othersData.cable_length.value">
                            <template slot="append">km</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <el-row :gutter="20" class="content">
            <el-col :span="8" class="col-content">
                <el-form class="height_form" v-if="layersData.conductor" style="margin-top: 50px;"
                    :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Conductor</span>
                    <el-divider></el-divider>
                    <el-form-item label="Conductor size">
                        <el-input v-model="datasData.conductor.conductor_size.value">
                            <template slot="append">mm<sup>2</sup></template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Conductor class">
                        <el-select style="width: 100%" v-model="datasData.conductor.conductor_class.value"
                            placeholder="Select">
                            <el-option label="Class 1 - Solid conductors" value="Class 1 - Solid conductors">
                            </el-option>
                            <el-option label="Class 2 - Stranded conductors" value="Class 2 - Stranded conductors">
                            </el-option>
                            <el-option label="Class 5 - Flexible conductors" value="Class 5 - Flexible conductors">
                            </el-option>
                            <el-option label="Class 6 - Flexible conductors" value="Class 6 - Flexible conductors">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Conductor material">
                        <el-select style="width: 100%" v-model="datasData.conductor.conductor_material.value"
                            placeholder="Select">
                            <el-option label="Copper, plain wires" value="Copper, plain wires"> </el-option>
                            <el-option label="Copper, metal-coated wires" value="Copper, metal-coated wires">
                            </el-option>
                            <el-option label="Alluminium wires" value="Alluminium wires"> </el-option>
                            <el-option label="Alluminium alloy wires" value="Alluminium alloy wires"> </el-option>
                            <el-option label="Custom" value="Custom"> </el-option>
                        </el-select>
                        <el-input style="margin-top: 5px;"
                            v-if="datasData.conductor.conductor_material.value == 'Custom'"
                            v-model="datasData.conductor.conductor_material_custom">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Conductor type">
                        <el-select style="width: 100%" v-model="datasData.conductor.conductor_type.value"
                            placeholder="Select">
                            <el-option label="Cooper-round, solid" value="Cooper-round, solid"> </el-option>
                            <el-option label="Cooper-Round, stranded (Fluid/ paper/ PPL insulation)"
                                value="Cooper-Round, stranded (Fluid/ paper/ PPL insulation)"> </el-option>
                            <el-option label="Cooper-Round, stranded (Extruded/ Mineral insulation)"
                                value="Cooper-Round, stranded (Extruded/ Mineral insulation)"> </el-option>
                            <el-option label="Cooper-Round, Milliken (Fluid/ paper/ PPL insulation)"
                                value="Cooper-Round, Milliken (Fluid/ paper/ PPL insulation)"> </el-option>
                            <el-option label="Cooper-Round, Milliken, insulated wires (Extruded insulation)"
                                value="Cooper-Round, Milliken, insulated wires (Extruded insulation)"> </el-option>
                            <el-option label="Cooper-Round, Milliken, bare uni-directional wires (Extruded insulation)"
                                value="Cooper-Round, Milliken, bare uni-directional wires (Extruded insulation)">
                            </el-option>
                            <el-option label="Cooper-Round, Milliken, bare bi-directional wires (Extruded insulation)"
                                value="Cooper-Round, Milliken, bare bi-directional wires (Extruded insulation)">
                            </el-option>
                            <el-option label="Copper_Hollow, helical stranded" value="Copper_Hollow, helical stranded">
                            </el-option>
                            <el-option label="Cooper_Sector-shaped (Fluid/ paper/ PPL insulation)"
                                value="Cooper_Sector-shaped (Fluid/ paper/ PPL insulation)"> </el-option>
                            <el-option label="Cooper_Sector-shaped (Extruded/ Mineral insulation)"
                                value="Cooper_Sector-shaped (Extruded/ Mineral insulation)"> </el-option>
                            <el-option label="Alluminium_Round, solid" value="Alluminium_Round, solid"> </el-option>
                            <el-option label="Alluminium_Round, stranded" value="Alluminium_Round, stranded">
                            </el-option>
                            <el-option label="Alluminium_Round, Milliken" value="Alluminium_Round, Milliken">
                            </el-option>
                            <el-option label="Alluminium_Hollow, helical stranded"
                                value="Alluminium_Hollow, helical stranded">
                            </el-option>
                            <el-option label="Custom" value="Custom"> </el-option>
                        </el-select>
                        <el-input style="margin-top: 5px;" v-if="datasData.conductor.conductor_type.value == 'Custom'"
                            v-model="datasData.conductor.conductor_type_custom.value">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Nominal conductor diameter">
                        <el-input v-model="datasData.conductor.conductor_diameter.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                </el-form>
                <el-form class="height_form" v-if="layersData.insulation" style="margin-top: 50px;"
                    :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Insulation</span>
                    <el-divider></el-divider>
                    <el-form-item label="Insulation type">
                        <el-select style="width: 100%" v-model="datasData.insulation.insulation_type.value"
                            placeholder="Select">
                            <el-option label="Impregnated paper_Solid type, fully- pre- or massimpregnated non-draining"
                                value="Impregnated paper_Solid type, fully- pre- or massimpregnated non-draining">
                            </el-option>
                            <el-option label="Butyl rubber" value="Butyl rubber"> </el-option>
                            <el-option label="EPR" value="EPR"> </el-option>
                            <el-option label="PVC" value="PVC"> </el-option>
                            <el-option label="HDPE" value="HDPE"> </el-option>
                            <el-option label="LDPE" value="LDPE"> </el-option>
                            <el-option label="XLPE_Filled" value="XLPE_Filled"> </el-option>
                            <el-option label="XLPE_Unfilled" value="XLPE_Unfilled"> </el-option>
                            <el-option label="PPL" value="PPL"> </el-option>
                            <el-option label="Nylon" value="Nylon"> </el-option>
                            <el-option label="Custom" value="Custom"> </el-option>
                        </el-select>
                        <el-input style="margin-top: 5px;" v-if="datasData.insulation.insulation_type.value == 'Custom'"
                            v-model="datasData.insulation.insulation_type_custom.value">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Thickness">
                        <el-input v-model="datasData.insulation.thickness.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Diameter">
                        <el-input v-model="datasData.insulation.diameter.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Insulation max. operating temp">
                        <el-input v-model="datasData.insulation.insulation_operating.value">
                            <template slot="append">°C</template>
                        </el-input>
                    </el-form-item>
                </el-form>
                <el-form class="height_form" v-if="layersData.sheath_reinforcing" style="margin-top: 50px;"
                    :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Sheath reinforcing tape</span>
                    <el-divider></el-divider>
                    <el-form-item label="Material">
                        <el-select style="width: 100%" v-model="datasData.sheath_reinforcing.material.value"
                            placeholder="Select">
                            <el-option label="Cooper" value="Cooper"> </el-option>
                            <el-option label="Aluminimum" value="Aluminimum"> </el-option>
                            <el-option label="Brass/ Bronze" value="Brass/ Bronze"> </el-option>
                            <el-option label="Zinc" value="Zinc"> </el-option>
                            <el-option label="Stainless steel" value="Stainless steel"> </el-option>
                            <el-option label="Custom" value="Custom"> </el-option>
                        </el-select>
                        <el-input style="margin-top: 5px;"
                            v-if="datasData.sheath_reinforcing.material.value == 'Custom'"
                            v-model="datasData.sheath_reinforcing.material_custom.value">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Thickness">
                        <el-input v-model="datasData.sheath_reinforcing.thickness.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Diameter">
                        <el-input v-model="datasData.sheath_reinforcing.diameter.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Width">
                        <el-input v-model="datasData.sheath_reinforcing.width.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Length of lay">
                        <el-input v-model="datasData.sheath_reinforcing.lengthOfLay.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="No. of tapes">
                        <el-input v-model="datasData.sheath_reinforcing.numOfTapes.value">
                        </el-input>
                    </el-form-item>
                </el-form>
                <el-form class="height_form" v-if="layersData.armour" style="margin-top: 50px;" :inline-message="true"
                    :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Armour</span>
                    <el-divider></el-divider>
                    <el-form-item label="Material">
                        <el-select style="width: 100%" v-model="datasData.armour.material.value" placeholder="Select">
                            <el-option label="Steel tape reinforcement" value="Steel tape reinforcement"> </el-option>
                            <el-option label="Steel wires_touching" value="Steel wires_touching"> </el-option>
                            <el-option label="Steel wires_not touching" value="Steel wires_not touching"> </el-option>
                            <el-option label="Stainless steel wires" value="Stainless steel wires"> </el-option>
                            <el-option label="Cooper armour wires" value="Cooper armour wires"> </el-option>
                            <el-option label="TECK armour" value="TECK armour"> </el-option>
                            <el-option label="Custom_non-magnetic tape" value="Custom_non-magnetic tape"> </el-option>
                            <el-option label="Custom_non-magnetic wires" value="Custom_non-magnetic wires"> </el-option>
                            <el-option label="Custom" value="Custom"> </el-option>
                        </el-select>
                        <el-input v-if="datasData.armour.material.value == 'Custom'" style="margin-top: 5px;"
                            v-model="datasData.armour.material_custom.value">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Thickness">
                        <el-input v-model="datasData.armour.thickness.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Diameter">
                        <el-input v-model="datasData.armour.diameter.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Layer of tapes (reinforcement resistance)">
                        <el-select style="width: 100%" v-model="datasData.armour.layerOfTapes.value"
                            placeholder="Select">
                            <el-option label="Very long lay (longitudinal tapes)"
                                value="Very long lay (longitudinal tapes)">
                            </el-option>
                            <el-option label="Wound at approximately 54°" value="Wound at approximately 54°">
                            </el-option>
                            <el-option label="Wound in very short lay (circumferential tapes)"
                                value="Wound in very short lay (circumferential tapes)"> </el-option>
                            <el-option label="Layers of tapes in contact with each other having a very short lay"
                                value="Layers of tapes in contact with each other having a very short lay"> </el-option>
                            <el-option label="Custom" value="Custom"> </el-option>
                        </el-select>
                        <el-input v-if="datasData.armour.layerOfTapes.value == 'Custom'" style="margin-top: 5px;"
                            v-model="datasData.armour.layerOfTapes_custom.value">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Cross-sectional area of tap armour">
                        <el-input v-model="datasData.armour.crossSectional.value">
                            <template slot="append">mm<sup>2</sup></template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="8" class="col-content">
                <el-form class="height_form" v-if="layersData.conductor_shield" style="margin-top: 50px;"
                    :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Conductor shield</span>
                    <el-divider></el-divider>
                    <el-form-item label="Thickness">
                        <el-input v-model="datasData.conductor_shield.thickness.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Diameter">
                        <el-input v-model="datasData.conductor_shield.diameter.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                </el-form>
                <el-form class="height_form" v-if="layersData.insulation_screen" style="margin-top: 50px;"
                    :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Insulation screen</span>
                    <el-divider></el-divider>
                    <el-form-item label="Material">
                        <el-select v-if="configsData.cores != 'Multiple'" style="width: 100%"
                            v-model="datasData.insulation_screen.material.value" placeholder="Select">
                            <el-option label="Semi-conductor screen" value="Semi-conductor screen"> </el-option>
                            <el-option label="Copper screen tape" value="Copper screen tape"> </el-option>
                            <el-option label="Aluminium screen tap" value="Aluminium screen tap"> </el-option>
                            <el-option label="Custom" value="Custom"> </el-option>
                        </el-select>
                        <el-select v-if="configsData.cores == 'Multiple'" style="width: 100%"
                            v-model="datasData.insulation_screen.material.value" placeholder="Select">
                            <el-option label="Semi-conductor screen" value="Semi-conductor screen"> </el-option>
                            <el-option label="Copper screen tape" value="Copper screen tape"> </el-option>
                            <el-option label="Aluminium screen tap" value="Aluminium screen tap"> </el-option>
                            <el-option label="Belted - unscreened" value="Belted - unscreened"> </el-option>
                            <el-option label="Custom" value="Custom"> </el-option>
                        </el-select>
                        <el-input v-if="datasData.insulation_screen.material.value == 'Custom'" style="margin-top: 5px;"
                            v-model="datasData.insulation_screen.material_custom.value">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Thickness">
                        <el-input v-model="datasData.insulation_screen.thickness.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Diameter">
                        <el-input v-model="datasData.insulation_screen.diameter.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                </el-form>
                <el-form class="height_form" v-if="layersData.concentric_neutral" style="margin-top: 50px;"
                    :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Concentric neutral</span>
                    <el-divider></el-divider>
                    <el-form-item label="Material">
                        <el-select style="width: 100%" v-model="datasData.concentric_neutral.material.value"
                            placeholder="Select">
                            <el-option label="Cooper" value="Cooper"> </el-option>
                            <el-option label="Aluminimum" value="Aluminimum"> </el-option>
                            <el-option label="Brass/ Bronze" value="Brass/ Bronze"> </el-option>
                            <el-option label="Zinc" value="Zinc"> </el-option>
                            <el-option label="Stainless steel" value="Stainless steel"> </el-option>
                            <el-option label="Custom" value="Custom"> </el-option>
                        </el-select>
                        <el-input style="margin-top: 5px;"
                            v-if="datasData.concentric_neutral.material.value == 'Custom'"
                            v-model="datasData.concentric_neutral.material_custom.value">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Construction">
                        <el-select style="width: 100%" v-model="datasData.concentric_neutral.construction.value"
                            placeholder="Select">
                            <el-option label="Round wires" value="Round wires"> </el-option>
                            <el-option label="Flat straps" value="Flat straps"> </el-option>
                            <el-option v-if="configsData.cores == 'Multiple'" label="Common" value="Common">
                            </el-option>
                            <el-option v-if="configsData.cores == 'Multiple'" label="Around each core"
                                value="Around each core">
                            </el-option>
                            <el-option label="Custom" value="Custom"> </el-option>
                        </el-select>
                        <el-input style="margin-top: 5px;"
                            v-if="datasData.concentric_neutral.construction.value == 'Custom'"
                            v-model="datasData.concentric_neutral.construction_custom.value">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Thickness">
                        <el-input v-model="datasData.concentric_neutral.thickness.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Diameter">
                        <el-input v-model="datasData.concentric_neutral.diameter.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Area">
                        <el-input v-model="datasData.concentric_neutral.area.value">
                            <template slot="append">mm<sup>2</sup></template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Length of lay">
                        <el-input v-model="datasData.concentric_neutral.lengthOfLay.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="No. of wires">
                        <el-input v-model="datasData.concentric_neutral.numOfWires.value">
                        </el-input>
                    </el-form-item>
                </el-form>
                <el-form class="height_form" v-if="layersData.oversheath" style="margin-top: 50px;"
                    :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Oversheath/ Jacket/ Serving</span>
                    <el-divider></el-divider>
                    <el-form-item label="Material">
                        <el-select style="width: 100%" v-model="datasData.oversheath.material.value"
                            placeholder="Select">
                            <el-option label="PVC" value="PVC"> </el-option>
                            <el-option label="Rubber sandwich" value="Rubber sandwich"> </el-option>
                            <el-option label="Butyl rubber" value="Butyl rubber"> </el-option>
                            <el-option label="Coal tar wrapping" value="Coal tar wrapping"> </el-option>
                            <el-option label="Polyethylene" value="Polyethylene"> </el-option>
                            <el-option label="Polychloroprene" value="Polychloroprene"> </el-option>
                            <el-option label="Compounded jute and fibrous materials"
                                value="Compounded jute and fibrous materials"> </el-option>
                            <el-option label="Custom" value="Custom"> </el-option>
                        </el-select>
                        <el-input v-if="datasData.oversheath.material.value == 'Custom'" style="margin-top: 5px;"
                            v-model="datasData.oversheath.material_custom.value">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Thickness">
                        <el-input v-model="datasData.oversheath.thickness.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Diameter">
                        <el-input v-model="datasData.oversheath.diameter.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="8" class="col-content">
                <el-form class="height_form" v-if="layersData.sheath" style="margin-top: 50px;" :inline-message="true"
                    :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Sheath</span>
                    <el-divider></el-divider>
                    <el-form-item v-if="configsData.cores.value == 'Multiple'" label="Multicore">
                        <el-select style="width: 100%" v-model="datasData.sheath.multicore.value" placeholder="Select">
                            <el-option label="Common" value="Common"> </el-option>
                            <el-option label="Sheath per phase" value="Sheath per phase"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Sheath type">
                        <el-select style="width: 100%" v-model="datasData.sheath.sheath_type.value"
                            placeholder="Select">
                            <el-option label="Corrugated" value="Corrugated"> </el-option>
                            <el-option label="Alumiminum" value="Alumiminum"> </el-option>
                            <el-option label="Cooper" value="Cooper"> </el-option>
                            <el-option label="Lead" value="Lead"> </el-option>
                            <el-option label="Custom" value="Custom"> </el-option>
                        </el-select>
                        <el-input v-if="datasData.sheath.sheath_type.value == 'Custom'" style="margin-top: 5px;"
                            v-model="datasData.sheath.sheath_type_custom.value">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Construction">
                        <el-select style="width: 100%" v-model="datasData.sheath.construction.value"
                            placeholder="Select">
                            <el-option label="Lead with reinforcing tape" value="Lead with reinforcing tape">
                            </el-option>
                            <el-option label="Non-corrugated" value="Non-corrugated"> </el-option>
                            <el-option label="Longitudinally-corrugated" value="Longitudinally-corrugated"> </el-option>
                            <el-option label="Custom" value="Custom"> </el-option>

                        </el-select>
                        <el-input v-if="datasData.sheath.construction.value == 'Custom'" style="margin-top: 5px;"
                            v-model="datasData.sheath.construction_custom.value">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Thickness">
                        <el-input v-model="datasData.sheath.thickness.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Diameter">
                        <el-input v-model="datasData.sheath.diameter.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                </el-form>
                <el-form class="height_form" v-if="layersData.armour_bedding" style="margin-top: 50px;"
                    :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Armour bedding</span>
                    <el-divider></el-divider>
                    <el-form-item label="Material">
                        <el-select style="width: 100%" v-model="datasData.armour_bedding.material.value"
                            placeholder="Select">
                            <el-option label="PVC" value="PVC"> </el-option>
                            <el-option label="PVC/ bitumen on corrugated aluminium"
                                value="PVC/ bitumen on corrugated aluminium"> </el-option>
                            <el-option label="PE" value="PE"> </el-option>
                            <el-option label="Rubber sandwich" value="Rubber sandwich"> </el-option>
                            <el-option label="Polychloroprene" value="Polychloroprene"> </el-option>
                            <el-option label="Compounded jute and fibrous materials"
                                value="Compounded jute and fibrous materials"> </el-option>
                            <el-option label="Custom" value="Custom"> </el-option>
                        </el-select>
                        <el-input v-if="datasData.armour_bedding.material.value == 'Custom'" style="margin-top: 5px;"
                            v-model="datasData.armour_bedding.material_custom.value">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Thickness">
                        <el-input v-model="datasData.armour_bedding.thickness.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Diameter">
                        <el-input v-model="datasData.armour_bedding.diameter.value">
                            <template slot="append">mm</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>
<script>
export default {
    name: "configs",
    props: {
        configs: {
            type: Object,
            require: true,
        },
        ratings: {
            type: Object,
            require: true,
        },
        layer: {
            type: Object,
            require: true,
        },
        other: {
            type: Object,
            require: true,
        },
        datas: {
            type: Object,
            require: true,
        }
    },
    data() {
        return {
            openRatings: "true",
            labelWidth: `200px`,
        }
    },
    watch: {
        'datasData.conductor.conductor_class.value'(val) {
            this.layersData.conductor = !!val;
        },
        'datasData.insulation.insulation_type.value'(val) {
            this.layersData.insulation = !!val;
        },
        'datasData.sheath_reinforcing.material.value'(val) {
            this.layersData.sheath_reinforcing = !!val;
        },
        'datasData.armour.material.value'(val) {
            this.layersData.armour = !!val;
        },
        'datasData.conductor_shield.thickness.value'(val) {
            this.layersData.conductor_shield = !!val;
        },
        'datasData.insulation_screen.material.value'(val) {
            this.layersData.insulation_screen = !!val;
        },
        'datasData.concentric_neutral.material.value'(val) {
            this.layersData.concentric_neutral = !!val;
        },
        'datasData.oversheath.material.value'(val) {
            this.layersData.oversheath = !!val;
        },
        'datasData.sheath.sheath_type.value'(val) {
            this.layersData.sheath = !!val;
        },
        'datasData.armour_bedding.material.value'(val) {
            this.layersData.armour_bedding = !!val;
        },

    },
    methods: {
        onChangePhase() {
            console.log(this.configs.phases.value)
        },
        changeRadio(data) {
            console.log(this.layersData.conductor)
            console.log(data)
        }
    },
    computed: {
        configsData() {
            return this.configs
        },
        ratingsData() {
            return this.ratings
        },
        layersData() {
            return this.layer
        },
        othersData() {
            return this.other
        },
        datasData() {
            return this.datas
        }
    }
}
</script>
<style scoped>
.height_form {
    min-height: 200px;
}

div.el-input-group__append {
    text-align: center;
    width: 30px;
}

.bolder {
    font-size: 12px;
}
</style>