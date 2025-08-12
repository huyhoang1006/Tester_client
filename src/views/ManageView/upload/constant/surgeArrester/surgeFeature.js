const surgeFeature = {
    tableRating : {
        columnAddr : [
            {
                value: "serial",
                label : "Serial no."
            },
            {
                value: "ratedVoltage",
                label : "Rated voltage Ur(kV)"
            },
            {
                value: "maximumVoltage",
                label : "Maximun system voltages(kA)"
            },
            {
                value: "continousVoltage",
                label : "Continous operating voltage Uc(kV)"
            },
            {
                value: "shortCurrent",
                label : "Short time witdstand current (kA)"
            },
            {
                value: "ratedCircuit",
                label : "Rated duration of short circuit (s)"
            },
            {
                value: "polesVoltage",
                label : "Power frequency withstand voltage(kV) (to earth and between poles)"
            },
            {
                value: "isoVoltage",
                label : "Power frequency withstand voltage(kV) (across the isolating distance)"
            },
        ],
        label : "Table Rating"
    }
}

export default surgeFeature