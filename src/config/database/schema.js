export const INIT_SCHEMA =`
CREATE TABLE IF NOT EXISTS "acceptance_test" (
	"mrid"	TEXT NOT NULL,
	"date_time"	TEXT,
	"success"	TEXT,
	"type"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "active_power" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "activity_record" (
	"mrid"	TEXT NOT NULL,
	"status"	TEXT,
	"created_date_time"	TEXT,
	"reason"	TEXT,
	"severity"	TEXT,
	"type"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("status") REFERENCES "status"("mrid")
);
CREATE TABLE IF NOT EXISTS "analog" (
	"mrid"	TEXT NOT NULL,
	"max_value"	REAL,
	"min_value"	REAL,
	"normal_value"	REAL,
	"positive_flow_in"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "measurement"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "analog_value" (
	"mrid"	TEXT NOT NULL,
	"value"	REAL,
	"analog"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("analog") REFERENCES "analog"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "measurement_value"("mrid")
);
CREATE TABLE IF NOT EXISTS "angle_degrees" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "app_settings" (
	"key"	TEXT NOT NULL,
	"value"	TEXT,
	PRIMARY KEY("key")
);
CREATE TABLE IF NOT EXISTS "apparent_power" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	REAL,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "approver" (
	"mrid"	TEXT NOT NULL,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "document_person_role"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "area" (
	"mrid"	TEXT NOT NULL,
	"value"	REAL,
	"unit"	TEXT,
	"multiplier"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "assessment_limit_breaker_info" (
	"mrid"	TEXT NOT NULL,
	"breaker_info_id"	TEXT,
	"limit_type"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("breaker_info_id") REFERENCES "breaker_info"("mrid")
);
CREATE TABLE IF NOT EXISTS "asset" (
	"mrid"	TEXT NOT NULL,
	"acceptance_test"	TEXT,
	"critical"	TEXT,
	"electronic_address"	TEXT,
	"initial_condition"	TEXT,
	"initial_loss_of_life"	TEXT,
	"in_use_date"	TEXT,
	"kind"	TEXT,
	"lifecycle_date"	TEXT,
	"lifecycle_state"	TEXT,
	"lot_number"	TEXT,
	"position"	TEXT,
	"retired_reason"	TEXT,
	"serial_number"	TEXT,
	"status"	TEXT,
	"type"	TEXT,
	"utc_number"	TEXT,
	"asset_info"	TEXT,
	"product_asset_model"	TEXT,
	"location"	TEXT,
	"country_of_origin"	TEXT,
	"in_use_state"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("acceptance_test") REFERENCES "acceptance_test"("mrid"),
	FOREIGN KEY("asset_info") REFERENCES "asset_info"("mrid"),
	FOREIGN KEY("electronic_address") REFERENCES "electronic_address"("mrid"),
	FOREIGN KEY("in_use_date") REFERENCES "in_use_date"("mrid"),
	FOREIGN KEY("initial_loss_of_life") REFERENCES "percent"("mrid"),
	FOREIGN KEY("lifecycle_date") REFERENCES "lifecycle_date"("mrid"),
	FOREIGN KEY("location") REFERENCES "location"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("product_asset_model") REFERENCES "product_asset_model"("mrid"),
	FOREIGN KEY("status") REFERENCES "status"("mrid")
);
CREATE TABLE IF NOT EXISTS "asset_analog" (
	"mrid"	TEXT NOT NULL,
	"detection_limit"	REAL,
	"precision"	REAL,
	"reporting_temperature"	TEXT,
	"test_standard"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "analog"("mrid") on delete cascade,
	FOREIGN KEY("reporting_temperature") REFERENCES "temperature"("mrid"),
	FOREIGN KEY("test_standard") REFERENCES "test_standard"("mrid")
);
CREATE TABLE IF NOT EXISTS "asset_discrete" (
	"mrid"	TEXT NOT NULL,
	"test_standard"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "discrete"("mrid") on delete cascade,
	FOREIGN KEY("test_standard") REFERENCES "test_standard"("mrid")
);
CREATE TABLE IF NOT EXISTS "asset_info" (
	"mrid"	TEXT NOT NULL,
	"product_asset_model"	TEXT,
	"manufacturer_type"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("product_asset_model") REFERENCES "product_asset_model"("mrid")
);
CREATE TABLE IF NOT EXISTS "asset_procedure" (
	"mrid"	TEXT NOT NULL,
	"procedure_id"	TEXT,
	"asset_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("asset_id") REFERENCES "asset"("mrid"),
	FOREIGN KEY("procedure_id") REFERENCES "procedure"("mrid")
);
CREATE TABLE IF NOT EXISTS "asset_psr" (
	"mrid"	TEXT NOT NULL,
	"psr_id"	TEXT,
	"asset_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("asset_id") REFERENCES "asset"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("psr_id") REFERENCES "power_system_resource"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "asset_string_measurement" (
	"mrid"	TEXT NOT NULL,
	"kind"	TEXT,
	"test_standard"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "string_measurement"("mrid") on delete cascade,
	FOREIGN KEY("test_standard") REFERENCES "test_standard"("mrid")
);
CREATE TABLE IF NOT EXISTS "asset_work_task" (
	"mrid"	TEXT NOT NULL,
	"asset_id"	TEXT,
	"work_task_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("asset_id") REFERENCES "asset"("mrid"),
	FOREIGN KEY("work_task_id") REFERENCES "work_task"("mrid")
);
CREATE TABLE IF NOT EXISTS "assets" (
	"id"	TEXT NOT NULL,
	"location_id"	TEXT NOT NULL,
	"asset"	TEXT,
	"asset_type"	TEXT,
	"serial_no"	TEXT,
	"manufacturer"	TEXT,
	"manufacturer_type"	TEXT,
	"manufacturing_year"	TEXT,
	"asset_system_code"	TEXT,
	"apparatus_id"	TEXT,
	"feeder"	TEXT,
	"date_of_warehouse_receipt"	TEXT,
	"date_of_delivery"	TEXT,
	"date_of_production_order"	TEXT,
	"comment"	TEXT,
	"phases"	TEXT,
	"vector_group"	TEXT,
	"vector_group_custom"	TEXT,
	"unsupported_vector_group"	TEXT,
	"rated_frequency"	TEXT,
	"voltage_ratings"	TEXT,
	"voltage_regulation"	TEXT,
	"power_ratings"	TEXT,
	"current_ratings"	TEXT,
	"max_short_circuit_current_ka"	TEXT,
	"max_short_circuit_current_s"	TEXT,
	"ref_temp"	TEXT,
	"prim_sec"	TEXT,
	"prim_tert"	TEXT,
	"sec_tert"	TEXT,
	"base_power"	TEXT,
	"base_voltage"	TEXT,
	"zero_percent"	TEXT,
	"category"	TEXT,
	"status"	TEXT,
	"tank_type"	TEXT,
	"insulation_medium"	TEXT,
	"insulation_weight"	TEXT,
	"insulation_volume"	TEXT,
	"total_weight"	TEXT,
	"winding"	TEXT,
	"date_of_warehouse_delivery"	TEXT,
	"progress"	TEXT,
	"standard"	TEXT,
	"oil_type"	TEXT,
	"thermal_meter"	TEXT,
	"extend"	TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY("location_id") REFERENCES "locations"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "astm_standard" (
	"mrid"	TEXT NOT NULL,
	"standard_edition"	TEXT,
	"standard_number"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "attachment" (
	"path"	TEXT,
	"name"	TEXT,
	"type"	TEXT,
	"id"	TEXT NOT NULL,
	"id_foreign"	TEXT NOT NULL,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "auxiliary_contacts_breaker_info" (
	"mrid"	TEXT NOT NULL,
	"assessment_limit_breaker_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("assessment_limit_breaker_info_id") REFERENCES "assessment_limit_breaker_info"("mrid")
);
CREATE TABLE IF NOT EXISTS "base_power" (
	"mrid"	TEXT NOT NULL,
	"base_power"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("base_power") REFERENCES "apparent_power"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "base_voltage" (
	"nominal_voltage"	TEXT,
	"mrid"	TEXT NOT NULL,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("nominal_voltage") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "base_work" (
	"mrid"	TEXT NOT NULL,
	"kind"	TEXT,
	"priority"	TEXT,
	"status_kind"	TEXT,
	"work_location"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "document"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("priority") REFERENCES "priority"("mrid")
);
CREATE TABLE IF NOT EXISTS "bay" (
	"mrid"	TEXT NOT NULL,
	"bay_energy_meas_flag"	TEXT,
	"bay_power_meas_flag"	TEXT,
	"breaker_configuration"	TEXT,
	"bus_bar_configuration"	TEXT,
	"substation"	TEXT,
	"voltage_level"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "equipment_container"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("substation") REFERENCES "substation"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("voltage_level") REFERENCES "voltage_level"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "breaker_contact_system_info" (
	"mrid"	TEXT NOT NULL,
	"breaker_info_id"	TEXT,
	"nominal_total_travel"	TEXT,
	"damping_time"	TEXT,
	"nozzle_length"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("breaker_info_id") REFERENCES "breaker_info"("mrid"),
	FOREIGN KEY("damping_time") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("nominal_total_travel") REFERENCES "length"("mrid"),
	FOREIGN KEY("nozzle_length") REFERENCES "length"("mrid")
);
CREATE TABLE IF NOT EXISTS "breaker_info" (
	"mrid"	TEXT NOT NULL,
	"phase_trip"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "old_switch_info"("mrid") on delete cascade,
	FOREIGN KEY("phase_trip") REFERENCES "current_flow"("mrid")
);
CREATE TABLE IF NOT EXISTS "breaker_other_info" (
	"mrid"	TEXT NOT NULL,
	"breaker_info_id"	TEXT,
	"total_weight_with_gas"	TEXT,
	"weight_of_gas"	TEXT,
	"rated_gas_pressure"	TEXT,
	"rated_gas_temperature"	TEXT,
	"volume_of_gas"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("breaker_info_id") REFERENCES "breaker_info"("mrid"),
	FOREIGN KEY("rated_gas_pressure") REFERENCES "pressure"("mrid"),
	FOREIGN KEY("rated_gas_temperature") REFERENCES "temperature"("mrid"),
	FOREIGN KEY("total_weight_with_gas") REFERENCES "mass"("mrid"),
	FOREIGN KEY("volume_of_gas") REFERENCES "volume"("mrid"),
	FOREIGN KEY("weight_of_gas") REFERENCES "mass"("mrid")
);
CREATE TABLE IF NOT EXISTS "breaker_rating_info" (
	"mrid"	TEXT NOT NULL,
	"breaker_info_id"	TEXT,
	"rated_short_circuit_breaking_current"	TEXT,
	"short_circuit_nominal_duration"	TEXT,
	"rated_insulation_level"	TEXT,
	"interrupting_duty_cycle"	TEXT,
	"rated_power_closing"	TEXT,
	"rated_power_opening"	TEXT,
	"rated_power_motor_charge"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("breaker_info_id") REFERENCES "breaker_info"("mrid"),
	FOREIGN KEY("rated_insulation_level") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("rated_power_closing") REFERENCES "active_power"("mrid"),
	FOREIGN KEY("rated_power_motor_charge") REFERENCES "active_power"("mrid"),
	FOREIGN KEY("rated_power_opening") REFERENCES "active_power"("mrid"),
	FOREIGN KEY("rated_short_circuit_breaking_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("short_circuit_nominal_duration") REFERENCES "seconds"("mrid")
);
CREATE TABLE IF NOT EXISTS "bushing" (
	"mrid"	TEXT NOT NULL,
	"terminal"	TEXT,
	"moving_contact"	TEXT,
	"fixed_contact"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("fixed_contact") REFERENCES "interrupter_unit"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "bushing_info" (
	"mrid"	TEXT NOT NULL,
	"c_capacitance"	TEXT,
	"c_power_factor"	TEXT,
	"insulation_kind"	TEXT,
	"rated_current"	TEXT,
	"rated_impulse_withstand_voltage"	TEXT,
	"rated_line_to_ground_voltage"	TEXT,
	"rated_voltage"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("c_capacitance") REFERENCES "capacitance"("mrid"),
	FOREIGN KEY("c_power_factor") REFERENCES "percent"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset_info"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("rated_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("rated_impulse_withstand_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("rated_line_to_ground_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("rated_voltage") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "bushing_testing_equipment_test_type" (
	"mrid"	TEXT NOT NULL,
	"testing_equipment_id"	TEXT,
	"test_type_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("test_type_id") REFERENCES "procedure"("mrid"),
	FOREIGN KEY("testing_equipment_id") REFERENCES "testing_equipment"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "cable_info" (
	"mrid"	TEXT NOT NULL,
	"construction_kind"	TEXT,
	"diameter_over_core"	TEXT,
	"diameter_over_insulation"	TEXT,
	"diameter_over_jacket"	TEXT,
	"diameter_over_screen"	TEXT,
	"is_strand_fill"	TEXT,
	"nominal_temperature"	TEXT,
	"outer_jacket_kind"	TEXT,
	"sheath_as_neutral"	TEXT,
	"shield_material"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("diameter_over_core") REFERENCES "length"("mrid"),
	FOREIGN KEY("diameter_over_insulation") REFERENCES "length"("mrid"),
	FOREIGN KEY("diameter_over_jacket") REFERENCES "length"("mrid"),
	FOREIGN KEY("diameter_over_screen") REFERENCES "length"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "wire_info"("mrid") on delete cascade,
	FOREIGN KEY("nominal_temperature") REFERENCES "temperature"("mrid")
);
CREATE TABLE IF NOT EXISTS "capacitance" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "capacitance_capacitor_info" (
	"mrid"	TEXT NOT NULL,
	"phase"	TEXT,
	"value"	TEXT,
	"capacitor_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("capacitor_info_id") REFERENCES "capacitor_info"("mrid"),
	FOREIGN KEY("value") REFERENCES "capacitance"("mrid")
);
CREATE TABLE IF NOT EXISTS "capacitor_info" (
	"mrid"	TEXT NOT NULL,
	"phase_number"	INTEGER,
	"phase_name"	TEXT,
	"rated_voltage"	TEXT,
	"rated_current"	TEXT,
	"rated_frequency"	TEXT,
	"rated_power"	TEXT,
	"insulation_type"	TEXT,
	"weight"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset_info"("mrid") on delete cascade,
	FOREIGN KEY("rated_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("rated_frequency") REFERENCES "frequency"("mrid"),
	FOREIGN KEY("rated_power") REFERENCES "reactive_power"("mrid"),
	FOREIGN KEY("rated_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("weight") REFERENCES "mass"("mrid")
);
CREATE TABLE IF NOT EXISTS "capacitor_test_type" (
	"mrid"	TEXT NOT NULL,
	"code"	TEXT,
	"name"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "capacitor_testing_equipment_test_type" (
	"mrid"	TEXT NOT NULL,
	"testing_equipment_id"	TEXT,
	"test_type_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("test_type_id") REFERENCES "procedure"("mrid"),
	FOREIGN KEY("testing_equipment_id") REFERENCES "testing_equipment"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "cigre_standard" (
	"mrid"	TEXT NOT NULL,
	"standard_edition"	TEXT,
	"standard_number"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "circuit_breaker_testing_equipment_test_type" (
	"mrid"	TEXT NOT NULL,
	"testing_equipment_id"	TEXT,
	"test_type_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("test_type_id") REFERENCES "procedure"("mrid"),
	FOREIGN KEY("testing_equipment_id") REFERENCES "testing_equipment"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "close_operation" (
	"mrid"	TEXT NOT NULL,
	"parameter_name"	TEXT,
	"t_min"	TEXT,
	"t_max"	TEXT,
	"t_ref"	TEXT,
	"t_dev"	TEXT,
	"auxiliary_contacts_breaker_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("auxiliary_contacts_breaker_info_id") REFERENCES "auxiliary_contacts_breaker_info"("mrid"),
	FOREIGN KEY("t_dev") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("t_max") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("t_min") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("t_ref") REFERENCES "seconds"("mrid")
);
CREATE TABLE IF NOT EXISTS "coil_characteristics_breaker_info" (
	"mrid"	TEXT NOT NULL,
	"assessment_limit_breaker_info_id"	TEXT,
	"min"	TEXT,
	"max"	TEXT,
	"ref"	TEXT,
	"dev_negative"	TEXT,
	"dev_positive"	TEXT,
	"parameter_name"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("assessment_limit_breaker_info_id") REFERENCES "assessment_limit_breaker_info"("mrid"),
	FOREIGN KEY("dev_negative") REFERENCES "quantity_value"("mrid"),
	FOREIGN KEY("dev_positive") REFERENCES "quantity_value"("mrid"),
	FOREIGN KEY("max") REFERENCES "quantity_value"("mrid"),
	FOREIGN KEY("min") REFERENCES "quantity_value"("mrid"),
	FOREIGN KEY("ref") REFERENCES "quantity_value"("mrid")
);
CREATE TABLE IF NOT EXISTS "concentric_neutral_cable_info" (
	"mrid"	TEXT NOT NULL,
	"diameter_over_neutral"	TEXT,
	"neutral_strand_count"	INTEGER,
	"neutral_strand_gmr"	TEXT,
	"neutral_strand_radius"	TEXT,
	"neutral_strand_rdc"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("diameter_over_neutral") REFERENCES "length"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "cable_info"("mrid") on delete cascade,
	FOREIGN KEY("neutral_strand_gmr") REFERENCES "length"("mrid"),
	FOREIGN KEY("neutral_strand_radius") REFERENCES "length"("mrid")
);
CREATE TABLE IF NOT EXISTS "conducting_equipment" (
	"mrid"	TEXT NOT NULL,
	"base_voltage"	TEXT,
	"jumping_action"	TEXT,
	"outage"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "equipment"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "configuration_event" (
	"mrid"	TEXT NOT NULL,
	"effective_date_time"	TEXT,
	"remark"	TEXT,
	"power_system_resource"	TEXT,
	"changed_location"	TEXT,
	"changed_asset"	TEXT,
	"changed_organisation_role"	TEXT,
	"changed_person_role"	TEXT,
	"changed_person"	TEXT,
	"changed_attachment"	TEXT,
	"modified_by"	TEXT,
	"user_name"	TEXT,
	"changed_organisation"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("changed_asset") REFERENCES "asset"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("changed_attachment") REFERENCES "attachment"("id") ON DELETE CASCADE,
	FOREIGN KEY("changed_location") REFERENCES "location"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("changed_organisation") REFERENCES "organisation"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("changed_organisation_role") REFERENCES "organisation_role"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("changed_person") REFERENCES "person"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("changed_person_role") REFERENCES "person_role"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("mrid") REFERENCES "activity_record"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("power_system_resource") REFERENCES "power_system_resource"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "connectivity_node_container" (
	"mrid"	TEXT NOT NULL,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "power_system_resource"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "contact_resistance_breaker_info" (
	"mrid"	TEXT NOT NULL,
	"assessment_limit_breaker_info_id"	TEXT,
	"r_min"	REAL,
	"r_max"	REAL,
	"r_ref"	REAL,
	"r_dev"	REAL,
	"parameter_name"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("assessment_limit_breaker_info_id") REFERENCES "assessment_limit_breaker_info"("mrid"),
	FOREIGN KEY("r_dev") REFERENCES "resistance"("mrid"),
	FOREIGN KEY("r_max") REFERENCES "resistance"("mrid"),
	FOREIGN KEY("r_min") REFERENCES "resistance"("mrid"),
	FOREIGN KEY("r_ref") REFERENCES "resistance"("mrid")
);
CREATE TABLE IF NOT EXISTS "contact_travel_breaker_info" (
	"mrid"	TEXT NOT NULL,
	"assessment_limit_breaker_info_id"	TEXT,
	"d_min"	TEXT,
	"d_max"	TEXT,
	"d_ref"	TEXT,
	"d_dev"	TEXT,
	"parameter_name"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("assessment_limit_breaker_info_id") REFERENCES "assessment_limit_breaker_info"("mrid"),
	FOREIGN KEY("d_dev") REFERENCES "length"("mrid"),
	FOREIGN KEY("d_max") REFERENCES "length"("mrid"),
	FOREIGN KEY("d_min") REFERENCES "length"("mrid"),
	FOREIGN KEY("d_ref") REFERENCES "length"("mrid")
);
CREATE TABLE IF NOT EXISTS "cooling_power_rating" (
	"mrid"	TEXT NOT NULL,
	"power_rating"	TEXT UNIQUE,
	"stage"	INTEGER,
	"cooling_kind"	TEXT,
	"temp_rise_wind"	TEXT,
	"power_transformer_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("power_rating") REFERENCES "apparent_power"("mrid"),
	FOREIGN KEY("power_transformer_info_id") REFERENCES "power_transformer_info"("mrid"),
	FOREIGN KEY("temp_rise_wind") REFERENCES "temperature"("mrid")
);
CREATE TABLE IF NOT EXISTS "ct_core_info" (
	"mrid"	TEXT NOT NULL,
	"tap_count"	INTEGER,
	"common_tap"	INTEGER,
	"core_application"	TEXT,
	"core_class"	TEXT,
	"fs"	TEXT,
	"alf"	TEXT,
	"winding_resistance"	TEXT,
	"ts"	TEXT,
	"ek"	TEXT,
	"e1"	TEXT,
	"ie"	TEXT,
	"ie1"	TEXT,
	"kssc"	TEXT,
	"val"	TEXT,
	"tp"	TEXT,
	"iai"	TEXT,
	"k"	TEXT,
	"ktd"	TEXT,
	"duty"	TEXT,
	"kx"	TEXT,
	"current_transformer_info_id"	TEXT,
	"ex"	TEXT,
	"vb"	TEXT,
	"vk"	TEXT,
	"vk1"	TEXT,
	"ik"	TEXT,
	"ik1"	TEXT,
	"ratio_error"	TEXT,
	"core_index"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("current_transformer_info_id") REFERENCES "current_transformer_info"("mrid"),
	FOREIGN KEY("ratio_error") REFERENCES "percent"("mrid"),
	FOREIGN KEY("vb") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("winding_resistance") REFERENCES "resistance"("mrid")
);
CREATE TABLE IF NOT EXISTS "ct_tap_info" (
	"mrid"	TEXT NOT NULL,
	"tap_name"	TEXT,
	"ipn"	TEXT,
	"isn"	TEXT,
	"in_use"	TEXT,
	"rated_burden"	TEXT,
	"burden"	TEXT,
	"extended_burden"	TEXT,
	"burden_power_factor"	TEXT,
	"operating_burden"	TEXT,
	"operating_burden_power_factor"	TEXT,
	"ct_core_info_id"	TEXT,
	"type"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("burden") REFERENCES "apparent_power"("mrid"),
	FOREIGN KEY("ct_core_info_id") REFERENCES "ct_core_info"("mrid"),
	FOREIGN KEY("ipn") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("isn") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("operating_burden") REFERENCES "apparent_power"("mrid"),
	FOREIGN KEY("rated_burden") REFERENCES "apparent_power"("mrid")
);
CREATE TABLE IF NOT EXISTS "current_flow" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "current_rating" (
	"mrid"	TEXT NOT NULL,
	"rated_power"	TEXT,
	"transformer_end_id"	TEXT,
	"value"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("rated_power") REFERENCES "cooling_power_rating"("power_rating") ON DELETE CASCADE,
	FOREIGN KEY("transformer_end_id") REFERENCES "transformer_end_info"("mrid"),
	FOREIGN KEY("value") REFERENCES "current_flow"("mrid")
);
CREATE TABLE IF NOT EXISTS "current_transformer_info" (
	"mrid"	TEXT NOT NULL,
	"accuracy_class"	TEXT,
	"accuracy_limit"	TEXT,
	"core_count"	INTEGER,
	"ct_class"	TEXT,
	"knee_point_current"	TEXT,
	"knee_point_voltage"	TEXT,
	"max_ratio"	TEXT,
	"nominal_ratio"	TEXT,
	"primary_fls_rating"	TEXT,
	"primary_ratio"	TEXT,
	"rated_current"	TEXT,
	"secondary_fls_rating"	TEXT,
	"secondary_ratio"	TEXT,
	"tertiary_fls_rating"	TEXT,
	"tertiary_ratio"	TEXT,
	"usage"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("accuracy_limit") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("knee_point_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("knee_point_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("max_ratio") REFERENCES "ratio"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset_info"("mrid") on delete cascade,
	FOREIGN KEY("nominal_ratio") REFERENCES "ratio"("mrid"),
	FOREIGN KEY("primary_fls_rating") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("primary_ratio") REFERENCES "ratio"("mrid"),
	FOREIGN KEY("rated_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("secondary_fls_rating") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("secondary_ratio") REFERENCES "ratio"("mrid"),
	FOREIGN KEY("tertiary_fls_rating") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("tertiary_ratio") REFERENCES "ratio"("mrid")
);
CREATE TABLE IF NOT EXISTS "current_transformer_testing_equipment_test_type" (
	"mrid"	TEXT NOT NULL,
	"testing_equipment_id"	TEXT,
	"test_type_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("test_type_id") REFERENCES "procedure"("mrid"),
	FOREIGN KEY("testing_equipment_id") REFERENCES "testing_equipment"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "current_voltage" (
	"id"	TEXT NOT NULL,
	"properties"	TEXT,
	"ratings"	TEXT,
	"config"	TEXT,
	"location_id"	TEXT NOT NULL,
	"extend"	TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY("location_id") REFERENCES "locations"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "din_standard" (
	"mrid"	TEXT NOT NULL,
	"standard_edition"	TEXT,
	"standard_number"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "disconnector" (
	"id"	TEXT NOT NULL,
	"properties"	TEXT,
	"ratings"	TEXT,
	"config"	TEXT,
	"location_id"	TEXT NOT NULL,
	"extend"	TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY("location_id") REFERENCES "locations"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "disconnector_info" (
	"mrid"	TEXT NOT NULL,
	"rated_duration_short_circuit"	TEXT,
	"withstand_voltage_earth_poles"	TEXT,
	"power_frequency_isolating_distance"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "old_switch_info"("mrid") on delete cascade,
	FOREIGN KEY("power_frequency_isolating_distance") REFERENCES "frequency"("mrid"),
	FOREIGN KEY("rated_duration_short_circuit") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("withstand_voltage_earth_poles") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "disconnector_testing_equipment_test_type" (
	"mrid"	TEXT NOT NULL,
	"testing_equipment_id"	TEXT,
	"test_type_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("test_type_id") REFERENCES "procedure"("mrid"),
	FOREIGN KEY("testing_equipment_id") REFERENCES "testing_equipment"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "discrete" (
	"mrid"	TEXT NOT NULL,
	"max_value"	INTEGER,
	"min_value"	INTEGER,
	"normal_value"	INTEGER,
	"value_alias_set"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "measurement"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("value_alias_set") REFERENCES "value_alias_set"("mrid")
);
CREATE TABLE IF NOT EXISTS "discrete_value" (
	"mrid"	TEXT NOT NULL,
	"value"	INTEGER,
	"discrete"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("discrete") REFERENCES "discrete"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "measurement_value"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "dissipation_factor_capacitor_info" (
	"mrid"	TEXT NOT NULL,
	"phase"	TEXT,
	"value"	TEXT,
	"capacitor_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("value") REFERENCES "percent"("mrid")
);
CREATE TABLE IF NOT EXISTS "doble_standard" (
	"mrid"	TEXT NOT NULL,
	"standard_edition"	TEXT,
	"standard_number"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "document" (
	"mrid"	TEXT NOT NULL,
	"type"	TEXT,
	"created_date_time"	TEXT,
	"last_modified_date_time"	TEXT,
	"revision_number"	TEXT,
	"electronic_address"	TEXT,
	"subject"	TEXT,
	"title"	TEXT,
	"doc_status"	TEXT,
	"status"	TEXT,
	"author_name"	TEXT,
	"comment"	TEXT,
	"author"	TEXT,
	"editor"	TEXT,
	"issuer"	TEXT,
	"approver"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("doc_status") REFERENCES "status"("mrid"),
	FOREIGN KEY("electronic_address") REFERENCES "electronic_address"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("status") REFERENCES "status"("mrid")
);
CREATE TABLE IF NOT EXISTS "document_person_role" (
	"mrid"	TEXT NOT NULL,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "person_role"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "electronic_address" (
	"mrid"	TEXT NOT NULL,
	"email"	TEXT,
	"lan"	TEXT,
	"mac"	TEXT,
	"password"	TEXT,
	"radio"	TEXT,
	"user_id"	TEXT,
	"web"	TEXT,
	"fax"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "entity_snapshot" (
	"mrid"	TEXT NOT NULL,
	"type"	TEXT NOT NULL,
	"snapshot"	TEXT NOT NULL,
	"updated_at"	TEXT NOT NULL,
	PRIMARY KEY("mrid","type")
);
CREATE TABLE IF NOT EXISTS "epa_standard" (
	"mrid"	TEXT NOT NULL,
	"standard_edition"	TEXT,
	"standard_number"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "equipment" (
	"mrid"	TEXT NOT NULL,
	"aggregate"	TEXT,
	"in_service"	TEXT,
	"network_analysis_enabled"	TEXT,
	"normally_in_service"	TEXT,
	"equipment_container"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("equipment_container") REFERENCES "equipment_container"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "power_system_resource"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "equipment_container" (
	"mrid"	TEXT NOT NULL,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "connectivity_node_container"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "fmeca" (
	"id"	TEXT NOT NULL,
	"table_fmeca"	TEXT,
	"table_calculate"	TEXT,
	"total"	TEXT,
	"name"	TEXT,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "frequency" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "geo_map" (
	"mrid"	TEXT NOT NULL,
	"organisation_id"	TEXT,
	"x"	REAL,
	"y"	REAL,
	"z"	REAL,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("organisation_id") REFERENCES "organisation"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "identified_object" (
	"mrid"	TEXT NOT NULL,
	"name"	TEXT,
	"alias_name"	TEXT,
	"description"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "iec_standard" (
	"mrid"	TEXT NOT NULL,
	"standard_edition"	TEXT,
	"standard_number"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "ieee_standard" (
	"mrid"	TEXT NOT NULL,
	"standard_edition"	TEXT,
	"standard_number"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "impedance" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"value"	TEXT,
	"unit"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "in_use_date" (
	"mrid"	TEXT NOT NULL,
	"in_use_date"	INTEGER,
	"not_ready_for_use_date"	INTEGER,
	"ready_for_use_date"	INTEGER,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "inductance" (
	"mrid"	TEXT NOT NULL,
	"unit"	TEXT,
	"multiplier"	TEXT,
	"value"	REAL,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "interrupter_unit" (
	"mrid"	TEXT NOT NULL,
	"operating_mechanism"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset"("mrid") on delete cascade,
	FOREIGN KEY("operating_mechanism") REFERENCES "operating_mechanism"("mrid")
);
CREATE TABLE IF NOT EXISTS "iopoint" (
	"mrid"	TEXT NOT NULL,
	"iopoint_source"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("iopoint_source") REFERENCES "iopoint_source"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "iopoint_source" (
	"mrid"	TEXT NOT NULL,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "measurement_value_source"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "iso_standard" (
	"mrid"	TEXT NOT NULL,
	"standard_edition"	TEXT,
	"standard_number"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "joint_cable_info" (
	"mrid"	TEXT NOT NULL,
	"rated_u"	TEXT,
	"rated_current"	TEXT,
	"category"	TEXT,
	"construction"	TEXT,
	"service_condition"	TEXT,
	"cable_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("cable_info_id") REFERENCES "cable_info"("mrid"),
	FOREIGN KEY("rated_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("rated_u") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "kilo_active_power" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit	"	TEXT,
	"value"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "laborelec_standard" (
	"mrid"	TEXT NOT NULL,
	"standard_edition"	TEXT,
	"standard_number"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "length" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	REAL,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "lifecycle_date" (
	"mrid"	TEXT NOT NULL,
	"installation_date"	TEXT,
	"manufactured_date"	TEXT,
	"purchase_date"	TEXT,
	"received_date"	TEXT,
	"removal_date"	TEXT,
	"retired_date"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "limitation_license" (
	"name"	TEXT,
	"number_of_liscense"	INTEGER,
	"mrid"	TEXT NOT NULL,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "location" (
	"mrid"	TEXT NOT NULL,
	"direction"	TEXT,
	"electronic_address"	TEXT,
	"geo_info_reference"	TEXT,
	"main_address"	TEXT,
	"phone"	TEXT,
	"secondary_address"	TEXT,
	"status"	TEXT,
	"type"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("electronic_address") REFERENCES "electronic_address"("mrid"),
	FOREIGN KEY("main_address") REFERENCES "street_address"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("phone") REFERENCES "telephone_number"("mrid"),
	FOREIGN KEY("secondary_address") REFERENCES "street_address"("mrid"),
	FOREIGN KEY("status") REFERENCES "status"("mrid")
);
CREATE TABLE IF NOT EXISTS "manufacturer" (
	"mrid"	TEXT NOT NULL,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "organisation_role"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "manufacturer_custom" (
	"id"	text NOT NULL,
	"name"	text,
	"type"	text,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "mass" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "measurement" (
	"mrid"	TEXT NOT NULL,
	"measurement_type"	TEXT,
	"phases"	TEXT,
	"unit_multiplier"	TEXT,
	"unit_symbol"	TEXT,
	"terminal"	TEXT,
	"calculation_method_hierarchy"	TEXT,
	"power_system_resource"	TEXT,
	"asset"	TEXT,
	"measurement_action"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("asset") REFERENCES "asset"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("power_system_resource") REFERENCES "power_system_resource"("mrid")
);
CREATE TABLE IF NOT EXISTS "measurement_procedure" (
	"measurement_id"	TEXT NOT NULL,
	"procedure_id"	TEXT NOT NULL,
	PRIMARY KEY("measurement_id","procedure_id"),
	FOREIGN KEY("measurement_id") REFERENCES "measurement"("mrid"),
	FOREIGN KEY("procedure_id") REFERENCES "procedure"("mrid")
);
CREATE TABLE IF NOT EXISTS "measurement_value" (
	"mrid"	TEXT NOT NULL,
	"sensor_accuracy"	TEXT,
	"time_stamp"	TEXT,
	"measurement_value_source"	TEXT,
	"calculation_method_hierarchy"	TEXT,
	"erp_person"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "iopoint"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("sensor_accuracy") REFERENCES "percent"("mrid")
);
CREATE TABLE IF NOT EXISTS "measurement_value_source" (
	"mrid"	TEXT NOT NULL,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "miscellaneous_breaker_info" (
	"mrid"	TEXT NOT NULL,
	"parameter_name"	TEXT,
	"min"	TEXT,
	"max"	TEXT,
	"ref"	TEXT,
	"dev"	TEXT,
	"assessment_limit_breaker_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("assessment_limit_breaker_info_id") REFERENCES "assessment_limit_breaker_info"("mrid"),
	FOREIGN KEY("dev") REFERENCES "quantity_value"("mrid"),
	FOREIGN KEY("max") REFERENCES "quantity_value"("mrid"),
	FOREIGN KEY("min") REFERENCES "quantity_value"("mrid"),
	FOREIGN KEY("ref") REFERENCES "quantity_value"("mrid")
);
CREATE TABLE IF NOT EXISTS "motor_characteristics_breaker_info" (
	"mrid"	TEXT NOT NULL,
	"parameter_name"	TEXT,
	"min"	INTEGER,
	"max"	INTEGER,
	"ref"	INTEGER,
	"dev"	INTEGER,
	"assessment_limit_breaker_info_id"	INTEGER,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("assessment_limit_breaker_info_id") REFERENCES "assessment_limit_breaker_info"("mrid"),
	FOREIGN KEY("dev") REFERENCES "quantity_value"("mrid"),
	FOREIGN KEY("max") REFERENCES "quantity_value"("mrid"),
	FOREIGN KEY("min") REFERENCES "quantity_value"("mrid"),
	FOREIGN KEY("ref") REFERENCES "quantity_value"("mrid")
);
CREATE TABLE IF NOT EXISTS "notification" (
	"mrid"	TEXT NOT NULL,
	"name"	TEXT,
	"message"	TEXT,
	"type"	TEXT,
	"status"	TEXT,
	"created_at"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "old_breaker_info" (
	"mrid"	TEXT NOT NULL,
	"phase_number"	INTEGER,
	"number_of_interrupters_per_phase"	INTEGER,
	"pole_operation"	TEXT,
	"pir"	TEXT,
	"pir_value"	TEXT,
	"grading_capacitors"	TEXT,
	"capacitor_value"	TEXT,
	"interrupting_medium"	TEXT,
	"tank_type"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("capacitor_value") REFERENCES "capacitance"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "breaker_info"("mrid") on delete cascade,
	FOREIGN KEY("pir_value") REFERENCES "resistance"("mrid")
);
CREATE TABLE IF NOT EXISTS "old_bushing_info" (
	"mrid"	TEXT NOT NULL,
	"high_voltage_limit"	TEXT,
	"c2_capacitance"	TEXT,
	"c2_power_factor"	TEXT,
	"rated_frequency"	TEXT,
	"transformer_end_info"	TEXT,
	"phase"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("c2_capacitance") REFERENCES "capacitance"("mrid"),
	FOREIGN KEY("c2_power_factor") REFERENCES "percent"("mrid"),
	FOREIGN KEY("high_voltage_limit") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "bushing_info"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("rated_frequency") REFERENCES "frequency"("mrid"),
	FOREIGN KEY("transformer_end_info") REFERENCES "transformer_end_info"("mrid")
);
CREATE TABLE IF NOT EXISTS "old_cable_info" (
	"mrid"	TEXT NOT NULL,
	"rated_u"	TEXT,
	"max_u"	TEXT,
	"rated_frequency"	TEXT,
	"short_circuit_current"	TEXT,
	"rated_duration_short_circuit"	TEXT,
	"installation_method"	TEXT,
	"bonding_type"	TEXT,
	"install_location"	TEXT,
	"length"	TEXT,
	"conductor_size"	TEXT,
	"conductor_class"	TEXT,
	"nominal_conductor_diameter"	TEXT,
	"conductor_type"	TEXT,
	"conductor_shield_thickness"	TEXT,
	"diameter_over_shield"	TEXT,
	"sheath_multicore"	TEXT,
	"sheath_contruction"	TEXT,
	"sheath_thickness"	TEXT,
	"diameter_over_sheath"	TEXT,
	"insulation_max_operating_temp"	TEXT,
	"screen_material"	TEXT,
	"screen_thickness"	TEXT,
	"armour_bedding_material"	TEXT,
	"armour_bedding_thickness"	TEXT,
	"diameter_bedding_over_armour"	TEXT,
	"sheath_reinforcing_material"	TEXT,
	"sheath_reinforcing_thickness"	TEXT,
	"diameter_over_sheath_reinforcing"	TEXT,
	"sheath_reinforcing_width"	TEXT,
	"sheath_reinforcing_length_lay"	TEXT,
	"sheath_reinforcing_no_tape"	TEXT,
	"armour_material"	TEXT,
	"armour_thickness"	TEXT,
	"armour_layer_tape"	TEXT,
	"armour_cross_sectional_area_tap"	TEXT,
	"jacket_thickness"	TEXT,
	"concentric_thickness"	TEXT,
	"concentric_contruction"	TEXT,
	"concentric_material"	TEXT,
	"concentric_length_lay"	TEXT,
	"concentric_area"	TEXT,
	"concentric_no_of_wires"	TEXT,
	"cable_info_id"	TEXT,
	"phase_count"	INTEGER,
	"core_count"	TEXT,
	"sheath_type"	TEXT,
	"diameter_over_armour"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("armour_bedding_thickness") REFERENCES "length"("mrid"),
	FOREIGN KEY("armour_cross_sectional_area_tap") REFERENCES "area"("mrid"),
	FOREIGN KEY("armour_thickness") REFERENCES "length"("mrid"),
	FOREIGN KEY("cable_info_id") REFERENCES "cable_info"("mrid") on delete cascade,
	FOREIGN KEY("concentric_area") REFERENCES "area"("mrid"),
	FOREIGN KEY("concentric_length_lay") REFERENCES "length"("mrid"),
	FOREIGN KEY("concentric_thickness") REFERENCES "length"("mrid"),
	FOREIGN KEY("conductor_shield_thickness") REFERENCES "length"("mrid"),
	FOREIGN KEY("conductor_size") REFERENCES "area"("mrid"),
	FOREIGN KEY("diameter_bedding_over_armour") REFERENCES "length"("mrid"),
	FOREIGN KEY("diameter_over_armour") REFERENCES "length"("mrid"),
	FOREIGN KEY("diameter_over_sheath") REFERENCES "length"("mrid"),
	FOREIGN KEY("diameter_over_sheath_reinforcing") REFERENCES "length"("mrid"),
	FOREIGN KEY("diameter_over_shield") REFERENCES "length"("mrid"),
	FOREIGN KEY("insulation_max_operating_temp") REFERENCES "temperature"("mrid"),
	FOREIGN KEY("jacket_thickness") REFERENCES "length"("mrid"),
	FOREIGN KEY("length") REFERENCES "length"("mrid"),
	FOREIGN KEY("max_u") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("nominal_conductor_diameter") REFERENCES "length"("mrid"),
	FOREIGN KEY("rated_duration_short_circuit") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("rated_frequency") REFERENCES "frequency"("mrid"),
	FOREIGN KEY("rated_u") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("screen_thickness") REFERENCES "length"("mrid"),
	FOREIGN KEY("sheath_reinforcing_length_lay") REFERENCES "length"("mrid"),
	FOREIGN KEY("sheath_reinforcing_thickness") REFERENCES "length"("mrid"),
	FOREIGN KEY("sheath_reinforcing_width") REFERENCES "length"("mrid"),
	FOREIGN KEY("sheath_thickness") REFERENCES "length"("mrid"),
	FOREIGN KEY("short_circuit_current") REFERENCES "current_flow"("mrid")
);
CREATE TABLE IF NOT EXISTS "old_current_transformer_info" (
	"mrid"	TEXT NOT NULL,
	"standard"	TEXT,
	"rated_frequency"	TEXT,
	"primary_winding_count"	INTEGER,
	"um_rms"	TEXT,
	"u_withstand_rms"	TEXT,
	"u_lightning_peak"	TEXT,
	"i_cth"	TEXT,
	"i_dynamic_peak"	TEXT,
	"ith_rms"	TEXT,
	"ith_duration"	TEXT,
	"system_voltage"	TEXT,
	"system_voltage_type"	TEXT,
	"bil"	TEXT,
	"rating_factor"	REAL,
	"rating_factor_temp"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("bil") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("i_cth") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("i_dynamic_peak") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("ith_duration") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("ith_rms") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "current_transformer_info"("mrid") on delete cascade,
	FOREIGN KEY("rated_frequency") REFERENCES "frequency"("mrid"),
	FOREIGN KEY("rating_factor_temp") REFERENCES "temperature"("mrid"),
	FOREIGN KEY("system_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("u_lightning_peak") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("u_withstand_rms") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("um_rms") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "old_operating_mechanism" (
	"mrid"	TEXT NOT NULL,
	"number_of_trip_coil"	INTEGER,
	"number_of_close_coil"	INTEGER,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "operating_mechanism"("mrid") on delete cascade
);
CREATE TABLE IF NOT EXISTS "old_operating_mechanism_info" (
	"mrid"	TEXT NOT NULL,
	"rated_motor_current"	TEXT,
	"rated_motor_voltage"	TEXT,
	"motor_power_type"	TEXT,
	"rated_motor_frequency"	TEXT,
	"rated_auxiliary_circuit_current"	TEXT,
	"rated_auxiliary_circuit_voltage"	TEXT,
	"auxiliary_circuit_power_type"	TEXT,
	"rated_auxiliary_circuit_frequency"	TEXT,
	"rated_operating_pressure"	TEXT,
	"rated_operating_pressure_temperature"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "operating_mechanism_info"("mrid") on delete cascade,
	FOREIGN KEY("rated_auxiliary_circuit_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("rated_auxiliary_circuit_frequency") REFERENCES "frequency"("mrid"),
	FOREIGN KEY("rated_auxiliary_circuit_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("rated_motor_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("rated_motor_frequency") REFERENCES "frequency"("mrid"),
	FOREIGN KEY("rated_motor_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("rated_operating_pressure") REFERENCES "pressure"("mrid"),
	FOREIGN KEY("rated_operating_pressure_temperature") REFERENCES "temperature"("mrid")
);
CREATE TABLE IF NOT EXISTS "old_potential_transformer_info" (
	"mrid"	TEXT NOT NULL,
	"standard"	TEXT,
	"rated_frequency"	TEXT,
	"upr_formula"	TEXT,
	"windings"	INTEGER,
	"c1"	TEXT,
	"c2"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("c1") REFERENCES "capacitance"("mrid"),
	FOREIGN KEY("c2") REFERENCES "capacitance"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "potential_transformer_info"("mrid") on delete cascade,
	FOREIGN KEY("rated_frequency") REFERENCES "frequency"("mrid")
);
CREATE TABLE IF NOT EXISTS "old_power_transformer_info" (
	"mrid"	TEXT NOT NULL,
	"category"	TEXT,
	"phases"	TEXT,
	"vector_group"	TEXT,
	"rated_frequency"	TEXT,
	"impedance_temperature"	TEXT,
	"apparatus_id"	TEXT,
	"vector_group_type"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("impedance_temperature") REFERENCES "temperature"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "power_transformer_info"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("rated_frequency") REFERENCES "frequency"("mrid")
);
CREATE TABLE IF NOT EXISTS "old_surge_arrester_info" (
	"mrid"	TEXT NOT NULL,
	"maximum_system_voltage"	TEXT,
	"short_time_with_stand_current"	TEXT,
	"rated_duration_of_short_circuit"	TEXT,
	"pf_with_stand_voltage_earth_between_pole"	TEXT,
	"pf_with_stand_voltage_isolated_distance"	TEXT,
	"voltage_ll"	TEXT,
	"voltage_ln"	TEXT,
	"transformer_end_info"	TEXT,
	"phase"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("maximum_system_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "surge_arrester_info"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("pf_with_stand_voltage_earth_between_pole") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("pf_with_stand_voltage_isolated_distance") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("rated_duration_of_short_circuit") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("short_time_with_stand_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("transformer_end_info") REFERENCES "transformer_end_info"("mrid"),
	FOREIGN KEY("voltage_ll") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("voltage_ln") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "old_switch_info" (
	"mrid"	TEXT NOT NULL,
	"dielectric_strength"	TEXT,
	"load_break"	TEXT,
	"making_capacity"	TEXT,
	"minimum_current"	TEXT,
	"pole_count"	INTEGER,
	"remote"	TEXT,
	"withstand_current"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("dielectric_strength") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("making_capacity") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("minimum_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "switch_info"("mrid") on delete cascade,
	FOREIGN KEY("withstand_current") REFERENCES "current_flow"("mrid")
);
CREATE TABLE IF NOT EXISTS "old_tap_changer_info" (
	"mrid"	TEXT NOT NULL,
	"tap_scheme"	TEXT,
	"number_of_tap"	INTEGER,
	"power_transformer_info_id"	TEXT,
	"transformer_end_info"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "tap_changer_info"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("power_transformer_info_id") REFERENCES "power_transformer_info"("mrid"),
	FOREIGN KEY("transformer_end_info") REFERENCES "transformer_end_info"("mrid")
);
CREATE TABLE IF NOT EXISTS "old_transformer_end_info" (
	"mrid"	TEXT NOT NULL,
	"material"	TEXT,
	"spare"	TEXT,
	"accessibility"	TEXT,
	"power_transformer_info_id"	TEXT,
	"phase"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "transformer_end_info"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("power_transformer_info_id") REFERENCES "power_transformer_info"("mrid")
);
CREATE TABLE IF NOT EXISTS "old_transformer_observation" (
	"mrid"	TEXT NOT NULL,
	"bottom_oil_temp"	TEXT,
	"work_task_id"	TEXT,
	"humidity"	TEXT,
	"weather"	TEXT,
	"ambient_temp"	TEXT,
	"reference_temp"	TEXT,
	"winding_temp"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("ambient_temp") REFERENCES "temperature"("mrid"),
	FOREIGN KEY("bottom_oil_temp") REFERENCES "temperature"("mrid"),
	FOREIGN KEY("humidity") REFERENCES "percent"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "transformer_observation"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("reference_temp") REFERENCES "temperature"("mrid"),
	FOREIGN KEY("winding_temp") REFERENCES "temperature"("mrid"),
	FOREIGN KEY("work_task_id") REFERENCES "work_task"("mrid")
);
CREATE TABLE IF NOT EXISTS "old_transformer_tank_info" (
	"mrid"	TEXT NOT NULL,
	"construction_kind"	TEXT,
	"oil_preservation_kind"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "transformer_tank_info"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "old_work" (
	"mrid"	TEXT NOT NULL,
	"approval_date"	TEXT,
	"tested_by"	TEXT,
	"ref_standard"	TEXT,
	"execution_date"	TEXT,
	"test_method"	TEXT,
	"asset_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("asset_id") REFERENCES "asset"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "work"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "online_monitor" (
	"id"	TEXT NOT NULL,
	"asset_id"	TEXT NOT NULL,
	"ageing_insulation"	TEXT,
	"moisture_insulation"	TEXT,
	"bushings_online"	TEXT,
	"patital_discharge"	TEXT,
	"dga"	TEXT,
	"bushing_df_worst"	TEXT,
	"bushing_df_average"	TEXT,
	"bushing_c_worst"	TEXT,
	"bushing_c_average"	TEXT,
	"condition_mois"	TEXT,
	"health_index"	TEXT,
	"weight_bushing_df"	TEXT,
	"weight_bushing_c"	TEXT,
	"weight_mois"	TEXT,
	"created_by"	TEXT,
	"created_on"	TEXT,
	"updated_by"	TEXT,
	"updated_on"	TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "operating_mechanism" (
	"mrid"	TEXT NOT NULL,
	"asset_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("asset_id") REFERENCES "asset"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset"("mrid") on delete cascade
);
CREATE TABLE IF NOT EXISTS "operating_mechanism_component" (
	"mrid"	TEXT NOT NULL,
	"operating_mechanism_id"	TEXT,
	"component"	TEXT,
	"rated_current"	TEXT,
	"rated_voltage"	TEXT,
	"rated_frequency"	TEXT,
	"power_type"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("operating_mechanism_id") REFERENCES "operating_mechanism"("mrid"),
	FOREIGN KEY("rated_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("rated_frequency") REFERENCES "frequency"("mrid"),
	FOREIGN KEY("rated_voltage") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "operating_mechanism_info" (
	"mrid"	TEXT NOT NULL,
	"close_amps"	TEXT,
	"close_voltage"	TEXT,
	"mechanism_kind"	TEXT,
	"motor_run_current"	TEXT,
	"motor_start_current"	TEXT,
	"motor_voltage"	TEXT,
	"trip_amps"	TEXT,
	"trip_voltage"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("close_amps") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("close_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("motor_run_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("motor_start_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("motor_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset_info"("mrid") on delete cascade,
	FOREIGN KEY("trip_amps") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("trip_voltage") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "operating_time_breaker_info" (
	"mrid"	TEXT NOT NULL,
	"parameter_name"	TEXT,
	"t_min"	TEXT,
	"t_max"	TEXT,
	"t_ref"	TEXT,
	"t_dev_position"	TEXT,
	"t_dev_negative"	TEXT,
	"assessment_limit_breaker_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("assessment_limit_breaker_info_id") REFERENCES "assessment_limit_breaker_info"("mrid"),
	FOREIGN KEY("t_dev_negative") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("t_dev_position") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("t_max") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("t_min") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("t_ref") REFERENCES "seconds"("mrid")
);
CREATE TABLE IF NOT EXISTS "organisation" (
	"mrid"	TEXT NOT NULL,
	"electronic_address"	TEXT,
	"phone"	TEXT,
	"postal_address"	TEXT,
	"street_address"	TEXT,
	"parent_organisation"	TEXT,
	"tax_code"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("electronic_address") REFERENCES "electronic_address"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("parent_organisation") REFERENCES "parent_organization"("mrid"),
	FOREIGN KEY("phone") REFERENCES "telephone_number"("mrid"),
	FOREIGN KEY("postal_address") REFERENCES "street_address"("mrid"),
	FOREIGN KEY("street_address") REFERENCES "street_address"("mrid")
);
CREATE TABLE IF NOT EXISTS "organisation_location" (
	"mrid"	TEXT NOT NULL,
	"organisation_id"	TEXT,
	"location_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("location_id") REFERENCES "location"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("organisation_id") REFERENCES "organisation"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "organisation_person" (
	"mrid"	TEXT NOT NULL,
	"person_id"	TEXT,
	"organisation_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("organisation_id") REFERENCES "organisation"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("person_id") REFERENCES "person"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "organisation_psr" (
	"mrid"	TEXT NOT NULL,
	"psr_id"	TEXT,
	"organisation_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("organisation_id") REFERENCES "organisation"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("psr_id") REFERENCES "power_system_resource"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "organisation_role" (
	"mrid"	TEXT NOT NULL,
	"organisation"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("organisation") REFERENCES "organisation"("mrid")
);
CREATE TABLE IF NOT EXISTS "other" (
	"mrid"	TEXT,
	"category"	TEXT,
	"insulation_medium"	TEXT,
	"insulation_weight"	TEXT,
	"insulation_volume"	TEXT,
	"power_transformer_info_id"	TEXT,
	"insulation_key"	TEXT,
	"tank_type"	TEXT,
	FOREIGN KEY("insulation_volume") REFERENCES "volume"("mrid"),
	FOREIGN KEY("insulation_weight") REFERENCES "mass"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("power_transformer_info_id") REFERENCES "power_transformer_info"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "overcurrent_release_breaker_info" (
	"mrid"	TEXT NOT NULL,
	"parameter_name"	TEXT,
	"min"	TEXT,
	"max"	TEXT,
	"ref"	TEXT,
	"dev"	TEXT,
	"assessment_limit_breaker_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("assessment_limit_breaker_info_id") REFERENCES "assessment_limit_breaker_info"("mrid"),
	FOREIGN KEY("dev") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("max") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("min") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("ref") REFERENCES "current_flow"("mrid")
);
CREATE TABLE IF NOT EXISTS "owner" (
	"id"	text NOT NULL,
	"user_id"	text,
	"name"	text,
	"address"	text,
	"city"	text,
	"state"	text,
	"country"	text,
	"phone_no"	text,
	"mode"	text,
	"ref_id"	text,
	"fax"	text,
	"email"	text,
	"name_person"	text,
	"phone1"	text,
	"phone2"	text,
	"fax_contact"	text,
	"email_contact"	text,
	"department"	text,
	"position"	text,
	"comment"	text,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "parent_organization" (
	"mrid"	TEXT NOT NULL,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "organisation"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "percent" (
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	REAL,
	"mrid"	TEXT NOT NULL,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "person" (
	"mrid"	TEXT NOT NULL,
	"electronic_address"	TEXT,
	"first_name"	TEXT,
	"landline_phone"	TEXT,
	"last_name"	TEXT,
	"m_name"	TEXT,
	"mobile_phone"	TEXT,
	"prefix"	TEXT,
	"special_need"	TEXT,
	"suffix"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("electronic_address") REFERENCES "electronic_address"("mrid"),
	FOREIGN KEY("landline_phone") REFERENCES "telephone_number"("mrid"),
	FOREIGN KEY("mobile_phone") REFERENCES "telephone_number"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "person_role" (
	"mrid"	TEXT NOT NULL,
	"person"	TEXT,
	"department"	TEXT,
	"position"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("person") REFERENCES "person"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "person_substation" (
	"mrid"	TEXT NOT NULL,
	"person_id"	TEXT,
	"substation_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("person_id") REFERENCES "person"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("substation_id") REFERENCES "substation"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "pickup_voltage_breaker_info" (
	"mrid"	TEXT NOT NULL,
	"parameter_name"	TEXT,
	"v_ref"	TEXT,
	"v_dev"	TEXT,
	"v_min"	TEXT,
	"v_max"	TEXT,
	"assessment_limit_breaker_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("assessment_limit_breaker_info_id") REFERENCES "assessment_limit_breaker_info"("mrid"),
	FOREIGN KEY("v_dev") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("v_max") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("v_min") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("v_ref") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "position_point" (
	"mrid"	TEXT NOT NULL,
	"group_number"	TEXT,
	"location"	TEXT,
	"sequence_number"	TEXT,
	"x_position"	TEXT,
	"y_position"	TEXT,
	"z_position"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("location") REFERENCES "location"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "potential_transformer_info" (
	"mrid"	TEXT NOT NULL,
	"accuracy_class"	TEXT,
	"nominal_ratio"	TEXT,
	"primary_ratio"	TEXT,
	"pt_class"	TEXT,
	"rated_voltage"	TEXT,
	"secondary_ratio"	TEXT,
	"tertiary_ratio"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset_info"("mrid") on delete cascade,
	FOREIGN KEY("nominal_ratio") REFERENCES "ratio"("mrid"),
	FOREIGN KEY("primary_ratio") REFERENCES "ratio"("mrid"),
	FOREIGN KEY("rated_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("secondary_ratio") REFERENCES "ratio"("mrid"),
	FOREIGN KEY("tertiary_ratio") REFERENCES "ratio"("mrid")
);
CREATE TABLE IF NOT EXISTS "potential_transformer_table" (
	"mrid"	TEXT NOT NULL,
	"name"	TEXT,
	"usr_formula"	TEXT,
	"rated_burden"	TEXT,
	"rated_power_factor"	REAL,
	"usr_rated_voltage"	TEXT,
	"potential_transformer_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("potential_transformer_info_id") REFERENCES "potential_transformer_info"("mrid"),
	FOREIGN KEY("rated_burden") REFERENCES "apparent_power"("mrid"),
	FOREIGN KEY("usr_rated_voltage") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "power_cable" (
	"id"	TEXT NOT NULL,
	"properties"	TEXT,
	"powerCable"	TEXT,
	"assessories"	TEXT,
	"location_id"	TEXT NOT NULL,
	"extend"	TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY("location_id") REFERENCES "locations"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "power_cable_testing_equipment_test_type" (
	"mrid"	TEXT NOT NULL,
	"testing_equipment_id"	TEXT,
	"test_type_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("test_type_id") REFERENCES "procedure"("mrid"),
	FOREIGN KEY("testing_equipment_id") REFERENCES "testing_equipment"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "power_rating" (
	"mrid"	TEXT NOT NULL,
	"rated_power"	TEXT UNIQUE,
	"cooling"	TEXT,
	"temp"	TEXT,
	"power_transformer_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("cooling") REFERENCES "cooling_power_rating"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("power_transformer_info_id") REFERENCES "power_transformer_info"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("rated_power") REFERENCES "apparent_power"("mrid")
);
CREATE TABLE IF NOT EXISTS "power_system_resource" (
	"mrid"	TEXT NOT NULL,
	"psr_type_id"	TEXT,
	"location"	TEXT,
	"asset_datasheet"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("asset_datasheet") REFERENCES "asset_info"("mrid"),
	FOREIGN KEY("location") REFERENCES "location"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("psr_type_id") REFERENCES "psr_type"("mrid")
);
CREATE TABLE IF NOT EXISTS "power_transformer" (
	"mrid"	TEXT NOT NULL,
	"before_sh_circuit_highest_operating_current"	TEXT,
	"before_sh_circuit_highest_operating_voltage"	TEXT,
	"before_short_circuit_angle_pf"	TEXT,
	"high_side_min_operating_u"	TEXT,
	"is_part_of_generator_unit"	TEXT,
	"operational_values_considered"	TEXT,
	"vector_group"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("before_sh_circuit_highest_operating_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("before_sh_circuit_highest_operating_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("before_short_circuit_angle_pf") REFERENCES "angle_degrees"("mrid"),
	FOREIGN KEY("high_side_min_operating_u") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "conducting_equipment"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "power_transformer_info" (
	"mrid"	TEXT NOT NULL,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset_info"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "pressure" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	REAL,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "priority" (
	"mrid"	TEXT NOT NULL,
	"justification"	TEXT,
	"rank"	INTEGER,
	"type"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "procedure" (
	"mrid"	TEXT NOT NULL,
	"instruction"	TEXT,
	"kind"	TEXT,
	"sequence_number"	TEXT,
	"generic_asset_model"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "document"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "procedure_asset" (
	"procedure_id"	TEXT NOT NULL,
	"asset_id"	TEXT NOT NULL,
	PRIMARY KEY("procedure_id","asset_id"),
	FOREIGN KEY("asset_id") REFERENCES "asset"("mrid") on delete cascade,
	FOREIGN KEY("procedure_id") REFERENCES "procedure"("mrid") on delete cascade
);
CREATE TABLE IF NOT EXISTS "procedure_dataset" (
	"mrid"	TEXT NOT NULL,
	"completed_date_time"	TEXT,
	"work_task"	TEXT,
	"asset"	TEXT,
	"procedure"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("asset") REFERENCES "asset"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "document"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("procedure") REFERENCES "procedure"("mrid"),
	FOREIGN KEY("work_task") REFERENCES "work_task"("mrid")
);
CREATE TABLE IF NOT EXISTS "procedure_dataset_measurement_value" (
	"procedure_dataset_id"	TEXT NOT NULL,
	"measurement_value_id"	TEXT NOT NULL,
	PRIMARY KEY("procedure_dataset_id","measurement_value_id"),
	FOREIGN KEY("measurement_value_id") REFERENCES "measurement_value"("mrid") on delete cascade,
	FOREIGN KEY("procedure_dataset_id") REFERENCES "procedure_dataset"("mrid") on delete cascade
);
CREATE TABLE IF NOT EXISTS "product_asset_model" (
	"mrid"	TEXT NOT NULL,
	"catalogue_number"	TEXT,
	"corporate_standard_kind"	TEXT,
	"drawing_number"	TEXT,
	"instruction_manual"	TEXT,
	"model_number"	TEXT,
	"model_version"	TEXT,
	"overall_length"	TEXT,
	"style_number"	TEXT,
	"weight_total"	TEXT,
	"manufacturer"	TEXT,
	"country_of_origin"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("overall_length") REFERENCES "length"("mrid"),
	FOREIGN KEY("weight_total") REFERENCES "mass"("mrid")
);
CREATE TABLE IF NOT EXISTS "psr_type" (
	"mrid"	TEXT NOT NULL,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "quantity_value" (
	"mrid"	TEXT NOT NULL,
	"unit"	TEXT,
	"value"	TEXT,
	"multiplier"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "ratio" (
	"mrid"	TEXT NOT NULL,
	"denominator"	REAL,
	"numerator"	REAL,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "reactive_power" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "reactor_info" (
	"mrid"	TEXT NOT NULL,
	"rated_voltage"	TEXT,
	"rated_frequency"	TEXT,
	"rated_current"	TEXT,
	"rated_power"	TEXT,
	"insulation_type"	TEXT,
	"inductance"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("inductance") REFERENCES "inductance"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset_info"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("rated_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("rated_frequency") REFERENCES "frequency"("mrid"),
	FOREIGN KEY("rated_power") REFERENCES "reactive_power"("mrid"),
	FOREIGN KEY("rated_voltage") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "reactor_test_type" (
	"mrid"	TEXT NOT NULL,
	"code"	TEXT,
	"name"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "reactor_testing_equipment_test_type" (
	"mrid"	TEXT NOT NULL,
	"testing_equipment_id"	TEXT,
	"test_type_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("test_type_id") REFERENCES "procedure"("mrid"),
	FOREIGN KEY("testing_equipment_id") REFERENCES "testing_equipment"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "reconditioning" (
	"mrid"	TEXT NOT NULL,
	"date_time"	TEXT,
	"asset"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("asset") REFERENCES "asset"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") on delete cascade
);
CREATE TABLE IF NOT EXISTS "reconditioning_cooling_power_rating" (
	"mrid"	TEXT NOT NULL,
	"reconditioning_id"	INTEGER,
	"cooling_power_rating_id"	INTEGER,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("cooling_power_rating_id") REFERENCES "cooling_power_rating"("mrid"),
	FOREIGN KEY("reconditioning_id") REFERENCES "reconditioning"("mrid")
);
CREATE TABLE IF NOT EXISTS "resistance" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	REAL,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "rotating_machine_info" (
	"mrid"	TEXT NOT NULL,
	"star_point"	TEXT,
	"rated_frequency"	TEXT,
	"rated_current"	TEXT,
	"rated_u"	TEXT,
	"rated_speed"	TEXT,
	"rated_power"	TEXT,
	"rated_power_factor"	TEXT,
	"rated_thermal_class"	TEXT,
	"rated_ifd"	TEXT,
	"rated_ufd"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset_info"("mrid") on delete cascade,
	FOREIGN KEY("rated_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("rated_frequency") REFERENCES "frequency"("mrid"),
	FOREIGN KEY("rated_ifd") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("rated_power") REFERENCES "apparent_power"("mrid"),
	FOREIGN KEY("rated_u") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("rated_ufd") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "rotating_machine_test_type" (
	"mrid"	TEXT NOT NULL,
	"code"	TEXT,
	"name"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "rotating_machine_testing_equipment_test_type" (
	"mrid"	TEXT NOT NULL,
	"testing_equipment_id"	TEXT,
	"test_type_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("test_type_id") REFERENCES "procedure"("mrid"),
	FOREIGN KEY("testing_equipment_id") REFERENCES "testing_equipment"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "seconds" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "sheath_voltage_limiter" (
	"mrid"	TEXT NOT NULL,
	"rated_voltage_ur"	TEXT,
	"max_continuous_operating_voltage"	TEXT,
	"nominal_discharge_current"	TEXT,
	"high_current_impulse_withstand"	TEXT,
	"long_duration_current_impulse_withstand"	TEXT,
	"short_circuit_withstand"	TEXT,
	"cable_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("cable_info_id") REFERENCES "cable_info"("mrid"),
	FOREIGN KEY("high_current_impulse_withstand") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("long_duration_current_impulse_withstand") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("max_continuous_operating_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("nominal_discharge_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("rated_voltage_ur") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("short_circuit_withstand") REFERENCES "current_flow"("mrid")
);
CREATE TABLE IF NOT EXISTS "short_circuit_rating" (
	"mrid"	TEXT NOT NULL,
	"power_transformer_info_id"	TEXT,
	"short_circuit_current"	TEXT,
	"duration_seconds"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("duration_seconds") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("power_transformer_info_id") REFERENCES "power_transformer_info"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("short_circuit_current") REFERENCES "current_flow"("mrid")
);
CREATE TABLE IF NOT EXISTS "short_circuit_test" (
	"mrid"	TEXT NOT NULL,
	"current"	TEXT,
	"energised_end_step"	INTEGER,
	"grounded_end_step"	INTEGER,
	"leakage_impedance"	TEXT,
	"leakage_impedance_zero"	TEXT,
	"loss"	TEXT,
	"loss_zero"	TEXT,
	"power"	TEXT,
	"voltage"	TEXT,
	"energised_end"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("energised_end") REFERENCES "transformer_end_info"("mrid"),
	FOREIGN KEY("leakage_impedance") REFERENCES "impedance"("mrid"),
	FOREIGN KEY("leakage_impedance_zero") REFERENCES "impedance"("mrid"),
	FOREIGN KEY("loss") REFERENCES "active_power"("mrid"),
	FOREIGN KEY("loss_zero") REFERENCES "kilo_active_power"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "transformer_test"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("power") REFERENCES "apparent_power"("mrid"),
	FOREIGN KEY("voltage") REFERENCES "percent"("mrid")
);
CREATE TABLE IF NOT EXISTS "short_circuit_test_transformer_end_info" (
	"mrid"	TEXT NOT NULL,
	"short_circuit_test_id"	TEXT,
	"transformer_end_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("short_circuit_test_id") REFERENCES "short_circuit_test"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("transformer_end_info_id") REFERENCES "transformer_end_info"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "state_variable" (
	"mrid"	TEXT NOT NULL,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "status" (
	"mrid"	TEXT NOT NULL,
	"date_time"	TEXT,
	"reason"	TEXT,
	"remark"	TEXT,
	"value"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "street_address" (
	"mrid"	TEXT NOT NULL,
	"language"	TEXT,
	"po_box"	TEXT,
	"postal_code"	TEXT,
	"status"	TEXT,
	"street_detail"	TEXT,
	"town_detail"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "street_detail" (
	"mrid"	TEXT NOT NULL,
	"address_general"	TEXT,
	"building_name"	TEXT,
	"code"	TEXT,
	"floor_identification"	TEXT,
	"number"	TEXT,
	"prefix"	TEXT,
	"suffix"	TEXT,
	"suite_number"	TEXT,
	"type"	TEXT,
	"within_town_limits"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "string_measurement" (
	"mrid"	TEXT NOT NULL,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "measurement"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "string_measurement_value" (
	"mrid"	TEXT NOT NULL,
	"value"	TEXT,
	"string_measurement"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "measurement_value"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("string_measurement") REFERENCES "string_measurement"("mrid")
);
CREATE TABLE IF NOT EXISTS "substation" (
	"mrid"	TEXT NOT NULL,
	"generation"	TEXT,
	"industry"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "equipment_container"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "surge_arrester" (
	"mrid"	TEXT NOT NULL,
	"unit_count"	INTEGER,
	"manufacturer_type"	TEXT,
	"asset_system_code"	TEXT,
	"asset_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("asset_id") REFERENCES "asset"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "surge_arrester_info" (
	"mrid"	TEXT NOT NULL,
	"continuous_operating_voltage"	TEXT,
	"is_polymer"	TEXT,
	"lightning_impulse_discharge_voltage"	TEXT,
	"line_discharge_class"	INTEGER,
	"nominal_discharge_current"	TEXT,
	"pressure_relief_class"	TEXT,
	"rated_voltage"	TEXT,
	"steep_front_discharge_voltage"	TEXT,
	"switching_impulse_discharge_voltage"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("continuous_operating_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("lightning_impulse_discharge_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset_info"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("nominal_discharge_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("pressure_relief_class") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("rated_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("steep_front_discharge_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("switching_impulse_discharge_voltage") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "surge_arrester_test_dataset" (
	"mrid"	TEXT NOT NULL,
	"assessment"	TEXT,
	"condition_indicator"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "test_dataset"("mrid")
);
CREATE TABLE IF NOT EXISTS "surge_arrester_test_type" (
	"mrid"	TEXT NOT NULL,
	"code"	TEXT,
	"name"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "surge_arrester_testing_equipment_test_type" (
	"mrid"	TEXT NOT NULL,
	"testing_equipment_id"	TEXT,
	"test_type_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("test_type_id") REFERENCES "procedure"("mrid"),
	FOREIGN KEY("testing_equipment_id") REFERENCES "testing_equipment"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "surge_arrester_work_task" (
	"mrid"	TEXT NOT NULL,
	"test_type_surge_arrester_id"	TEXT,
	"test_standard_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "work_task"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("test_standard_id") REFERENCES "test_standard"("mrid"),
	FOREIGN KEY("test_type_surge_arrester_id") REFERENCES "surge_arrester_test_type"("mrid")
);
CREATE TABLE IF NOT EXISTS "sv_tap_step" (
	"mrid"	TEXT NOT NULL,
	"position"	REAL,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "state_variable"("mrid")
);
CREATE TABLE IF NOT EXISTS "switch_info" (
	"mrid"	TEXT NOT NULL,
	"breaking_capacity"	TEXT,
	"gas_weight_per_tank"	TEXT,
	"is_single_phase"	TEXT,
	"is_unganged"	TEXT,
	"low_pressure_alarm"	TEXT,
	"low_pressure_lock_out"	TEXT,
	"oil_volume_per_tank"	TEXT,
	"rated_current"	TEXT,
	"rated_frequency"	TEXT,
	"rated_impulse_withstand_voltage"	TEXT,
	"rated_interrupting_time"	TEXT,
	"rated_voltage"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("breaking_capacity") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("gas_weight_per_tank") REFERENCES "mass"("mrid"),
	FOREIGN KEY("low_pressure_alarm") REFERENCES "pressure"("mrid"),
	FOREIGN KEY("low_pressure_lock_out") REFERENCES "pressure"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset_info"("mrid") on delete cascade,
	FOREIGN KEY("oil_volume_per_tank") REFERENCES "volume"("mrid"),
	FOREIGN KEY("rated_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("rated_frequency") REFERENCES "frequency"("mrid"),
	FOREIGN KEY("rated_impulse_withstand_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("rated_interrupting_time") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("rated_voltage") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "tap_changer_info" (
	"mrid"	TEXT NOT NULL,
	"bil"	TEXT,
	"ct_rating"	TEXT,
	"ct_ratio"	REAL,
	"frequency"	TEXT,
	"high_step"	INTEGER,
	"is_tcul"	TEXT,
	"low_step"	INTEGER,
	"neutral_step"	TEXT,
	"pt_ratio"	REAL,
	"rated_apparent_power"	TEXT,
	"rated_current"	TEXT,
	"rated_voltage"	TEXT,
	"step_phase_increment"	TEXT,
	"step_voltage_increment"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("bil") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("ct_rating") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("frequency") REFERENCES "frequency"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset_info"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("neutral_step") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("rated_apparent_power") REFERENCES "apparent_power"("mrid"),
	FOREIGN KEY("rated_current") REFERENCES "current_flow"("mrid"),
	FOREIGN KEY("rated_voltage") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("step_phase_increment") REFERENCES "angle_degrees"("mrid"),
	FOREIGN KEY("step_voltage_increment") REFERENCES "percent"("mrid")
);
CREATE TABLE IF NOT EXISTS "tap_changer_table_point" (
	"mrid"	TEXT NOT NULL,
	"step"	TEXT,
	"voltage"	TEXT,
	"tap_changer_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("tap_changer_info_id") REFERENCES "tap_changer_info"("mrid"),
	FOREIGN KEY("voltage") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "tappi_standard" (
	"mrid"	TEXT NOT NULL,
	"standard_edition"	TEXT,
	"standard_number"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "telephone_number" (
	"mrid"	TEXT NOT NULL,
	"area_code"	TEXT,
	"city_code"	TEXT,
	"country_code"	TEXT,
	"dial_out"	TEXT,
	"extension"	TEXT,
	"international_prefix"	TEXT,
	"itu_phone"	TEXT,
	"local_number"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "temperature" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "template" (
	"name"	TEXT NOT NULL UNIQUE,
	"path"	TEXT,
	"variable"	TEXT
);
CREATE TABLE IF NOT EXISTS "terminal_cable_info" (
	"mrid"	TEXT NOT NULL,
	"rated_u"	TEXT,
	"bil"	TEXT,
	"bsl"	TEXT,
	"type"	TEXT,
	"connector_type"	TEXT,
	"service_condition"	TEXT,
	"cable_info_id"	TEXT,
	"class"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("bil") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("bsl") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("cable_info_id") REFERENCES "cable_info"("mrid"),
	FOREIGN KEY("rated_u") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "test_dataset" (
	"mrid"	TEXT NOT NULL,
	"conclusion"	TEXT,
	"specimen_id"	TEXT,
	"specimen_to_lab_date_time"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "procedure_dataset"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "test_standard" (
	"mrid"	TEXT NOT NULL,
	"test_method"	TEXT,
	"test_standard_astm"	TEXT,
	"test_standard_cigre"	TEXT,
	"test_standard_din"	TEXT,
	"test_standard_doble"	TEXT,
	"test_standard_epa"	TEXT,
	"test_standard_iec"	TEXT,
	"test_standard_ieee"	TEXT,
	"test_standard_iso"	TEXT,
	"test_standard_laborelec"	TEXT,
	"test_standard_tappi"	TEXT,
	"test_standard_ukministry_of_defence"	TEXT,
	"test_standard_wep"	TEXT,
	"test_variant"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("test_standard_astm") REFERENCES "astm_standard"("mrid"),
	FOREIGN KEY("test_standard_cigre") REFERENCES "cigre_standard"("mrid"),
	FOREIGN KEY("test_standard_din") REFERENCES "din_standard"("mrid"),
	FOREIGN KEY("test_standard_doble") REFERENCES "doble_standard"("mrid"),
	FOREIGN KEY("test_standard_epa") REFERENCES "epa_standard"("mrid"),
	FOREIGN KEY("test_standard_iec") REFERENCES "iec_standard"("mrid"),
	FOREIGN KEY("test_standard_ieee") REFERENCES "ieee_standard"("mrid"),
	FOREIGN KEY("test_standard_iso") REFERENCES "iso_standard"("mrid"),
	FOREIGN KEY("test_standard_laborelec") REFERENCES "laborelec_standard"("mrid"),
	FOREIGN KEY("test_standard_tappi") REFERENCES "tappi_standard"("mrid"),
	FOREIGN KEY("test_standard_ukministry_of_defence") REFERENCES "ukministry_of_defence_standard"("mrid"),
	FOREIGN KEY("test_standard_wep") REFERENCES "wep_standard"("mrid")
);
CREATE TABLE IF NOT EXISTS "testing_condition" (
	"condition"	TEXT,
	"equipment"	TEXT,
	"comment"	TEXT,
	"id"	TEXT NOT NULL,
	"id_foreign"	TEXT,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "testing_equipment" (
	"mrid"	TEXT NOT NULL,
	"model"	TEXT,
	"serial_number"	TEXT,
	"work_id"	TEXT,
	"calibration_date"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("work_id") REFERENCES "work"("mrid")
);
CREATE TABLE IF NOT EXISTS "town_detail" (
	"mrid"	TEXT NOT NULL,
	"code"	TEXT,
	"country"	TEXT,
	"section"	TEXT,
	"state_or_province"	TEXT,
	"ward_or_commune"	TEXT,
	"city"	TEXT,
	"district_or_town"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "transformer_end" (
	"mrid"	TEXT NOT NULL,
	"bmag_sat"	TEXT,
	"end_number"	INTEGER,
	"grounded"	TEXT,
	"mag_base_u"	TEXT,
	"mag_sat_flux"	TEXT,
	"rground"	TEXT,
	"xground"	TEXT,
	"phase_tap_changer"	TEXT,
	"base_voltage"	TEXT,
	"terminal"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("base_voltage") REFERENCES "base_voltage"("mrid"),
	FOREIGN KEY("bmag_sat") REFERENCES "percent"("mrid"),
	FOREIGN KEY("mag_base_u") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("mag_sat_flux") REFERENCES "percent"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("rground") REFERENCES "resistance"("mrid")
);
CREATE TABLE IF NOT EXISTS "transformer_end_info" (
	"mrid"	TEXT NOT NULL,
	"connection_kind"	TEXT,
	"emergency_s"	TEXT,
	"end_number"	INTEGER,
	"insulation_u"	TEXT,
	"phase_angle_clock"	INTEGER,
	"r"	TEXT,
	"rated_s"	TEXT,
	"rated_u"	TEXT,
	"short_term_s"	TEXT,
	"transformer_tank_info"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("emergency_s") REFERENCES "apparent_power"("mrid"),
	FOREIGN KEY("insulation_u") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset_info"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("r") REFERENCES "resistance"("mrid"),
	FOREIGN KEY("rated_s") REFERENCES "apparent_power"("mrid"),
	FOREIGN KEY("rated_u") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("short_term_s") REFERENCES "apparent_power"("mrid"),
	FOREIGN KEY("transformer_tank_info") REFERENCES "transformer_tank_info"("mrid")
);
CREATE TABLE IF NOT EXISTS "transformer_observation" (
	"mrid"	TEXT NOT NULL,
	"bushing_temp"	TEXT,
	"dga"	TEXT,
	"freq_resp"	TEXT,
	"furfural_dp"	TEXT,
	"hot_spot_temp"	TEXT,
	"oil_color"	TEXT,
	"oil_dielectric_strength"	TEXT,
	"oil_ift"	TEXT,
	"oil_level"	TEXT,
	"oil_neutralization_number"	TEXT,
	"pump_vibration"	TEXT,
	"status"	TEXT,
	"top_oil_temp"	TEXT,
	"water_content"	TEXT,
	"transformer"	TEXT,
	"reconditioning"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("bushing_temp") REFERENCES "temperature"("mrid"),
	FOREIGN KEY("hot_spot_temp") REFERENCES "temperature"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("oil_dielectric_strength") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("status") REFERENCES "status"("mrid"),
	FOREIGN KEY("top_oil_temp") REFERENCES "temperature"("mrid")
);
CREATE TABLE IF NOT EXISTS "transformer_observation_procedure_dataset" (
	"mrid"	TEXT NOT NULL,
	"transformer_observation_id"	TEXT,
	"procedure_dataset_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("procedure_dataset_id") REFERENCES "procedure_dataset"("mrid"),
	FOREIGN KEY("transformer_observation_id") REFERENCES "transformer_observation"("mrid")
);
CREATE TABLE IF NOT EXISTS "transformer_tank_info" (
	"mrid"	TEXT NOT NULL,
	"power_transformer_info"	TEXT,
	"type"	TEXT,
	"insulation_m"	TEXT,
	"insulation_w"	TEXT,
	"insulation_v"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("insulation_v") REFERENCES "volume"("mrid"),
	FOREIGN KEY("insulation_w") REFERENCES "mass"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset_info"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("power_transformer_info") REFERENCES "power_transformer_info"("mrid")
);
CREATE TABLE IF NOT EXISTS "transformer_test" (
	"mrid"	TEXT NOT NULL,
	"base_power"	TEXT,
	"temperature"	TEXT,
	"base_voltage"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("base_power") REFERENCES "base_power"("mrid"),
	FOREIGN KEY("base_voltage") REFERENCES "base_voltage"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("temperature") REFERENCES "temperature"("mrid")
);
CREATE TABLE IF NOT EXISTS "transformer_testing_equipment_test_type" (
	"mrid"	TEXT NOT NULL,
	"testing_equipment_id"	TEXT,
	"test_type_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("test_type_id") REFERENCES "procedure"("mrid"),
	FOREIGN KEY("testing_equipment_id") REFERENCES "testing_equipment"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "trip_operation" (
	"mrid"	TEXT NOT NULL,
	"auxiliary_contacts_breaker_info_id"	TEXT,
	"parameter_name"	TEXT,
	"t_min"	TEXT,
	"t_max"	TEXT,
	"t_ref"	TEXT,
	"t_dev"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("auxiliary_contacts_breaker_info_id") REFERENCES "auxiliary_contacts_breaker_info"("mrid"),
	FOREIGN KEY("t_dev") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("t_max") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("t_min") REFERENCES "seconds"("mrid"),
	FOREIGN KEY("t_ref") REFERENCES "seconds"("mrid")
);
CREATE TABLE IF NOT EXISTS "ukministry_of_defence_standard" (
	"mrid"	TEXT NOT NULL,
	"standard_edition"	TEXT,
	"standard_number"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "under_voltage_release_breaker_info" (
	"mrid"	TEXT NOT NULL,
	"parameter_name"	TEXT,
	"min"	TEXT,
	"max"	TEXT,
	"ref"	TEXT,
	"dev"	TEXT,
	"assessment_limit_breaker_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("assessment_limit_breaker_info_id") REFERENCES "assessment_limit_breaker_info"("mrid"),
	FOREIGN KEY("dev") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("max") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("min") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("ref") REFERENCES "voltage"("mrid")
);
CREATE TABLE IF NOT EXISTS "user" (
	"user_id"	TEXT NOT NULL,
	"permission"	TEXT,
	"token"	TEXT,
	"role"	TEXT,
	"group_user"	TEXT,
	"username"	TEXT,
	PRIMARY KEY("user_id")
);
CREATE TABLE IF NOT EXISTS "user_identified_object" (
	"mrid"	TEXT NOT NULL,
	"user_id"	TEXT,
	"identified_object_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("identified_object_id") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER NOT NULL,
	"username"	TEXT NOT NULL,
	"password"	TEXT NOT NULL,
	"fullname"	TEXT,
	"gender"	TEXT,
	"email"	TEXT,
	"phonenumber"	TEXT,
	"role"	NUMERIC NOT NULL DEFAULT 0,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "value_alias_set" (
	"mrid"	TEXT NOT NULL,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "value_to_alias" (
	"mrid"	TEXT NOT NULL,
	"value"	INTEGER,
	"value_alias_set"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "identified_object"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("value_alias_set") REFERENCES "value_alias_set"("mrid")
);
CREATE TABLE IF NOT EXISTS "voltage" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	REAL,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "voltage_level" (
	"mrid"	TEXT NOT NULL,
	"high_voltage_limit"	TEXT,
	"low_voltage_limit"	TEXT,
	"base_voltage"	TEXT,
	"substation"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("base_voltage") REFERENCES "base_voltage"("mrid"),
	FOREIGN KEY("high_voltage_limit") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("low_voltage_limit") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "equipment_container"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("substation") REFERENCES "substation"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "voltage_rating" (
	"mrid"	TEXT NOT NULL,
	"rated_u"	TEXT,
	"rated_ln"	TEXT,
	"transformer_end_id"	TEXT,
	"insulation_u"	TEXT,
	"insulation_c"	TEXT,
	"regulation"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("insulation_u") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("rated_ln") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("rated_u") REFERENCES "voltage"("mrid"),
	FOREIGN KEY("transformer_end_id") REFERENCES "transformer_end_info"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "voltage_trans" (
	"id"	TEXT NOT NULL,
	"properties"	TEXT,
	"ratings"	TEXT,
	"config"	TEXT,
	"location_id"	TEXT NOT NULL,
	"extend"	TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY("location_id") REFERENCES "locations"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "voltage_transformer_testing_equipment_test_type" (
	"mrid"	TEXT NOT NULL,
	"testing_equipment_id"	TEXT,
	"test_type_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("test_type_id") REFERENCES "procedure"("mrid"),
	FOREIGN KEY("testing_equipment_id") REFERENCES "testing_equipment"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "volume" (
	"mrid"	TEXT NOT NULL,
	"multiplier"	TEXT,
	"unit"	TEXT,
	"value"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "wep_standard" (
	"mrid"	TEXT NOT NULL,
	"standard_edition"	TEXT,
	"standard_number"	TEXT,
	PRIMARY KEY("mrid")
);
CREATE TABLE IF NOT EXISTS "wire_info" (
	"mrid"	TEXT NOT NULL,
	"core_radius"	TEXT,
	"core_strand_count"	INTEGER,
	"gmr"	TEXT,
	"insulated"	TEXT,
	"insulation_thickness"	TEXT,
	"material"	TEXT,
	"r_ac"	TEXT,
	"radius"	TEXT,
	"rated_current"	TEXT,
	"r_dc"	TEXT,
	"size_description"	TEXT,
	"strand_count"	INTEGER,
	"insulation_material"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("core_radius") REFERENCES "length"("mrid"),
	FOREIGN KEY("gmr") REFERENCES "length"("mrid"),
	FOREIGN KEY("insulation_thickness") REFERENCES "length"("mrid"),
	FOREIGN KEY("mrid") REFERENCES "asset_info"("mrid") on delete cascade,
	FOREIGN KEY("r_ac") REFERENCES "length"("mrid"),
	FOREIGN KEY("radius") REFERENCES "length"("mrid"),
	FOREIGN KEY("rated_current") REFERENCES "current_flow"("mrid")
);
CREATE TABLE IF NOT EXISTS "work" (
	"mrid"	TEXT NOT NULL,
	"request_date_time"	TEXT,
	"work_order_number"	TEXT,
	"erp_project_accounting"	TEXT,
	"project"	TEXT,
	"work_flow_steps"	TEXT,
	"business_case"	TEXT,
	"work_billing_info"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "base_work"("mrid") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "work_task" (
	"mrid"	TEXT NOT NULL,
	"completed_date_time"	TEXT,
	"contractor_cost"	TEXT,
	"crew_eta"	TEXT,
	"instruction"	TEXT,
	"estimated_completion_time"	TEXT,
	"sched_override"	TEXT,
	"started_date_time"	TEXT,
	"task_kind"	TEXT,
	"tool_cost"	TEXT,
	"trouble_order"	TEXT,
	"switching_plan"	TEXT,
	"work"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("mrid") REFERENCES "base_work"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("work") REFERENCES "work"("mrid")
);
CREATE TABLE IF NOT EXISTS "zero_sequence_impedance" (
	"mrid"	TEXT NOT NULL,
	"base_power"	TEXT,
	"base_voltage"	TEXT,
	"power_transformer_info_id"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("base_power") REFERENCES "base_power"("mrid"),
	FOREIGN KEY("base_voltage") REFERENCES "base_voltage"("mrid"),
	FOREIGN KEY("power_transformer_info_id") REFERENCES "power_transformer_info"("mrid")
);
CREATE TABLE IF NOT EXISTS "zero_sequence_impedance_table" (
	"mrid"	TEXT NOT NULL,
	"transformer_end_id"	TEXT,
	"zero"	TEXT,
	"zero_sequence_impedance"	TEXT,
	PRIMARY KEY("mrid"),
	FOREIGN KEY("transformer_end_id") REFERENCES "transformer_end_info"("mrid") ON DELETE CASCADE,
	FOREIGN KEY("zero") REFERENCES "percent"("mrid"),
	FOREIGN KEY("zero_sequence_impedance") REFERENCES "zero_sequence_impedance"("mrid") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_mp_measurement_id" ON "measurement_procedure" (
	"measurement_id"
);
CREATE INDEX IF NOT EXISTS "idx_mp_procedure_id" ON "measurement_procedure" (
	"procedure_id"
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_org_loc_unique" ON "organisation_location" (
	"organisation_id",
	"location_id"
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_org_ps_unique" ON "organisation_person" (
	"organisation_id",
	"person_id"
);
`;