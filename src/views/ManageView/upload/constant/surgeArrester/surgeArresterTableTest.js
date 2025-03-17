import condition from "../condition/index"

const surgeArresterTableTest = {
    InsulationResistance : {
        columnAddr : [
            {
                value: "measurement",
                label : "Measurement",
            },
            {
                value: "vTest",
                label : "V test (V)",
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
    LeakageCurrent : {
        columnAddr : [
            {
                value: "phase",
                label : "Phase",
            },
            {
                value: "unit_no",
                label : "Unit no.",
            },
            {
                value: "vTest",
                label : "V Test (kV)",
            },
            {
                value: "r60s",
                label : "I meas (mA)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "CT ratio"
    },
    PowerFrequency : {
        columnAddr : [
            {
                value: "phase",
                label : "Phase",
            },
            {
                value: "unit_no",
                label : "Unit no.",
            },
            {
                value: "refCurrent",
                label : "Reference current (mA)",
            },
            {
                value: "vmeas",
                label : "V meas (kV)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "CT Excitation"
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

Object.keys(surgeArresterTableTest).forEach((element) => {
    surgeArresterTableTest[element].columnAddr = surgeArresterTableTest[element].columnAddr.concat(condition)
})

export default surgeArresterTableTest