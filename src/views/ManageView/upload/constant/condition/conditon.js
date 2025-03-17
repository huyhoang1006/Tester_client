const conditionData = 
    {
        condition : {
            columnAddr : [
                {
                    value: "top_oil_temperature",
                    label : "Top oil temperature"
                },
                {
                    value: "bottom_oil_temperature",
                    label : "Bottom oil temperature"
                },
                {
                    value: "winding_temperature",
                    label : "Winding temperature"
                },
                {
                    value: "reference_temperature",
                    label : "Reference temperature"
                },
                {
                    value: "ambient_temperature",
                    label : "Ambient temperature"
                },
                {
                    value: "humidity",
                    label : "Humidity"
                },
                {
                    value: "weather",
                    label : "Weather"
                }
            ],
            label : "Condition"
        },
        equipment : {
            columnAddr : [
                {
                    value: "model",
                    label : "Model"
                },
                {
                    value: "serial_no",
                    label : "Serial no."
                },
                {
                    value: "calibration_date",
                    label : "Calibration date"
                },
            ],
            label : "Equipment"
        },
    }

export default conditionData