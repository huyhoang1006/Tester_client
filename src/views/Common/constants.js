export const FEATURE_TREE = {
    OrgEntityToOrgDto: { label: 'Organisation', children: {
        name:              { label: 'Name',             value: 'name' },
        aliasName:         { label: 'Alias name',       value: 'aliasName' },
        tax_code:          { label: 'Tax code',         value: 'tax_code' },
        street:            { label: 'Street',           value: 'street' },
        ward_or_commune:   { label: 'Ward/Commune',     value: 'ward_or_commune' },
        district_or_town:  { label: 'District/Town',    value: 'district_or_town' },
        city:              { label: 'City',             value: 'city' },
        state_or_province: { label: 'State/Province',   value: 'state_or_province' },
        postal_code:       { label: 'Postal code',      value: 'postal_code' },
        country:           { label: 'Country',          value: 'country' },
        phoneNumber:       { label: 'Phone number',     value: 'phoneNumber' },
        fax:               { label: 'Fax',              value: 'fax' },
        email:             { label: 'Email',            value: 'email' },
        comment:           { label: 'Comment',          value: 'comment' },
        positionPoints:    { label: 'Geo position', children: {
        x: { label: 'Position X', value: 'pos_x' },
        y: { label: 'Position Y', value: 'pos_y' },
        z: { label: 'Position Z', value: 'pos_z' }
        }}
    }},
    SubstationDto: { label: 'Substation', children: {
        name: { label: 'Name', value: 'name' }, aliasName: { label: 'Alias name', value: 'aliasName' },
        type: { label: 'Type', value: 'type' }, generation: { label: 'Generation', value: 'generation' },
        industry: { label: 'Industry', value: 'industry' }, locationName: { label: 'Location name', value: 'locationName' },
        street: { label: 'Street', value: 'street' }, ward_or_commune: { label: 'Ward/Commune', value: 'ward_or_commune' },
        district_or_town: { label: 'District/Town', value: 'district_or_town' },
        state_or_province: { label: 'State/Province', value: 'state_or_province' },
        city: { label: 'City', value: 'city' }, country: { label: 'Country', value: 'country' },
        personName: { label: 'Contact name', value: 'personName' }, department: { label: 'Department', value: 'department' },
        position: { label: 'Position', value: 'position' }, phoneNumber: { label: 'Phone number', value: 'phoneNumber' },
        fax: { label: 'Fax', value: 'fax' }, email: { label: 'Email', value: 'email' }, comment: { label: 'Comment', value: 'comment' }
    }},
    VoltageLevelDto: { label: 'Voltage Level', children: {
        name: { label: 'Name', value: 'name' }, comment: { label: 'Comment', value: 'comment' },
        high_voltage_limit_value: { label: 'High voltage limit', value: 'high_voltage_limit_value' },
        low_voltage_limit_value:  { label: 'Low voltage limit',  value: 'low_voltage_limit_value' },
        base_voltage_value:       { label: 'Base voltage',       value: 'base_voltage_value' }
    }},
    Bay: { label: 'Bay', children: {
        name: { label: 'Name', value: 'name' }, aliasName: { label: 'Alias name', value: 'aliasName' },
        breaker_configuration: { label: 'Breaker configuration', value: 'breaker_configuration' },
        bus_bar_configuration: { label: 'Bus Bar configuration', value: 'bus_bar_configuration' }
    }},
    // Testing equipment: danh sách phẳng, KHÔNG thuộc cây org→job.
    // Leaf values khớp Dto/TestingEquipment (Properties + Calibration + License).
    TestingEquipmentDto: { label: 'Testing equipment', children: {
        PropertiesDto: { label: 'Properties', children: {
            name:              { label: 'Equipment name',     value: 'name' },
            type:              { label: 'Equipment type',     value: 'type' },
            serial_no:         { label: 'Serial no.',         value: 'serial_no' },
            manufacturer:      { label: 'Manufacturer',       value: 'manufacturer' },
            model:             { label: 'Model',              value: 'model' },
            manufacturer_year: { label: 'Manufacturing date', value: 'manufacturer_year' },
            asset_tag:         { label: 'Asset tag',          value: 'asset_tag' },
            status:            { label: 'Status',             value: 'status' },
            country_of_origin: { label: 'Country of origin',  value: 'country_of_origin' },
            in_use_date:       { label: 'In use date',        value: 'in_use_date' },
            comment:           { label: 'Comment',            value: 'comment' },
            is_accessory:      { label: 'Is accessory (0/1)', value: 'is_accessory' }
        }},
        CalibrationDto: { label: 'Calibration', children: {
            calibration_date:   { label: 'Calibration date',   value: 'cal_calibration_date' },
            due_date:           { label: 'Due date',           value: 'cal_due_date' },
            interval_months:    { label: 'Interval (months)',  value: 'cal_interval_months' },
            provider:           { label: 'Provider',           value: 'cal_provider' },
            certificate_number: { label: 'Certificate number', value: 'cal_certificate_number' },
            result:             { label: 'Result',             value: 'cal_result' },
            notes:              { label: 'Notes',              value: 'cal_notes' }
        }},
        LicenseDto: { label: 'Software license', children: {
            option_name:     { label: 'Option name',     value: 'lic_option_name' },
            license_key:     { label: 'License key',     value: 'lic_license_key' },
            enabled:         { label: 'Enabled (0/1)',   value: 'lic_enabled' },
            description:     { label: 'Description',     value: 'lic_description' },
            activation_date: { label: 'Activation date', value: 'lic_activation_date' },
            expiry_date:     { label: 'Expiry date',     value: 'lic_expiry_date' }
        }},
        RepairDto: { label: 'Repair history', children: {
            created_date_time: { label: 'Date',     value: 'rep_created_date_time' },
            reason:            { label: 'Reason',   value: 'rep_reason' },
            provider:          { label: 'Provider', value: 'rep_provider' },
            cost:              { label: 'Cost',     value: 'rep_cost' },
            status:            { label: 'Status (InProgress/Completed)', value: 'rep_status' }
        }},
        UsageDto: { label: 'Usage history (export only)', children: {
            date:       { label: 'Date',       value: 'use_date' },
            job_name:   { label: 'Job name',   value: 'use_job_name' },
            asset_name: { label: 'Asset name', value: 'use_asset_name' },
            test_type:  { label: 'Test type',  value: 'use_test_type' },
            tested_by:  { label: 'Tested by',  value: 'use_tested_by' }
        }}
    }},
    Asset: { label: 'Asset', children: {
        TransformerDataDto: { label: 'Transformer', children: {
        PropertiesDto: { label: 'Properties', children: {
            type: { label: 'Asset type', value: 'type' }, serial_no: { label: 'Serial no.', value: 'serial_no' },
            manufacturer: { label: 'Manufacturer', value: 'manufacturer' }, manufacturer_type: { label: 'Manufacturer type', value: 'manufacturer_type' },
            manufacturer_year: { label: 'Manufacturing year', value: 'manufacturer_year' }, model: { label: 'Model', value: 'model' },
            country_of_origin: { label: 'Country of origin', value: 'country_of_origin' }, apparatus_id: { label: 'Apparatus ID', value: 'apparatus_id' },
            comment: { label: 'Comment', value: 'comment' }
        }},
        WindingConfigurationDto: { label: 'Winding Config', children: {
            phases: { label: 'Phases', value: 'phases' }, phase: { label: 'Phase', value: 'phase' }, vector_group_custom: { label: 'Vector group (custom)', value: 'vector_group_custom' },
            unsupported_vector_group: { label: 'Vector group (unsupported)', value: 'unsupported_vector_group' },
            vector_group_data: { label: 'Vector group (computed)', value: 'vector_group_data' }
        }},
        RatingsDto: { label: 'Ratings', children: {
            rated_frequency: { label: 'Rated frequency', value: 'rated_frequency' },
            short_circuit_ka: { label: 'Max SC current', value: 'short_circuit_ka' },
            short_circuit_s: { label: 'SC duration', value: 'short_circuit_s' },
            voltage_ratings: { label: 'Voltage ratings', children: {
            winding:            { label: 'Winding',                  value: 'vr_winding' },
            voltage_ll:         { label: 'Voltage L-L',              value: 'vr_voltage_ll' },
            voltage_ln:         { label: 'Voltage L-N',              value: 'vr_voltage_ln' },
            insul_level_ll:     { label: 'Insulation level (BIL)',   value: 'vr_insul_level_ll' },
            insulation_class:   { label: 'Insulation class',         value: 'vr_insulation_class' },
            voltage_regulation: { label: 'Voltage regulation',       value: 'vr_voltage_regulation' }
            }},
            power_ratings: { label: 'Power ratings', children: {
            rated_power:    { label: 'Rated power',       value: 'pr_rated_power' },
            cooling_class:  { label: 'Cooling class',     value: 'pr_cooling_class' },
            temp_rise_wind: { label: 'Temp. rise winding',value: 'pr_temp_rise_wind' }
            }},
            current_ratings: { label: 'Current ratings', children: {
            prim: { label: 'Current prim', value: 'cr_prim' },
            sec:  { label: 'Current sec',  value: 'cr_sec' },
            tert: { label: 'Current tert', value: 'cr_tert' }
            }}
        }},
        ImpedancesDto: { label: 'Impedances', children: {
            ref_temp: { label: 'Ref. temperature', value: 'ref_temp' },
            zsi_base_power: { label: 'Zero seq. base power', value: 'zsi_base_power' }, zsi_base_voltage: { label: 'Zero seq. base voltage', value: 'zsi_base_voltage' },
            zsi_zero: { label: 'Zero seq. Z0 (zero)', value: 'zsi_zero' }, zsi_prim: { label: 'Zero seq. Z0 (prim)', value: 'zsi_prim' }, zsi_sec: { label: 'Zero seq. Z0 (sec)', value: 'zsi_sec' },
            prim_sec: { label: 'SC impedance Prim-Sec', children: {
            uk:          { label: 'Impedance (uk%)', value: 'ps_uk' },
            base_power:  { label: 'Base power',     value: 'ps_base_power' },
            base_voltage:{ label: 'Base voltage',   value: 'ps_base_voltage' },
            load_losses: { label: 'Load losses (pk)',value: 'ps_load_losses' }
            }},
            prim_tert: { label: 'SC impedance Prim-Tert', children: {
            uk:          { label: 'Impedance (uk%)', value: 'pt_uk' },
            base_power:  { label: 'Base power',     value: 'pt_base_power' },
            base_voltage:{ label: 'Base voltage',   value: 'pt_base_voltage' },
            load_losses: { label: 'Load losses (pk)',value: 'pt_load_losses' }
            }},
            sec_tert: { label: 'SC impedance Sec-Tert', children: {
            uk:          { label: 'Impedance (uk%)', value: 'st_uk' },
            base_power:  { label: 'Base power',     value: 'st_base_power' },
            base_voltage:{ label: 'Base voltage',   value: 'st_base_voltage' },
            load_losses: { label: 'Load losses (pk)',value: 'st_load_losses' }
            }}
        }},
        OthersDto: { label: 'Others', children: {
            category: { label: 'Category', value: 'category' }, status: { label: 'Status', value: 'status' },
            tank_type: { label: 'Tank type', value: 'tank_type' }, insulation_medium: { label: 'Insulation medium', value: 'insulation_medium' },
            total_weight: { label: 'Total weight', value: 'total_weight' }, insulation_weight: { label: 'Insulation weight', value: 'insulation_weight' }, insulation_volume: { label: 'Insulation volume', value: 'insulation_volume' },
            winding: { label: 'Winding material', children: { prim: { label: 'Prim', value: 'winding_prim' }, sec: { label: 'Sec', value: 'winding_sec' }, tert: { label: 'Tert', value: 'winding_tert' } }}
        }},
        TapChangersDto: { label: 'Tap changer', children: {
            mode: { label: 'Mode', value: 'tap_mode' }, serial_no: { label: 'Serial no.', value: 'tap_serial_no' },
            manufacturer: { label: 'Manufacturer', value: 'tap_manufacturer' }, manufacturer_type: { label: 'Manufacturer type', value: 'tap_manufacturer_type' },
            winding: { label: 'Winding', value: 'tap_winding' }, tap_scheme: { label: 'Tap scheme', value: 'tap_scheme' }, no_of_taps: { label: 'Num of taps', value: 'no_of_taps' }
        }},
        BushingDto: { label: 'Bushing', children: {
            prim: { label: 'Primary bushings', children: {
            pos: { label: 'Position', value: 'bushing_prim_pos' },
            asset_type: { label: 'Asset type', value: 'bushing_prim_asset_type' },
            serial_no: { label: 'Serial no.', value: 'bushing_prim_serial_no' },
            manufacturer: { label: 'Manufacturer', value: 'bushing_prim_manufacturer' },
            manufacturer_type: { label: 'Manufacturer type', value: 'bushing_prim_manufacturer_type' },
            manufacturer_year: { label: 'Manufacturing year', value: 'bushing_prim_manufacturer_year' },
            insulation_level: { label: 'Insul. level (BIL)', value: 'bushing_prim_insulation_level' },
            voltage_l_ground: { label: 'Voltage L-ground', value: 'bushing_prim_voltage_l_ground' },
            max_system_voltage: { label: 'Max system voltage', value: 'bushing_prim_max_system_voltage' },
            rate_current: { label: 'Rated current', value: 'bushing_prim_rate_current' },
            df_c1: { label: 'DF (C1)', value: 'bushing_prim_df_c1' },
            cap_c1: { label: 'Cap. (C1)', value: 'bushing_prim_cap_c1' },
            df_c2: { label: 'DF (C2)', value: 'bushing_prim_df_c2' },
            cap_c2: { label: 'Cap. (C2)', value: 'bushing_prim_cap_c2' },
            insulation_type: { label: 'Insulation type', value: 'bushing_prim_insulation_type' }
            }},
            sec: { label: 'Secondary bushings', children: {
            pos: { label: 'Position', value: 'bushing_sec_pos' },
            asset_type: { label: 'Asset type', value: 'bushing_sec_asset_type' },
            serial_no: { label: 'Serial no.', value: 'bushing_sec_serial_no' },
            manufacturer: { label: 'Manufacturer', value: 'bushing_sec_manufacturer' },
            manufacturer_type: { label: 'Manufacturer type', value: 'bushing_sec_manufacturer_type' },
            manufacturer_year: { label: 'Manufacturing year', value: 'bushing_sec_manufacturer_year' },
            insulation_level: { label: 'Insul. level (BIL)', value: 'bushing_sec_insulation_level' },
            voltage_l_ground: { label: 'Voltage L-ground', value: 'bushing_sec_voltage_l_ground' },
            max_system_voltage: { label: 'Max system voltage', value: 'bushing_sec_max_system_voltage' },
            rate_current: { label: 'Rated current', value: 'bushing_sec_rate_current' },
            df_c1: { label: 'DF (C1)', value: 'bushing_sec_df_c1' },
            cap_c1: { label: 'Cap. (C1)', value: 'bushing_sec_cap_c1' },
            df_c2: { label: 'DF (C2)', value: 'bushing_sec_df_c2' },
            cap_c2: { label: 'Cap. (C2)', value: 'bushing_sec_cap_c2' },
            insulation_type: { label: 'Insulation type', value: 'bushing_sec_insulation_type' }
            }},
            tert: { label: 'Tertiary bushings', children: {
            pos: { label: 'Position', value: 'bushing_tert_pos' },
            asset_type: { label: 'Asset type', value: 'bushing_tert_asset_type' },
            serial_no: { label: 'Serial no.', value: 'bushing_tert_serial_no' },
            manufacturer: { label: 'Manufacturer', value: 'bushing_tert_manufacturer' },
            manufacturer_type: { label: 'Manufacturer type', value: 'bushing_tert_manufacturer_type' },
            manufacturer_year: { label: 'Manufacturing year', value: 'bushing_tert_manufacturer_year' },
            insulation_level: { label: 'Insul. level (BIL)', value: 'bushing_tert_insulation_level' },
            voltage_l_ground: { label: 'Voltage L-ground', value: 'bushing_tert_voltage_l_ground' },
            max_system_voltage: { label: 'Max system voltage', value: 'bushing_tert_max_system_voltage' },
            rate_current: { label: 'Rated current', value: 'bushing_tert_rate_current' },
            df_c1: { label: 'DF (C1)', value: 'bushing_tert_df_c1' },
            cap_c1: { label: 'Cap. (C1)', value: 'bushing_tert_cap_c1' },
            df_c2: { label: 'DF (C2)', value: 'bushing_tert_df_c2' },
            cap_c2: { label: 'Cap. (C2)', value: 'bushing_tert_cap_c2' },
            insulation_type: { label: 'Insulation type', value: 'bushing_tert_insulation_type' }
            }}
        }},
        SurgeArresterDto: { label: 'Surge arrester', children: {
            prim: { label: 'Primary', children: {
            properties: { label: 'Properties', children: {
                sa_prim_serial_no:         { label: 'Serial no.',        value: 'sa_prim_serial_no' },
                sa_prim_manufacturer:      { label: 'Manufacturer',      value: 'sa_prim_manufacturer' },
                sa_prim_manufacturer_year: { label: 'Manufacturing year', value: 'sa_prim_manufacturer_year' },
                sa_prim_asset_system_code: { label: 'Asset system code',  value: 'sa_prim_asset_system_code' }
            }},
            ratings: { label: 'Ratings', children: {
                sa_prim_unit:         { label: 'Units in stack', value: 'sa_prim_unit' },
                sa_prim_serial:       { label: 'Serial no.',     value: 'sa_prim_table_serial' },
                sa_prim_voltageLl:    { label: 'Voltage L-L',    value: 'sa_prim_table_voltageLl' },
                sa_prim_voltageLn:    { label: 'Voltage L-N',    value: 'sa_prim_table_voltageLn' },
                sa_prim_mcovRating:   { label: 'MCOV rating',    value: 'sa_prim_table_mcovRating' }
            }}
            }},
            sec: { label: 'Secondary', children: {
            properties: { label: 'Properties', children: {
                sa_sec_serial_no:         { label: 'Serial no.',        value: 'sa_sec_serial_no' },
                sa_sec_manufacturer:      { label: 'Manufacturer',      value: 'sa_sec_manufacturer' },
                sa_sec_manufacturer_year: { label: 'Manufacturing year', value: 'sa_sec_manufacturer_year' },
                sa_sec_asset_system_code: { label: 'Asset system code',  value: 'sa_sec_asset_system_code' }
            }},
            ratings: { label: 'Ratings', children: {
                sa_sec_unit:         { label: 'Units in stack', value: 'sa_sec_unit' },
                sa_sec_serial:       { label: 'Serial no.',     value: 'sa_sec_table_serial' },
                sa_sec_voltageLl:    { label: 'Voltage L-L',    value: 'sa_sec_table_voltageLl' },
                sa_sec_voltageLn:    { label: 'Voltage L-N',    value: 'sa_sec_table_voltageLn' },
                sa_sec_mcovRating:   { label: 'MCOV rating',    value: 'sa_sec_table_mcovRating' }
            }}
            }},
            tert: { label: 'Tertiary', children: {
            properties: { label: 'Properties', children: {
                sa_tert_serial_no:         { label: 'Serial no.',        value: 'sa_tert_serial_no' },
                sa_tert_manufacturer:      { label: 'Manufacturer',      value: 'sa_tert_manufacturer' },
                sa_tert_manufacturer_year: { label: 'Manufacturing year', value: 'sa_tert_manufacturer_year' },
                sa_tert_asset_system_code: { label: 'Asset system code',  value: 'sa_tert_asset_system_code' }
            }},
            ratings: { label: 'Ratings', children: {
                sa_tert_unit:         { label: 'Units in stack', value: 'sa_tert_unit' },
                sa_tert_serial:       { label: 'Serial no.',     value: 'sa_tert_table_serial' },
                sa_tert_voltageLl:    { label: 'Voltage L-L',    value: 'sa_tert_table_voltageLl' },
                sa_tert_voltageLn:    { label: 'Voltage L-N',    value: 'sa_tert_table_voltageLn' },
                sa_tert_mcovRating:   { label: 'MCOV rating',    value: 'sa_tert_table_mcovRating' }
            }}
            }}
        }}
        }},
        VoltageTransformerDto: { label: 'VT', children: {
        ConfigurationDto: { label: 'Configuration', children: {
            number_of_phase: { label: 'Number of phase', value: 'number_of_phase' }, phase: { label: 'Phase', value: 'phase' }
        }},
        PropertiesDto: { label: 'Properties', children: {
            type: { label: 'Asset type', value: 'type' }, serial_no: { label: 'Serial no.', value: 'serial_no' },
            manufacturer: { label: 'Manufacturer', value: 'manufacturer' }, manufacturer_type: { label: 'Manufacturer type', value: 'manufacturer_type' },
            manufacturer_year: { label: 'Manufacturing year', value: 'manufacturer_year' }, country_of_origin: { label: 'Country of origin', value: 'country_of_origin' },
            apparatus_id: { label: 'Apparatus ID', value: 'apparatus_id' }, comment: { label: 'Comment', value: 'comment' }
        }},
        RatingDto: { label: 'Rating', children: {
            standard: { label: 'Standard', value: 'standard' }, rated_frequency: { label: 'Rated frequency', value: 'rated_frequency' },
            upr: { label: 'Upr formula', value: 'upr' }, rated_voltage: { label: 'Rated voltage', value: 'rated_voltage' },
            c1: { label: 'C1', value: 'c1' }, c2: { label: 'C2', value: 'c2' }
        }},
        VTConfigurationDto: { label: 'VT Configuration', children: {
            windings: { label: 'Windings', value: 'windings' },
            dataVT: { label: 'VT Data', children: {
            usr_formula:        { label: 'Usr formula',       value: 'usr_formula' },
            usr_rated_voltage:  { label: 'Usr rated voltage', value: 'usr_rated_voltage' },
            rated_burden:       { label: 'Rated burden',      value: 'rated_burden' },
            rated_power_factor: { label: 'cosφ',               value: 'rated_power_factor' }
            }}
        }}
        }},
        CurrentTransformerDto: { label: 'CT', children: {
        ConfigurationDto: { label: 'Configuration', children: {
            number_of_phase: { label: 'Number of phase', value: 'number_of_phase' }, phase: { label: 'Phase', value: 'phase' }
        }},
        PropertiesDto: { label: 'Properties', children: {
            type: { label: 'Asset type', value: 'type' }, serial_no: { label: 'Serial no.', value: 'serial_no' },
            manufacturer: { label: 'Manufacturer', value: 'manufacturer' }, manufacturer_type: { label: 'Manufacturer type', value: 'manufacturer_type' },
            manufacturer_year: { label: 'Manufacturing year', value: 'manufacturer_year' }, country_of_origin: { label: 'Country of origin', value: 'country_of_origin' },
            apparatus_id: { label: 'Apparatus ID', value: 'apparatus_id' }, comment: { label: 'Comment', value: 'comment' }
        }},
        RatingsDto: { label: 'Ratings', children: {
            standard: { label: 'Standard', value: 'standard' }, rated_frequency: { label: 'Rated frequency', value: 'rated_frequency' },
            primary_winding_count: { label: 'Primary windings', value: 'primary_winding_count' }, um_rms: { label: 'Um (rms)', value: 'um_rms' },
            u_withstand_rms: { label: 'U withstand (rms)', value: 'u_withstand_rms' }, u_lightning_peak: { label: 'U lightning (peak)', value: 'u_lightning_peak' },
            icth: { label: 'Icth', value: 'icth' }, idyn_peak: { label: 'Idyn (peak)', value: 'idyn_peak' },
            ith_rms: { label: 'Ith (rms)', value: 'ith_rms' }, ith_duration: { label: 'Duration', value: 'ith_duration' },
            system_voltage: { label: 'System voltage', value: 'system_voltage' }, bil: { label: 'BIL', value: 'bil' }, rating_factor: { label: 'Rating factor', value: 'rating_factor' }
        }},
        CTConfigurationDto: { label: 'CT Configuration', children: {
            cores: { label: 'Cores', value: 'ct_cores' },
            dataCT: { label: 'CT Core', children: {
            taps:      { label: 'Taps',       value: 'ct_taps' },
            commonTap: { label: 'Common tap', value: 'ct_commonTap' },
            fullTap: { label: 'Full tap', children: {
                table: { label: 'Table', children: {
                fulltap_name:  { label: 'Name',   value: 'ct_fulltap_name' },
                fulltap_ipn:   { label: 'Ipn (A)', value: 'ct_fulltap_ipn' },
                fulltap_isn:   { label: 'Isn (A)', value: 'ct_fulltap_isn' },
                fulltap_inuse: { label: 'In use',  value: 'ct_fulltap_inuse' }
                }},
                classRating: { label: 'Class rating', children: {
                ct_class_app:           { label: 'Application',          value: 'ct_class_app' },
                ct_class:               { label: 'Class',                value: 'ct_class' },
                ct_class_wr:            { label: 'Winding resistance (Ω)',value: 'ct_class_wr' },
                ct_class_kx:            { label: 'Kx',                   value: 'ct_class_kx' },
                ct_class_re20lsn:       { label: 'RE(20×lsn) (%)',        value: 'ct_class_re20lsn' },
                ct_class_k:             { label: 'K',                    value: 'ct_class_k' },
                ct_class_fs:            { label: 'FS',                   value: 'ct_class_fs' },
                ct_class_kssc:          { label: 'KSSC',                 value: 'ct_class_kssc' },
                ct_class_ktd:           { label: 'Ktd',                  value: 'ct_class_ktd' },
                ct_class_duty:          { label: 'Duty',                 value: 'ct_class_duty' },
                ct_class_vb:            { label: 'Vb (V)',               value: 'ct_class_vb' },
                ct_class_alf:           { label: 'ALF',                  value: 'ct_class_alf' },
                ct_class_ts:            { label: 'Ts',                   value: 'ct_class_ts' },
                ct_class_ek:            { label: 'Ek',                   value: 'ct_class_ek' },
                ct_class_le:            { label: 'le',                   value: 'ct_class_le' },
                ct_class_e1:            { label: 'E1',                   value: 'ct_class_e1' },
                ct_class_le1:           { label: 'le1',                  value: 'ct_class_le1' },
                ct_class_val:           { label: 'Val',                  value: 'ct_class_val' },
                ct_class_lal:           { label: 'lal',                  value: 'ct_class_lal' },
                ct_class_t1:            { label: 't1',                   value: 'ct_class_t1' },
                ct_class_tal1:          { label: 'tal1',                 value: 'ct_class_tal1' },
                ct_class_tp:            { label: 'Tp',                   value: 'ct_class_tp' },
                ct_class_tpts:          { label: 'Ts (TP)',              value: 'ct_class_tpts' },
                ct_class_vk:            { label: 'Vk',                   value: 'ct_class_vk' },
                ct_class_lk:            { label: 'lk',                   value: 'ct_class_lk' },
                ct_class_vk1:           { label: 'Vk1',                  value: 'ct_class_vk1' },
                ct_class_lk1:           { label: 'lk1',                  value: 'ct_class_lk1' },
                ct_class_rated_burden:  { label: 'Rated burden (VA)',     value: 'ct_class_rated_burden' },
                ct_class_burden:        { label: 'Burden (VA)',           value: 'ct_class_burden' },
                ct_class_burden_cos:    { label: 'cos φ (burden)',        value: 'ct_class_burden_cos' },
                ct_class_op_burden:     { label: 'Op. burden (VA)',       value: 'ct_class_op_burden' },
                ct_class_op_burden_cos: { label: 'cos φ (op. burden)',    value: 'ct_class_op_burden_cos' }
                }}
            }},
            mainTap: { label: 'Main tap', children: {
                ct_main_ipn:          { label: 'Ipn (A)',          value: 'ct_main_ipn' },
                ct_main_isn:          { label: 'Isn (A)',          value: 'ct_main_isn' },
                ct_main_rated_burden: { label: 'Rated burden (VA)',value: 'ct_main_rated_burden' },
                ct_main_burden:       { label: 'Burden (VA)',      value: 'ct_main_burden' },
                ct_main_burden_cos:   { label: 'cos φ',            value: 'ct_main_burden_cos' },
                ct_main_op_burden:    { label: 'Op. burden (VA)',  value: 'ct_main_op_burden' },
                ct_main_op_burden_cos:{ label: 'cos φ (op.)',      value: 'ct_main_op_burden_cos' }
            }},
            interTap: { label: 'Inter tap', children: {
                ct_inter_ipn:          { label: 'Ipn (A)',          value: 'ct_inter_ipn' },
                ct_inter_isn:          { label: 'Isn (A)',          value: 'ct_inter_isn' },
                ct_inter_rated_burden: { label: 'Rated burden (VA)',value: 'ct_inter_rated_burden' },
                ct_inter_burden:       { label: 'Burden (VA)',      value: 'ct_inter_burden' },
                ct_inter_burden_cos:   { label: 'cos φ',            value: 'ct_inter_burden_cos' },
                ct_inter_op_burden:    { label: 'Op. burden (VA)',  value: 'ct_inter_op_burden' },
                ct_inter_op_burden_cos:{ label: 'cos φ (op.)',      value: 'ct_inter_op_burden_cos' }
            }}
            }}
        }}
        }},
        CircuitBreakerDto: { label: 'Breaker', children: {
        PropertiesDto: { label: 'Properties', children: {
            type: { label: 'Asset type', value: 'type' }, serial_no: { label: 'Serial no.', value: 'serial_no' },
            manufacturer: { label: 'Manufacturer', value: 'manufacturer' }, manufacturer_type: { label: 'Manufacturer type', value: 'manufacturer_type' },
            manufacturer_year: { label: 'Manufacturing year', value: 'manufacturer_year' }, country_of_origin: { label: 'Country of origin', value: 'country_of_origin' },
            apparatus_id: { label: 'Apparatus ID', value: 'apparatus_id' }, comment: { label: 'Comment', value: 'comment' }
        }},
        circuitBreakerDto: { label: 'Circuit Breaker', children: {
            numberOfPhases: { label: 'Number of phases', value: 'numberOfPhases' }, interruptersPerPhase: { label: 'Interrupters per phase', value: 'interruptersPerPhase' }, phase: { label: 'Phase', value: 'phase' },
            poleOperation: { label: 'Pole operation', value: 'poleOperation' }, hasPIR: { label: 'Has PIR', value: 'hasPIR' }, pirValue: { label: 'PIR value', value: 'pirValue' },
            hasGradingCapacitors: { label: 'Has grading capacitors', value: 'hasGradingCapacitors' }, capacitorValue: { label: 'Capacitor value', value: 'capacitorValue' },
            interruptingMedium: { label: 'Interrupting medium', value: 'interruptingMedium' }, tankType: { label: 'Tank type', value: 'tankType' }
        }},
        RatingsDto: { label: 'Ratings', children: {
            rated_voltage_ll: { label: 'Rated voltage (LL)', value: 'rated_voltage_ll' }, rated_current: { label: 'Rated current', value: 'rated_current' },
            rated_frequency: { label: 'Rated frequency', value: 'rated_frequency' },
            rated_short_circuit_breaking_current: { label: 'Rated SC breaking current', value: 'rated_short_circuit_breaking_current' },
            short_circuit_nominal_duration: { label: 'SC nominal duration', value: 'short_circuit_nominal_duration' },
            rated_insulation_level: { label: 'Rated insulation level (BIL)', value: 'rated_insulation_level' },
            rated_interrupting_time: { label: 'Rated interrupting time', value: 'rated_interrupting_time' },
            interrupting_duty_cycle: { label: 'Interrupting duty cycle', value: 'interrupting_duty_cycle' },
            rated_power_at_closing: { label: 'Rated power at closing', value: 'rated_power_at_closing' },
            rated_power_at_opening: { label: 'Rated power at opening', value: 'rated_power_at_opening' },
            rated_power_at_motor_charge: { label: 'Rated power at motor charge', value: 'rated_power_at_motor_charge' }
        }},
        ContactSystemDto: { label: 'Contact system', children: {
            nominal_total_travel: { label: 'Nominal total travel', value: 'nominal_total_travel' },
            damping_time: { label: 'Damping time', value: 'damping_time' }, nozzle_length: { label: 'Nozzle length', value: 'nozzle_length' }
        }},
        OtherDto: { label: 'Other', children: {
            total_weight_with_gas: { label: 'Total weight with gas', value: 'total_weight_with_gas' },
            weight_of_gas: { label: 'Weight of gas', value: 'weight_of_gas' }, volume_of_gas: { label: 'Volume of gas', value: 'volume_of_gas' },
            rated_gas_pressure: { label: 'Rated gas pressure', value: 'rated_gas_pressure' }, rated_gas_temperature: { label: 'Rated gas temperature', value: 'rated_gas_temperature' }
        }},
        OperatingDto: { label: 'Operating', children: {
            type:                  { label: 'Type',               value: 'op_type' },
            serial_no:             { label: 'Serial no.',         value: 'op_serial_no' },
            manufacturer:          { label: 'Manufacturer',       value: 'op_manufacturer' },
            manufacturer_year:     { label: 'Manufacturing year', value: 'op_manufacturer_year' },
            manufacturer_type:     { label: 'Manufacturer type',  value: 'op_manufacturer_type' },
            number_of_trip_coil:   { label: 'No. of trip coils',  value: 'number_of_trip_coil' },
            number_of_close_coil:  { label: 'No. of close coils', value: 'number_of_close_coil' },
            rated_operating_pressure:             { label: 'Rated op. pressure (Pa)',    value: 'op_pressure' },
            rated_operating_pressure_temperature: { label: 'Rated pressure temp. (°C)', value: 'op_pressure_temp' },
            motor: { label: 'Motor', children: {
            motor_rated_voltage: { label: 'Rated voltage', value: 'motor_rated_voltage' },
            motor_rated_current: { label: 'Rated current', value: 'motor_rated_current' },
            motor_power:         { label: 'DC / AC',       value: 'motor_power' },
            motor_frequency:     { label: 'Frequency',     value: 'motor_frequency' }
            }},
            auxiliary_circuits: { label: 'Auxiliary circuits', children: {
            aux_rated_voltage: { label: 'Rated voltage', value: 'aux_rated_voltage' },
            aux_rated_current: { label: 'Rated current', value: 'aux_rated_current' },
            aux_power:         { label: 'DC / AC',       value: 'aux_power' },
            aux_frequency:     { label: 'Frequency',     value: 'aux_frequency' }
            }},
            trip_coil_component: { label: 'Trip coil (array)', children: {
            tc_rated_voltage: { label: 'Rated voltage', value: 'tc_rated_voltage' },
            tc_rated_current: { label: 'Rated current', value: 'tc_rated_current' },
            tc_power:         { label: 'DC / AC',       value: 'tc_power' },
            tc_frequency:     { label: 'Frequency',     value: 'tc_frequency' }
            }},
            close_coil_component: { label: 'Close coil (array)', children: {
            cc_rated_voltage: { label: 'Rated voltage', value: 'cc_rated_voltage' },
            cc_rated_current: { label: 'Rated current', value: 'cc_rated_current' },
            cc_power:         { label: 'DC / AC',       value: 'cc_power' },
            cc_frequency:     { label: 'Frequency',     value: 'cc_frequency' }
            }},
            comment: { label: 'Comment', value: 'op_comment' }
        }},
        AssessmentLimitsDto: { label: 'Assessment limits', children: {
            limits: { label: 'Mode', value: 'assess_limits' },
            contact_resistance: { label: 'Contact resistance', children: {
            cr_abs_r_min: { label: 'R min (abs)', value: 'cr_abs_r_min' },
            cr_abs_r_max: { label: 'R max (abs)', value: 'cr_abs_r_max' },
            cr_rel_r_ref: { label: 'R ref (rel)', value: 'cr_rel_r_ref' },
            cr_rel_r_dev: { label: 'R dev (rel)', value: 'cr_rel_r_dev' }
            }},
            operating_time: { label: 'Operating time', children: {
            opening_time:               { label: 'Opening time',               children: {
                ot_opening_abs_t_min:   { label: 't min (abs)',  value: 'ot_opening_abs_t_min' },
                ot_opening_abs_t_max:   { label: 't max (abs)',  value: 'ot_opening_abs_t_max' },
                ot_opening_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_opening_rel_t_ref' },
                ot_opening_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_opening_rel_p_t_dev' },
                ot_opening_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_opening_rel_m_t_dev' }
                } },
            opening_sync_within_phase:  { label: 'Opening sync within phase',  children: {
                ot_oswp_abs_t_min:   { label: 't min (abs)',  value: 'ot_oswp_abs_t_min' },
                ot_oswp_abs_t_max:   { label: 't max (abs)',  value: 'ot_oswp_abs_t_max' },
                ot_oswp_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_oswp_rel_t_ref' },
                ot_oswp_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_oswp_rel_p_t_dev' },
                ot_oswp_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_oswp_rel_m_t_dev' }
                } },
            opening_sync_breaker_phase: { label: 'Opening sync breaker phase', children: {
                ot_osbp_abs_t_min:   { label: 't min (abs)',  value: 'ot_osbp_abs_t_min' },
                ot_osbp_abs_t_max:   { label: 't max (abs)',  value: 'ot_osbp_abs_t_max' },
                ot_osbp_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_osbp_rel_t_ref' },
                ot_osbp_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_osbp_rel_p_t_dev' },
                ot_osbp_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_osbp_rel_m_t_dev' }
                } },
            closing_time:               { label: 'Closing time',               children: {
                ot_closing_abs_t_min:   { label: 't min (abs)',  value: 'ot_closing_abs_t_min' },
                ot_closing_abs_t_max:   { label: 't max (abs)',  value: 'ot_closing_abs_t_max' },
                ot_closing_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_closing_rel_t_ref' },
                ot_closing_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_closing_rel_p_t_dev' },
                ot_closing_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_closing_rel_m_t_dev' }
                } },
            closing_sync_within_phase:  { label: 'Closing sync within phase',  children: {
                ot_cswp_abs_t_min:   { label: 't min (abs)',  value: 'ot_cswp_abs_t_min' },
                ot_cswp_abs_t_max:   { label: 't max (abs)',  value: 'ot_cswp_abs_t_max' },
                ot_cswp_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_cswp_rel_t_ref' },
                ot_cswp_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_cswp_rel_p_t_dev' },
                ot_cswp_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_cswp_rel_m_t_dev' }
                } },
            closing_sync_breaker_phase: { label: 'Closing sync breaker phase', children: {
                ot_csbp_abs_t_min:   { label: 't min (abs)',  value: 'ot_csbp_abs_t_min' },
                ot_csbp_abs_t_max:   { label: 't max (abs)',  value: 'ot_csbp_abs_t_max' },
                ot_csbp_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_csbp_rel_t_ref' },
                ot_csbp_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_csbp_rel_p_t_dev' },
                ot_csbp_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_csbp_rel_m_t_dev' }
                } },
            reclosing_time:             { label: 'Reclosing time',             children: {
                ot_reclosing_abs_t_min:   { label: 't min (abs)',  value: 'ot_reclosing_abs_t_min' },
                ot_reclosing_abs_t_max:   { label: 't max (abs)',  value: 'ot_reclosing_abs_t_max' },
                ot_reclosing_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_reclosing_rel_t_ref' },
                ot_reclosing_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_reclosing_rel_p_t_dev' },
                ot_reclosing_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_reclosing_rel_m_t_dev' }
                } },
            close_open_time:            { label: 'Close-open time (CO)',       children: {
                ot_co_abs_t_min:   { label: 't min (abs)',  value: 'ot_co_abs_t_min' },
                ot_co_abs_t_max:   { label: 't max (abs)',  value: 'ot_co_abs_t_max' },
                ot_co_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_co_rel_t_ref' },
                ot_co_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_co_rel_p_t_dev' },
                ot_co_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_co_rel_m_t_dev' }
                } },
            open_close_time:            { label: 'Open-close time (OC)',       children: {
                ot_oc_abs_t_min:   { label: 't min (abs)',  value: 'ot_oc_abs_t_min' },
                ot_oc_abs_t_max:   { label: 't max (abs)',  value: 'ot_oc_abs_t_max' },
                ot_oc_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_oc_rel_t_ref' },
                ot_oc_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_oc_rel_p_t_dev' },
                ot_oc_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_oc_rel_m_t_dev' }
                } }
            }},
            contact_travel: { label: 'Contact travel', children: {
            total_travel:      { label: 'Total travel (TT)',        children: {
                ct_total_abs_d_min: { label: 'd min (abs)', value: 'ct_total_abs_d_min' },
                ct_total_abs_d_max: { label: 'd max (abs)', value: 'ct_total_abs_d_max' },
                ct_total_rel_d_ref: { label: 'd ref (rel)', value: 'ct_total_rel_d_ref' },
                ct_total_rel_d_dev: { label: 'd dev (rel)', value: 'ct_total_rel_d_dev' }
                } },
            over_travel_trip:  { label: 'Over-travel trip (OT)',    children: {
                ct_ot_trip_abs_d_min: { label: 'd min (abs)', value: 'ct_ot_trip_abs_d_min' },
                ct_ot_trip_abs_d_max: { label: 'd max (abs)', value: 'ct_ot_trip_abs_d_max' },
                ct_ot_trip_rel_d_ref: { label: 'd ref (rel)', value: 'ct_ot_trip_rel_d_ref' },
                ct_ot_trip_rel_d_dev: { label: 'd dev (rel)', value: 'ct_ot_trip_rel_d_dev' }
                } },
            over_travel_close: { label: 'Over-travel close (OC)',   children: {
                ct_ot_close_abs_d_min: { label: 'd min (abs)', value: 'ct_ot_close_abs_d_min' },
                ct_ot_close_abs_d_max: { label: 'd max (abs)', value: 'ct_ot_close_abs_d_max' },
                ct_ot_close_rel_d_ref: { label: 'd ref (rel)', value: 'ct_ot_close_rel_d_ref' },
                ct_ot_close_rel_d_dev: { label: 'd dev (rel)', value: 'ct_ot_close_rel_d_dev' }
                } },
            rebound_trip:      { label: 'Rebound trip',             children: {
                ct_rb_trip_abs_d_min: { label: 'd min (abs)', value: 'ct_rb_trip_abs_d_min' },
                ct_rb_trip_abs_d_max: { label: 'd max (abs)', value: 'ct_rb_trip_abs_d_max' },
                ct_rb_trip_rel_d_ref: { label: 'd ref (rel)', value: 'ct_rb_trip_rel_d_ref' },
                ct_rb_trip_rel_d_dev: { label: 'd dev (rel)', value: 'ct_rb_trip_rel_d_dev' }
                } },
            rebound_close:     { label: 'Rebound close',            children: {
                ct_rb_close_abs_d_min: { label: 'd min (abs)', value: 'ct_rb_close_abs_d_min' },
                ct_rb_close_abs_d_max: { label: 'd max (abs)', value: 'ct_rb_close_abs_d_max' },
                ct_rb_close_rel_d_ref: { label: 'd ref (rel)', value: 'ct_rb_close_rel_d_ref' },
                ct_rb_close_rel_d_dev: { label: 'd dev (rel)', value: 'ct_rb_close_rel_d_dev' }
                } },
            contact_wipe_trip: { label: 'Contact wipe trip (CWT)',  children: {
                ct_cw_trip_abs_d_min: { label: 'd min (abs)', value: 'ct_cw_trip_abs_d_min' },
                ct_cw_trip_abs_d_max: { label: 'd max (abs)', value: 'ct_cw_trip_abs_d_max' },
                ct_cw_trip_rel_d_ref: { label: 'd ref (rel)', value: 'ct_cw_trip_rel_d_ref' },
                ct_cw_trip_rel_d_dev: { label: 'd dev (rel)', value: 'ct_cw_trip_rel_d_dev' }
                } },
            contact_wipe_close:{ label: 'Contact wipe close (CWC)', children: {
                ct_cw_close_abs_d_min: { label: 'd min (abs)', value: 'ct_cw_close_abs_d_min' },
                ct_cw_close_abs_d_max: { label: 'd max (abs)', value: 'ct_cw_close_abs_d_max' },
                ct_cw_close_rel_d_ref: { label: 'd ref (rel)', value: 'ct_cw_close_rel_d_ref' },
                ct_cw_close_rel_d_dev: { label: 'd dev (rel)', value: 'ct_cw_close_rel_d_dev' }
                } },
            damping_distance:  { label: 'Damping distance (DD)',    children: {
                ct_dd_abs_d_min: { label: 'd min (abs)', value: 'ct_dd_abs_d_min' },
                ct_dd_abs_d_max: { label: 'd max (abs)', value: 'ct_dd_abs_d_max' },
                ct_dd_rel_d_ref: { label: 'd ref (rel)', value: 'ct_dd_rel_d_ref' },
                ct_dd_rel_d_dev: { label: 'd dev (rel)', value: 'ct_dd_rel_d_dev' }
                } }
            }},
            auxiliary_contacts: { label: 'Auxiliary contacts', children: {
            trip_operation: { label: 'Trip operation', children: {
                stta_trip: { label: 'Switching time type A', children: {
                ac_trip_stta_abs_t_min:   { label: 't min (abs)',  value: 'ac_trip_stta_abs_t_min' },
                ac_trip_stta_abs_t_max:   { label: 't max (abs)',  value: 'ac_trip_stta_abs_t_max' },
                ac_trip_stta_rel_t_ref: { label: 't ref (rel)', value: 'ac_trip_stta_rel_t_ref' },
                ac_trip_stta_rel_t_dev: { label: 't dev (rel)', value: 'ac_trip_stta_rel_t_dev' }
                } },
                dmta_trip: { label: 'Diff to main type A',   children: {
                ac_trip_dmta_abs_t_min:   { label: 't min (abs)',  value: 'ac_trip_dmta_abs_t_min' },
                ac_trip_dmta_abs_t_max:   { label: 't max (abs)',  value: 'ac_trip_dmta_abs_t_max' },
                ac_trip_dmta_rel_t_ref: { label: 't ref (rel)', value: 'ac_trip_dmta_rel_t_ref' },
                ac_trip_dmta_rel_t_dev: { label: 't dev (rel)', value: 'ac_trip_dmta_rel_t_dev' }
                } },
                sttb_trip: { label: 'Switching time type B', children: {
                ac_trip_sttb_abs_t_min:   { label: 't min (abs)',  value: 'ac_trip_sttb_abs_t_min' },
                ac_trip_sttb_abs_t_max:   { label: 't max (abs)',  value: 'ac_trip_sttb_abs_t_max' },
                ac_trip_sttb_rel_t_ref: { label: 't ref (rel)', value: 'ac_trip_sttb_rel_t_ref' },
                ac_trip_sttb_rel_t_dev: { label: 't dev (rel)', value: 'ac_trip_sttb_rel_t_dev' }
                } },
                dmtb_trip: { label: 'Diff to main type B',   children: {
                ac_trip_dmtb_abs_t_min:   { label: 't min (abs)',  value: 'ac_trip_dmtb_abs_t_min' },
                ac_trip_dmtb_abs_t_max:   { label: 't max (abs)',  value: 'ac_trip_dmtb_abs_t_max' },
                ac_trip_dmtb_rel_t_ref: { label: 't ref (rel)', value: 'ac_trip_dmtb_rel_t_ref' },
                ac_trip_dmtb_rel_t_dev: { label: 't dev (rel)', value: 'ac_trip_dmtb_rel_t_dev' }
                } },
                stw_trip:  { label: 'Switching time wiper',  children: {
                ac_trip_stw_abs_t_min:   { label: 't min (abs)',  value: 'ac_trip_stw_abs_t_min' },
                ac_trip_stw_abs_t_max:   { label: 't max (abs)',  value: 'ac_trip_stw_abs_t_max' },
                ac_trip_stw_rel_t_ref: { label: 't ref (rel)', value: 'ac_trip_stw_rel_t_ref' },
                ac_trip_stw_rel_t_dev: { label: 't dev (rel)', value: 'ac_trip_stw_rel_t_dev' }
                } },
                dur_trip:  { label: 'Duration',              children: {
                ac_trip_dur_abs_t_min:   { label: 't min (abs)',  value: 'ac_trip_dur_abs_t_min' },
                ac_trip_dur_abs_t_max:   { label: 't max (abs)',  value: 'ac_trip_dur_abs_t_max' },
                ac_trip_dur_rel_t_ref: { label: 't ref (rel)', value: 'ac_trip_dur_rel_t_ref' },
                ac_trip_dur_rel_t_dev: { label: 't dev (rel)', value: 'ac_trip_dur_rel_t_dev' }
                } }
            }},
            close_operation: { label: 'Close operation', children: {
                stta_close: { label: 'Switching time type A', children: {
                ac_close_stta_abs_t_min:   { label: 't min (abs)',  value: 'ac_close_stta_abs_t_min' },
                ac_close_stta_abs_t_max:   { label: 't max (abs)',  value: 'ac_close_stta_abs_t_max' },
                ac_close_stta_rel_t_ref: { label: 't ref (rel)', value: 'ac_close_stta_rel_t_ref' },
                ac_close_stta_rel_t_dev: { label: 't dev (rel)', value: 'ac_close_stta_rel_t_dev' }
                } },
                dmta_close: { label: 'Diff to main type A',   children: {
                ac_close_dmta_abs_t_min:   { label: 't min (abs)',  value: 'ac_close_dmta_abs_t_min' },
                ac_close_dmta_abs_t_max:   { label: 't max (abs)',  value: 'ac_close_dmta_abs_t_max' },
                ac_close_dmta_rel_t_ref: { label: 't ref (rel)', value: 'ac_close_dmta_rel_t_ref' },
                ac_close_dmta_rel_t_dev: { label: 't dev (rel)', value: 'ac_close_dmta_rel_t_dev' }
                } },
                sttb_close: { label: 'Switching time type B', children: {
                ac_close_sttb_abs_t_min:   { label: 't min (abs)',  value: 'ac_close_sttb_abs_t_min' },
                ac_close_sttb_abs_t_max:   { label: 't max (abs)',  value: 'ac_close_sttb_abs_t_max' },
                ac_close_sttb_rel_t_ref: { label: 't ref (rel)', value: 'ac_close_sttb_rel_t_ref' },
                ac_close_sttb_rel_t_dev: { label: 't dev (rel)', value: 'ac_close_sttb_rel_t_dev' }
                } },
                dmtb_close: { label: 'Diff to main type B',   children: {
                ac_close_dmtb_abs_t_min:   { label: 't min (abs)',  value: 'ac_close_dmtb_abs_t_min' },
                ac_close_dmtb_abs_t_max:   { label: 't max (abs)',  value: 'ac_close_dmtb_abs_t_max' },
                ac_close_dmtb_rel_t_ref: { label: 't ref (rel)', value: 'ac_close_dmtb_rel_t_ref' },
                ac_close_dmtb_rel_t_dev: { label: 't dev (rel)', value: 'ac_close_dmtb_rel_t_dev' }
                } },
                stw_close:  { label: 'Switching time wiper',  children: {
                ac_close_stw_abs_t_min:   { label: 't min (abs)',  value: 'ac_close_stw_abs_t_min' },
                ac_close_stw_abs_t_max:   { label: 't max (abs)',  value: 'ac_close_stw_abs_t_max' },
                ac_close_stw_rel_t_ref: { label: 't ref (rel)', value: 'ac_close_stw_rel_t_ref' },
                ac_close_stw_rel_t_dev: { label: 't dev (rel)', value: 'ac_close_stw_rel_t_dev' }
                } },
                dur_close:  { label: 'Duration',              children: {
                ac_close_dur_abs_t_min:   { label: 't min (abs)',  value: 'ac_close_dur_abs_t_min' },
                ac_close_dur_abs_t_max:   { label: 't max (abs)',  value: 'ac_close_dur_abs_t_max' },
                ac_close_dur_rel_t_ref: { label: 't ref (rel)', value: 'ac_close_dur_rel_t_ref' },
                ac_close_dur_rel_t_dev: { label: 't dev (rel)', value: 'ac_close_dur_rel_t_dev' }
                } }
            }}
            }},
            miscellaneous: { label: 'Miscellaneous', children: {
            bounce_time:   { label: 'Bounce time',    children: {
                misc_bt_abs_min: { label: 'Min (abs)', value: 'misc_bt_abs_min' },
                misc_bt_abs_max: { label: 'Max (abs)', value: 'misc_bt_abs_max' },
                misc_bt_rel_ref: { label: 'Ref (rel)', value: 'misc_bt_rel_ref' },
                misc_bt_rel_dev: { label: 'Dev (rel)', value: 'misc_bt_rel_dev' }
                } },
            bounce_count:  { label: 'Bounce count',   children: {
                misc_bc_abs_min: { label: 'Min (abs)', value: 'misc_bc_abs_min' },
                misc_bc_abs_max: { label: 'Max (abs)', value: 'misc_bc_abs_max' },
                misc_bc_rel_ref: { label: 'Ref (rel)', value: 'misc_bc_rel_ref' },
                misc_bc_rel_dev: { label: 'Dev (rel)', value: 'misc_bc_rel_dev' }
                } },
            pir_close_time:{ label: 'PIR close time', children: {
                misc_pct_abs_min: { label: 'Min (abs)', value: 'misc_pct_abs_min' },
                misc_pct_abs_max: { label: 'Max (abs)', value: 'misc_pct_abs_max' },
                misc_pct_rel_ref: { label: 'Ref (rel)', value: 'misc_pct_rel_ref' },
                misc_pct_rel_dev: { label: 'Dev (rel)', value: 'misc_pct_rel_dev' }
                } },
            reaction_time: { label: 'Reaction time',  children: {
                misc_rt_abs_min: { label: 'Min (abs)', value: 'misc_rt_abs_min' },
                misc_rt_abs_max: { label: 'Max (abs)', value: 'misc_rt_abs_max' },
                misc_rt_rel_ref: { label: 'Ref (rel)', value: 'misc_rt_rel_ref' },
                misc_rt_rel_dev: { label: 'Dev (rel)', value: 'misc_rt_rel_dev' }
                } }
            }},
            coil_characteristics: { label: 'Coil characteristics', children: {
            peak_close_coil_current:    { label: 'Peak close coil current',    children: {
                cc_peak_close_abs_min:   { label: 'Min (abs)',  value: 'cc_peak_close_abs_min' },
                cc_peak_close_abs_max:   { label: 'Max (abs)',  value: 'cc_peak_close_abs_max' },
                cc_peak_close_rel_ref:   { label: 'Ref (rel)',  value: 'cc_peak_close_rel_ref' },
                cc_peak_close_rel_m_dev: { label: '-Dev (rel)', value: 'cc_peak_close_rel_m_dev' },
                cc_peak_close_rel_p_dev: { label: '+Dev (rel)', value: 'cc_peak_close_rel_p_dev' }
                } },
            peak_trip_coil_current:     { label: 'Peak trip coil current',     children: {
                cc_peak_trip_abs_min:   { label: 'Min (abs)',  value: 'cc_peak_trip_abs_min' },
                cc_peak_trip_abs_max:   { label: 'Max (abs)',  value: 'cc_peak_trip_abs_max' },
                cc_peak_trip_rel_ref:   { label: 'Ref (rel)',  value: 'cc_peak_trip_rel_ref' },
                cc_peak_trip_rel_m_dev: { label: '-Dev (rel)', value: 'cc_peak_trip_rel_m_dev' },
                cc_peak_trip_rel_p_dev: { label: '+Dev (rel)', value: 'cc_peak_trip_rel_p_dev' }
                } },
            average_close_coil_current: { label: 'Avg close coil current',     children: {
                cc_avg_close_i_abs_min:   { label: 'Min (abs)',  value: 'cc_avg_close_i_abs_min' },
                cc_avg_close_i_abs_max:   { label: 'Max (abs)',  value: 'cc_avg_close_i_abs_max' },
                cc_avg_close_i_rel_ref:   { label: 'Ref (rel)',  value: 'cc_avg_close_i_rel_ref' },
                cc_avg_close_i_rel_m_dev: { label: '-Dev (rel)', value: 'cc_avg_close_i_rel_m_dev' },
                cc_avg_close_i_rel_p_dev: { label: '+Dev (rel)', value: 'cc_avg_close_i_rel_p_dev' }
                } },
            average_trip_coil_current:  { label: 'Avg trip coil current',      children: {
                cc_avg_trip_i_abs_min:   { label: 'Min (abs)',  value: 'cc_avg_trip_i_abs_min' },
                cc_avg_trip_i_abs_max:   { label: 'Max (abs)',  value: 'cc_avg_trip_i_abs_max' },
                cc_avg_trip_i_rel_ref:   { label: 'Ref (rel)',  value: 'cc_avg_trip_i_rel_ref' },
                cc_avg_trip_i_rel_m_dev: { label: '-Dev (rel)', value: 'cc_avg_trip_i_rel_m_dev' },
                cc_avg_trip_i_rel_p_dev: { label: '+Dev (rel)', value: 'cc_avg_trip_i_rel_p_dev' }
                } },
            average_close_coil_voltage: { label: 'Avg close coil voltage',     children: {
                cc_avg_close_u_abs_min:   { label: 'Min (abs)',  value: 'cc_avg_close_u_abs_min' },
                cc_avg_close_u_abs_max:   { label: 'Max (abs)',  value: 'cc_avg_close_u_abs_max' },
                cc_avg_close_u_rel_ref:   { label: 'Ref (rel)',  value: 'cc_avg_close_u_rel_ref' },
                cc_avg_close_u_rel_m_dev: { label: '-Dev (rel)', value: 'cc_avg_close_u_rel_m_dev' },
                cc_avg_close_u_rel_p_dev: { label: '+Dev (rel)', value: 'cc_avg_close_u_rel_p_dev' }
                } },
            average_trip_coil_voltage:  { label: 'Avg trip coil voltage',      children: {
                cc_avg_trip_u_abs_min:   { label: 'Min (abs)',  value: 'cc_avg_trip_u_abs_min' },
                cc_avg_trip_u_abs_max:   { label: 'Max (abs)',  value: 'cc_avg_trip_u_abs_max' },
                cc_avg_trip_u_rel_ref:   { label: 'Ref (rel)',  value: 'cc_avg_trip_u_rel_ref' },
                cc_avg_trip_u_rel_m_dev: { label: '-Dev (rel)', value: 'cc_avg_trip_u_rel_m_dev' },
                cc_avg_trip_u_rel_p_dev: { label: '+Dev (rel)', value: 'cc_avg_trip_u_rel_p_dev' }
                } },
            close_coil_resistance:      { label: 'Close coil resistance',      children: {
                cc_close_res_abs_min:   { label: 'Min (abs)',  value: 'cc_close_res_abs_min' },
                cc_close_res_abs_max:   { label: 'Max (abs)',  value: 'cc_close_res_abs_max' },
                cc_close_res_rel_ref:   { label: 'Ref (rel)',  value: 'cc_close_res_rel_ref' },
                cc_close_res_rel_m_dev: { label: '-Dev (rel)', value: 'cc_close_res_rel_m_dev' },
                cc_close_res_rel_p_dev: { label: '+Dev (rel)', value: 'cc_close_res_rel_p_dev' }
                } },
            trip_coil_resistance:       { label: 'Trip coil resistance',       children: {
                cc_trip_res_abs_min:   { label: 'Min (abs)',  value: 'cc_trip_res_abs_min' },
                cc_trip_res_abs_max:   { label: 'Max (abs)',  value: 'cc_trip_res_abs_max' },
                cc_trip_res_rel_ref:   { label: 'Ref (rel)',  value: 'cc_trip_res_rel_ref' },
                cc_trip_res_rel_m_dev: { label: '-Dev (rel)', value: 'cc_trip_res_rel_m_dev' },
                cc_trip_res_rel_p_dev: { label: '+Dev (rel)', value: 'cc_trip_res_rel_p_dev' }
                } }
            }},
            pickup_voltage: { label: 'Pickup voltage', children: {
            min_pickup_voltage_close: { label: 'Min pickup voltage (close)', children: {
                pv_close_abs_v_min: { label: 'V min (abs)', value: 'pv_close_abs_v_min' },
                pv_close_abs_v_max: { label: 'V max (abs)', value: 'pv_close_abs_v_max' },
                pv_close_rel_v_ref: { label: 'V ref (rel)', value: 'pv_close_rel_v_ref' },
                pv_close_rel_v_dev: { label: 'V dev (rel)', value: 'pv_close_rel_v_dev' }
                } },
            min_pickup_voltage_trip:  { label: 'Min pickup voltage (trip)',  children: {
                pv_trip_abs_v_min: { label: 'V min (abs)', value: 'pv_trip_abs_v_min' },
                pv_trip_abs_v_max: { label: 'V max (abs)', value: 'pv_trip_abs_v_max' },
                pv_trip_rel_v_ref: { label: 'V ref (rel)', value: 'pv_trip_rel_v_ref' },
                pv_trip_rel_v_dev: { label: 'V dev (rel)', value: 'pv_trip_rel_v_dev' }
                } }
            }},
            motor_characteristics: { label: 'Motor characteristics', children: {
            inrush_current:  { label: 'Inrush current',  children: {
                mc_inrush_abs_min: { label: 'Min (abs)', value: 'mc_inrush_abs_min' },
                mc_inrush_abs_max: { label: 'Max (abs)', value: 'mc_inrush_abs_max' },
                mc_inrush_rel_ref: { label: 'Ref (rel)', value: 'mc_inrush_rel_ref' },
                mc_inrush_rel_dev: { label: 'Dev (rel)', value: 'mc_inrush_rel_dev' }
                } },
            charging_time:   { label: 'Charging time',   children: {
                mc_chg_t_abs_min: { label: 'Min (abs)', value: 'mc_chg_t_abs_min' },
                mc_chg_t_abs_max: { label: 'Max (abs)', value: 'mc_chg_t_abs_max' },
                mc_chg_t_rel_ref: { label: 'Ref (rel)', value: 'mc_chg_t_rel_ref' },
                mc_chg_t_rel_dev: { label: 'Dev (rel)', value: 'mc_chg_t_rel_dev' }
                } },
            charging_current:{ label: 'Charging current',children: {
                mc_chg_i_abs_min: { label: 'Min (abs)', value: 'mc_chg_i_abs_min' },
                mc_chg_i_abs_max: { label: 'Max (abs)', value: 'mc_chg_i_abs_max' },
                mc_chg_i_rel_ref: { label: 'Ref (rel)', value: 'mc_chg_i_rel_ref' },
                mc_chg_i_rel_dev: { label: 'Dev (rel)', value: 'mc_chg_i_rel_dev' }
                } },
            minimum_voltage: { label: 'Minimum voltage', children: {
                mc_min_u_abs_min: { label: 'Min (abs)', value: 'mc_min_u_abs_min' },
                mc_min_u_abs_max: { label: 'Max (abs)', value: 'mc_min_u_abs_max' },
                mc_min_u_rel_ref: { label: 'Ref (rel)', value: 'mc_min_u_rel_ref' },
                mc_min_u_rel_dev: { label: 'Dev (rel)', value: 'mc_min_u_rel_dev' }
                } }
            }},
            under_voltage_release: { label: 'Under voltage release', children: {
            uv_coil_trip_voltage: { label: 'UV coil trip voltage', children: {
                uvr_abs_v_min: { label: 'V min (abs)', value: 'uvr_abs_v_min' },
                uvr_abs_v_max: { label: 'V max (abs)', value: 'uvr_abs_v_max' },
                uvr_rel_v_ref: { label: 'V ref (rel)', value: 'uvr_rel_v_ref' },
                uvr_rel_v_dev: { label: 'V dev (rel)', value: 'uvr_rel_v_dev' }
                } }
            }},
            overcurrent_release: { label: 'Overcurrent release', children: {
            oc_relay_trip_current: { label: 'OC relay trip current', children: {
                ocr_abs_min: { label: 'Min (abs)', value: 'ocr_abs_min' },
                ocr_abs_max: { label: 'Max (abs)', value: 'ocr_abs_max' },
                ocr_rel_ref: { label: 'Ref (rel)', value: 'ocr_rel_ref' },
                ocr_rel_dev: { label: 'Dev (rel)', value: 'ocr_rel_dev' }
                } }
            }}
        }}
        }},
        PowerCableDTO: { label: 'Power cable', children: {
        ConfigurationDto: { label: 'Configuration', children: {
            number_of_phase: { label: 'Number of phase', value: 'number_of_phase' }, phase: { label: 'Phase', value: 'phase' }
        }},
        PropertiesDto: { label: 'Properties', children: {
            type: { label: 'Asset type', value: 'type' }, serial_no: { label: 'Serial no.', value: 'serial_no' },
            manufacturer: { label: 'Manufacturer', value: 'manufacturer' }, manufacturer_type: { label: 'Manufacturer type', value: 'manufacturer_type' },
            manufacturer_year: { label: 'Manufacturing year', value: 'manufacturer_year' }, country_of_origin: { label: 'Country of origin', value: 'country_of_origin' },
            apparatus_id: { label: 'Apparatus ID', value: 'apparatus_id' }, comment: { label: 'Comment', value: 'comment' }
        }},
        configsData: { label: 'Configurations', children: { phases: { label: 'Phases', value: 'phases' }, cores: { label: 'Cores', value: 'cores' } }},
        ratingsData: { label: 'Ratings', children: {
            rated_voltage: { label: 'Rated voltage (rms)', value: 'rated_voltage' }, max_voltage: { label: 'Maximum voltage (rms)', value: 'max_voltage' },
            rated_frequency: { label: 'Rated frequency', value: 'rated_frequency' }, shortcircuit: { label: 'Short circuit current', value: 'shortcircuit' },
            rated_duration: { label: 'Rated SC duration', value: 'rated_duration' }
        }},
        othersData: { label: 'Others', children: {
            insulation_method: { label: 'Installation method', value: 'insulation_method' }, bonding_type: { label: 'Bonding type', value: 'bonding_type' },
            install_location: { label: 'Install location', value: 'install_location' }, cable_length: { label: 'Cable length', value: 'cable_length' }
        }},
        datasData: { label: 'Layer data', children: {
            conductor: { label: 'Conductor', children: {
            conductor_size:            { label: 'Size (mm²)',         value: 'conductor_size' },
            conductor_class:           { label: 'Class',              value: 'conductor_class' },
            conductor_count:           { label: 'Count',              value: 'conductor_count' },
            conductor_material:        { label: 'Material',           value: 'conductor_material' },
            conductor_material_custom: { label: 'Material (custom)',  value: 'conductor_material_custom' },
            conductor_type:            { label: 'Type',               value: 'conductor_type' },
            conductor_type_custom:     { label: 'Type (custom)',      value: 'conductor_type_custom' },
            conductor_diameter:        { label: 'Diameter (mm)',      value: 'conductor_diameter' }
            }},
            insulation: { label: 'Insulation', children: {
            insulation_type:        { label: 'Type',            value: 'insulation_type' },
            insulation_type_custom: { label: 'Type (custom)',   value: 'insulation_type_custom' },
            ins_thickness:          { label: 'Thickness (mm)',  value: 'ins_thickness' },
            ins_diameter:           { label: 'Diameter (mm)',   value: 'ins_diameter' },
            insulation_operating:   { label: 'Max temp (°C)',   value: 'insulation_operating' }
            }},
            conductor_shield: { label: 'Conductor shield', children: {
            cs_thickness: { label: 'Thickness (mm)', value: 'cs_thickness' },
            cs_diameter:  { label: 'Diameter (mm)',  value: 'cs_diameter' }
            }},
            insulation_screen: { label: 'Insulation screen', children: {
            is_material:        { label: 'Material',          value: 'is_material' },
            is_material_custom: { label: 'Material (custom)', value: 'is_material_custom' },
            is_thickness:       { label: 'Thickness (mm)',    value: 'is_thickness' },
            is_diameter:        { label: 'Diameter (mm)',     value: 'is_diameter' }
            }},
            sheath: { label: 'Sheath', children: {
            sheath_multicore:         { label: 'Multicore',            value: 'sheath_multicore' },
            sheath_type:              { label: 'Sheath type',          value: 'sheath_type' },
            sheath_type_custom:       { label: 'Sheath type (custom)', value: 'sheath_type_custom' },
            sheath_construction:      { label: 'Construction',         value: 'sheath_construction' },
            sheath_construction_custom:{ label: 'Construction (custom)',value: 'sheath_construction_custom' },
            sheath_thickness:         { label: 'Thickness (mm)',       value: 'sheath_thickness' },
            sheath_diameter:          { label: 'Diameter (mm)',        value: 'sheath_diameter' }
            }},
            sheath_reinforcing: { label: 'Sheath reinforcing tape', children: {
            sr_material:        { label: 'Material',          value: 'sr_material' },
            sr_material_custom: { label: 'Material (custom)', value: 'sr_material_custom' },
            sr_thickness:       { label: 'Thickness (mm)',    value: 'sr_thickness' },
            sr_diameter:        { label: 'Diameter (mm)',     value: 'sr_diameter' },
            sr_width:           { label: 'Width (mm)',        value: 'sr_width' },
            sr_lengthOfLay:     { label: 'Length of lay (mm)',value: 'sr_lengthOfLay' },
            sr_numOfTapes:      { label: 'No. of tapes',      value: 'sr_numOfTapes' }
            }},
            concentric_neutral: { label: 'Concentric neutral', children: {
            cn_material:             { label: 'Material',             value: 'cn_material' },
            cn_material_custom:      { label: 'Material (custom)',    value: 'cn_material_custom' },
            cn_construction:         { label: 'Construction',         value: 'cn_construction' },
            cn_construction_custom:  { label: 'Construction (custom)',value: 'cn_construction_custom' },
            cn_thickness:            { label: 'Thickness (mm)',       value: 'cn_thickness' },
            cn_diameter:             { label: 'Diameter (mm)',        value: 'cn_diameter' },
            cn_area:                 { label: 'Area (mm²)',           value: 'cn_area' },
            cn_lengthOfLay:          { label: 'Length of lay (mm)',   value: 'cn_lengthOfLay' },
            cn_numOfWires:           { label: 'No. of wires',         value: 'cn_numOfWires' }
            }},
            armour_bedding: { label: 'Armour bedding', children: {
            ab_material:        { label: 'Material',          value: 'ab_material' },
            ab_material_custom: { label: 'Material (custom)', value: 'ab_material_custom' },
            ab_thickness:       { label: 'Thickness (mm)',    value: 'ab_thickness' },
            ab_diameter:        { label: 'Diameter (mm)',     value: 'ab_diameter' }
            }},
            armour: { label: 'Armour', children: {
            armour_material:          { label: 'Material',             value: 'armour_material' },
            armour_material_custom:   { label: 'Material (custom)',    value: 'armour_material_custom' },
            armour_thickness:         { label: 'Thickness (mm)',       value: 'armour_thickness' },
            armour_diameter:          { label: 'Diameter (mm)',        value: 'armour_diameter' },
            armour_layerOfTapes:      { label: 'Layer of tapes',       value: 'armour_layerOfTapes' },
            armour_layerOfTapes_custom:{ label: 'Layer of tapes (custom)',value: 'armour_layerOfTapes_custom' },
            armour_crossSectional:    { label: 'Cross-sectional area', value: 'armour_crossSectional' }
            }},
            oversheath: { label: 'Oversheath / Jacket', children: {
            os_material:        { label: 'Material',          value: 'os_material' },
            os_material_custom: { label: 'Material (custom)', value: 'os_material_custom' },
            os_thickness:       { label: 'Thickness (mm)',    value: 'os_thickness' },
            os_diameter:        { label: 'Diameter (mm)',     value: 'os_diameter' }
            }},
            terminalsData: { label: 'Terminals', children: {
            term_rated_u:         { label: 'Rated voltage',      value: 'term_rated_u' },
            term_bil:             { label: 'BIL',                value: 'term_bil' },
            term_bsl:             { label: 'BSL',                value: 'term_bsl' },
            term_type:            { label: 'Type',               value: 'term_type' },
            term_class:           { label: 'Class',              value: 'term_class' },
            term_connector_type:  { label: 'Connector type',     value: 'term_connector_type' },
            term_service_condition:{ label: 'Service condition', value: 'term_service_condition' }
            }},
            jointsData: { label: 'Joints', children: {
            joint_rated_u:           { label: 'Rated voltage',    value: 'joint_rated_u' },
            joint_rated_current:     { label: 'Rated current',    value: 'joint_rated_current' },
            joint_category:          { label: 'Category',         value: 'joint_category' },
            joint_construction:      { label: 'Construction',     value: 'joint_construction' },
            joint_service_condition: { label: 'Service condition',value: 'joint_service_condition' }
            }},
            sheathLimitsData: { label: 'Sheath voltage limits', children: {
            sl_rated_voltage_ur:                      { label: 'Rated voltage Ur',                     value: 'sl_rated_voltage_ur' },
            sl_max_continuous_operating_voltage:      { label: 'Max continuous operating voltage Uc',  value: 'sl_max_continuous_operating_voltage' },
            sl_nominal_discharge_current:             { label: 'Nominal discharge current',            value: 'sl_nominal_discharge_current' },
            sl_high_current_impulse_withstand:        { label: 'High current impulse withstand',       value: 'sl_high_current_impulse_withstand' },
            sl_long_duration_current_impulse_withstand:{ label: 'Long duration impulse withstand',     value: 'sl_long_duration_current_impulse_withstand' },
            sl_short_circuit_withstand:               { label: 'Short circuit withstand',             value: 'sl_short_circuit_withstand' }
            }}
        }}
        }},
        SurgeArresterDto: { label: 'Surge Arrester', children: {
        ConfigurationDto: { label: 'Configuration', children: {
            number_of_phase: { label: 'Number of phase', value: 'number_of_phase' }, phase: { label: 'Phase', value: 'phase' }
        }},
        PropertiesDto: { label: 'Properties', children: {
            type:              { label: 'Asset type',         value: 'type' },
            serial_no:         { label: 'Serial no.',         value: 'serial_no' },
            manufacturer:      { label: 'Manufacturer',       value: 'manufacturer' },
            manufacturer_type: { label: 'Manufacturer type',  value: 'manufacturer_type' },
            manufacturer_year: { label: 'Manufacturing year', value: 'manufacturer_year' },
            country_of_origin: { label: 'Country of origin',  value: 'country_of_origin' },
            apparatus_id:      { label: 'Apparatus ID',       value: 'apparatus_id' },
            comment:           { label: 'Comment',             value: 'comment' }
        }},
        RatingsDto: { label: 'Ratings', children: {
            unitStack:   { label: 'Units in stack', value: 'unitStack' },
            tableRating: { label: 'Rating table (array)', children: {
            sa_serial:         { label: 'Serial no.',                                     value: 'sa_serial' },
            sa_ratedVoltage:   { label: 'Rated voltage Ur',                               value: 'sa_ratedVoltage' },
            sa_maximumVoltage: { label: 'Maximum system voltage Us',                      value: 'sa_maximumVoltage' },
            sa_continousVoltage:{ label: 'Continuous operating voltage Uc',              value: 'sa_continousVoltage' },
            sa_shortCurrent:   { label: 'Short time withstand current',                  value: 'sa_shortCurrent' },
            sa_ratedCircuit:   { label: 'Rated duration of short circuit',               value: 'sa_ratedCircuit' },
            sa_polesVoltage:   { label: 'PF withstand voltage (earth & poles)',          value: 'sa_polesVoltage' },
            sa_isoVoltage:     { label: 'PF withstand voltage (isolating distance)',     value: 'sa_isoVoltage' }
            }}
        }}
        }},
        BushingAssetDto: { label: 'Bushing', children: {
        ConfigurationDto: { label: 'Configuration', children: {
            number_of_phase: { label: 'Number of phase', value: 'number_of_phase' }, phase: { label: 'Phase', value: 'phase' }
        }},
        PropertiesDto: { label: 'Properties', children: {
            type:              { label: 'Asset type',         value: 'type' },
            serial_no:         { label: 'Serial no.',         value: 'serial_no' },
            manufacturer:      { label: 'Manufacturer',       value: 'manufacturer' },
            manufacturer_type: { label: 'Manufacturer type',  value: 'manufacturer_type' },
            manufacturer_year: { label: 'Manufacturing year', value: 'manufacturer_year' },
            country_of_origin: { label: 'Country of origin',  value: 'country_of_origin' },
            apparatus_id:      { label: 'Apparatus ID',       value: 'apparatus_id' },
            comment:           { label: 'Comment',             value: 'comment' }
        }},
        BushingDataDto: { label: 'Bushing data', children: {
            rated_frequency:   { label: 'Rated frequency',       value: 'rated_frequency' },
            insulation_level:  { label: 'Insul. level LL (BIL)', value: 'insulation_level' },
            voltage_l_ground:  { label: 'Voltage L-ground',      value: 'voltage_l_ground' },
            max_system_voltage:{ label: 'Max system voltage',     value: 'max_system_voltage' },
            rated_current:     { label: 'Rated current',         value: 'rated_current' },
            df_c1:             { label: 'DF (C1)',               value: 'df_c1' },
            cap_c1:            { label: 'Cap. (C1)',             value: 'cap_c1' },
            df_c2:             { label: 'DF (C2)',               value: 'df_c2' },
            cap_c2:            { label: 'Cap. (C2)',             value: 'cap_c2' },
            insulation_type:   { label: 'Insulation type',       value: 'insulation_type' }
        }}
        }},
        ReactorDto: { label: 'Reactor', children: {
        ConfigurationDto: { label: 'Configuration', children: {
            number_of_phase: { label: 'Number of phase', value: 'number_of_phase' }, phase: { label: 'Phase', value: 'phase' }
        }},
        PropertiesDto: { label: 'Properties', children: {
            type: { label: 'Asset type', value: 'type' }, serial_no: { label: 'Serial no.', value: 'serial_no' },
            manufacturer: { label: 'Manufacturer', value: 'manufacturer' }, manufacturer_type: { label: 'Manufacturer type', value: 'manufacturer_type' },
            manufacturing_year: { label: 'Manufacturing year', value: 'manufacturing_year' }, country_of_origin: { label: 'Country of origin', value: 'country_of_origin' },
            apparatus_id: { label: 'Apparatus ID', value: 'apparatus_id' }, feeder: { label: 'Feeder', value: 'feeder' }, comment: { label: 'Comment', value: 'comment' }
        }},
        ReactorRatingDto: { label: 'Ratings', children: {
            rated_voltage: { label: 'Rated voltage', value: 'rated_voltage' }, rated_frequency: { label: 'Rated frequency', value: 'rated_frequency' },
            rated_current: { label: 'Rated current', value: 'rated_current' }, rated_power: { label: 'Rated power', value: 'rated_power' }, inductance: { label: 'Inductance', value: 'inductance' }
        }},
        ReactorOtherDto: { label: 'Others', children: {
            insulation_type: { label: 'Insulation type', value: 'insulation_type' }, weight: { label: 'Weight', value: 'weight' }
        }}
        }},
        CapacitorsDTO: { label: 'Capacitor', children: {
        ConfigurationDto: { label: 'Configuration', children: {
            number_of_phase: { label: 'Number of phase', value: 'number_of_phase' }, phase: { label: 'Phase', value: 'phase' }
        }},
        PropertiesDto: { label: 'Properties', children: {
            type:               { label: 'Asset type',         value: 'type' },
            serial_no:          { label: 'Serial no.',         value: 'serial_no' },
            manufacturer:       { label: 'Manufacturer',       value: 'manufacturer' },
            manufacturer_type:  { label: 'Manufacturer type',  value: 'manufacturer_type' },
            manufacturing_year: { label: 'Manufacturing year', value: 'manufacturing_year' },
            country_of_origin:  { label: 'Country of origin',  value: 'country_of_origin' },
            apparatus_id:       { label: 'Apparatus ID',       value: 'apparatus_id' },
            feeder:             { label: 'Feeder',             value: 'feeder' },
            comment:            { label: 'Comment',             value: 'comment' }
        }},
        configsData: { label: 'Configuration', children: {
            cap_phase:      { label: 'Phase (1 or 3)', value: 'cap_phase' },
            cap_phase_name: { label: 'Phase name',    value: 'cap_phase_name' }
        }},
        RatingsDto: { label: 'Ratings', children: {
            cap_rated_voltage:   { label: 'Rated voltage',   value: 'cap_rated_voltage' },
            cap_rated_frequency: { label: 'Rated frequency', value: 'cap_rated_frequency' },
            cap_rated_current:   { label: 'Rated current',   value: 'cap_rated_current' },
            cap_rated_power:     { label: 'Rated power',     value: 'cap_rated_power' }
        }},
        CapacitanceDto: { label: 'Capacitance', children: {
            cap_capacitance:   { label: 'Capacitance (phase 1)', value: 'cap_capacitance' },
            cap_capacitance_A: { label: 'Capacitance phase A',   value: 'cap_capacitance_A' },
            cap_capacitance_B: { label: 'Capacitance phase B',   value: 'cap_capacitance_B' },
            cap_capacitance_C: { label: 'Capacitance phase C',   value: 'cap_capacitance_C' }
        }},
        DissipationFactorDto: { label: 'Dissipation factor', children: {
            cap_df:   { label: 'Dissipation factor (phase 1)', value: 'cap_df' },
            cap_df_A: { label: 'Dissipation factor phase A',   value: 'cap_df_A' },
            cap_df_B: { label: 'Dissipation factor phase B',   value: 'cap_df_B' },
            cap_df_C: { label: 'Dissipation factor phase C',   value: 'cap_df_C' }
        }},
        OthersData: { label: 'Others', children: {
            cap_insulation_type: { label: 'Insulation type', value: 'cap_insulation_type' },
            cap_weight:          { label: 'Weight (kg)',      value: 'cap_weight' }
        }}
        }},
        DisconnectorDTO: { label: 'Disconnector', children: {
        ConfigurationDto: { label: 'Configuration', children: {
            number_of_phase: { label: 'Number of phase', value: 'number_of_phase' }, phase: { label: 'Phase', value: 'phase' }
        }},
        PropertiesDto: { label: 'Properties', children: {
            type:               { label: 'Asset type',         value: 'type' },
            serial_no:          { label: 'Serial no.',         value: 'serial_no' },
            manufacturer:       { label: 'Manufacturer',       value: 'manufacturer' },
            manufacturer_type:  { label: 'Manufacturer type',  value: 'manufacturer_type' },
            manufacturing_year: { label: 'Manufacturing year', value: 'manufacturing_year' },
            country_of_origin:  { label: 'Country of origin',  value: 'country_of_origin' },
            apparatus_id:       { label: 'Apparatus ID',       value: 'apparatus_id' },
            feeder:             { label: 'Feeder',             value: 'feeder' },
            comment:            { label: 'Comment',             value: 'comment' }
        }},
        RatingsDto: { label: 'Ratings', children: {
            rated_voltage:                             { label: 'Rated voltage',                              value: 'dc_rated_voltage' },
            rated_frequency:                           { label: 'Rated frequency',                            value: 'dc_rated_frequency' },
            rated_current:                             { label: 'Rated current',                             value: 'dc_rated_current' },
            short_time_withstand_current:              { label: 'Short time withstand current',               value: 'dc_short_time_withstand_current' },
            rated_duration_of_short_circuit:           { label: 'Rated duration of short circuit',           value: 'dc_rated_duration_of_short_circuit' },
            power_freq_withstand_voltage_earth_poles:  { label: 'PF withstand voltage (earth & poles)',      value: 'dc_pf_earth_poles' },
            power_freq_withstand_voltage_isolating_distance: { label: 'PF withstand voltage (isolating distance)', value: 'dc_pf_isolating_distance' }
        }}
        }},
        RotatingMachineDTO: { label: 'Rotating Machine', children: {
        PropertiesDto: { label: 'Properties', children: {
            type: { label: 'Asset type', value: 'type' }, serial_no: { label: 'Serial no.', value: 'serial_no' },
            manufacturer: { label: 'Manufacturer', value: 'manufacturer' }, manufacturer_type: { label: 'Manufacturer type', value: 'manufacturer_type' },
            manufacturer_year: { label: 'Manufacturing year', value: 'manufacturer_year' }, country_of_origin: { label: 'Country of origin', value: 'country_of_origin' },
            apparatus_id: { label: 'Apparatus ID', value: 'apparatus_id' }, comment: { label: 'Comment', value: 'comment' }
        }},
        configsData: { label: 'Configurations', children: { star_point: { label: 'Star point', value: 'star_point' } }},
        ratingsData: { label: 'Ratings', children: {
            rated_u: { label: 'Rated voltage (LL)', value: 'rated_u' }, rated_current: { label: 'Rated current', value: 'rated_current' },
            rated_speed: { label: 'Rated speed (rpm)', value: 'rated_speed' }, rated_frequency: { label: 'Rated frequency', value: 'rated_frequency' },
            rated_power: { label: 'Rated power', value: 'rated_power' }, rated_power_factor: { label: 'Rated power factor', value: 'rated_power_factor' },
            rated_thermal_class: { label: 'Rated thermal class', value: 'rated_thermal_class' },
            rated_ifd: { label: 'Rated excitation current', value: 'rated_ifd' }, rated_ufd: { label: 'Rated excitation voltage', value: 'rated_ufd' }
        }}
        }}
    }}

    ,
    Job: { label: 'Job', children: {
        Job_TransformerJobDto: { label: 'Transformer Job', children: {
        PropertiesDto: { label: 'Properties', children: {
            name:          { label: 'Job name',          value: 'job_name' },
            job_type:      { label: 'Job type',          value: 'job_type' },
            creation_date: { label: 'Creation date',     value: 'creation_date' },
            execution_date:{ label: 'Execution date',    value: 'execution_date' },
            tested_by:     { label: 'Tested by',         value: 'tested_by' },
            approved_by:   { label: 'Approved by',       value: 'approved_by' },
            approval_date: { label: 'Approval date',     value: 'approval_date' },
            test_method:   { label: 'Test method',       value: 'test_method' },
            ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
            summary:       { label: 'Summary',           value: 'summary' }
            } },
        TestingEquipment: { label: 'Testing equipment', children: {
            model:            { label: 'Model',            value: 'te_model' },
            serial_number:    { label: 'Serial number',    value: 'te_serial_number' },
            calibration_date: { label: 'Calibration date', value: 'te_calibration_date' }
        } },
        Tests: { label: 'Test results', children: {
            BushingPrimC1: { label: 'Bushing Prim DF & CAP C1', children: {
            measurement: { label: 'Measurement', value: 'BushingPrimC1_measurement' },
            test_mode: { label: 'Test mode', value: 'BushingPrimC1_test_mode' },
            test_voltage: { label: 'Test voltage', value: 'BushingPrimC1_test_voltage' },
            df_ref: { label: 'DF ref', value: 'BushingPrimC1_df_ref' },
            c_ref: { label: 'C ref', value: 'BushingPrimC1_c_ref' },
            df_meas: { label: 'DF meas', value: 'BushingPrimC1_df_meas' },
            c_meas: { label: 'C meas', value: 'BushingPrimC1_c_meas' },
            df_change: { label: 'DF change', value: 'BushingPrimC1_df_change' },
            delta_c_percent: { label: '△C cal', value: 'BushingPrimC1_delta_c_percent' },
            assessment: { label: 'Assessment', value: 'BushingPrimC1_assessment' },
            condition_indicator_df: { label: 'Condition indicator DF', value: 'BushingPrimC1_condition_indicator_df' },
            condition_indicator_c: { label: 'Condition indicator C', value: 'BushingPrimC1_condition_indicator_c' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'BushingPrimC1_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'BushingPrimC1_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'BushingPrimC1_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'BushingPrimC1_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'BushingPrimC1_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'BushingPrimC1_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'BushingPrimC1_cond_weather' }
            }},
            BushingPrimC2: { label: 'Bushing Prim C2', children: {
            measurement: { label: 'Measurement', value: 'BushingPrimC2_measurement' },
            test_mode: { label: 'Test mode', value: 'BushingPrimC2_test_mode' },
            test_voltage: { label: 'Test voltage', value: 'BushingPrimC2_test_voltage' },
            df_ref: { label: 'DF ref', value: 'BushingPrimC2_df_ref' },
            c_ref: { label: 'C ref', value: 'BushingPrimC2_c_ref' },
            df_meas: { label: 'DF meas', value: 'BushingPrimC2_df_meas' },
            c_meas: { label: 'C meas', value: 'BushingPrimC2_c_meas' },
            df_change: { label: 'DF change', value: 'BushingPrimC2_df_change' },
            delta_c_percent: { label: '△C cal', value: 'BushingPrimC2_delta_c_percent' },
            assessment: { label: 'Assessment', value: 'BushingPrimC2_assessment' },
            condition_indicator_df: { label: 'Condition indicator DF', value: 'BushingPrimC2_condition_indicator_df' },
            condition_indicator_c: { label: 'Condition indicator C', value: 'BushingPrimC2_condition_indicator_c' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'BushingPrimC2_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'BushingPrimC2_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'BushingPrimC2_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'BushingPrimC2_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'BushingPrimC2_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'BushingPrimC2_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'BushingPrimC2_cond_weather' }
            }},
            BushingSecC1: { label: 'Bushing Sec DF & CAP C1', children: {
            measurement: { label: 'Measurement', value: 'BushingSecC1_measurement' },
            test_mode: { label: 'Test mode', value: 'BushingSecC1_test_mode' },
            test_voltage: { label: 'Test voltage', value: 'BushingSecC1_test_voltage' },
            df_ref: { label: 'DF ref', value: 'BushingSecC1_df_ref' },
            c_ref: { label: 'C ref', value: 'BushingSecC1_c_ref' },
            df_meas: { label: 'DF meas', value: 'BushingSecC1_df_meas' },
            c_meas: { label: 'C meas', value: 'BushingSecC1_c_meas' },
            df_change: { label: 'DF change', value: 'BushingSecC1_df_change' },
            delta_c_percent: { label: '△C cal', value: 'BushingSecC1_delta_c_percent' },
            assessment: { label: 'Assessment', value: 'BushingSecC1_assessment' },
            condition_indicator_df: { label: 'Condition indicator DF', value: 'BushingSecC1_condition_indicator_df' },
            condition_indicator_c: { label: 'Condition indicator C', value: 'BushingSecC1_condition_indicator_c' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'BushingSecC1_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'BushingSecC1_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'BushingSecC1_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'BushingSecC1_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'BushingSecC1_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'BushingSecC1_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'BushingSecC1_cond_weather' }
            }},
            BushingSecC2: { label: 'Bushing Sec DF & CAP C2', children: {
            measurement: { label: 'Measurement', value: 'BushingSecC2_measurement' },
            test_mode: { label: 'Test mode', value: 'BushingSecC2_test_mode' },
            test_voltage: { label: 'Test voltage', value: 'BushingSecC2_test_voltage' },
            df_ref: { label: 'DF ref', value: 'BushingSecC2_df_ref' },
            c_ref: { label: 'C ref', value: 'BushingSecC2_c_ref' },
            df_meas: { label: 'DF meas', value: 'BushingSecC2_df_meas' },
            c_meas: { label: 'C meas', value: 'BushingSecC2_c_meas' },
            assessment: { label: 'Assessment', value: 'BushingSecC2_assessment' },
            condition_indicator_df: { label: 'Condition indicator DF', value: 'BushingSecC2_condition_indicator_df' },
            condition_indicator_c: { label: 'Condition indicator C', value: 'BushingSecC2_condition_indicator_c' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'BushingSecC2_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'BushingSecC2_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'BushingSecC2_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'BushingSecC2_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'BushingSecC2_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'BushingSecC2_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'BushingSecC2_cond_weather' }
            }},
            BushingTertC1: { label: 'Bushing Tert DF & CAP C1', children: {
            measurement: { label: 'Measurement', value: 'BushingTertC1_measurement' },
            test_mode: { label: 'Test mode', value: 'BushingTertC1_test_mode' },
            test_voltage: { label: 'Test voltage', value: 'BushingTertC1_test_voltage' },
            df_ref: { label: 'DF ref', value: 'BushingTertC1_df_ref' },
            c_ref: { label: 'C ref', value: 'BushingTertC1_c_ref' },
            df_meas: { label: 'DF meas', value: 'BushingTertC1_df_meas' },
            c_meas: { label: 'C meas', value: 'BushingTertC1_c_meas' },
            df_change: { label: 'DF change', value: 'BushingTertC1_df_change' },
            delta_c_percent: { label: '△C cal', value: 'BushingTertC1_delta_c_percent' },
            assessment: { label: 'Assessment', value: 'BushingTertC1_assessment' },
            condition_indicator_df: { label: 'Condition indicator DF', value: 'BushingTertC1_condition_indicator_df' },
            condition_indicator_c: { label: 'Condition indicator C', value: 'BushingTertC1_condition_indicator_c' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'BushingTertC1_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'BushingTertC1_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'BushingTertC1_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'BushingTertC1_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'BushingTertC1_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'BushingTertC1_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'BushingTertC1_cond_weather' }
            }},
            BushingTertC2: { label: 'Bushing Tert DF & CAP C2', children: {
            measurement: { label: 'Measurement', value: 'BushingTertC2_measurement' },
            test_mode: { label: 'Test mode', value: 'BushingTertC2_test_mode' },
            test_voltage: { label: 'Test voltage', value: 'BushingTertC2_test_voltage' },
            df_ref: { label: 'DF ref', value: 'BushingTertC2_df_ref' },
            c_ref: { label: 'C ref', value: 'BushingTertC2_c_ref' },
            df_meas: { label: 'DF meas', value: 'BushingTertC2_df_meas' },
            c_meas: { label: 'C meas', value: 'BushingTertC2_c_meas' },
            df_change: { label: 'DF change', value: 'BushingTertC2_df_change' },
            delta_c_percent: { label: '△C cal', value: 'BushingTertC2_delta_c_percent' },
            assessment: { label: 'Assessment', value: 'BushingTertC2_assessment' },
            condition_indicator_df: { label: 'Condition indicator DF', value: 'BushingTertC2_condition_indicator_df' },
            condition_indicator_c: { label: 'Condition indicator C', value: 'BushingTertC2_condition_indicator_c' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'BushingTertC2_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'BushingTertC2_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'BushingTertC2_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'BushingTertC2_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'BushingTertC2_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'BushingTertC2_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'BushingTertC2_cond_weather' }
            }},
            DCWindingPrim: { label: 'DC Winding resistance Prim', children: {
            tap: { label: 'Tap', value: 'DCWindingPrim_tap' },
            name: { label: 'Name', value: 'DCWindingPrim_name' },
            r_meas: { label: 'R meas', value: 'DCWindingPrim_r_meas' },
            r_ref: { label: 'R ref', value: 'DCWindingPrim_r_ref' },
            r_corr: { label: 'R corr', value: 'DCWindingPrim_r_corr' },
            dev_r_ref: { label: 'Dev with R ref (%)', value: 'DCWindingPrim_dev_r_ref' },
            dev_phase: { label: 'Dev within phases (%)', value: 'DCWindingPrim_dev_phase' },
            assessment: { label: 'Assessment', value: 'DCWindingPrim_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'DCWindingPrim_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'DCWindingPrim_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'DCWindingPrim_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'DCWindingPrim_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'DCWindingPrim_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'DCWindingPrim_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'DCWindingPrim_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'DCWindingPrim_cond_weather' }
            }},
            DCWindingSec: { label: 'DC Winding resistance Sec', children: {
            tap: { label: 'Tap', value: 'DCWindingSec_tap' },
            name: { label: 'Name', value: 'DCWindingSec_name' },
            r_meas: { label: 'R meas', value: 'DCWindingSec_r_meas' },
            r_ref: { label: 'R ref', value: 'DCWindingSec_r_ref' },
            r_corr: { label: 'R corr', value: 'DCWindingSec_r_corr' },
            dev_r_ref: { label: 'Dev with R ref (%)', value: 'DCWindingSec_dev_r_ref' },
            dev_phase: { label: 'Dev within phases (%)', value: 'DCWindingSec_dev_phase' },
            assessment: { label: 'Assessment', value: 'DCWindingSec_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'DCWindingSec_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'DCWindingSec_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'DCWindingSec_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'DCWindingSec_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'DCWindingSec_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'DCWindingSec_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'DCWindingSec_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'DCWindingSec_cond_weather' }
            }},
            DCWindingTert: { label: 'DC Winding resistance Tert', children: {
            tap: { label: 'Tap', value: 'DCWindingTert_tap' },
            name: { label: 'Name', value: 'DCWindingTert_name' },
            r_meas: { label: 'R meas', value: 'DCWindingTert_r_meas' },
            r_ref: { label: 'R ref', value: 'DCWindingTert_r_ref' },
            r_corr: { label: 'R corr', value: 'DCWindingTert_r_corr' },
            dev_r_ref: { label: 'Dev with R ref (%)', value: 'DCWindingTert_dev_r_ref' },
            dev_phase: { label: 'Dev within phases (%)', value: 'DCWindingTert_dev_phase' },
            assessment: { label: 'Assessment', value: 'DCWindingTert_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'DCWindingTert_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'DCWindingTert_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'DCWindingTert_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'DCWindingTert_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'DCWindingTert_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'DCWindingTert_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'DCWindingTert_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'DCWindingTert_cond_weather' }
            }},
            Dga: { label: 'DGA', children: {
            h2: { label: 'H2', value: 'Dga_h2' },
            ch4: { label: 'CH4', value: 'Dga_ch4' },
            c2h2: { label: 'C2H2', value: 'Dga_c2h2' },
            c2h4: { label: 'C2H4', value: 'Dga_c2h4' },
            c2h6: { label: 'C2H6', value: 'Dga_c2h6' },
            co: { label: 'CO', value: 'Dga_co' },
            co2: { label: 'CO2', value: 'Dga_co2' },
            tdcg: { label: 'TDCG', value: 'Dga_tdcg' },
            status: { label: 'Status', value: 'Dga_status' },
            condition_indicator: { label: 'Condition indicator', value: 'Dga_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'Dga_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'Dga_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'Dga_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'Dga_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'Dga_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'Dga_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'Dga_cond_weather' }
            }},
            DimensionWeight: { label: 'Dimension Weight', children: {
            a: { label: 'A', value: 'DimensionWeight_a' },
            b: { label: 'B', value: 'DimensionWeight_b' },
            c: { label: 'C', value: 'DimensionWeight_c' },
            n: { label: 'N', value: 'DimensionWeight_n' },
            oil: { label: 'Oil', value: 'DimensionWeight_oil' },
            active_part: { label: 'Active part', value: 'DimensionWeight_active_part' },
            total: { label: 'Total', value: 'DimensionWeight_total' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'DimensionWeight_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'DimensionWeight_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'DimensionWeight_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'DimensionWeight_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'DimensionWeight_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'DimensionWeight_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'DimensionWeight_cond_weather' }
            }},
            EnergyEfficiency: { label: 'Energy Efficiency', children: {
            name: { label: 'Name', value: 'EnergyEfficiency_name' },
            e50: { label: 'E50', value: 'EnergyEfficiency_e50' },
            standard: { label: 'Standard', value: 'EnergyEfficiency_standard' },
            assessment: { label: 'Assessment', value: 'EnergyEfficiency_assessment' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'EnergyEfficiency_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'EnergyEfficiency_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'EnergyEfficiency_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'EnergyEfficiency_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'EnergyEfficiency_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'EnergyEfficiency_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'EnergyEfficiency_cond_weather' }
            }},
            ExcitingCurrent: { label: 'Exciting Current', children: {
            tap: { label: 'Tap', value: 'ExcitingCurrent_tap' },
            phase: { label: 'Phase', value: 'ExcitingCurrent_phase' },
            i_out: { label: 'I Out', value: 'ExcitingCurrent_i_out' },
            watt_losses: { label: 'Watt losses', value: 'ExcitingCurrent_watt_losses' },
            i_ref: { label: 'I Ref', value: 'ExcitingCurrent_i_ref' },
            i_dev: { label: 'I Dev', value: 'ExcitingCurrent_i_dev' },
            assessment: { label: 'Assessment', value: 'ExcitingCurrent_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'ExcitingCurrent_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'ExcitingCurrent_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'ExcitingCurrent_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'ExcitingCurrent_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'ExcitingCurrent_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'ExcitingCurrent_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'ExcitingCurrent_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'ExcitingCurrent_cond_weather' }
            }},
            GasChromatography: { label: 'Gas Chromatography', children: {
            name: { label: 'Name', value: 'GasChromatography_name' },
            method: { label: 'Method', value: 'GasChromatography_method' },
            result: { label: 'Result', value: 'GasChromatography_result' },
            assessment: { label: 'Assessment', value: 'GasChromatography_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'GasChromatography_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'GasChromatography_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'GasChromatography_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'GasChromatography_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'GasChromatography_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'GasChromatography_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'GasChromatography_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'GasChromatography_cond_weather' }
            }},
            GeneralInspection: { label: 'General inspection', children: {
            item: { label: 'Item', value: 'GeneralInspection_item' },
            assessment: { label: 'Assessment', value: 'GeneralInspection_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'GeneralInspection_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'GeneralInspection_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'GeneralInspection_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'GeneralInspection_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'GeneralInspection_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'GeneralInspection_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'GeneralInspection_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'GeneralInspection_cond_weather' }
            }},
            InducedAcVoltageTest: { label: 'Induced AC Voltage Test', children: {
            applied_terminal: { label: 'Applied Terminal', value: 'InducedAcVoltageTest_applied_terminal' },
            rated_voltage: { label: 'Rated Voltage', value: 'InducedAcVoltageTest_rated_voltage' },
            lv_terminal: { label: 'LV Terminal', value: 'InducedAcVoltageTest_lv_terminal' },
            lv_tested_voltage: { label: 'LV Tested Voltage', value: 'InducedAcVoltageTest_lv_tested_voltage' },
            hv_terminal: { label: 'HV Terminal', value: 'InducedAcVoltageTest_hv_terminal' },
            hv_tested_voltage: { label: 'HV Tested Voltage', value: 'InducedAcVoltageTest_hv_tested_voltage' },
            assessment: { label: 'Assessment', value: 'InducedAcVoltageTest_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'InducedAcVoltageTest_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'InducedAcVoltageTest_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'InducedAcVoltageTest_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'InducedAcVoltageTest_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'InducedAcVoltageTest_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'InducedAcVoltageTest_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'InducedAcVoltageTest_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'InducedAcVoltageTest_cond_weather' }
            }},
            InsulationResistance: { label: 'Insulation resistance of winding', children: {
            measurement: { label: 'Measurement', value: 'InsulationResistance_measurement' },
            type: { label: 'Type', value: 'InsulationResistance_type' },
            r15s: { label: 'R15s', value: 'InsulationResistance_r15s' },
            r60s: { label: 'R60s', value: 'InsulationResistance_r60s' },
            r_10m: { label: 'R10m', value: 'InsulationResistance_r_10m' },
            dar: { label: 'DAR', value: 'InsulationResistance_dar' },
            pi: { label: 'PI', value: 'InsulationResistance_pi' },
            assessment: { label: 'Assessment', value: 'InsulationResistance_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'InsulationResistance_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'InsulationResistance_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'InsulationResistance_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'InsulationResistance_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'InsulationResistance_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'InsulationResistance_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'InsulationResistance_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'InsulationResistance_cond_weather' }
            }},
            InsulationResistanceYokeCore: { label: 'Insulation resistance of yoke and core', children: {
            measurement: { label: 'Measurement', value: 'InsulationResistanceYokeCore_measurement' },
            r60s: { label: 'R60s', value: 'InsulationResistanceYokeCore_r60s' },
            r60s_ref: { label: 'R60s ref', value: 'InsulationResistanceYokeCore_r60s_ref' },
            assessment: { label: 'Assessment', value: 'InsulationResistanceYokeCore_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'InsulationResistanceYokeCore_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'InsulationResistanceYokeCore_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'InsulationResistanceYokeCore_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'InsulationResistanceYokeCore_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'InsulationResistanceYokeCore_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'InsulationResistanceYokeCore_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'InsulationResistanceYokeCore_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'InsulationResistanceYokeCore_cond_weather' }
            }},
            MeasurementOfNoLoad: { label: 'No-load Test', children: {
            name: { label: 'Name', value: 'MeasurementOfNoLoad_name' },
            result: { label: 'Result', value: 'MeasurementOfNoLoad_result' },
            standard: { label: 'Standard', value: 'MeasurementOfNoLoad_standard' },
            assessment: { label: 'Assessment', value: 'MeasurementOfNoLoad_assessment' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'MeasurementOfNoLoad_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'MeasurementOfNoLoad_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'MeasurementOfNoLoad_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'MeasurementOfNoLoad_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'MeasurementOfNoLoad_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'MeasurementOfNoLoad_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'MeasurementOfNoLoad_cond_weather' }
            }},
            MeasurementOfOil: { label: 'Oil breakdown voltage', children: {
            type: { label: 'Type', value: 'MeasurementOfOil_type' },
            electrode_gap_spacing: { label: 'Electrode gap spacing', value: 'MeasurementOfOil_electrode_gap_spacing' },
            result: { label: 'Result', value: 'MeasurementOfOil_result' },
            assessment: { label: 'Assessment', value: 'MeasurementOfOil_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'MeasurementOfOil_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'MeasurementOfOil_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'MeasurementOfOil_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'MeasurementOfOil_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'MeasurementOfOil_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'MeasurementOfOil_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'MeasurementOfOil_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'MeasurementOfOil_cond_weather' }
            }},
            MeasurementOfShortCircuit: { label: 'Short-circuit Test', children: {
            name: { label: 'Name', value: 'MeasurementOfShortCircuit_name' },
            result: { label: 'Result', value: 'MeasurementOfShortCircuit_result' },
            standard: { label: 'Standard', value: 'MeasurementOfShortCircuit_standard' },
            assessment: { label: 'Assessment', value: 'MeasurementOfShortCircuit_assessment' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'MeasurementOfShortCircuit_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'MeasurementOfShortCircuit_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'MeasurementOfShortCircuit_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'MeasurementOfShortCircuit_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'MeasurementOfShortCircuit_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'MeasurementOfShortCircuit_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'MeasurementOfShortCircuit_cond_weather' }
            }},
            RatioPrimSec: { label: 'Ratio Prim/Sec', children: {
            tap: { label: 'Tap', value: 'RatioPrimSec_tap' },
            phase: { label: 'Phase', value: 'RatioPrimSec_phase' },
            voltage_prim: { label: 'Primary Voltage', value: 'RatioPrimSec_voltage_prim' },
            voltage_sec: { label: 'Secondary Voltage', value: 'RatioPrimSec_voltage_sec' },
            nominal_ratio: { label: 'Nominal Ratio', value: 'RatioPrimSec_nominal_ratio' },
            ratio_meas: { label: 'Ratio meas', value: 'RatioPrimSec_ratio_meas' },
            ratio_dev: { label: 'Ratio dev', value: 'RatioPrimSec_ratio_dev' },
            assessment: { label: 'Assessment', value: 'RatioPrimSec_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'RatioPrimSec_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'RatioPrimSec_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'RatioPrimSec_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'RatioPrimSec_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'RatioPrimSec_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'RatioPrimSec_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'RatioPrimSec_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'RatioPrimSec_cond_weather' }
            }},
            SeparateSourceAc: { label: 'Separate Source AC Voltage Test', children: {
            applied_terminal: { label: 'Applied Terminal', value: 'SeparateSourceAc_applied_terminal' },
            test_voltage: { label: 'Test voltage', value: 'SeparateSourceAc_test_voltage' },
            assessment: { label: 'Assessment', value: 'SeparateSourceAc_assessment' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'SeparateSourceAc_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'SeparateSourceAc_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'SeparateSourceAc_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'SeparateSourceAc_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'SeparateSourceAc_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'SeparateSourceAc_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'SeparateSourceAc_cond_weather' }
            }},
            ShortCircuitImpedancePrim: { label: 'Short-circuit impedance prim', children: {
            tap: { label: 'Tap', value: 'ShortCircuitImpedancePrim_tap' },
            phase: { label: 'Phase', value: 'ShortCircuitImpedancePrim_phase' },
            rk: { label: 'Rk', value: 'ShortCircuitImpedancePrim_rk' },
            xk: { label: 'Xk', value: 'ShortCircuitImpedancePrim_xk' },
            zk: { label: 'Zk', value: 'ShortCircuitImpedancePrim_zk' },
            uk_cal: { label: 'Uk cal', value: 'ShortCircuitImpedancePrim_uk_cal' },
            uk_dev: { label: 'Uk dev', value: 'ShortCircuitImpedancePrim_uk_dev' },
            assessment: { label: 'Assessment', value: 'ShortCircuitImpedancePrim_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'ShortCircuitImpedancePrim_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'ShortCircuitImpedancePrim_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'ShortCircuitImpedancePrim_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'ShortCircuitImpedancePrim_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'ShortCircuitImpedancePrim_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'ShortCircuitImpedancePrim_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'ShortCircuitImpedancePrim_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'ShortCircuitImpedancePrim_cond_weather' }
            }},
            ShortCircuitImpedanceSec: { label: 'Short-circuit impedance sec', children: {
            tap: { label: 'Tap', value: 'ShortCircuitImpedanceSec_tap' },
            phase: { label: 'Phase', value: 'ShortCircuitImpedanceSec_phase' },
            rk: { label: 'Rk', value: 'ShortCircuitImpedanceSec_rk' },
            xk: { label: 'Xk', value: 'ShortCircuitImpedanceSec_xk' },
            zk: { label: 'Zk', value: 'ShortCircuitImpedanceSec_zk' },
            uk_cal: { label: 'Uk cal', value: 'ShortCircuitImpedanceSec_uk_cal' },
            uk_dev: { label: 'Uk dev', value: 'ShortCircuitImpedanceSec_uk_dev' },
            assessment: { label: 'Assessment', value: 'ShortCircuitImpedanceSec_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'ShortCircuitImpedanceSec_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'ShortCircuitImpedanceSec_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'ShortCircuitImpedanceSec_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'ShortCircuitImpedanceSec_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'ShortCircuitImpedanceSec_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'ShortCircuitImpedanceSec_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'ShortCircuitImpedanceSec_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'ShortCircuitImpedanceSec_cond_weather' }
            }},
            ShortCircuitImpedanceTert: { label: 'Short-circuit impedance tert', children: {
            tap: { label: 'Tap', value: 'ShortCircuitImpedanceTert_tap' },
            phase: { label: 'Phase', value: 'ShortCircuitImpedanceTert_phase' },
            rk: { label: 'Rk', value: 'ShortCircuitImpedanceTert_rk' },
            xk: { label: 'Xk', value: 'ShortCircuitImpedanceTert_xk' },
            zk: { label: 'Zk', value: 'ShortCircuitImpedanceTert_zk' },
            uk_cal: { label: 'Uk cal', value: 'ShortCircuitImpedanceTert_uk_cal' },
            uk_dev: { label: 'Uk dev', value: 'ShortCircuitImpedanceTert_uk_dev' },
            assessment: { label: 'Assessment', value: 'ShortCircuitImpedanceTert_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'ShortCircuitImpedanceTert_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'ShortCircuitImpedanceTert_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'ShortCircuitImpedanceTert_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'ShortCircuitImpedanceTert_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'ShortCircuitImpedanceTert_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'ShortCircuitImpedanceTert_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'ShortCircuitImpedanceTert_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'ShortCircuitImpedanceTert_cond_weather' }
            }},
            TestingInstruments: { label: 'Testing Instruments', children: {
            item: { label: 'Item', value: 'TestingInstruments_item' },
            type: { label: 'Type', value: 'TestingInstruments_type' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'TestingInstruments_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'TestingInstruments_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'TestingInstruments_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'TestingInstruments_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'TestingInstruments_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'TestingInstruments_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'TestingInstruments_cond_weather' }
            }},
            WindingDfCap: { label: 'Winding DF & CAP', children: {
            measurement: { label: 'Measurement', value: 'WindingDfCap_measurement' },
            test_mode: { label: 'Test mode', value: 'WindingDfCap_test_mode' },
            test_voltage: { label: 'Test voltage', value: 'WindingDfCap_test_voltage' },
            df_ref: { label: 'DF ref', value: 'WindingDfCap_df_ref' },
            c_ref: { label: 'C ref', value: 'WindingDfCap_c_ref' },
            df_meas: { label: 'DF meas', value: 'WindingDfCap_df_meas' },
            c_meas: { label: 'C meas', value: 'WindingDfCap_c_meas' },
            delta_c_percent: { label: '△C cal', value: 'WindingDfCap_delta_c_percent' },
            assessment: { label: 'Assessment', value: 'WindingDfCap_assessment' },
            condition_indicator_df: { label: 'Condition indicator DF', value: 'WindingDfCap_condition_indicator_df' },
            condition_indicator_c: { label: 'Condition indicator C', value: 'WindingDfCap_condition_indicator_c' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'WindingDfCap_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'WindingDfCap_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'WindingDfCap_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'WindingDfCap_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'WindingDfCap_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'WindingDfCap_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'WindingDfCap_cond_weather' }
            }}
        }}
        }},
        Job_VoltageTransformerJobDto: { label: 'VT Job', children: {
        PropertiesDto: { label: 'Properties', children: {
            name:          { label: 'Job name',          value: 'job_name' },
            job_type:      { label: 'Job type',          value: 'job_type' },
            creation_date: { label: 'Creation date',     value: 'creation_date' },
            execution_date:{ label: 'Execution date',    value: 'execution_date' },
            tested_by:     { label: 'Tested by',         value: 'tested_by' },
            approved_by:   { label: 'Approved by',       value: 'approved_by' },
            approval_date: { label: 'Approval date',     value: 'approval_date' },
            test_method:   { label: 'Test method',       value: 'test_method' },
            ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
            summary:       { label: 'Summary',           value: 'summary' }
            } },
        TestingEquipment: { label: 'Testing equipment', children: {
            model:            { label: 'Model',            value: 'te_model' },
            serial_number:    { label: 'Serial number',    value: 'te_serial_number' },
            calibration_date: { label: 'Calibration date', value: 'te_calibration_date' }
        } },
        Tests: { label: 'Test results', children: {
            DcWindingResistance: { label: 'DC Winding resistance', children: {
            name: { label: 'Name', value: 'DcWindingResistance_name' },
            r_meas: { label: 'R meas', value: 'DcWindingResistance_r_meas' },
            r_ref: { label: 'R ref', value: 'DcWindingResistance_r_ref' },
            r_corr: { label: 'R corr', value: 'DcWindingResistance_r_corr' },
            r_dev: { label: 'R dev', value: 'DcWindingResistance_r_dev' },
            assessment: { label: 'Assessment', value: 'DcWindingResistance_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'DcWindingResistance_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'DcWindingResistance_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'DcWindingResistance_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'DcWindingResistance_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'DcWindingResistance_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'DcWindingResistance_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'DcWindingResistance_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'DcWindingResistance_cond_weather' }
            }},
            GeneralInspection: { label: 'General inspection', children: {
            item: { label: 'Item', value: 'GeneralInspection_item' },
            assessment: { label: 'Assessment', value: 'GeneralInspection_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'GeneralInspection_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'GeneralInspection_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'GeneralInspection_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'GeneralInspection_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'GeneralInspection_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'GeneralInspection_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'GeneralInspection_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'GeneralInspection_cond_weather' }
            }},
            InsulationResistance: { label: 'Insulation Resistance', children: {
            measurement: { label: 'Measurement', value: 'InsulationResistance_measurement' },
            test_voltage: { label: 'Test voltage', value: 'InsulationResistance_test_voltage' },
            r60s: { label: 'R60s', value: 'InsulationResistance_r60s' },
            assessment: { label: 'Assessment', value: 'InsulationResistance_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'InsulationResistance_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'InsulationResistance_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'InsulationResistance_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'InsulationResistance_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'InsulationResistance_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'InsulationResistance_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'InsulationResistance_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'InsulationResistance_cond_weather' }
            }},
            VTDfcap: { label: 'VT DF & CAP', children: {
            measurement: { label: 'Measurement', value: 'VTDfcap_measurement' },
            test_mode: { label: 'Test mode', value: 'VTDfcap_test_mode' },
            test_voltage: { label: 'Test voltage', value: 'VTDfcap_test_voltage' },
            df_ref: { label: 'DF ref', value: 'VTDfcap_df_ref' },
            c_ref: { label: 'C ref', value: 'VTDfcap_c_ref' },
            df_meas: { label: 'DF meas', value: 'VTDfcap_df_meas' },
            c_meas: { label: 'C meas', value: 'VTDfcap_c_meas' },
            delta_c_percent: { label: '△C cal', value: 'VTDfcap_delta_c_percent' },
            assessment: { label: 'Assessment', value: 'VTDfcap_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'VTDfcap_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'VTDfcap_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'VTDfcap_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'VTDfcap_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'VTDfcap_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'VTDfcap_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'VTDfcap_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'VTDfcap_cond_weather' }
            }},
            VTRatio: { label: 'VT Ratio', children: {
            name: { label: 'Name', value: 'VTRatio_name' },
            upr: { label: 'UPR', value: 'VTRatio_upr' },
            usr: { label: 'USR', value: 'VTRatio_usr' },
            ratio_meas: { label: 'Ratio meas', value: 'VTRatio_ratio_meas' },
            ratio_dev: { label: 'Ratio dev', value: 'VTRatio_ratio_dev' },
            polarity: { label: 'Polarity', value: 'VTRatio_polarity' },
            assessment: { label: 'Assessment', value: 'VTRatio_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'VTRatio_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'VTRatio_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'VTRatio_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'VTRatio_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'VTRatio_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'VTRatio_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'VTRatio_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'VTRatio_cond_weather' }
            }}
        }}
        }},
        Job_CurrentTransformerJobDto: { label: 'CT Job', children: {
        PropertiesDto: { label: 'Properties', children: {
            name:          { label: 'Job name',          value: 'job_name' },
            job_type:      { label: 'Job type',          value: 'job_type' },
            creation_date: { label: 'Creation date',     value: 'creation_date' },
            execution_date:{ label: 'Execution date',    value: 'execution_date' },
            tested_by:     { label: 'Tested by',         value: 'tested_by' },
            approved_by:   { label: 'Approved by',       value: 'approved_by' },
            approval_date: { label: 'Approval date',     value: 'approval_date' },
            test_method:   { label: 'Test method',       value: 'test_method' },
            ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
            summary:       { label: 'Summary',           value: 'summary' }
            } },
        TestingEquipment: { label: 'Testing equipment', children: {
            model:            { label: 'Model',            value: 'te_model' },
            serial_number:    { label: 'Serial number',    value: 'te_serial_number' },
            calibration_date: { label: 'Calibration date', value: 'te_calibration_date' }
        } },
        Tests: { label: 'Test results', children: {
            CTDfcap: { label: 'CT DF & CAP', children: {
            measurement: { label: 'Measurement', value: 'CTDfcap_measurement' },
            test_mode: { label: 'Test mode', value: 'CTDfcap_test_mode' },
            test_voltage: { label: 'Test voltage', value: 'CTDfcap_test_voltage' },
            df_ref: { label: 'DF ref', value: 'CTDfcap_df_ref' },
            c_ref: { label: 'C ref', value: 'CTDfcap_c_ref' },
            df_meas: { label: 'DF meas', value: 'CTDfcap_df_meas' },
            c_meas: { label: 'C meas', value: 'CTDfcap_c_meas' },
            delta_c_percent: { label: '△C cal', value: 'CTDfcap_delta_c_percent' },
            assessment: { label: 'Assessment', value: 'CTDfcap_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'CTDfcap_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'CTDfcap_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'CTDfcap_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'CTDfcap_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'CTDfcap_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'CTDfcap_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'CTDfcap_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'CTDfcap_cond_weather' }
            }},
            CTExcitation: { label: 'CT Excitation', children: {
            name: { label: 'Name', value: 'CTExcitation_name' },
            i_knee: { label: 'I knee', value: 'CTExcitation_i_knee' },
            v_knee: { label: 'V knee', value: 'CTExcitation_v_knee' },
            assessment: { label: 'Assessment', value: 'CTExcitation_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'CTExcitation_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'CTExcitation_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'CTExcitation_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'CTExcitation_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'CTExcitation_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'CTExcitation_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'CTExcitation_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'CTExcitation_cond_weather' }
            }},
            CTRatio: { label: 'CT ratio', children: {
            name: { label: 'Name', value: 'CTRatio_name' },
            ipr: { label: 'IPR', value: 'CTRatio_ipr' },
            isr: { label: 'ISR', value: 'CTRatio_isr' },
            ratio_meas: { label: 'Ratio meas', value: 'CTRatio_ratio_meas' },
            ratio_dev: { label: 'Ratio dev', value: 'CTRatio_ratio_dev' },
            polarity: { label: 'Polarity', value: 'CTRatio_polarity' },
            assessment: { label: 'Assessment', value: 'CTRatio_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'CTRatio_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'CTRatio_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'CTRatio_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'CTRatio_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'CTRatio_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'CTRatio_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'CTRatio_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'CTRatio_cond_weather' }
            }},
            CTWindingRes: { label: 'CT Winding resistance', children: {
            name: { label: 'Name', value: 'CTWindingRes_name' },
            r_meas: { label: 'R meas', value: 'CTWindingRes_r_meas' },
            r_ref: { label: 'R ref', value: 'CTWindingRes_r_ref' },
            r_corr: { label: 'R corr', value: 'CTWindingRes_r_corr' },
            r_dev: { label: 'R dev', value: 'CTWindingRes_r_dev' },
            assessment: { label: 'Assessment', value: 'CTWindingRes_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'CTWindingRes_condition_indicator' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'CTWindingRes_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'CTWindingRes_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'CTWindingRes_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'CTWindingRes_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'CTWindingRes_cond_weather' }
            }},
            GeneralInspection: { label: 'General inspection', children: {
            item: { label: 'Item', value: 'GeneralInspection_item' },
            assessment: { label: 'Assessment', value: 'GeneralInspection_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'GeneralInspection_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'GeneralInspection_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'GeneralInspection_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'GeneralInspection_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'GeneralInspection_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'GeneralInspection_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'GeneralInspection_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'GeneralInspection_cond_weather' }
            }},
            InsulationResistance: { label: 'Insulation resistance', children: {
            measurement: { label: 'Measurement', value: 'InsulationResistance_measurement' },
            test_voltage: { label: 'Test voltage', value: 'InsulationResistance_test_voltage' },
            r60s: { label: 'R60s', value: 'InsulationResistance_r60s' },
            assessment: { label: 'Assessment', value: 'InsulationResistance_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'InsulationResistance_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'InsulationResistance_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'InsulationResistance_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'InsulationResistance_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'InsulationResistance_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'InsulationResistance_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'InsulationResistance_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'InsulationResistance_cond_weather' }
            }}
        }}
        }},
        Job_CircuitBreakerJobDto: { label: 'Circuit Breaker Job', children: {
        PropertiesDto: { label: 'Properties', children: {
            name:          { label: 'Job name',          value: 'job_name' },
            job_type:      { label: 'Job type',          value: 'job_type' },
            creation_date: { label: 'Creation date',     value: 'creation_date' },
            execution_date:{ label: 'Execution date',    value: 'execution_date' },
            tested_by:     { label: 'Tested by',         value: 'tested_by' },
            approved_by:   { label: 'Approved by',       value: 'approved_by' },
            approval_date: { label: 'Approval date',     value: 'approval_date' },
            test_method:   { label: 'Test method',       value: 'test_method' },
            ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
            summary:       { label: 'Summary',           value: 'summary' }
            } },
        TestingEquipment: { label: 'Testing equipment', children: {
            model:            { label: 'Model',            value: 'te_model' },
            serial_number:    { label: 'Serial number',    value: 'te_serial_number' },
            calibration_date: { label: 'Calibration date', value: 'te_calibration_date' }
        } },
        Tests: { label: 'Test results', children: {
            COCOTiming: { label: 'CO-CO Timing', children: {
            phase: { label: 'Phase', value: 'COCOTiming_phase' },
            trip_coil: { label: 'Trip coil', value: 'COCOTiming_trip_coil' },
            interrupter: { label: 'Interrupter', value: 'COCOTiming_interrupter' },
            opening_time: { label: 'Opening time', value: 'COCOTiming_opening_time' },
            opening_sync_between_phase: { label: 'Opening sync. between phase (ms)', value: 'COCOTiming_opening_sync_between_phase' },
            assessment: { label: 'Assessment', value: 'COCOTiming_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'COCOTiming_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'COCOTiming_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'COCOTiming_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'COCOTiming_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'COCOTiming_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'COCOTiming_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'COCOTiming_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'COCOTiming_cond_weather' }
            }},
            COTiming: { label: 'CO Timing', children: {
            phase: { label: 'Phase', value: 'COTiming_phase' },
            closing_time: { label: 'Closing time', value: 'COTiming_closing_time' },
            interrupter: { label: 'Interrupter', value: 'COTiming_interrupter' },
            closing_sync_between_phase: { label: 'Closing sync. between phase (ms)', value: 'COTiming_closing_sync_between_phase' },
            closing_sync_between_interrupter: { label: 'Closing sync. between interrupter (ms)', value: 'COTiming_closing_sync_between_interrupter' },
            close_open_time: { label: 'Close-Open time', value: 'COTiming_close_open_time' },
            assessment: { label: 'Assessment', value: 'COTiming_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'COTiming_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'COTiming_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'COTiming_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'COTiming_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'COTiming_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'COTiming_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'COTiming_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'COTiming_cond_weather' }
            }},
            CTiming: { label: 'C Timing', children: {
            phase: { label: 'Phase', value: 'CTiming_phase' },
            closing_time: { label: 'Closing time', value: 'CTiming_closing_time' },
            interrupter: { label: 'Interrupter', value: 'CTiming_interrupter' },
            closing_sync_between_phase: { label: 'Closing sync. between phase (ms)', value: 'CTiming_closing_sync_between_phase' },
            closing_sync_between_interrupter: { label: 'Closing sync. between interrupter (ms)', value: 'CTiming_closing_sync_between_interrupter' },
            assessment: { label: 'Assessment', value: 'CTiming_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'CTiming_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'CTiming_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'CTiming_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'CTiming_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'CTiming_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'CTiming_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'CTiming_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'CTiming_cond_weather' }
            }},
            ContactResistance: { label: 'Contact Resistance', children: {
            phase: { label: 'Phase', value: 'ContactResistance_phase' },
            interrupter: { label: 'Interrupter', value: 'ContactResistance_interrupter' },
            i_test: { label: 'I test', value: 'ContactResistance_i_test' },
            contact_resistance: { label: 'Contact resistance', value: 'ContactResistance_contact_resistance' },
            assessment: { label: 'Assessment', value: 'ContactResistance_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'ContactResistance_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'ContactResistance_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'ContactResistance_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'ContactResistance_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'ContactResistance_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'ContactResistance_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'ContactResistance_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'ContactResistance_cond_weather' }
            }},
            DCWindingCloseCoil: { label: 'DC winding resistance of close coil', children: {
            close_coil_no: { label: 'Close Coil No', value: 'DCWindingCloseCoil_close_coil_no' },
            r_meas: { label: 'R meas', value: 'DCWindingCloseCoil_r_meas' },
            assessment: { label: 'Assessment', value: 'DCWindingCloseCoil_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'DCWindingCloseCoil_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'DCWindingCloseCoil_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'DCWindingCloseCoil_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'DCWindingCloseCoil_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'DCWindingCloseCoil_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'DCWindingCloseCoil_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'DCWindingCloseCoil_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'DCWindingCloseCoil_cond_weather' }
            }},
            DCWindingMotor: { label: 'DC winding resistance of motor', children: {
            r_meas: { label: 'R meas', value: 'DCWindingMotor_r_meas' },
            assessment: { label: 'Assessment', value: 'DCWindingMotor_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'DCWindingMotor_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'DCWindingMotor_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'DCWindingMotor_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'DCWindingMotor_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'DCWindingMotor_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'DCWindingMotor_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'DCWindingMotor_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'DCWindingMotor_cond_weather' }
            }},
            DCWindingTripCoil: { label: 'DC winding resistance of trip coil', children: {
            trip_coil_no: { label: 'Trip Coil No', value: 'DCWindingTripCoil_trip_coil_no' },
            r_meas: { label: 'R meas', value: 'DCWindingTripCoil_r_meas' },
            assessment: { label: 'Assessment', value: 'DCWindingTripCoil_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'DCWindingTripCoil_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'DCWindingTripCoil_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'DCWindingTripCoil_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'DCWindingTripCoil_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'DCWindingTripCoil_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'DCWindingTripCoil_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'DCWindingTripCoil_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'DCWindingTripCoil_cond_weather' }
            }},
            GeneralInspection: { label: 'General inspection', children: {
            item: { label: 'Item', value: 'GeneralInspection_item' },
            assessment: { label: 'Assessment', value: 'GeneralInspection_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'GeneralInspection_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'GeneralInspection_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'GeneralInspection_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'GeneralInspection_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'GeneralInspection_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'GeneralInspection_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'GeneralInspection_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'GeneralInspection_cond_weather' }
            }},
            InsulationResistanceCircuit: { label: 'Insulation resistance of circuit breaker', children: {
            measurement: { label: 'Measurement', value: 'InsulationResistanceCircuit_measurement' },
            test_voltage: { label: 'Test voltage', value: 'InsulationResistanceCircuit_test_voltage' },
            r60s: { label: 'R60s', value: 'InsulationResistanceCircuit_r60s' },
            assessment: { label: 'Assessment', value: 'InsulationResistanceCircuit_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'InsulationResistanceCircuit_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'InsulationResistanceCircuit_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'InsulationResistanceCircuit_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'InsulationResistanceCircuit_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'InsulationResistanceCircuit_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'InsulationResistanceCircuit_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'InsulationResistanceCircuit_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'InsulationResistanceCircuit_cond_weather' }
            }},
            InsulationResistanceCloseCoil: { label: 'Insulation resistance of close coil', children: {
            close_coil_no: { label: 'Close Coil No', value: 'InsulationResistanceCloseCoil_close_coil_no' },
            test_voltage: { label: 'Test voltage', value: 'InsulationResistanceCloseCoil_test_voltage' },
            r60s: { label: 'R60s', value: 'InsulationResistanceCloseCoil_r60s' },
            assessment: { label: 'Assessment', value: 'InsulationResistanceCloseCoil_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'InsulationResistanceCloseCoil_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'InsulationResistanceCloseCoil_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'InsulationResistanceCloseCoil_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'InsulationResistanceCloseCoil_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'InsulationResistanceCloseCoil_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'InsulationResistanceCloseCoil_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'InsulationResistanceCloseCoil_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'InsulationResistanceCloseCoil_cond_weather' }
            }},
            InsulationResistanceMotor: { label: 'Insulation resistance of motor', children: {
            test_voltage: { label: 'Test voltage', value: 'InsulationResistanceMotor_test_voltage' },
            r60s: { label: 'R60s', value: 'InsulationResistanceMotor_r60s' },
            assessment: { label: 'Assessment', value: 'InsulationResistanceMotor_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'InsulationResistanceMotor_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'InsulationResistanceMotor_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'InsulationResistanceMotor_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'InsulationResistanceMotor_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'InsulationResistanceMotor_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'InsulationResistanceMotor_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'InsulationResistanceMotor_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'InsulationResistanceMotor_cond_weather' }
            }},
            InsulationResistanceTripCoil: { label: 'Insulation resistance of trip coil', children: {
            trip_coil_no: { label: 'Trip Coil No', value: 'InsulationResistanceTripCoil_trip_coil_no' },
            test_voltage: { label: 'Test voltage', value: 'InsulationResistanceTripCoil_test_voltage' },
            r60s: { label: 'R60s', value: 'InsulationResistanceTripCoil_r60s' },
            assessment: { label: 'Assessment', value: 'InsulationResistanceTripCoil_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'InsulationResistanceTripCoil_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'InsulationResistanceTripCoil_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'InsulationResistanceTripCoil_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'InsulationResistanceTripCoil_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'InsulationResistanceTripCoil_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'InsulationResistanceTripCoil_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'InsulationResistanceTripCoil_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'InsulationResistanceTripCoil_cond_weather' }
            }},
            MinimumPickup: { label: 'Minimum pick up', children: {
            operation: { label: 'Operation', value: 'MinimumPickup_operation' },
            trip_coil_no: { label: 'Trip Coil No', value: 'MinimumPickup_trip_coil_no' },
            close_coil_no: { label: 'Close Coil No', value: 'MinimumPickup_close_coil_no' },
            v_pickup: { label: 'V pickup', value: 'MinimumPickup_v_pickup' },
            assessment: { label: 'Assessment', value: 'MinimumPickup_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'MinimumPickup_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'MinimumPickup_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'MinimumPickup_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'MinimumPickup_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'MinimumPickup_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'MinimumPickup_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'MinimumPickup_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'MinimumPickup_cond_weather' }
            }},
            MotorCurrent: { label: 'Motor current', children: {
            inrush_current: { label: 'Inrush current', value: 'MotorCurrent_inrush_current' },
            charging: { label: 'Charging', value: 'MotorCurrent_charging' },
            charging_current: { label: 'Charging current', value: 'MotorCurrent_charging_current' },
            mini_voltage: { label: 'Minimum voltage', value: 'MotorCurrent_mini_voltage' },
            assessment: { label: 'Assessment', value: 'MotorCurrent_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'MotorCurrent_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'MotorCurrent_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'MotorCurrent_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'MotorCurrent_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'MotorCurrent_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'MotorCurrent_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'MotorCurrent_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'MotorCurrent_cond_weather' }
            }},
            OCOCOTiming: { label: 'O-CO-CO Timing', children: {
            phase: { label: 'Phase', value: 'OCOCOTiming_phase' },
            trip_coil: { label: 'Trip coil', value: 'OCOCOTiming_trip_coil' },
            interrupter: { label: 'Interrupter', value: 'OCOCOTiming_interrupter' },
            opening_time: { label: 'Opening time', value: 'OCOCOTiming_opening_time' },
            opening_sync_between_phase: { label: 'Opening sync. between phase (ms)', value: 'OCOCOTiming_opening_sync_between_phase' },
            assessment: { label: 'Assessment', value: 'OCOCOTiming_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'OCOCOTiming_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'OCOCOTiming_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'OCOCOTiming_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'OCOCOTiming_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'OCOCOTiming_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'OCOCOTiming_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'OCOCOTiming_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'OCOCOTiming_cond_weather' }
            }},
            OCOTiming: { label: 'O-CO Timing', children: {
            phase: { label: 'Phase', value: 'OCOTiming_phase' },
            interrupter: { label: 'Interrupter', value: 'OCOTiming_interrupter' },
            opening_time: { label: 'Opening time', value: 'OCOTiming_opening_time' },
            opening_sync_between_phase: { label: 'Opening sync. between phase (ms)', value: 'OCOTiming_opening_sync_between_phase' },
            opening_sync_between_interrupter: { label: 'Opening sync. between interrupter (ms)', value: 'OCOTiming_opening_sync_between_interrupter' },
            closing_time: { label: 'Closing time', value: 'OCOTiming_closing_time' },
            closing_sync_between_phase: { label: 'Closing sync. between phase (ms)', value: 'OCOTiming_closing_sync_between_phase' },
            closing_sync_between_interrupter: { label: 'Closing sync. between interrupter (ms)', value: 'OCOTiming_closing_sync_between_interrupter' },
            open_close_time: { label: 'Open-Close time', value: 'OCOTiming_open_close_time' },
            assessment: { label: 'Assessment', value: 'OCOTiming_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'OCOTiming_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'OCOTiming_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'OCOTiming_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'OCOTiming_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'OCOTiming_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'OCOTiming_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'OCOTiming_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'OCOTiming_cond_weather' }
            }},
            OCTiming: { label: 'OC Timing', children: {
            phase: { label: 'Phase', value: 'OCTiming_phase' },
            opening_time: { label: 'Opening time', value: 'OCTiming_opening_time' },
            interrupter: { label: 'Interrupter', value: 'OCTiming_interrupter' },
            opening_sync_between_interrupter: { label: 'Opening sync. between interrupter (ms)', value: 'OCTiming_opening_sync_between_interrupter' },
            opening_sync_between_phase: { label: 'Opening sync. between phase (ms)', value: 'OCTiming_opening_sync_between_phase' },
            open_close_time: { label: 'Open-Close time', value: 'OCTiming_open_close_time' },
            assessment: { label: 'Assessment', value: 'OCTiming_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'OCTiming_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'OCTiming_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'OCTiming_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'OCTiming_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'OCTiming_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'OCTiming_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'OCTiming_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'OCTiming_cond_weather' }
            }},
            OTiming: { label: 'O Timing', children: {
            phase: { label: 'Phase', value: 'OTiming_phase' },
            opening_time: { label: 'Opening time', value: 'OTiming_opening_time' },
            interrupter: { label: 'Interrupter', value: 'OTiming_interrupter' },
            opening_sync_between_phase: { label: 'Opening sync. between phase (ms)', value: 'OTiming_opening_sync_between_phase' },
            opening_sync_between_interrupter: { label: 'Opening sync. between interrupter (ms)', value: 'OTiming_opening_sync_between_interrupter' },
            assessment: { label: 'Assessment', value: 'OTiming_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'OTiming_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'OTiming_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'OTiming_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'OTiming_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'OTiming_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'OTiming_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'OTiming_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'OTiming_cond_weather' }
            }},
            OverCurrentRelease: { label: 'Overcurrent release', children: {
            trip_coil_no: { label: 'Trip Coil No', value: 'OverCurrentRelease_trip_coil_no' },
            trip_current: { label: 'Trip current', value: 'OverCurrentRelease_trip_current' },
            assessment: { label: 'Assessment', value: 'OverCurrentRelease_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'OverCurrentRelease_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'OverCurrentRelease_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'OverCurrentRelease_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'OverCurrentRelease_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'OverCurrentRelease_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'OverCurrentRelease_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'OverCurrentRelease_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'OverCurrentRelease_cond_weather' }
            }},
            PressureGauge: { label: 'Pressure gauge', children: {
            sf6_pressure: { label: 'SF6 pressure', value: 'PressureGauge_sf6_pressure' },
            alarm: { label: 'Alarm', value: 'PressureGauge_alarm' },
            lockout: { label: 'Lockout', value: 'PressureGauge_lockout' },
            assessment: { label: 'Assessment', value: 'PressureGauge_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'PressureGauge_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'PressureGauge_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'PressureGauge_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'PressureGauge_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'PressureGauge_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'PressureGauge_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'PressureGauge_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'PressureGauge_cond_weather' }
            }},
            SF6GasAnalysis: { label: 'SF6 gas analysis', children: {
            decom_sf6: { label: 'Decomposition of SF6', value: 'SF6GasAnalysis_decom_sf6' },
            so2_sof2: { label: 'SO2 + SOF2', value: 'SF6GasAnalysis_so2_sof2' },
            hf: { label: 'HF', value: 'SF6GasAnalysis_hf' },
            assessment: { label: 'Assessment', value: 'SF6GasAnalysis_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'SF6GasAnalysis_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'SF6GasAnalysis_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'SF6GasAnalysis_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'SF6GasAnalysis_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'SF6GasAnalysis_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'SF6GasAnalysis_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'SF6GasAnalysis_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'SF6GasAnalysis_cond_weather' }
            }},
            SF6MoiturePurity: { label: 'SF6 gas moiture and purity', children: {
            moiture: { label: 'Moiture', value: 'SF6MoiturePurity_moiture' },
            purity: { label: 'Purity', value: 'SF6MoiturePurity_purity' },
            assessment: { label: 'Assessment', value: 'SF6MoiturePurity_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'SF6MoiturePurity_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'SF6MoiturePurity_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'SF6MoiturePurity_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'SF6MoiturePurity_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'SF6MoiturePurity_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'SF6MoiturePurity_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'SF6MoiturePurity_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'SF6MoiturePurity_cond_weather' }
            }},
            UnderVoltageRelease: { label: 'Under-voltage release', children: {
            trip_coil_no: { label: 'Trip Coil No', value: 'UnderVoltageRelease_trip_coil_no' },
            trip_voltage: { label: 'Trip voltage', value: 'UnderVoltageRelease_trip_voltage' },
            assessment: { label: 'Assessment', value: 'UnderVoltageRelease_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'UnderVoltageRelease_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'UnderVoltageRelease_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'UnderVoltageRelease_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'UnderVoltageRelease_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'UnderVoltageRelease_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'UnderVoltageRelease_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'UnderVoltageRelease_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'UnderVoltageRelease_cond_weather' }
            }}
        }}
        }},
        Job_PowerCableJobDto: { label: 'Power Cable Job', children: {
        PropertiesDto: { label: 'Properties', children: {
            name:          { label: 'Job name',          value: 'job_name' },
            job_type:      { label: 'Job type',          value: 'job_type' },
            creation_date: { label: 'Creation date',     value: 'creation_date' },
            execution_date:{ label: 'Execution date',    value: 'execution_date' },
            tested_by:     { label: 'Tested by',         value: 'tested_by' },
            approved_by:   { label: 'Approved by',       value: 'approved_by' },
            approval_date: { label: 'Approval date',     value: 'approval_date' },
            test_method:   { label: 'Test method',       value: 'test_method' },
            ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
            summary:       { label: 'Summary',           value: 'summary' }
            } },
        TestingEquipment: { label: 'Testing equipment', children: {
            model:            { label: 'Model',            value: 'te_model' },
            serial_number:    { label: 'Serial number',    value: 'te_serial_number' },
            calibration_date: { label: 'Calibration date', value: 'te_calibration_date' }
        } },
        Tests: { label: 'Test results', children: {
            AcVoltageInsulation: { label: 'AC voltage test of the insulation', children: {
            measurement: { label: 'Measurement', value: 'AcVoltageInsulation_measurement' },
            test_voltage: { label: 'Test voltage', value: 'AcVoltageInsulation_test_voltage' },
            frequency: { label: 'Frequency', value: 'AcVoltageInsulation_frequency' },
            duration: { label: 'Test duration', value: 'AcVoltageInsulation_duration' },
            assessment: { label: 'Assessment', value: 'AcVoltageInsulation_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'AcVoltageInsulation_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'AcVoltageInsulation_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'AcVoltageInsulation_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'AcVoltageInsulation_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'AcVoltageInsulation_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'AcVoltageInsulation_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'AcVoltageInsulation_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'AcVoltageInsulation_cond_weather' }
            }},
            DcVoltageInsulation: { label: 'DC voltage test of the insulation', children: {
            measurement: { label: 'Measurement', value: 'DcVoltageInsulation_measurement' },
            test_voltage: { label: 'Test voltage', value: 'DcVoltageInsulation_test_voltage' },
            leakage_current: { label: 'Leakage current', value: 'DcVoltageInsulation_leakage_current' },
            assessment: { label: 'Assessment', value: 'DcVoltageInsulation_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'DcVoltageInsulation_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'DcVoltageInsulation_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'DcVoltageInsulation_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'DcVoltageInsulation_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'DcVoltageInsulation_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'DcVoltageInsulation_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'DcVoltageInsulation_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'DcVoltageInsulation_cond_weather' }
            }},
            DcVoltageOverSheath: { label: 'DC voltage test of oversheath', children: {
            measurement: { label: 'Measurement', value: 'DcVoltageOverSheath_measurement' },
            test_voltage: { label: 'Test voltage', value: 'DcVoltageOverSheath_test_voltage' },
            duration: { label: 'Test duration', value: 'DcVoltageOverSheath_duration' },
            assessment: { label: 'Assessment', value: 'DcVoltageOverSheath_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'DcVoltageOverSheath_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'DcVoltageOverSheath_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'DcVoltageOverSheath_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'DcVoltageOverSheath_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'DcVoltageOverSheath_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'DcVoltageOverSheath_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'DcVoltageOverSheath_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'DcVoltageOverSheath_cond_weather' }
            }},
            GeneralInspection: { label: 'General inspection', children: {
            item: { label: 'Item', value: 'GeneralInspection_item' },
            assessment: { label: 'Assessment', value: 'GeneralInspection_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'GeneralInspection_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'GeneralInspection_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'GeneralInspection_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'GeneralInspection_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'GeneralInspection_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'GeneralInspection_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'GeneralInspection_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'GeneralInspection_cond_weather' }
            }},
            InsulationResistance: { label: 'Insulation Resistance', children: {
            measurement: { label: 'Measurement', value: 'InsulationResistance_measurement' },
            test_voltage: { label: 'Test voltage', value: 'InsulationResistance_test_voltage' },
            r_meas: { label: 'R meas', value: 'InsulationResistance_r_meas' },
            assessment: { label: 'Assessment', value: 'InsulationResistance_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'InsulationResistance_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'InsulationResistance_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'InsulationResistance_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'InsulationResistance_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'InsulationResistance_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'InsulationResistance_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'InsulationResistance_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'InsulationResistance_cond_weather' }
            }},
            ParticalDischarge: { label: 'Partial discharge measurement', children: {
            measurement: { label: 'Measurement', value: 'ParticalDischarge_measurement' },
            test_voltage: { label: 'Test voltage', value: 'ParticalDischarge_test_voltage' },
            r60s: { label: 'R60s', value: 'ParticalDischarge_r60s' },
            assessment: { label: 'Assessment', value: 'ParticalDischarge_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'ParticalDischarge_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'ParticalDischarge_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'ParticalDischarge_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'ParticalDischarge_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'ParticalDischarge_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'ParticalDischarge_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'ParticalDischarge_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'ParticalDischarge_cond_weather' }
            }},
            TandeltaPowerAcSource: { label: 'Tan delta measurement with power frequency AC source', children: {
            measurement: { label: 'Measurement', value: 'TandeltaPowerAcSource_measurement' },
            test_voltage: { label: 'Test voltage', value: 'TandeltaPowerAcSource_test_voltage' },
            frequency: { label: 'Frequency', value: 'TandeltaPowerAcSource_frequency' },
            duration: { label: 'Test duration', value: 'TandeltaPowerAcSource_duration' },
            tan_delta: { label: 'Tan delta [10⁻³]', value: 'TandeltaPowerAcSource_tan_delta' },
            assessment: { label: 'Assessment', value: 'TandeltaPowerAcSource_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'TandeltaPowerAcSource_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'TandeltaPowerAcSource_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'TandeltaPowerAcSource_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'TandeltaPowerAcSource_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'TandeltaPowerAcSource_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'TandeltaPowerAcSource_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'TandeltaPowerAcSource_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'TandeltaPowerAcSource_cond_weather' }
            }},
            TandeltaVlfSource: { label: 'Tan delta measurement with VLF source', children: {
            measurement: { label: 'Measurement', value: 'TandeltaVlfSource_measurement' },
            test_voltage: { label: 'Test voltage', value: 'TandeltaVlfSource_test_voltage' },
            ref_test_voltage: { label: 'Reference test voltage', value: 'TandeltaVlfSource_ref_test_voltage' },
            capacitance: { label: 'Capacitance', value: 'TandeltaVlfSource_capacitance' },
            mtd: { label: 'MTD', value: 'TandeltaVlfSource_mtd' },
            delta_td_each_step: { label: 'ΔTD [10⁻³] (each step)', value: 'TandeltaVlfSource_delta_td_each_step' },
            tan_delta_dtd: { label: 'DTD [10⁻³] (0.5 U₀ & 1.5 U₀)', value: 'TandeltaVlfSource_tan_delta_dtd' },
            tan_delta_tdts: { label: 'TDTS [10⁻³]', value: 'TandeltaVlfSource_tan_delta_tdts' },
            assessment: { label: 'Assessment', value: 'TandeltaVlfSource_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'TandeltaVlfSource_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'TandeltaVlfSource_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'TandeltaVlfSource_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'TandeltaVlfSource_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'TandeltaVlfSource_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'TandeltaVlfSource_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'TandeltaVlfSource_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'TandeltaVlfSource_cond_weather' }
            }},
            VlfTest: { label: 'VLF Test', children: {
            measurement: { label: 'Measurement', value: 'VlfTest_measurement' },
            test_voltage: { label: 'Test voltage', value: 'VlfTest_test_voltage' },
            leakage_current: { label: 'Leakage current', value: 'VlfTest_leakage_current' },
            assessment: { label: 'Assessment', value: 'VlfTest_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'VlfTest_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'VlfTest_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'VlfTest_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'VlfTest_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'VlfTest_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'VlfTest_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'VlfTest_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'VlfTest_cond_weather' }
            }}
        }}
        }},
        Job_SurgeArresterJobDto: { label: 'Surge Arrester Job', children: {
        PropertiesDto: { label: 'Properties', children: {
            name:          { label: 'Job name',          value: 'job_name' },
            job_type:      { label: 'Job type',          value: 'job_type' },
            creation_date: { label: 'Creation date',     value: 'creation_date' },
            execution_date:{ label: 'Execution date',    value: 'execution_date' },
            tested_by:     { label: 'Tested by',         value: 'tested_by' },
            approved_by:   { label: 'Approved by',       value: 'approved_by' },
            approval_date: { label: 'Approval date',     value: 'approval_date' },
            test_method:   { label: 'Test method',       value: 'test_method' },
            ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
            summary:       { label: 'Summary',           value: 'summary' }
            } },
        TestingEquipment: { label: 'Testing equipment', children: {
            model:            { label: 'Model',            value: 'te_model' },
            serial_number:    { label: 'Serial number',    value: 'te_serial_number' },
            calibration_date: { label: 'Calibration date', value: 'te_calibration_date' }
        } },
        Tests: { label: 'Test results', children: {
            GeneralInspection: { label: 'General inspection', children: {
            item: { label: 'Item', value: 'GeneralInspection_item' },
            assessment: { label: 'Assessment', value: 'GeneralInspection_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'GeneralInspection_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'GeneralInspection_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'GeneralInspection_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'GeneralInspection_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'GeneralInspection_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'GeneralInspection_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'GeneralInspection_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'GeneralInspection_cond_weather' }
            }},
            InsulationResistance: { label: 'Insulation resistance', children: {
            measurement: { label: 'Measurement', value: 'InsulationResistance_measurement' },
            test_voltage: { label: 'Test voltage', value: 'InsulationResistance_test_voltage' },
            r60s: { label: 'R60s', value: 'InsulationResistance_r60s' },
            assessment: { label: 'Assessment', value: 'InsulationResistance_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'InsulationResistance_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'InsulationResistance_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'InsulationResistance_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'InsulationResistance_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'InsulationResistance_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'InsulationResistance_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'InsulationResistance_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'InsulationResistance_cond_weather' }
            }},
            LeakageCurrent: { label: 'Leakage current at continuous operating voltage', children: {
            phase: { label: 'Phase', value: 'LeakageCurrent_phase' },
            unit_no: { label: 'Unit number', value: 'LeakageCurrent_unit_no' },
            test_voltage: { label: 'Test voltage', value: 'LeakageCurrent_test_voltage' },
            i_meas: { label: 'I measurement', value: 'LeakageCurrent_i_meas' },
            assessment: { label: 'Assessment', value: 'LeakageCurrent_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'LeakageCurrent_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'LeakageCurrent_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'LeakageCurrent_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'LeakageCurrent_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'LeakageCurrent_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'LeakageCurrent_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'LeakageCurrent_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'LeakageCurrent_cond_weather' }
            }},
            PowerFrequency: { label: 'Power frequency voltage at reference current', children: {
            phase: { label: 'Phase', value: 'PowerFrequency_phase' },
            unit_no: { label: 'Unit number', value: 'PowerFrequency_unit_no' },
            ref_current: { label: 'Reference current', value: 'PowerFrequency_ref_current' },
            v_meas: { label: 'V measurement', value: 'PowerFrequency_v_meas' },
            assessment: { label: 'Assessment', value: 'PowerFrequency_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'PowerFrequency_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'PowerFrequency_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'PowerFrequency_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'PowerFrequency_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'PowerFrequency_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'PowerFrequency_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'PowerFrequency_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'PowerFrequency_cond_weather' }
            }}
        }}
        }},
        Job_ReactorJobDto: { label: 'Reactor Job', children: {
        PropertiesDto: { label: 'Properties', children: {
            name:          { label: 'Job name',          value: 'job_name' },
            job_type:      { label: 'Job type',          value: 'job_type' },
            creation_date: { label: 'Creation date',     value: 'creation_date' },
            execution_date:{ label: 'Execution date',    value: 'execution_date' },
            tested_by:     { label: 'Tested by',         value: 'tested_by' },
            approved_by:   { label: 'Approved by',       value: 'approved_by' },
            approval_date: { label: 'Approval date',     value: 'approval_date' },
            test_method:   { label: 'Test method',       value: 'test_method' },
            ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
            summary:       { label: 'Summary',           value: 'summary' }
            } },
        TestingEquipment: { label: 'Testing equipment', children: {
            model:            { label: 'Model',            value: 'te_model' },
            serial_number:    { label: 'Serial number',    value: 'te_serial_number' },
            calibration_date: { label: 'Calibration date', value: 'te_calibration_date' }
        } }
        }},
        Job_CapacitorJobDto: { label: 'Capacitor Job', children: {
        PropertiesDto: { label: 'Properties', children: {
            name:          { label: 'Job name',          value: 'job_name' },
            job_type:      { label: 'Job type',          value: 'job_type' },
            creation_date: { label: 'Creation date',     value: 'creation_date' },
            execution_date:{ label: 'Execution date',    value: 'execution_date' },
            tested_by:     { label: 'Tested by',         value: 'tested_by' },
            approved_by:   { label: 'Approved by',       value: 'approved_by' },
            approval_date: { label: 'Approval date',     value: 'approval_date' },
            test_method:   { label: 'Test method',       value: 'test_method' },
            ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
            summary:       { label: 'Summary',           value: 'summary' }
            } },
        TestingEquipment: { label: 'Testing equipment', children: {
            model:            { label: 'Model',            value: 'te_model' },
            serial_number:    { label: 'Serial number',    value: 'te_serial_number' },
            calibration_date: { label: 'Calibration date', value: 'te_calibration_date' }
        } }
        }},
        Job_DisconnectorJobDto: { label: 'Disconnector Job', children: {
        PropertiesDto: { label: 'Properties', children: {
            name:          { label: 'Job name',          value: 'job_name' },
            job_type:      { label: 'Job type',          value: 'job_type' },
            creation_date: { label: 'Creation date',     value: 'creation_date' },
            execution_date:{ label: 'Execution date',    value: 'execution_date' },
            tested_by:     { label: 'Tested by',         value: 'tested_by' },
            approved_by:   { label: 'Approved by',       value: 'approved_by' },
            approval_date: { label: 'Approval date',     value: 'approval_date' },
            test_method:   { label: 'Test method',       value: 'test_method' },
            ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
            summary:       { label: 'Summary',           value: 'summary' }
            } },
        TestingEquipment: { label: 'Testing equipment', children: {
            model:            { label: 'Model',            value: 'te_model' },
            serial_number:    { label: 'Serial number',    value: 'te_serial_number' },
            calibration_date: { label: 'Calibration date', value: 'te_calibration_date' }
        } },
        Tests: { label: 'Test results', children: {
            ContactResistance: { label: 'Contact resistance', children: {
            measurement: { label: 'Measurement', value: 'ContactResistance_measurement' },
            i_test: { label: 'I test', value: 'ContactResistance_i_test' },
            contact_resistance: { label: 'Contact resistance', value: 'ContactResistance_contact_resistance' },
            assessment: { label: 'Assessment', value: 'ContactResistance_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'ContactResistance_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'ContactResistance_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'ContactResistance_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'ContactResistance_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'ContactResistance_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'ContactResistance_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'ContactResistance_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'ContactResistance_cond_weather' }
            }},
            ControlCheck: { label: 'Control cabinet check', children: {
            item: { label: 'Item', value: 'ControlCheck_item' },
            assessment: { label: 'Assessment', value: 'ControlCheck_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'ControlCheck_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'ControlCheck_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'ControlCheck_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'ControlCheck_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'ControlCheck_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'ControlCheck_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'ControlCheck_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'ControlCheck_cond_weather' }
            }},
            DcWindingMotor: { label: 'DC winding resistance of motor', children: {
            r_meas: { label: 'R meas', value: 'DcWindingMotor_r_meas' },
            assessment: { label: 'Assessment', value: 'DcWindingMotor_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'DcWindingMotor_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'DcWindingMotor_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'DcWindingMotor_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'DcWindingMotor_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'DcWindingMotor_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'DcWindingMotor_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'DcWindingMotor_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'DcWindingMotor_cond_weather' }
            }},
            GeneralInspection: { label: 'General inspection', children: {
            item: { label: 'Item', value: 'GeneralInspection_item' },
            assessment: { label: 'Assessment', value: 'GeneralInspection_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'GeneralInspection_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'GeneralInspection_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'GeneralInspection_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'GeneralInspection_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'GeneralInspection_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'GeneralInspection_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'GeneralInspection_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'GeneralInspection_cond_weather' }
            }},
            InsulationResMotor: { label: 'Insulation resistance of motor', children: {
            test_voltage: { label: 'Test voltage', value: 'InsulationResMotor_test_voltage' },
            r60s: { label: 'R60s', value: 'InsulationResMotor_r60s' },
            assessment: { label: 'Assessment', value: 'InsulationResMotor_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'InsulationResMotor_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'InsulationResMotor_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'InsulationResMotor_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'InsulationResMotor_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'InsulationResMotor_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'InsulationResMotor_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'InsulationResMotor_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'InsulationResMotor_cond_weather' }
            }},
            InsulationResistance: { label: 'Insulation resistance', children: {
            measurement: { label: 'Measurement', value: 'InsulationResistance_measurement' },
            test_voltage: { label: 'Test voltage', value: 'InsulationResistance_test_voltage' },
            r60s: { label: 'R60s', value: 'InsulationResistance_r60s' },
            assessment: { label: 'Assessment', value: 'InsulationResistance_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'InsulationResistance_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'InsulationResistance_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'InsulationResistance_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'InsulationResistance_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'InsulationResistance_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'InsulationResistance_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'InsulationResistance_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'InsulationResistance_cond_weather' }
            }},
            OperatingTest: { label: 'Operating test', children: {
            measurement: { label: 'Measurement', value: 'OperatingTest_measurement' },
            working_time: { label: 'Working time', value: 'OperatingTest_working_time' },
            assessment: { label: 'Assessment', value: 'OperatingTest_assessment' },
            condition_indicator: { label: 'Condition indicator', value: 'OperatingTest_condition_indicator' },
            cond_top_oil_temp: { label: 'Top oil temperature (cond.)', value: 'OperatingTest_cond_top_oil_temp' },
            cond_bottom_oil_temp: { label: 'Bottom oil temperature (cond.)', value: 'OperatingTest_cond_bottom_oil_temp' },
            cond_winding_temp: { label: 'Winding temperature (cond.)', value: 'OperatingTest_cond_winding_temp' },
            cond_reference_temp: { label: 'Reference temperature (cond.)', value: 'OperatingTest_cond_reference_temp' },
            cond_ambient_temp: { label: 'Ambient temperature (cond.)', value: 'OperatingTest_cond_ambient_temp' },
            cond_humidity: { label: 'Humidity (cond.)', value: 'OperatingTest_cond_humidity' },
            cond_weather: { label: 'Weather (cond.)', value: 'OperatingTest_cond_weather' }
            }}
        }}
        }},
        Job_RotatingMachineJobDto: { label: 'Rotating Machine Job', children: {
        PropertiesDto: { label: 'Properties', children: {
            name:          { label: 'Job name',          value: 'job_name' },
            job_type:      { label: 'Job type',          value: 'job_type' },
            creation_date: { label: 'Creation date',     value: 'creation_date' },
            execution_date:{ label: 'Execution date',    value: 'execution_date' },
            tested_by:     { label: 'Tested by',         value: 'tested_by' },
            approved_by:   { label: 'Approved by',       value: 'approved_by' },
            approval_date: { label: 'Approval date',     value: 'approval_date' },
            test_method:   { label: 'Test method',       value: 'test_method' },
            ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
            summary:       { label: 'Summary',           value: 'summary' }
            } },
        TestingEquipment: { label: 'Testing equipment', children: {
            model:            { label: 'Model',            value: 'te_model' },
            serial_number:    { label: 'Serial number',    value: 'te_serial_number' },
            calibration_date: { label: 'Calibration date', value: 'te_calibration_date' }
        } },
        }},
        Job_BushingJobDto: { label: 'Bushing Job', children: {
        PropertiesDto: { label: 'Properties', children: {
            name:          { label: 'Job name',          value: 'job_name' },
            job_type:      { label: 'Job type',          value: 'job_type' },
            creation_date: { label: 'Creation date',     value: 'creation_date' },
            execution_date:{ label: 'Execution date',    value: 'execution_date' },
            tested_by:     { label: 'Tested by',         value: 'tested_by' },
            approved_by:   { label: 'Approved by',       value: 'approved_by' },
            approval_date: { label: 'Approval date',     value: 'approval_date' },
            test_method:   { label: 'Test method',       value: 'test_method' },
            ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
            summary:       { label: 'Summary',           value: 'summary' }
            } },
        TestingEquipment: { label: 'Testing equipment', children: {
            model:            { label: 'Model',            value: 'te_model' },
            serial_number:    { label: 'Serial number',    value: 'te_serial_number' },
            calibration_date: { label: 'Calibration date', value: 'te_calibration_date' }
        } }
        }}
    }}
}

export const ASSET_TYPE_TO_KEY = {
    'Transformer': 'Asset_TransformerDataDto',
    'Voltage transformer': 'Asset_VoltageTransformerDto',
    'Current transformer': 'Asset_CurrentTransformerDto',
    'Circuit breaker': 'Asset_CircuitBreakerDto',
    'Power cable': 'Asset_PowerCableDTO',
    'Surge arrester': 'Asset_SurgeArresterDto',
    'Reactor': 'Asset_ReactorDto',
    'Bushing': 'Asset_BushingAssetDto',
    'Capacitor': 'Asset_CapacitorsDTO',
    'Disconnector': 'Asset_DisconnectorDTO',
    'Rotating machine': 'Asset_RotatingMachineDTO',
}

export const CATEGORY_OPTION = [
    { label: 'Organisation',  value: 'OrgEntityToOrgDto' },
    { label: 'Substation',    value: 'SubstationDto' },
    { label: 'Voltage level', value: 'VoltageLevelDto' },
    { label: 'Bay',           value: 'Bay' },
    { label: 'Asset',         value: 'Asset' },
    { label: 'Job',           value: 'Job' }
]

// Category riêng cho màn Testing equipment (import/export template tách biệt,
// KHÔNG xuất hiện trong Import/Export cũ)
export const TE_CATEGORY_OPTION = [
    { label: 'Testing equipment', value: 'TestingEquipmentDto' }
]
