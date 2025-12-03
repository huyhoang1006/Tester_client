<template>
    <div>
        <div>
            <div style= "font-size: 18px; font-weight: bold"> Fmeca table </div>
            <div> 
                <el-table
                    :data="fmecaTableData"
                    :span-method="cellSpanMethod"
                    style="width: 100%;margin-bottom: 20px;"
                    row-key="no"
                    border
                    :tree-props="{ children: 'children' }">
                    <el-table-column
                        prop="no"
                        label="No"
                        width="150"
                        header-align="center"
                        align="center">
                    </el-table-column>
                    <el-table-column
                        prop="failureMode"
                        label="Failure Mode"
                        width="300"
                        header-align="center">
                    </el-table-column>
                    <el-table-column
                        prop="sof"
                        label="SoF"
                        width="100"
                        header-align="center">
                    </el-table-column>
                    <el-table-column
                        prop="pof"
                        label="PoF"
                        width="100"
                        header-align="center">
                    </el-table-column>
                    <el-table-column
                        prop="conditionIndicator"
                        label="Condition Indicator"
                        width="200"
                        header-align="center">
                    </el-table-column>  
                    <el-table-column
                        prop="test"
                        label="Test"   
                        width="200"
                        header-align="center">
                    </el-table-column>
                    <el-table-column
                        prop="sot"
                        label="SoT"
                        width="100"
                        header-align="center">
                    </el-table-column>
                    <el-table-column
                        prop="rpn"
                        label="RPN"
                        width="100"
                        header-align="center">
                    </el-table-column>
                </el-table>

            </div>

        </div>
        <div style="margin-top: 20px; font-size: 18px; font-weight: bold">
            <div> Fmeca weighting </div>
            <div>  
                 <el-table
                    :data="fmecaWeightingTableData"
                    style="width: 100%;margin-bottom: 20px;"
                    row-key="no"
                    border
                    :tree-props="{ children: 'children' }">
                    <el-table-column
                        prop="no"
                        label="No"
                        width="100"
                        header-align="center"
                        align="center">
                    </el-table-column>
                    <el-table-column
                        prop="tranformerConditionCriteria"
                        label="Tranformer Condition Criteria"
                        width="400"
                        header-align="center">
                    </el-table-column>
                    <el-table-column
                        prop="totalRPN"
                        label="Total RPN"
                        width="150"
                        header-align="center">
                    </el-table-column>
                    <el-table-column
                        prop="rpnProportion"
                        label="RPN Proportion"
                        width="150"
                        header-align="center">
                    </el-table-column>
                    <el-table-column
                        prop="weightingFactor"
                        label="Weighting Factor"
                        width="150"
                        header-align="center">
                    </el-table-column>  
                </el-table>   
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: "Fmeca",
    data() {
        return {
            fmecaTableData: [
                {
                    no: 1,
                    failureMode: 'Dielectric Condition Assessment',
                    sof: '',
                    pof: '',
                    conditionIndicator: '',
                    test: '',
                    sot: '',
                    rpn: '',
                    children: [
                        {
                            no: 1.1,
                            failureMode: 'Core insulation',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: '',
                            sot: '',
                            rpn: '',
                            children: [
                                {
                                    no:'1.1.1',
                                    failureMode: 'Core ground ',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: 'DC Resistance',
                                    test: 'Insulationresistance',
                                    sot: '',
                                    rpn: '',
                                },
                                {
                                    no:'1.1.2',
                                    failureMode: 'Arcing',
                                    sof: '',  
                                    pof: '',
                                    conditionIndicator: 'Acetylene',
                                    test: 'DGA',
                                    sot: '',
                                    rpn: '',
                                }
                            ],
                        },
                        {
                            no: 1.2,
                            failureMode: 'Winding insulation',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: '',
                            sot: '',
                            rpn: '',
                            children: [
                                {
                                    no:'1.2.1',
                                    failureMode: 'Insulating Liquid',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: '',
                                    test: '',
                                    sot: '',
                                    rpn: '',
                                    children: [
                                        {
                                            no:'1.2.1.1',
                                            failureMode: 'Arcing',
                                            sof: '',
                                            pof: '',
                                            conditionIndicator: 'Acetylene',
                                            test: 'DGA',
                                            sot: '',
                                            rpn: '',
                                        },
                                        {
                                            no:'1.2.1.2',
                                            failureMode: 'Aging, Moisture, contamination',
                                            sof: '',  
                                            pof: '',
                                            conditionIndicator: 'Dissipation factor',
                                            test: 'PF/DF',
                                            sot: '',
                                            rpn: '',
                                        },
                                        {
                                            no:'',
                                            failureMode: 'Aging, Moisture, contamination',
                                            sof: '',
                                            pof: '',
                                            conditionIndicator: 'Breakdown voltage',
                                            test: 'Oil test',
                                            sot: '',
                                            rpn: '',
                                        },
                                        {
                                            no:'1.2.1.3',
                                            failureMode: 'Partial Discharge',
                                            sof: '',
                                            pof: '',
                                            conditionIndicator: 'Hydrogen',
                                            test: 'DGA',
                                            sot: '',
                                            rpn: '',
                                        },
                                        {
                                            no:'',
                                            failureMode: 'Partial Discharge',
                                            sof: '',
                                            pof: '',
                                            conditionIndicator: '',
                                            test: 'PD monitoring/online',
                                            sot: '',
                                            rpn: '',
                                        },
                                        {
                                            no:'1.2.1.4',
                                            failureMode: 'Moisture Ingress',
                                            sof: '',
                                            pof: '',
                                            conditionIndicator: 'Moisture Content',
                                            test: 'Karl Fisher Moisture Content',
                                            sot: '',
                                            rpn: '',
                                        }
                                    ]
                                },
                                {
                                    no:'1.2.2',
                                    failureMode: 'Solid insulation',
                                    sof: '',  
                                    pof: '',
                                    conditionIndicator: '',
                                    test: '',
                                    sot: '',
                                    rpn: '',
                                    children: [
                                        {
                                            no:'1.2.2.1',
                                            failureMode: 'Moisture Content in Cellulose',
                                            sof: '',
                                            pof: '',
                                            conditionIndicator: 'Moisture Content',
                                            test: 'Karl Fisher Moisture Content',
                                            sot: '',
                                            rpn: '',
                                        },
                                        {
                                            no:'',
                                            failureMode: '',
                                            sof: '',
                                            pof: '',
                                            conditionIndicator: 'Moisture Content',
                                            test: 'DRA',
                                            sot: '',
                                            rpn: '',
                                        },
                                        {
                                            no:'1.2.2.2',
                                            failureMode: 'Insulation flashover',
                                            sof: '',     
                                            pof: '',
                                            conditionIndicator: '', 
                                            test: 'PD monitoring/online',
                                            sot: '',
                                            rpn: '',      
                                        },
                                        {
                                            no:'',
                                            failureMode: 'Insulation flashover',
                                            sof: '',     
                                            pof: '',
                                            conditionIndicator: '',
                                            test: 'DGA',
                                            sot: '',
                                            rpn: '',
                                        },
                                        {
                                            no:'',
                                            failureMode: 'Insulation flashover',
                                            sof: '',
                                            pof: '',
                                            conditionIndicator: '',
                                            test: 'Insulation resistance',
                                            sot: '',
                                            rpn: '',
                                        },
                                        {
                                            no:'1.2.2.3',
                                            failureMode: 'Partial Discharge',
                                            sof: '',
                                            pof: '',
                                            conditionIndicator: '',
                                            test: 'DGA',
                                            sot: '',
                                            rpn: '',
                                        }
                                    ]
                                },
                                {
                                    no:'1.2.3',
                                    failureMode: 'Partial discharge',
                                    sof: '',  
                                    pof: '',
                                    conditionIndicator: 'Hydrogen',
                                    test: 'DGA',
                                    sot: '',
                                    rpn: '',
                                }
                            ]
                        },
                        {   
                            no: 1.3,
                            failureMode: 'Major',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: '',
                            sot: '',
                            rpn: '',
                            children: [
                                {
                                    no:'1.3.1',
                                    failureMode: 'Elevated Moisture, aging, contamination',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: 'CHL, CH, CL of transformer',
                                    test: 'PF/DF',
                                    sot: '',
                                    rpn: '',
                                },
                                {
                                    no:'1.3.2',
                                    failureMode: 'Displaced winding caused by aging ',
                                    sof: '',  
                                    pof: '',
                                    conditionIndicator: 'CHL, CH, CL of transformer',
                                    test: 'Capacitance',
                                    sot: '',
                                    rpn: '',
                                },
                                {
                                    no:'1.3.3',
                                    failureMode: 'Elevated Moisture, aging, contamination',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: 'Estimated Moisture',
                                    test: 'DRA',
                                    sot: '',
                                    rpn: '',
                                },
                                {
                                    no:'1.3.4',
                                    failureMode: 'Insulation degradation by moisture/contamination',
                                    sof: '',  
                                    pof: '',
                                    conditionIndicator: 'Polarization Index',
                                    test: 'Insulation resistance',
                                    sot: '',
                                    rpn: '',
                                }
                            ],
                            
                        }
                    ]
                },
                {
                    no: 2,
                    failureMode: 'Winding Condition Assessment',
                    sof: '',
                    pof: '',
                    conditionIndicator: '',
                    test: '',
                    sot: '',
                    rpn: '',
                    children: [
                        {
                            no: 2.1,
                            failureMode: 'Winding turn strand to strand short circuit or open circuit',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'Leakage Reactance vs Frequency',
                            test: 'FRSL',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: 2.2,
                            failureMode: 'Winding turn to turn short circuit',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'Excitation current',
                            test: 'Excitation current',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: '',
                            failureMode: 'Winding turn to turn short circuit',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'Ratio test',
                            test: 'TTR',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: '',
                            failureMode: 'Winding turn to turn short circuit',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'SFRA trace',
                            test: 'SFRA',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: '',
                            failureMode: 'Winding turn to turn short circuit',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'Resistance deviation',
                            test: 'DC winding resistance',
                            sot: '',
                            rpn: '',
                        }
                    ]
                },
                {
                    no: 3,
                    failureMode: 'Core/ Clamp',
                    sof: '',
                    pof: '',
                    conditionIndicator: '',
                    test: '',
                    sot: '',
                    rpn: '',
                    children: [
                        {
                            no: 3.1,
                            failureMode: 'Core displacement',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'SFRA trace',
                            test: 'SFRA',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: 3.2,
                            failureMode: 'Core displacement',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'Leakage Reactance',
                            test: 'Short circuit impedance <br> Leakage reactance',
                            sot: '',
                            rpn: '',
                        }
                    ]
                },
                {
                    no: 4,
                    failureMode: 'Bushing Condition Assessment',
                    sof: '',
                    pof: '',
                    conditionIndicator: '',
                    test: '',
                    sot: '',
                    rpn: '',
                    children: [
                        {
                            no: 4.1,
                            failureMode: 'Oil leakage (OIP)',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: 'Visual inspection',
                            sot: '5',
                            rpn: '',
                        },
                        {
                            no: 4.2,
                            failureMode: 'Colour of oil in sight glass (by Visual Inspection) (OIP)',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: 'Visual inspection',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: 4.3,
                            failureMode: 'Colour of oil in sight glass (by lab test) (OIP)',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: 'Visual inspection',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: 4.4,
                            failureMode: 'DGA Oil (OIP)',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: 'DGA in Bushing Oil',
                            sot: '',
                            rpn: '',
                        },
                        {   
                            no: 4.5,
                            failureMode: 'Overheating in bushing top (OIP/RIP/RIS/RBP)',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: 'Thermal scanning',
                            sot: '',
                            rpn: '',
                        },
                        {   
                            no: 4.6,
                            failureMode: 'PD activities in condenser core (OIP)',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: 'DGA Ratio H2/CH4 (pD)',
                            sot: '',
                            rpn: '',
                        },
                        {   
                            no: 4.7,
                            failureMode: 'Overheating in the condenser core (OIP)',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: 'DGA Ratio C2H4/C2H6 (Thermal fault)',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: 4.8,
                            failureMode: 'Overheating in the condenser core (OIP)',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: 'DGA Ratio CO2/CO (Thermal fault in paper)',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: '4.9',
                            failureMode: 'Contamination/ layers shorting/excessive moisture',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'Tan delta increase',
                            test: 'DF/PF',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: '4.10',
                            failureMode: 'Contamination/ layers shorting/excessive moisture (RBP)',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'Tan delta increase',
                            test: 'DF/PF',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: 4.11,
                            failureMode: 'Contamination/ layers shorting/excessive moisture (OIP/RIP/RIS)',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'Change of Capacitance (C1)',
                            test: 'C1 measurement',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: 4.12,
                            failureMode: 'Damaged sheds on insulator (OIP/RIP/RIS/RBP)',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: 'Visual inspection',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: 4.13,
                            failureMode: 'Corrosion due to poor installation of test tap cover (OIP/RIP/RIS/RBP)',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: 'Visual inspection voltage tap',
                            sot: '',
                            rpn: '',
                        }
                    ]
                },
                {
                    no: 5,
                    failureMode: 'Cable Box Condition Assessment',
                    sof: '',
                    pof: '',
                    conditionIndicator: '',
                    test: '',
                    sot: '',
                    rpn: '',
                    children: [
                        {
                            no: 5.1,
                            failureMode: 'Oil leakage',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: 'Visual inspection',
                            sot: '5',
                            rpn: '',
                        },
                        {
                            no: 5.2,
                            failureMode: 'Condensation',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'Dry / Corrosion',
                            test: 'Visual Inspection',
                            sot: '5',
                            rpn: '',
                        },
                        {
                            no: 5.3,
                            failureMode: 'Partial discharge',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'Tracking',
                            test: 'Visual inspection',
                            sot: '5',
                            rpn: '',
                        },
                        {
                            no: 5.4,
                            failureMode: 'Overheating',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'Wall Temperature',
                            test: 'Thermal scanning',
                            sot: '6',
                            rpn: '',
                        },
                        {
                            no: 5.5,
                            failureMode: 'Miscellaneous',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: '',
                            sot: '',
                            rpn: '',
                            children: [
                                {
                                    no: '5.5.1',
                                    failureMode: '',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: 'Shrinkage Cracks',
                                    test: 'Visual inspection',
                                    sot: '5',
                                    rpn: '',
                                },
                                {
                                    no: '5.5.2',
                                    failureMode: 'Composition',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: '',
                                    test: 'Visual inspection',
                                    sot: '5',
                                    rpn: '',
                                }
                            ]
                        }
                    ]
                },
                {
                    no: 6,
                    failureMode: 'LTC Condition Assessment',
                    sof: '',
                    pof: '',
                    conditionIndicator: '',
                    test: '',
                    sot: '',
                    rpn: '',
                    children: [
                        {
                            no: 6.1,
                            failureMode: 'Thermal: Overheating',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'Temperature differential',
                            test: 'Thermography',
                            sot: '5',
                            rpn: '',
                        },
                        {
                            no: 6.2,
                            failureMode: 'Thermal: Coking',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: '',
                            sot: '',
                            rpn: '',
                            children: [
                                {
                                    no: '6.2.1',
                                    failureMode: 'Main current carrying contacts (OLTC or DETC)',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: 'Temperature differential',
                                    test: 'Thermography(bolt-on OLTC only)',
                                    sot: '5',
                                    rpn: '',
                                },
                                {
                                    no: '6.2.2',
                                    failureMode: 'Main current carrying contacts (OLTC or DETC)',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: 'Gas Pattern Trending',
                                    test: 'DGA',
                                    sot: '5',
                                    rpn: '',
                                }
                            ]
                        },
                        {
                            no: 6.3,
                            failureMode: 'Dielectric: Tracking and Flashover',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: '',
                            sot: '',
                            rpn: '',
                            children: [
                                {
                                    no: '6.3.1',
                                    failureMode: 'Insulation parts in Diverter compartment',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: 'OEM Specs',
                                    test: 'Visual inspection',
                                    sot: '4',
                                    rpn: '',
                                },
                                {
                                    no: '6.3.2',
                                    failureMode: 'Insulation parts in Diverter compartment',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: 'Water content',
                                    test: 'Karl Fischer',
                                    sot: '5',
                                    rpn: '',
                                },
                                {
                                    no: '6.3.3',
                                    failureMode: 'Oil',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: 'Breakdown Voltage',
                                    test: 'Breakdown Voltage',
                                    sot: '5',
                                    rpn: '',
                                },
                                {
                                    no: '6.3.4',
                                    failureMode: 'Oil',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: 'DGA',
                                    test: 'DGA',
                                    sot: '5',
                                    rpn: '',

                                }
                            ]
                        },
                        {
                            no: 6.4,
                            failureMode: 'Mechanical: Contact misalignment',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'Contact alignment',
                            test: 'Visual inspection',
                            sot: '5',
                            rpn: '',
                            children: [
                                { 
                                    no: '6.4.1',
                                    failureMode: 'Motor drive and linkage',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: '',
                                    test: '',
                                    sot: '5',
                                    rpn: '',
                                    children: [
                                        {
                                            no: '6.4.1.1',
                                            failureMode: 'Motor trip',
                                            sof: '',    
                                            pof: '',
                                            conditionIndicator: 'Torque',
                                            test: 'Motor current',
                                            sot: '6',   
                                            rpn: '',
                                        }        
                                    ]
                                },
                                {
                                    no: '6.4.2',
                                    failureMode: 'Tap selector (OLTC or DETC)',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: 'Contact alignment',
                                    test: 'Visual inspection',
                                    sot: '5',
                                    rpn: '',
                                    children: [
                                        {
                                            no: '6.4.2.1',
                                            failureMode: 'Motor trip',
                                            sof: '',
                                            pof: '',
                                            conditionIndicator: 'Torque',
                                            test: 'Motor current',
                                            sot: '',
                                            rpn: '',
                                        }
                                    ]
                                },
                                {
                                    no: '6.4.3',
                                    failureMode: 'Motor drive and linkage',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: '',
                                    test: '',
                                    sot: '',
                                    rpn: '',
                                    children: [
                                        {
                                            no: '6.4.3.1',
                                            failureMode: 'Wear of linkages',
                                            sof: '',
                                            pof: '',
                                            conditionIndicator: 'OEM Specs',
                                            test: 'Visual inspection',
                                            sot: '',
                                            rpn: '',
                                        }
                                    ]
                                } 
                            ]
                        },
                        {
                            no: 6.5,
                            failureMode: 'Contact problems in tap selector and diverter switch',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'DRM ',
                            test: 'OLTC scan',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: 6.6,
                            failureMode: 'Fault in operating mechanism',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'DRM',
                            test: 'OLTC scan',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: 6.7,
                            failureMode: 'Faulty transition resistor',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'DRM',
                            test: 'OLTC scan',
                            sot: '',
                            rpn: '',
                        }
                    ]

                },
                {
                    no: 7,
                    failureMode: 'Cooler/Radiator Condition Assessment',
                    sof: '',
                    pof: '',
                    conditionIndicator: '',
                    test: '',
                    sot: '',
                    rpn: '',
                    children: [
                        {
                            no: 7.1,
                            failureMode: 'Fan or control failure / fan in wrong direction',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'Elevated temperatures',
                            test: 'Visual inspection',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: 7.2,
                            failureMode: 'Failure of pump / pump in wrong direction / valve closed incorrectly / blockage',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'Elevated temperatures',
                            test: 'Measurement difference of inlet and outlet oil temperature. Compare between coolers',
                            sot: '',
                            rpn: '',
                            children: [
                                {
                                    no: '7.2.1',
                                    failureMode: '',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: 'Oil flow relay, no pump current',
                                    test: 'Oil flow indication / measurement',
                                    sot: '',
                                    rpn: '',
                                }
                            ]
                        },
                        {
                            no: 7.3,
                            failureMode: 'Dirty radiators and cooling fans',
                            sof: '',
                            pof: '',
                            conditionIndicator: 'Blocked cooling ducts',
                            test: 'Visual inspection',
                            sot: '',
                            rpn: '',
                        },
                        {
                            no: 7.4,
                            failureMode: 'Oil leaks',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: '',
                            sot: '',
                            rpn: '',
                            children: [
                                {
                                    no: '7.4.1',
                                    failureMode: 'Low oil level (transformer alarm/trip)',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: 'Oil level gauge/alarm',
                                    test: 'Visual inspection',
                                    sot: '',
                                    rpn: '',
                                },
                                {
                                    no: '7.4.2',
                                    failureMode: 'Moisture and oxygen ingress',     
                                    sof: '',
                                    pof: '',    
                                    conditionIndicator: 'Elevated levels of moisture and oxygen',
                                    test: 'DGA etc.',
                                    sot: '',
                                    rpn: '',    

                                }
                            ]
                        },
                        {
                            no: 7.5,
                            failureMode: 'Elevated ambient air/cooling water inlet temperatures',
                            sof: '',
                            pof: '',
                            conditionIndicator: '',
                            test: '',
                            sot: '',
                            rpn: '',
                            children: [
                                {
                                    no: '7.5.1',
                                    failureMode: 'Higher oil and winding temperatures (elevated oil temperature)',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: 'Unexpected OTI/WTI alarms',
                                    test: 'Visual inspection',
                                    sot: '',
                                    rpn: '',
                                }
                            ]
                        }
                    ]
                }
            ],
            fmecaWeightingTableData: [
                {
                    no: 1,
                    tranformerConditionCriteria: 'DGA main tank',
                    totalRPN: '',
                    rpnProportion: '',
                    weightingFactor: '',
                },
                {
                    no: 2,
                    tranformerConditionCriteria: 'Oil test main tank',
                    totalRPN: '',
                    rpnProportion: '',
                    weightingFactor: '',
                },
                {
                    no: 3,
                    tranformerConditionCriteria: 'Thermal scan',
                    totalRPN: '',
                    rpnProportion: '',
                    weightingFactor: '',
                },
                {
                    no: 4,
                    tranformerConditionCriteria: 'Insulation resistance',
                    totalRPN: '',
                    rpnProportion: '',
                    weightingFactor: '',
                },
                {
                    no: 5,
                    tranformerConditionCriteria: 'Ratio test',
                    totalRPN: '',
                    rpnProportion: '',
                    weightingFactor: '',
                },
                {
                    no: 6,
                    tranformerConditionCriteria: 'DC winding resistance',
                    totalRPN: '',
                    rpnProportion: '',
                    weightingFactor: '',
                },
                {
                    no: 7,
                    tranformerConditionCriteria: 'Winding PF/DF',
                    totalRPN: '',
                    rpnProportion: '',
                    weightingFactor: '',
                },
                {
                    no: 8,
                    tranformerConditionCriteria: 'Bushing PF/DF',
                    totalRPN: '',
                    rpnProportion: '',
                    weightingFactor: '',
                },
                {
                    no: 9,
                    tranformerConditionCriteria: 'Total',
                    totalRPN: '',
                    rpnProportion: '',
                    weightingFactor: '',
                }
            ]
        }
    },
    methods: {
        cellSpanMethod({ rowIndex, columnIndex }) {
            if (columnIndex === 1) {
                if (rowIndex === 7) {
                    return {
                        rowspan: 2,
                        colspan: 1
                    };
                }
                if (rowIndex === 8) {   
                    return {
                        rowspan: 0,
                        colspan: 0  
                    };    
                }
                if (rowIndex === 9) {
                    return {
                        rowspan: 2,
                        colspan: 1
                    };
                }
                if (rowIndex === 10) {
                    return {
                        rowspan: 0,
                        colspan: 0
                    };
                }
                if (rowIndex === 13) {
                    return {
                        rowspan: 2,
                        colspan: 1
                    };
                }
                if (rowIndex === 14) {
                    return {
                        rowspan: 0,
                        colspan: 0
                    };
                }
                if (rowIndex === 15) {
                    return {
                        rowspan: 3,
                        colspan: 1
                    };
                }
                if (rowIndex === 16 || rowIndex === 17){
                    return {
                        rowspan: 0,
                        colspan: 0
                    };
                }
                if (rowIndex === 27) {
                    return {
                        rowspan: 4,
                        colspan: 1
                    };
                }
                if( rowIndex === 28|| rowIndex === 29 || rowIndex ===30 ){

                    return {
                        rowspan: 0,
                        colspan: 0
                    };
                }
                if (rowIndex === 32) {
                    return {
                        rowspan: 2,
                        colspan: 1
                    };
                }
                {if (rowIndex === 33) {
                    return {
                        rowspan: 0,
                        colspan: 0
                    };
                }
                }
                {
                if (rowIndex === 59) {
                    return {
                        rowspan: 2,
                        colspan: 1
                    };
                }
                }
                if (rowIndex === 60) {
                        return {
                            rowspan: 0,
                            colspan: 0
                        };
                }
                {
                if (rowIndex === 62) {
                    return {
                        rowspan: 2,
                        colspan: 1
                    };
                    }
                }
                {
                if(rowIndex === 63){
                    return {
                        rowspan: 0,
                        colspan: 0
                    };
                } 
                }
                {
                 if (rowIndex === 64) {
                    return {
                        rowspan: 2,
                        colspan: 1
                    };
                    }
                }
                {
                if(rowIndex === 65){
                    return {
                        rowspan: 0,
                        colspan: 0
                    };
                }    
                }
            }
        }
    }
}
</script>
<style scoped>  
</style>