import condition from "../condition/index"
let transformerTableTest = {
    BushingPrimC2 : {
        columnAddr : [
            {
                value: "measurement",
                label : "Measurement",
            },
            {
                value: "test_mode",
                label : "Test mode",
            },
            {
                value: "test_voltage",
                label : "Test voltage",
            },
            {
                value: "df_ref",
                label : "DF ref (%)",
            },
            {
                value: "c_ref",
                label : "C ref (pF)",
            },
            {
                value: "df_meas",
                label : "DF meas (%)",
            },
            {
                value: "c_meas",
                label : "C meas (pF)",
            },
            {
                value: "df_change",
                label : "DF change",
            },
            {
                value: "tri_c_meas",
                label : "ΔC cal (%)",
            },
            {
                value: "assessment",
                label : "Assessment",
            }
            
        ],
        label : 'Bushing Prim DF & CAP C2'
    },
    BushingPrimC1 : {
        columnAddr : [
            {
                value: "measurement",
                label : "Measurement",
            },
            {
                value: "test_mode",
                label : "Test mode",
            },
            {
                value: "test_voltage",
                label : "Test voltage",
            },
            {
                value: "df_ref",
                label : "DF ref (%)",
            },
            {
                value: "c_ref",
                label : "C ref (pF)",
            },
            {
                value: "df_meas",
                label : "DF meas (%)",
            },
            {
                value: "c_meas",
                label : "C meas (pF)",
            },
            {
                value: "df_change",
                label : "DF change",
            },
            {
                value: "tri_c_meas",
                label : "ΔC cal (%)",
            },
            {
                value: "assessment",
                label : "Assessment",
            }
            
        ],
        label : 'Bushing Prim DF & CAP C1'
    },
    DcWindingPrim : {
        columnAddr : [
            {
                value: "tap",
                label : "Tap",
            },
            {
                value: "phase",
                label : "Name",
            },
            {
                value: "r_meas",
                label : "R meas",
            },
            {
                value: "r_ref",
                label : "R ref",
            },
            {
                value: "r_corr",
                label : "R corr",
            },
            {
                value: "error_r_ref",
                label : "Dev with R ref (%)",
            },
            {
                value: "error_between_phase",
                label : "Dev within phases (%)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
        ],
        label : 'DC Winding resistance Prim'
    },
    DcWindingSec : {
        columnAddr : [
            {
                value: "tap",
                label : "Tap",
            },
            {
                value: "phase",
                label : "Name",
            },
            {
                value: "r_meas",
                label : "R meas",
            },
            {
                value: "r_ref",
                label : "R ref",
            },
            {
                value: "r_corr",
                label : "R corr",
            },
            {
                value: "error_r_ref",
                label : "Dev with R ref (%)",
            },
            {
                value: "error_between_phase",
                label : "Dev within phases (%)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
        ],
        label : 'DC Winding resistance Sec'
    },
    DcWindingTert : {
        columnAddr : [
            {
                value: "tap",
                label : "Tap",
            },
            {
                value: "phase",
                label : "Name",
            },
            {
                value: "r_meas",
                label : "R meas",
            },
            {
                value: "r_ref",
                label : "R ref",
            },
            {
                value: "r_corr",
                label : "R corr",
            },
            {
                value: "error_r_ref",
                label : "Dev with R ref (%)",
            },
            {
                value: "error_between_phase",
                label : "Dev within phases (%)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
        ],
        label : 'DC Winding resistance Tert'
    },
    Dga : {
        columnAddr : [
            {
                value: "h2",
                label : "H2",
            },
            {
                value: "ch4",
                label : "CH4",
            },
            {
                value: "c2h2",
                label : "C2H2",
            },
            {
                value: "c2h4",
                label : "C2H4",
            },
            {
                value: "c2h6",
                label : "C2H6",
            },
            {
                value: "co",
                label : "CO",
            },
            {
                value: "co2",
                label : "CO2",
            },
            {
                value: "tdcg",
                label : "TDCG",
            },
            {
                value: "status",
                label : "Status",
            },
        ],
        label : 'Dga'
    },
    ExcitingCurrent : {
        columnAddr : [
            {
                value: "tap",
                label : "Tap",
            },
            {
                value: "phase",
                label : "Name",
            },
            {
                value: "i_out",
                label : "I out",
            },
            {
                value: "watt_losses",
                label : "Watt losses",
            },
            {
                value: "i_ref",
                label : "I ref",
            },
            {
                value: "dev_per",
                label : "I dev (%)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
        ],
        label : 'Exciting Current'
    },
    insulationresistance : {
        columnAddr : [
            {
                value: "measured_position",
                label : "Measurement",
            },
            {
                value: "type",
                label : "Type",
            },
            {
                value: "r15s",
                label : "R15s (MΩ)",
            },
            {
                value: "r60s",
                label : "R60s (MΩ)",
            },
            {
                value: "kht",
                label : "DAR",
            },
            {
                value: "pi",
                label : "PI",
            },
            {
                value: "r10min",
                label : "R10min (MΩ)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
        ],
        label : 'Insulation Resistance of Windings'
    },
    RatioPrimSec : {
        columnAddr : [
            {
                value: "tap",
                label : "Tap",
            },
            {
                value: "phase",
                label : "Phase",
            },
            {
                value: "hv1",
                label : "V prim (kV)",
            },
            {
                value: "lv",
                label : "V sec (kV)",
            },
            {
                value: "nominal_ratio",
                label : "Nominal ratio",
            },
            {
                value: "v_ratio",
                label : "Ratio meas",
            },
            {
                value: "ratio_dev",
                label : "Ratio dev",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
        ],
        label : 'Ratio Prim/Sec'
    },
    WindingDfCap : {
        columnAddr : [
            {
                value: "measurement",
                label : "Measurement",
            },
            {
                value: "test_mode",
                label : "Test mode",
            },
            {
                value: "test_voltage",
                label : "V test (kV)",
            },
            {
                value: "df_ref",
                label : "DF ref (%)",
            },
            {
                value: "c_ref",
                label : "C ref (pF)",
            },
            {
                value: "df_meas",
                label : "DF meas (%)",
            },
            {
                value: "c_meas",
                label : "C meas (pF)",
            },
            {
                value: "tri_c_meas",
                label : "ΔC cal (%)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
        ],
        label : 'Winding DF & CAP'
    },
    MeasurementOfOil : {
        columnAddr : [
            {
                value: "type_oil",
                label : "Type",
            },
            {
                value: "election_gap",
                label : "Electrode gap spacing (mm)",
            },
            {
                value: "result",
                label : "Result (kV)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
        ],
        label : 'Oil breakdown voltage'
    },
    InsulationResistanceYokeCore : {
        columnAddr : [
            {
                value: "measurement",
                label : "Measurement",
            },
            {
                value: "r60sRef",
                label : "R60s ref (MΩ)",
            },
            {
                value: "r60s",
                label : "R60s (MΩ)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
        ],
        label : 'Oil breakdown voltage'
    },
}

Object.keys(transformerTableTest).forEach((element) => {
    transformerTableTest[element].columnAddr = transformerTableTest[element].columnAddr.concat(condition)
})
export default transformerTableTest