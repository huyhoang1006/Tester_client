import condition from "../condition/index"

const powerCableTableTest = {
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
                value: "beforeHv",
                label : "Before HV test",
            },
            {
                value: "afterHv",
                label : "After HV test",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
        ],
        label : "Insulation resistance"
    },
    DcVoltageOverSheath : {
        columnAddr : [
            {
                value: "measurement",
                label : "Measurement",
            },
            {
                value: "test_voltage",
                label : "Test voltage (kV)",
            },
            {
                value: "duration",
                label : "Test duration (minute)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "DC voltage test of oversheath"
    },
    AcVoltageInsulation : {
        columnAddr : [
            {
                value: "measurement",
                label : "Measurement",
            },
            {
                value: "test_voltage",
                label : "Test voltage (kV)",
            },
            {
                value: "frequency",
                label : "Frequency (Hz)",
            },
            {
                value: "duration",
                label : "Test duration (minute)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "AC voltage test of the insulation"
    },
    DcVoltageInsulation : {
        columnAddr : [
            {
                value: "measurement",
                label : "Measurement",
            },
            {
                value: "test_voltage",
                label : "Test voltage (kV)",
            },
            {
                value: "leakage",
                label : "Leakage current (mA)",
            },
            {
                value: "duration",
                label : "Test duration (minute",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "DC voltage test of the insulation"
    },
    VlfTest : {
        columnAddr : [
            {
                value: "vlfSetting",
                label : "VLF settings",
            },
            {
                value: "table",
                label : "Table",
            },
        ],
        label : "VLF test"
    },
    TandeltaVlfSource : {
        columnAddr : [
            {
                value: "vlfSetting",
                label : "VLF settings",
            },
            {
                value: "table",
                label : "Table",
            },
        ],
        label : "Tan delta measurement with VLF source"
    },
    TandeltaPowerAcSource : {
        columnAddr : [
            {
                value: "measurement",
                label : "Measurement",
            },
            {
                value: "test_voltage",
                label : "Test voltage (kV)",
            },
            {
                value: "frequency",
                label : "Frequency (Hz)",
            },
            {
                value: "duration",
                label : "Test duration (s)",
            },
            {
                value: "tandelta",
                label : "Tan delta [10-3]",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "Tan delta measurement with power frequency AC source"
    },
    ParticalDischarge : {
        columnAddr : [
            {
                value: "measurement",
                label : "Measurement",
            },
            {
                value: "test_voltage",
                label : "Test voltage (kV)",
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
        label : "Partial discharge measurement"
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

Object.keys(powerCableTableTest).forEach((element) => {
    if(!['VlfTest', 'TandeltaVlfSource'].includes(element)) {
        powerCableTableTest[element].columnAddr = powerCableTableTest[element].columnAddr.concat(condition)
    }
})

export default powerCableTableTest