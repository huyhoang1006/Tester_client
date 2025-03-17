const dataTransformer = {
    id: '',
    location_id: '',
    asset: 'Transformer',
    asset_type: '',
    serial_no: '',
    manufacturer: '',
    manufacturer_type: '',
    manufacturing_year: '',
    asset_system_code: '',
    apparatus_id: '',
    feeder: '',
    date_of_warehouse_receipt: '',
    date_of_delivery: '',
    date_of_production_order: '',
    comment: '',
    phases: '3',
    vector_group: {
        prim :"",
        sec :{
            I:"",
            Value:""
        },
        tert :{
            I:"",
            Value:"",
            accessibility:""
        },
        vector : ""
    },
    vector_group_custom: '',
    unsupported_vector_group: '',
    rated_frequency: '50',
    voltage_ratings: [],
    voltage_regulation: [],
    power_ratings: [],
    current_ratings: [],
    max_short_circuit_current_ka: {
        value:"",
        unit:"kA"
    },
    max_short_circuit_current_s: '',
    ref_temp: '75',
    prim_sec: [],
    prim_tert: [],
    sec_tert: [],
    base_power: 
        {
            value:"",
            unit:"MVA"
        },
    base_voltage: 
        {
            value:"",
            unit:"kV"
        },
    zero_percent: '',
    category: '',
    status: '',
    tank_type: '',
    insulation_medium: '',
    insulation_weight: '',
    insulation_volume: null,
    total_weight: '',
    winding: {
        prim:"Copper",
        sec:"Copper",
        tert:"Copper"
    },
    date_of_warehouse_delivery: '',
    progress: '',
    standard: '',
    oil_type: '',
    thermal_meter: ''
}
export default dataTransformer