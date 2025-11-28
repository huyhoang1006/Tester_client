<template>
    <div>
        <div>
            <div style= "font-size: 18px; font-weight: bold"> Fmeca table </div>
            <div> 
                <el-table
                    :data="fmecaTableData"
                    style="width: 100%;margin-bottom: 20px;"
                    row-key="no"
                    border
                    default-expand-all>
                    :tree-props="{ children: 'children' }"
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
                <table>
                    <thead>
                        <tr>

                        </tr>
                    </thead>
                </table>    
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
                                    failureMode: 'Arcing',
                                    sof: '',
                                    pof: '',
                                    conditionIndicator: 'Acetylene ',
                                    test: 'DGA',
                                    sot: '',
                                    rpn: '',
                                },
                                {
                                    no:'1.2.2',
                                    failureMode: 'Aging, Moisture, contamination',
                                    sof: '',  
                                    pof: '',
                                    conditionIndicator: 'Breakdown voltage',
                                    test: 'Oil test ',
                                    sot: '',
                                    rpn: '',
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
                        }
                    ]
                }
            ]
        }
    }
}
</script>
<style scoped>  
</style>