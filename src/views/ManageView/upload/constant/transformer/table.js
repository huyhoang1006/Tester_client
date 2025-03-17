const transformerTable = {
    voltage_ratings : {
        columnAddr : [
            {
                value: "winding",
                label : "Winding",
            },
            {
                value: "voltage_ll",
                label : "Voltage L-L",
                extends : {
                    value:"",
                    unit:"kV"
                }
            },
            {
                value: "voltage_ln",
                label : "Voltage L-N*",
                extends : {
                    value:"",
                    unit:"kV"
                }
            },
            {
                value: "insul_level_ll",
                label : "Insul. level L-L(BIL)",
                extends : {
                    value:"",
                    unit:"kV"
                }
            },
            {
                value: "comment",
                label : "Insulation Class",
            }
        ],
        label : 'Voltage ratings'
    },
    power_ratings : {
        columnAddr : [
            {
                value: "rated_power",
                label : "Rated power",
                extends : {
                    value:"",
                    unit:"MVA"
                }
            },
            {
                value: "cooling_class",
                label : "Cooling class",
            },
            {
                value: "temp_rise_wind",
                label : "Temp. rise wind.",
            }
        ],
        label : 'Power ratings'
    },
    voltage_regulation : {
        columnAddr : [
            {
                value: "winding",
                label : "winding",
            },
            {
                value: "voltage_regulation",
                label : "Voltage regulation",
            }
        ],
        label : 'Voltage regulation'
    },
    current_ratings : {
        columnAddr : [
            {
                value: "prim",
                label : "Prim",
                extends : {
                    value:"",
                    unit:"A"
                }
            },
            {
                value: "sec",
                label : "Sec",
                extends : {
                    value:"",
                    unit:"A"
                }
            },
            {
                value: "tert",
                label : "Tert",
                extends : {
                    value:"",
                    unit:"A"
                }
            },
        ],
        label : 'Current ratings'
    },
    prim_sec : {
        columnAddr : [
            {
                value: "short_circuit_impedances_uk",
                label : "Short-circuit impedance uk",
            },
            {
                value: "base_power",
                label : "Base power",
                extends : {
                    value:"",
                    unit:"MVA"
                }
            },
            {
                value: "base_voltage",
                label : "Base voltage",
                extends : {
                    value:"",
                    unit:"kV"
                }
            },
            {
                value: "load_losses_pk",
                label : "Load losses pk",
            },
            {
                value: "oltc_position",
                label : "OLTC position",
            },
            {
                value: "detc_position",
                label : "DETC position",
            },
        ],
        label : 'Short-circuit impedance Prim-Sec'
    },
    prim_tert : {
        columnAddr : [
            {
                value: "short_circuit_impedances_uk",
                label : "Short-circuit impedance uk",
            },
            {
                value: "base_power",
                label : "Base power",
                extends : {
                    value:"",
                    unit:"MVA"
                }
            },
            {
                value: "base_voltage",
                label : "Base voltage",
                extends : {
                    value:"",
                    unit:"kV"
                }
            },
            {
                value: "load_losses_pk",
                label : "Load losses pk",
            },
            {
                value: "oltc_position",
                label : "OLTC position",
            },
            {
                value: "detc_position",
                label : "DETC position",
            },
        ],
        label : 'Short-circuit impedance Prim-Tert'
    },
    sec_tert : {
        columnAddr : [
            {
                value: "short_circuit_impedances_uk",
                label : "Short-circuit impedance uk",
            },
            {
                value: "base_power",
                label : "Base power",
                extends : {
                    value:"",
                    unit:"MVA"
                }
            },
            {
                value: "base_voltage",
                label : "Base voltage",
                extends : {
                    value:"",
                    unit:"kV"
                }
            },
            {
                value: "load_losses_pk",
                label : "Load losses pk",
            },
            {
                value: "oltc_position",
                label : "OLTC position",
            },
            {
                value: "detc_position",
                label : "DETC position",
            },
        ],
        label : 'Short-circuit impedance Sec-Tert'
    },
    winding : {
        columnAddr : [
            {
                value: "prim",
                label : "Prim",
            },
            {
                value: "sec",
                label : "Sec",
            },
            {
                value: "tert",
                label : "Tert",
            },
        ],
        label : "Winding"
    }
}
export default transformerTable