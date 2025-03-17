import condition from "../condition/index"

const voltageTableTest = {
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
    VTRatio : {
        columnAddr : [
            {
                value: "name",
                label : "Name",
            },
            {
                value: "upr",
                label : "Upr (A)",
            },
            {
                value: "usr",
                label : "Usr (A)",
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
        label : "VT ratio"
    },
    DcWindingRes : {
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
        label : "VT Winding resistance"
    },
    VTDfcap : {
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
        label : "VT DF & CAP"
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

Object.keys(voltageTableTest).forEach((element) => {
    voltageTableTest[element].columnAddr = voltageTableTest[element].columnAddr.concat(condition)
})

export default voltageTableTest