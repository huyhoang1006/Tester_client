import condition from "../condition/index"

const powerCableRowTest = {
    VlfTest : {
        vlfSetting : {
            columnAddr : [
                {
                    value: "frequency",
                    label : "Frequency",
                },
                {
                    value: "waveForm",
                    label : "Waveform",
                },
                {
                    value: "testDuration",
                    label : "Test duration",
                },
                {
                    value: "voltageDisplay",
                    label : "Voltage display",
                },
            ],
            label : "VLF settings"
        },
        table : {
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
                    value: "leakage",
                    label : "Leakage current (mA)",
                },
                {
                    value: "assessment",
                    label : "Assessment",
                },
            ],
            label : "Table"
        }
    },
    TandeltaVlfSource : {
        vlfSetting : {
            columnAddr : [
                {
                    value: "frequency",
                    label : "Frequency",
                },
                {
                    value: "waveForm",
                    label : "Waveform",
                },
                {
                    value: "testDuration",
                    label : "Test duration",
                },
                {
                    value: "voltageDisplay",
                    label : "Voltage display",
                },
            ],
            label : "VLF settings"
        },
        table : {
            columnAddr : [
                {
                    value: "measurement",
                    label : "Measurement",
                },
                {
                    value: "test_voltage_label",
                    label : "Test voltage label (kV)",
                },
                {
                    value: "test_voltage",
                    label : "Test voltage (kV)",
                },
                {
                    value: "capacitance",
                    label : "Capacitance (μF)",
                },
                {
                    value: "mtd",
                    label : "MTD [10-3]",
                },
                {
                    value: "dtd_eachstep",
                    label : "ΔTD [10-3] (each step)",
                },
                {
                    value: "dtdu",
                    label : "DTD [10-3] (0.5 U0 & 1.5 U0)",
                },
                {
                    value: "tdts",
                    label : "TDTS [10-3]",
                },
                {
                    value: "assessment",
                    label : "Assessment",
                },
            ],
            label : "Table"
        }
    },
}

Object.keys(powerCableRowTest).forEach((element) => {
    powerCableRowTest[element]['table'].columnAddr = powerCableRowTest[element]['table'].columnAddr.concat(condition)
})

export default powerCableRowTest