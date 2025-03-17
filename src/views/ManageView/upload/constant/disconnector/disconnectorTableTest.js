import condition from "../condition/index"

const disconnectorTableTest = {
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
    ContactResistance : {
        columnAddr : [
            {
                value: "measurement",
                label : "Measurement",
            },
            {
                value: "itest",
                label : "I test (A)",
            },
            {
                value: "contactResistance",
                label : "Contact resistance (µΩ)	",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "Contact resistance"
    },
    InsulationResMotor : {
        columnAddr : [
            {
                value: "test_voltage",
                label : "Test voltage (V)",
            },
            {
                value: "r60s",
                label : "R60s (mΩ)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "Insulation resisitance of motor"
    },
    DcWindingMotor : {
        columnAddr : [
            {
                value: "rmeas",
                label : "Rmeas (Ω)",
            },
            {
                value: "assessment",
                label : "Assessment",
            } 
        ],
        label : "DC winding resistance of motor"
    },
    OperatingTest : {
        columnAddr : [
            {
                value: "measurement",
                label : "Measurement",
            },
            {
                value: "workingTime",
                label : "Working time (s)",
            },
            {
                value: "assessment",
                label : "Assessment",
            } 
        ],
        label : "Operating Test"
    },
    ControlCheck : {
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
        label : "Control cabinet check"
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

Object.keys(disconnectorTableTest).forEach((element) => {
    disconnectorTableTest[element].columnAddr = disconnectorTableTest[element].columnAddr.concat(condition)
})

export default disconnectorTableTest