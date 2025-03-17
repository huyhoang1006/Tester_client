import condition from "../condition/index"

const currentTableTest = {
    InsulationResistance : {
        columnAddr : [
            {
                value: "measurement",
                label : "Measurement",
            },
            {
                value: "test_voltage",
                label : "Test voltage (V)",
            },
            {
                value: "r60s",
                label : "R60s (MΩ)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
        ],
        label : "Insulation resistance"
    },
    CTRatio : {
        columnAddr : [
            {
                value: "name",
                label : "Name",
            },
            {
                value: "ipr",
                label : "Ipr (A)",
            },
            {
                value: "isr",
                label : "Isr (A)",
            },
            {
                value: "ratio_meas",
                label : "Ratio meas",
            },
            {
                value: "ratio_dev",
                label : "Ratio dev",
            },
            {
                value: "polarity",
                label : "Polarity",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "CT ratio"
    },
    CTExcitation : {
        columnAddr : [
            {
                value: "name",
                label : "Name",
            },
            {
                value: "iknee",
                label : "I knee (A)",
            },
            {
                value: "vknee",
                label : "V knee (V)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "CT Excitation"
    },
    CTWindingRes : {
        columnAddr : [
            {
                value: "name",
                label : "Name",
            },
            {
                value: "rmeas",
                label : "R meas (Ω)",
            },
            {
                value: "rref",
                label : "R ref (Ω)",
            },
            {
                value: "rcorr",
                label : "R corr (Ω)",
            },
            {
                value: "rdev",
                label : "R dev (%)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "CT Winding resistance"
    },
    CTDfcap : {
        columnAddr : [
            {
                value: "measurement",
                label : "Measurement",
            },
            {
                value: "testMode",
                label : "Test mode",
            },
            {
                value: "test_voltage",
                label : "Test voltage (kV)",
            },
            {
                value: "dfref",
                label : "DF ref (%)",
            },
            {
                value: "cref",
                label : "C ref (pF)",
            },
            {
                value: "dfmeas",
                label : "DF meas (%)",
            },
            {
                value: "cmeas",
                label : "C meas (pF)",
            },
            {
                value: "ccal",
                label : "△C cal (%)",
            },
            {
                value: "assessment",
                label : "Assessment",
            } 
        ],
        label : "CT DF & CAP"
    },
    GeneralInspection : {
        columnAddr : [
            {
                value: "items",
                label : "Item",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "General inspection"
    },
}

Object.keys(currentTableTest).forEach((element) => {
    currentTableTest[element].columnAddr = currentTableTest[element].columnAddr.concat(condition)
})

export default currentTableTest