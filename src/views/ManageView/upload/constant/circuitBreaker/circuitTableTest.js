import condition from "../condition/index"

const circuitTableTest = {
    motorCurrent : {
        columnAddr : [
            {
                value: "inrushCurrent",
                label : "Inrush current (A)",
            },
            {
                value: "charging",
                label : "Charging (s)",
            },
            {
                value: "chargingCurrent",
                label : "Charging current (A)",
            },
            {
                value: "miniVoltage",
                label : "Minimum voltage (V)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            {
                value: "condition_indicator",
                label : "Condition indicator",
            },
        ],
        label : "Motor Current"
    },
    cTiming : {
        columnAddr : [
            {
                value: "phase",
                label : "Phase",
            },
            {
                value: "interruptNo",
                label : "Interrupter no.",
            },
            {
                value: "closingTime",
                label : "Closing time (ms)",
            },
            {
                value: "closingSyncPhase",
                label : "Closing sync. between phase (ms)",
            },
            {
                value: "closingSyncInterrupt",
                label : "Closing sync. between Interrupter (ms)",
            },
            {
                value: "closeOpenTime",
                label : "Close-Open time (ms)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "C Timing"
    },
    oTiming : {
        columnAddr : [
            {
                value: "phase",
                label : "Phase",
            },
            {
                value: "interruptNo",
                label : "Interrupter no.",
            },
            {
                value: "openingTime",
                label : "Opening time (ms)",
            },
            {
                value: "openingSync",
                label : "Opening sync. between phase (ms)",
            },
            {
                value: "openingInterrupt",
                label : "Opening sync. between Interrupter (ms)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "O Timing"
    },
    ocTiming : {
        columnAddr : [
            {
                value: "phase",
                label : "Phase",
            },
            {
                value: "interruptNo",
                label : "Interrupter no.",
            },
            {
                value: "openingTime",
                label : "Opening time (ms)",
            },
            {
                value: "openingSync",
                label : "Opening sync. between phase (ms)",
            },
            {
                value: "openingInterrupt",
                label : "Opening sync. between Interrupter (ms)",
            },
            {
                value: "openClose",
                label : "Open-Close time (ms)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "OC Timing"
    },
    coTiming : {
        columnAddr : [
            {
                value: "phase",
                label : "Phase",
            },
            {
                value: "interruptNo",
                label : "Interrupter no.",
            },
            {
                value: "closingTime",
                label : "Closing time (ms)",
            },
            {
                value: "closingSync",
                label : "Closing sync. between phase (ms)",
            },
            {
                value: "closingInterrupt",
                label : "Closing sync. between Interrupter (ms)",
            },
            {
                value: "closeOpenTime",
                label : "Open-Close time (ms)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "CO Timing"
    },
    ocoTiming : {
        columnAddr : [
            {
                value: "phase",
                label : "Phase",
            },
            {
                value: "interruptNo",
                label : "Interrupter no.",
            },
            {
                value: "openingTime",
                label : "Opening time (ms)",
            },
            {
                value: "openingSync",
                label : "Opening sync. between phase (ms)",
            },
            {
                value: "openingInterrupt",
                label : "Opening sync. between Interrupter (ms)",
            },
            {
                value: "closingTime",
                label : "Closing time (ms)",
            },
            {
                value: "closingSync",
                label : "Closing sync. between phase (ms)",
            },
            {
                value: "closingInterrupt",
                label : "Closing sync. between Interrupter (ms)",
            },
            {
                value: "closeOpenTime",
                label : "Open-Close time (ms)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "O-CO Timing"
    },
    cocoTiming : {
        columnAddr : [
            {
                value: "phase",
                label : "Phase",
            },
            {
                value: "tripCoil",
                label : "Trip coil",
            },
            {
                value: "interrupter",
                label : "Interrupter",
            },
            {
                value: "openingTime",
                label : "Opening time (ms)",
            },
            {
                value: "openingSync",
                label : "Opening sync. (ms)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "CO-CO Timing"
    },
    ococoTiming : {
        columnAddr : [
            {
                value: "phase",
                label : "Phase",
            },
            {
                value: "tripCoil",
                label : "Trip coil",
            },
            {
                value: "interrupter",
                label : "Interrupter",
            },
            {
                value: "openingTime",
                label : "Opening time (ms)",
            },
            {
                value: "openingSync",
                label : "Opening sync. (ms)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "O-CO-CO Timing"
    },
    contactResistance : {
        columnAddr : [
            {
                value: "phase",
                label : "Phase",
            },
            {
                value: "interruptNo",
                label : "Interrupter no.",
            },
            {
                value: "iTest",
                label : "I test (A)",
            },
            {
                value: "contactResistance",
                label : "Contact resistance (µΩ)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "Contact Resistance"
    },
    minimumPickup : {
        columnAddr : [
            {
                value: "operation",
                label : "Operation",
            },
            {
                value: "tripCoilNo",
                label : "Trip coil no.",
            },
            {
                value: "closeCoilNo",
                label : "Close coil no.",
            },
            {
                value: "vPickup",
                label : "V pickup (V)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "Minimum pick up"
    },
    underVoltageRelease : {
        columnAddr : [
            {
                value: "tripCoil",
                label : "Trip coil no.",
            },
            {
                value: "tripVoltage",
                label : "Trip voltage (V)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "Under-voltage release"
    },
    overCurrentRelease : {
        columnAddr : [
            {
                value: "tripCoil",
                label : "Trip coil no.",
            },
            {
                value: "tripCurrent",
                label : "Trip current (mA)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "Overcurrent release"
    },
    dcWindingTripCoil : {
        columnAddr : [
            {
                value: "tripCoilNo",
                label : "Trip coil no.",
            },
            {
                value: "rmeas",
                label : "Rmeas (Ω)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "DC winding resistance of trip coil"
    },
    dcWindingCloseCoil : {
        columnAddr : [
            {
                value: "closeCoilNo",
                label : "Close coil no.",
            },
            {
                value: "rmeas",
                label : "Rmeas (Ω)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "DC winding resistance of close coil"
    },
    dcWindingMotor : {
        columnAddr : [
            {
                value: "rmeas",
                label : "Rmeas (Ω)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "DC winding resistance of motor"
    },
    insulationResistanceCircuit : {
        columnAddr : [
            {
                value: "measure",
                label : "Measurement",
            },
            {
                value: "testVoltage",
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
        label : "Insulation resistance of circuit breaker"
    },
    insulationResistanceCloseCoil : {
        columnAddr : [
            {
                value: "closeCoilNo",
                label : "Close coil no.",
            },
            {
                value: "testVoltage",
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
        label : "Insulation resistance of close coil"
    },
    insulationResistanceTripCoil : {
        columnAddr : [
            {
                value: "tripCoilNo",
                label : "Trip coil no.",
            },
            {
                value: "testVoltage",
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
        label : "Insulation resistance of trip coil"
    },
    insulationResistanceMotor : {
        columnAddr : [
            {
                value: "testVoltage",
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
        label : "Insulation resistance of motor"
    },
    sf6MoiturePurity : {
        moitureTable : {
            columnAddr : [
                {
                    value: "moiture",
                    label : "Moiture (ppm)",
                },
                {
                    value: "assessment",
                    label : "Assessment",
                },
                
            ],
        },
        purityTable : {
            columnAddr : [
                {
                    value: "purity",
                    label : "Purity (%)",
                },
                {
                    value: "assessment",
                    label : "Assessment",
                },
                
            ],
        },
        
        label : "SF6 gas moiture and purity",
        tableName : [
            {
                value : "moitureTable",
                label : "Moiture (ppm)"
            },
            {
                value : "purityTable",
                label : "Purity (%) table"
            },
            
        ]
    },
    sf6GasAnalysis : {
        decomSf6Table : {
            columnAddr : [
                {
                    value: "decomSf6",
                    label : "Decomposition of SF6 (ppm)",
                },
                {
                    value: "assessment",
                    label : "Assessment",
                },
                
            ],
        },
        so2Sof2Table : {
            columnAddr : [
                {
                    value: "so2Sof2",
                    label : "SO2 + SOF2 (ppm)",
                },
                {
                    value: "assessment",
                    label : "Assessment",
                },
                
            ],
        },
        hfTable : {
            columnAddr : [
                {
                    value: "hf",
                    label : "HF (ppm)",
                },
                {
                    value: "assessment",
                    label : "Assessment",
                },
                
            ],
        },
        label : "SF6 gas analysis",
        tableName : [
            {
                value : "decomSf6Table",
                label : "Decomposition of SF6 (ppm)"
            },
            {
                value : "so2Sof2Table",
                label : "SO2 + SOF2 (ppm)"
            },
            {
                value : "hfTable",
                label : "HF (ppm)"
            },
        ]
    },
    pressureGauge : {
        columnAddr : [
            {
                value: "sf6Pressure",
                label : "SF6 pressure (MPa)",
            },
            {
                value: "alarm",
                label : "Alarm (MPa)",
            },
            {
                value: "lockout",
                label : "Lockout (MPa)",
            },
            {
                value: "assessment",
                label : "Assessment",
            },
            
        ],
        label : "Pressure gauge"
    },
    inspection : {
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
        label : "Inspection"
    },
}

let multiTable = ['sf6MoiturePurity','sf6GasAnalysis']
Object.keys(circuitTableTest).forEach((element) => {
    if(!multiTable.includes(element)) {
        circuitTableTest[element].columnAddr = circuitTableTest[element].columnAddr.concat(condition)
    } else {
        Object.keys(circuitTableTest[element]).forEach((e) => {
            if(e != 'label' && e!= 'tableName') {
                circuitTableTest[element][e].columnAddr = circuitTableTest[element][e].columnAddr.concat(condition)
            }
        })
    }
})

export default circuitTableTest