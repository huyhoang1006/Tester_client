import SurgeArresterInfo from "../SurgeArresterInfo";

class OldSurgeArresterInfo extends SurgeArresterInfo {
    constructor() {
        super();
        this.serial_number = null;
        this.maximum_system_voltage = null;
        this.short_time_with_stand_current = null;
        this.rated_duration_of_short_circuit = null;
        this.pf_with_stand_voltage_earth_between_pole = null;
        this.pf_with_stand_voltage_isolated_distance = null;
        this.surge_arrester_id = null;
    }
}

export default OldSurgeArresterInfo;