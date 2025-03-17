const powerCableColumn = {
    powerCable : {
        properties : {
            columnAddr : [
                {
                    value: "asset",
                    label : "Asset"
                },
                {
                    value: "asset_type",
                    label : "Asset type"
                },
                {
                    value: "serial_no",
                    label : "Serial number"
                },
                {
                    value: "manufacturer",
                    label : "Manufacturer"
                },
                {
                    value: "manufacturer_type",
                    label : "Manufacturer type"
                },
                {
                    value: "manufacturing_year",
                    label : "Manufacturing year"
                },
                {
                    value: "asset_system_code",
                    label : "Asset system code"
                },
                {
                    value: "apparatus_id",
                    label : "Apparatus id"
                },
                {
                    value: "feeder",
                    label : "Feeder"
                },
                {
                    value: "comment",
                    label : "Comment"
                },
            ]
        },
        ratings : {
            columnAddr : [
                {
                    value : 'rated_voltage',
                    label : "Rated voltage (rms)"
                },
                {
                    value : 'max_voltage',
                    label : "Maximum voltage (rms)"
                },
                {
                    value : 'rated_frequency',
                    label : "Rated frequency"
                },
                {
                    value : 'shortcircuit',
                    label : "Short circuit current"
                },
                {
                    value : 'rated_duration',
                    label : "Rated duration of short circuit"
                }
            ]
        },
        config : {
            columnAddr : [
                {
                    value : 'phases',
                    label : "Phase"
                },
                {
                    value : 'cores',
                    label : "Cores"
                },
            ]
        },
        layerConstruction : {
            columnAddr : [
                {
                    value : 'conductor',
                    label : "Conductor"
                },
                {
                    value : 'conductor_shield',
                    label : "Conductor shield"
                },
                {
                    value : 'insulation',
                    label : "Insulation"
                },
                {
                    value : 'insulation_screen',
                    label : "Insulation screen"
                },
                {
                    value : 'sheath',
                    label : "Sheath"
                },
                {
                    value : 'sheath_reinforcing',
                    label : "Sheath reinforcing tap"
                },
                {
                    value : 'concentric_neutral',
                    label : "Concentric neutral"
                },
                {
                    value : 'armour_bedding',
                    label : "Amour bedding"
                },
                {
                    value : 'armour',
                    label : "Amour"
                },
                {
                    value : 'oversheath',
                    label : "Oversheath/Jacket/Serving"
                }
            ]
        },
        others : {
            columnAddr : [
                {
                    value : 'insulation_method',
                    label : "Installation method"
                },
                {
                    value : 'bonding_type',
                    label : "Bonding type"
                },
                {
                    value : 'install_location',
                    label : "Install location"
                },
                {
                    value : 'cable_length',
                    label : "Cable length"
                },
            ]
        },
        data : {
            columnAddr : [
                {
                    value : 'conductor',
                    label : "Conductor"
                },
                {
                    value : 'insulation',
                    label : "Insulation"
                },
                {
                    value : 'sheath_reinforcing',
                    label : "Sheath reinforcing tape"
                },
                {
                    value : 'armour',
                    label : "Armour"
                },
                {
                    value : 'conductor_shield',
                    label : "Conductor shield"
                },
                {
                    value : 'insulation_screen',
                    label : "Insulation screen"
                },
                {
                    value : 'concentric_neutral',
                    label : "Concentric neutral"
                },
                {
                    value : 'oversheath',
                    label : "Oversheath/ Jack/ Serving"
                },
                {
                    value : 'sheath',
                    label : "Sheath"
                },
                {
                    value : 'armour_bedding',
                    label : "Armour bedding"
                }
            ]
        },
    },
    assessories : {
        terminal : {
            columnAddr : [
                {
                    value: "rated_voltage",
                    label : "Rated voltage"
                },
                {
                    value: "bil",
                    label : "BIL"
                },
                {
                    value: "bsl",
                    label : "BSL"
                },
                {
                    value: "type",
                    label : "Type"
                },
                {
                    value: "class",
                    label : "Class"
                },
                {
                    value: "connector_type",
                    label : "Connector type"
                },
                {
                    value: "service_condition",
                    label : "Service condition"
                }
            ],
            label : "Terminal"
        },
        joint : {
            columnAddr : [
                {
                    value: "rated_voltage",
                    label : "Rated voltage"
                },
                {
                    value: "rated_current",
                    label : "Rated current"
                },
                {
                    value: "category",
                    label : "Category"
                },
                {
                    value: "construction",
                    label : "Construction"
                },
                {
                    value: "service_condition",
                    label : "Service condition"
                },
            ],
            label : "Joint"
        },
        sheath_limits : {
            columnAddr : [
                {
                    value: "rated_voltage",
                    label : "Rated voltage Ur"
                },
                {
                    value: "max_continuous",
                    label : "Maximum continuous operating voltage Uc"
                },
                {
                    value: "nominal_discharge",
                    label : "Nominal discharge current"
                },
                {
                    value: "hight_current",
                    label : "High current impulse withstand"
                },
                {
                    value: "long_duration",
                    label : "Long duration current impulse withstand"
                },
                {
                    value: "short_circuit",
                    label : "Short circuit withstand"
                },
            ],
            label : "Sheath voltage limiter"
        },
    }
}

export default powerCableColumn