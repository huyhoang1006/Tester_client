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
                value: "polesVotage",
                label : "Power frequency witdstand voltage(kV) (to eartd and between poles)"
            },
            {
                value: "isoVoltage",
                label : "Power frequency witdsatand voltage(kV) (across tde isolating distance)"
            },
        ],
        label : "Table Rating"
    }
}

export default surgeFeature